import { Router } from "express";
import {
  getAllPages,
  getPageBySlug,
  updatePage } from
"../controllers/page.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";

const router = Router();

// Public routes
router.get("/", getAllPages);
router.get("/:slug", getPageBySlug);

// Admin routes
router.patch("/:slug", protect, requirePermission("settings.manage"), updatePage);

export default router;
