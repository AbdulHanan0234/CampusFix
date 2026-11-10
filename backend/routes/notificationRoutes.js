import { Router } from "express";
import {
  listNotifications,
  unreadCount,
  markRead,
  markAllRead,
  markIssueRead,
} from "../controllers/notificationController.js";
import protect from "../middleware/auth.js";

const router = Router();

router.get("/", protect, listNotifications);
router.get("/unread-count", protect, unreadCount);
router.post("/read-all", protect, markAllRead);
router.post("/read-issue/:issueId", protect, markIssueRead);
router.post("/:id/read", protect, markRead);

export default router;
