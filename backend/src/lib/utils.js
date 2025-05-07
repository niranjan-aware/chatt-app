import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config();

export const generateToken = (userId, res) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        httpOnly: true,  // Mitigates XSS
        sameSite: "strict",  // Mitigates CSRF
        secure: process.env.NODE_ENV !== "DEVELOPMENT"
    });

    return token;
};
