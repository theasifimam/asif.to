import { scanAutomationTriggers } from "./triggers.service.js";
import Notification from "../../models/Notification.js";
import { getMessagingSocketServer } from "../messagingRealtime.service.js";
import crypto from "node:crypto";
import { EmailJob, EmailCampaign, EmailSubscriber, CustomerMessage, CommunicationSettings, EmailAutomation, AutomationRun, EmailTemplate } from "../../models/Communication.js";
import ContactMessage from "../../models/ContactMessage.js";
import { queueEmail, deliverJob, settings, preferenceUrl } from "./email.service.js";
import { renderTemplate, marketingAllowed } from "./policy.js";
import { notifyInbox, inboxUsers, broadcastInbox } from "./inbox.service.js";

export async function emitAutomation(trigger, context, key) {
  const rules = await EmailAutomation.find({ trigger, enabled: true });
  for (const rule of rules) await AutomationRun.updateOne({ key: `${rule._id}:${key}` }, { $setOnInsert: { automation: rule._id, context, actions: rule.actions } }, { upsert: true });
}
export async function expandCampaign(campaign, batchSize = 100) {
  const query = { status: "ACTIVE", marketingSuppressed: { $ne: true }, verifiedAt: { $ne: null }, createdAt: { $lte: campaign.audienceAt },
    ...(campaign.topics.length ? { topics: { $in: campaign.topics } } : {}),
    ...(campaign.audienceCursor ? { _id: { $gt: campaign.audienceCursor } } : {}) };
  const batch = await EmailSubscriber.find(query).sort({ _id: 1 }).limit(batchSize);
  for (const subscriber of batch) {
    if (!marketingAllowed(subscriber, campaign.topics)) continue;
    const variables = { ...(campaign.variables || {}), firstName: subscriber.firstName, email: subscriber.email, unsubscribeUrl: preferenceUrl(subscriber._id) };
    await queueEmail({ key: `campaign:${campaign._id}:${subscriber._id}`, campaign: campaign._id, subscriber: subscriber._id,
      recipient: subscriber.email, stream: campaign.stream, subject: renderTemplate(campaign.subject, variables), text: renderTemplate(campaign.text, variables), type: campaign.kind });
  }
  await EmailCampaign.updateOne({ _id: campaign._id, status: { $in: ["QUEUED", "SENDING"] } }, { $set: {
    status: "SENDING", ...(batch.length ? { audienceCursor: batch.at(-1)._id } : {}), audienceComplete: batch.length < batchSize,
  } });
}
async function processAutomation(run) {
  const rule = await EmailAutomation.findById(run.automation);
  if (!rule?.enabled) { await AutomationRun.updateOne({ _id: run._id }, { $set: { status: "CANCELLED" } }); return; }
  const action = (run.actions?.length ? run.actions : rule.actions)[run.step];
  if (!action) { await AutomationRun.updateOne({ _id: run._id }, { $set: { status: "DONE" } }); return; }
  const contact = run.context.conversation ? await ContactMessage.findById(run.context.conversation) : null;
  const key = `${run.key}:${run.step}`;
  if (action.type === "SEND_EMAIL") {
    const template = await EmailTemplate.findById(action.template);
    if (!template) throw new Error("Automation template no longer exists.");
    const variables = { firstName: run.context.firstName, email: run.context.email, conversationNumber: contact?.conversationNumber, ...(run.context.variables || {}) };
    if (run.context.publication) {
      await EmailCampaign.updateOne({ contentRef: key }, { $setOnInsert: {
        name: rule.name, subject: template.subject, text: template.text, kind: "automation", stream: run.context.type === "job" ? "JOBS" : "MARKETING",
        topics: [], status: "QUEUED", audienceAt: new Date(), variables: run.context.variables,
      } }, { upsert: true });
    } else {
      await queueEmail({ key, recipient: run.context.email, stream: contact ? "SUPPORT" : "MARKETING", conversation: contact?._id,
        type: "automation", subject: renderTemplate(template.subject, variables), text: renderTemplate(template.text, variables) });
    }
  } else if (["CREATE_NOTIFICATION", "NOTIFY_TEAM"].includes(action.type)) {
    if (contact) await notifyInbox(contact, rule.name, null, contact.assignedTo ? [contact.assignedTo] : [], key);
    else {
      const recipients = action.type === "CREATE_NOTIFICATION" && run.context.userId ? [{ _id: run.context.userId }] : await inboxUsers();
      for (const recipient of recipients) {
        await Notification.updateOne({ communicationKey: `${key}:${recipient._id}` }, { $setOnInsert: { recipientId: recipient._id, title: rule.name, message: rule.name, type: "communications", url: "/communications/automations" } }, { upsert: true });
        getMessagingSocketServer()?.to(`user:${recipient._id}`).emit("notification_updated", { type: "communications" });
      }
    }
  } else if (action.type === "ADD_TAG") {
    if (contact) await ContactMessage.updateOne({ _id: contact._id }, { $addToSet: { tags: action.value } });
    else await EmailSubscriber.updateOne({ email: run.context.email }, { $addToSet: { tags: action.value } });
  } else if (action.type === "CHANGE_STATUS" && contact) {
    await ContactMessage.updateOne({ _id: contact._id }, { $set: { conversationStatus: action.value } }, { runValidators: true });
  } else if (action.type === "ASSIGN_CONVERSATION" && contact) {
    if (!(await inboxUsers()).some(user => String(user._id) === action.value)) throw new Error("Assignee no longer has inbox access.");
    await ContactMessage.updateOne({ _id: contact._id }, { $set: { assignedTo: action.value } });
  }
  await AutomationRun.updateOne({ _id: run._id }, { $inc: { step: 1 }, $set: { availableAt: new Date(Date.now() + (action.type === "WAIT" ? action.minutes * 60000 : 0)) } });
}

