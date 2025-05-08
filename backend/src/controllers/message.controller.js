import User from "../models/user.model.js";
import Message from '../models/message.model.js'
import cloudinary from "../lib/cloudinary.js";

export const getUsersForSideBar = async(req, res)=>{
    try {
        const loggedInUser = req.user._id;
        const users = await User.find({_id:{$ne:loggedInUser}}).select("-password");
        res.status(200).json({success:true, message:"Users List", users});
    } catch (error) {
        console.error("Unable to Fetch user list",error.message);
        return res.status(500).json({success:false, message:"Unable to Fetch user list"});
    }
}

export const getMessages = async(req, res)=>{
    try {
        const {id:userToChatId} = req.params;
        const senderId = req.user._id;
        const messages = await Message.find({
            $or:[
                {senderId:senderId, receiverId:userToChatId},
                {senderId:userToChatId, receiverId:senderId}
            ]
        })
        res.status(200).json({success:true, message:"Messages List", messages});
    } catch (error) {
        console.error("Unable to fetch message",error.message);
        return res.status(500).json({success:false, message:"Unable to fetch message"});
    }
}

export const sendMessage = async(req, res)=>{
    try {
        const {text, image} = req.body;
        const {id:receiverId} = req.params;
        const senderId = res.user._id;
        let imageUrl;
        if(image){
            const uploadResponse = cloudinary.uploader.upload(image);
            imageUrl = (await uploadResponse).secure_url;
        }
        const newMessage = new Message({
            senderId:senderId,
            receiverId:receiverId,
            text,
            image:imageUrl
        });

        await newMessage.save();
        return res.status(200).json({newMessage});
    } catch (error) {
        console.error("Error in saving message",error.message);
        return res.status(500).json({success:false, message:"Error in saving message"});
    }
}