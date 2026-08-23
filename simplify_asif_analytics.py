#!/usr/bin/env python3
from __future__ import annotations

import argparse
import shutil
from datetime import datetime
from pathlib import Path
from textwrap import dedent

MARKER = "ASIF_SIMPLE_ANALYTICS_V1"

IDENTITY_MODEL = dedent(r'''
import { Schema, model } from "mongoose";

// ASIF_SIMPLE_ANALYTICS_V1
const analyticsIdentitySchema = new Schema(
  {
    date: { type: Date, required: true },
    visitorHash: { type: String, required: true, maxlength: 64 },
    sessionHash: { type: String, required: true, maxlength: 64 },
    path: { type: String, required: true, maxlength: 2048 },

    source: { type: String, default: "", maxlength: 120 },
    medium: { type: String, default: "", maxlength: 80 },
    campaign: { type: String, default: "", maxlength: 160 },
    referrerDomain: { type: String, default: "", maxlength: 255 },
    landingPath: { type: String, default: "", maxlength: 2048 },

    country: { type: String, default: "", maxlength: 8 },
    device: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "other"],
      default: "other",
    },
    timezone: { type: String, default: "", maxlength: 100 },
    language: { type: String, default: "", maxlength: 32 },
  },
  { timestamps: true },
);

analyticsIdentitySchema.index(
  { date: 1, visitorHash: 1, sessionHash: 1, path: 1 },
  { unique: true },
);
analyticsIdentitySchema.index({ date: 1, visitorHash: 1 });
analyticsIdentitySchema.index({ date: 1, sessionHash: 1 });
analyticsIdentitySchema.index({ date: 1, source: 1, medium: 1 });
analyticsIdentitySchema.index({ date: 1, country: 1 });
analyticsIdentitySchema.index({ date: 1, timezone: 1 });
analyticsIdentitySchema.index({ date: 1, device: 1 });
analyticsIdentitySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 34560000 },
);

export default model("AnalyticsIdentity", analyticsIdentitySchema);
''').lstrip()

TRACKER = dedent(r'''
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;
const ATTRIBUTION_KEY = "asif_session_attribution";

const id = (key, session = false) => {
  const store = session ? sessionStorage : localStorage;
  let value = store.getItem(key);

  if (!value) {
    value = crypto.randomUUID();
    store.setItem(key, value);
  }

  return value;
};

const isLocalhost = () => {
  if (typeof window === "undefined") return true;

  const hostname = window.location.hostname;

  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".local")
  );
};

function safeDomain(value = "") {
  if (!value) return "";

  try {
    return new URL(value).hostname
      .toLowerCase()
      .replace(/^www\./, "");
  } catch {
    return "";
  }
}

function initialAttribution(pathname, searchParams) {
  const existing = sessionStorage.getItem(ATTRIBUTION_KEY);

  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      sessionStorage.removeItem(ATTRIBUTION_KEY);
    }
  }

  const params = new URLSearchParams(searchParams.toString());
  const referrer = document.referrer || "";
  const referrerDomain = safeDomain(referrer);

  const attribution = {
    landingPath: pathname || "/",
    referrer,
    referrerDomain,

    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",

    timezone:
      Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    language:
      navigator.language ||
      navigator.languages?.[0] ||
      "",
  };

  sessionStorage.setItem(
    ATTRIBUTION_KEY,
    JSON.stringify(attribution),
  );

  return attribution;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    if (
      isLocalhost() ||
      !API ||
      navigator.doNotTrack === "1"
    ) {
      return;
    }

    const started = Date.now();
    const width = window.innerWidth;
    const attribution = initialAttribution(
      pathname,
      search,
    );

    const payload = {
      path: pathname || "/",
      visitorId: id("asif_visitor_id"),
      sessionId: id("asif_session_id", true),

      device:
        width < 768
          ? "mobile"
          : width < 1024
            ? "tablet"
            : "desktop",

      ...attribution,
    };

    fetch(`${API}/analytics/visit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        event: "pageview",
      }),
      keepalive: true,
    }).catch(() => {});

    return () => {
      const engagementMs = Math.min(
        Date.now() - started,
        30 * 60 * 1000,
      );

      const body = JSON.stringify({
        ...payload,
        event: "engagement",
        engagementMs,
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          `${API}/analytics/visit`,
          new Blob([body], {
            type: "application/json",
          }),
        );
      } else {
        fetch(`${API}/analytics/visit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, [pathname, search]);

  return null;
}
''').lstrip()

SIMPLE_CONTROLLER = dedent(r'''
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
''').lstrip()

