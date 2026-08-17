import ActivityLog from "../models/ActivityLog.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { roleRank } from "../utils/permissions.js";
import { getMessagingSocketServer } from "./messagingRealtime.service.js";

const ACTIVE_STAFF_ROLES = ["author", "editor", "admin", "super_admin"];

const actorName = (actor) => actor?.fullName || actor?.username || "A team member";

/**
 * Central activity entry point. Controllers only describe a meaningful event;
 * this service persists it and derives recipients in one place. It deliberately
 * stores concise field summaries, never whole content documents.
 */
export async function logActivity({ actor, action, entityType, entityId, entityTitle, description, metadata = {}, severity = "info", before, after, targetUserId, url, notificationTitle }) {
  if (!actor?._id || !entityId || !action || !entityType || !description) return null;
  try {
    const activity = await ActivityLog.create({
      actorId: actor._id,
      actorRole: actor.role,
      action,
      entityType,
      entityId,
      entityTitle,
      description,
      metadata,
      severity,
      before,
      after,
      targetUserId,
      url,
    });

    const recipientIds = await getRecipients({ actor, targetUserId });
    if (recipientIds.length) {
      const notifications = recipientIds.map((recipientId) => ({
        recipientId,
        activityId: activity._id,
        title: notificationTitle || `${actorName(actor)} ${description}`,
        message: entityTitle ? `${description} “${entityTitle}”` : description,
        type: entityType,
        severity,
        url,
      }));
      await Notification.insertMany(notifications, { ordered: false });

      // Emit real-time notification via Socket
      const io = getMessagingSocketServer();
      if (io) {
        recipientIds.forEach((recipientId) => {
          io.to(`user:${recipientId}`).emit("notification_updated", {
            type: entityType || "activity",
            severity,
            title: notificationTitle || `${actorName(actor)} ${description}`,
            message: entityTitle ? `${description} “${entityTitle}”` : description,
            url,
            actorName: actorName(actor),
            createdAt: new Date().toISOString(),
          });
        });
      }
    }
    return activity;
  } catch (error) {
    // Observability must never break the primary mutation. This boundary can be
    // swapped for a queue later without changing call sites.
    console.error("[ACTIVITY] Unable to record event:", error.message);
    return null;
  }
}

async function getRecipients({ actor, targetUserId }) {
  const actorRank = roleRank[actor.role] ?? 0;
  const higherRoles = ACTIVE_STAFF_ROLES.filter((role) => roleRank[role] > actorRank);
  const recipients = await User.find({ role: { $in: higherRoles }, status: "active", deletedAt: null }).select("_id").lean();
  const ids = recipients.map((user) => String(user._id));
  if (targetUserId && String(targetUserId) !== String(actor._id)) ids.push(String(targetUserId));
  return [...new Set(ids)];
}
