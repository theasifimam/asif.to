import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import ContactMessage from "../models/ContactMessage.js";
import User from "../models/User.js";
import RolePermission from "../models/RolePermission.js";
import { CustomerMessage, EmailJob, EmailCampaign, EmailSubscriber, EmailWebhookEvent, EmailAutomation, CommunicationSettings } from "../models/Communication.js";
import { clearPermissionCache } from "../utils/permissions.js";
import { replyAddress, resolveReplyAddress, jobReplyAddress, resolveJobReplyAddress, preferenceToken, verifyPreferenceToken, verifyWebhook, marketingAllowed, renderTemplate } from "../services/communications/policy.js";
import { ensureConversation, addAdminMessage } from "../services/communications/inbox.service.js";
import { queueEmail, deliverJob } from "../services/communications/email.service.js";
import { expandCampaign } from "../services/communications/worker.service.js";
import { ingestWebhook } from "../services/communications/webhook.service.js";
import { updatePreferences, updateInbox, communicationsSearch } from "../controllers/communications.controller.js";

const id = "507f1f77bcf86cd799439011", userId = "507f1f77bcf86cd799439012";
const config = { replyDomain: "reply.asif.to", senders: { SUPPORT: "support@asif.to", MARKETING: "updates@asif.to", SECURITY: "security@asif.to" }, inboundAddresses: ["support@asif.to"], footer: "asif.to" };
const chain = value => ({ select() { return this; }, sort() { return this; }, limit() { return this; }, lean: async () => value, then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); } });
const res = () => ({ status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; } });
function secrets(t) { for (const name of ["COMMUNICATIONS_SIGNING_SECRET", "COMMUNICATIONS_WEBHOOK_SECRET"]) { const old = process.env[name]; process.env[name] = "test-secret-never-use-in-production-12345678"; t.after(() => { if (old === undefined) delete process.env[name]; else process.env[name] = old; }); } }
function staff(t) { clearPermissionCache(); t.after(clearPermissionCache); t.mock.method(RolePermission, "find", () => chain([])); t.mock.method(User, "find", () => chain([])); }