CHARTS = dedent(r'''
"use client";

import { useMemo, useRef, useState } from "react";

// ASIF_SIMPLE_ANALYTICS_V1
const COLORS = [
  "#2563eb",
  "#8b5cf6",
  "#14b8a6",
  "#f59e0b",
  "#ec4899",
  "#22c55e",
  "#0ea5e9",
  "#f97316",
];

const compact = (value) =>
  Intl.NumberFormat(undefined, {
    notation:
      Math.abs(Number(value) || 0) >= 1000
        ? "compact"
        : "standard",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

const dateLabel = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
    },
  );

export function TrendChart({
  data = [],
  series = [],
  height = 250,
}) {
  const [hovered, setHovered] = useState(null);
  const ref = useRef(null);

  const width = 900;
  const innerHeight = 190;

  const prepared = useMemo(() => {
    const max = Math.max(
      1,
      ...series.flatMap((item) =>
        data.map(
          (row) => Number(row[item.key]) || 0,
        ),
      ),
    );

    return series.map((item, seriesIndex) => {
      const points = data.map((row, index) => {
        const value = Number(row[item.key]) || 0;

        return {
          value,
          x:
            (index /
              Math.max(data.length - 1, 1)) *
            width,
          y:
            innerHeight -
            (value / max) * (innerHeight - 18),
        };
      });

      return {
        ...item,
        color:
          item.color ||
          COLORS[seriesIndex % COLORS.length],
        points,
        polyline: points
          .map((point) => `${point.x},${point.y}`)
          .join(" "),
      };
    });
  }, [data, series]);

  if (!data.length) {
    return <EmptyChart text="No trend data yet" />;
  }

  const move = (event) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(
        1,
        (event.clientX - rect.left) / rect.width,
      ),
    );

    setHovered(
      Math.round(
        ratio * Math.max(data.length - 1, 0),
      ),
    );
  };

  const hoverX =
    hovered === null
      ? 0
      : (hovered /
          Math.max(data.length - 1, 1)) *
        width;

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-[#121215]"
      style={{ height }}
    >
      <div className="mb-2 flex flex-wrap gap-4 px-1">
        {prepared.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </div>
        ))}
      </div>

      <svg
        ref={ref}
        viewBox={`0 0 ${width} 210`}
        preserveAspectRatio="none"
        className="h-[calc(100%-42px)] w-full touch-none"
        onPointerMove={move}
        onPointerLeave={() => setHovered(null)}
      >
        {[0, 1, 2, 3].map((line) => (
          <line
            key={line}
            x1="0"
            x2={width}
            y1={line * 60}
            y2={line * 60}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 7"
            className="text-zinc-200 dark:text-zinc-800"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {prepared.map((item) => (
          <polyline
            key={item.key}
            points={item.polyline}
            fill="none"
            stroke={item.color}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {hovered !== null && (
          <line
            x1={hoverX}
            x2={hoverX}
            y1="0"
            y2="190"
            stroke="currentColor"
            strokeDasharray="4 4"
            className="text-zinc-400"
            vectorEffect="non-scaling-stroke"
          />
        )}

        <rect
          x="0"
          y="0"
          width={width}
          height="210"
          fill="transparent"
        />
      </svg>

      <div className="absolute bottom-3 left-5 right-5 flex justify-between text-[9px] font-bold text-zinc-400">
        <span>{dateLabel(data[0]?.date)}</span>
        <span>
          {dateLabel(
            data[Math.floor((data.length - 1) / 2)]?.date,
          )}
        </span>
        <span>{dateLabel(data[data.length - 1]?.date)}</span>
      </div>

      {hovered !== null && data[hovered] && (
        <div
          className="pointer-events-none absolute top-12 z-10 min-w-40 rounded-2xl border border-zinc-200 bg-white/95 p-3 text-xs shadow-xl backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95"
          style={{
            left: `${Math.min(
              72,
              Math.max(
                2,
                (hovered / Math.max(data.length - 1, 1)) *
                  100 -
                  8,
              ),
            )}%`,
          }}
        >
          <div className="font-black">
            {dateLabel(data[hovered].date)}
          </div>

          <div className="mt-2 space-y-1.5">
            {prepared.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-5"
              >
                <span className="text-zinc-500">
                  {item.label}
                </span>
                <strong>
                  {compact(data[hovered][item.key])}
                </strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function HorizontalBarChart({
  rows = [],
  labelKey = "key",
  valueKey = "pageViews",
  valueLabel = "views",
}) {
  const items = rows.slice(0, 8);
  const max = Math.max(
    1,
    ...items.map((row) => Number(row[valueKey]) || 0),
  );

  if (!items.length) {
    return <EmptyChart text="No comparison data yet" />;
  }

  return (
    <div className="space-y-3">
      {items.map((row, index) => {
        const value = Number(row[valueKey]) || 0;

        return (
          <div key={`${row[labelKey]}-${index}`}>
            <div className="mb-1.5 flex items-center justify-between gap-4 text-[11px]">
              <span
                className="min-w-0 truncate font-bold text-zinc-700 dark:text-zinc-200"
                title={row[labelKey]}
              >
                {row[labelKey] || "Unknown"}
              </span>
              <span className="shrink-0 font-black text-zinc-500">
                {compact(value)} {valueLabel}
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{
                  width: `${Math.max(
                    value ? (value / max) * 100 : 0,
                    value ? 3 : 0,
                  )}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DonutChart({
  rows = [],
  valueKey = "pageViews",
}) {
  const items = rows.filter(
    (row) => Number(row[valueKey]) > 0,
  );

  const total = items.reduce(
    (sum, row) =>
      sum + (Number(row[valueKey]) || 0),
    0,
  );

  if (!total) {
    return <EmptyChart text="No device data yet" />;
  }

  let offset = 0;

  const circles = items.map((row, index) => {
    const value = Number(row[valueKey]) || 0;
    const percent = (value / total) * 100;

    const item = {
      ...row,
      value,
      percent,
      offset,
      color: COLORS[index % COLORS.length],
    };

    offset += percent;
    return item;
  });

  return (
    <div className="grid items-center gap-5 sm:grid-cols-[180px_1fr]">
      <div className="relative mx-auto h-40 w-40">
        <svg viewBox="0 0 42 42" className="-rotate-90">
          <circle
            cx="21"
            cy="21"
            r="15.9155"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="6"
            className="text-zinc-100 dark:text-zinc-800"
          />

          {circles.map((item) => (
            <circle
              key={item.key}
              cx="21"
              cy="21"
              r="15.9155"
              fill="transparent"
              stroke={item.color}
              strokeWidth="6"
              strokeDasharray={`${item.percent} ${100 - item.percent}`}
              strokeDashoffset={-item.offset}
            />
          ))}
        </svg>

        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-xl font-black">
              {compact(total)}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
              page views
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {circles.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="flex items-center gap-2 font-bold capitalize text-zinc-600 dark:text-zinc-300">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.key || "other"}
            </span>

            <span className="font-black">
              {item.percent.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyChart({ text }) {
  return (
    <div className="grid min-h-44 place-items-center rounded-2xl border border-dashed border-zinc-200 text-xs font-semibold text-zinc-400 dark:border-zinc-800">
      {text}
    </div>
  );
}
''').lstrip()

