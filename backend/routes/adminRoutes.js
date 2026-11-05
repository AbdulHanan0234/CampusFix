import { Router } from "express";
import { createStaff, listStaff } from "../controllers/adminController.js";
import protect from "../middleware/auth.js";
import allow from "../middleware/role.js";

// everything under /api/admin requires a logged-in ADMIN
const router = Router();

router.post("/staff", protect, allow("admin"), createStaff);
router.get("/staff", protect, allow("admin"), listStaff);

export default router;
