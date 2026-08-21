import CommunityPost from "../models/CommunityPost.js";
import CommunityComment from "../models/CommunityComment.js";
import CommunityReport from "../models/CommunityReport.js";
import ModerationAction from "../models/ModerationAction.js";
import { communityConfig } from "../configs/community.js";
import { createCommunityNotification } from "./communityNotification.service.js";
import { cleanText, httpError } from "./communityInput.service.js";

const models = { post: CommunityPost, comment: CommunityComment };

export async function getModerationTarget(targetType, targetId) {
  const Model = models[targetType];
  if (!Model) throw httpError(400, "Invalid report target.");
  const target = await Model.findById(targetId);
  if (!target) throw httpError(404, "The reported content no longer exists.");
  return target;
}

export async function evaluateAutoHide(targetType, targetId) {
  const uniqueReports = await CommunityReport.distinct("reporter", { targetType, targetId, status: "active" });
  if (uniqueReports.length < communityConfig.autoHideReportThreshold) return { hidden: false, uniqueReports: uniqueReports.length };
  const Model = models[targetType];
  const now = new Date();
  const target = await Model.findOneAndUpdate(
    { _id: targetId, status: "published" },
    { $set: { status: "under_review", automaticallyHiddenAt: now, statusReason: "Temporarily hidden while community reports are reviewed." } },
    { returnDocument: "before" },
  );
  if (!target) return { hidden: false, uniqueReports: uniqueReports.length };
  await ModerationAction.create({ source: "automatic", action: "auto_hide", targetType, targetId, fromStatus: "published", toStatus: "under_review", reason: "Unique credible-report threshold reached.", metadata: { uniqueReportCount: uniqueReports.length, threshold: communityConfig.autoHideReportThreshold } });
  const post = targetType === "post" ? target : await CommunityPost.findById(target.post).select("slug title").lean();
  await createCommunityNotification({ recipient: target.author, actor: null, type: "community_moderation", title: "Content temporarily hidden", message: "Your content is temporarily hidden while it is being reviewed.", url: post ? `/community/${post.slug}` : "/community", dedupeKey: `auto-hide:${targetType}:${targetId}`, severity: "important" });
  return { hidden: true, uniqueReports: uniqueReports.length };
}

export async function moderateTarget(moderator, targetType, targetId, action, reason = "") {
  const actionMap = { hide: "hidden", restore: "published", remove: "removed" };
  if (!actionMap[action]) throw httpError(400, "Invalid moderation action.");
  const target = await getModerationTarget(targetType, targetId);
  if (target.status === "deleted_by_author" && action !== "remove") throw httpError(409, "Author-deleted content cannot be restored or hidden.");
  const fromStatus = target.status;
  target.status = actionMap[action];
  target.statusReason = cleanText(reason, 1000) || (action === "restore" ? "Reviewed and restored by a moderator." : action === "remove" ? "Removed for violating community guidelines." : "Hidden by a moderator.");
  if (action === "restore") target.automaticallyHiddenAt = undefined;
  await target.save();
  await ModerationAction.create({ moderator: moderator._id, source: "manual", action, targetType, targetId, fromStatus, toStatus: target.status, reason: target.statusReason });
  if (action === "restore") {
    await CommunityReport.updateMany({ targetType, targetId, status: "active" }, { $set: { status: "resolved", resolvedBy: moderator._id, resolvedAt: new Date(), resolutionNote: target.statusReason } });
  }
  const post = targetType === "post" ? target : await CommunityPost.findById(target.post).select("slug title").lean();
  if (["hide", "remove", "restore"].includes(action)) await createCommunityNotification({ recipient: target.author, actor: moderator._id, type: "community_moderation", title: action === "restore" ? "Content restored" : action === "remove" ? "Content removed" : "Content hidden", message: action === "restore" ? "A moderator reviewed and restored your content." : action === "remove" ? "Your content was removed for violating community guidelines." : "Your content was hidden by a moderator.", url: post ? `/community/${post.slug}` : "/community", dedupeKey: `moderation:${action}:${targetType}:${targetId}:${Date.now()}`, severity: "important" });
  return target;
}

export async function resolveTargetReports(moderator, targetType, targetId, disposition, reason = "") {
  const status = disposition === "dismiss" ? "dismissed" : "resolved";
  const result = await CommunityReport.updateMany({ targetType, targetId, status: "active" }, { $set: { status, resolvedBy: moderator._id, resolvedAt: new Date(), resolutionNote: cleanText(reason, 1000) } });
  await ModerationAction.create({ moderator: moderator._id, source: "manual", action: disposition === "dismiss" ? "dismiss_reports" : "resolve_reports", targetType, targetId, reason: cleanText(reason, 1000), metadata: { reportCount: result.modifiedCount } });
  return result.modifiedCount;
}
