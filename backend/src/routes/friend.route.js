import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriends,
  searchUsers,
  getFriendRequests,
  removeFriend
} from "../controllers/friend.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/request", protectRoute, sendFriendRequest);
router.post("/accept", protectRoute, acceptFriendRequest);
router.post("/decline", protectRoute, declineFriendRequest);
router.get("/list", protectRoute, getFriends);
router.get("/search", protectRoute, searchUsers);
router.get("/requests", protectRoute, getFriendRequests);
router.post("/remove", protectRoute, removeFriend);


export default router;
