import express from 'express';
const app = express();
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './src/routes/auth.routes.js'
import {connectDB} from './src/config/db.js' 
import cookieParser from 'cookie-parser';

app.use(cors());
app.use(cookieParser());

dotenv.config(); // Load environment variables from .env file

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded request bodies

const PORT = process.env.PORT || 3000;

app.use('/api/auth',authRoutes);

app.listen(PORT,() =>{
    connectDB();
    console.log(`Server is running on port ${PORT}`);
})