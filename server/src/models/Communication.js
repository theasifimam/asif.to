// External communication only. Team conversations/messages remain in their existing models.
import { Schema, model } from "mongoose";
const ref = (name) => ({ type: Schema.Types.ObjectId, ref: name, default: null });
export const INBOX_STATUSES = ["NEW", "OPEN", "WAITING_FOR_ADMIN", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED", "SPAM"];
export const SOURCES = ["CONTACT_FORM", "DIRECT_EMAIL", "CAMPAIGN_REPLY", "ARTICLE_REPLY", "COURSE_REPLY", "JOB_REPLY", "OTHER"];
export const STREAMS = ["SUPPORT", "MARKETING", "TRANSACTIONAL", "JOBS", "SECURITY"];
export const DEFAULT_TOPICS = ["General Newsletter", "New Articles", "JavaScript", "React", "Next.js", "Node.js", "TypeScript", "HTML", "CSS", "Tailwind", "MongoDB", "Python", "DSA", "Course Updates", "Job Alerts", "Offers", "Platform Announcements"];
const customerMessage = new Schema({
  conversation: { ...ref("ContactMessage"), required: true, index: true },
  key: { type: String, required: true, unique: true },
  direction: { type: String, enum: ["CUSTOMER", "ADMIN", "NOTE"], required: true },
  text: { type: String, required: true, maxlength: 50000 },
  sender: ref("User"), email: String,
  messageId: { type: String, index: true }, inReplyTo: String, references: [String],
  attachments: [{ type: Schema.Types.ObjectId, ref: "Asset" }],
  mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
  deliveryStatus: { type: String, default: "RECEIVED" },
  emailJob: ref("EmailJob"), readAt: Date, appliedAt: Date, resolve: Boolean,
}, { timestamps: true });
customerMessage.index({ conversation: 1, createdAt: 1 });
export const CustomerMessage = model("CustomerMessage", customerMessage);

const subscriber = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  firstName: { type: String, maxlength: 120 }, user: ref("User"),
  status: { type: String, enum: ["PENDING", "ACTIVE", "UNSUBSCRIBED", "BOUNCED", "COMPLAINED", "SUPPRESSED"], default: "PENDING", index: true },
  topics: [String], source: { type: String, default: "preferences" }, tags: [String],
  marketingSuppressed: { type: Boolean, default: false }, verifiedAt: Date, consentAt: Date, unsubscribedAt: Date, suppressionReason: String,
}, { timestamps: true });
subscriber.index({ status: 1, topics: 1, _id: 1 });
export const EmailSubscriber = model("EmailSubscriber", subscriber);

export const EmailTemplate = model("EmailTemplate", new Schema({
  name: { type: String, required: true, maxlength: 180 },
  category: { type: String, enum: ["Support", "Marketing", "Article", "Course", "Jobs", "Authentication", "System"], default: "Marketing" },
  subject: { type: String, required: true, maxlength: 250 }, text: { type: String, required: true, maxlength: 50000 },
  updatedBy: ref("User"),
}, { timestamps: true }));

const campaign = new Schema({
  name: { type: String, required: true, maxlength: 180 }, subject: { type: String, required: true, maxlength: 250 },
  text: { type: String, required: true, maxlength: 50000 }, template: ref("EmailTemplate"),
  kind: { type: String, default: "newsletter" }, topics: [String], stream: { type: String, enum: ["MARKETING", "JOBS"], default: "MARKETING" },
  status: { type: String, enum: ["DRAFT", "SCHEDULED", "QUEUED", "SENDING", "PAUSED", "SENT", "FAILED", "CANCELLED"], default: "DRAFT", index: true },
  scheduledAt: Date, audienceAt: Date, audienceCursor: Schema.Types.ObjectId, audienceComplete: { type: Boolean, default: false },
  createdBy: ref("User"), contentRef: { type: String, unique: true, sparse: true }, variables: Schema.Types.Mixed,
}, { timestamps: true });
export const EmailCampaign = model("EmailCampaign", campaign);

