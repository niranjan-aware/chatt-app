// routes/notification.routes.js
import express from "express";
import { 
  getNotifications, 
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from "../controllers/notification.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

// Apply protection to all notification routes
router.use(protectRoute);

// Get all notifications for the logged-in user
router.get("/", getNotifications);

// Get unread notification count
router.get("/unread", getUnreadCount);

// Mark notifications as read
router.put("/mark-read", markAsRead);

// Mark all notifications as read
router.put("/mark-all-read", markAllAsRead);

// Delete a notification
router.delete("/:id", deleteNotification);

export default router;