import { Router } from "express";
import {
  listIssues,
  createIssue,
  getIssue,
  updateIssueStatus,
} from "../controllers/issueController.js";
import protect from "../middleware/auth.js";
import allow from "../middleware/role.js";

const router = Router();

router.route("/").get(protect, listIssues).post(protect, createIssue);
router.get("/:id", protect, getIssue);
router.patch(
  "/:id/status",
  protect,
  allow("staff", "admin"),
  updateIssueStatus
);

export default router;
