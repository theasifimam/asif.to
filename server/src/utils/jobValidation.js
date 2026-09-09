import crypto from "crypto";
import dns from "dns/promises";
import net from "net";
import { slugify } from "./slugify.js";

export const decodeHtmlEntities = (value) => {
  if (!value) return "";
  let str = String(value);
  for (let i = 0; i < 3; i++) {
    if (!str.includes("&")) break;
    const prev = str;
    str = str
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
    if (str === prev) break;
  }
  return str;
};

export const cleanText = (value, maxLength = 20_000) => {
  if (!value) return "";
  const decoded = decodeHtmlEntities(String(value));
  return decoded
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .trim()
    .slice(0, maxLength);
};

const SAFE_JOB_TAGS = new Set(["p", "br", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "strong", "b", "em", "i", "u", "div", "span"]);
export const sanitizeJobHtml = (value, maxLength = 50_000) => {
  if (!value) return "";
  const decoded = decodeHtmlEntities(String(value));
  const cleaned = decoded
    .replace(/<!--([\s\S]*?)-->/g, "")
    .replace(/<(script|style|form|iframe|object|embed|svg|link|meta|head|body|html)[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(script|style|form|iframe|object|embed|svg|link|meta|head|body|html)[^>]*\/?\s*>/gi, "")
    .replace(/<\/?([a-z0-9]+)(?:\s[^>]*)?>/gi, (tag, name) => {
      const safeName = String(name).toLowerCase();
      if (!SAFE_JOB_TAGS.has(safeName)) return "";
      if (safeName === "br") return "<br>";
      return tag.startsWith("</") ? `</${safeName}>` : `<${safeName}>`;
    })
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();

  return cleaned.slice(0, maxLength);
};

export const cleanStringArray = (value, maxItems = 50, maxLength = 100) => {
  const items = Array.isArray(value) ? value : String(value ?? "").split(/[\n,]/);
  return [...new Set(items.map((item) => cleanText(item, maxLength)).filter(Boolean))].slice(0, maxItems);
};

export const parseNullableNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

export const normalizeUrl = (value, { required = false } = {}) => {
  if (!value) {
    if (required) throw Object.assign(new Error("A valid URL is required."), { statusCode: 400 });
    return "";
  }
  try {
    const url = new URL(String(value).trim());
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    url.hash = "";
    return url.toString();
  } catch {
    throw Object.assign(new Error("Only valid HTTP or HTTPS URLs are allowed."), { statusCode: 400 });
  }
};

export const assertSafeRemoteUrl = (value) => {
  const normalized = normalizeUrl(value, { required: true });
  const host = new URL(normalized).hostname.toLowerCase();
  const blocked = host === "localhost" || host === "::1" || host === "0.0.0.0" || host.endsWith(".local") ||
    /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  if (blocked) throw Object.assign(new Error("Private network source URLs are not allowed."), { statusCode: 400 });
  return normalized;
};

const isPrivateAddress = (address) => {
  if (net.isIP(address) === 4) {
    return /^127\./.test(address) || /^10\./.test(address) || /^192\.168\./.test(address) || /^169\.254\./.test(address) || /^172\.(1[6-9]|2\d|3[01])\./.test(address) || address === "0.0.0.0";
  }
  const normalized = address.toLowerCase();
  return normalized === "::1" || normalized === "::" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb");
};

export const assertSafeRemoteHost = async (value) => {
  const normalized = assertSafeRemoteUrl(value);
  const records = await dns.lookup(new URL(normalized).hostname, { all: true, verbatim: true });
  if (!records.length || records.some((record) => isPrivateAddress(record.address))) {
    throw Object.assign(new Error("The source hostname does not resolve to a public address."), { statusCode: 400 });
  }
  return normalized;
};

export const normalizedJobFingerprint = ({ title, companyName, location, employmentType = "" }) => {
  const value = [title, companyName, location, employmentType]
    .map((item) => slugify(cleanText(item, 200)).replace(/-/g, " "))
    .join("|");
  return crypto.createHash("sha256").update(value).digest("hex");
};

export const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const publicJobFilter = (now = new Date()) => ({
  status: "published",
  postedAt: { $lte: now },
  $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }],
});
