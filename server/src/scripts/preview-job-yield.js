// Read-only preview: fetches the public feed of every enabled source (the same requests a scheduled sync
// makes) and reports how many in-scope jobs each country would contribute. Nothing is written.
//
//   npm run preview:job-yield                 all enabled sources
//   npm run preview:job-yield -- --limit=40   only the first 40 (quick check)
//   npm run preview:job-yield -- --countries=AE,SA   preview a narrower JOB_COUNTRIES setting
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
mongoose.set("autoIndex", false);
mongoose.set("autoCreate", false);

const { default: connectDB } = await import("../configs/db.js");
const { default: JobSource } = await import("../models/JobSource.js");
const { default: Job } = await import("../models/Job.js");
const { providerForSource } = await import("../services/jobs/providers/index.js");
const { normalizeRegionLocation } = await import("../services/jobs/jobNormalization.service.js");
const { syncSourcesWithLimits } = await import("../services/jobs/jobScheduler.service.js");
const { publicJobFilter } = await import("../utils/jobValidation.js");

const arg = (name) => process.argv.find((item) => item.startsWith(`--${name}=`))?.split("=")[1];
const limit = Number(arg("limit")) || 0;
if (arg("countries")) process.env.JOB_COUNTRIES = arg("countries");

try {
  await connectDB();
  let sources = await JobSource.find({ enabled: true, type: { $ne: "manual" } }).select("name type providerOrganizationId providerRegion baseUrl careersUrl endpointUrl jobsPath fieldMapping credentialEnvKey").lean();
  if (limit) sources = sources.slice(0, limit);
  const byId = new Map(sources.map((source) => [String(source._id), source]));
  const perSource = []; const failures = [];
  const outcome = await syncSourcesWithLimits(sources, async (id) => {
    const source = byId.get(String(id));
    try {
      const provider = providerForSource(source);
      const jobs = await provider.fetchJobs();
      const countries = {};
      for (const raw of jobs) {
        const place = normalizeRegionLocation(provider.normalizeJob(raw).location, provider.normalizeJob(raw).country);
        if (place) countries[place.country] = (countries[place.country] || 0) + 1;
      }
      perSource.push({ name: source.name, type: source.type, total: jobs.length, countries });
    } catch (error) {
      failures.push({ name: source.name, type: source.type, error: String(error.message).slice(0, 100) });
      throw error;
    }
  }, { concurrency: 6, perProvider: 2, trigger: "preview" });

  const totals = {};
  for (const row of perSource) for (const [code, count] of Object.entries(row.countries)) totals[code] = (totals[code] || 0) + count;
  const activeNow = await Job.countDocuments({ ...publicJobFilter(), isDemo: { $ne: true } });
  const inScope = Object.values(totals).reduce((sum, count) => sum + count, 0);
  console.log(JSON.stringify({
    sourcesChecked: sources.length, fetched: outcome.synced, failed: outcome.failed,
    activeJobsNow: activeNow, inScopeJobsOnSourcesToday: inScope, byCountry: totals,
    topSources: perSource.sort((a, b) => b.total - a.total).slice(0, 15),
    failures: failures.slice(0, 10),
  }, null, 2));
  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error(error);
  process.exit(1);
}
