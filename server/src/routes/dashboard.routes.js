import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Dashboard stats are protected and should only be available for roles that access the admin area
router.get("/stats", protect, authorize("admin", "editor", "author"), getDashboardStats);

export default router;