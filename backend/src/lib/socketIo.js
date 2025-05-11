import { Server } from "socket.io";
import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:["http://localhost:5173"],
    },
});

export function getReceiverSocketId(userId){
    return userSocketMap[userId];
}

//used to store online users

const userSocketMap = {}; // userId, socketId

io.on("connection",(socket)=>{
    console.log("A user is connected", socket.id);
    const userId = socket.handshake.query.userId;
    console.log(userId);
    
    if(userId){
        socket.userId = userId;
        userSocketMap[userId] = socket.id;
    }
    console.log("Broadcasting online users:", Object.keys(userSocketMap));
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("A user is disconnected", socket.id);
        if (socket.userId) {
            delete userSocketMap[socket.userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
        
    })
});

export {io, app, server};