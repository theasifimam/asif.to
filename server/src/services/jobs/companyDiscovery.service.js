/**
 * Company Discovery Engine
 *
 * Automated pipeline that discovers new UAE companies and their public ATS job
 * sources from signals already present inside the platform (ingested jobs,
 * known sources) without unsafe scraping or bypassing access controls.
 *
 * Architecture
 * ─────────────
 * 1. Gather discovery signals from existing data.
 * 2. Deduplicate against existing sources + companies.
 * 3. Detect the ATS/provider from the career URL.
 * 4. Persist a DiscoveryCandidate record (status=discovered).
 * 5. Verify the candidate (status→verified / no_uae_jobs / failed / blocked).
 * 6. Create Company + JobSource for verified candidates.
 * 7. Trigger the existing syncJobSource() for the initial sync.
 * 8. The existing job scheduler then takes over.
 *
 * Safety limits (all configurable via env):
 *   DISCOVERY_MAX_CANDIDATES_PER_RUN     default 200
 *   DISCOVERY_MAX_VERIFICATIONS_PER_RUN  default 40
 *   DISCOVERY_MAX_COMPANIES_PER_RUN      default 20
 *   DISCOVERY_MAX_CONCURRENT_VERIFICATIONS default 4
 *   DISCOVERY_ENABLED                    default true
 *   DISCOVERY_INTERVAL_HOURS             default 24
 */

import crypto from "crypto";

import Company from "../../models/Company.js";
import DiscoveryCandidate, { DISCOVERY_METHODS, DISCOVERY_STATUSES } from "../../models/DiscoveryCandidate.js";
import DiscoveryRunLog from "../../models/DiscoveryRunLog.js";
import Job from "../../models/Job.js";
import JobSource from "../../models/JobSource.js";
import { SOURCE_TYPES } from "../../constants/jobs.js";
import { cleanText } from "../../utils/jobValidation.js";
import { slugify } from "../../utils/slugify.js";
import { normalizeCompanyName, resolveCompany } from "./jobImport.service.js";
import { syncJobSource } from "./jobImport.service.js";
import { createExclusionSet, detectJobBoard, duplicateSource, sourceIdentityKeys } from "./jobSourceDiscovery.service.js";
import { verifyJobSource } from "./jobSourceVerification.service.js";

// ─── Configuration ────────────────────────────────────────────────────────────

const cfg = () => ({
  enabled: process.env.DISCOVERY_ENABLED !== "false",
  maxCandidatesPerRun: parseInt(process.env.DISCOVERY_MAX_CANDIDATES_PER_RUN || "200", 10),
  maxVerificationsPerRun: parseInt(process.env.DISCOVERY_MAX_VERIFICATIONS_PER_RUN || "40", 10),
  maxCompaniesPerRun: parseInt(process.env.DISCOVERY_MAX_COMPANIES_PER_RUN || "20", 10),
  maxConcurrent: parseInt(process.env.DISCOVERY_MAX_CONCURRENT_VERIFICATIONS || "4", 10),
  intervalHours: parseFloat(process.env.DISCOVERY_INTERVAL_HOURS || "24"),
  // After this many consecutive failures, move to requires_review instead of retrying
  maxRetries: parseInt(process.env.DISCOVERY_MAX_RETRIES || "5", 10),
});

// ─── Utilities ────────────────────────────────────────────────────────────────

const websiteDomain = (value) => {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; }
};

/** Deterministic run ID based on date (hourly granularity). */
const makeRunId = () => {
  const now = new Date();
  return `auto-${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}-${String(now.getUTCHours()).padStart(2, "0")}${String(Math.floor(now.getUTCMinutes() / 10)).padStart(2, "0")}-${crypto.randomBytes(3).toString("hex")}`;
};

/** Simple backoff: 2^n hours, capped at 7 days. */
const nextCheckAt = (attempts) => {
  const hours = Math.min(Math.pow(2, attempts), 168);
  return new Date(Date.now() + hours * 3_600_000);
};