TABLE = dedent(r'''
"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ASIF_SIMPLE_ANALYTICS_V1
export default function AnalyticsDataTable({
  columns = [],
  rows = [],
  pagination,
  onPage,
  empty = "No data for this period.",
}) {
  const page = pagination?.page || 1;
  const pages = pagination?.pages || 1;
  const total = pagination?.total || 0;
  const limit = pagination?.limit || 15;

  const from = total
    ? (page - 1) * limit + 1
    : 0;
  const to = Math.min(page * limit, total);

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-[#121215]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-180 text-left">
          <thead className="border-b border-zinc-100 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/80">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-400"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {!rows.length ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-xs font-semibold text-zinc-400"
                >
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr
                  key={
                    row.id ||
                    row.path ||
                    `${row.key}-${row.extra || ""}-${rowIndex}`
                  }
                  className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/50"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-300"
                    >
                      {column.render
                        ? column.render(row)
                        : row[column.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 border-t border-zinc-100 px-4 py-3 text-[11px] sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <span className="font-semibold text-zinc-400">
          Showing {from}–{to} of {total.toLocaleString()}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPage?.(page - 1)}
            className="grid h-8 w-8 place-items-center rounded-full border border-zinc-200 text-zinc-500 disabled:opacity-30 dark:border-zinc-700"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <span className="min-w-20 text-center font-black text-zinc-600 dark:text-zinc-300">
            {page} / {pages}
          </span>

          <button
            type="button"
            disabled={page >= pages}
            onClick={() => onPage?.(page + 1)}
            className="grid h-8 w-8 place-items-center rounded-full border border-zinc-200 text-zinc-500 disabled:opacity-30 dark:border-zinc-700"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
''').lstrip()

