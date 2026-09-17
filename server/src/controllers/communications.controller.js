import { getSupportSender } from "../services/smtp.provider.js";
import mongoose from "mongoose";
import ContactMessage from "../models/ContactMessage.js";
import { CustomerMessage, EmailSubscriber, EmailTemplate, EmailCampaign, EmailJob, CommunicationSettings, EmailAutomation, EmailWebhookEvent, AutomationRun, INBOX_STATUSES, AUTOMATION_ACTIONS, AUTOMATION_TRIGGERS } from "../models/Communication.js";
import { hasPermission } from "../utils/permissions.js";
import { settings, queueEmail, preferenceUrl } from "../services/communications/email.service.js";
import { ensureConversation, addAdminMessage, inboxUsers, shareEnquiry, attachContent, notifyInbox } from "../services/communications/inbox.service.js";
import { emitAutomation } from "../services/communications/worker.service.js";
import { emailAddress, fail, renderTemplate, verifyPreferenceToken, verifyWebhook } from "../services/communications/policy.js";
import { ingestWebhook } from "../services/communications/webhook.service.js";
import { listConversations } from "../services/messaging.service.js";
import Article from "../models/Article.js";
import Course from "../models/Course.js";
import Job from "../models/Job.js";
import { resolveContentEntity } from "../services/contentDiscussion.service.js";
import { createAssetFromUpload } from "../services/asset.service.js";
import Asset from "../models/Asset.js";
import { getStorageProvider } from "../services/storage/index.js";
import JobAlert from "../models/JobAlert.js";
import User from "../models/User.js";
import { sendManualJobAlertDigest, unsentJobsForAlert } from "../services/jobs/jobAlert.service.js";