/** Concurrency-limited map over an array. */
async function pooledMap(items, fn, concurrency = 4) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i).catch((err) => ({ __error: err }));
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

// ─── Confidence scoring ───────────────────────────────────────────────────────

/**
 * Compute a deterministic confidence score for a discovery candidate.
 * Returns { score: number, reasons: Array<{code, label, points}> }.
 */
export function scoreCandidate({ detectedProvider, providerOrganizationId, domain, careersUrl, verifiedUaeJobsFound, emirate, uaeEvidence }) {
  const reasons = [];
  const add = (code, label, points) => reasons.push({ code, label, points });

  const supported = SOURCE_TYPES.filter((type) => !["manual", "employer-career-page", "api", "other"].includes(type));

  if (supported.includes(detectedProvider)) add("provider_known", `${detectedProvider} provider recognized`, 25);
  if (providerOrganizationId) add("provider_id", "Provider organization ID resolved", 20);
  if (domain) add("official_domain", "Company domain identified", 10);
  if (careersUrl) add("careers_url", "Careers URL confirmed", 10);
  if ((verifiedUaeJobsFound ?? 0) > 0) add("uae_jobs_found", `${verifiedUaeJobsFound} UAE job(s) verified`, 25);
  if (emirate) add("specific_emirate", `Specific emirate detected: ${emirate}`, 5);
  if ((uaeEvidence ?? []).length > 0) add("uae_evidence", "UAE evidence signals present", 5);

  const score = Math.min(100, reasons.reduce((sum, item) => sum + item.points, 0));
  return { score, reasons };
}

// ─── Signal extraction ────────────────────────────────────────────────────────

/**
 * Extract discovery candidates from existing ingested jobs.
 * This is the most important mechanism: when the system already knows about a
 * company but doesn't yet have a dedicated JobSource, it becomes a candidate.
 */
export async function extractCandidatesFromJobs({ limit = 500 } = {}) {
  // Find recently synced jobs whose company does NOT yet have an ATS source
  const jobs = await Job.aggregate([
    {
      $match: {
        sourceProvider: { $in: ["manual", "employer-career-page", "other"] },
        applicationUrl: { $exists: true, $ne: "" },
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 3_600_000) }, // Last 30 days
      },
    },
    { $group: { _id: "$company", companyName: { $first: "$companyName" }, applicationUrl: { $first: "$applicationUrl" }, sourceUrl: { $first: "$sourceUrl" } } },
    { $limit: limit },
  ]);

  const candidates = [];
  for (const item of jobs) {
    if (!item.companyName) continue;
    const domain = websiteDomain(item.applicationUrl || item.sourceUrl || "");
    if (!domain) continue;
    candidates.push({
      companyName: cleanText(item.companyName, 180),
      normalizedCompanyName: normalizeCompanyName(item.companyName),
      domain,
      careersUrl: item.applicationUrl || item.sourceUrl || "",
      sourceUrl: item.sourceUrl || item.applicationUrl || "",
      discoveryMethod: "existing_job",
    });
  }
  return candidates;
}

/**
 * Extract candidates from existing JobSources that expose company information
 * useful for finding sibling/related boards (same company, different provider).
 */
export async function extractCandidatesFromSources({ limit = 200 } = {}) {
  const sources = await JobSource.find({ enabled: true, careersUrl: { $ne: "" } })
    .select("name careersUrl baseUrl type providerOrganizationId")
    .limit(limit)
    .lean();

  const candidates = [];
  for (const source of sources) {
    const domain = websiteDomain(source.baseUrl || source.careersUrl || "");
    if (!domain) continue;
    candidates.push({
      companyName: cleanText(source.name, 180),
      normalizedCompanyName: normalizeCompanyName(source.name),
      domain,
      careersUrl: source.careersUrl || "",
      sourceUrl: source.careersUrl || "",
      discoveryMethod: "existing_source",
    });
  }
  return candidates;
}

// ─── ATS detection ────────────────────────────────────────────────────────────

