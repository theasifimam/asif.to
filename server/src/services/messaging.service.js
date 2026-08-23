import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import ConversationRead from "../models/ConversationRead.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import MessageReaction, { ALLOWED_REACTIONS } from "../models/MessageReaction.js";
import MessagePin from "../models/MessagePin.js";
import MessageAttachment from "../models/MessageAttachment.js";
import AuditLog from "../models/AuditLog.js";
import { hasPermission } from "../utils/permissions.js";
import { canAccessConversation, canPostConversation, getConversationRecipientIds, TEAM_ROLES } from "./messagingAccess.service.js";
import { getMessagingSocketServer, isViewingConversation } from "./messagingRealtime.service.js";

const MAX_MESSAGE_LENGTH = 4000;
const SEND_WINDOW_MS = 10_000;
const SEND_LIMIT = 20;
const sendWindows = new Map();

const normalizeContent = (content) => {
  if (typeof content !== "string") return "";
  return content.replace(/\r\n/g, "\n").trim();
};

const checkRateLimit = (userId) => {
  const now = Date.now();
  const recent = (sendWindows.get(String(userId)) || []).filter((time) => now - time < SEND_WINDOW_MS);
  if (recent.length >= SEND_LIMIT) return false;
  recent.push(now);
  sendWindows.set(String(userId), recent);
  return true;
};

export const accessibleConversationFilter = (user) => ({
  $or: [
    { type: "direct", members: user._id },
    { type: "channel", $or: [{ readRoles: user.role }, { allowedMemberIds: user._id }] },
    { type: "discussion", $or: [
      ...(user.effectivePermissions?.includes("*") ? [{}] : [{ requiredPermission: { $in: user.effectivePermissions || [] } }]),
      { entityAuthorId: user._id },
    ] },
  ],
});

const senderFields = "fullName username avatar role";
const REACTIONS = ALLOWED_REACTIONS;

async function hydrateMessages(messages) {
  if (!messages.length) return messages;
  const ids = messages.map((message) => message._id);
  const [reactions, pins] = await Promise.all([
    MessageReaction.find({ messageId: { $in: ids } }).select("messageId emoji userId").lean(),
    MessagePin.find({ messageId: { $in: ids } }).select("messageId pinnedBy pinnedAt").lean(),
  ]);
  return messages.map((message) => ({
    ...message,
    reactions: reactions.filter((reaction) => String(reaction.messageId) === String(message._id)),
    pin: pins.find((pin) => String(pin.messageId) === String(message._id)) || null,
  }));
}

async function populatedMessage(id) {
  const message = await Message.findById(id)
    .populate("senderId", senderFields)
    .populate("mentions", senderFields)
    .populate({ path: "replyToMessageId", select: "content senderId deletedAt", populate: { path: "senderId", select: senderFields } })
    .lean();
  return (await hydrateMessages(message ? [message] : []))[0] || null;
}

export async function listConversations(user, search = "") {
  let conversations = await Conversation.find(accessibleConversationFilter(user))
    .populate("members", senderFields)
    .populate("lastMessageSenderId", senderFields)
    .sort({ lastMessageAt: -1 })
    .lean();
  const term = String(search).trim().toLowerCase();
  if (term) conversations = conversations.filter((conversation) => {
    if (conversation.type !== "direct") return `${conversation.name} ${conversation.description} ${conversation.entityTitle || ""}`.toLowerCase().includes(term);
    return conversation.members.some((member) => String(member._id) !== String(user._id) && `${member.fullName} ${member.username}`.toLowerCase().includes(term));
  });
  if (conversations.length) {
    await ConversationRead.bulkWrite(conversations.map((conversation) => ({
      updateOne: {
        filter: { conversationId: conversation._id, userId: user._id },
        update: { $setOnInsert: { lastReadAt: new Date(), unreadCount: 0 } },
        upsert: true,
      },
    })), { ordered: false });
  }
  const states = await ConversationRead.find({ userId: user._id, conversationId: { $in: conversations.map((item) => item._id) } }).lean();
  const stateMap = new Map(states.map((state) => [String(state.conversationId), state]));
  return conversations.map((conversation) => ({ ...conversation, unreadCount: stateMap.get(String(conversation._id))?.unreadCount || 0 }));
}