export const action = (fn) => async (req, res) => {
  try { const data = await fn(req, res); if (!res.headersSent) res.json({ success: true, data }); }
  catch (error) { console.error("[COMMUNICATIONS]", error.message); if (!res.headersSent) res.status(error.status || (error.name === "ValidationError" || error.name === "CastError" ? 400 : 500)).json({ success: false, message: error.status || error.name === "ValidationError" ? error.message : "Communication request could not be completed." }); }
};
const id = (value) => { if (!mongoose.isValidObjectId(value)) fail("Invalid identifier."); return value; };
const text = (value, max = 20000) => { if (typeof value !== "string" || !value.trim() || value.length > max) fail(`Enter text between 1 and ${max} characters.`); return value.trim(); };
const regex = (value) => new RegExp(String(value || "").slice(0, 150).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
const page = (req) => ({ limit: Math.min(100, Math.max(1, Number(req.query.limit) || 30)), skip: Math.max(0, (Number(req.query.page) || 1) - 1) * Math.min(100, Math.max(1, Number(req.query.limit) || 30)) });
const contactFor = async (req) => { const doc = await ContactMessage.findById(id(req.params.id)); if (!doc) fail("Enquiry not found.", 404); return ensureConversation(doc); };
const topicsFor = async (values) => { if (!Array.isArray(values)) fail("Choose subscription topics."); const config = await settings(); if (values.some(value => typeof value !== "string" || !config.topics.includes(value))) fail("Some selected topics are no longer available. Choose your audience again."); return [...new Set(values)]; };

export const listInbox = action(async req => {
  const query = {};
  if (req.query.status) query.conversationStatus = req.query.status;
  if (req.query.assignedTo === "me") query.assignedTo = req.user._id;
  if (req.query.unread === "true") query.unreadCount = { $gt: 0 };
  if (req.query.search) query.$or = ["name", "email", "subject", "conversationNumber", "tags"].map(key => ({ [key]: regex(req.query.search) }));
  const { skip, limit } = page(req);
  const records = await ContactMessage.find(query).sort({ lastMessageAt: -1 }).skip(skip).limit(limit);
  const items = await Promise.all(records.map(ensureConversation));
  return { items, total: await ContactMessage.countDocuments(query), unread: await ContactMessage.countDocuments({ unreadCount: { $gt: 0 } }) };
});
export const getInbox = action(async req => {
  const conversation = await contactFor(req);
  const before = req.query.before ? { _id: { $lt: id(req.query.before) } } : {};
  const messages = await CustomerMessage.find({ conversation: conversation._id, ...before }).populate("sender", "fullName username avatar").populate({ path: "attachments", select: "name originalName mimeType size", match: { accessScope: "communications" } }).sort({ _id: -1 }).limit(101).lean();
  const hasMore = messages.length > 100; if (hasMore) messages.pop();
  return { conversation, messages: messages.reverse(), hasMore, nextCursor: hasMore ? messages[0]._id : null };
});
export const markInboxRead = action(async req => {
  await CustomerMessage.updateMany({ conversation: id(req.params.id), direction: "CUSTOMER", readAt: null }, { $set: { readAt: new Date() } });
  const unreadCount = await CustomerMessage.countDocuments({ conversation: req.params.id, direction: "CUSTOMER", readAt: null });
  return ContactMessage.findByIdAndUpdate(req.params.id, { $set: { unreadCount, status: unreadCount ? "unread" : "read" } }, { returnDocument: 'after' });
});
export const replyInbox = action(async req => addAdminMessage(req.user, await contactFor(req), req.body));
export const updateInbox = action(async req => {
  const contact = await contactFor(req), update = {};
  if (Object.keys(req.body).some(key => key !== "assignedTo") && !hasPermission(req.user, "communications.inbox.reply")) fail("Inbox reply permission required.", 403);
  if (req.body.assignedTo !== undefined) {
    if (!hasPermission(req.user, "communications.inbox.assign")) fail("Assignment permission required.", 403);
    if (req.body.assignedTo && !(await inboxUsers()).some(user => String(user._id) === req.body.assignedTo)) fail("Choose an active team member with inbox access.");
    update.assignedTo = req.body.assignedTo || null;
  }
  if (req.body.status) { if (!INBOX_STATUSES.includes(req.body.status)) fail("Invalid status."); update.conversationStatus = req.body.status; update.resolvedAt = ["RESOLVED", "CLOSED"].includes(req.body.status) ? new Date() : null; }
  if (req.body.priority) { if (!["LOW", "NORMAL", "HIGH", "URGENT"].includes(req.body.priority)) fail("Invalid priority."); update.priority = req.body.priority; }
  if (req.body.tags) update.tags = req.body.tags.slice(0, 20).map(tag => String(tag).slice(0, 60));
  if (req.body.category) update.category = text(req.body.category, 100);
  if (req.body.relatedContent !== undefined) await attachContent(req.user, contact, req.body.relatedContent);
  const result = await ContactMessage.findByIdAndUpdate(contact._id, { $set: update }, { returnDocument: 'after', runValidators: true });
  await notifyInbox(result, "Enquiry updated", req.user._id, result.assignedTo ? [result.assignedTo] : []).catch(() => {});
  return result;
});
export const shareInbox = action(async req => shareEnquiry(req.user, await contactFor(req), id(req.body.conversationId), text(req.body.requestId, 100)));
export const assignableUsers = action(() => inboxUsers());
export const inboxAttachments = action(async req => {
  await contactFor(req);
  if (!req.files?.length) fail("Select an attachment.");
  const assets = [];
  for (const file of req.files) assets.push((await createAssetFromUpload({ file, uploadedBy: req.user._id, visibility: "private", accessScope: "communications", duplicateStrategy: "upload-anyway" })).asset);
  return assets;
});
export const downloadInboxAttachment = action(async (req, res) => {
  const message = await CustomerMessage.findOne({ attachments: id(req.params.assetId) });
  if (!message) fail("Attachment not found.", 404);
  const asset = await Asset.findOne({ accessScope: "communications", _id: req.params.assetId, status: "active" });
  if (!asset) fail("Attachment not found.", 404);
  res.set("X-Content-Type-Options", "nosniff");
  await new Promise((resolve, reject) => res.download(getStorageProvider().getAbsolutePath(asset.storageKey), asset.originalName, error => error ? reject(error) : resolve()));
});

export const listSubscribers = action(async req => {
  const alertUsers = await JobAlert.distinct("user", { active: true });
  const users = await User.find({ _id: { $in: alertUsers }, status: "active" }).select("_id email fullName").lean();
  await Promise.all(users.filter(user => user.email).map(user => EmailSubscriber.findOneAndUpdate(
    { email: user.email },
    { $set: { user: user._id }, $setOnInsert: {
      firstName: user.fullName?.split(" ")[0] || "",
      status: "ACTIVE",
      topics: ["Job Alerts"],
      source: "job_alert",
      verifiedAt: new Date(),
      consentAt: new Date(),
    } },
    { upsert: true, setDefaultsOnInsert: true },
  )));
  const query = { ...(req.query.id ? { _id: id(req.query.id) } : {}), ...(req.query.status ? { status: req.query.status } : {}), ...(req.query.topic ? { topics: req.query.topic } : {}), ...(req.query.search ? { email: regex(req.query.search) } : {}) };
  const { skip, limit } = page(req);
  const config = await settings();
  return {
    items: await EmailSubscriber.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    total: await EmailSubscriber.countDocuments(query),
    jobAlertDigest: {
      enabled: config.jobAlertDigestEnabled,
      hour: config.jobAlertDigestHour,
      minute: config.jobAlertDigestMinute,
      timezone: config.jobAlertDigestTimezone,
    },
  };
});
export const saveJobAlertDigestSettings = action(async req => {
  const hour = Number(req.body.hour), minute = Number(req.body.minute);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) fail("Choose a valid digest time.");
  const config = await CommunicationSettings.findOneAndUpdate({ key: "default" }, { $set: {
    jobAlertDigestEnabled: req.body.enabled !== false,
    jobAlertDigestHour: hour,
    jobAlertDigestMinute: minute,
  } }, { returnDocument: "after", upsert: true, runValidators: true });
  return { enabled: config.jobAlertDigestEnabled, hour: config.jobAlertDigestHour, minute: config.jobAlertDigestMinute, timezone: config.jobAlertDigestTimezone };
});
export const listSubscriberJobAlerts = action(async req => {
  const subscriber = await EmailSubscriber.findById(id(req.params.id)).lean(); if (!subscriber) fail("Subscriber not found.", 404);
  const user = subscriber.user
    ? await User.findOne({ _id: subscriber.user, status: "active" }).select("_id").lean()
    : await User.findOne({ email: subscriber.email, status: "active" }).select("_id").lean();
  if (!user) return { alerts: [] };
  const alerts = await JobAlert.find({ user: user._id, active: true }).sort({ createdAt: -1 }).lean();
  return { alerts: await Promise.all(alerts.map(async alert => ({ alert, jobs: await unsentJobsForAlert(alert) }))) };
});
export const sendSubscriberJobAlerts = action(async req => {
  const subscriber = await EmailSubscriber.findById(id(req.params.id)).lean(); if (!subscriber) fail("Subscriber not found.", 404);
  if (["SUPPRESSED", "BOUNCED", "COMPLAINED"].includes(subscriber.status) || subscriber.marketingSuppressed) fail("This subscriber is not eligible for email.", 409);
  const user = subscriber.user
    ? await User.findOne({ _id: subscriber.user, status: "active" }).select("email fullName").lean()
    : await User.findOne({ email: subscriber.email, status: "active" }).select("email fullName").lean();
  if (!user) return { queued: 0 };
  const alerts = await JobAlert.find({ user: user._id, active: true }).lean(); let queued = 0;
  for (const alert of alerts) {
    const jobs = await unsentJobsForAlert(alert);
    if (jobs.length && await sendManualJobAlertDigest(alert, user, jobs)) queued += 1;
  }
  return { queued };
});
export const manageSubscriber = action(async req => {
  const subscriber = await EmailSubscriber.findById(id(req.params.id)); if (!subscriber) fail("Subscriber not found.", 404);
  // Suppression can never be cleared by a generic edit or campaign import.
  if (req.body.status && !["UNSUBSCRIBED", "SUPPRESSED"].includes(req.body.status)) fail("Only verified opt-in can activate a subscriber.");
  if (req.body.status) subscriber.status = req.body.status;
  if (req.body.status === "SUPPRESSED") { subscriber.marketingSuppressed = true; subscriber.suppressionReason = "MANUAL"; }
  if (req.body.topics) subscriber.topics = await topicsFor(req.body.topics);
  if (req.body.tags) subscriber.tags = req.body.tags.slice(0, 20).map(tag => String(tag).slice(0, 60));
  return subscriber.save();
});
export const publicTopics = action(async () => ({ topics: (await settings()).topics }));
export const subscribe = action(async req => {
  const email = emailAddress(req.body.email), topics = await topicsFor(req.body.topics);
  const existing = await EmailSubscriber.findOne({ email });
  if (existing && (existing.marketingSuppressed || ["BOUNCED", "COMPLAINED", "SUPPRESSED"].includes(existing.status))) return { message: "If eligible, a confirmation email will arrive shortly." };
  const subscriber = existing || await EmailSubscriber.create({ email, firstName: String(req.body.firstName || "").slice(0, 120), topics, source: "public_form" });
  // Existing active preferences are changed only with the signed preference token.
  if (subscriber.status !== "ACTIVE") { subscriber.topics = topics; subscriber.status = "PENDING"; await subscriber.save(); }
  await queueEmail({ key: `confirm:${subscriber._id}:${Math.floor(Date.now() / 3600000)}`, recipient: email, stream: "TRANSACTIONAL", type: "subscription_confirmation", subject: "Confirm your asif.to email preferences", text: `Confirm your subscription and choose your preferences:\n${preferenceUrl(subscriber._id)}` });
  return { message: "If eligible, a confirmation email will arrive shortly." };
});
export const getPreferences = action(async req => {
  const subscriber = await EmailSubscriber.findById(verifyPreferenceToken(req.query.token)); if (!subscriber) fail("Subscriber not found.", 404);
  return { email: subscriber.email, topics: subscriber.topics, status: subscriber.status, availableTopics: (await settings()).topics };
});
export const updatePreferences = action(async req => {
  const subscriber = await EmailSubscriber.findById(verifyPreferenceToken(req.body.token)); if (!subscriber) fail("Subscriber not found.", 404);
  if (req.body.unsubscribe) { subscriber.status = "UNSUBSCRIBED"; subscriber.unsubscribedAt = new Date(); }
  else {
    if (subscriber.marketingSuppressed || ["BOUNCED", "COMPLAINED", "SUPPRESSED"].includes(subscriber.status)) fail("This address is suppressed. Please contact support.", 409);
    subscriber.topics = await topicsFor(req.body.topics); subscriber.status = "ACTIVE"; subscriber.verifiedAt ||= new Date(); subscriber.consentAt = new Date();
  }
  await subscriber.save();
  if (!req.body.unsubscribe) await emitAutomation("SUBSCRIBED", { email: subscriber.email, firstName: subscriber.firstName }, `subscription:${subscriber._id}:${subscriber.consentAt?.getTime()}`);
  return { status: subscriber.status, topics: subscriber.topics };
});
export const unsubscribe = action(async req => {
  const subscriber = await EmailSubscriber.findByIdAndUpdate(verifyPreferenceToken(req.query.token), { $set: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() } }, { returnDocument: 'after' });
  if (!subscriber) fail("Subscriber not found.", 404);
  await EmailJob.updateMany({ recipient: subscriber.email, stream: { $in: ["MARKETING", "JOBS"] }, status: "QUEUED" }, { $set: { status: "SUPPRESSED" } });
  return { status: "UNSUBSCRIBED" };
});

