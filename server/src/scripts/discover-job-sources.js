import dotenv from "dotenv";
import mongoose from "mongoose";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import JobSource from "../models/JobSource.js";
import Company from "../models/Company.js";
import { providerForSource } from "../services/jobs/providers/index.js";
import { normalizeImportedJob } from "../services/jobs/jobImport.service.js";
import { createExclusionSet, detectJobBoard, duplicateSource, sourceIdentityKeys } from "../services/jobs/jobSourceDiscovery.service.js";

dotenv.config({ quiet: true });
import { directory, candidateFile } from "./job-discovery-options.js";
try {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  const sources = await JobSource.find({}).lean();
  const companies = await Company.find({}).lean();
  const exclusions = createExclusionSet(sources, companies);
  await mkdir(directory, { recursive: true });
  const snapshotPath = new URL("baseline.json", directory);
  try { await writeFile(snapshotPath, JSON.stringify({ checkedAt: new Date(), sources, companies }, null, 2), { flag: "wx" }); } catch (error) { if (error.code !== "EEXIST") throw error; }
  const candidates = JSON.parse(await readFile(candidateFile, "utf8"));
  const reportPath = new URL("verification.json", directory);
  let previous = [];
  try { previous = JSON.parse(await readFile(reportPath, "utf8")).rows; } catch { /* First run. */ }
  if (process.argv.includes("--retry-failed")) previous = previous.filter((row) => row.verification?.valid);
  if (process.argv.includes("--retry-network")) previous = previous.filter((row) => !/fetch failed|ENOTFOUND|timeout/i.test(row.verification?.reason || ""));
  const rows = [...previous];
  const processed = new Set(previous.map((row) => row.evidenceUrl));
  for (const row of previous.filter((row) => row.verification?.valid)) for (const key of sourceIdentityKeys(row)) exclusions.add(key);
  for (const candidate of candidates) {
    if (processed.has(candidate.evidenceUrl)) continue;
    let row = { ...candidate, checkedAt: new Date() };
    try {
      Object.assign(row, detectJobBoard(candidate.evidenceUrl));
      const duplicate = duplicateSource(row, exclusions);
      if (duplicate) { row.rejection = "Already existing or duplicate"; row.duplicateKey = duplicate; }
      else {
        const provider = providerForSource(row);
        const rawJobs = await provider.fetchJobs();
        let validJobs = 0;
        const locations = new Set();
        for (const raw of rawJobs) {
          try { const result = await normalizeImportedJob(raw, row, provider); if (result.validation.valid) { validJobs++; locations.add(result.data.location); } } catch { /* Invalid jobs never qualify a source. */ }
        }
        row.verification = { reachable: true, providerDetected: true, publicFeedAvailable: true, credentialsRequired: false, access: "PUBLIC_STRUCTURED_FEED", currentJobsFound: provider.lastFetchStats?.jobsFound || rawJobs.length, uaeJobsFound: validJobs, valid: validJobs > 0, reason: validJobs ? null : "No valid current UAE jobs", locations: [...locations] };
        if (validJobs) for (const key of sourceIdentityKeys(row)) exclusions.add(key);
      }
    } catch (error) {
      row.verification = { valid: false, reachable: false, credentialsRequired: error.statusCode === 401, access: error.statusCode === 401 ? "REQUIRES_CREDENTIALS" : [403, 429].includes(error.statusCode) ? "BLOCKED" : "UNSUPPORTED", reason: error.message };
    }
    rows.push(row);
    await writeFile(reportPath, JSON.stringify({ baselineSourceCount: sources.length, checkedAt: new Date(), rows }, null, 2));
    console.log(JSON.stringify({ name: row.name, provider: row.type, jobs: row.verification?.currentJobsFound, uae: row.verification?.uaeJobsFound, valid: row.verification?.valid, reason: row.rejection || row.verification?.reason, verifiedSoFar: rows.filter((item) => item.verification?.valid).length }));
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
