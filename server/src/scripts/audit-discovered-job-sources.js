import dotenv from "dotenv";
import mongoose from "mongoose";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import JobSource from "../models/JobSource.js";
import Job from "../models/Job.js";
import Company from "../models/Company.js";
import { createExclusionSet, duplicateSource } from "../services/jobs/jobSourceDiscovery.service.js";
import { assertSafeRemoteHost } from "../utils/jobValidation.js";

dotenv.config({ quiet: true });
import { directory } from "./job-discovery-options.js";
const read = async (name) => JSON.parse(await readFile(new URL(name, directory), "utf8"));
const save = async (name, value) => writeFile(new URL(name, directory), JSON.stringify(value, null, 2));
try {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  const manifest = await read("manifest.json");
  const baseline = await read("baseline.json");
  const summary = await read("summary.json");
  const verification = await read("verification.json");
  const sourceIds = manifest.sources.map((source) => source.sourceId);
  const sources = await JobSource.find({ _id: { $in: sourceIds } }).lean();
  const baselineExclusions = createExclusionSet(baseline.sources, baseline.companies);
  assert.equal(sources.length, 100);
  assert.equal(await JobSource.countDocuments(), baseline.sources.length + 100);
  assert.equal(await JobSource.countDocuments({ _id: { $in: baseline.sources.map((source) => source._id) } }), baseline.sources.length);
  for (const source of sources) {
    assert.equal(duplicateSource(source, baselineExclusions), null, source.name);
    assert.ok(source.enabled && source.lastSuccessfulSyncAt && source.nextSyncAt && source.verifiedUaeJobsFound > 0, source.name);
  }
  const jobs = await Job.find({ source: { $in: sourceIds } }).select("source status location category company applicationUrl sourceProvider creationOrigin employmentType workMode postedAt").lean();
  const companyIds = new Set((await Company.find({ _id: { $in: jobs.map((job) => job.company) } }).select("_id").lean()).map((company) => String(company._id)));
  assert.ok(jobs.every((job) => companyIds.has(String(job.company)) && job.location && job.category && job.employmentType && job.workMode && job.postedAt && job.sourceProvider && job.creationOrigin));
  for (const record of manifest.sources) {
    const source = sources.find((item) => String(item._id) === record.sourceId);
    record.uaeJobsFound = source.verifiedUaeJobsFound;
    record.totalJobsReturned = source.verifiedJobsFound;
    record.verificationDate = source.lastVerifiedAt;
    record.verificationResult = { ...record.verificationResult, currentJobsFound: source.verifiedJobsFound, uaeJobsFound: source.verifiedUaeJobsFound };
    record.lastSyncAt = source.lastSuccessfulSyncAt;
    record.nextSyncAt = source.nextSyncAt;
    record.importedJobs = jobs.filter((job) => String(job.source) === record.sourceId).length;
  }
  summary.duplicatesPrevented = manifest.sources.reduce((sum, source) => sum + (source.initialSync?.duplicates || 0) + (source.initialSync?.updated || 0) + (source.initialSync?.unchanged || 0), 0);
  summary.alreadyExisting = verification.rows.filter((row) => row.rejection && duplicateSource(row, baselineExclusions)).length;
  summary.rejectedSourceDuplicates = verification.rows.filter((row) => row.rejection && !duplicateSource(row, baselineExclusions)).length;
  summary.blocked = verification.rows.filter((row) => row.verification?.access === "BLOCKED").length;
  summary.noCurrentValidUaeJobs = verification.rows.filter((row) => row.verification?.reason === "No valid current UAE jobs").length;
  summary.verificationFailed = verification.rows.filter((row) => row.verification?.valid === false && row.verification?.reason !== "No valid current UAE jobs").length;
  summary.verifiedReserveNotAdded = verification.rows.filter((row) => row.verification?.valid).length - 100;
  summary.jobStatusCounts = jobs.reduce((counts, job) => ({ ...counts, [job.status]: (counts[job.status] || 0) + 1 }), {});
  summary.allExistingSourcesPreserved = true;
  summary.allNewSourcesHaveCurrentUaeJobs = true;
  summary.allJobsHaveExistingFilterFields = true;
  if (process.argv.includes("--check-links")) {
    const checks = [];
    const samples = manifest.sources.map((source) => ({ source: source.company, url: jobs.find((job) => String(job.source) === source.sourceId)?.applicationUrl }));
    for (let start = 0; start < samples.length; start += 3) {
      checks.push(...await Promise.all(samples.slice(start, start + 3).map(async (sample) => {
        try {
          let url = sample.url;
          for (let redirects = 0; redirects < 4; redirects++) {
            await assertSafeRemoteHost(url);
            const response = await fetch(url, { method: "HEAD", redirect: "manual", signal: AbortSignal.timeout(8000), headers: { "User-Agent": "asif.to-jobs-importer/1.0" } });
            if ([301, 302, 303, 307, 308].includes(response.status) && response.headers.get("location")) { url = new URL(response.headers.get("location"), url).href; continue; }
            return { ...sample, checkedAt: new Date(), status: response.status, finalUrl: url, reachable: response.ok };
          }
          return { ...sample, reachable: false, reason: "Redirect limit" };
        } catch (error) { return { ...sample, reachable: false, reason: error.message }; }
      })));
      console.log(`Application link checks: ${checks.length}/100`);
    }
    await save("application-link-checks.json", checks);
    summary.applicationLinkChecks = { sampled: checks.length, reachable: checks.filter((check) => check.reachable).length, notConfirmedByHeadRequest: checks.filter((check) => !check.reachable).length };
  }
  await save("manifest.json", manifest);
  await save("summary.json", summary);
  console.log(JSON.stringify(summary, null, 2));
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
