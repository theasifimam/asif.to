import crypto from "crypto";

import AnalyticsDaily from "../models/AnalyticsDaily.js";
import AnalyticsIdentity from "../models/AnalyticsIdentity.js";
import AnalyticsSync from "../models/AnalyticsSync.js";
import SearchMetric from "../models/SearchMetric.js";

// ASIF_SIMPLE_ANALYTICS_V1

const ONE_DAY = 86400000;

const utcDay = (date) =>
  new Date(
    `${date.toISOString().slice(0, 10)}T00:00:00.000Z`,
  );

function dateRange(req) {
  const end = req.query.end
    ? utcDay(new Date(req.query.end))
    : utcDay(new Date());

  const start = req.query.start
    ? utcDay(new Date(req.query.start))
    : new Date(end);

  if (!req.query.start) {
    start.setUTCDate(start.getUTCDate() - 27);
  }

  const days =
    Math.max(
      1,
      Math.round((end - start) / ONE_DAY) + 1,
    );

  const previousEnd = new Date(start);
  previousEnd.setUTCDate(
    previousEnd.getUTCDate() - 1,
  );

  const previousStart = new Date(previousEnd);
  previousStart.setUTCDate(
    previousStart.getUTCDate() - days + 1,
  );

  return {
    start,
    end: new Date(end.getTime() + ONE_DAY),
    previousStart,
    previousEnd: new Date(
      previousEnd.getTime() + ONE_DAY,
    ),
    days,
  };
}

const pct = (current, previous) =>
  previous
    ? ((current - previous) / previous) * 100
    : current
      ? 100
      : 0;

const clean = (value, max = 255) =>
  String(value || "")
    .trim()
    .slice(0, max);

function normalizedPath(value = "/") {
  try {
    return (
      new URL(
        String(value || "/"),
        "https://asif.to",
      ).pathname || "/"
    );
  } catch {
    const raw = String(value || "/").split("?")[0];
    return raw.startsWith("/") ? raw : "/";
  }
}

function domainOf(value = "") {
  if (!value) return "";

  try {
    return new URL(value)
      .hostname
      .toLowerCase()
      .replace(/^www\./, "");
  } catch {
    return "";
  }
}

function canonicalSource(value = "") {
  const raw = clean(value, 120);
  const lower = raw.toLowerCase();

  const exact = {
    google: "Google",
    "google.com": "Google",
    bing: "Bing",
    "bing.com": "Bing",
    yahoo: "Yahoo",
    "yahoo.com": "Yahoo",
    duckduckgo: "DuckDuckGo",
    "duckduckgo.com": "DuckDuckGo",

    chatgpt: "ChatGPT",
    "chatgpt.com": "ChatGPT",
    openai: "ChatGPT",
    "openai.com": "ChatGPT",
    gemini: "Gemini",
    "gemini.google.com": "Gemini",
    perplexity: "Perplexity",
    "perplexity.ai": "Perplexity",
    claude: "Claude",
    "claude.ai": "Claude",

    instagram: "Instagram",
    "instagram.com": "Instagram",
    facebook: "Facebook",
    "facebook.com": "Facebook",
    linkedin: "LinkedIn",
    "linkedin.com": "LinkedIn",
    reddit: "Reddit",
    "reddit.com": "Reddit",
    twitter: "X / Twitter",
    x: "X / Twitter",
    "x.com": "X / Twitter",
    "twitter.com": "X / Twitter",
    "t.co": "X / Twitter",
    youtube: "YouTube",
    "youtube.com": "YouTube",
    github: "GitHub",
    "github.com": "GitHub",
    whatsapp: "WhatsApp",
    "whatsapp.com": "WhatsApp",
    telegram: "Telegram",
    "t.me": "Telegram",
    stackoverflow: "Stack Overflow",
    "stackoverflow.com": "Stack Overflow",
    medium: "Medium",
    "medium.com": "Medium",
    devto: "DEV Community",
    "dev.to": "DEV Community",

    direct: "Direct",
    "(direct)": "Direct",
  };

  if (exact[lower]) return exact[lower];

  if (/^google\./.test(lower)) return "Google";
  if (/^search\.yahoo\./.test(lower)) return "Yahoo";

  return raw || "Direct";
}

