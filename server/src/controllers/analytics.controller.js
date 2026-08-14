import crypto from "crypto";
import AnalyticsDaily from "../models/AnalyticsDaily.js";
import AnalyticsIdentity from "../models/AnalyticsIdentity.js";
import AnalyticsSync from "../models/AnalyticsSync.js";
import SearchMetric from "../models/SearchMetric.js";
import Article from "../models/Article.js";
import Chapter from "../models/Chapter.js";
import Course from "../models/Course.js";
import {
  isSearchConsoleConfigured,
  syncSearchConsole,
} from "../services/searchConsole.service.js";

const utcDay = (date) =>
  new Date(`${date.toISOString().slice(0, 10)}T00:00:00.000Z`);
const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function range(req) {
  const end = req.query.end
    ? utcDay(new Date(req.query.end))
    : utcDay(new Date());
  const start = req.query.start
    ? utcDay(new Date(req.query.start))
    : new Date(end);
  if (!req.query.start) start.setUTCDate(start.getUTCDate() - 27);
  const days = Math.max(1, Math.round((end - start) / 86400000) + 1);
  const previousEnd = new Date(start);
  previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setUTCDate(previousStart.getUTCDate() - days + 1);
  return {
    start,
    end: new Date(end.getTime() + 86400000),
    previousStart,
    previousEnd: new Date(previousEnd.getTime() + 86400000),
    days,
  };
}
const pct = (current, previous) =>
  previous ? ((current - previous) / previous) * 100 : current ? 100 : 0;
const metricsGroup = {
  _id: null,
  clicks: { $sum: "$clicks" },
  impressions: { $sum: "$impressions" },
  weightedPosition: { $sum: { $multiply: ["$position", "$impressions"] } },
};
async function searchTotals(start, end) {
  const [row] = await SearchMetric.aggregate([
    { $match: { dimension: "total", date: { $gte: start, $lt: end } } },
    { $group: metricsGroup },
  ]);
  const impressions = row?.impressions || 0;
  return {
    clicks: row?.clicks || 0,
    impressions,
    ctr: impressions ? (row.clicks / impressions) * 100 : 0,
    position: impressions ? row.weightedPosition / impressions : 0,
  };
}
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
    pageViews,
    visitors: visitors.length,
    sessions: sessions.length,
    engagementTime: pageViews
      ? (daily[0]?.engagementMs || 0) / pageViews / 1000
      : 0,
  };
}

export const getOverview = async (req, res) => {
  try {
    const dates = range(req);
    const [
      search,
      previousSearch,
      traffic,
      previousTraffic,
      sync,
      searchTrend,
      viewTrend,
    ] = await Promise.all([
      searchTotals(dates.start, dates.end),
      searchTotals(dates.previousStart, dates.previousEnd),
      trafficTotals(dates.start, dates.end),
      trafficTotals(dates.previousStart, dates.previousEnd),
      AnalyticsSync.findOne({ provider: "search-console" }).lean(),
      SearchMetric.find({
        dimension: "total",
        date: { $gte: dates.start, $lt: dates.end },
      })
        .sort({ date: 1 })
        .lean(),
      AnalyticsDaily.aggregate([
        { $match: { date: { $gte: dates.start, $lt: dates.end } } },
        { $group: { _id: "$date", pageViews: { $sum: "$pageViews" } } },
        { $sort: { _id: 1 } },
      ]),
    ]);
    const viewMap = new Map(
      viewTrend.map((row) => [
        row._id.toISOString().slice(0, 10),
        row.pageViews,
      ]),
    );
    const searchMap = new Map(
      searchTrend.map((row) => [row.date.toISOString().slice(0, 10), row]),
    );
    const trend = [];
    for (
      let cursor = new Date(dates.start);
      cursor < dates.end;
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    ) {
      const date = cursor.toISOString().slice(0, 10);
      const row = searchMap.get(date);
      trend.push({
        date,
        clicks: row?.clicks || 0,
        impressions: row?.impressions || 0,
        ctr: (row?.ctr || 0) * 100,
        position: row?.position || 0,
        pageViews: viewMap.get(date) || 0,
      });
    }
    const values = {
      ...search,
      ...traffic,
      organicVisitors: search.clicks,
      engagementRate: null,
    };
    const previous = {
      ...previousSearch,
      ...previousTraffic,
      organicVisitors: previousSearch.clicks,
    };
    res.json({
      success: true,
      data: {
        metrics: Object.fromEntries(
          Object.keys(values).map((key) => [
            key,
            { value: values[key], change: pct(values[key], previous[key]) },
          ]),
        ),
        trend,
        sync: {
          configured: isSearchConsoleConfigured(),
          status: sync?.status || "idle",
          lastSyncedAt: sync?.lastSyncedAt || null,
          syncedThrough: sync?.syncedThrough || null,
          rowsSynced: sync?.rowsSynced || 0,
          error: sync?.error || "",
        },
      },
    });
  } catch (error) {
    console.error("[ANALYTICS] overview", error);
    res
      .status(500)
      .json({ success: false, message: "Unable to load analytics overview" });
  }
};

