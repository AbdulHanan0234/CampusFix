import { Router } from "express";
import {
  createStaff,
  listStaff,
  resetStaffPassword,
  deleteStaff,
} from "../controllers/adminController.js";
import protect from "../middleware/auth.js";
import allow from "../middleware/role.js";

// everything under /api/admin requires a logged-in ADMIN
const router = Router();

router.post("/staff", protect, allow("admin"), createStaff);
router.get("/staff", protect, allow("admin"), listStaff);
router.post("/staff/:id/password", protect, allow("admin"), resetStaffPassword);
router.delete("/staff/:id", protect, allow("admin"), deleteStaff);

export default router;
