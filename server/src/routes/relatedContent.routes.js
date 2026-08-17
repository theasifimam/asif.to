import { Router } from "express";
import { getUnifiedRelatedContent } from "../controllers/relatedContent.controller.js";

const router = Router();

router.get("/public", getUnifiedRelatedContent);

export default router;
