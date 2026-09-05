import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";
import {
  getOverview,
  getPerformance,
  getPublicConfig,
  getRecommendations,
  getSettings,
  listPlacements,
  updatePlacement,
  updateSettings,
} from "../controllers/monetization.controller.js";

const router = Router();

router.get("/public", getPublicConfig);
router.use(protect);
router.get("/settings", requirePermission("monetization.view"), getSettings);
router.patch(
  "/settings",
  requirePermission("monetization.manage"),
  updateSettings,
);
router.get(
  "/placements",
  requirePermission("monetization.view"),
  listPlacements,
);
router.patch(
  "/placements/:key",
  requirePermission("monetization.manage"),
  updatePlacement,
);
router.get("/overview", requirePermission("monetization.view"), getOverview);
router.get(
  "/performance",
  requirePermission("monetization.view"),
  getPerformance,
);
router.get(
  "/recommendations",
  requirePermission("monetization.view"),
  getRecommendations,
);

export default router;
