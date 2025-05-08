import express from 'express';
const app = express();
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './src/routes/auth.routes.js'
import messageRoutes from './src/routes/message.route.js'
import {connectDB} from './src/config/db.js' 
import cookieParser from 'cookie-parser';

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));
app.use(cookieParser());

dotenv.config(); // Load environment variables from .env file

app.use(express.json({ limit: '10mb' })); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Middleware to parse URL-encoded request bodies

const PORT = process.env.PORT || 3000;

app.use('/api/auth',authRoutes);
app.use('/api/message',messageRoutes);

app.listen(PORT,() =>{
    connectDB();
    console.log(`Server is running on port ${PORT}`);
})