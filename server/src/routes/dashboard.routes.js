import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";

const router = Router();

// Dashboard stats are protected and should only be available for roles that access the admin area
router.get("/stats", protect, requirePermission("content.read"), getDashboardStats);

export default router;
