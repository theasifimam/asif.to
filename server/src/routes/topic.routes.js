import { Router } from "express";
import {
  listCourseTopics,
  getCourseTopicAdmin,
  createCourseTopic,
  updateCourseTopic,
  publishCourseTopic,
  deleteCourseTopic,
  reorderCourseTopics,
  getPublicTopics,
  getPublicTopic,
} from "../controllers/courseTopic.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";
import {
  compressArticleImage,
  uploadArticleImage,
} from "../middlewares/upload.middleware.js";

const router = Router();
const canView = [protect, requirePermission("topics.view")];
const canManage = [protect, requirePermission("topics.manage")];

router.get("/public/:courseSlug", getPublicTopics);
router.get("/public/:courseSlug/:topicSlug", getPublicTopic);
router.get("/public/:courseSlug/*topicPath", getPublicTopic);
router.get("/", ...canView, listCourseTopics);
router.get("/:id", ...canView, getCourseTopicAdmin);
router.post(
  "/",
  ...canManage,
  uploadArticleImage.single("image"),
  compressArticleImage,
  createCourseTopic,
);
router.patch("/reorder", ...canManage, reorderCourseTopics);
router.patch("/:id/publish", ...canManage, publishCourseTopic);
router.patch(
  "/:id",
  ...canManage,
  uploadArticleImage.single("image"),
  compressArticleImage,
  updateCourseTopic,
);
router.delete("/:id", ...canManage, deleteCourseTopic);

export default router;
