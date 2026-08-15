import { Router } from "express";
import {
  getCheatsheets,
  getCheatsheetBySlug,
  createCheatsheet,
  updateCheatsheet,
  deleteCheatsheet,
} from "../controllers/cheatsheet.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";

const router = Router();

// Public
router.get("/", getCheatsheets);
router.get("/:slug", getCheatsheetBySlug);

// Admin
router.post("/", protect, requirePermission("cheatsheets.manage"), createCheatsheet);
router.patch("/:id", protect, requirePermission("cheatsheets.manage"), updateCheatsheet);
router.delete("/:id", protect, requirePermission("cheatsheets.manage"), deleteCheatsheet);

export default router;
