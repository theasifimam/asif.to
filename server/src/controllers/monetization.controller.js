import { writeAudit } from "../utils/audit.js";
import { logActivity } from "../services/activity.service.js";
import {
  cachedMonetizationReport,
  ensureMonetizationPlacements,
  ensureMonetizationSettings,
  getPublicMonetizationConfig,
  invalidateMonetizationCache,
  publicMonetizationPayload,
} from "../services/monetization.service.js";
import {
  buildMonetizationRecommendations,
  getMonetizationPerformance,
} from "../services/monetizationInsights.service.js";

const CONTENT_TYPE_KEYS = ["article", "course", "cheatsheet", "interview"];
const APPROVAL_STATES = [
  "not_configured",
  "awaiting_approval",
  "approved",
  "action_required",
];

const plain = (value) => value?.toObject?.() || value;

function settingsSnapshot(value) {
  const item = plain(value);
  return {
    adsEnabled: Boolean(item.adsEnabled),
    previewMode: Boolean(item.previewMode),
    provider: item.provider,
    contentTypes: item.contentTypes,
    contentRules: item.contentRules,
    adsense: item.adsense,
  };
}

function placementSnapshot(value) {
  const item = plain(value);
  return {
    key: item.key,
    enabled: Boolean(item.enabled),
    provider: item.provider,
    slotId: item.slotId,
    pageType: item.pageType,
    position: item.position,
    minWordCount: item.minWordCount,
    maxPerPage: item.maxPerPage,
    implementationStatus: item.implementationStatus,
    deviceTargeting: item.deviceTargeting,
    experimentId: item.experimentId,
    variant: item.variant,
  };
}

function requireBoolean(value, field) {
  if (typeof value !== "boolean")
    throw new Error(`${field} must be a boolean.`);
  return value;
}

function normalizeThresholds(value) {
  if (!Array.isArray(value))
    throw new Error("Content thresholds must be an array.");
  return value.map((item) => ({
    minWords: Number(item.minWords),
    maxAds: Number(item.maxAds),
  }));
}

async function recordChange(
  req,
  { action, entity, title, before, after, description },
) {
  await Promise.all([
    writeAudit(req, action, undefined, { before, after }),
    logActivity({
      actor: req.user,
      action,
      entityType: "monetization",
      entityId: entity._id,
      entityTitle: title,
      description,
      severity: "critical",
      before,
      after,
      url: "/monetization",
    }),
  ]);
}

export async function getPublicConfig(_req, res) {
  const data = await getPublicMonetizationConfig();
  res
    .set("Cache-Control", "public, max-age=0, s-maxage=5, must-revalidate")
    .json({ success: true, data });
}

export async function getSettings(_req, res) {
  const [settings, placements] = await Promise.all([
    ensureMonetizationSettings(),
    ensureMonetizationPlacements(),
  ]);
  res.set("Cache-Control", "no-store").json({
    success: true,
    data: {
      ...settingsSnapshot(settings),
      version: settings.version,
      updatedAt: settings.updatedAt,
      environment: {
        masterEnabled: process.env.ADS_MASTER_ENABLED === "true",
        envClientIdConfigured: Boolean(
          process.env.ADSENSE_CLIENT_ID ||
          process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
        ),
      },
      effective: publicMonetizationPayload(settings, placements)
        .effectiveAdsEnabled,
    },
  });
}

