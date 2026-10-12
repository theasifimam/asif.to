/**
 * Pure text extraction for job postings: skills, salary and experience that
 * providers rarely send as structured data. Everything here is conservative; a
 * missed value is better than a wrong one on a job-seeker's screen.
 */
import { SKILL_CATALOG } from "./skillCatalog.js";
import { JOB_TAGS } from "../../constants/jobTags.js";

/** Skills mentioned in `text`, in catalog order. Returns catalog entries. */
export function extractSkills(text = "") {
  const source = String(text || "");
  if (!source) return [];
  return SKILL_CATALOG.filter((skill) => skill.pattern.test(source));
}

const CURRENCY = "(?:AED|Dhs?\\.?|dirhams?)";
const NUMBER = "(\\d{1,3}(?:,\\d{3})+|\\d+(?:\\.\\d+)?)\\s*(k)?";
const DASH = "\\s*(?:-|–|—|to)\\s*";
const RANGE_BEFORE = new RegExp(`${CURRENCY}\\s*${NUMBER}${DASH}(?:${CURRENCY}\\s*)?${NUMBER}`, "i");
// "AED 255,000 (average performance) to AED 293,000": a short aside between the two figures.
const RANGE_GAP = new RegExp(`${CURRENCY}\\s*${NUMBER}[^.]{0,40}?\\s(?:-|–|—|to)\\s*${CURRENCY}\\s*${NUMBER}`, "i");
const RANGE_AFTER = new RegExp(`${NUMBER}${DASH}${NUMBER}\\s*${CURRENCY}\\b`, "i");
const SINGLE = new RegExp(`${CURRENCY}\\s*${NUMBER}`, "i");
const SALARY_CONTEXT = /salary|remuneration|compensation|package|\bpay\b|per\s*(?:month|annum|year|hour|day)|monthly|annual|\bp\.?m\b|\bp\.?a\b|gross|basic/i;
// A figure that is followed by one of these is a perk or fee, not the salary.
const NOT_SALARY_AFTER = /^\s*(?:\/\s*\w+\s*)?(?:as\s+)?(?:bonus|allowance|commission|fee|deposit|insurance|cover|reimburse|relocation|sign[- ]?on|joining)/i;

const toAmount = (digits, k) => Number(String(digits).replace(/,/g, "")) * (k ? 1000 : 1);

const BOUNDS = { hour: [5, 2_000], day: [30, 10_000], month: [1_000, 500_000], year: [12_000, 6_000_000] };

// `explicit` is false when the text names no period and we fall back to "month".
function detectPeriod(window) {
  if (/per\s*(?:year|annum)|annual|\bp\.?a\b|yearly|first[- ]year/i.test(window)) return { period: "year", explicit: true };
  if (/per\s*hour|hourly|\/\s*hr\b/i.test(window)) return { period: "hour", explicit: true };
  if (/per\s*day|daily/i.test(window)) return { period: "day", explicit: true };
  return { period: "month", explicit: /per\s*month|monthly|\bp\.?m\b|\/\s*month/i.test(window) };
}

// Above this, an unlabelled monthly figure is more likely an annual one; better to show nothing.
const AMBIGUOUS_MONTHLY_ABOVE = 60_000;

/**
 * Salary stated in the posting text. Returns { minimumSalary, maximumSalary, salaryPeriod }
 * or null. Requires an explicit AED/Dhs amount near a salary-like word.
 */
export function extractSalary(text = "") {
  const source = String(text || "").replace(/\s+/g, " ");
  if (!source) return null;
  for (const [pattern, kind] of [[RANGE_BEFORE, "range"], [RANGE_AFTER, "range"], [RANGE_GAP, "range"], [SINGLE, "single"]]) {
    const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
    for (const match of source.matchAll(new RegExp(pattern.source, flags))) {
      const start = match.index; const end = start + match[0].length;
      const window = source.slice(Math.max(0, start - 80), Math.min(source.length, end + 80));
      if (!SALARY_CONTEXT.test(window)) continue;
      if (NOT_SALARY_AFTER.test(source.slice(end, end + 30))) continue;
      let min = toAmount(match[1], match[2]);
      let max = kind === "range" ? toAmount(match[3], match[4]) : min;
      if (min > max) [min, max] = [max, min];
      // "AED 15-20k": the unit on the second number applies to the first.
      if (kind === "range" && match[4] && !match[2] && min < 1_000) min *= 1000;
      const { period, explicit } = detectPeriod(window);
      const [low, high] = BOUNDS[period];
      if (min < low || max > high) continue;
      if (period === "month" && !explicit && max > AMBIGUOUS_MONTHLY_ABOVE) continue;
      return { minimumSalary: min, maximumSalary: max, salaryPeriod: period };
    }
  }
  return null;
}

const EXPERIENCE = /((?:minimum|at least|min\.?)\s*(?:of\s*)?\d{1,2}\s*\+?\s*years?|\d{1,2}\s*(?:-|–|—|to)\s*\d{1,2}\s*\+?\s*years?|\d{1,2}\s*\+\s*years?|\d{1,2}\s*years?)['’]?s?\s*(?:of\s*)?(?:(?:relevant|proven|professional|work|hands[- ]on|practical|solid|progressive)\s*)*experience/i;

/** The phrase describing required experience (e.g. "3-5 years"), or "". */
export function extractExperienceHint(text = "") {
  const match = String(text || "").replace(/\s+/g, " ").match(EXPERIENCE);
  if (!match) return "";
  const numbers = (match[1].match(/\d{1,2}/g) || []).map(Number);
  return numbers.length && numbers.every((value) => value <= 40) ? match[1] : "";
}

/** Quick-filter tag ids that the posting text supports (see constants/jobTags.js). */
export function extractTags(text = "") {
  const source = String(text || "");
  return JOB_TAGS.filter((tag) => tag.pattern.test(source) && !(tag.exclude && tag.exclude.test(source))).map((tag) => tag.id);
}
