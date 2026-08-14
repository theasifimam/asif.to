import { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import { getPublicSeoSetting, listSeoSettings, upsertSeoSetting } from "../controllers/seoSetting.controller.js";
const router = Router();
router.get("/public", getPublicSeoSetting);
router.get("/", protect, authorize("admin", "editor"), listSeoSettings);
router.put("/", protect, authorize("admin", "editor"), upsertSeoSetting);
export default router;