const owner = crypto.randomUUID();
let running = false, timer, lastScan = 0;
export async function processCommunicationQueue() {
  if (running) return;
  running = true;
  let heartbeat;
  try {
    await settings();
    const config = await CommunicationSettings.findOneAndUpdate({ key: "default", $or: [{ workerLeaseUntil: { $lt: new Date() } }, { workerLeaseUntil: null }] },
      { $set: { workerOwner: owner, workerLeaseUntil: new Date(Date.now() + 120000), lastWorkerAt: new Date() } }, { returnDocument: 'after' });
    if (!config) return;
    heartbeat = setInterval(() => CommunicationSettings.updateOne({ key: "default", workerOwner: owner }, { $set: { workerLeaseUntil: new Date(Date.now() + 120000) } }).catch(() => {}), 20000);
    heartbeat.unref();
    await EmailJob.updateMany({ status: "SENDING", leaseUntil: { $lt: new Date() }, transmitting: false }, { $set: { status: "QUEUED" } });
    await EmailJob.updateMany({ status: "SENDING", leaseUntil: { $lt: new Date() }, transmitting: true }, { $set: { status: "FAILED", safeToRetry: false, error: "SMTP outcome unknown after restart; reconcile provider logs before any resend." } });
    await EmailCampaign.updateMany({ status: "SCHEDULED", scheduledAt: { $lte: new Date() } }, { $set: { status: "QUEUED", audienceAt: new Date() } });
    const campaign = await EmailCampaign.findOne({ status: { $in: ["QUEUED", "SENDING"] }, audienceComplete: false });
    if (campaign) {
      try { await expandCampaign(campaign); }
      catch (error) { await EmailCampaign.updateOne({ _id: campaign._id }, { $set: { status: "FAILED" } }); console.error("[COMMUNICATIONS] campaign expansion:", error.message); }
    }
    if (Date.now() - lastScan > 30000) { await scanAutomationTriggers(); lastScan = Date.now(); }
    const run = await AutomationRun.findOne({ status: "QUEUED", availableAt: { $lte: new Date() } });
    if (run) {
      try { await processAutomation(run); }
      catch (error) { await AutomationRun.updateOne({ _id: run._id }, { $set: { status: "FAILED", error: error.message } }); }
    }
    if (!config.nextSendAt || config.nextSendAt <= new Date()) {
      const job = await EmailJob.findOneAndUpdate({ status: "QUEUED", availableAt: { $lte: new Date() } }, { $set: { status: "SENDING", leaseUntil: new Date(Date.now() + 120000), transmitting: false }, $inc: { attempts: 1 } }, { returnDocument: 'after', sort: { availableAt: 1 } });
      if (job) {
        await CommunicationSettings.updateOne({ key: "default", workerOwner: owner }, { $set: { nextSendAt: new Date(Date.now() + 60000 / config.ratePerMinute) } });
        let status;
        try {
          status = await deliverJob(job, config);
          await EmailJob.updateOne({ _id: job._id, status: "SENDING" }, { ...(status === "QUEUED" ? { $inc: { attempts: -1 } } : {}), $set: { status, ...(status === "SENT" ? { sentAt: new Date(), safeToRetry: false, "mail.text": "", "mail.attachments": [] } : {}), ...(status === "QUEUED" ? { availableAt: new Date(Date.now() + 30000) } : {}) } });
        } catch (error) {
          // Definitive pre-acceptance SMTP failures may be retried; ambiguous timeouts must not be.
          const transmission = await EmailJob.findById(job._id);
          const safe = !transmission?.transmitting || ["ECONNECTION", "ECONNREFUSED", "EAUTH", "EENVELOPE"].includes(error.code) || Boolean(error.responseCode);
          const retry = safe && (!error.responseCode || error.responseCode < 500) && job.attempts < 5;
          status = retry ? "QUEUED" : "FAILED";
          await EmailJob.updateOne({ _id: job._id }, { $set: { status, safeToRetry: safe, error: String(error.message).slice(0, 800), availableAt: new Date(Date.now() + Math.min(3600000, 30000 * 2 ** job.attempts)) } });
        }
        if (job.customerMessage) {
          const latest = await EmailJob.findById(job._id);
          await CustomerMessage.updateOne({ _id: job.customerMessage }, { $set: { deliveryStatus: latest.status, messageId: latest.messageId } });
          const contact = await ContactMessage.findById(job.conversation);
          if (status === "SENT") await ContactMessage.updateOne({ _id: job.conversation, firstResponseAt: null }, { $set: { firstResponseAt: new Date() } });
          if (contact && status === "FAILED") await notifyInbox(contact, "Reply delivery failed").catch(() => {});
          if (contact) await broadcastInbox(contact._id);
        }
      }
    }
    for (const done of await EmailCampaign.find({ status: "SENDING", audienceComplete: true }).limit(20)) {
      if (!await EmailJob.exists({ campaign: done._id, status: { $in: ["QUEUED", "SENDING"] } })) {
        const failed = await EmailJob.exists({ campaign: done._id, status: "FAILED" });
        await EmailCampaign.updateOne({ _id: done._id, status: "SENDING" }, { $set: { status: failed ? "FAILED" : "SENT" } });
      }
    }
  } finally {
    clearInterval(heartbeat);
    await CommunicationSettings.updateOne({ key: "default", workerOwner: owner }, { $set: { workerLeaseUntil: new Date(0) } }).catch(() => {});
    running = false;
  }
}
export function startCommunicationsWorker() {
  if (timer || process.env.COMMUNICATIONS_WORKER_ENABLED !== "true") return;
  timer = setInterval(() => processCommunicationQueue().catch(error => console.error("[COMMUNICATIONS] worker:", error.message)), 200);
  timer.unref();
}
