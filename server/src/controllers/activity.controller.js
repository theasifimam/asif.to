import mongoose from "mongoose";
import ActivityLog from "../models/ActivityLog.js";
import Notification from "../models/Notification.js";
import { roleRank } from "../utils/permissions.js";

const pageOptions = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 25));
  return { page, limit, skip: (page - 1) * limit };
};

export const listActivities = async (req, res) => {
  try {
    const { page, limit, skip } = pageOptions(req.query);
    const filter = {};
    if (req.user.role === "editor") filter.actorRole = { $in: ["author", "editor"] };
    ["actorRole", "action", "entityType", "severity"].forEach((key) => { if (req.query[key] && req.query[key] !== "all") filter[key] = req.query[key]; });
    if (req.query.actor && mongoose.isValidObjectId(req.query.actor)) filter.actorId = req.query.actor;
    if (req.query.dateFrom || req.query.dateTo) filter.createdAt = { ...(req.query.dateFrom && { $gte: new Date(req.query.dateFrom) }), ...(req.query.dateTo && { $lte: new Date(`${req.query.dateTo}T23:59:59.999Z`) }) };
    if (req.query.search?.trim()) {
      const value = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [{ description: new RegExp(value, "i") }, { entityTitle: new RegExp(value, "i") }];
    }
    const [activities, total] = await Promise.all([
      ActivityLog.find(filter).populate("actorId", "fullName username avatar role").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ActivityLog.countDocuments(filter),
    ]);
    res.json({ success: true, data: { activities, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } } });
  } catch (error) { res.status(500).json({ success: false, message: "Unable to load activity." }); }
};

export const listNotifications = async (req, res) => {
  const { page, limit, skip } = pageOptions(req.query);
  const filter = { recipientId: req.user._id };
  if (req.query.unread === "true") filter.isRead = false;
  if (["important", "critical"].includes(req.query.severity)) filter.severity = req.query.severity;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).populate({ path: "activityId", populate: { path: "actorId", select: "fullName username avatar role" } }).populate("actorId", "fullName username avatar role").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter), Notification.countDocuments({ recipientId: req.user._id, isRead: false }),
  ]);
  res.json({ success: true, data: { notifications, unreadCount, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } } });
};

export const markNotificationRead = async (req, res) => {
  const result = await Notification.findOneAndUpdate({ _id: req.params.id, recipientId: req.user._id }, { isRead: true, readAt: new Date() }, { new: true });
  if (!result) return res.status(404).json({ success: false, message: "Notification not found." });
  res.json({ success: true, data: result });
};

export const markAllNotificationsRead = async (req, res) => {
  await Notification.updateMany({ recipientId: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
  res.json({ success: true });
};

export const requireActivityAccess = (req, res, next) => {
  if ((roleRank[req.user?.role] ?? 0) < roleRank.editor) return res.status(403).json({ success: false, message: "Activity access is restricted to editorial staff." });
  next();
};
