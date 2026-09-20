import crypto from "node:crypto";
import {
  getTransporter,
  getSupportTransporter,
  getSupportSender,
  getAuthenticatedSender,
} from "../smtp.provider.js";
import {
  EmailJob,
  CommunicationSettings,
  EmailSubscriber,
  EmailCampaign,
  CustomerMessage,
} from "../../models/Communication.js";
import { getStorageProvider } from "../storage/index.js";
import Asset from "../../models/Asset.js";
import {
  jobReplyAddress,
  emailAddress,
  escapeHtml,
  preferenceToken,
  replyAddress,
  marketingAllowed,
  fail,
} from "./policy.js";

export function formatEmailHtml(text = "") {
  if (!text) return "";
  let clean = text
    .replace(
      /^([=\-\s]*\n)+\s*asif\.to\s*\n\s*Engineering\s*[•·]\s*Systems\s*[•·]\s*Insights\s*\n+([=\-\s]*\n)+/gi,
      "",
    )
    .replace(/^[=\-]{5,}\s*$/gm, "---");

  const blocks = clean.split(/\n\s*\n/);
  return blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^(---|\*\*\*|___)$/.test(trimmed)) {
        return `<hr style="border:0;border-top:1px solid #e4e4e7;margin:24px 0;" />`;
      }
      let escaped = escapeHtml(trimmed);
      escaped = escaped.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" style="color:#2563eb;text-decoration:underline;" target="_blank" rel="noopener noreferrer">$1</a>',
      );
      if (/^(?:[•\-\*]\s+[^\n]+(?:\n|$))+/m.test(trimmed)) {
        const items = escaped
          .split("\n")
          .map((line) => line.replace(/^[•\-\*]\s*/, "").trim())
          .filter(Boolean);
        return `<ul style="margin:0 0 16px 0;padding-left:20px;line-height:1.7;color:#27272a">${items
          .map((i) => `<li style="margin-bottom:6px;">${i}</li>`)
          .join("")}</ul>`;
      }
      return `<p style="margin:0 0 16px 0;line-height:1.7;color:#27272a;white-space:pre-line;">${escaped}</p>`;
    })
    .filter(Boolean)
    .join("");
}

