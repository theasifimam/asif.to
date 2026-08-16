import {
  deleteMessage,
  editMessage,
  getConversationMembers,
  getMessageContext,
  getMessages,
  getOrCreateDirectConversation,
  getPinnedMessages,
  getUnreadSummary,
  listConversations,
  listTeamMembers,
  markConversationRead,
  searchMessages,
  sendMessage,
  togglePin,
  toggleReaction,
} from "../services/messaging.service.js";
import { getOrCreateContentDiscussion } from "../services/contentDiscussion.service.js";
import { logActivity } from "../services/activity.service.js";
import Conversation from "../models/Conversation.js";
import MessageAttachment from "../models/MessageAttachment.js";
import { canAccessConversation, canPostConversation } from "../services/messagingAccess.service.js";
import { getMessagingSocketServer } from "../services/messagingRealtime.service.js";
import { getPrivateMessageAttachmentPath, validateMessageAttachment } from "../middlewares/upload.middleware.js";
import fs from "fs";
import path from "path";

const handleError = (res, error, fallback) => {
  console.error("[MESSAGING]", error.message);
  res.status(error.status || 500).json({ success: false, message: error.status ? error.message : fallback });
};

export const conversations = async (req, res) => {
  try { res.json({ success: true, data: { conversations: await listConversations(req.user, req.query.search) } }); }
  catch (error) { handleError(res, error, "Unable to load conversations."); }
};

export const teamMembers = async (req, res) => {
  try { res.json({ success: true, data: { users: await listTeamMembers(req.user, req.query.search) } }); }
  catch (error) { handleError(res, error, "Unable to search team members."); }
};

export const createDirect = async (req, res) => {
  try { res.status(201).json({ success: true, data: { conversation: await getOrCreateDirectConversation(req.user, req.body.userId) } }); }
  catch (error) { handleError(res, error, "Unable to start the conversation."); }
};

export const messages = async (req, res) => {
  try { res.json({ success: true, data: await getMessages(req.user, req.params.id, req.query) }); }
  catch (error) { handleError(res, error, "Unable to load messages."); }
};

export const createMessage = async (req, res) => {
  try { res.status(201).json({ success: true, data: await sendMessage(req.user, req.params.id, req.body.content, req.body.clientId, { replyToMessageId: req.body.replyToMessageId, attachmentIds: req.body.attachmentIds }) }); }
  catch (error) { handleError(res, error, "Message could not be sent."); }
};

export const readConversation = async (req, res) => {
  try { res.json({ success: true, data: await markConversationRead(req.user, req.params.id) }); }
  catch (error) { handleError(res, error, "Unable to mark the conversation read."); }
};

export const unread = async (req, res) => {
  try { res.json({ success: true, data: await getUnreadSummary(req.user._id) }); }
  catch (error) { handleError(res, error, "Unable to load unread messages."); }
};

export const createDiscussion = async (req, res) => {
  try {
    const result = await getOrCreateContentDiscussion(req.user, req.body.entityType, req.body.entityId);
    if (result.created) await logActivity({ actor: req.user, action: "discussion.created", entityType: req.body.entityType, entityId: req.body.entityId, entityTitle: result.conversation.entityTitle, description: "started a discussion for", severity: "info", url: `/messages?conversation=${result.conversation._id}` });
    getMessagingSocketServer()?.to(`user:${req.user._id}`).emit("conversation_updated", { conversationId: String(result.conversation._id), created: result.created });
    res.status(result.created ? 201 : 200).json({ success: true, data: result });
  } catch (error) { handleError(res, error, "Unable to open the content discussion."); }
};

export const members = async (req, res) => { try { res.json({ success: true, data: { users: await getConversationMembers(req.user, req.params.id, req.query.search) } }); } catch (error) { handleError(res, error, "Unable to load conversation members."); } };
export const updateMessage = async (req, res) => { try { res.json({ success: true, data: { message: await editMessage(req.user, req.params.messageId, req.body.content) } }); } catch (error) { handleError(res, error, "Unable to edit the message."); } };
export const removeMessage = async (req, res) => { try { res.json({ success: true, data: { message: await deleteMessage(req.user, req.params.messageId, { ip: req.ip, userAgent: req.get("user-agent") }) } }); } catch (error) { handleError(res, error, "Unable to delete the message."); } };
export const reaction = async (req, res) => { try { res.json({ success: true, data: await toggleReaction(req.user, req.params.messageId, req.body.emoji) }); } catch (error) { handleError(res, error, "Unable to update the reaction."); } };
export const pin = async (req, res) => { try { res.json({ success: true, data: await togglePin(req.user, req.params.messageId) }); } catch (error) { handleError(res, error, "Unable to update the pin."); } };
export const pins = async (req, res) => { try { res.json({ success: true, data: { pins: await getPinnedMessages(req.user, req.params.id) } }); } catch (error) { handleError(res, error, "Unable to load pinned messages."); } };
export const search = async (req, res) => { try { res.json({ success: true, data: { results: await searchMessages(req.user, req.query) } }); } catch (error) { handleError(res, error, "Message search is unavailable."); } };
export const messageContext = async (req, res) => { try { res.json({ success: true, data: await getMessageContext(req.user, req.params.messageId) }); } catch (error) { handleError(res, error, "Unable to open this message."); } };

export const requireConversationPost = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id).lean();
    if (!canPostConversation(req.user, conversation)) return res.status(403).json({ success: false, message: "You cannot attach files to this conversation." });
    next();
  } catch (_error) { res.status(404).json({ success: false, message: "Conversation not found." }); }
};

export const uploadAttachments = async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ success: false, message: "Choose at least one file." });
    await Promise.all(files.map(validateMessageAttachment));
    const attachments = await MessageAttachment.insertMany(files.map((file) => ({ conversationId: req.params.id, uploadedBy: req.user._id, originalName: path.basename(file.originalname).replace(/[\x00-\x1f]/g, "").slice(0, 255), storageKey: file.filename, mimeType: file.mimetype, size: file.size })));
    res.status(201).json({ success: true, data: { attachments: attachments.map((file) => ({ _id: file._id, name: file.originalName, mimeType: file.mimeType, size: file.size, url: `/messaging/attachments/${file._id}` })) } });
  } catch (error) {
    await Promise.allSettled((req.files || []).map((file) => fs.promises.unlink(file.path)));
    handleError(res, Object.assign(error, { status: 400 }), "Attachment upload failed.");
  }
};

export const downloadAttachment = async (req, res) => {
  try {
    const attachment = await MessageAttachment.findById(req.params.attachmentId).lean();
    if (!attachment) return res.status(404).json({ success: false, message: "Attachment not found." });
    const conversation = await Conversation.findById(attachment.conversationId).lean();
    if (!canAccessConversation(req.user, conversation) || (!attachment.messageId && String(attachment.uploadedBy) !== String(req.user._id))) return res.status(403).json({ success: false, message: "Attachment access denied." });
    const filePath = getPrivateMessageAttachmentPath(attachment.storageKey);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: "Attachment file is unavailable." });
    res.set({ "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Type": attachment.mimeType, "Content-Disposition": `${attachment.mimeType.startsWith("image/") || attachment.mimeType === "application/pdf" ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(attachment.originalName)}` });
    res.sendFile(filePath);
  } catch (error) { handleError(res, error, "Unable to open the attachment."); }
};