export async function updateSettings(req, res) {
  try {
    const body = req.body || {};
    const settings = await ensureMonetizationSettings();
    const before = settingsSnapshot(settings);

    if (Object.hasOwn(body, "adsEnabled")) {
      settings.adsEnabled = requireBoolean(body.adsEnabled, "adsEnabled");
    }
    if (Object.hasOwn(body, "previewMode")) {
      settings.previewMode = requireBoolean(body.previewMode, "previewMode");
    }
    if (Object.hasOwn(body, "provider")) settings.provider = body.provider;

    if (body.contentTypes) {
      for (const key of CONTENT_TYPE_KEYS) {
        if (Object.hasOwn(body.contentTypes, key)) {
          settings.set(
            `contentTypes.${key}`,
            requireBoolean(body.contentTypes[key], `contentTypes.${key}`),
          );
        }
      }
    }
    if (body.contentRules) {
      if (Object.hasOwn(body.contentRules, "thresholds")) {
        settings.set(
          "contentRules.thresholds",
          normalizeThresholds(body.contentRules.thresholds),
        );
      }
      if (Object.hasOwn(body.contentRules, "safetyDistancePx")) {
        settings.set(
          "contentRules.safetyDistancePx",
          Number(body.contentRules.safetyDistancePx),
        );
      }
    }
    if (body.adsense) {
      if (Object.hasOwn(body.adsense, "clientId")) {
        settings.set(
          "adsense.clientId",
          String(body.adsense.clientId || "").trim(),
        );
      }
      if (Object.hasOwn(body.adsense, "approvalStatus")) {
        if (!APPROVAL_STATES.includes(body.adsense.approvalStatus)) {
          throw new Error("AdSense approval status is invalid.");
        }
        settings.set("adsense.approvalStatus", body.adsense.approvalStatus);
      }
    }

    settings.version = (settings.version || 0) + 1;
    settings.updatedBy = req.user._id;
    await settings.save();
    invalidateMonetizationCache();

    const after = settingsSnapshot(settings);
    await recordChange(req, {
      action: "monetization.settings.updated",
      entity: settings,
      title: "Monetization settings",
      before,
      after,
      description: "updated monetization settings",
    });
    res.json({
      success: true,
      data: {
        ...after,
        version: settings.version,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: error.message || "Unable to update monetization settings.",
      });
  }
}

export async function listPlacements(_req, res) {
  const placements = await ensureMonetizationPlacements();
  res.set("Cache-Control", "no-store").json({
    success: true,
    data: placements.map((item) => ({
      ...placementSnapshot(item),
      label: item.label,
      updatedAt: item.updatedAt,
    })),
  });
}

export async function updatePlacement(req, res) {
  try {
    const key = String(req.params.key || "")
      .trim()
      .toUpperCase();
    const placements = await ensureMonetizationPlacements();
    const placement = placements.find((item) => item.key === key);
    if (!placement)
      return res
        .status(404)
        .json({ success: false, message: "Placement not found." });
    const before = placementSnapshot(placement);
    const body = req.body || {};
    const allowed = [
      "label",
      "provider",
      "slotId",
      "pageType",
      "position",
      "minWordCount",
      "maxPerPage",
      "deviceTargeting",
      "experimentId",
      "variant",
    ];
    for (const field of allowed) {
      if (Object.hasOwn(body, field)) placement[field] = body[field];
    }
    if (Object.hasOwn(body, "enabled")) {
      placement.enabled = requireBoolean(body.enabled, "enabled");
    }
    placement.updatedBy = req.user._id;
    await placement.save();
    invalidateMonetizationCache();

    const after = placementSnapshot(placement);
    await recordChange(req, {
      action: "monetization.placement.updated",
      entity: placement,
      title: placement.label,
      before,
      after,
      description: `updated ${placement.key}`,
    });
    res.json({
      success: true,
      data: {
        ...after,
        label: placement.label,
        updatedAt: placement.updatedAt,
      },
    });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: error.message || "Unable to update placement.",
      });
  }
}

async function reportBundle(query) {
  const [settings, placements] = await Promise.all([
    ensureMonetizationSettings(),
    ensureMonetizationPlacements(),
  ]);
  const key = `performance:${query.start || ""}:${query.end || ""}`;
  const performance = await cachedMonetizationReport(key, () =>
    getMonetizationPerformance(plain(settings), placements.map(plain), query),
  );
  return { settings, placements, performance };
}

export async function getOverview(req, res) {
  const { settings, placements, performance } = await reportBundle(req.query);
  const publicConfig = publicMonetizationPayload(settings, placements);
  res.json({
    success: true,
    data: {
      status: {
        databaseEnabled: Boolean(settings.adsEnabled),
        environmentMasterEnabled: publicConfig.environmentMasterEnabled,
        live: publicConfig.effectiveAdsEnabled,
        approvalStatus: publicConfig.approvalStatus,
        clientIdConfigured: Boolean(publicConfig.clientId),
      },
      activePlacements: placements.filter(
        (item) =>
          item.enabled &&
          item.slotId &&
          item.implementationStatus !== "reserved",
      ).length,
      configuredPlacements: placements.filter((item) => item.slotId).length,
      traffic: performance.firstParty,
      adsense: performance.adsense,
      range: performance.range,
    },
  });
}

export async function getPerformance(req, res) {
  const { performance, placements } = await reportBundle(req.query);
  res.json({
    success: true,
    data: {
      ...performance,
      placements: placements.map((item) => ({
        key: item.key,
        label: item.label,
        enabled: item.enabled,
        pageType: item.pageType,
        reportingAvailable: false,
      })),
    },
  });
}

export async function getRecommendations(req, res) {
  const { settings, placements, performance } = await reportBundle(req.query);
  res.json({
    success: true,
    data: buildMonetizationRecommendations({
      settings: plain(settings),
      placements: placements.map(plain),
      performance,
    }),
  });
}
