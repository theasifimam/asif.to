/**
 * Ranks candidate jobs by how similar they are to a given job: shared skills first,
 * then shared title words, then category/seniority/location. Pure so it can be tested.
 */
const STOP = new Set(["the", "and", "for", "with", "senior", "junior", "lead", "sr", "jr", "manager", "specialist", "executive", "officer", "assistant", "dubai", "abu", "dhabi", "uae"]);
const titleWords = (title = "") => new Set(String(title).toLowerCase().replace(/[^a-z0-9+#\s]/g, " ").split(/\s+/).filter((word) => word.length > 2 && !STOP.has(word)));
const overlap = (a, b) => { let n = 0; for (const item of a) if (b.has(item)) n += 1; return n; };

export function similarityScore(job, other) {
  const skillsA = new Set((job.skills || []).map((skill) => skill.toLowerCase()));
  const skillsB = new Set((other.skills || []).map((skill) => skill.toLowerCase()));
  const sharedSkills = overlap(skillsA, skillsB);
  const wordsA = titleWords(job.title); const wordsB = titleWords(other.title);
  const sharedWords = overlap(wordsA, wordsB);
  let score = 0;
  if (skillsA.size && skillsB.size) score += 4 * (sharedSkills / Math.max(1, Math.min(skillsA.size, skillsB.size)));
  if (wordsA.size && wordsB.size) score += 5 * (sharedWords / Math.max(1, Math.min(wordsA.size, wordsB.size)));
  // Category and seniority only refine a match that already shares skills or title words.
  if (sharedSkills || sharedWords) {
    if (job.categorySlug && job.categorySlug === other.categorySlug) score += 1.5;
    if (job.experienceLevel && job.experienceLevel !== "not-specified" && job.experienceLevel === other.experienceLevel) score += 0.5;
    if (job.locationSlug && job.locationSlug === other.locationSlug) score += 0.75;
  }
  return score;
}

/** Best `limit` similar jobs, at most `perCompany` from any one employer for variety. */
export function rankSimilarJobs(job, candidates, { limit = 6, perCompany = 2, minScore = 1.5 } = {}) {
  const ranked = candidates
    .filter((other) => String(other._id) !== String(job._id))
    .map((other) => ({ other, score: similarityScore(job, other) }))
    .filter((item) => item.score >= minScore)
    .sort((a, b) => b.score - a.score || new Date(b.other.postedAt) - new Date(a.other.postedAt));
  const perCompanyCount = new Map(); const picked = [];
  for (const { other } of ranked) {
    const key = String(other.company?._id || other.company || other._id);
    if ((perCompanyCount.get(key) || 0) >= perCompany) continue;
    perCompanyCount.set(key, (perCompanyCount.get(key) || 0) + 1);
    picked.push(other);
    if (picked.length === limit) break;
  }
  return picked;
}
