import { Router } from "express";
import {
  getCheatsheets,
  getCheatsheetBySlug,
  createCheatsheet,
  updateCheatsheet,
  deleteCheatsheet,
} from "../controllers/cheatsheet.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Public
router.get("/", getCheatsheets);
router.get("/:slug", getCheatsheetBySlug);

// Admin
router.post("/", protect, authorize("admin", "editor"), createCheatsheet);
router.patch("/:id", protect, authorize("admin", "editor"), updateCheatsheet);
router.delete("/:id", protect, authorize("admin"), deleteCheatsheet);

export default router;
