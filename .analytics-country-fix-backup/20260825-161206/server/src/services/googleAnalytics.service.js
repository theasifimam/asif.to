import { BetaAnalyticsDataClient } from "@google-analytics/data";

const cache = new Map();
let client;

function configuration() {
  const propertyId = process.env.GA4_PROPERTY_ID?.replace(/^properties\//, "").trim();
  let clientEmail = process.env.GA4_CLIENT_EMAIL?.trim();
  let privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n");

  // A service account may be shared with Search Console after it is granted
  // access to the GA4 property. Explicit GA4 variables take precedence.
  if ((!clientEmail || !privateKey) && (process.env.GSC_SERVICE_ACCOUNT_BASE64 || process.env.GSC_SERVICE_ACCOUNT_JSON)) {
    try {
      const raw = process.env.GSC_SERVICE_ACCOUNT_BASE64
        ? Buffer.from(process.env.GSC_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8")
        : process.env.GSC_SERVICE_ACCOUNT_JSON;
      const account = JSON.parse(raw);
      clientEmail ||= account.client_email;
      privateKey ||= account.private_key?.replace(/\\n/g, "\n");
    } catch {
      // Configuration validation below returns a safe, actionable error.
    }
  }

  if (!propertyId) throw Object.assign(new Error("GA4 property ID is not configured"), { code: "GA4_NOT_CONFIGURED" });
  if (!clientEmail || !privateKey) throw Object.assign(new Error("GA4 service-account credentials are not configured"), { code: "GA4_NOT_CONFIGURED" });
  return { propertyId, clientEmail, privateKey };
}

function analyticsClient() {
  if (!client) {
    const config = configuration();
    client = new BetaAnalyticsDataClient({ credentials: { client_email: config.clientEmail, private_key: config.privateKey } });
  }
  return client;
}

async function cached(key, ttl, loader) {
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value;
  const value = await loader();
  cache.set(key, { value, expiresAt: Date.now() + ttl });
  return value;
}

const value = (row, index) => Number(row?.metricValues?.[index]?.value || 0);
const dimension = (row, index) => row?.dimensionValues?.[index]?.value || "";
const metricNames = (response) => response.metricHeaders?.map((item) => item.name) || [];
const rowObject = (response, row) => Object.fromEntries(metricNames(response).map((name, index) => [name, value(row, index)]));

function safeDates(start, end) {
  const valid = /^\d{4}-\d{2}-\d{2}$/;
  if (!valid.test(start || "") || !valid.test(end || "")) return { start: "28daysAgo", end: "today" };
  const startDate = new Date(`${start}T00:00:00Z`); const endDate = new Date(`${end}T00:00:00Z`);
  if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime()) || startDate > endDate || endDate - startDate > 366 * 86400000) return { start: "28daysAgo", end: "today" };
  const days = Math.round((endDate - startDate) / 86400000) + 1;
  const previousEndDate = new Date(startDate); previousEndDate.setUTCDate(previousEndDate.getUTCDate() - 1);
  const previousStartDate = new Date(previousEndDate); previousStartDate.setUTCDate(previousStartDate.getUTCDate() - days + 1);
  return { start, end, previousStart: previousStartDate.toISOString().slice(0, 10), previousEnd: previousEndDate.toISOString().slice(0, 10) };
}

async function run(request) {
  const { propertyId } = configuration();
  const [response] = await analyticsClient().runReport({ property: `properties/${propertyId}`, keepEmptyRows: false, ...request });
  return response;
}

export function isGa4Configured() {
  try { configuration(); return true; } catch { return false; }
}

export function ga4Error(error) {
  if (error?.code === "GA4_NOT_CONFIGURED") return { status: 503, message: error.message, code: error.code };
  if ([7, "PERMISSION_DENIED"].includes(error?.code)) return { status: 403, message: "GA4 permission denied. Grant the service account Viewer access to this GA4 property.", code: "GA4_PERMISSION_DENIED" };
  if ([8, "RESOURCE_EXHAUSTED"].includes(error?.code)) return { status: 429, message: "GA4 API quota is temporarily exhausted. Try again later.", code: "GA4_QUOTA_EXCEEDED" };
  return { status: 503, message: "Google Analytics is temporarily unavailable.", code: "GA4_UNAVAILABLE" };
}

