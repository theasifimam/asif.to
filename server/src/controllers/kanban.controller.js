import KanbanBoard from "../models/KanbanBoard.js";
import KanbanColumn from "../models/KanbanColumn.js";
import KanbanCard from "../models/KanbanCard.js";
import KanbanLabel from "../models/KanbanLabel.js";

const DEFAULT_COLUMNS = [
  ["Ideas", "#8b5cf6"], ["Backlog", "#64748b"], ["Planned", "#3b82f6"],
  ["In Progress", "#f59e0b"], ["Review", "#ec4899"],
  ["Ready to Publish", "#14b8a6"], ["Done", "#22c55e"],
];

const sendError = (res, error, fallback = "Unable to complete request") => {
  console.error("[KANBAN]", error);
  if (error?.name === "ValidationError") return res.status(400).json({ success: false, message: error.message });
  return res.status(500).json({ success: false, message: fallback });
};

async function seedDefaultBoards(userId) {
  const names = ["Content", "Development", "SEO"];
  const boards = await KanbanBoard.create(names.map((name, order) => ({ name, order, createdBy: userId })));
  await KanbanColumn.insertMany(boards.flatMap((board) => DEFAULT_COLUMNS.map(([name, color], order) => ({ board: board._id, name, color, order }))));
  return boards;
}

export const getBoards = async (req, res) => {
  try {
    let boards = await KanbanBoard.find({ archived: false }).sort({ order: 1 }).lean();
    if (!boards.length) {
      await seedDefaultBoards(req.user._id);
      boards = await KanbanBoard.find({ archived: false }).sort({ order: 1 }).lean();
    }
    res.json({ success: true, data: boards });
  } catch (error) { sendError(res, error, "Unable to load boards"); }
};

export const getBoard = async (req, res) => {
  try {
    const board = await KanbanBoard.findOne({ _id: req.params.id, archived: false }).lean();
    if (!board) return res.status(404).json({ success: false, message: "Board not found" });
    const [columns, cards, labels, archivedColumns] = await Promise.all([
      KanbanColumn.find({ board: board._id, archived: false }).sort({ order: 1 }).lean(),
      KanbanCard.find({ board: board._id, archived: false })
        .sort({ column: 1, order: 1 })
        .populate("labels", "name color")
        .populate("parentCourse", "title slug")
        .lean(),
      KanbanLabel.find({ board: board._id }).sort({ name: 1 }).lean(),
      KanbanColumn.find({ board: board._id, archived: true }).sort({ order: 1 }).lean(),
    ]);
    res.json({ success: true, data: { board, columns, cards, labels, archivedColumns } });
  } catch (error) { sendError(res, error, "Unable to load board"); }
};

export const createBoard = async (req, res) => {
  try {
    if (!req.body.name?.trim()) return res.status(400).json({ success: false, message: "Board name is required" });
    const order = await KanbanBoard.countDocuments({ archived: false });
    const board = await KanbanBoard.create({ name: req.body.name, description: req.body.description || "", color: req.body.color || "#2563eb", order, createdBy: req.user._id });
    await KanbanColumn.insertMany(DEFAULT_COLUMNS.map(([name, color], columnOrder) => ({ board: board._id, name, color, order: columnOrder })));
    res.status(201).json({ success: true, data: board });
  } catch (error) { sendError(res, error, "Unable to create board"); }
};

export const updateBoard = async (req, res) => {
  try {
    const allowed = ["name", "description", "color", "order", "archived"];
    const updates = Object.fromEntries(allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
    const board = await KanbanBoard.findByIdAndUpdate(req.params.id, updates, { returnDocument: 'after', runValidators: true });
    if (!board) return res.status(404).json({ success: false, message: "Board not found" });
    res.json({ success: true, data: board });
  } catch (error) { sendError(res, error, "Unable to update board"); }
};

export const deleteBoard = async (req, res) => {
  try {
    const board = await KanbanBoard.findByIdAndDelete(req.params.id);
    if (!board) return res.status(404).json({ success: false, message: "Board not found" });
    await Promise.all([KanbanColumn.deleteMany({ board: board._id }), KanbanCard.deleteMany({ board: board._id }), KanbanLabel.deleteMany({ board: board._id })]);
    res.json({ success: true });
  } catch (error) { sendError(res, error, "Unable to delete board"); }
};

export const createColumn = async (req, res) => {
  try {
    if (!req.body.name?.trim()) return res.status(400).json({ success: false, message: "Column name is required" });
    const order = await KanbanColumn.countDocuments({ board: req.params.id, archived: false });
    const column = await KanbanColumn.create({ board: req.params.id, name: req.body.name, color: req.body.color || "#64748b", order });
    res.status(201).json({ success: true, data: column });
  } catch (error) { sendError(res, error, "Unable to create column"); }
};

export const updateColumn = async (req, res) => {
  try {
    const allowed = ["name", "color", "order", "archived"];
    const updates = Object.fromEntries(allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
    const column = await KanbanColumn.findByIdAndUpdate(req.params.id, updates, { returnDocument: 'after', runValidators: true });
    if (!column) return res.status(404).json({ success: false, message: "Column not found" });
    res.json({ success: true, data: column });
  } catch (error) { sendError(res, error, "Unable to update column"); }
};

export const archiveColumn = async (req, res) => {
  try {
    const column = await KanbanColumn.findById(req.params.id);
    if (!column) return res.status(404).json({ success: false, message: "Column not found" });
    const destination = await KanbanColumn.findOne({ board: column.board, archived: false, _id: { $ne: column._id } }).sort({ order: 1 });
    if (!destination) return res.status(400).json({ success: false, message: "A board must keep at least one column" });
    await KanbanCard.updateMany({ column: column._id, archived: false }, { column: destination._id });
    column.archived = true;
    await column.save();
    res.json({ success: true });
  } catch (error) { sendError(res, error, "Unable to archive column"); }
};

export const reorderColumns = async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    await KanbanColumn.bulkWrite(items.map((item, order) => ({ updateOne: { filter: { _id: item.id, board: req.params.id }, update: { $set: { order } } } })));
    res.json({ success: true });
  } catch (error) { sendError(res, error, "Unable to reorder columns"); }
};

