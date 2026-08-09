import { Router } from "express";
import {
  getTopics,
  createTopic,
  updateTopic,
  deleteTopic } from
"../controllers/topic.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Public list topics
router.get("/", getTopics);

// Admin / Editor only routes
router.post("/", protect, authorize("admin", "editor"), createTopic);
router.patch("/:id", protect, authorize("admin", "editor"), updateTopic);
router.delete("/:id", protect, authorize("admin", "editor"), deleteTopic);

export default router;