import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";
import * as kanban from "../controllers/kanban.controller.js";

const router = Router();
router.use(protect);

router.get("/boards", requirePermission("planner.view"), kanban.getBoards);
router.post("/boards", requirePermission("planner.manage"), kanban.createBoard);
router.patch("/boards/:id", requirePermission("planner.manage"), kanban.updateBoard);
router.delete("/boards/:id", requirePermission("planner.manage"), kanban.deleteBoard);
router.get("/boards/:id", requirePermission("planner.view"), kanban.getBoard);
router.post("/boards/:id/columns", requirePermission("planner.manage"), kanban.createColumn);
router.patch("/boards/:id/columns/reorder", requirePermission("planner.manage"), kanban.reorderColumns);
router.post("/boards/:id/labels", requirePermission("planner.manage"), kanban.createLabel);
router.post("/boards/:id/cards", requirePermission("planner.manage"), kanban.createCard);
router.patch("/boards/:id/cards/reorder", requirePermission("planner.manage"), kanban.reorderCards);
router.patch("/columns/:id", requirePermission("planner.manage"), kanban.updateColumn);
router.delete("/columns/:id", requirePermission("planner.manage"), kanban.archiveColumn);
router.patch("/cards/:id", requirePermission("planner.manage"), kanban.updateCard);
router.post("/cards/:id/duplicate", requirePermission("planner.manage"), kanban.duplicateCard);
router.delete("/cards/:id", requirePermission("planner.manage"), kanban.deleteCard);

export default router;
