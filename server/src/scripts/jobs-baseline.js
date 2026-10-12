// Read-only baseline for the jobs pipeline: how many jobs are live, where they come from, why others
// are not live, and how healthy syncing and discovery are. It writes nothing and builds no indexes.
//
//   npm run report:jobs                      human-readable
//   npm run report:jobs -- --json            machine-readable (for diffing before/after a change)
//   npm run report:jobs -- --target=10000    gap to a different active-job target
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
// Importing the models would otherwise ask Mongo to create any index the code defines but the database
// lacks. A report must never change the database it is measuring.
mongoose.set("autoIndex", false);
mongoose.set("autoCreate", false);

const { default: connectDB } = await import("../configs/db.js");
const { default: Job } = await import("../models/Job.js");
const { default: JobSource } = await import("../models/JobSource.js");
const { default: JobSyncLog } = await import("../models/JobSyncLog.js");
const { default: DiscoveryCandidate } = await import("../models/DiscoveryCandidate.js");
const { default: DiscoveryRunLog } = await import("../models/DiscoveryRunLog.js");
const { publicJobFilter } = await import("../utils/jobValidation.js");

const arg = (name, fallback) => {
  const hit = process.argv.find((item) => item.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const asJson = process.argv.includes("--json");
const target = Number(arg("target", 10_000)) || 10_000;
const DAY = 86_400_000;

const countBy = async (model, match, field, { limit = 0 } = {}) => {
  const rows = await model.aggregate([
    { $match: match }, { $group: { _id: `$${field}`, count: { $sum: 1 } } }, { $sort: { count: -1 } }, ...(limit ? [{ $limit: limit }] : []),
  ]);
  return Object.fromEntries(rows.map((row) => [row._id ?? "(none)", row.count]));
};
const pct = (part, whole) => (whole ? Math.round((part / whole) * 1000) / 10 : 0);

async function build() {
  const now = new Date();
  const active = { ...publicJobFilter(now), isDemo: { $ne: true } };
  const [activeTotal, allByStatus, byCountry, byProvider, byLocation, byCategory, withSalary, providerDated, importedActive, manualActive] = await Promise.all([
    Job.countDocuments(active),
    countBy(Job, {}, "status"),
    countBy(Job, active, "country"),
    countBy(Job, active, "sourceProvider"),
    countBy(Job, active, "location", { limit: 15 }),
    countBy(Job, active, "category", { limit: 10 }),
    Job.countDocuments({ ...active, salaryVisible: true }),
    Job.countDocuments({ ...active, postedAtSource: "provider" }),
    Job.countDocuments({ ...active, importedAt: { $ne: null } }),
    Job.countDocuments({ ...active, importedAt: null }),
  ]);

  const sources = await JobSource.find().select("name type enabled autoPublish trusted qualityThreshold verificationStatus syncStatus syncIntervalHours nextSyncAt lastSuccessfulSyncAt lastError").lean();
  const sourceById = new Map(sources.map((source) => [String(source._id), source]));
  const activeBySource = await Job.aggregate([{ $match: active }, { $group: { _id: "$source", count: { $sum: 1 } } }]);
  const activeCount = new Map(activeBySource.map((row) => [String(row._id), row.count]));
  const enabled = sources.filter((source) => source.enabled);
  const autoPublishing = enabled.filter((source) => source.autoPublish && source.trusted);
  const overdue = enabled.filter((source) => source.nextSyncAt && now - new Date(source.nextSyncAt) > 2 * (source.syncIntervalHours || 12) * 3_600_000);
  const topSources = [...activeCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)
    .map(([id, count]) => ({ source: sourceById.get(id)?.name || id, type: sourceById.get(id)?.type || "?", activeJobs: count }));
  const emptyEnabled = enabled.filter((source) => !activeCount.get(String(source._id))).length;
  const meanYield = activeCount.size ? activeTotal / activeCount.size : 0;

  // Why jobs are not live: a pending job from an auto-publish source missed the quality bar; one from a
  // review-first source is waiting for a person, which is the manual work to eliminate.
  const pendingBySource = await Job.aggregate([
    { $match: { status: "pending", importedAt: { $ne: null } } },
    { $group: { _id: "$source", count: { $sum: 1 }, avgScore: { $avg: "$importQualityScore" } } },
  ]);
  const pending = { total: 0, lowQualityFromAutoPublishSources: 0, fromReviewFirstSources: 0, topSources: [] };
  for (const row of pendingBySource) {
    const source = sourceById.get(String(row._id));
    pending.total += row.count;
    if (source?.autoPublish && source?.trusted) pending.lowQualityFromAutoPublishSources += row.count;
    else pending.fromReviewFirstSources += row.count;
    pending.topSources.push({ source: source?.name || String(row._id), jobs: row.count, avgScore: Math.round(row.avgScore || 0), autoPublish: Boolean(source?.autoPublish && source?.trusted) });
  }
  pending.topSources = pending.topSources.sort((a, b) => b.jobs - a.jobs).slice(0, 10);

  const [syncDay, syncWeek, lastSync] = await Promise.all([
    countBy(JobSyncLog, { startedAt: { $gte: new Date(now - DAY) } }, "status"),
    countBy(JobSyncLog, { startedAt: { $gte: new Date(now - 7 * DAY) } }, "status"),
    JobSyncLog.findOne().sort({ startedAt: -1 }).select("sourceName status startedAt").lean(),
  ]);
  const failedSources = sources.filter((source) => source.enabled && source.syncStatus === "failed");
  const [candidatesByStatus, lastRuns] = await Promise.all([
    countBy(DiscoveryCandidate, {}, "status"),
    DiscoveryRunLog.find().sort({ startedAt: -1 }).limit(5).select("startedAt status sourcesCreated jobsImported candidatesDiscovered skippedDuplicates failed").lean(),
  ]);

  return {
    generatedAt: now.toISOString(),
    target: { activeJobs: target, gap: Math.max(0, target - activeTotal), reachedPercent: pct(activeTotal, target), meanActiveJobsPerProductiveSource: Math.round(meanYield * 10) / 10,
      productiveSourcesNeededAtMeanYield: meanYield ? Math.ceil(target / meanYield) : null },
    activeJobs: { total: activeTotal, imported: importedActive, manual: manualActive, byCountry, byProvider, topLocations: byLocation, topCategories: byCategory,
      withSalaryPercent: pct(withSalary, activeTotal), employerDatedPercent: pct(providerDated, activeTotal) },
    allJobsByStatus: allByStatus,
    pending,
    sources: { total: sources.length, enabled: enabled.length, autoPublishing: autoPublishing.length, reviewFirstEnabled: enabled.length - autoPublishing.length,
      byType: Object.fromEntries(Object.entries(sources.reduce((acc, source) => ({ ...acc, [source.type]: (acc[source.type] || 0) + 1 }), {}))),
      byVerification: Object.fromEntries(Object.entries(sources.reduce((acc, source) => ({ ...acc, [source.verificationStatus]: (acc[source.verificationStatus] || 0) + 1 }), {}))),
      enabledWithNoActiveJobs: emptyEnabled, overdueForSync: overdue.length, lastSyncFailed: failedSources.length,
      failingSample: failedSources.slice(0, 5).map((source) => ({ name: source.name, type: source.type, error: (source.lastError || "").slice(0, 120) })) },
    topSources,
    syncRuns: { last24h: syncDay, last7d: syncWeek, latest: lastSync },
    discovery: { candidatesByStatus, recentRuns: lastRuns },
  };
}

const print = (report) => {
  const line = (label, value) => console.log(`  ${label.padEnd(34)} ${value}`);
  const map = (object) => Object.entries(object).map(([key, value]) => `${key}=${value}`).join("  ") || "(none)";
  console.log(`\nJobs baseline — ${report.generatedAt}\n`);
  console.log("Target");
  line("active jobs target", report.target.activeJobs);
  line("active jobs now", `${report.activeJobs.total} (${report.target.reachedPercent}% of target, gap ${report.target.gap})`);
  line("mean jobs per productive source", report.target.meanActiveJobsPerProductiveSource);
  line("sources needed at that yield", report.target.productiveSourcesNeededAtMeanYield ?? "n/a");
  console.log("\nActive jobs");
  line("imported / manual", `${report.activeJobs.imported} / ${report.activeJobs.manual}`);
  line("by country", map(report.activeJobs.byCountry));
  line("by provider", map(report.activeJobs.byProvider));
  line("top locations", map(report.activeJobs.topLocations));
  line("top categories", map(report.activeJobs.topCategories));
  line("with a salary", `${report.activeJobs.withSalaryPercent}%`);
  line("dated by the employer", `${report.activeJobs.employerDatedPercent}%`);
  console.log("\nAll jobs by status");
  line("status", map(report.allJobsByStatus));
  console.log("\nWaiting for review (imported, pending)");
  line("total pending", report.pending.total);
  line("missed quality bar (auto sources)", report.pending.lowQualityFromAutoPublishSources);
  line("from review-first sources", report.pending.fromReviewFirstSources);
  for (const row of report.pending.topSources) line(`  ${row.source}`, `${row.jobs} jobs, avg score ${row.avgScore}, ${row.autoPublish ? "auto" : "review-first"}`);
  console.log("\nSources");
  line("total / enabled", `${report.sources.total} / ${report.sources.enabled}`);
  line("enabled & auto-publishing", report.sources.autoPublishing);
  line("enabled & review-first", report.sources.reviewFirstEnabled);
  line("enabled with no active jobs", report.sources.enabledWithNoActiveJobs);
  line("overdue for sync", report.sources.overdueForSync);
  line("last sync failed", report.sources.lastSyncFailed);
  line("by type", map(report.sources.byType));
  line("by verification", map(report.sources.byVerification));
  for (const row of report.sources.failingSample) line(`  failing: ${row.name} (${row.type})`, row.error);
  console.log("\nTop sources by active jobs");
  for (const row of report.topSources) line(`  ${row.source} (${row.type})`, row.activeJobs);
  console.log("\nSync runs");
  line("last 24h", map(report.syncRuns.last24h));
  line("last 7d", map(report.syncRuns.last7d));
  console.log("\nDiscovery");
  line("candidates", map(report.discovery.candidatesByStatus));
  for (const run of report.discovery.recentRuns) line(`  ${new Date(run.startedAt).toISOString()}`, `${run.status}: ${run.candidatesDiscovered} found, ${run.sourcesCreated} sources, ${run.jobsImported} jobs, ${run.failed} errors`);
  console.log("");
};

try {
  await connectDB();
  const report = await build();
  if (asJson) console.log(JSON.stringify(report, null, 2)); else print(report);
  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error(error);
  process.exit(1);
}
