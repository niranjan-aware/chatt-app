import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  acceptFriendRequest,
  declineFriendRequest,
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getNotifications);

router.get("/unread-count", getUnreadCount);

router.put("/mark-read", markAsRead);

router.put("/mark-all-read", markAllAsRead);

router.delete("/:id", deleteNotification);

router.post("/friend-request/:notificationId/accept", acceptFriendRequest);
router.post("/friend-request/:notificationId/decline", declineFriendRequest);

export default router;
