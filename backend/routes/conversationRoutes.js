import { Router } from "express";
import {
  openConversation,
  listConversations,
  getConversation,
  listMessages,
  sendMessage,
  markConversationRead,
} from "../controllers/conversationController.js";
import protect from "../middleware/auth.js";

const router = Router();

router.route("/").get(protect, listConversations).post(protect, openConversation);
router.get("/:id", protect, getConversation);
router.get("/:id/messages", protect, listMessages);
router.post("/:id/messages", protect, sendMessage);
router.post("/:id/read", protect, markConversationRead);

export default router;
