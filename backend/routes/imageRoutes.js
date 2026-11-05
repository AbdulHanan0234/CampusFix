import { Router } from "express";
import { uploadImage, getImage } from "../controllers/imageController.js";
import protect from "../middleware/auth.js";

const router = Router();

router.post("/", protect, uploadImage);
router.get("/:id", protect, getImage);

export default router;
