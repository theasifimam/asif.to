import { Router } from "express";
import { getSearchIndex } from "../controllers/search.controller.js";

const router = Router();
router.get("/index", getSearchIndex);
export default router;