function sourceFrom({
  referrer = "",
  referrerDomain = "",
  utmSource = "",
  utmMedium = "",
  utmCampaign = "",
} = {}) {
  if (utmSource) {
    return {
      source: canonicalSource(utmSource),
      medium:
        clean(utmMedium, 80) || "campaign",
      campaign: clean(utmCampaign, 160),
      referrerDomain:
        clean(
          referrerDomain || domainOf(referrer),
          255,
        ),
    };
  }

  const host = clean(
    referrerDomain || domainOf(referrer),
    255,
  ).toLowerCase();

  if (
    !host ||
    host === "asif.to" ||
    host.endsWith(".asif.to") ||
    host === "localhost"
  ) {
    return {
      source: "Direct",
      medium: "direct",
      campaign: "",
      referrerDomain: "",
    };
  }

  if (
    /^google\./.test(host) ||
    host === "bing.com" ||
    host.endsWith(".bing.com") ||
    host.includes("yahoo.") ||
    host === "duckduckgo.com"
  ) {
    return {
      source: canonicalSource(host),
      medium: "organic",
      campaign: "",
      referrerDomain: host,
    };
  }

  const ai = {
    "chatgpt.com": "ChatGPT",
    "openai.com": "ChatGPT",
    "gemini.google.com": "Gemini",
    "perplexity.ai": "Perplexity",
    "claude.ai": "Claude",
  };

  if (ai[host]) {
    return {
      source: ai[host],
      medium: "ai",
      campaign: "",
      referrerDomain: host,
    };
  }

  const social = {
    "instagram.com": "Instagram",
    "facebook.com": "Facebook",
    "m.facebook.com": "Facebook",
    "linkedin.com": "LinkedIn",
    "reddit.com": "Reddit",
    "x.com": "X / Twitter",
    "twitter.com": "X / Twitter",
    "t.co": "X / Twitter",
    "youtube.com": "YouTube",
    "github.com": "GitHub",
    "web.whatsapp.com": "WhatsApp",
    "whatsapp.com": "WhatsApp",
    "t.me": "Telegram",
  };

  if (social[host]) {
    return {
      source: social[host],
      medium:
        host.includes("github")
          ? "referral"
          : "social",
      campaign: "",
      referrerDomain: host,
    };
  }

  return {
    source: canonicalSource(host),
    medium: "referral",
    campaign: "",
    referrerDomain: host,
  };
}

function countryFromRequest(req, fallback = "") {
  const candidates = [
    req.headers["cf-ipcountry"],
    req.headers["x-vercel-ip-country"],
    req.headers["x-country-code"],
    req.headers["cloudfront-viewer-country"],
    fallback,
  ];

  const value = candidates.find(
    (item) =>
      item &&
      /^[a-z]{2}$/i.test(String(item)),
  );

  return value
    ? String(value).toUpperCase()
    : "";
}

function hmac(value) {
  const secret =
    process.env.ANALYTICS_HASH_SECRET ||
    process.env.JWT_SECRET ||
    "asif-analytics";

  return crypto
    .createHmac("sha256", secret)
    .update(String(value))
    .digest("hex");
}

