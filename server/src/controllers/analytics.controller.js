import crypto from "crypto";
import AnalyticsDaily from "../models/AnalyticsDaily.js";
import AnalyticsIdentity from "../models/AnalyticsIdentity.js";
import AnalyticsSync from "../models/AnalyticsSync.js";
import SearchMetric from "../models/SearchMetric.js";
import SeoChange from "../models/SeoChange.js";
import Article from "../models/Article.js";
import Chapter from "../models/Chapter.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import {
  fetchPageSearchDetails,
  isSearchConsoleConfigured,
  syncSearchConsole,
} from "../services/searchConsole.service.js";
import {
  afterWindow,
  baselineWindow,
  compareWindows,
  normalizePath,
} from "../services/seoChange.service.js";
import {
  classifySection,
  computeChanges,
  summarizeSections,
} from "../services/searchChanges.service.js";
import { ga4Error, getGa4Realtime, getGa4Workspace, isGa4Configured } from "../services/googleAnalytics.service.js";

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

async function queryPerformance(start, end) {
  return SearchMetric.aggregate([
    { $match: { dimension: "query", date: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: "$query",
        clicks: { $sum: "$clicks" },
        impressions: { $sum: "$impressions" },
        weightedPosition: { $sum: { $multiply: ["$position", "$impressions"] } },
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

const CHANGE_SORTS = {
  impressionsLoss: (a, b) => a.impressionsChange - b.impressionsChange,
  impressionsGain: (a, b) => b.impressionsChange - a.impressionsChange,
  clicksLoss: (a, b) => a.clicksChange - b.clicksChange,
  positionWorse: (a, b) => b.positionChange - a.positionChange,
  impressions: (a, b) => b.impressions - a.impressions,
};

/**
 * Period-over-period comparison of pages or queries, including rows that
 * vanished (zero current impressions). `section` filters pages by site area.
 */
export const getSearchChanges = async (req, res) => {
  try {
    const dates = range(req);
    const type = req.query.type === "queries" ? "queries" : "pages";
    const section = req.query.section;
    const minImpressions = Math.max(0, Number(req.query.minImpressions ?? 10));
    const limit = Math.min(5000, Math.max(1, Number(req.query.limit) || 100));
    const sort = CHANGE_SORTS[req.query.sort] ? req.query.sort : "impressionsLoss";
    const load = type === "pages" ? pagePerformance : queryPerformance;
    const [current, previous] = await Promise.all([
      load(dates.start, dates.end),
      load(dates.previousStart, dates.previousEnd),
    ]);
    const all = computeChanges(current, previous);
    const sections = type === "pages" ? summarizeSections(all) : undefined;
    let rows = all.filter((row) => Math.max(row.impressions, row.previous.impressions) >= minImpressions);
    if (type === "pages" && section) rows = rows.filter((row) => classifySection(row.key) === section);
    if (req.query.search) {
      const needle = String(req.query.search).toLowerCase();
      rows = rows.filter((row) => String(row.key).toLowerCase().includes(needle));
    }
    // Position changes only mean something when the row existed in both periods.
    if (sort === "positionWorse") rows = rows.filter((row) => row.positionChange !== 0);
    rows.sort(CHANGE_SORTS[sort]);
    res.json({
      success: true,
      data: {
        type,
        sort,
        total: rows.length,
        rows: rows.slice(0, limit),
        sections,
        period: {
          start: dates.start,
          end: dates.end,
          previousStart: dates.previousStart,
          previousEnd: dates.previousEnd,
        },
      },
    });
  } catch (error) {
    console.error("[ANALYTICS] changes", error);
    res
      .status(500)
      .json({ success: false, message: "Unable to load search changes" });
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
      previousImpressions: previousMap.get(row._id)?.impressions || 0,
      growth: pct(row.clicks, previousMap.get(row._id)?.clicks || 0),
      impressionsGrowth: pct(
        row.impressions,
        previousMap.get(row._id)?.impressions || 0,
      ),
    }));
    // Pages that had impressions before but none now never appear in `enriched`.
    const currentPages = new Set(current.map((row) => row._id));
    const lostImpressions = previous
      .filter((row) => !currentPages.has(row._id) && row.impressions >= 20)
      .map((row) => ({
        page: row._id,
        previousClicks: row.clicks,
        previousImpressions: row.impressions,
        previousPosition: row.position,
        section: classifySection(row._id),
      }))
      .sort((a, b) => b.previousImpressions - a.previousImpressions)
      .slice(0, 100);
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
        if (row.position > 15 && row.position <= 30 && row.impressionsGrowth > 10)
          cases.push({
            type: "Growing impressions",
            impact: "medium",
            reason: `Position ${row.position.toFixed(1)} with impressions up ${row.impressionsGrowth.toFixed(0)}%`,
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
        lostImpressions,
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
    const pageMatch = { $regex: `${escaped}/?$`, $options: "i" };
    const pageFilter = {
      dimension: "page",
      page: pageMatch,
      date: { $gte: dates.start, $lt: dates.end },
    };
    // Query-by-page rows are not stored (see searchConsole.service.js), so the
    // per-query breakdown comes from a live, cached Search Console request.
    const lastDay = (date) => new Date(date.getTime() - 86400000).toISOString().slice(0, 10);
    const liveQueries = isSearchConsoleConfigured()
      ? fetchPageSearchDetails({
          path,
          startDate: dates.start.toISOString().slice(0, 10),
          endDate: lastDay(dates.end),
        }).catch((error) => {
          console.error("[ANALYTICS] page queries", error?.message || error);
          return null;
        })
      : Promise.resolve(null);
    const [search, live, traffic, countries, devices, trend] =
      await Promise.all([
        SearchMetric.aggregate([{ $match: pageFilter }, { $group: metricsGroup }]),
        liveQueries,
        AnalyticsDaily.aggregate([
          { $match: { path, date: { $gte: dates.start, $lt: dates.end } } },
          { $group: { _id: "$source", views: { $sum: "$pageViews" } } },
          { $sort: { views: -1 } },
        ]),
        // Site-wide: country/device are synced independently of page.
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
          { $match: pageFilter },
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
    const queries = live?.queries || [];
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
        queriesAvailable: Boolean(live),
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

async function pageWindowMetrics(path, from, to) {
  const [row] = await SearchMetric.aggregate([
    {
      $match: {
        dimension: "page",
        page: { $regex: `${escapeRegex(path)}/?$`, $options: "i" },
        date: { $gte: from, $lt: to },
      },
    },
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

export const createSeoChange = async (req, res) => {
  try {
    const path = normalizePath(req.body?.url || req.body?.path);
    if (!path)
      return res.status(400).json({ success: false, message: "A valid page URL or path is required" });
    const changedAt = req.body?.changedAt ? new Date(req.body.changedAt) : new Date();
    if (Number.isNaN(changedAt.getTime()))
      return res.status(400).json({ success: false, message: "changedAt is not a valid date" });
    const window = baselineWindow(changedAt);
    const baseline = await pageWindowMetrics(path, window.from, window.to);
    const change = await SeoChange.create({
      path,
      changedAt,
      changeType: req.body?.changeType,
      note: req.body?.note,
      baseline: { ...baseline, from: window.from, to: window.to },
      createdBy: req.user?._id,
    });
    res.status(201).json({ success: true, data: change });
  } catch (error) {
    console.error("[ANALYTICS] create seo change", error);
    res.status(500).json({ success: false, message: "Unable to save SEO change" });
  }
};

/** Change log with before/after performance (after is null until 7+ days of final data exist). */
export const listSeoChanges = async (req, res) => {
  try {
    const changes = await SeoChange.find().sort({ changedAt: -1 }).limit(200).lean();
    const data = await Promise.all(
      changes.map(async (change) => {
        const window = afterWindow(change.changedAt);
        if (!window) return { ...change, after: null, comparison: null };
        const after = await pageWindowMetrics(change.path, window.from, window.to);
        const beforeDays = Math.round((change.baseline.to - change.baseline.from) / 86400000);
        return {
          ...change,
          after: { ...after, from: window.from, to: window.to, days: window.days },
          comparison: compareWindows(change.baseline, after, beforeDays, window.days),
        };
      }),
    );
    res.json({ success: true, data });
  } catch (error) {
    console.error("[ANALYTICS] list seo changes", error);
    res.status(500).json({ success: false, message: "Unable to load SEO changes" });
  }
};

export const deleteSeoChange = async (req, res) => {
  try {
    await SeoChange.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(400).json({ success: false, message: "Unable to delete SEO change" });
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

export const getGa4 = async (req, res) => {
  try {
    const data = await getGa4Workspace(req.query.start, req.query.end);
    res.json({ success: true, data });
  } catch (error) {
    const safe = ga4Error(error);
    console.error(`[GA4] ${safe.code}: ${error?.message || "request failed"}`);
    res.status(safe.status).json({ success: false, message: safe.message, code: safe.code, configured: isGa4Configured() });
  }
};

export const getRealtime = async (req, res) => {
  try { res.json({ success: true, data: await getGa4Realtime() }); }
  catch (error) { const safe = ga4Error(error); res.status(safe.status).json({ success: false, message: safe.message, code: safe.code }); }
};

export const getPlatform = async (req, res) => {
  try {
    const [articles, courses, chapters, authors, recent] = await Promise.all([
      Article.countDocuments({ status: "published" }), Course.countDocuments({ status: "published" }), Chapter.countDocuments({ status: "published" }),
      User.countDocuments({ role: { $in: ["author", "editor", "admin"] } }),
      Article.find({ status: "published" }).select("title slug type createdAt updatedAt author").populate("author", "fullName").sort({ createdAt: -1 }).limit(12).lean(),
    ]);
    res.json({ success: true, data: { counts: { articles, courses, chapters, authors, publishedContent: articles + courses + chapters }, recent } });
  } catch { res.status(500).json({ success: false, message: "Unable to load platform analytics" }); }
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

    // Ignore localhost and development origin tracking
    const host = String(req.headers["host"] || "");
    const origin = String(req.headers["origin"] || "");
    const referer = String(req.headers["referer"] || req.body?.referrer || "");
    if (
      host.includes("localhost") ||
      host.includes("127.0.0.1") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1") ||
      referer.includes("localhost") ||
      referer.includes("127.0.0.1") ||
      process.env.NODE_ENV === "development"
    ) {
      return res.status(204).end();
    }
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