export async function getGa4Workspace(startInput, endInput) {
  const { start, end, previousStart, previousEnd } = safeDates(startInput, endInput);
  const key = `workspace:${start}:${end}`;
  return cached(key, 15 * 60 * 1000, async () => {
    const dateRanges = [{ startDate: start, endDate: end }];
    const summaryMetricsList = ["activeUsers", "newUsers", "sessions", "screenPageViews", "userEngagementDuration", "engagedSessions", "engagementRate"];
    const [summary, previousSummary, trend, pages, landingPages, acquisition, countries, devices, browsers, events] = await Promise.all([
      run({ dateRanges, metrics: summaryMetricsList.map((name) => ({ name })) }),
      run({ dateRanges: [{ startDate: previousStart || "56daysAgo", endDate: previousEnd || "29daysAgo" }], metrics: summaryMetricsList.map((name) => ({ name })) }),
      run({ dateRanges, dimensions: [{ name: "date" }], metrics: ["activeUsers", "sessions", "screenPageViews"].map((name) => ({ name })), orderBys: [{ dimension: { dimensionName: "date" } }] }),
      run({ dateRanges, dimensions: [{ name: "pagePath" }, { name: "pageTitle" }], metrics: ["screenPageViews", "activeUsers", "userEngagementDuration"].map((name) => ({ name })), orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: 100 }),
      run({ dateRanges, dimensions: [{ name: "landingPagePlusQueryString" }], metrics: ["sessions", "activeUsers", "engagedSessions", "engagementRate"].map((name) => ({ name })), orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 50 }),
      run({ dateRanges, dimensions: [{ name: "sessionDefaultChannelGroup" }, { name: "sessionSourceMedium" }], metrics: ["activeUsers", "sessions", "engagedSessions", "engagementRate"].map((name) => ({ name })), orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 100 }),
      run({ dateRanges, dimensions: [{ name: "country" }], metrics: [{ name: "activeUsers" }, { name: "sessions" }], orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }], limit: 50 }),
      run({ dateRanges, dimensions: [{ name: "deviceCategory" }], metrics: [{ name: "activeUsers" }, { name: "sessions" }], orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }] }),
      run({ dateRanges, dimensions: [{ name: "browser" }], metrics: [{ name: "activeUsers" }, { name: "sessions" }], orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }], limit: 25 }),
      run({ dateRanges, dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }, { name: "totalUsers" }], orderBys: [{ metric: { metricName: "eventCount" }, desc: true }], limit: 100 }),
    ]);
    const summaryMetrics = summary.rows?.[0] ? rowObject(summary, summary.rows[0]) : Object.fromEntries(summaryMetricsList.map((name) => [name, 0]));
    const previousMetrics = previousSummary.rows?.[0] ? rowObject(previousSummary, previousSummary.rows[0]) : Object.fromEntries(summaryMetricsList.map((name) => [name, 0]));
    summaryMetrics.averageEngagementTime = summaryMetrics.activeUsers ? summaryMetrics.userEngagementDuration / summaryMetrics.activeUsers : 0;
    const changes = Object.fromEntries(summaryMetricsList.map((name) => [name, previousMetrics[name] ? ((summaryMetrics[name] - previousMetrics[name]) / previousMetrics[name]) * 100 : summaryMetrics[name] ? 100 : 0]));
    const mapRows = (response, dimensions) => (response.rows || []).map((row) => ({ ...Object.fromEntries(dimensions.map((name, index) => [name, dimension(row, index)])), ...rowObject(response, row) }));
    return {
      configured: true,
      range: { start, end },
      summary: summaryMetrics, changes,
      trend: mapRows(trend, ["date"]).map((row) => ({ ...row, date: row.date.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3") })),
      pages: mapRows(pages, ["pagePath", "pageTitle"]).map((row) => ({ ...row, averageEngagementTime: row.screenPageViews ? row.userEngagementDuration / row.screenPageViews : 0 })),
      landingPages: mapRows(landingPages, ["landingPage"]), acquisition: mapRows(acquisition, ["channel", "sourceMedium"]),
      audience: { countries: mapRows(countries, ["country"]), devices: mapRows(devices, ["device"]), browsers: mapRows(browsers, ["browser"]) },
      events: mapRows(events, ["eventName"]),
    };
  });
}

export async function getGa4Realtime() {
  return cached("realtime", 60 * 1000, async () => {
    const { propertyId } = configuration();
    const [response] = await analyticsClient().runRealtimeReport({ property: `properties/${propertyId}`, dimensions: ["unifiedScreenName", "country", "deviceCategory"].map((name) => ({ name })), metrics: [{ name: "activeUsers" }], limit: 100 });
    const rows = (response.rows || []).map((row) => ({ page: dimension(row, 0), country: dimension(row, 1), device: dimension(row, 2), activeUsers: value(row, 0) }));
    return { activeUsers: rows.reduce((sum, row) => sum + row.activeUsers, 0), rows };
  });
}