export const getSearchReport = async (req, res) => {
  try {
    const dates = range(req);
    const type = [
      "queries",
      "pages",
      "countries",
      "devices",
      "appearance",
    ].includes(req.params.type)
      ? req.params.type
      : "queries";
    const field =
      type === "queries" ? "query" : type === "pages" ? "page" : "key";
    const primaryDimension = { queries: "query", pages: "page", countries: "country", devices: "device", appearance: "appearance" }[type];
    const hasPrimary = await SearchMetric.exists({ dimension: primaryDimension, date: { $gte: dates.start, $lt: dates.end } });
    const dimension = !hasPrimary && ["queries", "pages"].includes(type) ? "queryPage" : primaryDimension;
    const match = { dimension, date: { $gte: dates.start, $lt: dates.end } };
    if (req.query.search)
      match[field] = { $regex: escapeRegex(req.query.search), $options: "i" };
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(10, Number(req.query.limit) || 25));
    const sortKey = ["clicks", "impressions", "ctr", "position"].includes(
      req.query.sort,
    )
      ? req.query.sort
      : "clicks";
    const direction = req.query.direction === "asc" ? 1 : -1;
    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: `$${field}`,
          clicks: { $sum: "$clicks" },
          impressions: { $sum: "$impressions" },
          weightedPosition: {
            $sum: { $multiply: ["$position", "$impressions"] },
          },
        },
      },
      {
        $set: {
          ctr: {
            $cond: [
              { $gt: ["$impressions", 0] },
              { $multiply: [{ $divide: ["$clicks", "$impressions"] }, 100] },
              0,
            ],
          },
          position: {
            $cond: [
              { $gt: ["$impressions", 0] },
              { $divide: ["$weightedPosition", "$impressions"] },
              0,
            ],
          },
        },
      },
    ];
    const [rows, count] = await Promise.all([
      SearchMetric.aggregate([
        ...pipeline,
        { $sort: { [sortKey]: direction, _id: 1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ]),
      SearchMetric.aggregate([...pipeline, { $count: "total" }]),
    ]);
    res.json({
      success: true,
      data: {
        rows: rows.map((row) => ({
          key: row._id,
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        })),
        pagination: {
          page,
          limit,
          total: count[0]?.total || 0,
          pages: Math.ceil((count[0]?.total || 0) / limit),
        },
      },
    });
  } catch (error) {
    console.error("[ANALYTICS] report", error);
    res
      .status(500)
      .json({ success: false, message: "Unable to load search report" });
  }
};

