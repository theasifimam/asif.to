// Decides what happens to a freshly normalised import. Kept separate from the importer so the
// rule that gates every public listing is small, explicit and testable.

/** Below this quality score an import is rejected outright instead of waiting for review. */
export const REJECT_BELOW_SCORE = 70;

/**
 * `JOB_AUTO_PUBLISH=false` is an emergency brake: every import then waits in the review queue, even
 * from trusted sources. Anything else (including unset) leaves per-source settings in charge.
 */
export const autoPublishEnabled = (env = process.env.JOB_AUTO_PUBLISH) => String(env ?? "").trim().toLowerCase() !== "false";

export function isAutoPublishSource(source, env) {
  return Boolean(source?.autoPublish && source?.trusted) && autoPublishEnabled(env);
}

/**
 * @returns {"published"|"pending"|"rejected"}
 * Invalid records are rejected. Valid records from an auto-publish source publish once they reach the
 * source's quality threshold; every other valid record above REJECT_BELOW_SCORE waits for review.
 */
export function decideImportStatus({ valid, score, source }, env) {
  if (!valid) return "rejected";
  if (isAutoPublishSource(source, env) && score >= source.qualityThreshold) return "published";
  return score < REJECT_BELOW_SCORE ? "rejected" : "pending";
}
