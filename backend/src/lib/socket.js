import { Server } from "socket.io";
import http from "http";
import express from "express";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`User connected: ${userId} with socket ${socket.id}`);

  if (userId) {
    userSocketMap[userId] = socket.id;
    socket.join(userId); // Join user's personal room
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Join all groups the user is a member of
  socket.on("join-groups", (groupIds) => {
    groupIds.forEach((groupId) => socket.join(groupId));
  });

  // Handle sending messages
  socket.on("send-message", async ({ to, message, isGroup }) => {
    const room = isGroup ? to : to;
    
    io.to(room).emit("receive-message", {
      from: userId,
      message,
      isGroup,
    });

    // Generate notification for direct messages (not group)
    if (!isGroup) {
      try {
        // Get sender's username for notification content
        const sender = await User.findById(userId).select("username");
        
        // Create notification
        const notification = new Notification({
          recipient: to,
          sender: userId,
          type: "message",
          content: `${sender.username} sent you a message`,
          relatedId: message._id,
        });
        
        await notification.save();
        
        // Emit notification to recipient
        const receiverSocketId = getReceiverSocketId(to);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("notification", {
            _id: notification._id,
            type: notification.type,
            content: notification.content,
            sender: {
              _id: userId,
              username: sender.username,
            },
            createdAt: notification.createdAt,
          });
        }
      } catch (error) {
        console.error("Error creating message notification:", error);
      }
    }
  });

  // Handle friend requests
  socket.on("friend-request", async ({ to, from }) => {
    try {
      // Get sender's username
      const sender = await User.findById(from).select("username profilePic");
      
      // Create notification
      const notification = new Notification({
        recipient: to,
        sender: from,
        type: "friend_request",
        content: `${sender.username} sent you a friend request`,
      });
      
      await notification.save();
      
      // Emit notification to recipient
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("notification", {
          _id: notification._id,
          type: notification.type,
          content: notification.content,
          sender: {
            _id: from,
            username: sender.username,
            profilePic: sender.profilePic
          },
          createdAt: notification.createdAt,
        });
      }
    } catch (error) {
      console.error("Error sending friend request notification:", error);
    }
  });

  // Handle friend request acceptance
  socket.on("friend-accept", async ({ to, from }) => {
    try {
      // Get acceptor's username
      const acceptor = await User.findById(from).select("username profilePic");
      
      // Create notification
      const notification = new Notification({
        recipient: to, // Original requester
        sender: from,  // Person who accepted
        type: "friend_accept",
        content: `${acceptor.username} accepted your friend request`,
      });
      
      await notification.save();
      
      // Emit notification to recipient
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("notification", {
          _id: notification._id,
          type: notification.type,
          content: notification.content,
          sender: {
            _id: from,
            username: acceptor.username,
            profilePic: acceptor.profilePic
          },
          createdAt: notification.createdAt,
        });
      }
    } catch (error) {
      console.error("Error sending friend acceptance notification:", error);
    }
  });

  // Handle notification read status
  socket.on("mark-notifications-read", async (notificationIds) => {
    try {
      await Notification.updateMany(
        { _id: { $in: notificationIds } },
        { $set: { isRead: true } }
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId}`);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };