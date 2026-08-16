import Conversation from "../models/Conversation.js";
import RolePermission from "../models/RolePermission.js";
import { clearPermissionCache } from "../utils/permissions.js";

const channels = [
  { slug: "general", name: "general", description: "Company-wide team coordination", readRoles: ["author", "editor", "admin", "super_admin"], postRoles: ["author", "editor", "admin", "super_admin"] },
  { slug: "content", name: "content", description: "Editorial planning and content coordination", readRoles: ["author", "editor", "admin", "super_admin"], postRoles: ["author", "editor", "admin", "super_admin"] },
  { slug: "seo", name: "seo", description: "Search and discoverability coordination", readRoles: ["editor", "admin", "super_admin"], postRoles: ["editor", "admin", "super_admin"] },
  { slug: "technical", name: "technical", description: "Platform and technical operations", readRoles: ["admin", "super_admin"], postRoles: ["admin", "super_admin"] },
  { slug: "announcements", name: "announcements", description: "Important internal announcements", readRoles: ["author", "editor", "admin", "super_admin"], postRoles: ["admin", "super_admin"] },
];

export async function ensureMessagingBootstrap() {
  await Promise.all(channels.map((channel) => Conversation.updateOne(
    { type: "channel", slug: channel.slug },
    { $setOnInsert: { type: "channel", isSystem: true, members: [], allowedMemberIds: [], lastMessageAt: new Date(0) }, $set: channel },
    { upsert: true },
  )));
  await Promise.all(["author", "editor", "admin"].map((role) => RolePermission.updateOne(
    { role },
    { $addToSet: { permissions: { $each: ["messages.view", "messages.send", "messages.attach", ...(role !== "author" ? ["messages.pin"] : [])] } } },
  )));
  await RolePermission.updateOne(
    { role: "admin" },
    { $addToSet: { permissions: { $each: ["messages.channels.manage", "messages.moderate"] } } },
  );
  clearPermissionCache();
}
