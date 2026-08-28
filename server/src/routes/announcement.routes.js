import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";
import {
  getAnnouncement,
  getPublicAnnouncement,
  saveAnnouncement,
} from "../controllers/announcement.controller.js";

const router = Router();

router.get("/public", getPublicAnnouncement);
router.get("/", protect, requirePermission("settings.manage"), getAnnouncement);
router.put("/", protect, requirePermission("settings.manage"), saveAnnouncement);

export default router;
