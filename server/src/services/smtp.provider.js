import nodemailer from "nodemailer";
import addressparser from "nodemailer/lib/addressparser/index.js";
import { emailAddress } from "./communications/policy.js";
let cachedTransporter = null;
let cachedSupportTransporter = null;

export const getTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

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

  cachedTransporter = nodemailer.createTransport({
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

  return cachedTransporter;
};

export function getSupportSender(fallback = "support@asif.to") {
  const configured = process.env.EMAIL_SUPPORT_FROM || fallback;
  if (/[\r\n]/.test(configured)) throw new Error("EMAIL_SUPPORT_FROM must contain a single sender address.");
  const addresses = addressparser(configured);
  if (addresses.length !== 1 || !addresses[0].address) throw new Error("EMAIL_SUPPORT_FROM must contain a single sender address.");
  return { name: addresses[0].name || "asif.to Support", address: emailAddress(addresses[0].address) };
}

export function getSupportTransporter() {
  if (cachedSupportTransporter) return cachedSupportTransporter;
  const host = process.env.EMAIL_HOST, user = process.env.EMAIL_SUPPORT_USER, pass = process.env.EMAIL_SUPPORT_PASSWORD;
  const port = Number.parseInt(process.env.EMAIL_PORT || "587", 10);
  if (!host || !user || !pass) throw new Error("Support email delivery requires EMAIL_HOST, EMAIL_SUPPORT_USER and EMAIL_SUPPORT_PASSWORD.");
  cachedSupportTransporter = nodemailer.createTransport({
    host, port,
    secure: process.env.EMAIL_SECURE !== undefined ? process.env.EMAIL_SECURE === "true" : port === 465,
    auth: { user, pass }, connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 20000,
    tls: { rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== "false", minVersion: "TLSv1.2" },
  });
  return cachedSupportTransporter;
}

