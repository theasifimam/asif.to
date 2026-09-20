import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";
import { getPublicSiteSetting, getSiteSettings, saveSiteSetting } from "../controllers/siteSetting.controller.js";

const router = Router();
router.get("/public", getPublicSiteSetting);
router.get("/", protect, requirePermission("settings.manage"), getSiteSettings);
router.put("/", protect, requirePermission("settings.manage"), saveSiteSetting);
export default router;
