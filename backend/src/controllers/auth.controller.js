import { generateToken } from '../lib/utils.js';
import User from '../models/user.model.js'
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js'

export const signup = async (req, res) => {
    const { email, username, password } = req.body;
    
    if (!email || !username || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        const token = generateToken(newUser._id,res);
        const { _id, username: name, email: savedEmail } = newUser;

        return res.status(201).json({ success: true, user: { _id, name, savedEmail }, token });

    } catch (error) {
        console.error("Signup Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


export const login = async(req,res)=>{
    const {email, password} = req.body;
    
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

       const token = generateToken(user._id, res);
       
       const newUser = {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        createdAt: user.createdAt,
      };
       

        return res.status(201).json({ success: true, user:newUser, token });

    }
    catch (error) {
        console.error("Error in login controller", error.message);
        res.status(500).json({success:false,message:"Error in login controller"});
    }
}

export const logout = (req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0});
        return res.status(201).json({ success: true, message:"Logged out successfully!"});
    } catch (error) {
        console.error("Error in login controller", error.message);
        res.status(500).json({success:false,message:"Error in login controller"});
    }
}

export const updateProfile = async(req, res)=>{
    try {
        const {profilePic, userId} = req.body;
        if(!profilePic){
            return res.status(400).json({success:true, message:"Upload the profile pic"});
        }
        
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        console.log(uploadResponse);
        
        const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true});
        res.status(200).json({success:true,updatedUser});
    } catch (error) {
        console.error("Error in update profile controller", error.message);
        res.status(500).json({success:false,message:"Error in update profile controller"});
    }
}

export const checkAuth = (req, res)=>{
    try {
        return res.status(200).json({success:true, user: req.user});
    } catch (error) {
        console.error("Error in check auth controller", error.message);
        return res.status(500).json({success:false, message:"Error in check auth controller"});
    }
}