import { Router } from "express";
import { chooseFacebookPage, disconnectSocialIntegration, listSocialIntegrations, socialOAuthCallback, startSocialConnection } from "../controllers/socialIntegration.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";

const router = Router();
router.get("/:platform/callback", socialOAuthCallback);
router.use(protect, requirePermission("social_integrations.manage"));
router.get("/", listSocialIntegrations);
router.get("/:platform/connect", startSocialConnection);
router.patch("/facebook/account", chooseFacebookPage);
router.delete("/:platform", disconnectSocialIntegration);
export default router;
