// routes/notification.routes.js
import express from "express";
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  acceptFriendRequest,
  declineFriendRequest
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected and require authentication
router.use(protectRoute);

// Get notifications
router.get("/", getNotifications);

// Get unread notification count
router.get("/unread-count", getUnreadCount);

// Mark specific notifications as read
router.put("/mark-read", markAsRead);

// Mark all notifications as read
router.put("/mark-all-read", markAllAsRead);

// Delete a notification
router.delete("/:id", deleteNotification);

// Friend request actions
router.post("/friend-request/:notificationId/accept", acceptFriendRequest);
router.post("/friend-request/:notificationId/decline", declineFriendRequest);

export default router;