async function pagePerformance(start, end) {
  const dimension = await SearchMetric.exists({ dimension: "page", date: { $gte: start, $lt: end } }) ? "page" : "queryPage";
  return SearchMetric.aggregate([
    { $match: { dimension, date: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: "$page",
        clicks: { $sum: "$clicks" },
        impressions: { $sum: "$impressions" },
        weightedPosition: {
          $sum: { $multiply: ["$position", "$impressions"] },
        },
      },
    },
    {
      $set: {
        ctr: {
          $cond: [
            { $gt: ["$impressions", 0] },
            { $multiply: [{ $divide: ["$clicks", "$impressions"] }, 100] },
            0,
          ],
        },
        position: {
          $cond: [
            { $gt: ["$impressions", 0] },
            { $divide: ["$weightedPosition", "$impressions"] },
            0,
          ],
        },
      },
    },
  ]);
}
export const getContentInsights = async (req, res) => {
  try {
    const dates = range(req);
    const [current, previous, articles, chapters, courses] = await Promise.all([
      pagePerformance(dates.start, dates.end),
      pagePerformance(dates.previousStart, dates.previousEnd),
      Article.find({ status: "published" })
        .select("title slug createdAt updatedAt")
        .lean(),
      Chapter.find({ status: "published" })
        .select("title slug course createdAt updatedAt")
        .populate("course", "slug title")
        .lean(),
      Course.find({ status: "published" })
        .select("title slug createdAt updatedAt")
        .lean(),
    ]);
    const previousMap = new Map(previous.map((row) => [row._id, row]));
    const enriched = current.map((row) => ({
      page: row._id,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
      previousClicks: previousMap.get(row._id)?.clicks || 0,
      growth: pct(row.clicks, previousMap.get(row._id)?.clicks || 0),
    }));
    const normalizePath = (value) => {
      try { return new URL(value, "https://asif.to").pathname.replace(/\/$/, "") || "/"; }
      catch { return String(value || "").replace(/\/$/, "") || "/"; }
    };
    const matchContent = (items, urlFor) =>
      items
        .map((item) => {
          const path = urlFor(item);
          const row = enriched.find((entry) => normalizePath(entry.page) === normalizePath(path));
          return {
            id: item._id,
            title: item.title,
            path,
            publishedAt: item.createdAt,
            updatedAt: item.updatedAt,
            ...(row || {
              clicks: 0,
              impressions: 0,
              ctr: 0,
              position: 0,
              growth: 0,
            }),
          };
        })
        .sort((a, b) => b.clicks - a.clicks);
    const content = {
      courses: matchContent(courses, (item) => `/courses/${item.slug}`),
      chapters: matchContent(
        chapters,
        (item) => `/${item.course?.slug}/${item.slug}`,
      ),
      articles: matchContent(articles, (item) => `/articles/${item.slug}`),
    };
    const opportunities = enriched
      .flatMap((row) => {
        const cases = [];
        if (row.impressions >= 100 && row.ctr < 2)
          cases.push({
            type: "Low CTR",
            impact: "high",
            reason: `${Math.round(row.impressions)} impressions at ${row.ctr.toFixed(1)}% CTR`,
          });
        if (row.position >= 5 && row.position <= 15)
          cases.push({
            type: "Striking distance",
            impact: "high",
            reason: `Average position ${row.position.toFixed(1)}`,
          });
        if (row.position > 15 && row.position <= 30 && row.growth > 10)
          cases.push({
            type: "Growing impressions",
            impact: "medium",
            reason: `Position ${row.position.toFixed(1)} with positive traffic trend`,
          });
        if (row.clicks < row.previousClicks * 0.8)
          cases.push({
            type: "Declining clicks",
            impact: "high",
            reason: `${Math.abs(row.growth).toFixed(0)}% fewer clicks`,
          });
        return cases.map((item) => ({
          ...item,
          page: row.page,
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        }));
      })
      .sort(
        (a, b) =>
          (a.impact === "high" ? -1 : 1) - (b.impact === "high" ? -1 : 1),
      );
    res.json({
      success: true,
      data: {
        content,
        fastestGrowing: [...enriched]
          .sort((a, b) => b.growth - a.growth)
          .slice(0, 10),
        losingTraffic: [...enriched]
          .filter((row) => row.growth < 0)
          .sort((a, b) => a.growth - b.growth)
          .slice(0, 10),
        lowClickPages: enriched
          .filter((row) => row.impressions >= 20 && row.clicks <= 2)
          .sort((a, b) => b.impressions - a.impressions)
          .slice(0, 10),
        opportunities: opportunities.slice(0, 100),
      },
    });
  } catch (error) {
    console.error("[ANALYTICS] content", error);
    res
      .status(500)
      .json({ success: false, message: "Unable to load content insights" });
  }
};