export async function listTeamMembers(user, search = "") {
  const filter = { _id: { $ne: user._id }, role: { $in: TEAM_ROLES }, status: "active", deletedAt: null };
  if (String(search).trim()) {
    const term = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [{ fullName: new RegExp(term, "i") }, { username: new RegExp(term, "i") }];
  }
  return User.find(filter).select(senderFields).sort({ fullName: 1 }).limit(30).lean();
}

export async function getOrCreateDirectConversation(user, targetUserId) {
  if (!mongoose.isValidObjectId(targetUserId) || String(targetUserId) === String(user._id)) throw Object.assign(new Error("Choose another team member."), { status: 400 });
  const target = await User.findOne({ _id: targetUserId, role: { $in: TEAM_ROLES }, status: "active", deletedAt: null }).select(senderFields);
  if (!target) throw Object.assign(new Error("Team member not found."), { status: 404 });
  const memberIds = [String(user._id), String(target._id)].sort();
  const directKey = memberIds.join(":");
  let conversation;
  try {
    conversation = await Conversation.findOneAndUpdate(
      { directKey },
      { $setOnInsert: { type: "direct", directKey, members: memberIds, lastMessageAt: new Date(0) } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
    conversation = await Conversation.findOne({ directKey });
  }
  await ConversationRead.bulkWrite(memberIds.map((userId) => ({ updateOne: { filter: { conversationId: conversation._id, userId }, update: { $setOnInsert: { lastReadAt: new Date(), unreadCount: 0 } }, upsert: true } })), { ordered: false });
  return Conversation.findById(conversation._id).populate("members", senderFields).lean();
}

export async function getMessages(user, conversationId, { before, limit = 30 } = {}) {
  if (!mongoose.isValidObjectId(conversationId)) throw Object.assign(new Error("Conversation not found."), { status: 404 });
  const conversation = await Conversation.findById(conversationId).lean();
  if (!canAccessConversation(user, conversation)) throw Object.assign(new Error("You do not have access to this conversation."), { status: 403 });
  const pageSize = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 30));
  const filter = { conversationId };
  if (before && mongoose.isValidObjectId(before)) filter._id = { $lt: before };
  const messages = await Message.find(filter).populate("senderId", senderFields).populate("mentions", senderFields).populate({ path: "replyToMessageId", select: "content senderId deletedAt", populate: { path: "senderId", select: senderFields } }).sort({ _id: -1 }).limit(pageSize + 1).lean();
  const hasMore = messages.length > pageSize;
  if (hasMore) messages.pop();
  messages.reverse();
  return { conversation, messages: await hydrateMessages(messages), hasMore, nextCursor: hasMore ? String(messages[0]._id) : null };
}

async function resolveMentions(content, conversation, user) {
  const usernames = [...new Set([...content.matchAll(/(^|\s)@([a-z0-9._-]{3,40})\b/gi)].map((match) => match[2].toLowerCase()))];
  if (!usernames.length) return [];
  const mentioned = await User.find({ username: { $in: usernames }, role: { $in: TEAM_ROLES }, status: "active" }).select(senderFields).lean();
  const accessibleIds = new Set([String(user._id), ...(await getConversationRecipientIds(conversation, null))]);
  if (mentioned.some((person) => !accessibleIds.has(String(person._id)))) throw Object.assign(new Error("One or more mentioned users cannot access this conversation."), { status: 400 });
  return mentioned.filter((person) => String(person._id) !== String(user._id));
}

