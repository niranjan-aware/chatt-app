import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";


export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate("sender", "username profilePic")
      .limit(50);
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error in getNotifications controller:", error.message);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });
    
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error in getUnreadCount controller:", error.message);
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const userId = req.user._id;
    
    await Notification.updateMany(
      { 
        _id: { $in: notificationIds },
        recipient: userId 
      },
      { $set: { isRead: true } }
    );
    
  
    const socketId = getReceiverSocketId(userId);
    if (socketId) {
      io.to(socketId).emit("notifications-marked-read", notificationIds);
    }
    
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error in markAsRead controller:", error.message);
    res.status(500).json({ message: "Failed to mark notifications as read" });
  }
};


export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );
    
    
    const socketId = getReceiverSocketId(userId);
    if (socketId) {
      io.to(socketId).emit("all-notifications-marked-read");
    }
    
    res.status(200).json({ 
      message: "All notifications marked as read",
      count: result.modifiedCount 
    });
  } catch (error) {
    console.error("Error in markAllAsRead controller:", error.message);
    res.status(500).json({ message: "Failed to mark all notifications as read" });
  }
};


export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const notification = await Notification.findOne({ _id: id, recipient: userId });
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    await notification.deleteOne();
    
    
    const socketId = getReceiverSocketId(userId);
    if (socketId) {
      io.to(socketId).emit("notification-deleted", id);
    }
    
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error in deleteNotification controller:", error.message);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};


export const acceptFriendRequest = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    
    
    const notification = await Notification.findOne({ 
      _id: notificationId, 
      recipient: userId,
      type: "friend_request" 
    }).populate("sender");
    
    if (!notification) {
      return res.status(404).json({ message: "Friend request notification not found" });
    }
    
    const senderId = notification.sender._id;
    
    
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { friends: senderId } }
    );
    
    await User.findByIdAndUpdate(
      senderId,
      { $addToSet: { friends: userId } }
    );
    
  
    notification.isRead = true;
    await notification.save();
    
  
    const currentUser = await User.findById(userId).select("username profilePic");
    
  
    const acceptanceNotification = new Notification({
      recipient: senderId,
      sender: userId,
      type: "friend_accept",
      content: `${currentUser.username} accepted your friend request`,
    });
    
    await acceptanceNotification.save();
    
  
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("friend-request-accepted", {
        userId,
        username: currentUser.username,
        profilePic: currentUser.profilePic,
        notification: {
          _id: acceptanceNotification._id,
          type: acceptanceNotification.type,
          content: acceptanceNotification.content,
          sender: {
            _id: userId,
            username: currentUser.username,
            profilePic: currentUser.profilePic
          },
          createdAt: acceptanceNotification.createdAt,
        }
      });
    }
    
    res.status(200).json({ 
      message: "Friend request accepted",
      friend: {
        _id: senderId,
        username: notification.sender.username,
        profilePic: notification.sender.profilePic
      }
    });
  } catch (error) {
    console.error("Error in acceptFriendRequest controller:", error.message);
    res.status(500).json({ message: "Failed to accept friend request" });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    
  
    const notification = await Notification.findOne({ 
      _id: notificationId, 
      recipient: userId,
      type: "friend_request" 
    });
    
    if (!notification) {
      return res.status(404).json({ message: "Friend request notification not found" });
    }
    
  
    await notification.deleteOne();
    
    res.status(200).json({ message: "Friend request declined" });
  } catch (error) {
    console.error("Error in declineFriendRequest controller:", error.message);
    res.status(500).json({ message: "Failed to decline friend request" });
  }
};