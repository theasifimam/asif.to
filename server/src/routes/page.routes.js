import { Router } from "express";
import {
  getAllPages,
  getPageBySlug,
  updatePage } from
"../controllers/page.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.get("/", getAllPages);
router.get("/:slug", getPageBySlug);

// Admin routes
router.patch("/:slug", protect, authorize("admin", "editor"), updatePage);

export default router;