export const listTemplates = action(async req => ({ items: await EmailTemplate.find(req.query.id ? { _id: id(req.query.id) } : req.query.search ? { name: regex(req.query.search) } : {}).sort({ updatedAt: -1 }).limit(100) }));
export const saveTemplate = action(async req => {
  const data = { name: text(req.body.name, 180), subject: text(req.body.subject, 250), text: text(req.body.text, 50000), category: req.body.category, updatedBy: req.user._id };
  renderTemplate(data.subject); renderTemplate(data.text);
  return req.params.id ? EmailTemplate.findByIdAndUpdate(id(req.params.id), { $set: data }, { returnDocument: 'after', runValidators: true }) : EmailTemplate.create(data);
});
export const previewTemplate = action(async req => ({ subject: renderTemplate(text(req.body.subject, 250), req.body.variables), text: renderTemplate(text(req.body.text, 50000), req.body.variables) }));
export const testEmail = action(async req => queueEmail({ key: `test:${req.user._id}:${text(req.body.requestId, 100)}`, recipient: req.user.email,
  stream: "TRANSACTIONAL", type: "admin_test", subject: `[TEST] ${renderTemplate(text(req.body.subject, 250), req.body.variables)}`, text: renderTemplate(text(req.body.text, 50000), req.body.variables) }));
