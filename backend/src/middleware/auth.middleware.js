import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';


export const protectRoute = async(req, res, next)=>{
    try {
        const token = req.cookies.jwt;

        if(!token){
            return res.status(400).json({success:false, message:"Unauthorized user"});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if(!decoded){
            return res.status(400).json({success:false, message:"Unauthorized user"});
        }

        const user = await User.findById(decoded.id);

        if(!user){
            return res.status(400).json({success:false, message:"User not found"});
        }
        req.user = {
            id:user._id,
            username:user.username,
            email:user.email
        }
        next();

    } catch (error) {
        console.error("Error in auth middleware", error.message);
        res.status(500).json({success:false,message:"Error in auth middleware"});
    }
}