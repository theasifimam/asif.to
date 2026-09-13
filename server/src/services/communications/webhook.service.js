import ContactMessage from "../../models/ContactMessage.js";
import { EmailWebhookEvent, EmailJob, EmailSubscriber, CustomerMessage, CommunicationSettings } from "../../models/Communication.js";
import { settings } from "./email.service.js";
import { emailAddress, resolveReplyAddress, resolveJobReplyAddress, fail } from "./policy.js";
import { ensureConversation, addCustomerMessage, broadcastInbox } from "./inbox.service.js";
import { emitAutomation } from "./worker.service.js";
import { createAssetFromUpload } from "../asset.service.js";

export async function ingestWebhook(payload) {
  if (!payload.id || typeof payload.id !== "string" || payload.id.length > 250) fail("A stable provider event ID is required.");
  const key = `webhook:${payload.id}`;
  let event;
  try { event = await EmailWebhookEvent.findOneAndUpdate({ key }, { $setOnInsert: { kind: payload.kind, payload } }, { upsert: true, returnDocument: 'after' }); }
  catch (error) { if (error.code !== 11000) throw error; event = await EmailWebhookEvent.findOne({ key }); }
  if (event.status === "DONE") return { duplicate: true };
  // A unique message key and idempotent status updates also protect overlapping retries.
  const config = await settings();
  try {
    if (payload.kind === "inbound") {
      const from = emailAddress(payload.from), to = emailAddress(payload.to);
      if (payload.authenticatedSender !== true) fail("Inbound relay must authenticate the sender.", 403);
      const id = resolveReplyAddress(to, config.replyDomain);
      const originId = resolveJobReplyAddress(to, config.replyDomain);
      const originJob = originId ? await EmailJob.findById(originId) : null;
      if (originId && (!originJob || originJob.recipient !== from)) fail("Unknown email reply recipient.", 403);
      let contact = id ? await ContactMessage.findById(id) : null;
      if (!contact && originJob) contact = await ContactMessage.findOne({ inboundKey: `emailjob:${originJob._id}` });
      if (!contact && !originJob && !config.inboundAddresses.includes(to)) fail("Unknown reply address.", 404);
      if (contact && contact.email.toLowerCase() !== from) fail("Sender does not belong to this conversation.", 403);
      if (typeof payload.text !== "string" || !payload.text.trim() || payload.text.length > 50000) fail("A plain-text email body is required (maximum 50,000 characters).");
      if (typeof payload.messageId !== "string" || payload.messageId.length > 500 || !/^<[^<>\s]+>$/.test(payload.messageId)) fail("A valid Message-ID is required.");
      if (!Array.isArray(payload.references || []) || (payload.references || []).some(value => typeof value !== "string" || value.length > 500 || /[\r\n]/.test(value))) fail("Invalid References header.");
      if (!contact) {
        contact = await ContactMessage.findOneAndUpdate({ inboundKey: originJob ? `emailjob:${originJob._id}` : key }, { $setOnInsert: { name: String(payload.name || from).slice(0, 180), email: from,
          subject: String(payload.subject || "Email enquiry").replace(/[\r\n]/g, " ").slice(0, 250), message: payload.text, originEmailJob: originJob?._id, source: originJob ? ({ article_announcement: "ARTICLE_REPLY", course_announcement: "COURSE_REPLY", job_announcement: "JOB_REPLY", job_alert: "JOB_REPLY" }[originJob.type] || "CAMPAIGN_REPLY") : "DIRECT_EMAIL" } }, { upsert: true, returnDocument: 'after' });
        contact = await ensureConversation(contact);
      }
      const messageKey = `inbound:${contact._id}:${payload.messageId}`;
      const existing = await CustomerMessage.findOne({ key: messageKey });
      const attachments = [];
      if (!existing) {
        if ((payload.attachments || []).length > 4) fail("Too many attachments.");
        for (const file of payload.attachments || []) {
          const buffer = Buffer.from(String(file.content || ""), "base64");
          if (buffer.length > 10 * 1024 * 1024) fail("Attachment too large.");
          const result = await createAssetFromUpload({ file: { buffer, originalname: String(file.name || "attachment"), mimetype: file.contentType, size: buffer.length }, visibility: "private", accessScope: "communications", duplicateStrategy: "upload-anyway" });
          attachments.push(result.asset._id);
        }
      }
        await addCustomerMessage(contact, { key: messageKey, text: payload.text, email: from, messageId: payload.messageId,
          inReplyTo: String(payload.inReplyTo || "").slice(0, 500), references: (payload.references || []).slice(0, 30), attachments });
        await emitAutomation("CUSTOMER_REPLIED", { conversation: contact._id, email: from, firstName: contact.name }, messageKey);
    } else if (payload.kind === "delivery") {
      const allowed = ["DELIVERED", "FAILED", "BOUNCED", "COMPLAINED", "OPENED", "CLICKED", "UNSUBSCRIBED"];
      if (!allowed.includes(payload.event)) fail("Unsupported delivery event.");
      const job = await EmailJob.findOne({ messageId: payload.messageId });
      if (!job) fail("Email job not found. Retry after its SMTP record is available.", 409);
      const changes = {};
      if (payload.event === "OPENED") changes.openedAt = job.openedAt || new Date();
      else if (payload.event === "CLICKED") changes.clickedAt = job.clickedAt || new Date();
      else if (payload.event !== "UNSUBSCRIBED" && !["BOUNCED", "COMPLAINED", "SUPPRESSED"].includes(job.status)) {
        if (payload.event !== "FAILED" || !["DELIVERED", "BOUNCED", "COMPLAINED"].includes(job.status)) changes.status = payload.event;
        if (payload.event === "DELIVERED") changes.deliveredAt = new Date();
      }
      if (payload.event === "COMPLAINED") changes.status = "COMPLAINED";
      if (Object.keys(changes).length) await EmailJob.updateOne({ _id: job._id }, { $set: changes });
      if (["BOUNCED", "COMPLAINED", "UNSUBSCRIBED"].includes(payload.event) && (payload.event !== "BOUNCED" || payload.hardBounce === true)) {
        const status = payload.event === "UNSUBSCRIBED" ? "UNSUBSCRIBED" : payload.event;
        await EmailSubscriber.findOneAndUpdate({ email: job.recipient }, { $set: { status, ...(status !== "UNSUBSCRIBED" ? { marketingSuppressed: true, suppressionReason: payload.event } : {}), ...(status === "UNSUBSCRIBED" ? { unsubscribedAt: new Date() } : {}) } }, { upsert: true });
        await EmailJob.updateMany({ recipient: job.recipient, stream: { $in: ["MARKETING", "JOBS"] }, status: "QUEUED" }, { $set: { status: "SUPPRESSED" } });
      }
      if (job.customerMessage && changes.status) {
        await CustomerMessage.updateOne({ _id: job.customerMessage }, { $set: { deliveryStatus: changes.status } });
        await broadcastInbox(job.conversation);
      }
    } else fail("Unsupported webhook kind.");
    await EmailWebhookEvent.updateOne({ _id: event._id }, { $set: { status: "DONE" }, $unset: { payload: 1, error: 1 } });
    await CommunicationSettings.updateOne({ key: "default" }, { $set: { lastWebhookAt: new Date() } });
    return { accepted: true };
  } catch (error) {
    await EmailWebhookEvent.updateOne({ _id: event._id }, { $set: { status: "FAILED", error: error.message } });
    throw error;
  }
}
