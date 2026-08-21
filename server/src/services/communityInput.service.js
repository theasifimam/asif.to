import crypto from "crypto";

export const cleanText = (value, max) => String(value || "")
  .replace(/\u0000/g, "")
  .replace(/<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "")
  .replace(/<\s*\/?\s*(iframe|object|embed|style|link|meta)\b[^>]*>/gi, "")
  .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
  .trim()
  .slice(0, max);

export const cleanCode = (value, max) => String(value || "").replace(/\u0000/g, "").trim().slice(0, max);

export const normalizeTags = (tags) => [...new Set((Array.isArray(tags) ? tags : String(tags || "").split(","))
  .map((tag) => cleanText(tag, 40).toLowerCase().replace(/^#/, ""))
  .filter(Boolean))].slice(0, 8);

export const fingerprint = (...parts) => crypto.createHash("sha256").update(parts.map((part) => String(part || "").trim().toLowerCase()).join("\u0001")).digest("hex");

export const httpError = (status, message, code) => Object.assign(new Error(message), { status, code });