export const captureVisit = async (req, res) => {
  try {
    const {
      path,
      visitorId,
      sessionId,
      referrer = "",
      referrerDomain = "",
      landingPath = "",
      utmSource = "",
      utmMedium = "",
      utmCampaign = "",
      event = "pageview",
      engagementMs = 0,
      device = "other",
      country = "",
      timezone = "",
      language = "",
    } = req.body || {};

    if (!path || !visitorId || !sessionId) {
      return res.status(204).end();
    }

    const host = clean(req.headers.host, 255).toLowerCase();
    const origin = clean(req.headers.origin, 2048).toLowerCase();

    if (
      process.env.NODE_ENV !== "production" ||
      host.includes("localhost") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1")
    ) {
      return res.status(204).end();
    }

    const date = utcDay(new Date());
    const safePath = normalizedPath(path);

    const acquisition = sourceFrom({
      referrer,
      referrerDomain,
      utmSource,
      utmMedium,
      utmCampaign,
    });

    const safeDevice = [
      "desktop",
      "mobile",
      "tablet",
    ].includes(device)
      ? device
      : "other";

    const safeCountry = countryFromRequest(req, country);

    const dimensions = {
      date,
      path: safePath,
      source: acquisition.source,
      medium: acquisition.medium,
      campaign: acquisition.campaign,
      referrer: acquisition.referrerDomain,
      country: safeCountry,
      device: safeDevice,
    };

    if (event === "pageview") {
      await Promise.all([
        AnalyticsDaily.updateOne(
          dimensions,
          { $inc: { pageViews: 1 } },
          { upsert: true },
        ),
        AnalyticsIdentity.updateOne(
          {
            date,
            visitorHash: hmac(visitorId),
            sessionHash: hmac(sessionId),
            path: safePath,
          },
          {
            $set: {
              source: acquisition.source,
              medium: acquisition.medium,
              campaign: acquisition.campaign,
              referrerDomain: acquisition.referrerDomain,
              landingPath: normalizedPath(
                landingPath || safePath,
              ),
              country: safeCountry,
              device: safeDevice,
              timezone: clean(timezone, 100),
              language: clean(language, 32),
            },
          },
          { upsert: true },
        ),
      ]);
    }

    if (event === "engagement") {
      const safeEngagement = Math.min(
        Math.max(Number(engagementMs) || 0, 0),
        30 * 60 * 1000,
      );

      if (safeEngagement > 0) {
        await AnalyticsDaily.updateOne(
          dimensions,
          { $inc: { engagementMs: safeEngagement } },
          { upsert: true },
        );
      }
    }

    return res.status(204).end();
  } catch (error) {
    console.error("[ANALYTICS] capture visit", error);
    return res.status(204).end();
  }
};

async function trafficTotals(start, end) {
  const [daily, visitors, sessions] = await Promise.all([
    AnalyticsDaily.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: null,
          pageViews: { $sum: "$pageViews" },
          engagementMs: { $sum: "$engagementMs" },
        },
      },
    ]),
    AnalyticsIdentity.distinct("visitorHash", {
      date: { $gte: start, $lt: end },
    }),
    AnalyticsIdentity.distinct("sessionHash", {
      date: { $gte: start, $lt: end },
    }),
  ]);

  const pageViews = daily[0]?.pageViews || 0;

  return {
    visitors: visitors.length,
    sessions: sessions.length,
    pageViews,
    engagementTime: pageViews
      ? (daily[0]?.engagementMs || 0) / pageViews / 1000
      : 0,
  };
}

async function searchTotals(start, end) {
  const [row] = await SearchMetric.aggregate([
    {
      $match: {
        dimension: "total",
        date: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: null,
        clicks: { $sum: "$clicks" },
        impressions: { $sum: "$impressions" },
      },
    },
  ]);

  return {
    clicks: row?.clicks || 0,
    impressions: row?.impressions || 0,
  };
}

