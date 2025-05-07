import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const mongoURI = process.env.MONGO_URI;

export const connectDB = async()=>{
    try {
        await mongoose.connect(mongoURI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1); // Exit the process with failure
    }
}