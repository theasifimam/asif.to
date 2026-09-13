import crypto from "node:crypto";
export const emailAddress = (value) => {
  const email = String(value || "").trim().toLowerCase();
  if (!/^[^\s@<>;,]+@[^\s@<>;,]+\.[^\s@<>;,]+$/.test(email) || email.length > 254) throw Object.assign(new Error("Invalid email address."), { status: 400 });
  return email;
};
export const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };
export const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const VARIABLES = ["firstName", "email", "articleTitle", "articleUrl", "courseTitle", "courseUrl", "jobTitle", "jobUrl", "conversationNumber", "unsubscribeUrl"];
export function renderTemplate(text, variables = {}) {
  return String(text).replace(/{{\s*([\w]+)\s*}}/g, (_, key) => {
    if (!VARIABLES.includes(key)) fail(`Unsupported template variable: ${key}`);
    return String(variables[key] || "");
  });
}
export function signature(purpose, value) {
  const secret = process.env.COMMUNICATIONS_SIGNING_SECRET;
  if (!secret || secret.length < 32) fail("Communications signing secret is not configured.", 503);
  return crypto.createHmac("sha256", secret).update(`${purpose}:${value}`).digest("hex");
}
export function constantEqual(a, b) {
  const left = Buffer.from(String(a || "")), right = Buffer.from(String(b || ""));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
export const preferenceToken = (id) => `${id}.${signature("preferences", id)}`;
export function verifyPreferenceToken(token) {
  if (String(token || "").split(".").length !== 2) fail("Invalid preference link.", 403);
  const [id, sig] = String(token || "").split(".");
  if (!/^[a-f0-9]{24}$/.test(id || "") || !constantEqual(signature("preferences", id), sig)) fail("Invalid preference link.", 403);
  return id;
}
export const replyAddress = (id, domain) => `enq+${id}.${signature("reply", id).slice(0, 32)}@${domain}`;
export function resolveReplyAddress(address, domain) {
  const match = String(address).toLowerCase().match(/^enq\+([a-f0-9]{24})\.([a-f0-9]{32})@([^\s]+)$/);
  if (!match || match[3] !== domain || !constantEqual(signature("reply", match[1]).slice(0, 32), match[2])) return null;
  return match[1];
}
export function verifyWebhook(raw, timestamp, provided) {
  const secret = process.env.COMMUNICATIONS_WEBHOOK_SECRET;
  if (!secret || secret.length < 32) fail("Webhook authentication is not configured.", 503);
  if (!/^\d+$/.test(String(timestamp)) || Math.abs(Date.now() - Number(timestamp) * 1000) > 300000) fail("Expired webhook signature.", 401);
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.`).update(Buffer.isBuffer(raw) ? raw : Buffer.from("")).digest("hex");
  if (!constantEqual(expected, provided)) fail("Invalid webhook signature.", 401);
}
export const marketingAllowed = (subscriber, topics = []) => Boolean(subscriber && subscriber.status === "ACTIVE" && !subscriber.marketingSuppressed && subscriber.verifiedAt && (!topics.length || topics.some(topic => subscriber.topics.includes(topic))));

export const jobReplyAddress = (id, domain) => `mail+${id}.${signature("job-reply", id).slice(0, 32)}@${domain}`;
export function resolveJobReplyAddress(address, domain) {
  const match = String(address).toLowerCase().match(/^mail\+([a-f0-9]{24})\.([a-f0-9]{32})@([^\s]+)$/);
  return match && match[3] === domain && constantEqual(signature("job-reply", match[1]).slice(0, 32), match[2]) ? match[1] : null;
}