async function distinctTrend(start, end, field, label) {
  return AnalyticsIdentity.aggregate([
    { $match: { date: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: {
          date: "$date",
          value: `$${field}`,
        },
      },
    },
    {
      $group: {
        _id: "$_id.date",
        [label]: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
}

export const getSimpleOverview = async (req, res) => {
  try {
    const dates = dateRange(req);

    const [
      currentTraffic,
      previousTraffic,
      currentSearch,
      previousSearch,
      dailyViews,
      visitorTrend,
      sessionTrend,
      searchTrend,
      sync,
    ] = await Promise.all([
      trafficTotals(dates.start, dates.end),
      trafficTotals(dates.previousStart, dates.previousEnd),
      searchTotals(dates.start, dates.end),
      searchTotals(dates.previousStart, dates.previousEnd),
      AnalyticsDaily.aggregate([
        { $match: { date: { $gte: dates.start, $lt: dates.end } } },
        {
          $group: {
            _id: "$date",
            pageViews: { $sum: "$pageViews" },
            engagementMs: { $sum: "$engagementMs" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      distinctTrend(dates.start, dates.end, "visitorHash", "visitors"),
      distinctTrend(dates.start, dates.end, "sessionHash", "sessions"),
      SearchMetric.find({
        dimension: "total",
        date: { $gte: dates.start, $lt: dates.end },
      })
        .sort({ date: 1 })
        .lean(),
      AnalyticsSync.findOne({
        provider: "search-console",
      }).lean(),
    ]);

    const viewMap = new Map(
      dailyViews.map((row) => [
        row._id.toISOString().slice(0, 10),
        row,
      ]),
    );
    const visitorMap = new Map(
      visitorTrend.map((row) => [
        row._id.toISOString().slice(0, 10),
        row.visitors,
      ]),
    );
    const sessionMap = new Map(
      sessionTrend.map((row) => [
        row._id.toISOString().slice(0, 10),
        row.sessions,
      ]),
    );
    const searchMap = new Map(
      searchTrend.map((row) => [
        row.date.toISOString().slice(0, 10),
        row,
      ]),
    );

    const trend = [];

    for (
      let cursor = new Date(dates.start);
      cursor < dates.end;
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    ) {
      const date = cursor.toISOString().slice(0, 10);
      const local = viewMap.get(date);
      const search = searchMap.get(date);

      trend.push({
        date,
        visitors: visitorMap.get(date) || 0,
        sessions: sessionMap.get(date) || 0,
        pageViews: local?.pageViews || 0,
        engagementTime:
          local?.pageViews
            ? (local.engagementMs || 0) / local.pageViews / 1000
            : 0,
        clicks: search?.clicks || 0,
        impressions: search?.impressions || 0,
      });
    }

    const current = {
      ...currentTraffic,
      searchClicks: currentSearch.clicks,
      searchImpressions: currentSearch.impressions,
    };

    const previous = {
      ...previousTraffic,
      searchClicks: previousSearch.clicks,
      searchImpressions: previousSearch.impressions,
    };

    res.json({
      success: true,
      data: {
        metrics: Object.fromEntries(
          Object.entries(current).map(([key, value]) => [
            key,
            {
              value,
              change: pct(value, previous[key]),
            },
          ]),
        ),
        trend,
        sync: {
          status: sync?.status || "idle",
          lastSyncedAt: sync?.lastSyncedAt || null,
          syncedThrough: sync?.syncedThrough || null,
          error: sync?.error || "",
        },
      },
    });
  } catch (error) {
    console.error("[ANALYTICS] simple overview", error);
    res.status(500).json({
      success: false,
      message: "Unable to load analytics overview",
    });
  }
};

function pagination(req) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(
    50,
    Math.max(10, Number(req.query.limit) || 15),
  );
  return { page, limit };
}

function sortRows(rows, field, direction = "desc") {
  const sign = direction === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    const left = a[field];
    const right = b[field];

    if (
      typeof left === "number" &&
      typeof right === "number"
    ) {
      return (left - right) * sign;
    }

    return (
      String(left || "").localeCompare(String(right || "")) * sign
    );
  });
}

function paginateRows(rows, page, limit) {
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, pages);

  return {
    rows: rows.slice(
      (safePage - 1) * limit,
      safePage * limit,
    ),
    pagination: {
      page: safePage,
      limit,
      total,
      pages,
    },
  };
}

async function distinctDimensionCounts(
  start,
  end,
  keyField,
  extraField = null,
) {
  const id = {
    key: `$${keyField}`,
    ...(extraField ? { extra: `$${extraField}` } : {}),
  };

  const baseMatch = {
    date: { $gte: start, $lt: end },
    [keyField]: { $exists: true, $nin: ["", null] },
  };

  const [visitors, sessions] = await Promise.all([
    AnalyticsIdentity.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: {
            ...id,
            value: "$visitorHash",
          },
        },
      },
      {
        $group: {
          _id: {
            key: "$_id.key",
            ...(extraField ? { extra: "$_id.extra" } : {}),
          },
          visitors: { $sum: 1 },
        },
      },
    ]),
    AnalyticsIdentity.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: {
            ...id,
            value: "$sessionHash",
          },
        },
      },
      {
        $group: {
          _id: {
            key: "$_id.key",
            ...(extraField ? { extra: "$_id.extra" } : {}),
          },
          sessions: { $sum: 1 },
        },
      },
    ]),
  ]);

  return { visitors, sessions };
}

