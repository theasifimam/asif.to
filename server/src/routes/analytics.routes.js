import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";
import * as analytics from "../controllers/analytics.controller.js";
import * as simple from "../controllers/analytics.simple.controller.js";

const router = Router();
router.post("/visit", simple.captureVisit);
router.post("/track", analytics.trackEvent);
router.use(protect, requirePermission("analytics.view"));
router.get("/simple/overview", simple.getSimpleOverview);
router.get("/simple/acquisition", simple.getAcquisition);
router.get("/simple/content", simple.getLocalContent);
router.get("/simple/locations", simple.getLocations);
router.get("/simple/devices", simple.getDevices);
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
