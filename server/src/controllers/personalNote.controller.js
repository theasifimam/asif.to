import crypto from "crypto";
import mongoose from "mongoose";
import PersonalNote from "../models/PersonalNote.js";

const editableFields = [
  "title",
  "type",
  "content",
  "checklist",
  "color",
  "pinned",
  "archived",
];

const sendError = (res, error, fallback) => {
  console.error("[PERSONAL_NOTES]", error.message);
  if (error?.name === "ValidationError") {
    return res.status(400).json({ success: false, message: error.message });
  }
  return res.status(500).json({ success: false, message: fallback });
};

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeChecklist = (value) =>
  (Array.isArray(value) ? value : []).slice(0, 200).map((item) => ({
    id: String(item?.id || crypto.randomUUID()).slice(0, 100),
    text: String(item?.text || "").slice(0, 1000),
    completed: Boolean(item?.completed),
  }));

const normalizeUpdates = (body = {}) => {
  const updates = Object.fromEntries(
    editableFields
      .filter((field) => body[field] !== undefined)
      .map((field) => [field, body[field]]),
  );
  if (updates.title !== undefined) {
    updates.title = String(updates.title).slice(0, 200);
  }
  if (updates.content !== undefined) {
    updates.content = String(updates.content).slice(0, 50000);
  }
  if (updates.type !== undefined && !["text", "checklist"].includes(updates.type)) {
    updates.type = "text";
  }
  if (updates.checklist !== undefined) {
    updates.checklist = normalizeChecklist(updates.checklist);
  }
  if (
    updates.color !== undefined &&
    !["neutral", "amber", "blue", "emerald", "rose", "violet"].includes(
      updates.color,
    )
  ) {
    updates.color = "neutral";
  }
  if (updates.pinned !== undefined) updates.pinned = Boolean(updates.pinned);
  if (updates.archived !== undefined) updates.archived = Boolean(updates.archived);
  return updates;
};

const noteFilter = (req) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return null;
  return { _id: req.params.id, owner: req.user._id };
};

export const listNotes = async (req, res) => {
  try {
    const filter = {
      owner: req.user._id,
      archived: req.query.archived === "true",
    };
    const search = String(req.query.search || "").trim().slice(0, 100);
    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { title: pattern },
        { content: pattern },
        { "checklist.text": pattern },
      ];
    }
    const notes = await PersonalNote.find(filter)
      .sort({ pinned: -1, updatedAt: -1 })
      .limit(250)
      .lean();
    res.json({ success: true, data: { notes } });
  } catch (error) {
    sendError(res, error, "Unable to load notes.");
  }
};

export const getNote = async (req, res) => {
  try {
    const filter = noteFilter(req);
    if (!filter) return res.status(404).json({ success: false, message: "Note not found." });
    const note = await PersonalNote.findOne(filter).lean();
    if (!note) return res.status(404).json({ success: false, message: "Note not found." });
    res.json({ success: true, data: { note } });
  } catch (error) {
    sendError(res, error, "Unable to load the note.");
  }
};

export const createNote = async (req, res) => {
  try {
    const note = await PersonalNote.create({
      owner: req.user._id,
      ...normalizeUpdates(req.body),
    });
    res.status(201).json({ success: true, data: { note } });
  } catch (error) {
    sendError(res, error, "Unable to create the note.");
  }
};

export const updateNote = async (req, res) => {
  try {
    const filter = noteFilter(req);
    if (!filter) return res.status(404).json({ success: false, message: "Note not found." });
    const note = await PersonalNote.findOneAndUpdate(
      filter,
      { $set: normalizeUpdates(req.body) },
      { returnDocument: "after", runValidators: true },
    );
    if (!note) return res.status(404).json({ success: false, message: "Note not found." });
    res.json({ success: true, data: { note } });
  } catch (error) {
    sendError(res, error, "Unable to save the note.");
  }
};

export const deleteNote = async (req, res) => {
  try {
    const filter = noteFilter(req);
    if (!filter) return res.status(404).json({ success: false, message: "Note not found." });
    const note = await PersonalNote.findOneAndDelete(filter);
    if (!note) return res.status(404).json({ success: false, message: "Note not found." });
    res.json({ success: true });
  } catch (error) {
    sendError(res, error, "Unable to delete the note.");
  }
};