/**
 * Attempt to detect the ATS provider from a careers URL.
 * Returns the detectJobBoard() result or null if not detectable.
 * Also tries known sub-paths per provider.
 */
export function detectProviderFromUrl(careersUrl) {
  if (!careersUrl) return null;
  try {
    return detectJobBoard(careersUrl);
  } catch {
    // Not a recognized board URL — that's fine
    return null;
  }
}

// ─── Deduplication helpers ────────────────────────────────────────────────────

/**
 * Build an exclusion set from all existing sources AND companies that are
 * already linked to a source. A standalone company (no source) may still
 * receive a new automated source.
 */
async function buildSystemExclusions() {
  const [sources, companies] = await Promise.all([
    JobSource.find().select("name type providerOrganizationId careersUrl endpointUrl baseUrl providerIdentities").lean(),
    Company.find().select("name normalizedName websiteDomain providerIdentities source").lean(),
  ]);
  return createExclusionSet(sources, companies);
}

/**
 * Check whether a candidate matches an existing DiscoveryCandidate that has
 * been explicitly rejected or blocked by admin — we must not recreate it.
 */
async function isSuppressedCandidate(candidate) {
  if (candidate.detectedProvider && candidate.providerOrganizationId) {
    const existing = await DiscoveryCandidate.findOne({
      detectedProvider: candidate.detectedProvider,
      providerOrganizationId: candidate.providerOrganizationId,
      status: { $in: ["rejected", "blocked"] },
    }).select("_id").lean();
    if (existing) return true;
  }
  if (candidate.domain) {
    const existing = await DiscoveryCandidate.findOne({
      domain: candidate.domain,
      status: { $in: ["rejected", "blocked"] },
    }).select("_id").lean();
    if (existing) return true;
  }
  return false;
}

// ─── Candidate persistence ────────────────────────────────────────────────────

/**
 * Upsert a discovery candidate.
 * - If the candidate already exists (by provider+id or domain), update signals.
 * - Skip if already rejected/blocked/created.
 * Returns { candidate, isNew } or null if skipped.
 */
