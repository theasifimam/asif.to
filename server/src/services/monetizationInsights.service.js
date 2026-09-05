import AnalyticsDaily from "../models/AnalyticsTrustedDaily.js";
import AnalyticsIdentity from "../models/AnalyticsTrustedIdentity.js";
import Chapter from "../models/Chapter.js";
import "../models/Course.js";
import { getAdSenseReportingStatus } from "./adsenseReporting.service.js";
import { getGa4Workspace, isGa4Configured } from "./googleAnalytics.service.js";

const DAY_MS = 86400000;
const CONTENT_TYPE_SETTING = {
  article: "article",
  "course-chapter": "course",
  cheatsheet: "cheatsheet",
  "interview-question": "interview",
};

export function classifyMonetizablePath(
  value = "",
  knownChapterPaths = new Set(),
) {
  const path = String(value).split(/[?#]/, 1)[0];
  if (/^\/articles\/[^/]+\/?$/.test(path)) return "article";
  if (/^\/cheatsheets\/[^/]+\/?$/.test(path)) return "cheatsheet";
  if (
    /^\/(?:courses\/)?[^/]+\/interview-questions\/(?:[^/]+\/)?[^/]+\/?$/.test(
      path,
    )
  ) {
    return "interview-question";
  }
  if (knownChapterPaths.has(path.replace(/\/$/, ""))) return "course-chapter";
  if (
    /^\/courses\/[^/]+\/[^/]+\/?$/.test(path) &&
    !/\/(?:final-exam|interview-questions)\/?$/.test(path)
  ) {
    return "course-chapter";
  }
  return null;
}

export function safeMonetizationRange(query = {}) {
  const endRaw = /^\d{4}-\d{2}-\d{2}$/.test(query.end || "")
    ? query.end
    : new Date().toISOString().slice(0, 10);
  const end = new Date(`${endRaw}T00:00:00.000Z`);
  const requestedStart = /^\d{4}-\d{2}-\d{2}$/.test(query.start || "")
    ? new Date(`${query.start}T00:00:00.000Z`)
    : new Date(end.getTime() - 27 * DAY_MS);
  const start =
    requestedStart <= end && end - requestedStart <= 365 * DAY_MS
      ? requestedStart
      : new Date(end.getTime() - 27 * DAY_MS);
  return {
    start,
    end: new Date(end.getTime() + DAY_MS),
    startLabel: start.toISOString().slice(0, 10),
    endLabel: end.toISOString().slice(0, 10),
  };
}

function activePageTypes(settings, placements) {
  if (!settings.adsEnabled) return new Map();
  const enabledTypes = new Set(
    Object.entries(CONTENT_TYPE_SETTING)
      .filter(([, setting]) => settings.contentTypes?.[setting] !== false)
      .map(([pageType]) => pageType),
  );
  const placementsByType = new Map();
  for (const placement of placements) {
    if (
      placement.implementationStatus === "reserved" ||
      !placement.enabled ||
      !placement.slotId ||
      !enabledTypes.has(placement.pageType)
    )
      continue;
    const items = placementsByType.get(placement.pageType) || [];
    items.push(placement);
    placementsByType.set(placement.pageType, items);
  }
  return placementsByType;
}

export function summarizeMonetizationTraffic(
  rows,
  settings,
  placements,
  knownChapterPaths = new Set(),
) {
  const byType = Object.fromEntries(
    Object.keys(CONTENT_TYPE_SETTING).map((key) => [key, 0]),
  );
  const devices = {};
  const countries = {};
  const trend = new Map();
  const pages = new Map();
  const eligibleTypes = activePageTypes(settings, placements);
  let pageViews = 0;
  let adEligiblePageViews = 0;
  let estimatedAdOpportunities = 0;
  let engagementMs = 0;

  for (const row of rows) {
    const views = Number(row.pageViews) || 0;
    const type = classifyMonetizablePath(row.path, knownChapterPaths);
    const date = new Date(row.date).toISOString().slice(0, 10);
    pageViews += views;
    engagementMs += Number(row.engagementMs) || 0;
    devices[row.device || "other"] =
      (devices[row.device || "other"] || 0) + views;
    const country = /^[A-Z]{2}$/i.test(row.country || "")
      ? String(row.country).toUpperCase()
      : "Unknown";
    countries[country] = (countries[country] || 0) + views;
    const day = trend.get(date) || {
      date,
      pageViews: 0,
      adEligiblePageViews: 0,
    };
    day.pageViews += views;

    if (type) byType[type] += views;
    if (type && eligibleTypes.has(type)) {
      adEligiblePageViews += views;
      day.adEligiblePageViews += views;
      const opportunityCount = eligibleTypes
        .get(type)
        .reduce(
          (sum, placement) => sum + Math.min(1, placement.maxPerPage || 1),
          0,
        );
      estimatedAdOpportunities += views * opportunityCount;
      const page = pages.get(row.path) || {
        path: row.path,
        pageType: type,
        pageViews: 0,
        estimatedAdOpportunities: 0,
      };
      page.pageViews += views;
      page.estimatedAdOpportunities += views * opportunityCount;
      pages.set(row.path, page);
    }
    trend.set(date, day);
  }

  return {
    pageViews,
    adEligiblePageViews,
    adEligiblePageRatio: pageViews ? adEligiblePageViews / pageViews : 0,
    estimatedAdOpportunities,
    averageEngagementSeconds: pageViews ? engagementMs / pageViews / 1000 : 0,
    byContentType: byType,
    byDevice: Object.entries(devices)
      .map(([device, value]) => ({ device, pageViews: value }))
      .sort((a, b) => b.pageViews - a.pageViews),
    byCountry: Object.entries(countries)
      .map(([country, value]) => ({ country, pageViews: value }))
      .sort((a, b) => b.pageViews - a.pageViews),
    trend: [...trend.values()].sort((a, b) => a.date.localeCompare(b.date)),
    topEligiblePages: [...pages.values()]
      .sort((a, b) => b.pageViews - a.pageViews)
      .slice(0, 25),
  };
}

export async function getMonetizationPerformance(settings, placements, query) {
  const range = safeMonetizationRange(query);
  const match = { date: { $gte: range.start, $lt: range.end } };
  const [rows, visitorHashes, sessionHashes, chapters] = await Promise.all([
    AnalyticsDaily.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            date: "$date",
            path: "$path",
            device: "$device",
            country: "$country",
          },
          pageViews: { $sum: "$pageViews" },
          engagementMs: { $sum: "$engagementMs" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          path: "$_id.path",
          device: "$_id.device",
          country: "$_id.country",
          pageViews: 1,
          engagementMs: 1,
        },
      },
    ]),
    AnalyticsIdentity.distinct("visitorHash", match),
    AnalyticsIdentity.distinct("sessionHash", match),
    Chapter.find({ status: "published" })
      .select("slug course")
      .populate({
        path: "course",
        match: { status: "published" },
        select: "slug",
      })
      .lean(),
  ]);

  const knownChapterPaths = new Set(
    chapters
      .filter((chapter) => chapter.course?.slug && chapter.slug)
      .map((chapter) => `/${chapter.course.slug}/${chapter.slug}`),
  );
  const firstParty = summarizeMonetizationTraffic(
    rows,
    settings,
    placements,
    knownChapterPaths,
  );
  firstParty.browserIdentifiers = visitorHashes.length;
  firstParty.sessions = sessionHashes.length;
  firstParty.pagesPerSession = sessionHashes.length
    ? firstParty.pageViews / sessionHashes.length
    : 0;

  let ga4 = { configured: false, available: false };
  if (isGa4Configured()) {
    try {
      const workspace = await getGa4Workspace(range.startLabel, range.endLabel);
      ga4 = {
        configured: true,
        available: true,
        summary: workspace.summary,
        changes: workspace.changes,
        audience: workspace.audience,
        pages: workspace.pages,
      };
    } catch (error) {
      ga4 = { configured: true, available: false, message: error.message };
    }
  }

  const adsense = getAdSenseReportingStatus();
  const estimatedEarnings = Number(adsense.metrics?.estimatedEarnings);
  const hasRevenue = adsense.connected && Number.isFinite(estimatedEarnings);

  return {
    range: { start: range.startLabel, end: range.endLabel },
    firstParty,
    ga4,
    adsense,
    businessMetrics: {
      adEligiblePageRatio: firstParty.adEligiblePageRatio,
      revenuePerThousandOwnedPageViews:
        hasRevenue && firstParty.pageViews
          ? (estimatedEarnings / firstParty.pageViews) * 1000
          : null,
      revenuePerSession:
        hasRevenue && firstParty.sessions
          ? estimatedEarnings / firstParty.sessions
          : null,
    },
    webVitals: { available: false, cls: null, lcp: null },
  };
}

