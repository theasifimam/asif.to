import nodemailer from "nodemailer";
import addressparser from "nodemailer/lib/addressparser/index.js";
import { emailAddress } from "./communications/policy.js";
// Transporters are intentionally NOT cached at module level.
// Zoho (and similar providers) close idle connections, causing stale sockets
// to throw on the next send. Creating a fresh transporter per request avoids
// this without meaningful overhead for low-frequency transactional mail.

// SMTP providers such as Zoho only permit the authenticated mailbox (or an
// explicitly verified alias) in the envelope sender. Keep transactional mail
// aligned with the mailbox used to authenticate the transporter.
export function getAuthenticatedSender(name = "asif.to") {
  if (!process.env.EMAIL_USER) {
    throw new Error("EMAIL_USER is required to determine the transactional sender.");
  }
  return { name, address: emailAddress(process.env.EMAIL_USER) };
}

export const getTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  const port = Number.parseInt(process.env.EMAIL_PORT || "587", 10);
  const secure =
    process.env.EMAIL_SECURE !== undefined
      ? process.env.EMAIL_SECURE === "true"
      : port === 465;

  if (!host || !user || !pass) {
    throw new Error(
      "Email delivery is not configured. EMAIL_HOST, EMAIL_USER and EMAIL_PASSWORD are required.",
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    tls: {
      rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== "false",
      minVersion: "TLSv1.2",
    },
  });
};

export function getSupportSender(fallback = "support@asif.to") {
  const configured = process.env.EMAIL_SUPPORT_FROM || fallback;
  if (/[\r\n]/.test(configured)) throw new Error("EMAIL_SUPPORT_FROM must contain a single sender address.");
  const addresses = addressparser(configured);
  if (addresses.length !== 1 || !addresses[0].address) throw new Error("EMAIL_SUPPORT_FROM must contain a single sender address.");
  return { name: addresses[0].name || "asif.to Support", address: emailAddress(addresses[0].address) };
}

export function getSupportTransporter() {
  const host = process.env.EMAIL_HOST, user = process.env.EMAIL_SUPPORT_USER, pass = process.env.EMAIL_SUPPORT_PASSWORD;
  const port = Number.parseInt(process.env.EMAIL_PORT || "587", 10);
  if (!host || !user || !pass) throw new Error("Support email delivery requires EMAIL_HOST, EMAIL_SUPPORT_USER and EMAIL_SUPPORT_PASSWORD.");
  return nodemailer.createTransport({
    host, port,
    secure: process.env.EMAIL_SECURE !== undefined ? process.env.EMAIL_SECURE === "true" : port === 465,
    auth: { user, pass }, connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 20000,
    tls: { rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== "false", minVersion: "TLSv1.2" },
  });
}

