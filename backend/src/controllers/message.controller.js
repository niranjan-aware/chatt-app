import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Group from '../models/group.model.js'

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const user = await User.findById(loggedInUserId).select("friends").lean();

    // Only fetch friends
    const users = await User.find({ _id: { $in: user.friends } }).select("_id type username profilePic");

    // Groups where the logged-in user is a member
    const groups = await Group.find({ members: loggedInUserId }).select("_id type username  groupProfilePic createdBy  members  admins")
    
    const sidebarItems = [];

    // Add users with their last message info
    for (const user of users) {
      const lastMessage = await Message.findOne({
        isGroup: false,
        $or: [
          { senderId: loggedInUserId, receiverId: user._id },
          { senderId: user._id, receiverId: loggedInUserId },
        ]
      }).sort({ createdAt: -1 });

      sidebarItems.push({
        type: user.type,
        _id: user._id,
        username: user.username,
        profilePic: user.profilePic,
        friends:user.friends,
        friendRequests:user.friendRequests,
        lastMessageTime: lastMessage?.createdAt || null,
      });
    }

    // Add groups with their last message info
    for (const group of groups) {
      const lastGroupMessage = await Message.findOne({
        isGroup: true,
        groupId: group._id
      }).sort({ createdAt: -1 });

      sidebarItems.push({
        type: group.type,
        _id: group._id,
        username: group.username,
        groupProfilePic: group.groupProfilePic,
        createdBy:group.createdBy,
        members:group.members,
        admins:group.members,
        lastMessageTime: lastGroupMessage?.createdAt || null,
      });
    }

    // Sort by last message time (latest first)
    sidebarItems.sort((a, b) => {
      const aTime = a.lastMessageTime ? new Date(a.lastMessageTime) : new Date(0);
      const bTime = b.lastMessageTime ? new Date(b.lastMessageTime) : new Date(0);
      return bTime - aTime;
    });

    res.status(200).json(sidebarItems);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const { type } = req.query;
    const myId = req.user._id;
    let messages;
    
    if (type === "group") {
      // Fetch messages where groupId = userToChatId
      messages = await Message.find({ groupId: userToChatId }).sort({ createdAt: 1 });
    } else {
      // Fetch direct messages between users
      messages = await Message.find({
        isGroup: false,
        $or: [
          { senderId: myId, receiverId: userToChatId },
          { senderId: userToChatId, receiverId: myId },
        ],
      }).sort({ createdAt: 1 });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, isGroup } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const senderUserName = req.user.username

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderUserName,
      senderId,
      ...(isGroup ? { groupId: receiverId } : { receiverId }),
      text,
      isGroup,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