function mergeIdentityCounts(map, rows, field) {
  for (const row of rows) {
    const key = JSON.stringify(row._id || {});
    const current =
      map.get(key) || {
        key: row._id?.key || "",
        extra: row._id?.extra || "",
        pageViews: 0,
        engagementMs: 0,
        visitors: 0,
        sessions: 0,
      };

    current[field] = row[field] || 0;
    map.set(key, current);
  }
}

export const getAcquisition = async (req, res) => {
  try {
    const dates = dateRange(req);
    const { page, limit } = pagination(req);

    const dimension = [
      "source",
      "referrer",
      "campaign",
    ].includes(req.query.dimension)
      ? req.query.dimension
      : "source";

    const keyField =
      dimension === "referrer"
        ? "referrer"
        : dimension;

    const identityField =
      dimension === "referrer"
        ? "referrerDomain"
        : dimension;

    const extraField =
      dimension === "source"
        ? "medium"
        : null;

    const match = {
      date: { $gte: dates.start, $lt: dates.end },
      [keyField]: {
        $exists: true,
        $nin: ["", null],
      },
    };

    if (dimension === "source") {
      match.source = {
        $nin: ["", "Internal", null],
      };
    }

    const groupId = {
      key: `$${keyField}`,
      ...(extraField ? { extra: `$${extraField}` } : {}),
    };

    const [dailyRows, identity] = await Promise.all([
      AnalyticsDaily.aggregate([
        { $match: match },
        {
          $group: {
            _id: groupId,
            pageViews: { $sum: "$pageViews" },
            engagementMs: { $sum: "$engagementMs" },
          },
        },
      ]),
      distinctDimensionCounts(
        dates.start,
        dates.end,
        identityField,
        extraField,
      ),
    ]);

    const map = new Map();

    for (const row of dailyRows) {
      let key = row._id?.key || "";
      const extra = row._id?.extra || "";

      if (dimension === "source") {
        key = canonicalSource(key);
      }

      const mapKey = JSON.stringify({ key, extra });

      const current =
        map.get(mapKey) || {
          key,
          extra,
          pageViews: 0,
          engagementMs: 0,
          visitors: 0,
          sessions: 0,
        };

      current.pageViews += row.pageViews || 0;
      current.engagementMs += row.engagementMs || 0;

      map.set(mapKey, current);
    }

    const identityMap = new Map();
    mergeIdentityCounts(identityMap, identity.visitors, "visitors");
    mergeIdentityCounts(identityMap, identity.sessions, "sessions");

    for (const item of identityMap.values()) {
      const key =
        dimension === "source"
          ? canonicalSource(item.key)
          : item.key;

      const mapKey = JSON.stringify({
        key,
        extra: item.extra || "",
      });

      const current =
        map.get(mapKey) || {
          key,
          extra: item.extra || "",
          pageViews: 0,
          engagementMs: 0,
          visitors: 0,
          sessions: 0,
        };

      current.visitors += item.visitors || 0;
      current.sessions += item.sessions || 0;

      map.set(mapKey, current);
    }

    let rows = Array.from(map.values()).map((row) => ({
      ...row,
      avgEngagement:
        row.pageViews
          ? row.engagementMs / row.pageViews / 1000
          : 0,
    }));

    const search = clean(req.query.search, 120).toLowerCase();

    if (search) {
      rows = rows.filter((row) =>
        `${row.key} ${row.extra}`
          .toLowerCase()
          .includes(search),
      );
    }

    const sortField = [
      "pageViews",
      "visitors",
      "sessions",
      "avgEngagement",
      "key",
    ].includes(req.query.sort)
      ? req.query.sort
      : "pageViews";

    rows = sortRows(rows, sortField, req.query.direction);
    const chart = rows.slice(0, 8);

    res.json({
      success: true,
      data: {
        dimension,
        chart,
        ...paginateRows(rows, page, limit),
      },
    });
  } catch (error) {
    console.error("[ANALYTICS] acquisition", error);
    res.status(500).json({
      success: false,
      message: "Unable to load acquisition analytics",
    });
  }
};

function normalizePathExpression() {
  return {
    $arrayElemAt: [
      { $split: ["$path", "?"] },
      0,
    ],
  };
}

