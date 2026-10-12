/**
 * Salary statistics from postings that state a salary. Honest by construction:
 * a figure is only reported with the number of postings behind it, and groups
 * smaller than the minimum sample are never summarised.
 */
export const MIN_SAMPLE = 5;      // postings needed before a group is reported at all
export const MIN_SUBGROUP = 3;    // smaller breakdowns (by level or emirate) inside a reported group

const PERIOD_TO_MONTH = { month: 1, year: 1 / 12 };

/** Monthly-equivalent midpoint of a posting's stated range, or null (hourly/daily pay is not comparable). */
export function monthlyMidpoint(job) {
  const factor = PERIOD_TO_MONTH[job.salaryPeriod || "month"];
  if (!factor || !job.salaryVisible) return null;
  const low = job.minimumSalary ?? job.maximumSalary;
  const high = job.maximumSalary ?? job.minimumSalary;
  if (low == null || high == null) return null;
  return ((low + high) / 2) * factor;
}

const percentile = (sorted, p) => {
  if (!sorted.length) return null;
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index); const upper = Math.ceil(index);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
};
const roundTo = (value, step = 100) => (value == null ? null : Math.round(value / step) * step);

/** @returns {{n: number, median: number, low: number, high: number}|null} null below `minimum` postings. */
export function summarizeSalaries(jobs, minimum = MIN_SAMPLE) {
  const values = jobs.map(monthlyMidpoint).filter((value) => value != null).sort((a, b) => a - b);
  if (values.length < minimum) return null;
  return { n: values.length, median: roundTo(percentile(values, 0.5)), low: roundTo(percentile(values, 0.25)), high: roundTo(percentile(values, 0.75)) };
}

/** Summaries per group key, keeping only groups with enough postings, biggest first. */
export function summarizeBy(jobs, keyOf, minimum = MIN_SAMPLE) {
  const groups = new Map();
  for (const job of jobs) {
    const key = keyOf(job);
    if (!key) continue;
    if (!groups.has(key.id)) groups.set(key.id, { ...key, jobs: [] });
    groups.get(key.id).jobs.push(job);
  }
  return [...groups.values()]
    .map(({ jobs: members, ...key }) => ({ ...key, ...summarizeSalaries(members, minimum) }))
    .filter((group) => group.n)
    .sort((a, b) => b.n - a.n);
}
