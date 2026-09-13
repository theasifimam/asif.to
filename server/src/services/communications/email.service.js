import crypto from "node:crypto";
import { getTransporter, getSupportTransporter, getSupportSender } from "../smtp.provider.js";
import { EmailJob, CommunicationSettings, EmailSubscriber, EmailCampaign, CustomerMessage } from "../../models/Communication.js";
import { getStorageProvider } from "../storage/index.js";
import Asset from "../../models/Asset.js";
import { jobReplyAddress, emailAddress, escapeHtml, preferenceToken, replyAddress, marketingAllowed, fail } from "./policy.js";

export async function settings() {
  return CommunicationSettings.findOneAndUpdate({ key: "default" }, { $setOnInsert: { key: "default" } }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true });
}
export const preferenceUrl = (id) => `${(process.env.WEB_URL || "https://asif.to").replace(/\/$/, "")}/email-preferences?token=${preferenceToken(id)}`;
export async function queueEmail({ key, recipient, stream, subject, text, conversation, customerMessage, campaign, subscriber, type, attachments = [], metadata = {}, availableAt = new Date() }) {
  emailAddress(recipient);
  try { return await EmailJob.findOneAndUpdate({ key }, { $setOnInsert: {
    key, recipient, stream, conversation, customerMessage, campaign, subscriber, type, metadata, availableAt,
    mail: { subject: String(subject).replace(/[\r\n]/g, " ").slice(0, 250), text: String(text).slice(0, 50000), attachments },
  } }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true });
  } catch (error) { if (error.code !== 11000) throw error; return EmailJob.findOne({ key }); }
}

// Gradual migration: existing security/OTP sends remain immediate and never enter marketing suppression.
// Only metadata is logged for legacy transactional mail; OTPs and reset URLs are not retained.
export async function sendLegacyEmail(mail, { stream = "TRANSACTIONAL" } = {}) {
  let log;
  const recipient = typeof mail.to === "string" ? mail.to : mail.to?.address;
  if (EmailJob.db.readyState === 1) {
    try { log = await EmailJob.create({ key: `legacy:${crypto.randomUUID()}`, recipient: recipient || "unknown", stream, type: "legacy", status: "SENDING", safeToRetry: false, metadata: { subject: mail.subject } }); }
    catch (error) { console.error("[COMMUNICATIONS] Could not record legacy email:", error.message); }
  }
  try {
    const result = await (stream === "SUPPORT" ? getSupportTransporter() : getTransporter()).sendMail(mail);
    if (log) await EmailJob.updateOne({ _id: log._id }, { $set: { status: result.accepted?.length ? "SENT" : "FAILED", messageId: result.messageId, sentAt: new Date() } }).catch(() => {});
    return result;
  } catch (error) {
    if (log) await EmailJob.updateOne({ _id: log._id }, { $set: { status: "FAILED", error: "SMTP delivery failed. Inspect provider logs." } }).catch(() => {});
    throw error;
  }
}

export async function deliverJob(job, config, provider) {
  const marketing = ["MARKETING", "JOBS"].includes(job.stream);
  const subscriber = marketing ? await EmailSubscriber.findOne({ email: job.recipient }) : null;
  const campaign = job.campaign ? await EmailCampaign.findById(job.campaign) : null;
  if (marketing && !marketingAllowed(subscriber, campaign?.topics || [])) return "SUPPRESSED";
  if (campaign && ["PAUSED", "CANCELLED"].includes(campaign.status)) return campaign.status === "CANCELLED" ? "CANCELLED" : "QUEUED";
  if (job.metadata?.expiresAt && new Date(job.metadata.expiresAt) < new Date()) return "SUPPRESSED";
  const sender = job.stream === "SUPPORT" ? getSupportSender(config.senders.SUPPORT) : { name: "asif.to", address: emailAddress(config.senders[job.stream]) };
  const from = sender.address;
  let text = job.mail.text;
  const headers = {};
  if (marketing) {
    const url = preferenceUrl(subscriber._id);
    text += `\n\n${config.footer}\nEmail preferences / unsubscribe: ${url}`;
    const apiUrl = (process.env.PUBLIC_API_URL || "https://api.asif.to/api/v1").replace(/\/$/, "");
    headers["List-Unsubscribe"] = `<${apiUrl}/communications/public/unsubscribe?token=${preferenceToken(subscriber._id)}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
  const attachments = [];
  for (const id of job.mail.attachments || []) {
    const asset = await Asset.findOne({ accessScope: "communications", _id: id, status: "active" });
    if (!asset || asset.size > 10 * 1024 * 1024) fail("Attachment is no longer available.");
    attachments.push({ filename: asset.originalName, path: getStorageProvider().getAbsolutePath(asset.storageKey), contentType: asset.mimeType });
  }
  const messageId = `<${job._id}@${process.env.COMMUNICATIONS_MESSAGE_DOMAIN || "asif.to"}>`;
  const prior = job.conversation ? await CustomerMessage.find({ conversation: job.conversation, messageId: { $exists: true, $ne: "" } }).sort({ createdAt: -1 }).limit(20) : [];
  const references = prior.reverse().map(item => item.messageId);
  const replyTo = job.conversation ? replyAddress(job.conversation, config.replyDomain) : marketing ? jobReplyAddress(job._id, config.replyDomain) : from;
  const transport = (provider || (job.stream === "SUPPORT" ? getSupportTransporter : getTransporter))();
  await EmailJob.updateOne({ _id: job._id }, { $set: { transmitting: true, messageId } });
  const result = await transport.sendMail({
    from: sender, to: { address: job.recipient },
    replyTo,
    subject: job.mail.subject, text, html: `<div style="white-space:pre-wrap;font-family:Arial,sans-serif;line-height:1.6">${escapeHtml(text)}</div>`,
    messageId, headers, attachments,
    ...(references.length ? { inReplyTo: references.at(-1), references } : {}),
  });
  if (!result.accepted?.length) fail("Recipient was rejected by the email server.", 502);
  return "SENT";
}
