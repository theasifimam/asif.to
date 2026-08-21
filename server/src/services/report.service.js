import CommunityReport, { COMMUNITY_REPORT_REASONS } from "../models/CommunityReport.js";
import { cleanText, httpError } from "./communityInput.service.js";
import { evaluateAutoHide, getModerationTarget } from "./moderation.service.js";

export async function createReport(reporter, payload) {
  const targetType = String(payload.targetType || "");
  const target = await getModerationTarget(targetType, payload.targetId);
  if (String(target.author) === String(reporter._id)) throw httpError(400, "You cannot report your own content.");
  if (target.status !== "published") throw httpError(409, "This content is already unavailable or under review.");
  const reason = String(payload.reason || "");
  if (!COMMUNITY_REPORT_REASONS.includes(reason)) throw httpError(400, "Choose a valid report reason.");
  const explanation = cleanText(payload.explanation, 500);
  if (reason === "other" && explanation.length < 5) throw httpError(400, "Please briefly explain an Other report.");
  let report;
  try { report = await CommunityReport.create({ reporter: reporter._id, targetType, targetId: target._id, targetAuthor: target.author, reason, explanation }); }
  catch (error) { if (error.code === 11000) throw httpError(409, "You already have an active report for this content."); throw error; }
  const moderation = await evaluateAutoHide(targetType, target._id);
  return { report, moderation };
}

export async function listModerationQueue(query = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  const match = { status: query.reportStatus && ["active", "dismissed", "resolved"].includes(query.reportStatus) ? query.reportStatus : "active" };
  if (["post", "comment"].includes(query.targetType)) match.targetType = query.targetType;
  const groups = await CommunityReport.aggregate([
    { $match: match },
    { $group: { _id: { targetType: "$targetType", targetId: "$targetId" }, uniqueReporters: { $addToSet: "$reporter" }, reasons: { $push: "$reason" }, firstReportedAt: { $min: "$createdAt" }, lastReportedAt: { $max: "$createdAt" } } },
    { $addFields: { uniqueReporterCount: { $size: "$uniqueReporters" } } },
    { $sort: { lastReportedAt: -1 } },
    { $facet: { items: [{ $skip: (page - 1) * limit }, { $limit: limit }], total: [{ $count: "value" }] } },
  ]);
  const raw = groups[0]?.items || [];
  const items = await Promise.all(raw.map(async (group) => {
    const target = await getModerationTarget(group._id.targetType, group._id.targetId).catch(() => null);
    if (!target) return null;
    await target.populate("author", "fullName username avatar role status");
    if (group._id.targetType === "comment") await target.populate("post", "title slug status visibility");
    return { targetType: group._id.targetType, target: target.toObject(), uniqueReporterCount: group.uniqueReporterCount, reasons: group.reasons, firstReportedAt: group.firstReportedAt, lastReportedAt: group.lastReportedAt };
  }));
  const total = groups[0]?.total?.[0]?.value || 0;
  return { items: items.filter(Boolean), pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

export async function getModerationCase(targetType, targetId) {
  const target = await getModerationTarget(targetType, targetId);
  await target.populate("author", "fullName username avatar role status");
  if (targetType === "comment") await target.populate("post", "title slug status visibility");
  const [reports, actions] = await Promise.all([
    CommunityReport.find({ targetType, targetId }).populate("reporter", "fullName username avatar role status createdAt").populate("resolvedBy", "fullName username role").sort({ createdAt: -1 }).lean(),
    (await import("../models/ModerationAction.js")).default.find({ targetType, targetId }).populate("moderator", "fullName username role").sort({ createdAt: -1 }).lean(),
  ]);
  return { target: target.toObject(), reports, actions };
}