export const getLocalContent = async (req, res) => {
  try {
    const dates = dateRange(req);
    const { page, limit } = pagination(req);

    const [daily, visitors, sessions] = await Promise.all([
      AnalyticsDaily.aggregate([
        {
          $match: {
            date: { $gte: dates.start, $lt: dates.end },
          },
        },
        {
          $group: {
            _id: normalizePathExpression(),
            pageViews: { $sum: "$pageViews" },
            engagementMs: { $sum: "$engagementMs" },
          },
        },
      ]),
      AnalyticsIdentity.aggregate([
        {
          $match: {
            date: { $gte: dates.start, $lt: dates.end },
          },
        },
        {
          $group: {
            _id: {
              path: normalizePathExpression(),
              visitor: "$visitorHash",
            },
          },
        },
        {
          $group: {
            _id: "$_id.path",
            visitors: { $sum: 1 },
          },
        },
      ]),
      AnalyticsIdentity.aggregate([
        {
          $match: {
            date: { $gte: dates.start, $lt: dates.end },
          },
        },
        {
          $group: {
            _id: {
              path: normalizePathExpression(),
              session: "$sessionHash",
            },
          },
        },
        {
          $group: {
            _id: "$_id.path",
            sessions: { $sum: 1 },
          },
        },
      ]),
    ]);

    const map = new Map();

    for (const row of daily) {
      map.set(row._id, {
        path: row._id || "/",
        pageViews: row.pageViews || 0,
        engagementMs: row.engagementMs || 0,
        visitors: 0,
        sessions: 0,
      });
    }

    for (const row of visitors) {
      const current =
        map.get(row._id) || {
          path: row._id || "/",
          pageViews: 0,
          engagementMs: 0,
          visitors: 0,
          sessions: 0,
        };

      current.visitors = row.visitors || 0;
      map.set(row._id, current);
    }

    for (const row of sessions) {
      const current =
        map.get(row._id) || {
          path: row._id || "/",
          pageViews: 0,
          engagementMs: 0,
          visitors: 0,
          sessions: 0,
        };

      current.sessions = row.sessions || 0;
      map.set(row._id, current);
    }

    let rows = Array.from(map.values())
      .filter(
        (row) =>
          row.path &&
          !row.path.startsWith("/api/"),
      )
      .map((row) => ({
        ...row,
        avgEngagement:
          row.pageViews
            ? row.engagementMs / row.pageViews / 1000
            : 0,
      }));

    const search = clean(req.query.search, 160).toLowerCase();

    if (search) {
      rows = rows.filter((row) =>
        row.path.toLowerCase().includes(search),
      );
    }

    const sortField = [
      "pageViews",
      "visitors",
      "sessions",
      "avgEngagement",
      "path",
    ].includes(req.query.sort)
      ? req.query.sort
      : "pageViews";

    rows = sortRows(rows, sortField, req.query.direction);
    const chart = rows.slice(0, 8);

    res.json({
      success: true,
      data: {
        chart,
        ...paginateRows(rows, page, limit),
      },
    });
  } catch (error) {
    console.error("[ANALYTICS] local content", error);
    res.status(500).json({
      success: false,
      message: "Unable to load content analytics",
    });
  }
};

async function identityLocationRows(start, end, field) {
  const match = {
    date: { $gte: start, $lt: end },
    [field]: {
      $exists: true,
      $nin: ["", null],
    },
  };

  const [visitors, sessions] = await Promise.all([
    AnalyticsIdentity.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            key: `$${field}`,
            visitor: "$visitorHash",
          },
        },
      },
      {
        $group: {
          _id: "$_id.key",
          visitors: { $sum: 1 },
        },
      },
    ]),
    AnalyticsIdentity.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            key: `$${field}`,
            session: "$sessionHash",
          },
        },
      },
      {
        $group: {
          _id: "$_id.key",
          sessions: { $sum: 1 },
        },
      },
    ]),
  ]);

  return { visitors, sessions };
}