ANALYTICS_NAV = dedent(r'''
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ASIF_SIMPLE_ANALYTICS_V1
const links = [
  ["Overview", "/analytics"],
  ["Search Console", "/analytics/search"],
  ["Platform", "/analytics/platform"],
];

export default function AnalyticsNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto scrollbar-none"
      aria-label="Analytics sections"
    >
      {links.map(([label, href]) => (
        <Link
          key={href}
          href={href}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all ${
            pathname === href
              ? "bg-blue-600 text-white shadow-xs"
              : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
''').lstrip()

ANALYTICS_PAGE = dedent(r'''
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Clock3,
  Eye,
  Globe2,
  Loader2,
  MousePointerClick,
  RefreshCw,
  Search,
  Users,
  Waypoints,
} from "lucide-react";
import { toast } from "sonner";

import { analyticsApi } from "@/lib/api";
import AnalyticsNav from "./AnalyticsNav";
import AnalyticsDataTable from "./AnalyticsDataTable";
import {
  DonutChart,
  HorizontalBarChart,
  TrendChart,
} from "./SimpleAnalyticsCharts";
import ReportTable from "./ReportTable";

// ASIF_SIMPLE_ANALYTICS_V1
const PRESETS = [
  ["7 days", 7],
  ["28 days", 28],
  ["3 months", 90],
  ["6 months", 180],
  ["12 months", 365],
];

const unwrap = (response) =>
  response?.data?.data;

function dates(days) {
  const end = new Date();
  const start = new Date();

  start.setDate(end.getDate() - days + 1);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function number(value) {
  return Math.round(
    Number(value) || 0,
  ).toLocaleString();
}

function seconds(value) {
  const amount = Number(value) || 0;

  if (amount < 60) {
    return `${Math.round(amount)}s`;
  }

  const minutes = Math.floor(amount / 60);
  const remainder = Math.round(amount % 60);

  return `${minutes}m ${remainder}s`;
}

function changeText(change) {
  const value = Number(change) || 0;

  if (!Number.isFinite(value)) return "—";

  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  help,
}) {
  const positive = Number(change) >= 0;

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-[#121215]">
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
          <Icon className="h-4 w-4" />
        </span>

        {change !== undefined && (
          <span
            className={`rounded-full px-2 py-1 text-[9px] font-black ${
              positive
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
            }`}
          >
            {changeText(change)}
          </span>
        )}
      </div>

      <div className="mt-4 text-2xl font-black tracking-tight">
        {value}
      </div>

      <div className="mt-1 text-xs font-bold text-zinc-600 dark:text-zinc-300">
        {label}
      </div>

      {help && (
        <p className="mt-1.5 text-[10px] leading-4 text-zinc-400">
          {help}
        </p>
      )}
    </div>
  );
}

function Section({
  eyebrow,
  title,
  description,
  children,
  action,
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-xl font-black tracking-tight text-zinc-950 dark:text-white">
            {title}
          </h2>

          {description && (
            <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(28);
  const range = useMemo(() => dates(days), [days]);

  const [overview, setOverview] = useState(null);
  const [devices, setDevices] = useState([]);

  const [acquisitionDimension, setAcquisitionDimension] =
    useState("source");
  const [acquisitionPage, setAcquisitionPage] = useState(1);
  const [acquisition, setAcquisition] = useState(null);

  const [contentPage, setContentPage] = useState(1);
  const [content, setContent] = useState(null);

  const [locationDimension, setLocationDimension] =
    useState("timezone");
  const [locationPage, setLocationPage] = useState(1);
  const [locations, setLocations] = useState(null);

  const [searchType, setSearchType] = useState("queries");
  const [searchPage, setSearchPage] = useState(1);
  const [searchReport, setSearchReport] = useState(null);
  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadOverview = useCallback(async () => {
    const [overviewResponse, deviceResponse] =
      await Promise.all([
        analyticsApi.simpleOverview(range),
        analyticsApi.devices(range),
      ]);

    if (overviewResponse.success) {
      setOverview(unwrap(overviewResponse));
    }

    if (deviceResponse.success) {
      setDevices(unwrap(deviceResponse)?.rows || []);
    }
  }, [range]);

  const loadAcquisition = useCallback(async () => {
    const response = await analyticsApi.acquisition({
      ...range,
      dimension: acquisitionDimension,
      page: acquisitionPage,
      limit: 15,
    });

    if (response.success) {
      setAcquisition(unwrap(response));
    }
  }, [range, acquisitionDimension, acquisitionPage]);

  const loadContent = useCallback(async () => {
    const response = await analyticsApi.localContent({
      ...range,
      page: contentPage,
      limit: 15,
    });

    if (response.success) {
      setContent(unwrap(response));
    }
  }, [range, contentPage]);

  const loadLocations = useCallback(async () => {
    const response = await analyticsApi.locations({
      ...range,
      dimension: locationDimension,
      page: locationPage,
      limit: 15,
    });

    if (response.success) {
      setLocations(unwrap(response));
    }
  }, [range, locationDimension, locationPage]);

  const loadSearch = useCallback(async () => {
    const response = await analyticsApi.search(
      searchType,
      {
        ...range,
        search: searchText,
        sort: "clicks",
        direction: "desc",
        page: searchPage,
        limit: 15,
      },
    );

    if (response.success) {
      setSearchReport(unwrap(response));
    }
  }, [range, searchType, searchText, searchPage]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      await Promise.all([
        loadOverview(),
        loadAcquisition(),
        loadContent(),
        loadLocations(),
        loadSearch(),
      ]);

      if (active) {
        setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [
    loadOverview,
    loadAcquisition,
    loadContent,
    loadLocations,
    loadSearch,
  ]);

  const changeRange = (nextDays) => {
    setDays(nextDays);
    setAcquisitionPage(1);
    setContentPage(1);
    setLocationPage(1);
    setSearchPage(1);
  };

  const sync = async () => {
    setSyncing(true);

    const response = await analyticsApi.sync();

    if (!response.success) {
      setSyncing(false);
      toast.error(response.error);
      return;
    }

    toast.success("Search Console sync started");

    setTimeout(async () => {
      await Promise.all([
        loadOverview(),
        loadSearch(),
      ]);
      setSyncing(false);
    }, 2500);
  };

  if (loading && !overview) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const metrics = overview?.metrics || {};
  const metric = (key) =>
    metrics[key] || {
      value: 0,
      change: 0,
    };

  const sourceLabel =
    acquisitionDimension === "source"
      ? "Source"
      : acquisitionDimension === "referrer"
        ? "Referrer domain"
        : "Campaign";

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-9 p-4 font-sans sm:p-6 md:p-8 lg:p-10">
      <AnalyticsNav />

      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            asif.to performance
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
            Understand the site at a glance
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            First-party asif.to traffic explains people,
            sources, content, devices and location. Search
            Console explains how Google Search is performing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap rounded-full border border-zinc-200/80 bg-zinc-100/80 p-1 dark:border-zinc-800 dark:bg-[#18181b]">
            {PRESETS.map(([label, value]) => (
              <button
                key={value}
                type="button"
                onClick={() => changeRange(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  days === value
                    ? "bg-white text-blue-600 shadow-sm dark:bg-zinc-900 dark:text-blue-300"
                    : "text-zinc-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={sync}
            disabled={syncing}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-blue-600 px-4 text-xs font-black text-white disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                syncing ? "animate-spin" : ""
              }`}
            />
            {syncing ? "Syncing" : "Sync Search"}
          </button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          icon={Users}
          label="Visitors"
          value={number(metric("visitors").value)}
          change={metric("visitors").change}
          help="Unique first-party visitors."
        />

        <StatCard
          icon={Eye}
          label="Page views"
          value={number(metric("pageViews").value)}
          change={metric("pageViews").change}
          help="Pages actually opened on asif.to."
        />

        <StatCard
          icon={Waypoints}
          label="Sessions"
          value={number(metric("sessions").value)}
          change={metric("sessions").change}
          help="Separate browsing sessions."
        />

        <StatCard
          icon={Clock3}
          label="Avg. time / view"
          value={seconds(metric("engagementTime").value)}
          change={metric("engagementTime").change}
          help="First-party engaged time."
        />

        <StatCard
          icon={MousePointerClick}
          label="Google clicks"
          value={number(metric("searchClicks").value)}
          change={metric("searchClicks").change}
          help="Clicks reported by Search Console."
        />

        <StatCard
          icon={Search}
          label="Search impressions"
          value={number(metric("searchImpressions").value)}
          change={metric("searchImpressions").change}
          help="Google Search appearances."
        />
      </section>

      <Section
        eyebrow="Performance over time"
        title="Are more people using asif.to?"
        description="The main trend graph uses first-party traffic, so you can see growth without mixing it with Search Console impressions."
      >
        <TrendChart
          data={overview?.trend || []}
          series={[
            { key: "visitors", label: "Visitors" },
            { key: "pageViews", label: "Page views" },
          ]}
          height={300}
        />
      </Section>

      <Section
        eyebrow="Acquisition"
        title="Where did visitors come from?"
        description="UTM tags take priority. Otherwise asif.to uses the external referrer domain provided by the browser and classifies common search engines, AI tools and social sites."
        action={
          <div className="flex rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
            {[
              ["source", "Sources"],
              ["referrer", "Referrers"],
              ["campaign", "Campaigns"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setAcquisitionDimension(value);
                  setAcquisitionPage(1);
                }}
                className={`rounded-full px-3 py-1.5 text-[11px] font-black ${
                  acquisitionDimension === value
                    ? "bg-white text-blue-600 shadow-sm dark:bg-zinc-800"
                    : "text-zinc-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-[#121215]">
            <HorizontalBarChart
              rows={acquisition?.chart || []}
              labelKey="key"
              valueKey="pageViews"
              valueLabel="views"
            />
          </div>

          <AnalyticsDataTable
            rows={acquisition?.rows || []}
            pagination={acquisition?.pagination}
            onPage={setAcquisitionPage}
            columns={[
              {
                key: "key",
                label: sourceLabel,
                render: (row) => (
                  <div>
                    <div className="max-w-60 truncate font-black text-zinc-800 dark:text-zinc-100">
                      {row.key || "Unknown"}
                    </div>
                    {row.extra && (
                      <div className="mt-0.5 text-[10px] font-semibold text-zinc-400">
                        {row.extra}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "visitors",
                label: "Visitors",
                render: (row) => number(row.visitors),
              },
              {
                key: "sessions",
                label: "Sessions",
                render: (row) => number(row.sessions),
              },
              {
                key: "pageViews",
                label: "Views",
                render: (row) => number(row.pageViews),
              },
              {
                key: "avgEngagement",
                label: "Avg. time",
                render: (row) => seconds(row.avgEngagement),
              },
            ]}
          />
        </div>

        <p className="text-[10px] leading-4 text-zinc-400">
          Native apps and privacy-restricted browsers may omit
          referrer information. Use UTM links when you need
          guaranteed campaign/app attribution.
        </p>
      </Section>

      <Section
        eyebrow="Content"
        title="What are people actually reading?"
        description="This is first-party usage, not Google impressions. It shows the pages visitors really opened."
      >
        <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-[#121215]">
            <HorizontalBarChart
              rows={content?.chart || []}
              labelKey="path"
              valueKey="pageViews"
              valueLabel="views"
            />
          </div>

          <AnalyticsDataTable
            rows={content?.rows || []}
            pagination={content?.pagination}
            onPage={setContentPage}
            columns={[
              {
                key: "path",
                label: "Page",
                render: (row) => (
                  <a
                    href={`https://asif.to${row.path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block max-w-80 truncate font-black text-blue-600 hover:underline"
                    title={row.path}
                  >
                    {row.path}
                  </a>
                ),
              },
              {
                key: "visitors",
                label: "Visitors",
                render: (row) => number(row.visitors),
              },
              {
                key: "sessions",
                label: "Sessions",
                render: (row) => number(row.sessions),
              },
              {
                key: "pageViews",
                label: "Views",
                render: (row) => number(row.pageViews),
              },
              {
                key: "avgEngagement",
                label: "Avg. time",
                render: (row) => seconds(row.avgEngagement),
              },
            ]}
          />
        </div>
      </Section>

      <Section
        eyebrow="Audience"
        title="Where and how are people visiting?"
        description="Country is used when your CDN/proxy supplies a country header. Browser timezone remains available as a privacy-conscious location signal."
        action={
          <div className="flex rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
            {[
              ["timezone", "Time zones"],
              ["country", "Countries"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setLocationDimension(value);
                  setLocationPage(1);
                }}
                className={`rounded-full px-3 py-1.5 text-[11px] font-black ${
                  locationDimension === value
                    ? "bg-white text-blue-600 shadow-sm dark:bg-zinc-800"
                    : "text-zinc-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-[#121215]">
            <div className="mb-4 flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-black">
                Top{" "}
                {locationDimension === "country"
                  ? "countries"
                  : "time zones"}
              </h3>
            </div>

            <HorizontalBarChart
              rows={locations?.chart || []}
              labelKey="key"
              valueKey="visitors"
              valueLabel="visitors"
            />
          </div>

          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-[#121215]">
            <h3 className="mb-4 text-sm font-black">
              Device mix
            </h3>

            <DonutChart
              rows={devices}
              valueKey="pageViews"
            />
          </div>
        </div>

        <AnalyticsDataTable
          rows={locations?.rows || []}
          pagination={locations?.pagination}
          onPage={setLocationPage}
          columns={[
            {
              key: "key",
              label:
                locationDimension === "country"
                  ? "Country"
                  : "Time zone",
              render: (row) => (
                <span className="font-black text-zinc-800 dark:text-zinc-100">
                  {row.key}
                </span>
              ),
            },
            {
              key: "visitors",
              label: "Visitors",
              render: (row) => number(row.visitors),
            },
            {
              key: "sessions",
              label: "Sessions",
              render: (row) => number(row.sessions),
            },
            ...(locationDimension === "country"
              ? [
                  {
                    key: "pageViews",
                    label: "Views",
                    render: (row) =>
                      number(row.pageViews),
                  },
                ]
              : []),
          ]}
        />
      </Section>

      <Section
        eyebrow="Google Search"
        title="How is organic search performing?"
        description="Search Console stays separate so clicks and impressions are never confused with actual on-site visitors and page views."
        action={
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                overview?.sync?.status === "error"
                  ? "bg-rose-500"
                  : "bg-emerald-500"
              }`}
            />
            <span className="text-[10px] font-bold text-zinc-400">
              {overview?.sync?.lastSyncedAt
                ? `Synced ${new Date(
                    overview.sync.lastSyncedAt,
                  ).toLocaleDateString()}`
                : "No sync yet"}
            </span>
          </div>
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-xs font-black text-zinc-600 dark:text-zinc-300">
              Google clicks over time
            </h3>
            <TrendChart
              data={overview?.trend || []}
              series={[
                { key: "clicks", label: "Clicks" },
              ]}
              height={240}
            />
          </div>

          <div>
            <h3 className="mb-2 text-xs font-black text-zinc-600 dark:text-zinc-300">
              Search impressions over time
            </h3>
            <TrendChart
              data={overview?.trend || []}
              series={[
                {
                  key: "impressions",
                  label: "Impressions",
                },
              ]}
              height={240}
            />
          </div>
        </div>

        <div className="flex w-fit rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
          {[
            ["queries", "Queries"],
            ["pages", "Pages"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setSearchType(value);
                setSearchPage(1);
                setSearchText("");
              }}
              className={`rounded-full px-3 py-1.5 text-[11px] font-black ${
                searchType === value
                  ? "bg-white text-blue-600 shadow-sm dark:bg-zinc-800"
                  : "text-zinc-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <ReportTable
          title={`Top ${searchType}`}
          type={searchType}
          report={searchReport}
          search={searchText}
          onSearch={(value) => {
            setSearchText(value);
            setSearchPage(1);
          }}
          sort="clicks"
          direction="desc"
          onSort={() => {}}
          page={searchPage}
          onPage={setSearchPage}
          onOpen={(url) =>
            window.open(url, "_blank")
          }
        />
      </Section>
    </div>
  );
}
''').lstrip()


