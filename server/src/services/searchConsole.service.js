import crypto from "crypto";
import SearchMetric from "../models/SearchMetric.js";
import AnalyticsSync from "../models/AnalyticsSync.js";

let tokenCache = { token: "", expiresAt: 0 };
const day = (value) => new Date(`${value}T00:00:00.000Z`);
const isoDay = (value) => new Date(value).toISOString().slice(0, 10);
const base64url = (value) => Buffer.from(value).toString("base64url");

function credentials() {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  const encoded = process.env.GSC_SERVICE_ACCOUNT_BASE64;
  if (!raw && !encoded) throw new Error("GSC_SERVICE_ACCOUNT_BASE64 is not configured");
  let parsed;
  try {
    parsed = JSON.parse(encoded ? Buffer.from(encoded, "base64").toString("utf8") : raw);
  } catch {
    throw new Error(
      "Search Console credentials are invalid. Base64-encode the downloaded Google service-account JSON file and set GSC_SERVICE_ACCOUNT_BASE64.",
    );
  }
  if (!parsed.client_email || !parsed.private_key) throw new Error("Search Console service account credentials are incomplete");
  parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  return parsed;
}

async function accessToken() {
  if (tokenCache.token && tokenCache.expiresAt > Date.now() + 60000) return tokenCache.token;
  const account = credentials(); const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(JSON.stringify({ iss: account.client_email, scope: "https://www.googleapis.com/auth/webmasters.readonly", aud: account.token_uri || "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  const unsigned = `${header}.${claim}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(unsigned), account.private_key).toString("base64url");
  const response = await fetch(account.token_uri || "https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${signature}` }) });
  const body = await response.json(); if (!response.ok) throw new Error(body.error_description || body.error || "Google authentication failed");
  tokenCache = { token: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 }; return body.access_token;
}

async function fetchRows(startDate, endDate, dimensions) {
  const token = await accessToken(); const site = process.env.GSC_SITE_URL || "https://asif.to/"; const all = []; let startRow = 0;
  do {
    const response = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ startDate, endDate, dimensions, rowLimit: 25000, startRow, dataState: "final" }) });
    const body = await response.json(); if (!response.ok) throw new Error(body.error?.message || "Search Console request failed");
    const rows = body.rows || []; all.push(...rows); if (rows.length < 25000) break; startRow += rows.length;
  } while (startRow < 250000);
  return all;
}

const dimensionPlans = [
  { dimension: "total", api: ["date"], map: ([date]) => ({ date: day(date) }) },
  { dimension: "queryPage", api: ["date", "query", "page"], map: ([date, query, page]) => ({ date: day(date), query, page }) },
  { dimension: "country", api: ["date", "country"], map: ([date, key]) => ({ date: day(date), key }) },
  { dimension: "device", api: ["date", "device"], map: ([date, key]) => ({ date: day(date), key }) },
  // Google does not permit searchAppearance to be grouped with any other
  // dimension (including date). Store the range aggregate on its end date.
  { dimension: "appearance", api: ["searchAppearance"], map: ([key], context) => ({ date: day(context.endDate), key }) },
];

export async function syncSearchConsole() {
  let status = await AnalyticsSync.findOne({ provider: "search-console" });
  if (status?.status === "syncing") throw new Error("A Search Console sync is already running");
  status = await AnalyticsSync.findOneAndUpdate(
    { provider: "search-console" },
    { $set: { status: "syncing", lastStartedAt: new Date(), error: "" } },
    { returnDocument: "after", upsert: true },
  );
  try {
    const today = new Date(); const end = new Date(today); end.setUTCDate(end.getUTCDate() - 3);
    const previous = status.syncedThrough ? new Date(status.syncedThrough) : null;
    const start = previous ? new Date(previous) : new Date(end);
    start.setUTCDate(start.getUTCDate() - (previous ? 7 : Number(process.env.GSC_INITIAL_SYNC_DAYS || 480)));
    let rowsSynced = 0;
    for (const plan of dimensionPlans) {
      const rows = await fetchRows(isoDay(start), isoDay(end), plan.api);
      if (rows.length) {
        const operations = rows.map((row) => {
          const identity = {
            dimension: plan.dimension,
            query: "",
            page: "",
            key: "",
            ...plan.map(row.keys || [], { startDate: isoDay(start), endDate: isoDay(end) }),
          };
          return { updateOne: { filter: identity, update: { $set: { ...identity, clicks: row.clicks || 0, impressions: row.impressions || 0, ctr: row.ctr || 0, position: row.position || 0 } }, upsert: true } };
        });
        for (let index = 0; index < operations.length; index += 1000) await SearchMetric.bulkWrite(operations.slice(index, index + 1000), { ordered: false });
        rowsSynced += rows.length;
      }
    }
    await AnalyticsSync.findByIdAndUpdate(status._id, { status: "success", lastSyncedAt: new Date(), syncedThrough: end, rowsSynced, error: "" });
    return { rowsSynced, syncedThrough: end };
  } catch (error) {
    await AnalyticsSync.findByIdAndUpdate(status._id, { status: "error", error: String(error.message || error).slice(0, 1000) }); throw error;
  }
}

export function isSearchConsoleConfigured() { return Boolean((process.env.GSC_SERVICE_ACCOUNT_BASE64 || process.env.GSC_SERVICE_ACCOUNT_JSON) && process.env.GSC_SITE_URL); }