export async function sendMessage(user, conversationId, rawContent, clientId, options = {}) {
  const content = normalizeContent(rawContent);
  if (content.length > MAX_MESSAGE_LENGTH) throw Object.assign(new Error(`Messages can be up to ${MAX_MESSAGE_LENGTH} characters.`), { status: 400 });
  if (!checkRateLimit(user._id)) throw Object.assign(new Error("You are sending messages too quickly. Try again shortly."), { status: 429 });
  if (!mongoose.isValidObjectId(conversationId)) throw Object.assign(new Error("Conversation not found."), { status: 404 });
  const conversation = await Conversation.findById(conversationId);
  if (!canPostConversation(user, conversation)) throw Object.assign(new Error("You cannot post in this conversation."), { status: 403 });
  const attachmentIds = [...new Set((options.attachmentIds || []).map(String))].slice(0, 4);
  const attachments = attachmentIds.length ? await MessageAttachment.find({ _id: { $in: attachmentIds }, conversationId, uploadedBy: user._id, messageId: null }).lean() : [];
  if (attachments.length !== attachmentIds.length) throw Object.assign(new Error("One or more attachments are invalid or already used."), { status: 400 });
  if (!content && !attachments.length) throw Object.assign(new Error("Write a message or add an attachment first."), { status: 400 });
  let replyTo = null;
  if (options.replyToMessageId) {
    replyTo = await Message.findOne({ _id: options.replyToMessageId, conversationId }).select("_id senderId deletedAt").lean();
    if (!replyTo) throw Object.assign(new Error("The message being replied to was not found."), { status: 400 });
  }
  const mentions = await resolveMentions(content, conversation, user);

  let message;
  try {
    message = await Message.create({ conversationId: conversation._id, senderId: user._id, content, clientId: String(clientId || "").slice(0, 100) || undefined, replyToMessageId: replyTo?._id, mentions: mentions.map((person) => person._id), attachments: attachments.map((file) => ({ attachmentId: file._id, name: file.originalName, url: `/messaging/attachments/${file._id}`, mimeType: file.mimeType, size: file.size })) });
  } catch (error) {
    if (error.code === 11000 && clientId) {
      const existing = await Message.findOne({ senderId: user._id, clientId }).populate("senderId", senderFields).lean();
      return { message: existing, duplicate: true };
    }
    throw error;
  }
  if (attachments.length) await MessageAttachment.updateMany({ _id: { $in: attachments.map((file) => file._id) } }, { $set: { messageId: message._id } });
  conversation.lastMessage = message._id;
  conversation.lastMessageText = (content || "📎 Attachment").slice(0, 240);
  conversation.lastMessageSenderId = user._id;
  conversation.lastMessageAt = message.createdAt;
  await conversation.save({ validateBeforeSave: false });

  const recipientIds = await getConversationRecipientIds(conversation, user._id);
  const activeRecipientIds = recipientIds.filter((id) => isViewingConversation(id, conversation._id));
  const unreadRecipientIds = recipientIds.filter((id) => !activeRecipientIds.includes(id));
  if (unreadRecipientIds.length) {
    await ConversationRead.bulkWrite(unreadRecipientIds.map((userId) => ({ updateOne: {
      filter: { conversationId: conversation._id, userId },
      update: { $inc: { unreadCount: 1 }, $setOnInsert: { lastReadAt: new Date() } },
      upsert: true,
      setDefaultsOnInsert: false,
    } })), { ordered: false });
  }
  if (activeRecipientIds.length) {
    await ConversationRead.updateMany(
      { conversationId: conversation._id, userId: { $in: activeRecipientIds } },
      { $set: { unreadCount: 0, lastReadAt: message.createdAt, lastReadMessageId: message._id } },
    );
  }
  await ConversationRead.updateOne(
    { conversationId: conversation._id, userId: user._id },
    { $set: { lastReadAt: message.createdAt, lastReadMessageId: message._id, unreadCount: 0 } },
    { upsert: true },
  );

  const shouldNotifyChannel = conversation.type === "channel" && conversation.slug === "announcements";
  const reasons = new Map();
  if (conversation.type === "direct" || shouldNotifyChannel || conversation.type === "discussion") unreadRecipientIds.forEach((id) => reasons.set(id, conversation.type === "discussion" ? "discussion" : "message"));
  if (replyTo && String(replyTo.senderId) !== String(user._id) && unreadRecipientIds.includes(String(replyTo.senderId))) reasons.set(String(replyTo.senderId), "reply");
  mentions.forEach((person) => { if (unreadRecipientIds.includes(String(person._id))) reasons.set(String(person._id), "mention"); });
  const notificationRecipients = [...reasons.keys()];
  if (notificationRecipients.length) {
    await Notification.insertMany(notificationRecipients.map((recipientId) => ({
      recipientId,
      actorId: user._id,
      conversationId: conversation._id,
      messageId: message._id,
      title: reasons.get(recipientId) === "mention" ? `${user.fullName} mentioned you` : reasons.get(recipientId) === "reply" ? `${user.fullName} replied to you` : conversation.type === "discussion" ? `Discussion activity: ${conversation.entityTitle}` : conversation.type === "direct" ? `New message from ${user.fullName}` : `New #${conversation.name} announcement`,
      message: (content || "Shared an attachment").slice(0, 180),
      type: "message",
      severity: shouldNotifyChannel ? "important" : "info",
      url: `/messages?conversation=${conversation._id}`,
    })), { ordered: false });
    const io = getMessagingSocketServer();
    notificationRecipients.forEach((recipientId) => io?.to(`user:${recipientId}`).emit("notification_updated", { type: "message" }));
  }

  const populated = await populatedMessage(message._id);
  await emitMessageEvents(conversation, populated, recipientIds, user._id);
  return { message: populated, duplicate: false };
}