const job = new Schema({
  key: { type: String, required: true, unique: true }, type: String,
  recipient: { type: String, required: true, lowercase: true }, subscriber: ref("EmailSubscriber"), campaign: ref("EmailCampaign"),
  conversation: ref("ContactMessage"), customerMessage: ref("CustomerMessage"), stream: { type: String, enum: STREAMS, required: true },
  mail: Schema.Types.Mixed,
  status: { type: String, enum: ["QUEUED", "SENDING", "SENT", "DELIVERED", "FAILED", "BOUNCED", "COMPLAINED", "SUPPRESSED", "CANCELLED"], default: "QUEUED", index: true },
  availableAt: { type: Date, default: Date.now, index: true }, attempts: { type: Number, default: 0 },
  leaseUntil: Date, transmitting: { type: Boolean, default: false }, safeToRetry: { type: Boolean, default: true },
  messageId: { type: String, index: true }, error: String, sentAt: Date, deliveredAt: Date, openedAt: Date, clickedAt: Date,
  metadata: Schema.Types.Mixed,
}, { timestamps: true });
job.index({ status: 1, availableAt: 1 });
job.index({ campaign: 1, status: 1 });
export const EmailJob = model("EmailJob", job);

export const EmailWebhookEvent = model("EmailWebhookEvent", new Schema({
  key: { type: String, required: true, unique: true }, kind: String,
  payload: Schema.Types.Mixed, status: { type: String, default: "PENDING" }, error: String,
}, { timestamps: true }));

export const AUTOMATION_TRIGGERS = ["USER_REGISTERED", "CONTACT_SUBMITTED", "CUSTOMER_REPLIED", "ARTICLE_PUBLISHED", "COURSE_PUBLISHED", "JOB_PUBLISHED", "SUBSCRIBED", "EMAIL_VERIFIED", "INACTIVE_USER"];
export const AUTOMATION_ACTIONS = ["SEND_EMAIL", "CREATE_NOTIFICATION", "ADD_TAG", "CHANGE_STATUS", "ASSIGN_CONVERSATION", "WAIT", "NOTIFY_TEAM"];
export const EmailAutomation = model("EmailAutomation", new Schema({
  name: { type: String, required: true }, enabled: { type: Boolean, default: false },
  trigger: { type: String, enum: AUTOMATION_TRIGGERS, required: true },
  scanAt: Date, scanId: Schema.Types.ObjectId, lastSweepAt: Date,
  actions: [{ type: { type: String, enum: AUTOMATION_ACTIONS, required: true }, template: ref("EmailTemplate"), value: String, minutes: Number }],
}, { timestamps: true }));
export const AutomationRun = model("AutomationRun", new Schema({
  key: { type: String, unique: true, required: true }, automation: ref("EmailAutomation"),
  actions: [Schema.Types.Mixed], context: Schema.Types.Mixed, step: { type: Number, default: 0 },
  availableAt: { type: Date, default: Date.now }, status: { type: String, default: "QUEUED" }, error: String,
}, { timestamps: true }));

export const CommunicationSettings = model("CommunicationSettings", new Schema({
  key: { type: String, unique: true, default: "default" },
  topics: { type: [String], default: DEFAULT_TOPICS },
  senders: { type: Schema.Types.Mixed, default: { SUPPORT: "support@asif.to", MARKETING: "updates@asif.to", JOBS: "jobs@asif.to", SECURITY: "security@asif.to", TRANSACTIONAL: "support@asif.to" } },
  replyDomain: { type: String, default: "reply.asif.to" },
  inboundAddresses: { type: [String], default: ["support@asif.to"] },
  ratePerMinute: { type: Number, default: 30, min: 1, max: 300 },
  footer: { type: String, default: "asif.to" },
  workerOwner: String, workerLeaseUntil: Date, nextSendAt: Date,
  jobAlertDigestEnabled: { type: Boolean, default: true },
  jobAlertDigestHour: { type: Number, default: 18, min: 0, max: 23 },
  jobAlertDigestMinute: { type: Number, default: 0, min: 0, max: 59 },
  jobAlertDigestTimezone: { type: String, default: "Asia/Dubai", maxlength: 80 },
  lastWebhookAt: Date, lastWorkerAt: Date,
}, { timestamps: true }));
