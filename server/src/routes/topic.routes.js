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
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = Router();
const canManage = [protect, authorize("admin", "editor")];

router.get("/public/:courseSlug", getPublicTopics);
router.get("/public/:courseSlug/:topicSlug", getPublicTopic);
router.get("/public/:courseSlug/*topicPath", getPublicTopic);
router.get("/", ...canManage, listCourseTopics);
router.get("/:id", ...canManage, getCourseTopicAdmin);
router.post("/", ...canManage, createCourseTopic);
router.patch("/reorder", ...canManage, reorderCourseTopics);
router.patch("/:id/publish", ...canManage, publishCourseTopic);
router.patch("/:id", ...canManage, updateCourseTopic);
router.delete("/:id", ...canManage, deleteCourseTopic);

export default router;
