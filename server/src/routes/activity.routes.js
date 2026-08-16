import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { listActivities, listNotifications, markAllNotificationsRead, markNotificationRead, requireActivityAccess } from "../controllers/activity.controller.js";

const router = Router();
router.get("/notifications", protect, listNotifications);
router.patch("/notifications/read-all", protect, markAllNotificationsRead);
router.patch("/notifications/:id/read", protect, markNotificationRead);
router.get("/", protect, requireActivityAccess, listActivities);
export default router;