async function emitMessageEvents(conversation, message, recipientIds, senderId) {
  const io = getMessagingSocketServer();
  if (!io) return;

  const convRoom = `conversation:${conversation._id}`;
  const participantIds = [...new Set([...recipientIds, String(senderId)])];

  // Target both conversation room and individual recipient user rooms to ensure reliable delivery
  let broadcaster = io.to(convRoom);
  participantIds.forEach((userId) => {
    broadcaster = broadcaster.to(`user:${userId}`);
  });
  broadcaster.emit("new_message", message);

  await Promise.all(participantIds.map(async (userId) => {
    const state = await getUnreadSummary(userId);
    io.to(`user:${userId}`).emit("conversation_updated", {
      conversationId: String(conversation._id),
      lastMessageText: conversation.lastMessageText,
      lastMessageAt: conversation.lastMessageAt,
      lastMessageSenderId: String(senderId),
    });
    io.to(`user:${userId}`).emit("unread_updated", state);
  }));
}

export async function markConversationRead(user, conversationId) {
  const conversation = await Conversation.findById(conversationId).lean();
  if (!canAccessConversation(user, conversation)) throw Object.assign(new Error("You do not have access to this conversation."), { status: 403 });
  const latest = await Message.findOne({ conversationId, deletedAt: null }).sort({ _id: -1 }).select("_id createdAt").lean();
  await ConversationRead.updateOne(
    { conversationId, userId: user._id },
    { $set: { unreadCount: 0, lastReadAt: new Date(), ...(latest && { lastReadMessageId: latest._id }) } },
    { upsert: true },
  );
  const summary = await getUnreadSummary(user._id);
  getMessagingSocketServer()?.to(`user:${user._id}`).emit("unread_updated", summary);
  return summary;
}

export async function getUnreadSummary(userId) {
  const rows = await ConversationRead.find({ userId, unreadCount: { $gt: 0 } }).select("conversationId unreadCount").lean();
  return { totalUnread: rows.reduce((total, row) => total + row.unreadCount, 0), conversations: Object.fromEntries(rows.map((row) => [String(row.conversationId), row.unreadCount])) };
}

