import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import mongoose from "mongoose";
import { io, getReceiverSocketId } from "../lib/socket.js";


export const sendFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;  
    const { toUserId } = req.body.toUserId;

    if (userId.toString() === toUserId) {
      return res.status(400).json({ message: "Cannot add yourself" });
    }

    

    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await User.findById(userId).select("username profilePic");
console.log(toUser, currentUser);

    const alreadyFriend = toUser.friends.some(
      (id) => id.toString() === userId.toString()
    );
    if (alreadyFriend) {
      return res.status(400).json({ message: "Already friends" });
    }

    const alreadyRequested = toUser.friendRequests.find(
      (r) => r.from.toString() === userId.toString() && r.status === "pending"
    );
    if (alreadyRequested) {
      return res.status(400).json({ message: "Request already sent" });
    }

 
    const declined = toUser.friendRequests.find(
      (r) => r.from.toString() === userId.toString() && r.status === "declined"
    );
    if (declined && Date.now() - new Date(declined.declinedAt).getTime() < 3 * 24 * 60 * 60 * 1000) {
      return res.status(400).json({ message: "Wait 3 days before re-requesting" });
    }

    toUser.friendRequests.push({ from: userId });
    await toUser.save();


    const notification = new Notification({
      recipient: toUserId,
      sender: userId,
      type: "friend_request",
      content: `${currentUser.username} sent you a friend request`,
    });

    await notification.save();

    
    const receiverSocketId = getReceiverSocketId(toUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("notification", {
        _id: notification._id,
        type: notification.type,
        content: notification.content,
        isRead: notification.isRead,
        sender: {
          _id: userId,
          username: currentUser.username,
          profilePic: currentUser.profilePic,
        },
        createdAt: notification.createdAt,
      });
    }

    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    console.error("Error in sendFriendRequest:", error);
    res.status(500).json({ message: "Failed to send friend request" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;  
    const { fromUserId } = req.body;

    const user = await User.findById(userId);
    const request = user.friendRequests.find(
      (r) => r.from.toString() === fromUserId && r.status === "pending"
    );
    console.log(user);
    
    
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    
    user.friends.push(fromUserId);
    user.friendRequests = user.friendRequests.filter(
      (r) => r.from.toString() !== fromUserId
    );

    const fromUser = await User.findById(fromUserId);
    fromUser.friends.push(userId);

    await user.save();
    await fromUser.save();

   
    const currentUser = await User.findById(userId).select("username profilePic");

    
    const acceptanceNotification = new Notification({
      recipient: fromUserId,
      sender: userId,
      type: "friend_accept",
      content: `${currentUser.username} accepted your friend request`,
    });

    await acceptanceNotification.save();

    
    const senderSocketId = getReceiverSocketId(fromUserId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("notification", {
        _id: acceptanceNotification._id,
        type: acceptanceNotification.type,
        content: acceptanceNotification.content,
        isRead: acceptanceNotification.isRead,
        sender: {
          _id: userId,
          username: currentUser.username,
          profilePic: currentUser.profilePic,
        },
        createdAt: acceptanceNotification.createdAt,
      });
    }

    res.status(200).json({ 
      message: "Friend request accepted",
      friend: {
        _id: fromUserId,
        username: fromUser.username,
        profilePic: fromUser.profilePic
      }
    });
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error);
    res.status(500).json({ message: "Failed to accept friend request" });
  }
};


export const declineFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;  
    const { fromUserId } = req.body.fromUserId;

    const user = await User.findById(userId);
    const request = user.friendRequests.find((r) => r.from.toString() === fromUserId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "declined";
    request.declinedAt = new Date();

    await user.save();
    
    res.status(200).json({ message: "Friend request declined" });
  } catch (error) {
    console.error("Error in declineFriendRequest:", error);
    res.status(500).json({ message: "Failed to decline friend request" });
  }
};


export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;  
    const user = await User.findById(userId).populate("friends", "username profilePic");
    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getFriends:", error);
    res.status(500).json({ message: "Failed to get friends" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const userId = req.user._id;  
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.find({
      _id: { $ne: userId },
      username: { $regex: query, $options: "i" },
    }).select("_id username profilePic");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in searchUsers:", error);
    res.status(500).json({ message: "Failed to search users" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate({
        path: "friendRequests.from",
        select: "username profilePic"
      });

    const pendingRequests = user.friendRequests
      .filter(r => r.status === "pending")
      .map(r => ({
        _id: r.from._id,
        username: r.from.username,
        profilePic: r.from.profilePic,
        requestedAt: r.createdAt
      }));

    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error("Error in getFriendRequests:", error);
    res.status(500).json({ message: "Failed to get friend requests" });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { friendId } = req.body.friendId;
    
    if (userId === friendId) {
      return res.status(400).json({ message: "Cannot remove yourself" });
    }

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);
    

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    const userHasFriend = user.friends.some(id => id.toString() === friendId);
    const friendHasUser = friend.friends.some(id => id.toString() === userId);

    if (!userHasFriend && !friendHasUser) {
      return res.status(400).json({ message: "User is not in your friend list" });
    }

    user.friends = user.friends.filter(id => id.toString() !== friendId);
    friend.friends = friend.friends.filter(id => id.toString() !== userId);

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error in removeFriend:", error);
    res.status(500).json({ message: "Failed to remove friend" });
  }
};