export const createLabel = async (req, res) => {
  try {
    if (!req.body.name?.trim()) return res.status(400).json({ success: false, message: "Label name is required" });
    const label = await KanbanLabel.create({ board: req.params.id, name: req.body.name.trim(), color: req.body.color || "#2563eb" });
    res.status(201).json({ success: true, data: label });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "That label already exists" });
    sendError(res, error, "Unable to create label");
  }
};

export const createCard = async (req, res) => {
  try {
    if (!req.body.title?.trim()) return res.status(400).json({ success: false, message: "Card title is required" });
    const column = await KanbanColumn.findOne({ _id: req.body.column, board: req.params.id, archived: false });
    if (!column) return res.status(400).json({ success: false, message: "Select a valid column" });
    const order = await KanbanCard.countDocuments({ board: req.params.id, column: column._id, archived: false });
    const card = await KanbanCard.create({ ...req.body, board: req.params.id, column: column._id, order, createdBy: req.user._id, updatedBy: req.user._id, activity: [{ action: "created", detail: "Card created", user: req.user._id }] });
    await card.populate("labels", "name color");
    res.status(201).json({ success: true, data: card });
  } catch (error) { sendError(res, error, "Unable to create card"); }
};

export const updateCard = async (req, res) => {
  try {
    const allowed = ["title", "description", "type", "priority", "labels", "dueDate", "archived", "checklist", "parentCard", "relatedCards", "parentCourse", "seo", "column"];
    const updates = Object.fromEntries(allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
    updates.updatedBy = req.user._id;
    const detail = req.body.activityDetail || "Card details updated";
    const card = await KanbanCard.findByIdAndUpdate(req.params.id, { $set: updates, $push: { activity: { $each: [{ action: "updated", detail, user: req.user._id, at: new Date() }], $slice: -30 } } }, { returnDocument: 'after', runValidators: true })
      .populate("labels", "name color").populate("parentCourse", "title slug");
    if (!card) return res.status(404).json({ success: false, message: "Card not found" });
    res.json({ success: true, data: card });
  } catch (error) { sendError(res, error, "Unable to update card"); }
};

export const reorderCards = async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    await KanbanCard.bulkWrite(items.map((item) => ({ updateOne: { filter: { _id: item.id, board: req.params.id }, update: { $set: { column: item.column, order: item.order, updatedBy: req.user._id } } } })));
    res.json({ success: true });
  } catch (error) { sendError(res, error, "Unable to reorder cards"); }
};

export const duplicateCard = async (req, res) => {
  try {
    const source = await KanbanCard.findById(req.params.id).lean();
    if (!source) return res.status(404).json({ success: false, message: "Card not found" });
    delete source._id; delete source.createdAt; delete source.updatedAt; delete source.__v;
    const order = await KanbanCard.countDocuments({ board: source.board, column: source.column, archived: false });
    const card = await KanbanCard.create({ ...source, title: `${source.title} (copy)`, order, createdBy: req.user._id, updatedBy: req.user._id, activity: [{ action: "duplicated", detail: "Created from another card", user: req.user._id }] });
    await card.populate("labels", "name color");
    res.status(201).json({ success: true, data: card });
  } catch (error) { sendError(res, error, "Unable to duplicate card"); }
};

export const deleteCard = async (req, res) => {
  try {
    const card = await KanbanCard.findByIdAndDelete(req.params.id);
    if (!card) return res.status(404).json({ success: false, message: "Card not found" });
    await Promise.all([
      KanbanCard.updateMany({ parentCard: card._id }, { $unset: { parentCard: "" } }),
      KanbanCard.updateMany({ relatedCards: card._id }, { $pull: { relatedCards: card._id } }),
    ]);
    res.json({ success: true });
  } catch (error) { sendError(res, error, "Unable to delete card"); }
};