export function brandedEmail({
  text = "",
  stream = "TRANSACTIONAL",
  unsubscribeUrl = "",
}) {
  const siteUrl = (process.env.WEB_URL || "https://asif.to").replace(/\/$/, "");
  const logoUrl = process.env.EMAIL_LOGO_URL || `${siteUrl}/logo.png`;
  const content = formatEmailHtml(text);
  const unsubscribe =
    unsubscribeUrl && ["MARKETING", "JOBS"].includes(stream)
      ? `<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#71717a">You are receiving this because you subscribed to asif.to updates. <a href="${escapeHtml(unsubscribeUrl)}" style="color:#2563eb;text-decoration:underline;">Unsubscribe or manage preferences</a>.</p>`
      : "";
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head><body style="margin:0;padding:0;width:100% !important;background:#ffffff;color:#18181b;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%"><div style="width:100%;margin:0;padding:0;background:#ffffff"><div style="padding:24px 20px;background:linear-gradient(135deg,#eff6ff,#eef2ff);border-bottom:1px solid #dbeafe"><a href="${escapeHtml(siteUrl)}" style="text-decoration:none;color:#18181b"><img src="${escapeHtml(logoUrl)}" width="40" height="40" alt="asif.to" style="display:block;border-radius:12px;margin-bottom:12px" /><strong style="font-size:22px;letter-spacing:-.04em">asif<span style="color:#2563eb">.to</span></strong></a></div><div style="padding:32px 20px;font-size:15px;line-height:1.7;color:#18181b">${content}${unsubscribe}</div><div style="padding:24px 20px;background:#fafafa;border-top:1px solid #f4f4f5;color:#71717a;font-size:12px;line-height:1.6"><strong style="color:#3f3f46">asif.to</strong><br />Coding tutorials, courses and developer resources.<br /><a href="${escapeHtml(siteUrl)}" style="color:#2563eb;text-decoration:underline;">Visit asif.to</a> · <a href="${escapeHtml(siteUrl)}/contact" style="color:#2563eb;text-decoration:underline;">Contact support</a></div></div></body></html>`;
}

export async function settings() {
  return CommunicationSettings.findOneAndUpdate(
    { key: "default" },
    { $setOnInsert: { key: "default" } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
}
export const preferenceUrl = (id) =>
  `${(process.env.WEB_URL || "https://asif.to").replace(/\/$/, "")}/email-preferences?token=${preferenceToken(id)}`;
export async function queueEmail({
  key,
  recipient,
  stream,
  subject,
  text,
  conversation,
  customerMessage,
  campaign,
  subscriber,
  type,
  attachments = [],
  metadata = {},
  availableAt = new Date(),
}) {
  emailAddress(recipient);
  try {
    return await EmailJob.findOneAndUpdate(
      { key },
      {
        $setOnInsert: {
          key,
          recipient,
          stream,
          conversation,
          customerMessage,
          campaign,
          subscriber,
          type,
          metadata,
          availableAt,
          mail: {
            subject: String(subject)
              .replace(/[\r\n]/g, " ")
              .slice(0, 250),
            text: String(text).slice(0, 50000),
            attachments,
          },
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
    return EmailJob.findOne({ key });
  }
}

// Gradual migration: existing security/OTP sends remain immediate and never enter marketing suppression.
// Only metadata is logged for legacy transactional mail; OTPs and reset URLs are not retained.
export async function sendLegacyEmail(mail, { stream = "TRANSACTIONAL" } = {}) {
  let log;
  const recipient = typeof mail.to === "string" ? mail.to : mail.to?.address;
  if (EmailJob.db.readyState === 1) {
    try {
      log = await EmailJob.create({
        key: `legacy:${crypto.randomUUID()}`,
        recipient: recipient || "unknown",
        stream,
        type: "legacy",
        status: "SENDING",
        safeToRetry: false,
        metadata: { subject: mail.subject },
      });
    } catch (error) {
      console.error(
        "[COMMUNICATIONS] Could not record legacy email:",
        error.message,
      );
    }
  }
  try {
    const result = await (
      stream === "SUPPORT" ? getSupportTransporter() : getTransporter()
    ).sendMail({
      ...mail,
      from: stream === "SUPPORT" ? mail.from : getAuthenticatedSender(),
      html: mail.html || brandedEmail({ text: mail.text, stream }),
    });
    if (log)
      await EmailJob.updateOne(
        { _id: log._id },
        {
          $set: {
            status: result.accepted?.length ? "SENT" : "FAILED",
            messageId: result.messageId,
            sentAt: new Date(),
          },
        },
      ).catch(() => {});
    return result;
  } catch (error) {
    if (log)
      await EmailJob.updateOne(
        { _id: log._id },
        {
          $set: {
            status: "FAILED",
            error: "SMTP delivery failed. Inspect provider logs.",
          },
        },
      ).catch(() => {});
    throw error;
  }
}

export async function deliverJob(job, config, provider) {
  const marketing = ["MARKETING", "JOBS"].includes(job.stream);
  const subscriber = marketing
    ? await EmailSubscriber.findOne({ email: job.recipient })
    : null;
  const campaign = job.campaign
    ? await EmailCampaign.findById(job.campaign)
    : null;
  if (marketing && !marketingAllowed(subscriber, campaign?.topics || []))
    return "SUPPRESSED";
  if (campaign && ["PAUSED", "CANCELLED"].includes(campaign.status))
    return campaign.status === "CANCELLED" ? "CANCELLED" : "QUEUED";
  if (job.metadata?.expiresAt && new Date(job.metadata.expiresAt) < new Date())
    return "SUPPRESSED";
  // Zoho only permits the authenticated mailbox (or explicitly configured aliases)
  // in the MAIL FROM envelope. Transactional/test mail previously used the
  // database default support@asif.to while authenticating as EMAIL_USER, which
  // results in `553 Sender is not allowed to relay emails`.
  const sender = job.stream === "SUPPORT"
    ? getSupportSender(config.senders.SUPPORT)
    : job.stream === "TRANSACTIONAL"
      ? getAuthenticatedSender()
      : {
          name: "asif.to",
          address: emailAddress(config.senders[job.stream]),
        };
  const from = sender.address;
  let text = job.mail.text;
  const headers = {};
  // Hoist url so it is in scope for the sendMail call below regardless of stream type.
  let url = "";
  if (marketing) {
    url = preferenceUrl(subscriber._id);
    text += `\n\n${config.footer}\nEmail preferences / unsubscribe: ${url}`;
    const apiUrl = (
      process.env.PUBLIC_API_URL || "https://api.asif.to/api/v1"
    ).replace(/\/$/, "");
    headers["List-Unsubscribe"] =
      `<${apiUrl}/communications/public/unsubscribe?token=${preferenceToken(subscriber._id)}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
  const attachments = [];
  for (const id of job.mail.attachments || []) {
    const asset = await Asset.findOne({
      accessScope: "communications",
      _id: id,
      status: "active",
    });
    if (!asset || asset.size > 10 * 1024 * 1024)
      fail("Attachment is no longer available.");
    attachments.push({
      filename: asset.originalName,
      path: getStorageProvider().getAbsolutePath(asset.storageKey),
      contentType: asset.mimeType,
    });
  }
  const messageId = `<${job._id}@${process.env.COMMUNICATIONS_MESSAGE_DOMAIN || "asif.to"}>`;
  const prior = job.conversation
    ? await CustomerMessage.find({
        conversation: job.conversation,
        messageId: { $exists: true, $ne: "" },
      })
        .sort({ createdAt: -1 })
        .limit(20)
    : [];
  const references = prior.reverse().map((item) => item.messageId);
  const replyTo = job.conversation
    ? replyAddress(job.conversation, config.replyDomain)
    : marketing
      ? jobReplyAddress(job._id, config.replyDomain)
      : from;
  const transport = (
    provider ||
    (job.stream === "SUPPORT" ? getSupportTransporter : getTransporter)
  )();
  await EmailJob.updateOne(
    { _id: job._id },
    { $set: { transmitting: true, messageId } },
  );
  const result = await transport.sendMail({
    from: sender,
    to: { address: job.recipient },
    replyTo,
    subject: job.mail.subject,
    text,
    html: brandedEmail({
      text,
      stream: job.stream,
      unsubscribeUrl: marketing ? url : "",
    }),
    messageId,
    headers,
    attachments,
    ...(references.length ? { inReplyTo: references.at(-1), references } : {}),
  });
  if (!result.accepted?.length)
    fail("Recipient was rejected by the email server.", 502);
  return "SENT";
}