class PatchError(RuntimeError):
    pass


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


class Patcher:
    def __init__(self, root: Path, dry_run: bool):
        self.root = root
        self.dry_run = dry_run
        self.changed = []
        self.skipped = []
        self.warnings = []
        self.backed = set()

        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.backup_root = root / ".simple_analytics_backup" / stamp

    def backup(self, path: Path):
        if (
            self.dry_run
            or path in self.backed
            or not path.exists()
        ):
            return

        target = self.backup_root / path.relative_to(self.root)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)
        self.backed.add(path)

    def write(self, relative: str, content: str):
        path = self.root / relative
        old = path.read_text(encoding="utf-8") if path.exists() else None

        if old == content:
            self.skipped.append(relative)
            return

        if path.exists():
            self.backup(path)

        if not self.dry_run:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8", newline="\n")

        self.changed.append(relative)

    def transform(self, relative: str, transform, label: str):
        path = self.root / relative

        if not path.exists():
            raise PatchError(f"Missing required file: {relative}")

        old = path.read_text(encoding="utf-8")
        new = transform(old)

        if new == old:
            self.skipped.append(f"{relative} ({label})")
            return

        self.backup(path)

        if not self.dry_run:
            path.write_text(new, encoding="utf-8", newline="\n")

        self.changed.append(relative)

    def report(self):
        print("\n" + "=" * 68)
        print("Simple asif.to Analytics")
        print("=" * 68)
        print("Mode:", "DRY RUN" if self.dry_run else "APPLIED")

        if self.changed:
            print("\nChanged / would change:")
            for item in dict.fromkeys(self.changed):
                print("  +", item)

        if self.skipped:
            print("\nAlready current:")
            for item in self.skipped:
                print("  =", item)

        if self.warnings:
            print("\nWarnings:")
            for item in self.warnings:
                print("  !", item)

        if self.backed and not self.dry_run:
            print(
                "\nBackups:",
                self.backup_root.relative_to(self.root),
            )

        print("\nDashboard sections:")
        print("  1. Visitors / views / sessions / time")
        print("  2. Traffic sources and referrers")
        print("  3. Content actually read")
        print("  4. Location and device mix")
        print("  5. Google Search performance")
        print("\nAll detailed tables paginate.")


