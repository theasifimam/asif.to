import JobSuppression from "../../models/JobSuppression.js";

export function suppressionKeys(job) {
  return [
    job.source && job.sourceJobId ? `source:${job.source}:${job.sourceJobId}` : null,
    job.normalizedApplicationUrl ? `application:${job.normalizedApplicationUrl}` : null,
    job.fingerprint ? `fingerprint:${job.fingerprint}` : null,
  ].filter(Boolean);
}

export async function suppressDeletedJob(job, Model = JobSuppression) {
  if (!job.importedAt) return;
  for (const key of suppressionKeys(job)) await Model.updateOne({ key }, { $setOnInsert: { key, reason: "admin_deleted" } }, { upsert: true });
}

export async function isJobSuppressed(job, Model = JobSuppression) {
  const keys = suppressionKeys(job);
  return keys.length > 0 && Boolean(await Model.exists({ key: { $in: keys } }));
}
