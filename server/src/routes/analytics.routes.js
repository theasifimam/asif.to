import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";
import * as analytics from "../controllers/analytics.controller.js";

const router = Router();
router.post("/track", analytics.trackEvent);
router.use(protect, requirePermission("analytics.view"));
router.get("/overview", analytics.getOverview);
router.get("/search/:type", analytics.getSearchReport);
router.get("/content", analytics.getContentInsights);
router.get("/sources", analytics.getTrafficSources);
router.get("/page", analytics.getPageDetails);
router.post("/sync", analytics.startSync);
router.get("/platform", analytics.getPlatform);
router.get("/ga4", analytics.getGa4);
router.get("/ga4/realtime", analytics.getRealtime);

export default router;
