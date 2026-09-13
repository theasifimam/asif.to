import ContactMessage from "../../models/ContactMessage.js";
import User from "../../models/User.js";
import Notification from "../../models/Notification.js";
import { CustomerMessage } from "../../models/Communication.js";
import { getMessagingSocketServer } from "../messagingRealtime.service.js";
import { hasPermission, getRolePermissions } from "../../utils/permissions.js";
import { parseMentionUsernames, sendMessage } from "../messaging.service.js";
import { queueEmail } from "./email.service.js";
import { fail } from "./policy.js";
import { resolveContentEntity } from "../contentDiscussion.service.js";
import Asset from "../../models/Asset.js";

export async function inboxUsers() {
  const roles = await getRolePermissions();
  const users = await User.find({ role: { $in: ["author", "editor", "admin", "super_admin"] }, status: "active", deletedAt: null }).select("fullName username avatar role").lean();
  return users.filter(user => hasPermission({ ...user, effectivePermissions: roles[user.role] }, "communications.inbox.read"));
}
export async function notifyInbox(contact, title, actor, mentionIds, key) {
  const users = await inboxUsers();
  const recipients = users.filter(user => String(user._id) !== String(actor || "") && (!mentionIds?.length || mentionIds.map(String).includes(String(user._id))));
  const url = `/communications/inbox?conversation=${contact._id}`;
  for (const user of recipients) {
    const notification = { recipientId: user._id, actorId: actor || null, title, message: `${contact.conversationNumber}: ${contact.subject}`.slice(0, 1000), url, type: "communications", severity: "info" };
    if (key) await Notification.updateOne({ communicationKey: `${key}:${user._id}` }, { $setOnInsert: notification }, { upsert: true });
    else await Notification.create(notification);
  }
  const io = getMessagingSocketServer();
  users.forEach(user => io?.to(`user:${user._id}`).emit("communications:updated", { conversationId: String(contact._id) }));
  recipients.forEach(user => io?.to(`user:${user._id}`).emit("notification_updated", { type: "communications" }));
}
export async function ensureConversation(contact) {
  if (!contact.conversationNumber) {
    await ContactMessage.updateOne({ _id: contact._id,  $or: [{ conversationNumber: { $exists: false } }, { conversationNumber: null }] }, { $set: {
      conversationNumber: `ENQ-${String(contact._id).slice(-12).toUpperCase()}`,
      conversationStatus: contact.status === "archived" ? "CLOSED" : contact.status === "read" ? "OPEN" : "NEW",
      lastMessageAt: contact.updatedAt || contact.createdAt,
      unreadCount: contact.status === "unread" ? 1 : 0,
    } });
  }
  if (!contact.inboundKey) await CustomerMessage.updateOne({ key: `legacy:${contact._id}` }, { $setOnInsert: {
    conversation: contact._id, direction: "CUSTOMER", text: contact.message, email: contact.email,
    createdAt: contact.createdAt, updatedAt: contact.createdAt, readAt: contact.status === "unread" ? null : contact.updatedAt || contact.createdAt,
  } }, { upsert: true, timestamps: false });
  for (const reply of contact.replies || []) {
    await CustomerMessage.updateOne({ key: `legacy-reply:${contact._id}:${reply.requestId}` }, { $setOnInsert: {
      conversation: contact._id, direction: "ADMIN", text: reply.message, sender: reply.sentBy, email: reply.from,
      messageId: reply.messageId, deliveryStatus: reply.status.toUpperCase(), createdAt: reply.sentAt || reply.createdAt,
    } }, { upsert: true, timestamps: false });
  }
  return ContactMessage.findById(contact._id);
}
export async function addCustomerMessage(contact, { key, text, email, messageId, inReplyTo, references = [], attachments = [] }) {
  const result = await CustomerMessage.updateOne({ key }, { $setOnInsert: { conversation: contact._id, direction: "CUSTOMER", text, email, messageId, inReplyTo, references, attachments } }, { upsert: true });
  // Recompute on replay as well: a process can stop after inserting the message.
  const message = await CustomerMessage.findOne({ key });
  const unreadCount = await CustomerMessage.countDocuments({ conversation: contact._id, direction: "CUSTOMER", readAt: null });
  await ContactMessage.updateOne({ _id: contact._id }, { $set: { unreadCount } });
  if (!message.appliedAt) {
    await ContactMessage.updateOne({ _id: contact._id, lastMessageAt: { $lte: message.createdAt } }, { $set: { status: "unread", conversationStatus: "WAITING_FOR_ADMIN", lastMessageAt: message.createdAt, resolvedAt: null } });
    await CustomerMessage.updateOne({ _id: message._id }, { $set: { appliedAt: new Date() } });
    await notifyInbox(contact, "Customer replied").catch(error => console.error("[COMMUNICATIONS] notification:", error.message));
  }
  return Boolean(result.upsertedCount);
}

