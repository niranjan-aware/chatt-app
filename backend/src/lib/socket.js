import { Server } from "socket.io";
import http from "http";
import express from "express";

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

 
  socket.on("join-groups", (groupIds) => {
    groupIds.forEach((groupId) => socket.join(groupId));
  });


  socket.on("send-message", ({ to, message, isGroup }) => {
    const room = isGroup ? to : to;
    io.to(room).emit("receive-message", {
      from: userId,
      message,
      isGroup,
    });
  });


  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId}`);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});


export { io, app, server };