test("reply and preference links are authenticated, separated by purpose and fit email local-part limits", t => {
  secrets(t);
  const address = replyAddress(id, config.replyDomain);
  assert.equal(resolveReplyAddress(address, config.replyDomain), id);
  assert.ok(address.split("@")[0].length <= 64);
  assert.equal(resolveReplyAddress(address.replace(id, userId), config.replyDomain), null);
  assert.equal(resolveReplyAddress(address, "other.example"), null);
  const marketing = jobReplyAddress(id, config.replyDomain);
  assert.ok(marketing.split("@")[0].length <= 64);
  assert.equal(resolveJobReplyAddress(marketing, config.replyDomain), id);
  assert.equal(resolveReplyAddress(marketing, config.replyDomain), null);
  const token = preferenceToken(id);
  assert.equal(verifyPreferenceToken(token), id);
  assert.throws(() => verifyPreferenceToken(`${token}.extra`));
  assert.throws(() => verifyPreferenceToken(token.replace(id, userId)));
});
test("inbound signatures bind the exact body and reject expired or modified requests", t => {
  secrets(t); const raw = Buffer.from('{"kind":"inbound"}'), timestamp = String(Math.floor(Date.now() / 1000));
  const sig = crypto.createHmac("sha256", process.env.COMMUNICATIONS_WEBHOOK_SECRET).update(`${timestamp}.`).update(raw).digest("hex");
  assert.doesNotThrow(() => verifyWebhook(raw, timestamp, sig));
  assert.throws(() => verifyWebhook(Buffer.from("{}"), timestamp, sig));
  assert.throws(() => verifyWebhook(raw, "1", sig));
});
test("marketing requires verified consent and never ignores suppression or selected interests", () => {
  for (const status of ["PENDING", "UNSUBSCRIBED", "BOUNCED", "COMPLAINED", "SUPPRESSED"]) assert.equal(marketingAllowed({ status, verifiedAt: new Date(), topics: ["React"] }), false);
  const subscriber = { status: "ACTIVE", verifiedAt: new Date(), topics: ["React"] };
  assert.equal(marketingAllowed(subscriber, ["React"]), true);
  assert.equal(marketingAllowed(subscriber, ["Python"]), false);
  assert.equal(marketingAllowed({ ...subscriber, marketingSuppressed: true }), false);
  assert.equal(marketingAllowed({ ...subscriber, verifiedAt: null }), false);
  assert.throws(() => renderTemplate("{{serverSecret}}"));
  assert.equal(renderTemplate("Hi {{firstName}}", { firstName: "Alex" }), "Hi Alex");
});
test("legacy enquiry backfill is idempotent and preserves its original message and replies", async t => {
  const saved = new Map();
  const contact = { _id: id, status: "unread", name: "Alex", email: "alex@example.com", subject: "Help", message: "Original question", createdAt: new Date(), replies: [{ requestId: "old", message: "Original reply", status: "sent", createdAt: new Date() }] };
  t.mock.method(ContactMessage, "updateOne", async (_filter, update) => { Object.assign(contact, update.$set); });
  t.mock.method(ContactMessage, "findById", async () => contact);
  t.mock.method(CustomerMessage, "updateOne", async (filter, update) => { if (!saved.has(filter.key)) saved.set(filter.key, update.$setOnInsert); });
  await ensureConversation(contact); await ensureConversation(contact);
  assert.equal(saved.size, 2); assert.equal(saved.get(`legacy:${id}`).text, "Original question");
  assert.equal(saved.get(`legacy-reply:${id}:old`).text, "Original reply");
  assert.ok(contact.conversationNumber.startsWith("ENQ-")); assert.equal(contact.replies.length, 1);
});
test("internal notes are stored but never create outbound email jobs", async t => {
  staff(t);
  t.mock.method(CustomerMessage, "findOne", async () => null);
  t.mock.method(CustomerMessage, "findOneAndUpdate", async (_filter, update) => ({ _id: userId, ...update.$setOnInsert, createdAt: new Date() }));
  t.mock.method(CustomerMessage, "updateOne", async () => ({}));
  const enqueue = t.mock.method(EmailJob, "findOneAndUpdate", async () => assert.fail("Internal note must not send email"));
  const result = await addAdminMessage({ _id: userId }, { _id: id, subject: "Help" }, { text: "Private support note", mode: "note", requestId: crypto.randomUUID() });
  assert.equal(result.direction, "NOTE"); assert.equal(enqueue.mock.callCount(), 0);
});
test("queue keys absorb concurrent inserts without creating a second email", async t => {
  t.mock.method(EmailJob, "findOneAndUpdate", async () => { throw Object.assign(new Error("duplicate"), { code: 11000 }); });
  t.mock.method(EmailJob, "findOne", async filter => ({ _id: id, ...filter }));
  const result = await queueEmail({ key: "unique-request", recipient: "alex@example.com", stream: "SUPPORT", subject: "Help", text: "Reply" });
  assert.equal(result.key, "unique-request");
});
test("campaign expansion batches opted-in subscribers and uses stable per-recipient keys", async t => {
  secrets(t);
  const subscriber = { _id: userId, email: "alex@example.com", firstName: "Alex", status: "ACTIVE", verifiedAt: new Date(), topics: ["React"] };
  let filter;
  t.mock.method(EmailSubscriber, "find", query => { filter = query; return chain([subscriber]); });
  const queue = t.mock.method(EmailJob, "findOneAndUpdate", async (_filter, update) => update.$setOnInsert);
  const update = t.mock.method(EmailCampaign, "updateOne", async () => ({}));
  await expandCampaign({ _id: id, topics: ["React"], audienceAt: new Date(), subject: "New {{articleTitle}}", text: "Hi {{firstName}} {{articleUrl}}", stream: "MARKETING", kind: "article_announcement", variables: { articleTitle: "Context", articleUrl: "https://asif.to/articles/context" } }, 10);
  assert.equal(filter.status, "ACTIVE"); assert.deepEqual(filter.marketingSuppressed, { $ne: true });
  const queued = queue.mock.calls[0].arguments[1].$setOnInsert;
  assert.equal(queued.key, `campaign:${id}:${userId}`); assert.equal(queued.mail.subject, "New Context");
  assert.ok(queued.mail.text.includes("Hi Alex https://asif.to/articles/context"));
  assert.equal(update.mock.calls[0].arguments[1].$set.audienceComplete, true);
});
test("support delivery uses support sender and preserves real email threading headers", async t => {
  secrets(t);
  for (const name of ["EMAIL_HOST", "EMAIL_USER", "EMAIL_PASSWORD"]) { const old = process.env[name]; process.env[name] = "test-only"; t.after(() => { if (old === undefined) delete process.env[name]; else process.env[name] = old; }); }
  const transport = { sendMail: async () => {} };
  const send = t.mock.method(transport, "sendMail", async () => ({ accepted: ["alex@example.com"] }));
  t.mock.method(EmailJob, "updateOne", async () => ({}));
  t.mock.method(CustomerMessage, "find", () => chain([{ messageId: "<customer@example.com>" }]));
  assert.equal(await deliverJob({ _id: userId, conversation: id, recipient: "alex@example.com", stream: "SUPPORT", mail: { subject: "Re: Help", text: "Hello <Alex>" } }, config, () => transport), "SENT");
  const mail = send.mock.calls[0].arguments[0];
  assert.equal(mail.from.address, "support@asif.to"); assert.equal(resolveReplyAddress(mail.replyTo, config.replyDomain), id);
  assert.equal(mail.inReplyTo, "<customer@example.com>"); assert.deepEqual(mail.references, ["<customer@example.com>"]);
  assert.ok(mail.html.includes("&lt;Alex&gt;")); assert.ok(mail.messageId.includes(userId));
});
test("send-time unsubscribe checks suppress an already-queued campaign", async t => {
  t.mock.method(EmailSubscriber, "findOne", async () => ({ status: "UNSUBSCRIBED" }));
  assert.equal(await deliverJob({ recipient: "alex@example.com", stream: "MARKETING" }, config), "SUPPRESSED");
});
test("duplicate webhooks return before touching messages or SMTP", async t => {
  t.mock.method(EmailWebhookEvent, "findOneAndUpdate", async () => ({ status: "DONE" }));
  t.mock.method(CustomerMessage, "updateOne", async () => assert.fail("duplicate message"));
  assert.deepEqual(await ingestWebhook({ id: "provider-1", kind: "inbound" }), { duplicate: true });
});
test("a verified inbound reply stays in the same enquiry and repeated Message-IDs do not duplicate it", async t => {
  secrets(t); staff(t);
  const stored = new Map(), changes = [];
  t.mock.method(EmailWebhookEvent, "findOneAndUpdate", async () => ({ _id: id, status: "PENDING" }));
  t.mock.method(EmailWebhookEvent, "updateOne", async () => ({}));
  t.mock.method(CommunicationSettings, "findOneAndUpdate", async () => config);
  t.mock.method(CommunicationSettings, "updateOne", async () => ({}));
  t.mock.method(ContactMessage, "findById", async value => { assert.equal(value, id); return { _id: id, email: "alex@example.com", name: "Alex", conversationNumber: "ENQ-1", subject: "Help" }; });
  t.mock.method(ContactMessage, "updateOne", async (filter, update) => { changes.push({ filter, update }); });
  t.mock.method(CustomerMessage, "findOne", async filter => stored.get(filter.key));
  t.mock.method(CustomerMessage, "updateOne", async (filter, update) => {
    if (update.$setOnInsert && !stored.has(filter.key)) { stored.set(filter.key, { _id: userId, createdAt: new Date(), ...update.$setOnInsert }); return { upsertedCount: 1 }; }
    if (update.$set) for (const item of stored.values()) if (item._id === filter._id) Object.assign(item, update.$set);
    return { upsertedCount: 0 };
  });
  t.mock.method(CustomerMessage, "countDocuments", async () => stored.size);
  t.mock.method(EmailAutomation, "find", async () => []);
  const payload = { id: "inbound-1", kind: "inbound", from: "alex@example.com", to: replyAddress(id, config.replyDomain), authenticatedSender: true, messageId: "<customer-reply@example.com>", text: "Another question" };
  await ingestWebhook(payload);
  await ingestWebhook({ ...payload, id: "inbound-2" });
  assert.equal(stored.size, 1);
  assert.equal([...stored.values()][0].conversation, id);
  assert.ok(changes.some(change => change.update.$set.conversationStatus === "WAITING_FOR_ADMIN"));
  await assert.rejects(() => ingestWebhook({ ...payload, id: "spoof", from: "different@example.com" }), /Sender does not belong/);
});
test("hard bounces permanently suppress marketing and leave security queues alone", async t => {
  t.mock.method(EmailWebhookEvent, "findOneAndUpdate", async () => ({ _id: id, status: "PENDING" }));
  t.mock.method(EmailWebhookEvent, "updateOne", async () => ({}));
  t.mock.method(CommunicationSettings, "findOneAndUpdate", async () => config);
  t.mock.method(CommunicationSettings, "updateOne", async () => ({}));
  t.mock.method(EmailJob, "findOne", async () => ({ _id: userId, recipient: "alex@example.com", status: "SENT" }));
  t.mock.method(EmailJob, "updateOne", async () => ({}));
  const jobs = t.mock.method(EmailJob, "updateMany", async () => ({}));
  const subscriber = t.mock.method(EmailSubscriber, "findOneAndUpdate", async () => ({}));
  await ingestWebhook({ id: "bounce-1", kind: "delivery", event: "BOUNCED", hardBounce: true, messageId: "<test@example.com>" });
  assert.equal(subscriber.mock.calls[0].arguments[1].$set.marketingSuppressed, true);
  assert.deepEqual(jobs.mock.calls[0].arguments[0].stream.$in, ["MARKETING", "JOBS"]);
});
test("unsubscribing cannot clear a hard bounce and reactivate marketing", async t => {
  secrets(t);
  t.mock.method(EmailSubscriber, "findById", async () => ({ status: "UNSUBSCRIBED", marketingSuppressed: true }));
  const response = res(); await updatePreferences({ body: { token: preferenceToken(id), topics: ["React"] } }, response);
  assert.equal(response.statusCode, 409);
});
test("communications search does not query private collections without permission", async t => {
  t.mock.method(ContactMessage, "find", () => assert.fail("private enquiry search"));
  t.mock.method(EmailSubscriber, "find", () => assert.fail("private subscriber search"));
  const response = res(); await communicationsSearch({ user: { effectivePermissions: [] }, query: { q: "Alex" } }, response);
  assert.deepEqual(response.body.data.items, []);
});
test("assignment requires the existing assignment permission", async t => {
  t.mock.method(ContactMessage, "findById", async () => ({ _id: id, conversationNumber: "ENQ-1", inboundKey: "direct" }));
  const response = res(); await updateInbox({ params: { id }, user: { effectivePermissions: ["communications.inbox.read"] }, body: { assignedTo: userId } }, response);
  assert.equal(response.statusCode, 403);
});