export function buildMonetizationRecommendations({
  settings,
  placements,
  performance,
}) {
  const recommendations = [];
  const firstParty = performance.firstParty || {};
  const pageViews = Number(firstParty.pageViews) || 0;
  const active = placements.filter(
    (placement) =>
      placement.enabled && placement.implementationStatus !== "reserved",
  );

  if (!settings.adsEnabled) {
    recommendations.push({
      severity: "Experiment",
      category: "Controls",
      title: "Ads are globally disabled",
      reason:
        "The database emergency switch is OFF, so no placements can serve.",
      action:
        "Keep this off until AdSense approval and placement review are complete.",
    });
  }
  for (const placement of active.filter((item) => !item.slotId)) {
    recommendations.push({
      severity: "Warning",
      category: "Configuration",
      title: `${placement.label} has no slot ID`,
      reason:
        "The placement is enabled but cannot render a valid AdSense unit.",
      action: "Add the AdSense slot ID or disable the placement.",
    });
  }

  const pageTypeGroups = [
    ["article", "article", "Article"],
    ["course-chapter", "course", "Course"],
    ["cheatsheet", "cheatsheet", "Cheatsheet"],
    ["interview-question", "interview", "Interview question"],
  ];
  for (const [pageType, settingKey, label] of pageTypeGroups) {
    const views = Number(firstParty.byContentType?.[pageType]) || 0;
    const hasPlacement = active.some(
      (item) => item.pageType === pageType && item.slotId,
    );
    if (
      views >= 100 &&
      settings.contentTypes?.[settingKey] !== false &&
      !hasPlacement
    ) {
      recommendations.push({
        severity: "Opportunity",
        category: "Placement",
        title: `${label} traffic has no active placement`,
        reason: `${views.toLocaleString()} first-party page views were recorded for this content type in the selected range.`,
        action:
          "Review a conservative bottom placement before testing higher-density positions.",
      });
    }
  }

  const mobileViews =
    Number(
      firstParty.byDevice?.find((item) => item.device === "mobile")?.pageViews,
    ) || 0;
  if (pageViews >= 100 && mobileViews / pageViews >= 0.6) {
    recommendations.push({
      severity: "Experiment",
      category: "Device",
      title: "Most traffic is mobile",
      reason: `${Math.round((mobileViews / pageViews) * 100)}% of first-party page views used a mobile viewport.`,
      action:
        "Review reserved mobile dimensions and test placements without increasing density.",
    });
  }

  if (!performance.adsense?.connected) {
    recommendations.push({
      severity: "Warning",
      category: "Reporting",
      title: "AdSense reporting is not connected",
      reason:
        "Revenue, RPM, impression, click, CTR, and CPC metrics are unavailable.",
      action:
        "Connect the official AdSense reporting API after approval; do not infer revenue from GA4.",
    });
  }
  if (!recommendations.length) {
    recommendations.push({
      severity: "Healthy",
      category: "System",
      title: "No rule-based issues detected",
      reason:
        "Current settings and available traffic signals did not cross a recommendation threshold.",
      action: "Continue monitoring before changing ad density.",
    });
  }
  return recommendations;
}