export const listCampaigns = action(async req => ({ items: await EmailCampaign.find(req.query.id ? { _id: id(req.query.id) } : req.query.search ? { name: regex(req.query.search) } : {}).sort({ createdAt: -1 }).limit(100) }));
export const saveCampaign = action(async req => {
  const current = req.params.id ? await EmailCampaign.findById(id(req.params.id)) : null;
  if (req.params.id && !current) fail("Campaign not found.", 404);
  if (current && current.status !== "DRAFT") fail("Only drafts can be edited.", 409);
  const data = { name: text(req.body.name, 180), subject: text(req.body.subject, 250), text: text(req.body.text, 50000), topics: await topicsFor(req.body.topics || []), kind: String(req.body.kind || "newsletter").slice(0, 80), stream: req.body.stream === "JOBS" ? "JOBS" : "MARKETING", createdBy: req.user._id };
  renderTemplate(data.subject); renderTemplate(data.text);
  return current ? EmailCampaign.findOneAndUpdate({ _id: current._id, status: "DRAFT" }, { $set: data }, { returnDocument: 'after' }) : EmailCampaign.create(data);
});
export const campaignAction = action(async req => {
  const campaign = await EmailCampaign.findById(id(req.params.id)); if (!campaign) fail("Campaign not found.", 404);
  const operation = req.body.action;
  if (operation === "duplicate") {
    if (!hasPermission(req.user, "communications.campaigns.create")) fail("Campaign creation permission required.", 403);
    const { _id, createdAt, updatedAt, __v, ...data } = campaign.toObject();
    return EmailCampaign.create({ ...data, name: `${campaign.name} (copy)`, status: "DRAFT", audienceCursor: null, audienceAt: null, audienceComplete: false, scheduledAt: null, contentRef: undefined });
  }
  if (!hasPermission(req.user, "communications.campaigns.send")) fail("Campaign send permission required.", 403);
  const update = {};
  if (["send", "schedule"].includes(operation)) {
    if (campaign.status !== "DRAFT") fail("Only draft campaigns can be queued.", 409);
    const config = await settings();
    if (!config.footer.trim()) fail("Configure the campaign footer first.");
    preferenceUrl(new mongoose.Types.ObjectId()); // Fail before queuing if signing is not configured.
    if (operation === "schedule") {
      const scheduled = new Date(req.body.scheduledAt); if (!Number.isFinite(scheduled.getTime()) || scheduled <= new Date()) fail("Choose a future date.");
      update.status = "SCHEDULED"; update.scheduledAt = scheduled;
    } else { update.status = "QUEUED"; update.audienceAt = new Date(); }
  } else if (operation === "pause" && ["SENDING", "QUEUED", "SCHEDULED"].includes(campaign.status)) update.status = "PAUSED";
  else if (operation === "resume" && campaign.status === "PAUSED") { update.status = "QUEUED"; update.audienceAt = campaign.audienceAt || new Date(); }
  else if (operation === "cancel" && !["SENT", "CANCELLED"].includes(campaign.status)) update.status = "CANCELLED";
  else fail("This action is not available for the campaign.", 409);
  const updated = await EmailCampaign.findOneAndUpdate({ _id: campaign._id, status: campaign.status }, { $set: update }, { returnDocument: 'after' });
  if (update.status === "CANCELLED") await EmailJob.updateMany({ campaign: campaign._id, status: "QUEUED" }, { $set: { status: "CANCELLED" } });
  return updated;
});
export const audienceCount = action(async req => ({ count: await EmailSubscriber.countDocuments({ status: "ACTIVE", marketingSuppressed: { $ne: true }, verifiedAt: { $ne: null }, ...(req.body.topics?.length ? { topics: { $in: await topicsFor(req.body.topics) } } : {}) }) }));
export const notifyContent = action(async req => {
  const type = req.body.type, Model = { article: Article, course: Course, job: Job }[type];
  if (!Model) fail("Unsupported content type.");
  if (type !== "job") await resolveContentEntity(req.user, type, id(req.body.id));
  else if (!hasPermission(req.user, "jobs.view")) fail("Job access required.", 403);
  const content = await Model.findOne({ _id: id(req.body.id), status: "published" }); if (!content) fail("Publish the content before queuing notifications.");
  const template = await EmailTemplate.findById(id(req.body.template)); if (!template) fail("Template not found.", 404);
  preferenceUrl(new mongoose.Types.ObjectId());
  const contentRef = `${type}:${content._id}:${text(req.body.requestId, 100)}`;
  const existing = await EmailCampaign.findOne({ contentRef }); if (existing) return existing;
  const url = `${(process.env.WEB_URL || "https://asif.to").replace(/\/$/, "")}/${type === "article" ? "articles" : type === "course" ? "courses" : "jobs"}/${content.slug}`;
  return EmailCampaign.create({ name: `New ${type}: ${content.title}`, subject: template.subject, text: template.text, topics: await topicsFor(req.body.topics || []),
    kind: `${type}_announcement`, stream: type === "job" ? "JOBS" : "MARKETING", status: "QUEUED", audienceAt: new Date(), contentRef, createdBy: req.user._id,
    variables: { [`${type}Title`]: content.title, [`${type}Url`]: url } });
});

