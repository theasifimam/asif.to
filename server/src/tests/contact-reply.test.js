import assert from "node:assert/strict";
import test from "node:test";
import nodemailer from "nodemailer";
import ContactMessage from "../models/ContactMessage.js";
import { replyToMessage } from "../controllers/contact.controller.js";
import routes from "../routes/contact.routes.js";

const transport = { sendMail: async () => { throw new Error("Test transport must be mocked"); } };
const contact = { _id: "507f1f77bcf86cd799439011", name: "Reader", email: "reader@example.com", subject: "Help with a course", replies: [] };
const req = () => ({ params: { id: contact._id }, user: { _id: "507f1f77bcf86cd799439012" }, body: { message: "Hello <reader>\nHere is some help.", requestId: "12345678-1234-1234-1234-123456789012" } });
const response = () => ({ status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

test("contact replies send from support to the enquiry address and record acceptance", async (t) => {
  // No SMTP connection is made: replace the transport before it is constructed.
  t.mock.method(nodemailer, "createTransport", () => transport);
  for (const key of ["EMAIL_HOST", "EMAIL_SUPPORT_USER", "EMAIL_SUPPORT_PASSWORD"]) {
    const original = process.env[key];
    process.env[key] = "test-only";
    t.after(() => { if (original === undefined) delete process.env[key]; else process.env[key] = original; });
  }
  const originalFrom = process.env.EMAIL_SUPPORT_FROM; process.env.EMAIL_SUPPORT_FROM = "asif.to Support <support@asif.to>";
  t.after(() => { if (originalFrom === undefined) delete process.env.EMAIL_SUPPORT_FROM; else process.env.EMAIL_SUPPORT_FROM = originalFrom; });
  const send = t.mock.method(transport, "sendMail", async () => ({ accepted: [contact.email], messageId: "<reply@example.com>" }));
  t.mock.method(ContactMessage, "findById", async () => contact);
  const claim = t.mock.method(ContactMessage, "updateOne", async () => ({ modifiedCount: 1 }));
  const save = t.mock.method(ContactMessage, "findOneAndUpdate", async () => contact);
  const request = req();
  request.body.to = "someone-else@example.com";
  request.body.from = "someone-else@example.com";
  const res = response();
  await replyToMessage(request, res);
  assert.equal(res.body.success, true);
  const mail = send.mock.calls[0].arguments[0];
  assert.equal(mail.from.address, "support@asif.to");
  assert.equal(mail.replyTo, "support@asif.to");
  assert.equal(mail.to.address, contact.email);
  assert.equal(mail.subject, `Re: ${contact.subject}`);
  assert.equal(mail.text, request.body.message);
  assert.ok(mail.html.includes("&lt;reader&gt;"));
  assert.equal(claim.mock.calls[0].arguments[1].$push.replies.sentBy, request.user._id);
  assert.equal(save.mock.calls[0].arguments[1].$set["replies.$.status"], "sent");
});

test("failed delivery is recorded without reporting success", async (t) => {
  t.mock.method(transport, "sendMail", async () => { throw new Error("SMTP rejected test reply"); });
  t.mock.method(ContactMessage, "findById", async () => contact);
  const updates = t.mock.method(ContactMessage, "updateOne", async () => ({ modifiedCount: 1 }));
  const sent = t.mock.method(ContactMessage, "findOneAndUpdate", async () => assert.fail("must not mark sent"));
  const res = response();
  await replyToMessage(req(), res);
  assert.equal(res.statusCode, 502);
  assert.equal(updates.mock.calls[1].arguments[1].$set["replies.$.status"], "failed");
  assert.equal(sent.mock.callCount(), 0);
});

test("retries of a sent request do not send twice", async (t) => {
  t.mock.method(ContactMessage, "findById", async () => ({ ...contact, replies: [{ requestId: req().body.requestId, status: "sent" }] }));
  const send = t.mock.method(transport, "sendMail", async () => assert.fail("duplicate send"));
  const res = response();
  await replyToMessage(req(), res);
  assert.equal(res.body.success, true);
  assert.equal(send.mock.callCount(), 0);
});

test("concurrent duplicate replies cannot claim the same request", async (t) => {
  t.mock.method(ContactMessage, "findById", async () => contact);
  t.mock.method(ContactMessage, "updateOne", async () => ({ modifiedCount: 0 }));
  const send = t.mock.method(transport, "sendMail", async () => assert.fail("duplicate send"));
  const res = response();
  await replyToMessage(req(), res);
  assert.equal(res.statusCode, 409);
  assert.equal(send.mock.callCount(), 0);
});

test("empty replies are rejected and replying requires the contact administration permission", async () => {
  const request = req(); request.body.message = "   ";
  const res = response();
  await replyToMessage(request, res);
  assert.equal(res.statusCode, 400);
  const routeIndex = routes.stack.findIndex(layer => layer.route?.path === "/:id/reply");
  assert.ok(routeIndex > 0);
  assert.ok(routes.stack.slice(0, routeIndex).some(layer => layer.handle.name === "protect"));
  const permission = routes.stack.filter(layer => !layer.route && layer.handle.name !== "protect")[0];
  const denied = response();
  permission.handle({ user: { role: "reader" } }, denied, () => assert.fail("unauthorized reply"));
  assert.equal(denied.statusCode, 403);
});
