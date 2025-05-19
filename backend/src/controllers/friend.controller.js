import User from "../models/user.model.js";
import mongoose from "mongoose";

// Send friend request
export const sendFriendRequest = async (req, res) => {
  const userId = req.user._id;  
  const { toUserId } = req.body;

  if (userId === toUserId) return res.status(400).json({ message: "Cannot add yourself" });

  const toUser = await User.findById(toUserId);
  if (!toUser) return res.status(404).json({ message: "User not found" });

  const alreadyFriend = toUser.friends.some(
    (id) => id.toString() === userId.toString()
  );
  if (alreadyFriend) return res.status(400).json({ message: "Already friends" });

  const alreadyRequested = toUser.friendRequests.find(
    (r) => r.from.toString() === userId && r.status === "pending"
  );
  if (alreadyRequested) return res.status(400).json({ message: "Request already sent" });

  // Decline cooldown
  const declined = toUser.friendRequests.find(
    (r) => r.from.toString() === userId && r.status === "declined"
  );
  if (declined && Date.now() - new Date(declined.declinedAt).getTime() < 3 * 24 * 60 * 60 * 1000) {
    return res.status(400).json({ message: "Wait 3 days before re-requesting" });
  }

  toUser.friendRequests.push({ from: userId });
  await toUser.save();

  // Emit socket event for real-time notification
  const { io } = await import("../lib/socket.js");
  io.emit("friend-request", { to: toUserId, from: userId });

  res.status(200).json({ message: "Friend request sent" });
};

// Accept request
export const acceptFriendRequest = async (req, res) => {
  const userId = req.user._id;  
  const { fromUserId } = req.body;

  const user = await User.findById(userId);
  const request = user.friendRequests.find((r) => r.from.toString() === fromUserId && r.status === "pending");

  if (!request) return res.status(404).json({ message: "Request not found" });

  user.friends.push(fromUserId);
  user.friendRequests = user.friendRequests.filter((r) => r.from.toString() !== fromUserId);

  const fromUser = await User.findById(fromUserId);
  fromUser.friends.push(userId);

  await user.save();
  await fromUser.save();

  // Emit socket event for acceptance notification
  const { io } = await import("../lib/socket.js");
  io.emit("friend-accept", { to: fromUserId, from: userId });

  res.status(200).json({ message: "Friend request accepted" });
};

// Decline
export const declineFriendRequest = async (req, res) => {
  const  userId  = req.user._id;  
  const { fromUserId } = req.body;

  const user = await User.findById(userId);
  const request = user.friendRequests.find((r) => r.from.toString() === fromUserId);

  if (!request) return res.status(404).json({ message: "Request not found" });

  request.status = "declined";
  request.declinedAt = new Date();

  await user.save();
  res.status(200).json({ message: "Friend request declined" });
};

// Get friends
export const getFriends = async (req, res) => {
  const  userId  = req.user._id;  
  const user = await User.findById(userId).populate("friends", "username profilePic");
  res.status(200).json(user.friends);
};


export const searchUsers = async (req, res) => {
  const  userId  = req.user._id;  
  const { query } = req.query;

  if (!query || query.trim() === "") {
    return res.status(400).json({ message: "Search query is required" });
  }

 const users = await User.find({
  _id: { $ne: userId },
  username: { $regex: query, $options: "i" },
}).select("_id username profilePic");

  res.status(200).json(users);
};


export const getFriendRequests = async (req, res) => {
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
};


export const removeFriend = async (req, res) => {
  const userId = req.user._id.toString();
  const { friendId } = req.body;

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
};