export async function upsertCandidate(raw) {
  const { companyName, normalizedCompanyName: normalizedName, domain, careersUrl, discoveryMethod, sourceUrl } = raw;

  // Try ATS detection
  const board = detectProviderFromUrl(careersUrl);
  const detectedProvider = board?.type || "unknown";
  const providerOrganizationId = board?.providerOrganizationId || "";
  const providerRegion = board?.providerRegion || "global";
  const endpointUrl = board?.endpointUrl || "";

  // Build confidence score without verification result yet
  const { score, reasons } = scoreCandidate({ detectedProvider, providerOrganizationId, domain, careersUrl });

  const filter = providerOrganizationId
    ? { detectedProvider, providerOrganizationId }
    : { domain, detectedProvider: "unknown" };

  // Never overwrite admin decisions
  const alreadyDecided = await DiscoveryCandidate.findOne({ ...filter, status: { $in: ["rejected", "blocked", "created"] } }).lean();
  if (alreadyDecided) return null;

  const doc = await DiscoveryCandidate.findOneAndUpdate(
    filter,
    {
      $setOnInsert: {
        companyName: cleanText(companyName, 180),
        normalizedCompanyName: normalizeCompanyName(companyName),
        domain: domain || "",
        careersUrl: cleanText(careersUrl, 2048),
        detectedProvider,
        providerOrganizationId,
        providerRegion,
        endpointUrl: cleanText(endpointUrl, 2048),
        sourceUrl: cleanText(sourceUrl, 2048),
        discoveryMethod: DISCOVERY_METHODS.includes(discoveryMethod) ? discoveryMethod : "other",
        status: "discovered",
      },
      $set: {
        confidenceScore: score,
        confidenceReasons: reasons,
      },
      $addToSet: { evidenceUrls: careersUrl || sourceUrl },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return doc;
}

// ─── Verification ─────────────────────────────────────────────────────────────

/**
 * Verify a single candidate by attempting to fetch jobs from its detected ATS.
 * Updates the candidate's status in the database.
 */
export async function verifyCandidate(candidate, { config = cfg() } = {}) {
  // Build a synthetic source object for the existing verifyJobSource()
  const syntheticSource = {
    _id: candidate._id,
    name: candidate.companyName,
    type: candidate.detectedProvider !== "unknown" ? candidate.detectedProvider : "employer-career-page",
    providerOrganizationId: candidate.providerOrganizationId,
    providerRegion: candidate.providerRegion || "global",
    endpointUrl: candidate.endpointUrl,
    careersUrl: candidate.careersUrl,
    baseUrl: candidate.domain ? `https://${candidate.domain}` : "",
  };

  await DiscoveryCandidate.updateOne({ _id: candidate._id }, { $set: { status: "verifying" } });

  let result;
  try {
    result = await verifyJobSource(syntheticSource);
  } catch (err) {
    const attempts = (candidate.verificationAttempts || 0) + 1;
    const newStatus = attempts >= config.maxRetries ? "requires_review" : "failed";
    await DiscoveryCandidate.updateOne(
      { _id: candidate._id },
      {
        $set: {
          status: newStatus,
          lastError: cleanText(err.message, 2000),
          lastVerifiedAt: new Date(),
          nextCheckAt: nextCheckAt(attempts),
          verificationAttempts: attempts,
        },
      },
    );
    return { success: false, status: newStatus, error: err.message };
  }

  const attempts = (candidate.verificationAttempts || 0) + 1;
  const { score, reasons } = scoreCandidate({
    detectedProvider: candidate.detectedProvider,
    providerOrganizationId: candidate.providerOrganizationId,
    domain: candidate.domain,
    careersUrl: candidate.careersUrl,
    verifiedUaeJobsFound: result.uaeJobsFound,
    emirate: candidate.emirate,
    uaeEvidence: candidate.uaeEvidence,
  });

  let newStatus;
  if (result.credentialsRequired) {
    newStatus = "blocked";
  } else if (!result.reachable || !result.providerValid) {
    newStatus = attempts >= config.maxRetries ? "requires_review" : "failed";
  } else if (result.uaeJobsFound > 0) {
    newStatus = "verified";
  } else {
    newStatus = "no_uae_jobs";
  }

  await DiscoveryCandidate.updateOne(
    { _id: candidate._id },
    {
      $set: {
        status: newStatus,
        lastError: result.error || "",
        lastVerifiedAt: new Date(),
        nextCheckAt: newStatus === "no_uae_jobs" ? nextCheckAt(2) : newStatus === "failed" ? nextCheckAt(attempts) : null,
        verificationAttempts: attempts,
        verifiedJobsFound: result.jobsFound || 0,
        verifiedUaeJobsFound: result.uaeJobsFound || 0,
        confidenceScore: score,
        confidenceReasons: reasons,
      },
    },
  );

  return { success: true, status: newStatus, result };
}

// ─── Company + Source creation ────────────────────────────────────────────────

/** Build a unique slug for a JobSource from the candidate. */
async function buildSourceSlug(candidate) {
  const base = `discovery-${candidate.detectedProvider}-${slugify(candidate.providerOrganizationId || candidate.companyName)}`;
  let slug = base;
  let counter = 2;
  while (await JobSource.exists({ slug })) slug = `${base}-${counter++}`;
  return slug;
}

/**
 * Create a Company + JobSource from a verified discovery candidate.
 * Reuses resolveCompany() for company deduplication.
 * Returns { company, source, isNew }.
 */
export async function createFromCandidate(candidate) {
  // Admin override protection: if a source with this provider+id already
  // exists (perhaps disabled by admin), do not recreate it.
  if (candidate.providerOrganizationId) {
    const existingSource = await JobSource.findOne({
      type: candidate.detectedProvider,
      providerOrganizationId: candidate.providerOrganizationId,
    }).lean();
    if (existingSource) {
      // Source already exists (might be disabled by admin) — link and skip
      await DiscoveryCandidate.updateOne(
        { _id: candidate._id },
        { $set: { status: "created", createdJobSourceId: existingSource._id } },
      );
      return { company: null, source: existingSource, isNew: false };
    }
  }

  // Build synthetic source for resolveCompany()
  const syntheticSource = {
    _id: `discovery-${candidate._id}`,
    name: candidate.companyName,
    type: candidate.detectedProvider,
    providerOrganizationId: candidate.providerOrganizationId,
    careersUrl: candidate.careersUrl,
    creationOrigin: "automated_source_discovery",
  };

  let company;
  try {
    company = await resolveCompany(
      {
        companyName: candidate.companyName,
        companyWebsite: candidate.domain ? `https://${candidate.domain}` : "",
        companyCareersUrl: candidate.careersUrl,
        sourceCompanyId: candidate.providerOrganizationId,
      },
      syntheticSource,
    );
  } catch {
    // Company creation shouldn't block source creation
    company = null;
  }

  const slug = await buildSourceSlug(candidate);
  const source = await JobSource.create({
    name: candidate.companyName,
    slug,
    type: candidate.detectedProvider,
    providerOrganizationId: candidate.providerOrganizationId,
    providerRegion: candidate.providerRegion || "global",
    careersUrl: candidate.careersUrl,
    endpointUrl: candidate.endpointUrl,
    baseUrl: candidate.domain ? `https://${candidate.domain}` : "",
    enabled: true,
    autoPublish: true,
    trusted: true,
    qualityThreshold: 90,
    syncFrequency: "daily",
    syncIntervalHours: 12,
    syncStatus: "idle",
    availabilityStatus: "available",
    verificationStatus: "Verified",
    lastVerifiedAt: candidate.lastVerifiedAt || new Date(),
    verifiedJobsFound: candidate.verifiedJobsFound || 0,
    verifiedUaeJobsFound: candidate.verifiedUaeJobsFound || 0,
    verificationNotes: `Automated discovery. Provider: ${candidate.detectedProvider}. Confidence: ${candidate.confidenceScore}/100.`,
    creationOrigin: "automated_source_discovery",
    nextSyncAt: new Date(Date.now() + 5 * 60_000), // 5 min from now
  });

  await DiscoveryCandidate.updateOne(
    { _id: candidate._id },
    {
      $set: {
        status: "created",
        createdCompanyId: company?._id || null,
        createdJobSourceId: source._id,
      },
    },
  );

  return { company, source, isNew: true };
}

// ─── Main discovery run ───────────────────────────────────────────────────────

/**
 * Run a full discovery cycle.
 *
 * Steps:
 *  1. Collect signals from existing jobs + sources.
 *  2. Filter duplicates against existing sources/companies and existing candidates.
 *  3. Upsert new DiscoveryCandidates.
 *  4. Pick candidates ready for verification (discovered / failed retry-ready / no_uae_jobs retry-ready).
 *  5. Verify up to config.maxVerificationsPerRun in parallel pools.
 *  6. Create Company+JobSource for newly verified candidates (up to config.maxCompaniesPerRun).
 *  7. Trigger initial sync for each newly created source.
 *  8. Write DiscoveryRunLog.
 */
export async function runDiscovery({ trigger = "scheduled" } = {}) {
  const config = cfg();
  if (!config.enabled) return { skipped: true, reason: "DISCOVERY_ENABLED=false" };

  const runId = makeRunId();
  const startedAt = new Date();

  // Create the run log immediately so admin can see it's running
  const runLog = await DiscoveryRunLog.create({ runId, trigger, status: "running", startedAt });

  const counts = {
    candidatesDiscovered: 0, candidatesVerified: 0,
    companiesCreated: 0, sourcesCreated: 0,
    jobsImported: 0, failed: 0, rejected: 0, skippedDuplicates: 0,
  };
  const errors = [];

  const logError = (candidateName, code, message) => {
    if (errors.length < 50) errors.push({ candidateName: cleanText(candidateName, 180), code, message: cleanText(message, 1000) });
    counts.failed += 1;
  };

  try {
    // ── 1. Collect raw signals ─────────────────────────────────────────────
    const [jobSignals, sourceSignals] = await Promise.all([
      extractCandidatesFromJobs({ limit: Math.ceil(config.maxCandidatesPerRun * 0.7) }),
      extractCandidatesFromSources({ limit: Math.ceil(config.maxCandidatesPerRun * 0.3) }),
    ]);
    const rawSignals = [...jobSignals, ...sourceSignals];

    // ── 2. Build exclusion set from existing sources + companies ───────────
    const exclusions = await buildSystemExclusions();

    // ── 3. Filter and upsert candidates ───────────────────────────────────
    for (const signal of rawSignals.slice(0, config.maxCandidatesPerRun)) {
      try {
        const board = detectProviderFromUrl(signal.careersUrl);
        if (!board) continue; // Only auto-create for known ATS providers
        if (duplicateSource({ ...signal, type: board.type, providerOrganizationId: board.providerOrganizationId }, exclusions)) {
          counts.skippedDuplicates += 1;
          continue;
        }
        const result = await upsertCandidate(signal);
        if (result) counts.candidatesDiscovered += 1;
      } catch (err) {
        logError(signal.companyName, "UPSERT_ERROR", err.message);
      }
    }

    // ── 4. Find candidates ready for verification ─────────────────────────
    const now = new Date();
    const toVerify = await DiscoveryCandidate.find({
      status: { $in: ["discovered", "failed", "no_uae_jobs"] },
      $or: [{ nextCheckAt: null }, { nextCheckAt: { $lte: now } }],
    })
      .sort({ confidenceScore: -1, createdAt: 1 })
      .limit(config.maxVerificationsPerRun)
      .lean();

    // ── 5. Verify in parallel pools ────────────────────────────────────────
    await pooledMap(
      toVerify,
      async (candidate) => {
        try {
          const result = await verifyCandidate(candidate, { config });
          if (result.status === "verified") counts.candidatesVerified += 1;
        } catch (err) {
          logError(candidate.companyName, "VERIFY_ERROR", err.message);
        }
      },
      config.maxConcurrent,
    );

    // ── 6. Create Company + JobSource for verified candidates ──────────────
    const verified = await DiscoveryCandidate.find({ status: "verified" })
      .sort({ confidenceScore: -1 })
      .limit(config.maxCompaniesPerRun)
      .lean();

    for (const candidate of verified) {
      try {
        const { source, isNew } = await createFromCandidate(candidate);
        if (!isNew) { counts.skippedDuplicates += 1; continue; }
        if (source) counts.sourcesCreated += 1;
        if (source) counts.companiesCreated += 1; // We resolve/create one company per source

        // ── 7. Initial sync ────────────────────────────────────────────────
        if (source?._id) {
          try {
            const syncResult = await syncJobSource(source._id, { trigger: "manual" });
            counts.jobsImported += syncResult?.imported || 0;
          } catch (syncErr) {
            logError(candidate.companyName, "INITIAL_SYNC_ERROR", syncErr.message);
          }
        }
      } catch (err) {
        logError(candidate.companyName, "CREATE_ERROR", err.message);
      }
    }

    // ── 8. Finalize run log ───────────────────────────────────────────────
    const completedAt = new Date();
    const hasErrors = errors.length > 0;
    const runStatus = hasErrors ? "partial" : "success";
    Object.assign(runLog, { status: runStatus, completedAt, durationMs: completedAt - startedAt, errors, ...counts });
    await runLog.save();

    return { runId, ...counts, durationMs: completedAt - startedAt, errors };
  } catch (err) {
    const completedAt = new Date();
    logError("discovery_run", "RUN_FAILED", err.message);
    Object.assign(runLog, { status: "failed", completedAt, durationMs: completedAt - startedAt, errors, ...counts });
    await runLog.save();
    throw err;
  }
}

// ─── Admin actions ────────────────────────────────────────────────────────────

/** Admin: manually verify a single candidate. */
export async function adminVerifyCandidate(candidateId) {
  const candidate = await DiscoveryCandidate.findById(candidateId);
  if (!candidate) throw Object.assign(new Error("Discovery candidate not found."), { statusCode: 404 });
  if (["rejected", "blocked"].includes(candidate.status)) {
    throw Object.assign(new Error("Cannot verify a rejected or blocked candidate."), { statusCode: 400 });
  }
  return verifyCandidate(candidate);
}

/** Admin: approve (verify + create) a candidate that requires_review. */
export async function adminApproveCandidate(candidateId) {
  const candidate = await DiscoveryCandidate.findById(candidateId);
  if (!candidate) throw Object.assign(new Error("Discovery candidate not found."), { statusCode: 404 });
  if (candidate.status === "rejected") throw Object.assign(new Error("Cannot approve a rejected candidate."), { statusCode: 400 });

  // Force status to verified so createFromCandidate will process it
  await DiscoveryCandidate.updateOne({ _id: candidateId }, { $set: { status: "verified" } });
  const updatedCandidate = await DiscoveryCandidate.findById(candidateId).lean();
  const { source, isNew } = await createFromCandidate(updatedCandidate);

  if (isNew && source?._id) {
    try { await syncJobSource(source._id, { trigger: "manual" }); } catch { /* logged by syncJobSource */ }
  }

  return { source, isNew };
}

/** Admin: reject a candidate. Also tombstones it so future rediscovery is suppressed. */
export async function adminRejectCandidate(candidateId, reason = "") {
  const candidate = await DiscoveryCandidate.findById(candidateId);
  if (!candidate) throw Object.assign(new Error("Discovery candidate not found."), { statusCode: 404 });
  await DiscoveryCandidate.updateOne(
    { _id: candidateId },
    { $set: { status: "rejected", rejectionReason: cleanText(reason, 500) } },
  );
  return { rejected: true };
}

/** Admin: retry a failed/blocked/no_uae_jobs candidate now. */
export async function adminRetryCandidate(candidateId) {
  const candidate = await DiscoveryCandidate.findById(candidateId);
  if (!candidate) throw Object.assign(new Error("Discovery candidate not found."), { statusCode: 404 });
  if (candidate.status === "rejected") throw Object.assign(new Error("Cannot retry a rejected candidate."), { statusCode: 400 });
  // Reset so it will be picked up in the next verification pass
  await DiscoveryCandidate.updateOne(
    { _id: candidateId },
    { $set: { status: "discovered", nextCheckAt: null, lastError: "" } },
  );
  return verifyCandidate({ ...candidate.toObject(), status: "discovered" });
}

// ─── Stats query ──────────────────────────────────────────────────────────────

export async function getDiscoveryStats() {
  const [statusCounts, recentRun, nextRun] = await Promise.all([
    DiscoveryCandidate.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    DiscoveryRunLog.findOne().sort({ startedAt: -1 }).lean(),
    DiscoveryCandidate.findOne({ status: "discovered" }).sort({ createdAt: 1 }).lean(),
  ]);

  const byStatus = Object.fromEntries(DISCOVERY_STATUSES.map((s) => [s, 0]));
  for (const item of statusCounts) byStatus[item._id] = item.count;

  return {
    byStatus,
    total: Object.values(byStatus).reduce((a, b) => a + b, 0),
    lastRun: recentRun ? {
      runId: recentRun.runId,
      status: recentRun.status,
      startedAt: recentRun.startedAt,
      completedAt: recentRun.completedAt,
      candidatesDiscovered: recentRun.candidatesDiscovered,
      candidatesVerified: recentRun.candidatesVerified,
      companiesCreated: recentRun.companiesCreated,
      sourcesCreated: recentRun.sourcesCreated,
      jobsImported: recentRun.jobsImported,
    } : null,
    config: {
      enabled: cfg().enabled,
      intervalHours: cfg().intervalHours,
      maxCandidatesPerRun: cfg().maxCandidatesPerRun,
      maxVerificationsPerRun: cfg().maxVerificationsPerRun,
      maxCompaniesPerRun: cfg().maxCompaniesPerRun,
    },
  };
}
