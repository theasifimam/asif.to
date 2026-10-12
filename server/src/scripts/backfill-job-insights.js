/**
 * Back-fills the job insight fields on jobs imported before they existed:
 *   - skills read from the posting text
 *   - salary and experience stated in the posting text
 *   - honest posted dates (postedAtSource "first_seen" where the source gave none)
 *
 * Dry run by default (prints what would change). Pass --apply to write.
 *   node src/scripts/backfill-job-insights.js            # preview
 *   node src/scripts/backfill-job-insights.js --apply    # write
 * Fields an admin edited (overrideFields) are never touched.
 */
import { pathToFileURL } from "url";
import dotenv from "dotenv";
import connectDB from "../configs/db.js";
import Job from "../models/Job.js";
import { extractExperienceHint, extractSalary, extractSkills, extractTags } from "../services/jobs/jobExtraction.service.js";
import { normalizeExperience } from "../services/jobs/jobNormalization.service.js";

dotenv.config();
const apply = process.argv.includes("--apply");
const FIVE_MINUTES = 5 * 60_000;

export function planBackfill(job) {
  const protectedFields = new Set(job.overrideFields || []);
  const set = {};
  const text = `${job.title}\n${job.description || ""}`;

  const skills = [...new Set([...(job.skills || []), ...extractSkills(text).map((skill) => skill.label)])].slice(0, 30);
  if (!protectedFields.has("skills") && skills.length > (job.skills || []).length) set.skills = skills;

  if (!job.salaryVisible && !protectedFields.has("minimumSalary") && !protectedFields.has("maximumSalary")) {
    const stated = extractSalary(job.description || "");
    if (stated) Object.assign(set, stated, { salaryCurrency: "AED", salaryVisible: true, salarySource: "description" });
  }

  if (job.experienceLevel === "not-specified" && job.minimumExperience == null && !protectedFields.has("experienceLevel")) {
    const hint = extractExperienceHint(job.description || "");
    if (hint) {
      const { experienceLevel, minimumExperience, maximumExperience, originalExperienceText } = normalizeExperience(hint, job.title);
      if (experienceLevel !== "not-specified") Object.assign(set, { experienceLevel, minimumExperience, maximumExperience, originalExperienceText });
    }
  }

  const tags = extractTags(`${job.title}
${job.description || ""}`);
  if (!protectedFields.has("tags") && tags.length && tags.join() !== (job.tags || []).join()) set.tags = tags;

  // Imported with no provider date: postedAt was set to the sync time, which drifted forward.
  const syncedTogether = job.importedAt && job.lastSyncedAt && Math.abs(new Date(job.postedAt) - new Date(job.lastSyncedAt)) <= FIVE_MINUTES;
  if (job.importedAt && job.postedAtSource !== "first_seen" && syncedTogether && !protectedFields.has("postedAt")) {
    set.postedAtSource = "first_seen";
    set.postedAt = job.createdAt || job.importedAt;
  }
  return set;
}

async function run() {
  await connectDB();
  const counts = { scanned: 0, changed: 0, skills: 0, tags: 0, salary: 0, experience: 0, postedAt: 0 };
  const operations = [];
  const cursor = Job.find({ status: { $in: ["published", "pending", "expired"] } }).select("title description skills tags salaryVisible experienceLevel minimumExperience overrideFields importedAt lastSyncedAt postedAt postedAtSource createdAt").lean().cursor();
  for await (const job of cursor) {
    counts.scanned += 1;
    const set = planBackfill(job);
    if (!Object.keys(set).length) continue;
    counts.changed += 1;
    if (set.skills) counts.skills += 1;
    if (set.tags) counts.tags += 1;
    if (set.salarySource) counts.salary += 1;
    if (set.experienceLevel) counts.experience += 1;
    if (set.postedAtSource) counts.postedAt += 1;
    operations.push({ updateOne: { filter: { _id: job._id }, update: { $set: set } } });
    if (apply && operations.length >= 500) await Job.bulkWrite(operations.splice(0), { ordered: false });
  }
  if (apply && operations.length) await Job.bulkWrite(operations, { ordered: false });
  console.log(`${apply ? "APPLIED" : "DRY RUN (use --apply to write)"}:`, counts);
  process.exit(0);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  run().catch((error) => { console.error(error); process.exit(1); });
}
