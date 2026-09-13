import dotenv from "dotenv";
import mongoose from "mongoose";
import { readFile, writeFile } from "node:fs/promises";
import JobSource from "../models/JobSource.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import JobSyncLog from "../models/JobSyncLog.js";
import { syncJobSource } from "../services/jobs/jobImport.service.js";
import { addDiscoveryBatch, createExclusionSet, duplicateSource, selectVerifiedSources } from "../services/jobs/jobSourceDiscovery.service.js";

dotenv.config({ quiet: true });
import { directory, runId } from "./job-discovery-options.js";
const read = async (name) => JSON.parse(await readFile(new URL(name, directory), "utf8"));
const save = async (name, value) => writeFile(new URL(name, directory), JSON.stringify(value, null, 2));
try {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  const baseline = await read("baseline.json");
  const verification = await read("verification.json");
  let selection;
  try { selection = await read("selection.json"); } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const sources = await JobSource.find({}).lean();
    const companies = await Company.find({}).lean();
    const ranked = [...verification.rows].sort((a, b) => (b.verification?.uaeJobsFound || 0) - (a.verification?.uaeJobsFound || 0));
    const selected = selectVerifiedSources(ranked, createExclusionSet(sources, companies));
    selection = { selectedAt: new Date(), baselineSourceCount: baseline.sources.length, sources: selected };
    await save("selection.json", selection);
  }
  if (!process.argv.includes("--apply")) {
    console.log(JSON.stringify({ mode: "preview", count: selection.sources.length, names: selection.sources.map((row) => row.name) }, null, 2));
  } else {
    const records = new Map();
    try { for (const row of (await read("manifest.json")).sources) records.set(row.boardKey, row); } catch { /* First application. */ }
    await addDiscoveryBatch(selection.sources, {
      runId,
      findBySlug: (slug) => JobSource.findOne({ slug }),
      checkDuplicate: async (row) => duplicateSource(row, createExclusionSet(await JobSource.find({}).lean(), await Company.find({}).lean())),
      createSource: (data) => JobSource.create(data),
      syncSource: syncJobSource,
      onProgress: async ({ row, source, sync, stage }) => {
        const boardKey = `${row.type}:${row.providerOrganizationId}`;
        const previous = records.get(boardKey);
        records.set(boardKey, {
          company: row.name, provider: row.type, boardId: row.providerOrganizationId, boardKey, sourceId: String(source._id),
          careersUrl: row.careersUrl, feedUrl: row.endpointUrl, evidenceUrl: row.evidenceUrl,
          uaeJobsFound: row.verification.uaeJobsFound, totalJobsReturned: row.verification.currentJobsFound,
          verificationDate: row.checkedAt, verificationResult: row.verification,
          credentialsRequired: false, syncEnabled: true, syncIntervalHours: 6, stage,
          initialSync: sync || previous?.initialSync || null,
        });
        await save("manifest.json", { run: runId, existingSourcesBefore: baseline.sources.length, successfullyAdded: [...records.values()].filter((record) => record.stage === "synced").length, sources: [...records.values()] });
        console.log(JSON.stringify({ stage, name: row.name, synchronized: [...records.values()].filter((record) => record.stage === "synced").length, imported: sync?.imported, errors: sync?.errors?.length }));
      },
    });
    const ids = [...records.values()].map((record) => new mongoose.Types.ObjectId(record.sourceId));
    const sources = await JobSource.find({ _id: { $in: ids } }).lean();
    const totalAfter = await JobSource.countDocuments();
    if (sources.length !== 100 || sources.some((source) => !source.enabled || !source.lastSuccessfulSyncAt) || totalAfter !== baseline.sources.length + 100) throw new Error("Final database count/initial-sync assertion failed.");
    const companies = await Company.find({}).lean();
    const baselineCompanyIds = new Set(baseline.companies.map((company) => String(company._id)));
    const jobCompanyIds = await Job.distinct("company", { source: { $in: ids } });
    const usedCompanies = new Set(jobCompanyIds.map(String));
    const jobs = await Job.find({ source: { $in: ids } }).select("status location category company applicationUrl sourceProvider creationOrigin employmentType workMode").lean();
    const logs = await JobSyncLog.find({ source: { $in: ids } }).lean();
    const providers = sources.reduce((out, source) => ({ ...out, [source.type]: (out[source.type] || 0) + 1 }), {});
    await save("summary.json", {
      existingSourcesBefore: baseline.sources.length, candidatesInvestigated: verification.rows.length,
      alreadyExistingOrDuplicate: verification.rows.filter((row) => row.rejection).length,
      rejectedInvalid: verification.rows.filter((row) => !row.rejection && !row.verification?.valid).length,
      newVerifiedSourcesAdded: sources.length, totalSourcesAfter: totalAfter, providers,
      liveUaeJobsImported: jobs.length, publishedJobs: jobs.filter((job) => job.status === "published").length,
      companiesCreated: companies.filter((company) => !baselineCompanyIds.has(String(company._id)) && usedCompanies.has(String(company._id))).length,
      existingCompaniesReused: [...usedCompanies].filter((id) => baselineCompanyIds.has(id)).length,
      duplicatesPrevented: [...records.values()].reduce((sum, record) => sum + (record.initialSync?.duplicates || 0) + (record.initialSync?.updated || 0) + (record.initialSync?.unchanged || 0), 0),
      crossSourceDuplicatesPrevented: logs.reduce((sum, log) => sum + (log.counts?.duplicates || 0), 0),
      sourcesRequiringCredentials: verification.rows.filter((row) => row.verification?.credentialsRequired).length,
      sourcesDisabled: sources.filter((source) => !source.enabled).length,
      locations: jobs.reduce((out, job) => ({ ...out, [job.location]: (out[job.location] || 0) + 1 }), {}),
      allJobsHaveCompanyAndAttribution: jobs.every((job) => job.company && job.sourceProvider && job.creationOrigin),
      allJobsHaveApplicationLinks: jobs.every((job) => /^https?:\/\//.test(job.applicationUrl)),
      allSourcesScheduled: sources.every((source) => source.nextSyncAt && source.syncIntervalHours === 6 && source.syncFrequency !== "manual"),
      completedAt: new Date(),
    });
    console.log(JSON.stringify(await read("summary.json"), null, 2));
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
