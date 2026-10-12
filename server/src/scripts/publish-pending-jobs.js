// Publishes imported jobs that are sitting in the review queue although they meet their source's
// quality bar. Dry run by default; nothing changes without --apply.
//
//   npm run jobs:publish-pending                              what would be published, per source
//   npm run jobs:publish-pending -- --apply                   publish for sources already set to auto-publish
//   npm run jobs:publish-pending -- --apply --include-review-first
//                                                             also treat enabled public-ATS sources that
//                                                             are still "review first" as auto-publish,
//                                                             and switch those sources to auto-publish
//   npm run jobs:publish-pending -- --min-score=85            use one score for every source
//
// Skipped on purpose: jobs whose status an admin changed (overrideFields), possible duplicates,
// jobs that failed validation, jobs the source no longer lists, and anything already expired.
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../configs/db.js";
import Job from "../models/Job.js";
import JobSource from "../models/JobSource.js";

dotenv.config();

const PUBLIC_ATS_TYPES = ["greenhouse", "lever", "smartrecruiters", "workable", "ashby", "recruitee", "pinpoint", "teamtailor", "workday"];
const apply = process.argv.includes("--apply");
const includeReviewFirst = process.argv.includes("--include-review-first");
const minScoreArg = process.argv.find((item) => item.startsWith("--min-score="));
const minScore = minScoreArg ? Number(minScoreArg.split("=")[1]) : null;
if (minScoreArg && !(minScore >= 50 && minScore <= 100)) throw new Error("--min-score must be between 50 and 100.");

async function run() {
  await connectDB();
  const now = new Date();
  const pendingBySource = await Job.aggregate([
    { $match: { status: "pending", importedAt: { $ne: null } } },
    { $group: { _id: "$source", count: { $sum: 1 } } },
  ]);
  const sources = new Map((await JobSource.find({ _id: { $in: pendingBySource.map((row) => row._id) } })
    .select("name type enabled autoPublish trusted qualityThreshold").lean()).map((source) => [String(source._id), source]));
  const summary = { dryRun: !apply, evaluated: pendingBySource.length, published: 0, sourcesSwitchedToAuto: 0, perSource: [] };

  for (const row of pendingBySource) {
    const source = sources.get(String(row._id));
    if (!source?.enabled) continue;
    const alreadyAuto = source.autoPublish && source.trusted;
    const eligibleReviewFirst = includeReviewFirst && PUBLIC_ATS_TYPES.includes(source.type);
    if (!alreadyAuto && !eligibleReviewFirst) continue;
    const threshold = minScore ?? source.qualityThreshold;
    const filter = {
      source: source._id, status: "pending", importedAt: { $ne: null }, importQualityScore: { $gte: threshold },
      importStatus: { $nin: ["validation_failed", "source_removed", "duplicate"] }, duplicateCandidate: null,
      overrideFields: { $ne: "status" }, postedAt: { $lte: now },
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    };
    const ready = await Job.countDocuments(filter);
    if (!ready) continue;
    summary.perSource.push({ source: source.name, type: source.type, threshold, ready, switchesToAuto: !alreadyAuto });
    if (!apply) { summary.published += ready; continue; }
    const result = await Job.updateMany(filter, { $set: { status: "published" } });
    summary.published += result.modifiedCount;
    if (!alreadyAuto) {
      await JobSource.updateOne({ _id: source._id }, { $set: { autoPublish: true, trusted: true } });
      summary.sourcesSwitchedToAuto += 1;
    }
  }
  summary.perSource.sort((a, b) => b.ready - a.ready);
  console.log(JSON.stringify({ ...summary, perSource: summary.perSource.slice(0, 25), perSourceTotal: summary.perSource.length }, null, 2));
  if (!apply) console.log("\nDry run only. Re-run with --apply to publish.");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((error) => { console.error(error); process.exit(1); });