export const listTransactional = action(async req => {
  const query = { ...(req.query.status ? { status: req.query.status } : {}), ...(req.query.search ? { recipient: regex(req.query.search) } : {}), ...(req.query.campaign ? { campaign: id(req.query.campaign) } : { stream: { $nin: ["MARKETING", "JOBS"] } }) };
  return { items: await EmailJob.find(query).select("-mail.text -mail.html -mail.attachments").sort({ createdAt: -1 }).skip(page(req).skip).limit(page(req).limit), total: await EmailJob.countDocuments(query) };
});
export const retryEmail = action(async req => {
  const job = await EmailJob.findById(id(req.params.id));
  if (!job || job.status !== "FAILED" || !job.safeToRetry || !job.mail?.text || ["SECURITY", "TRANSACTIONAL"].includes(job.stream)) fail("This email cannot safely be retried. Regenerate security emails through their original flow.", 409);
  return EmailJob.findOneAndUpdate({ _id: job._id, status: "FAILED", safeToRetry: true }, { $set: { status: "QUEUED", availableAt: new Date(), attempts: 0, transmitting: false } }, { returnDocument: 'after' }).select("-mail");
});
export const listAutomations = action(async req => ({ items: await EmailAutomation.find(req.query.id ? { _id: id(req.query.id) } : {}).sort({ createdAt: -1 }).limit(100), runs: await AutomationRun.find().select("-context").sort({ updatedAt: -1 }).limit(30) }));
export const saveAutomation = action(async req => {
  if (!AUTOMATION_TRIGGERS.includes(req.body.trigger)) fail("Invalid automation trigger.");
  if (!Array.isArray(req.body.actions) || req.body.actions.length > 10 || !req.body.actions.length) fail("Choose 1 to 10 actions.");
  for (const item of req.body.actions) {
    if (req.body.trigger.endsWith("_PUBLISHED") && !["SEND_EMAIL", "WAIT", "NOTIFY_TEAM"].includes(item.type)) fail("Publishing automations support email, wait and team notifications.");
    if (item.type === "ASSIGN_CONVERSATION" && !(await inboxUsers()).some(user => String(user._id) === item.value)) fail("Choose an active admin with inbox access.");
    if (!AUTOMATION_ACTIONS.includes(item.type)) fail("Invalid action.");
    if (item.type === "WAIT" && (!Number.isFinite(item.minutes) || item.minutes < 1 || item.minutes > 43200)) fail("Wait must be between 1 minute and 30 days.");
    if (item.type === "CHANGE_STATUS" && !INBOX_STATUSES.includes(item.value)) fail("Invalid status action.");
    if (item.type === "SEND_EMAIL" && !await EmailTemplate.exists({ _id: id(item.template) })) fail("Choose an existing template.");
  }
  const data = { name: text(req.body.name, 180), trigger: req.body.trigger, actions: req.body.actions, enabled: req.body.enabled === true };
  return req.params.id ? EmailAutomation.findByIdAndUpdate(id(req.params.id), { $set: data }, { returnDocument: 'after', runValidators: true }) : EmailAutomation.create(data);
});
export const getSettings = action(async () => ({ settings: await settings(), health: {
  smtpConfigured: Boolean(process.env.EMAIL_HOST && process.env.EMAIL_SUPPORT_USER && process.env.EMAIL_SUPPORT_PASSWORD),
  accountSmtpConfigured: Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
  supportSender: getSupportSender().address, supportSenderManagedByEnvironment: Boolean(process.env.EMAIL_SUPPORT_FROM),
  adminNotifyConfigured: Boolean(process.env.ADMIN_NOTIFY_EMAIL),
  signedRepliesConfigured: Boolean(process.env.COMMUNICATIONS_SIGNING_SECRET?.length >= 32),
  webhookConfigured: Boolean(process.env.COMMUNICATIONS_WEBHOOK_SECRET?.length >= 32), workerEnabled: process.env.COMMUNICATIONS_WORKER_ENABLED === "true",
}, events: await EmailWebhookEvent.find().select("-payload").sort({ createdAt: -1 }).limit(20) }));
export const saveSettings = action(async req => {
  const data = {};
  if (req.body.topics) data.topics = [...new Set(req.body.topics.filter(value => typeof value === "string" && value.trim()).map(value => text(value, 80)))].slice(0, 100);
  if (req.body.senders) { data.senders = {}; for (const stream of ["SUPPORT", "MARKETING", "JOBS", "SECURITY", "TRANSACTIONAL"]) data.senders[stream] = emailAddress(req.body.senders[stream]); }
  if (req.body.replyDomain) { if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(req.body.replyDomain)) fail("Invalid reply domain."); data.replyDomain = req.body.replyDomain.toLowerCase(); }
  if (req.body.inboundAddresses) data.inboundAddresses = req.body.inboundAddresses.filter(value => String(value).trim()).map(emailAddress).slice(0, 10);
  if (req.body.footer !== undefined) data.footer = text(req.body.footer, 1500);
  if (req.body.ratePerMinute !== undefined) data.ratePerMinute = Number(req.body.ratePerMinute);
  return CommunicationSettings.findOneAndUpdate({ key: "default" }, { $set: data }, { returnDocument: 'after', upsert: true, runValidators: true });
});
export const analytics = action(async req => {
  const group = (Model, field, match = {}) => Model.aggregate([{ $match: match }, { $group: { _id: `$${field}`, count: { $sum: 1 } } }]);
  const [support, categories, subscribers, email, timing, topics] = await Promise.all([
    group(ContactMessage, "conversationStatus"), group(ContactMessage, "category"), group(EmailSubscriber, "status"), group(EmailJob, "status", req.query.campaign ? { campaign: new mongoose.Types.ObjectId(id(req.query.campaign)) } : {}),
    ContactMessage.aggregate([{ $group: { _id: null, averageResponseMs: { $avg: { $subtract: ["$firstResponseAt", "$createdAt"] } }, averageResolutionMs: { $avg: { $subtract: ["$resolvedAt", "$createdAt"] } } } }]),
    EmailSubscriber.aggregate([{ $match: { status: "ACTIVE" } }, { $unwind: "$topics" }, { $group: { _id: "$topics", count: { $sum: 1 } } }]),
  ]);
  const collaboration = hasPermission(req.user, "messages.view") ? await listConversations(req.user) : [];
  return { support, categories, subscribers, email, timing: timing[0] || {}, topics,
    tracking: { opened: await EmailJob.countDocuments({ ...(req.query.campaign ? { campaign: req.query.campaign } : {}), openedAt: { $ne: null } }), clicked: await EmailJob.countDocuments({ ...(req.query.campaign ? { campaign: req.query.campaign } : {}), clickedAt: { $ne: null } }) },
    collaboration: { unread: collaboration.reduce((sum, item) => sum + item.unreadCount, 0), discussions: collaboration.filter(item => item.type === "discussion").length } };
});
export const communicationsSearch = action(async req => {
  const term = regex(req.query.q), items = [];
  if (hasPermission(req.user, "communications.inbox.read")) for (const doc of await ContactMessage.find({ $or: [{ subject: term }, { email: term }, { conversationNumber: term }] }).limit(10)) items.push({ title: doc.subject, type: "Enquiry", url: `/communications/inbox?conversation=${doc._id}` });
  if (hasPermission(req.user, "communications.subscribers.read")) for (const doc of await EmailSubscriber.find({ email: term }).limit(10)) items.push({ title: doc.email, type: "Subscriber", url: `/communications/subscribers?search=${encodeURIComponent(doc.email)}` });
  if (hasPermission(req.user, "communications.campaigns.read")) for (const doc of await EmailCampaign.find({ name: term }).limit(10)) items.push({ title: doc.name, type: "Campaign", url: `/communications/campaigns/${doc._id}` });
  if (hasPermission(req.user, "communications.templates.manage")) for (const doc of await EmailTemplate.find({ name: term }).limit(10)) items.push({ title: doc.name, type: "Template", url: `/communications/templates/${doc._id}` });
  if (hasPermission(req.user, "messages.view")) for (const doc of await listConversations(req.user, req.query.q)) items.push({ title: doc.name || doc.members?.map(user => user.fullName).join(", "), type: doc.type, url: `/communications/team?conversation=${doc._id}` });
  return { items };
});
export const webhook = action(async req => { verifyWebhook(req.rawBody, req.headers["x-communications-timestamp"], req.headers["x-communications-signature"]); return ingestWebhook(req.body); });

