import MonetizationPlacement from "../models/MonetizationPlacement.js";
import MonetizationSettings from "../models/MonetizationSettings.js";

export const DEFAULT_MONETIZATION_SETTINGS = Object.freeze({
  key: "default",
  adsEnabled: false,
  previewMode: false,
  provider: "adsense",
  contentTypes: {
    article: true,
    course: true,
    cheatsheet: true,
    interview: true,
  },
  contentRules: {
    thresholds: [
      { minWords: 0, maxAds: 0 },
      { minWords: 400, maxAds: 1 },
      { minWords: 700, maxAds: 2 },
      { minWords: 1500, maxAds: 3 },
    ],
    safetyDistancePx: 240,
  },
  adsense: { clientId: "", approvalStatus: "not_configured" },
});

export const DEFAULT_MONETIZATION_PLACEMENTS = Object.freeze(
  [
    {
      key: "ARTICLE_MIDDLE",
      label: "Article middle",
      pageType: "article",
      position: "middle",
      minWordCount: 700,
      maxPerPage: 1,
    },
    {
      key: "ARTICLE_BOTTOM",
      label: "Article bottom",
      pageType: "article",
      position: "bottom",
      minWordCount: 400,
      maxPerPage: 1,
    },
    {
      key: "COURSE_MIDDLE",
      label: "Course middle",
      pageType: "course-chapter",
      position: "middle",
      minWordCount: 700,
      maxPerPage: 1,
    },
    {
      key: "COURSE_BOTTOM",
      label: "Course bottom",
      pageType: "course-chapter",
      position: "bottom",
      minWordCount: 400,
      maxPerPage: 1,
    },
    {
      key: "CHEATSHEET_BOTTOM",
      label: "Cheatsheet bottom",
      pageType: "cheatsheet",
      position: "bottom",
      minWordCount: 400,
      maxPerPage: 1,
    },
    {
      key: "INTERVIEW_BOTTOM",
      label: "Interview question bottom",
      pageType: "interview-question",
      position: "bottom",
      minWordCount: 400,
      maxPerPage: 1,
    },
    {
      key: "SIDEBAR",
      label: "Sidebar",
      pageType: "article",
      position: "sidebar",
      minWordCount: 700,
      maxPerPage: 1,
    },
  ].map((item) =>
    Object.freeze({
      ...item,
      provider: "adsense",
      enabled: false,
      slotId: "",
      implementationStatus: item.key === "SIDEBAR" ? "reserved" : "mounted",
      deviceTargeting: "all",
    }),
  ),
);

export function createTimedCache(ttlMs = 5000) {
  let entry;
  let generation = 0;
  return {
    async get(loader) {
      if (entry && entry.expiresAt > Date.now()) return entry.value;
      const startedAtGeneration = generation;
      const pending = Promise.resolve().then(loader);
      entry = { value: pending, expiresAt: Date.now() + ttlMs };
      try {
        const value = await pending;
        if (generation === startedAtGeneration) {
          entry = { value, expiresAt: Date.now() + ttlMs };
        }
        return value;
      } catch (error) {
        if (generation === startedAtGeneration) entry = undefined;
        throw error;
      }
    },
    clear() {
      generation += 1;
      entry = undefined;
    },
  };
}

const publicConfigCache = createTimedCache(5000);
const reportCache = new Map();
let placementsInitialization;

export function invalidateMonetizationCache() {
  publicConfigCache.clear();
  reportCache.clear();
}

export async function cachedMonetizationReport(key, loader, ttlMs = 60000) {
  const hit = reportCache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value;
  const pending = Promise.resolve().then(loader);
  reportCache.set(key, { value: pending, expiresAt: Date.now() + ttlMs });
  try {
    const value = await pending;
    if (reportCache.get(key)?.value === pending) {
      reportCache.set(key, { value, expiresAt: Date.now() + ttlMs });
    }
    return value;
  } catch (error) {
    if (reportCache.get(key)?.value === pending) reportCache.delete(key);
    throw error;
  }
}

export async function ensureMonetizationSettings() {
  let item = await MonetizationSettings.findOne({ key: "default" });
  if (!item) {
    try {
      item = await MonetizationSettings.create(DEFAULT_MONETIZATION_SETTINGS);
    } catch (error) {
      if (error?.code !== 11000) throw error;
      item = await MonetizationSettings.findOne({ key: "default" });
    }
  }
  return item;
}

export async function ensureMonetizationPlacements() {
  if (!placementsInitialization) {
    placementsInitialization = MonetizationPlacement.bulkWrite(
      DEFAULT_MONETIZATION_PLACEMENTS.map((placement) => ({
        updateOne: {
          filter: { key: placement.key },
          update: { $setOnInsert: placement },
          upsert: true,
        },
      })),
      { ordered: false },
    ).catch((error) => {
      placementsInitialization = undefined;
      throw error;
    });
  }
  await placementsInitialization;
  return MonetizationPlacement.find().sort({
    pageType: 1,
    position: 1,
    key: 1,
  });
}

function plain(value) {
  return value?.toObject?.() || value;
}

export function publicMonetizationPayload(settingsInput, placementsInput) {
  const settings = plain(settingsInput) || DEFAULT_MONETIZATION_SETTINGS;
  const placements = (placementsInput || []).map(plain);
  const environmentMasterEnabled = process.env.ADS_MASTER_ENABLED === "true";
  const configuredClientId =
    settings.adsense?.clientId ||
    process.env.ADSENSE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ||
    "";

  return {
    version: settings.version || 1,
    updatedAt: settings.updatedAt || null,
    environmentMasterEnabled,
    adsEnabled: Boolean(settings.adsEnabled),
    effectiveAdsEnabled:
      environmentMasterEnabled && Boolean(settings.adsEnabled),
    previewMode: Boolean(settings.previewMode),
    provider: settings.provider || "adsense",
    clientId: configuredClientId,
    approvalStatus: settings.adsense?.approvalStatus || "not_configured",
    contentTypes: settings.contentTypes,
    contentRules: settings.contentRules,
    placements: placements.map((placement) => ({
      key: placement.key,
      label: placement.label,
      provider: placement.provider,
      enabled: Boolean(placement.enabled),
      slotId: placement.slotId || "",
      pageType: placement.pageType,
      position: placement.position,
      minWordCount: placement.minWordCount,
      maxPerPage: placement.maxPerPage,
      implementationStatus: placement.implementationStatus,
      deviceTargeting: placement.deviceTargeting,
      experimentId: placement.experimentId || "",
      variant: placement.variant || "",
    })),
  };
}

export async function getPublicMonetizationConfig() {
  return publicConfigCache.get(async () => {
    const [settings, placements] = await Promise.all([
      ensureMonetizationSettings(),
      ensureMonetizationPlacements(),
    ]);
    return publicMonetizationPayload(settings, placements);
  });
}