export async function addAdminMessage(user, contact, body) {
  const text = String(body.text || "").trim();
  if (!text || text.length > 20000 || !/^[\w-]{16,100}$/.test(body.requestId || "")) fail("A reply and request identifier are required.");
  const note = body.mode === "note";
  const attachments = [...new Set(body.attachments || [])];
  if (!Array.isArray(body.attachments || [])) fail("Invalid attachments.");
  if (attachments.length > 4) fail("Attach up to four files.");
  let totalBytes = 0;
  for (const id of attachments) {
    const file = await Asset.findOne({ accessScope: "communications", _id: id, status: "active", uploadedBy: user._id });
    totalBytes += file?.size || 0;
    if (totalBytes > 10 * 1024 * 1024) fail("Total attachments must not exceed 10 MB.");
    if (!file || file.visibility !== "private" || file.size > 10 * 1024 * 1024) fail("Use your own private attachments, up to 10 MB each.", 403);
  }
  const mentioned = note ? (await inboxUsers()).filter(person => parseMentionUsernames(text).includes(person.username)) : [];
  const key = `admin:${contact._id}:${body.requestId}`;
  let message = await CustomerMessage.findOne({ key });
  if (message?.appliedAt) return message;
  if (!message) message = await CustomerMessage.findOneAndUpdate({ key }, { $setOnInsert: {
    conversation: contact._id, direction: note ? "NOTE" : "ADMIN", text, sender: user._id,
    resolve: Boolean(body.resolve), attachments, mentions: mentioned.map(person => person._id), deliveryStatus: note ? "INTERNAL" : "QUEUED",
  } }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true });
  if (message.direction === "ADMIN") {
    const job = await queueEmail({ key, recipient: contact.email, stream: "SUPPORT", type: "support_reply", subject: `Re: ${contact.subject}`, text: message.text,
      conversation: contact._id, customerMessage: message._id, attachments: message.attachments });
    await CustomerMessage.updateOne({ _id: message._id }, { $set: { emailJob: job._id } });
    await CustomerMessage.updateMany({ conversation: contact._id, direction: "CUSTOMER", createdAt: { $lte: message.createdAt }, readAt: null }, { $set: { readAt: new Date() } });
    await ContactMessage.updateOne({ _id: contact._id, lastMessageAt: { $lte: message.createdAt } }, { $set: {
      conversationStatus: message.resolve ? "RESOLVED" : "WAITING_FOR_CUSTOMER", status: "read", unreadCount: 0, lastMessageAt: message.createdAt,
      ...(message.resolve ? { resolvedAt: new Date() } : {}),
    } });
  }
  await CustomerMessage.updateOne({ _id: message._id }, { $set: { appliedAt: new Date() } });
  if (note && mentioned.length) await notifyInbox(contact, "Mentioned in an internal note", user._id, mentioned.map(person => person._id));
  else await notifyInbox(contact, note ? "Internal note added" : "Reply queued", user._id, contact.assignedTo ? [contact.assignedTo] : []);
  return message;
}
export async function shareEnquiry(user, contact, conversationId, requestId) {
  const origin = (process.env.ADMIN_URL || "https://admin.asif.to").replace(/\/$/, "");
  return sendMessage(user, conversationId,
    `${user.fullName} shared ${contact.conversationNumber}\nCustomer: ${contact.name}\nSubject: ${contact.subject}\nPriority: ${contact.priority}\n${origin}/communications/inbox?conversation=${contact._id}`,
    requestId);
}
export async function attachContent(user, contact, reference) {
  if (reference) await resolveContentEntity(user, reference.entityType, reference.entityId);
  await ContactMessage.updateOne({ _id: contact._id }, { $set: { relatedContent: reference || null } });
}

export async function broadcastInbox(conversationId) {
  const io = getMessagingSocketServer();
  for (const user of await inboxUsers()) io?.to(`user:${user._id}`).emit("communications:updated", { conversationId: String(conversationId) });
}
