// socket/socket.js
import { Server } from "socket.io";
import http from "http";
import express from "express";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";

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
  socket.on(
    "send-message",
    async ({ to, message, isGroup, activeChatUserId }) => {
      try {
        if (isGroup) {
          // Fetch group data
          const group = await Group.findById(to).lean();
          if (!group) return;

          const sender = await User.findById(userId).select("username").lean();

          // Emit message to all group members via socket room
          io.to(to).emit("receive-message", {
            from: userId,
            message,
            isGroup: true,
          });

          // Create and send notifications to each group member (except sender and activeChatUser)
          await Promise.all(
            group.members
              .filter(
                (memberId) =>
                  memberId.toString() !== userId &&
                  memberId.toString() !== activeChatUserId
              )
              .map(async (memberId) => {
                const notification = new Notification({
                  recipient: memberId,
                  sender: userId,
                  type: "group_message",
                  content: `${sender.username} sent a message in ${group.username}`,
                  relatedId: message._id,
                  metadata: {
                    groupId: group._id,
                    groupName: group.username,
                    messagePreview: message.text
                      ? message.text.substring(0, 50)
                      : "Sent an image",
                    hasImage: !!message.image,
                  },
                });

                await notification.save();

                const receiverSocketId = getReceiverSocketId(
                  memberId.toString()
                );
                if (receiverSocketId) {
                  io.to(receiverSocketId).emit("notification", {
                    _id: notification._id,
                    type: notification.type,
                    content: notification.content,
                    isRead: notification.isRead,
                    relatedId: notification.relatedId,
                    metadata: notification.metadata,
                    sender: {
                      _id: userId,
                      username: sender.username,
                    },
                    createdAt: notification.createdAt,
                  });
                }
              })
          );
        } else {
          // 1-to-1 message handling
          io.to(to).emit("receive-message", {
            from: userId,
            message,
            isGroup: false,
          });

          if (to !== activeChatUserId) {
            const sender = await User.findById(userId)
              .select("username")
              .lean();

            const notification = new Notification({
              recipient: to,
              sender: userId,
              type: "message",
              content: `${sender.username} sent you a message`,
              relatedId: message._id,
              metadata: {
                messagePreview: message.text
                  ? message.text.substring(0, 50)
                  : "Sent an image",
                hasImage: !!message.image,
              },
            });

            await notification.save();

            const receiverSocketId = getReceiverSocketId(to);
            if (receiverSocketId) {
              io.to(receiverSocketId).emit("notification", {
                _id: notification._id,
                type: notification.type,
                content: notification.content,
                isRead: notification.isRead,
                relatedId: notification.relatedId,
                metadata: notification.metadata,
                sender: {
                  _id: userId,
                  username: sender.username,
                },
                createdAt: notification.createdAt,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error handling send-message:", error);
      }
    }
  );

  // Handle friend request acceptance
  socket.on("friend-accept", async ({ to, from }) => {
    try {
      // Get acceptor's username
      const acceptor = await User.findById(from).select("username profilePic");

      // Create notification
      const notification = new Notification({
        recipient: to, // Original requester
        sender: from, // Person who accepted
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
          isRead: notification.isRead,
          sender: {
            _id: from,
            username: acceptor.username,
            profilePic: acceptor.profilePic,
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
