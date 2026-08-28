import Announcement from "../models/Announcement.js";
import AuditLog from "../models/AuditLog.js";
import { logActivity } from "../services/activity.service.js";

const DEFAULT_ANNOUNCEMENT = Object.freeze({
  key: "site-header",
  enabled: false,
  type: "maintenance",
  title: "",
  message: "",
  details: "",
  linkLabel: "",
  linkUrl: "",
  eventStartsAt: null,
  eventEndsAt: null,
  visibleFrom: null,
  visibleUntil: null,
  dismissible: true,
});

const TYPES = new Set(["info", "maintenance", "warning", "success"]);

function parseOptionalDate(value, label) {
  if (value === undefined || value === null || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const error = new Error(`${label} must be a valid date and time.`);
    error.statusCode = 400;
    throw error;
  }
  return date;
}

function cleanLinkUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const parsed = new URL(url);
    if (["http:", "https:"].includes(parsed.protocol)) return parsed.toString();
  } catch {
    // Return the validation error below.
  }
  const error = new Error("Link URL must be a site path or an HTTP(S) URL.");
  error.statusCode = 400;
  throw error;
}

function normalizedBody(body = {}) {
  const data = {
    enabled: Boolean(body.enabled),
    type: TYPES.has(body.type) ? body.type : "maintenance",
    title: String(body.title || "").trim(),
    message: String(body.message || "").trim(),
    details: String(body.details || "").trim(),
    linkLabel: String(body.linkLabel || "").trim(),
    linkUrl: cleanLinkUrl(body.linkUrl),
    eventStartsAt: parseOptionalDate(body.eventStartsAt, "Maintenance start"),
    eventEndsAt: parseOptionalDate(body.eventEndsAt, "Maintenance end"),
    visibleFrom: parseOptionalDate(body.visibleFrom, "Display start"),
    visibleUntil: parseOptionalDate(body.visibleUntil, "Display end"),
    dismissible: body.dismissible !== false,
  };

  if (data.enabled && !data.title && !data.message) {
    const error = new Error("Add a title or message before publishing the announcement.");
    error.statusCode = 400;
    throw error;
  }
  if (data.eventStartsAt && data.eventEndsAt && data.eventEndsAt <= data.eventStartsAt) {
    const error = new Error("Maintenance end must be after its start time.");
    error.statusCode = 400;
    throw error;
  }
  if (data.visibleFrom && data.visibleUntil && data.visibleUntil <= data.visibleFrom) {
    const error = new Error("Display end must be after its start time.");
    error.statusCode = 400;
    throw error;
  }
  if (data.linkUrl && !data.linkLabel) data.linkLabel = "Learn more";
  if (!data.linkUrl) data.linkLabel = "";
  return data;
}

function plain(item) {
  const value = item?.toObject?.() || item || {};
  return { ...DEFAULT_ANNOUNCEMENT, ...value };
}

export async function getPublicAnnouncement(_req, res) {
  try {
    const now = new Date();
    const item = await Announcement.findOne({
      key: "site-header",
      enabled: true,
      $and: [
        { $or: [{ visibleFrom: null }, { visibleFrom: { $exists: false } }, { visibleFrom: { $lte: now } }] },
        { $or: [{ visibleUntil: null }, { visibleUntil: { $exists: false } }, { visibleUntil: { $gt: now } }] },
      ],
    })
      .select("type title message details linkLabel linkUrl eventStartsAt eventEndsAt dismissible updatedAt")
      .lean();

    res.set("Cache-Control", "no-store").json({ success: true, data: item || null });
  } catch {
    res.status(500).json({ success: false, message: "Unable to load the site announcement." });
  }
}

export async function getAnnouncement(_req, res) {
  try {
    const item = await Announcement.findOne({ key: "site-header" })
      .populate("updatedBy", "fullName username")
      .lean();
    res.json({ success: true, data: plain(item) });
  } catch {
    res.status(500).json({ success: false, message: "Unable to load announcement settings." });
  }
}

export async function saveAnnouncement(req, res) {
  try {
    const data = normalizedBody(req.body);
    const before = await Announcement.findOne({ key: "site-header" }).lean();
    const item = await Announcement.findOneAndUpdate(
      { key: "site-header" },
      { $set: { ...data, key: "site-header", updatedBy: req.user._id } },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
    const action = data.enabled ? "announcement_published" : "announcement_saved";
    await AuditLog.create({
      actor: req.user._id,
      action,
      metadata: { enabled: data.enabled, type: data.type },
    });
    await logActivity({
      actor: req.user,
      action: data.enabled ? "announcement.published" : "announcement.saved",
      entityType: "announcement",
      entityId: item._id,
      entityTitle: data.title || "Site announcement",
      description: data.enabled
        ? "published the site header announcement"
        : "updated the site header announcement",
      severity: data.enabled ? "important" : "info",
      before,
      after: item.toObject(),
      url: "/announcements",
    });
    res.json({ success: true, data: plain(item), message: data.enabled ? "Announcement published." : "Announcement saved and hidden." });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Unable to save announcement settings.",
    });
  }
}
