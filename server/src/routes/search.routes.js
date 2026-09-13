import { Router } from "express";
import { getSearchIndex, getAdminSearchIndex } from "../controllers/search.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = Router();
router.get("/index", getSearchIndex);
router.get("/admin/index", protect, authorize("author", "editor", "admin", "super_admin"), getAdminSearchIndex);
export default router;
