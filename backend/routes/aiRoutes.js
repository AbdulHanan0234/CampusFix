import { Router } from "express";
import { organize } from "../controllers/aiController.js";
import protect from "../middleware/auth.js";

const router = Router();

router.post("/organize", protect, organize);

export default router;
