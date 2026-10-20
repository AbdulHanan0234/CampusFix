import { Router } from "express";
import { signup, login, me, logout } from "../controllers/authController.js";
import protect from "../middleware/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, me); // protect = requires a valid token
router.post("/logout", protect, logout); // invalidates the token server-side

export default router;