def validate(root: Path):
    required = [
        "server/src/routes/analytics.routes.js",
        "server/src/models/AnalyticsIdentity.js",
        "apps/web/components/analytics/AnalyticsTracker.jsx",
        "apps/admin/src/lib/api.js",
        "apps/admin/src/app/(admin)/analytics/page.jsx",
    ]

    missing = [
        item
        for item in required
        if not (root / item).exists()
    ]

    if missing:
        raise PatchError(
            "Run this script from the asif.to repository root.\n"
            + "Missing:\n  - "
            + "\n  - ".join(missing)
        )


def patch_routes(p: Patcher):
    rel = "server/src/routes/analytics.routes.js"

    def apply(text: str):
        if 'analytics.simple.controller.js' not in text:
            anchor = (
                'import * as analytics from "../controllers/analytics.controller.js";'
            )

            if anchor not in text:
                raise PatchError(
                    "analytics.routes.js import anchor changed."
                )

            text = text.replace(
                anchor,
                anchor
                + '\nimport * as simple from "../controllers/analytics.simple.controller.js";',
                1,
            )

        if 'router.post("/visit"' not in text:
            anchor = 'router.post("/track", analytics.trackEvent);'

            if anchor not in text:
                raise PatchError(
                    "analytics.routes.js public tracking anchor changed."
                )

            text = text.replace(
                anchor,
                'router.post("/visit", simple.captureVisit);\n' + anchor,
                1,
            )

        if 'router.get("/simple/overview"' not in text:
            anchor = 'router.get("/overview", analytics.getOverview);'

            if anchor not in text:
                raise PatchError(
                    "analytics.routes.js protected endpoint anchor changed."
                )

            block = (
                'router.get("/simple/overview", simple.getSimpleOverview);\n'
                'router.get("/simple/acquisition", simple.getAcquisition);\n'
                'router.get("/simple/content", simple.getLocalContent);\n'
                'router.get("/simple/locations", simple.getLocations);\n'
                'router.get("/simple/devices", simple.getDevices);\n'
            )

            text = text.replace(anchor, block + anchor, 1)

        return text

    p.transform(rel, apply, "simple analytics routes")