export const getLocations = async (req, res) => {
  try {
    const dates = dateRange(req);
    const { page, limit } = pagination(req);

    const dimension =
      req.query.dimension === "country"
        ? "country"
        : "timezone";

    const identity = await identityLocationRows(
      dates.start,
      dates.end,
      dimension,
    );

    const map = new Map();

    for (const row of identity.visitors) {
      map.set(row._id, {
        key: row._id,
        visitors: row.visitors || 0,
        sessions: 0,
        pageViews: 0,
      });
    }

    for (const row of identity.sessions) {
      const current =
        map.get(row._id) || {
          key: row._id,
          visitors: 0,
          sessions: 0,
          pageViews: 0,
        };

      current.sessions = row.sessions || 0;
      map.set(row._id, current);
    }

    if (dimension === "country") {
      const daily = await AnalyticsDaily.aggregate([
        {
          $match: {
            date: { $gte: dates.start, $lt: dates.end },
            country: {
              $exists: true,
              $nin: ["", null],
            },
          },
        },
        {
          $group: {
            _id: "$country",
            pageViews: { $sum: "$pageViews" },
          },
        },
      ]);

      for (const row of daily) {
        const current =
          map.get(row._id) || {
            key: row._id,
            visitors: 0,
            sessions: 0,
            pageViews: 0,
          };

        current.pageViews = row.pageViews || 0;
        map.set(row._id, current);
      }
    }

    let rows = Array.from(map.values());

    const search = clean(req.query.search, 100).toLowerCase();

    if (search) {
      rows = rows.filter((row) =>
        row.key.toLowerCase().includes(search),
      );
    }

    const sortField = [
      "visitors",
      "sessions",
      "pageViews",
      "key",
    ].includes(req.query.sort)
      ? req.query.sort
      : "visitors";

    rows = sortRows(rows, sortField, req.query.direction);
    const chart = rows.slice(0, 8);

    res.json({
      success: true,
      data: {
        dimension,
        chart,
        ...paginateRows(rows, page, limit),
      },
    });
  } catch (error) {
    console.error("[ANALYTICS] locations", error);
    res.status(500).json({
      success: false,
      message: "Unable to load location analytics",
    });
  }
};

export const getDevices = async (req, res) => {
  try {
    const dates = dateRange(req);

    const [daily, visitors, sessions] = await Promise.all([
      AnalyticsDaily.aggregate([
        {
          $match: {
            date: { $gte: dates.start, $lt: dates.end },
          },
        },
        {
          $group: {
            _id: "$device",
            pageViews: { $sum: "$pageViews" },
          },
        },
      ]),
      AnalyticsIdentity.aggregate([
        {
          $match: {
            date: { $gte: dates.start, $lt: dates.end },
          },
        },
        {
          $group: {
            _id: {
              device: "$device",
              visitor: "$visitorHash",
            },
          },
        },
        {
          $group: {
            _id: "$_id.device",
            visitors: { $sum: 1 },
          },
        },
      ]),
      AnalyticsIdentity.aggregate([
        {
          $match: {
            date: { $gte: dates.start, $lt: dates.end },
          },
        },
        {
          $group: {
            _id: {
              device: "$device",
              session: "$sessionHash",
            },
          },
        },
        {
          $group: {
            _id: "$_id.device",
            sessions: { $sum: 1 },
          },
        },
      ]),
    ]);

    const map = new Map();

    for (const row of daily) {
      map.set(row._id || "other", {
        key: row._id || "other",
        pageViews: row.pageViews || 0,
        visitors: 0,
        sessions: 0,
      });
    }

    for (const row of visitors) {
      const key = row._id || "other";
      const current =
        map.get(key) || {
          key,
          pageViews: 0,
          visitors: 0,
          sessions: 0,
        };

      current.visitors = row.visitors || 0;
      map.set(key, current);
    }

    for (const row of sessions) {
      const key = row._id || "other";
      const current =
        map.get(key) || {
          key,
          pageViews: 0,
          visitors: 0,
          sessions: 0,
        };

      current.sessions = row.sessions || 0;
      map.set(key, current);
    }

    const rows = sortRows(
      Array.from(map.values()),
      "pageViews",
      "desc",
    );

    res.json({
      success: true,
      data: {
        rows,
        totalPageViews: rows.reduce(
          (sum, row) => sum + row.pageViews,
          0,
        ),
      },
    });
  } catch (error) {
    console.error("[ANALYTICS] devices", error);
    res.status(500).json({
      success: false,
      message: "Unable to load device analytics",
    });
  }
};