export const getTrafficSources = async (req, res) => {
  try {
    const dates = range(req);
    const rows = await AnalyticsDaily.aggregate([
      { $match: { date: { $gte: dates.start, $lt: dates.end } } },
      {
        $group: {
          _id: {
            source: "$source",
            medium: "$medium",
            campaign: "$campaign",
            referrer: "$referrer",
          },
          views: { $sum: "$pageViews" },
          engagementMs: { $sum: "$engagementMs" },
        },
      },
      { $sort: { views: -1 } },
      { $limit: 100 },
    ]);
    res.json({
      success: true,
      data: rows.map((row) => ({
        ...row._id,
        views: row.views,
        engagementTime: row.views ? row.engagementMs / row.views / 1000 : 0,
      })),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Unable to load traffic sources" });
  }
};

export const getPageDetails = async (req, res) => {
  try {
    const dates = range(req);
    const path = req.query.path;
    if (!path)
      return res
        .status(400)
        .json({ success: false, message: "path is required" });
    const escaped = escapeRegex(path);
    const pageMatch = { $regex: `${escaped}$`, $options: "i" };
    const [search, queries, traffic, countries, devices, trend] =
      await Promise.all([
        SearchMetric.aggregate([
          {
            $match: {
              dimension: "queryPage",
              page: pageMatch,
              date: { $gte: dates.start, $lt: dates.end },
            },
          },
          { $group: metricsGroup },
        ]),
        SearchMetric.aggregate([
          {
            $match: {
              dimension: "queryPage",
              page: pageMatch,
              date: { $gte: dates.start, $lt: dates.end },
            },
          },
          {
            $group: {
              _id: "$query",
              clicks: { $sum: "$clicks" },
              impressions: { $sum: "$impressions" },
            },
          },
          { $sort: { clicks: -1 } },
          { $limit: 25 },
        ]),
        AnalyticsDaily.aggregate([
          { $match: { path, date: { $gte: dates.start, $lt: dates.end } } },
          { $group: { _id: "$source", views: { $sum: "$pageViews" } } },
          { $sort: { views: -1 } },
        ]),
        SearchMetric.aggregate([
          {
            $match: {
              dimension: "country",
              date: { $gte: dates.start, $lt: dates.end },
            },
          },
          { $group: { _id: "$key", clicks: { $sum: "$clicks" } } },
          { $sort: { clicks: -1 } },
          { $limit: 10 },
        ]),
        SearchMetric.aggregate([
          {
            $match: {
              dimension: "device",
              date: { $gte: dates.start, $lt: dates.end },
            },
          },
          { $group: { _id: "$key", clicks: { $sum: "$clicks" } } },
          { $sort: { clicks: -1 } },
        ]),
        SearchMetric.aggregate([
          {
            $match: {
              dimension: "queryPage",
              page: pageMatch,
              date: { $gte: dates.start, $lt: dates.end },
            },
          },
          {
            $group: {
              _id: "$date",
              clicks: { $sum: "$clicks" },
              impressions: { $sum: "$impressions" },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);
    const row = search[0] || {};
    res.json({
      success: true,
      data: {
        metrics: {
          clicks: row.clicks || 0,
          impressions: row.impressions || 0,
          ctr: row.impressions ? (row.clicks / row.impressions) * 100 : 0,
          position: row.impressions
            ? row.weightedPosition / row.impressions
            : 0,
        },
        queries,
        traffic,
        countries,
        devices,
        trend,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Unable to load page analytics" });
  }
};

export const startSync = async (req, res) => {
  if (!isSearchConsoleConfigured())
    return res
      .status(400)
      .json({ success: false, message: "Search Console is not configured" });
  syncSearchConsole().catch((error) => console.error("[GSC SYNC]", error));
  res.status(202).json({ success: true, message: "Sync started" });
};

function sourceFrom(referrer, url) {
  const params = new URL(url, "https://asif.to").searchParams;
  if (params.get("utm_source"))
    return {
      source: params.get("utm_source"),
      medium: params.get("utm_medium") || "campaign",
      campaign: params.get("utm_campaign") || "",
    };
  if (!referrer) return { source: "Direct", medium: "direct", campaign: "" };
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host === "asif.to")
      return { source: "Internal", medium: "internal", campaign: "" };
    if (/google\./.test(host))
      return { source: "Google", medium: "organic", campaign: "" };
    if (/bing\.|yahoo\.|duckduckgo\./.test(host))
      return { source: host, medium: "organic", campaign: "" };
    if (
      /facebook\.|instagram\.|linkedin\.|twitter\.|x\.com|youtube\./.test(host)
    )
      return { source: host, medium: "social", campaign: "" };
    return { source: host, medium: "referral", campaign: "" };
  } catch {
    return { source: "Direct", medium: "direct", campaign: "" };
  }
}
export const trackEvent = async (req, res) => {
  try {
    const {
      path,
      visitorId,
      sessionId,
      referrer = "",
      engagementMs = 0,
      event = "pageview",
      device = "other",
      country = "",
    } = req.body || {};
    if (!path || !visitorId || !sessionId || !String(path).startsWith("/"))
      return res.status(204).end();
    const date = utcDay(new Date());
    const secret = process.env.ANALYTICS_HASH_SECRET || process.env.JWT_SECRET;
    const hash = (value) =>
      crypto.createHmac("sha256", secret).update(String(value)).digest("hex");
    const source = sourceFrom(referrer, path);
    const identity = {
      date,
      visitorHash: hash(visitorId),
      sessionHash: hash(sessionId),
      path: String(path).slice(0, 2048),
    };
    const dimensions = {
      date,
      path: String(path).slice(0, 2048),
      ...source,
      referrer: String(referrer).slice(0, 2048),
      country: String(country).slice(0, 8),
      device: ["desktop", "mobile", "tablet"].includes(device)
        ? device
        : "other",
    };
    if (event === "pageview") {
      await Promise.all([
        AnalyticsIdentity.updateOne(
          identity,
          { $setOnInsert: identity },
          { upsert: true },
        ),
        AnalyticsDaily.updateOne(
          dimensions,
          { $inc: { pageViews: 1 } },
          { upsert: true },
        ),
      ]);
    } else if (event === "engagement")
      await AnalyticsDaily.updateOne(
        dimensions,
        {
          $inc: {
            engagementMs: Math.min(
              3600000,
              Math.max(0, Number(engagementMs) || 0),
            ),
          },
        },
        { upsert: true },
      );
    res.status(204).end();
  } catch (error) {
    console.error("[ANALYTICS] track", error);
    res.status(204).end();
  }
};