const requireMessageAccess = async (user, messageId) => {
  if (!mongoose.isValidObjectId(messageId)) throw Object.assign(new Error("Message not found."), { status: 404 });
  const message = await Message.findById(messageId);
  if (!message) throw Object.assign(new Error("Message not found."), { status: 404 });
  const conversation = await Conversation.findById(message.conversationId).lean();
  if (!canAccessConversation(user, conversation)) throw Object.assign(new Error("Message access denied."), { status: 403 });
  return { message, conversation };
};

const emitMutation = (conversationId, event, payload) => getMessagingSocketServer()?.to(`conversation:${conversationId}`).emit(event, payload);

export async function getConversationMembers(user, conversationId, search = "") {
  const conversation = await Conversation.findById(conversationId).lean();
  if (!canAccessConversation(user, conversation)) throw Object.assign(new Error("Conversation access denied."), { status: 403 });
  let ids;
  if (conversation.type === "direct") ids = conversation.members.map(String);
  else ids = [...new Set([String(user._id), ...(await getConversationRecipientIds(conversation, null))])];
  const filter = { _id: { $in: ids }, status: "active" };
  if (String(search).trim()) {
    const value = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [{ fullName: new RegExp(value, "i") }, { username: new RegExp(value, "i") }];
  }
  return User.find(filter).select(senderFields).sort({ fullName: 1 }).limit(20).lean();
}

export async function editMessage(user, messageId, rawContent) {
  const { message, conversation } = await requireMessageAccess(user, messageId);
  if (String(message.senderId) !== String(user._id)) throw Object.assign(new Error("You can edit only your own messages."), { status: 403 });
  if (message.deletedAt) throw Object.assign(new Error("Deleted messages cannot be edited."), { status: 409 });
  const content = normalizeContent(rawContent);
  if (!content && !message.attachments.length) throw Object.assign(new Error("A message with no attachments cannot be empty."), { status: 400 });
  if (content.length > MAX_MESSAGE_LENGTH) throw Object.assign(new Error("Message is too long."), { status: 400 });
  const mentions = await resolveMentions(content, conversation, user);
  message.content = content;
  message.mentions = mentions.map((person) => person._id);
  message.editedAt = new Date();
  await message.save();
  const result = await populatedMessage(message._id);
  emitMutation(conversation._id, "message_updated", result);
  return result;
}

export async function deleteMessage(user, messageId, requestMetadata = {}) {
  const { message, conversation } = await requireMessageAccess(user, messageId);
  const own = String(message.senderId) === String(user._id);
  if (!own && !hasPermission(user, "messages.moderate")) throw Object.assign(new Error("You cannot delete this message."), { status: 403 });
  if (!message.deletedAt) {
    message.content = "";
    message.mentions = [];
    message.deletedAt = new Date();
    message.deletedBy = user._id;
    await message.save({ validateBeforeSave: false });
  }
  if (!own) await AuditLog.create({ actor: user._id, action: "message.moderated_deleted", metadata: { messageId: message._id, conversationId: conversation._id }, ip: requestMetadata.ip, userAgent: requestMetadata.userAgent });
  const result = await populatedMessage(message._id);
  emitMutation(conversation._id, "message_deleted", result);
  return result;
}

export async function toggleReaction(user, messageId, emoji) {
  if (!REACTIONS.includes(emoji)) throw Object.assign(new Error("Unsupported reaction."), { status: 400 });
  const { message, conversation } = await requireMessageAccess(user, messageId);
  if (message.deletedAt) throw Object.assign(new Error("Deleted messages cannot be reacted to."), { status: 409 });
  const existing = await MessageReaction.findOne({ messageId, emoji, userId: user._id });
  if (existing) await existing.deleteOne();
  else await MessageReaction.create({ messageId, conversationId: conversation._id, emoji, userId: user._id });
  const reactions = await MessageReaction.find({ messageId }).select("messageId emoji userId").lean();
  const payload = { messageId: String(messageId), reactions };
  emitMutation(conversation._id, "message_reaction_updated", payload);
  return payload;
}

