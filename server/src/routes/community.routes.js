import { Router } from "express";
import { optionalProtect, protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";
import { communityRateLimit } from "../middlewares/communityRateLimit.middleware.js";
import * as controller from "../controllers/community.controller.js";

const router = Router();

router.get("/posts", controller.listPosts);
router.get("/posts/:slug", optionalProtect, controller.getPost);
router.post("/posts", protect, communityRateLimit("post"), controller.createPost);
router.patch("/posts/:slug", protect, communityRateLimit("post"), controller.updatePost);
router.delete("/posts/:slug", protect, controller.deletePost);
router.post("/posts/:postId/comments", protect, communityRateLimit("comment"), controller.createComment);
router.patch("/comments/:commentId", protect, communityRateLimit("comment"), controller.updateComment);
router.delete("/comments/:commentId", protect, controller.deleteComment);
router.put("/posts/:postId/accepted-solution/:commentId", protect, controller.acceptComment);
router.get("/profiles/:username", optionalProtect, controller.getProfileCommunity);
router.post("/profiles/:username/follow", protect, communityRateLimit("follow"), controller.followUser);
router.delete("/profiles/:username/follow", protect, communityRateLimit("follow"), controller.unfollowUser);
router.post("/reports", protect, communityRateLimit("report"), controller.reportContent);
router.get("/moderation", protect, requirePermission("community.moderate"), controller.moderationQueue);
router.get("/moderation/:targetType/:targetId", protect, requirePermission("community.moderate"), controller.moderationCase);
router.patch("/moderation/:targetType/:targetId", protect, requirePermission("community.moderate"), controller.moderate);
router.patch("/moderation/:targetType/:targetId/reports", protect, requirePermission("community.moderate"), controller.resolveReports);

export default router;
