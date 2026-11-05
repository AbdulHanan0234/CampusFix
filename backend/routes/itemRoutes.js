import { Router } from "express";
import {
  createItem,
  listItems,
  getItem,
  getItemContact,
  updateItem,
} from "../controllers/itemController.js";
import protect from "../middleware/auth.js";

const router = Router();

router.route("/").get(protect, listItems).post(protect, createItem);
router.get("/:id", protect, getItem);
router.get("/:id/contact", protect, getItemContact);
router.patch("/:id", protect, updateItem);

export default router;