export async function togglePin(user, messageId) {
  const { message, conversation } = await requireMessageAccess(user, messageId);
  if (message.deletedAt) throw Object.assign(new Error("Deleted messages cannot be pinned."), { status: 409 });
  if (conversation.type !== "direct" && !hasPermission(user, "messages.pin")) throw Object.assign(new Error("You cannot pin messages in this conversation."), { status: 403 });
  const existing = await MessagePin.findOne({ conversationId: conversation._id, messageId });
  if (existing) {
    await existing.deleteOne();
    const payload = { messageId: String(messageId), pinned: false };
    emitMutation(conversation._id, "message_unpinned", payload);
    return payload;
  }
  const pin = await MessagePin.create({ conversationId: conversation._id, messageId, pinnedBy: user._id });
  await AuditLog.create({ actor: user._id, action: "message.pinned", metadata: { messageId: message._id, conversationId: conversation._id } });
  const payload = { messageId: String(messageId), pinned: true, pin };
  emitMutation(conversation._id, "message_pinned", payload);
  return payload;
}

export async function getPinnedMessages(user, conversationId) {
  const conversation = await Conversation.findById(conversationId).lean();
  if (!canAccessConversation(user, conversation)) throw Object.assign(new Error("Conversation access denied."), { status: 403 });
  const pins = await MessagePin.find({ conversationId }).sort({ pinnedAt: -1 }).limit(30).lean();
  const messages = await Message.find({ _id: { $in: pins.map((pin) => pin.messageId) } }).populate("senderId", senderFields).lean();
  return pins.map((pin) => ({ ...pin, message: messages.find((message) => String(message._id) === String(pin.messageId)) || null }));
}

export async function searchMessages(user, query = {}) {
  const q = String(query.q || "").trim();
  if (q.length < 2) return [];
  const conversations = await Conversation.find(accessibleConversationFilter(user)).select("_id type name entityTitle").lean();
  let allowed = conversations;
  if (query.conversationId) allowed = allowed.filter((item) => String(item._id) === String(query.conversationId));
  if (query.channel) allowed = allowed.filter((item) => item.type === "channel" && item.name === query.channel);
  const filter = { $text: { $search: q }, conversationId: { $in: allowed.map((item) => item._id) }, deletedAt: null };
  if (query.senderId && mongoose.isValidObjectId(query.senderId)) filter.senderId = query.senderId;
  if (query.dateFrom || query.dateTo) filter.createdAt = { ...(query.dateFrom && { $gte: new Date(query.dateFrom) }), ...(query.dateTo && { $lte: new Date(`${query.dateTo}T23:59:59.999Z`) }) };
  const messages = await Message.find(filter, { score: { $meta: "textScore" } }).populate("senderId", senderFields).sort({ score: { $meta: "textScore" }, createdAt: -1 }).limit(50).lean();
  const conversationMap = new Map(conversations.map((item) => [String(item._id), item]));
  return messages.map((message) => ({ ...message, conversation: conversationMap.get(String(message.conversationId)), excerpt: message.content.slice(0, 240) }));
}

export async function getMessageContext(user, messageId) {
  const { message, conversation } = await requireMessageAccess(user, messageId);
  const [before, after] = await Promise.all([
    Message.find({ conversationId: conversation._id, _id: { $lt: message._id } }).sort({ _id: -1 }).limit(15).populate("senderId", senderFields).lean(),
    Message.find({ conversationId: conversation._id, _id: { $gt: message._id } }).sort({ _id: 1 }).limit(15).populate("senderId", senderFields).lean(),
  ]);
  const center = await populatedMessage(message._id);
  return { conversation, messages: await hydrateMessages([...before.reverse(), center, ...after]), targetMessageId: String(message._id) };
}