def patch_admin_api(p: Patcher):
    rel = "apps/admin/src/lib/api.js"

    def apply(text: str):
        if "simpleOverview:" in text:
            return text

        anchor = "export const analyticsApi = {"
        pos = text.find(anchor)

        if pos < 0:
            raise PatchError("analyticsApi object not found.")

        insert_at = pos + len(anchor)

        addition = (
            '\n  simpleOverview: (params) => apiGet(`/analytics/simple/overview?${new URLSearchParams(params)}`),'
            '\n  acquisition: (params) => apiGet(`/analytics/simple/acquisition?${new URLSearchParams(params)}`),'
            '\n  localContent: (params) => apiGet(`/analytics/simple/content?${new URLSearchParams(params)}`),'
            '\n  locations: (params) => apiGet(`/analytics/simple/locations?${new URLSearchParams(params)}`),'
            '\n  devices: (params) => apiGet(`/analytics/simple/devices?${new URLSearchParams(params)}`),'
        )

        return text[:insert_at] + addition + text[insert_at:]

    p.transform(rel, apply, "admin simple analytics API")


def main():
    args = parse_args()
    root = Path(args.root).resolve()

    validate(root)

    patcher = Patcher(root, args.dry_run)

    patcher.write(
        "server/src/models/AnalyticsIdentity.js",
        IDENTITY_MODEL,
    )

    patcher.write(
        "server/src/controllers/analytics.simple.controller.js",
        SIMPLE_CONTROLLER,
    )

    patcher.write(
        "apps/web/components/analytics/AnalyticsTracker.jsx",
        TRACKER,
    )

    patcher.write(
        "apps/admin/src/app/(admin)/analytics/SimpleAnalyticsCharts.jsx",
        CHARTS,
    )

    patcher.write(
        "apps/admin/src/app/(admin)/analytics/AnalyticsDataTable.jsx",
        TABLE,
    )

    patcher.write(
        "apps/admin/src/app/(admin)/analytics/AnalyticsNav.jsx",
        ANALYTICS_NAV,
    )

    patcher.write(
        "apps/admin/src/app/(admin)/analytics/page.jsx",
        ANALYTICS_PAGE,
    )

    patch_routes(patcher)
    patch_admin_api(patcher)

    patcher.report()


if __name__ == "__main__":
    try:
        main()
    except PatchError as error:
        print(f"\nERROR: {error}")
        raise SystemExit(2)
