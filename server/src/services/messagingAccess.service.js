import User from "../models/User.js";
import { getPermissionsForRole, hasPermission } from "../utils/permissions.js";

export const TEAM_ROLES = ["author", "editor", "admin", "super_admin"];

export const canUseMessaging = (user) =>
  TEAM_ROLES.includes(user?.role) && hasPermission(user, "messages.view");

export const canAccessConversation = (user, conversation) => {
  if (!canUseMessaging(user) || !conversation) return false;
  const userId = String(user._id);
  if (conversation.type === "direct") {
    return conversation.members.some((member) => String(member?._id || member) === userId);
  }
  if (conversation.type === "discussion") {
    return hasPermission(user, conversation.requiredPermission) ||
      (String(conversation.entityAuthorId || "") === userId && hasPermission(user, "articles.edit_own"));
  }
  return (
    conversation.readRoles.includes(user.role) ||
    conversation.allowedMemberIds.some((member) => String(member?._id || member) === userId)
  );
};

export const canPostConversation = (user, conversation) =>
  canAccessConversation(user, conversation) &&
  hasPermission(user, "messages.send") &&
  (conversation.type === "direct" ||
    conversation.type === "discussion" ||
    conversation.postRoles.includes(user.role) ||
    conversation.allowedMemberIds.some((member) => String(member?._id || member) === String(user._id)));

export async function getConversationRecipientIds(conversation, senderId) {
  if (conversation.type === "direct") {
    const candidates = await User.find({ _id: { $in: conversation.members }, status: "active", deletedAt: null }).select("_id role").lean();
    const permissions = new Map(await Promise.all([...new Set(candidates.map((candidate) => candidate.role))].map(async (role) => [role, await getPermissionsForRole(role)])));
    return candidates.filter((candidate) => canUseMessaging({ ...candidate, effectivePermissions: permissions.get(candidate.role) })).map((candidate) => String(candidate._id)).filter((id) => id !== String(senderId));
  }
  const users = await User.find({
    status: "active",
    deletedAt: null,
    $or: [
      { role: { $in: conversation.readRoles } },
      { _id: { $in: conversation.allowedMemberIds } },
    ],
  }).select("_id").lean();
  const permissions = new Map(await Promise.all([...new Set(users.map((user) => user.role))].map(async (role) => [role, await getPermissionsForRole(role)])));
  return users
    .filter((candidate) => canAccessConversation({ ...candidate, effectivePermissions: permissions.get(candidate.role) }, conversation))
    .map((candidate) => String(candidate._id))
    .filter((id) => id !== String(senderId));
}
