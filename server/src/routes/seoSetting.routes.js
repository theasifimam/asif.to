import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";
import { getPublicSeoSetting, listSeoSettings, upsertSeoSetting } from "../controllers/seoSetting.controller.js";
const router = Router();
router.get("/public", getPublicSeoSetting);
router.get("/", protect, requirePermission("seo.view"), listSeoSettings);
router.put("/", protect, requirePermission("seo.view"), upsertSeoSetting);
export default router;
