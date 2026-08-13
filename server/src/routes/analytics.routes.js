import { Router } from "express";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import * as analytics from "../controllers/analytics.controller.js";

const router = Router();
router.post("/track", analytics.trackEvent);
router.use(protect, authorize("admin", "editor"));
router.get("/overview", analytics.getOverview);
router.get("/search/:type", analytics.getSearchReport);
router.get("/content", analytics.getContentInsights);
router.get("/sources", analytics.getTrafficSources);
router.get("/page", analytics.getPageDetails);
router.post("/sync", analytics.startSync);

export default router;
