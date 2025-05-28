
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


const userSocketMap = {}; 

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`User connected: ${userId} with socket ${socket.id}`);

  if (userId) {
    userSocketMap[userId] = socket.id;
    socket.join(userId); 
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  
  socket.on("join-groups", (groupIds) => {
    groupIds.forEach((groupId) => socket.join(groupId));
  });

  
  socket.on(
    "send-message",
    async ({ to, message, isGroup, activeChatUserId }) => {
      try {
        if (isGroup) {
          
          const group = await Group.findById(to).lean();
          if (!group) return;

          const sender = await User.findById(userId).select("username").lean();

          
          io.to(to).emit("receive-message", {
            from: userId,
            message,
            isGroup: true,
          });

          
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