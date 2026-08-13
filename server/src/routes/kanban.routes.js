import { Router } from "express";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import * as kanban from "../controllers/kanban.controller.js";

const router = Router();
router.use(protect, authorize("admin", "editor"));

router.get("/boards", kanban.getBoards);
router.post("/boards", kanban.createBoard);
router.patch("/boards/:id", kanban.updateBoard);
router.delete("/boards/:id", authorize("admin"), kanban.deleteBoard);
router.get("/boards/:id", kanban.getBoard);
router.post("/boards/:id/columns", kanban.createColumn);
router.patch("/boards/:id/columns/reorder", kanban.reorderColumns);
router.post("/boards/:id/labels", kanban.createLabel);
router.post("/boards/:id/cards", kanban.createCard);
router.patch("/boards/:id/cards/reorder", kanban.reorderCards);
router.patch("/columns/:id", kanban.updateColumn);
router.delete("/columns/:id", kanban.archiveColumn);
router.patch("/cards/:id", kanban.updateCard);
router.post("/cards/:id/duplicate", kanban.duplicateCard);
router.delete("/cards/:id", authorize("admin"), kanban.deleteCard);

export default router;
