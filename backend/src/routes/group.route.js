import express from "express";
import {
  createGroup,
  addMember,
  removeMember
} from "../controllers/group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.post("/add-member", protectRoute, addMember);
router.post("/remove-member", protectRoute, removeMember);

export default router;
