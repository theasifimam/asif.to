import assert from "node:assert/strict";
import test from "node:test";
import { computeJobMatch, declaredSkillIds, mergeDeclaredSkills, skillPickerOptions } from "../services/jobs/jobMatch.service.js";
import { MIN_SAMPLE, monthlyMidpoint, summarizeBy, summarizeSalaries } from "../services/jobs/salaryInsights.service.js";

const job = { title: "Full Stack Developer", description: "You will work with React, TypeScript and Node.js.", skills: [] };

test("match counts declared skills, course progress and gaps", () => {
  const match = computeJobMatch(job, { declared: ["react"], courseProgress: { typescript: 20, nodejs: 0 } });
  assert.equal(match.applicable, true);
  assert.deepEqual(match.skills.map((s) => [s.id, s.status]), [["react", "have"], ["typescript", "learning"], ["nodejs", "gap"]]);
  assert.equal(match.percent, Math.round(((1 + 0.5) / 3) * 100));
  assert.equal(match.band, "good", "exactly 50% is the lower edge of good");
  assert.equal(match.haveCount, 1);
});

test("finishing most of a course counts as having the skill", () => {
  const match = computeJobMatch(job, { courseProgress: { reactjs: 0, typescript: 85 } });
  assert.equal(match.skills.find((s) => s.id === "typescript").status, "have");
  assert.match(match.skills.find((s) => s.id === "typescript").source, /85%/);
});

test("a person with every skill is a strong match; with none is low", () => {
  assert.equal(computeJobMatch(job, { declared: ["react", "typescript", "nodejs"] }).band, "strong");
  const none = computeJobMatch(job, {});
  assert.equal(none.percent, 0);
  assert.equal(none.band, "low");
});

test("non-technical jobs have no match score", () => {
  assert.deepEqual(computeJobMatch({ title: "Housekeeper", description: "Clean rooms.", skills: [] }, { declared: ["react"] }), { applicable: false });
});

test("declared skills round-trip through expertise labels without losing other entries", () => {
  assert.deepEqual(declaredSkillIds(["react", "Node.js", "Public speaking"]), ["react", "nodejs"]);
  const merged = mergeDeclaredSkills(["Public speaking", "React"], ["typescript", "nodejs", "not-a-skill"]);
  assert.deepEqual(merged, ["Public speaking", "TypeScript", "Node.js"]);
  const options = skillPickerOptions(["react"]);
  assert.equal(options.find((o) => o.id === "react").selected, true);
  assert.equal(options.find((o) => o.id === "python").selected, false);
});

// ── Salary insights ──────────────────────────────────────────────────────────
const posting = (min, max, period = "month", extra = {}) => ({ salaryVisible: true, minimumSalary: min, maximumSalary: max, salaryPeriod: period, ...extra });

test("monthlyMidpoint normalises yearly pay and ignores hourly, daily and hidden salaries", () => {
  assert.equal(monthlyMidpoint(posting(10000, 14000)), 12000);
  assert.equal(monthlyMidpoint(posting(120000, 120000, "year")), 10000);
  assert.equal(monthlyMidpoint(posting(50, 60, "hour")), null);
  assert.equal(monthlyMidpoint(posting(300, 400, "day")), null);
  assert.equal(monthlyMidpoint({ salaryVisible: false, minimumSalary: 1, maximumSalary: 2 }), null);
});

test("summarizeSalaries reports median and quartiles only with enough postings", () => {
  const jobs = [8000, 9000, 10000, 12000, 20000].map((v) => posting(v, v));
  assert.deepEqual(summarizeSalaries(jobs), { n: 5, median: 10000, low: 9000, high: 12000 });
  assert.equal(summarizeSalaries(jobs.slice(0, MIN_SAMPLE - 1)), null);
});

test("summarizeBy keeps only groups with enough postings, largest first", () => {
  const rows = [
    ...[5000, 6000, 7000, 8000, 9000, 10000].map((v) => posting(v, v, "month", { cat: "a" })),
    ...[1000, 2000].map((v) => posting(v, v, "month", { cat: "b" })),
    ...[3000, 3100, 3200, 3300, 3400].map((v) => posting(v, v, "month", { cat: "c" })),
  ];
  const groups = summarizeBy(rows, (row) => ({ id: row.cat, name: row.cat.toUpperCase() }));
  assert.deepEqual(groups.map((g) => [g.id, g.n]), [["a", 6], ["c", 5]]);
});

// ── Company hiring trend ─────────────────────────────────────────────────────
import { weeklyCounts } from "../controllers/jobInsights.controller.js";

test("weeklyCounts buckets dates into the last N weeks, oldest first, ignoring older or future dates", () => {
  const now = new Date("2026-10-09T12:00:00Z").getTime();
  const day = 86_400_000;
  const counts = weeklyCounts([now - 1 * day, now - 2 * day, now - 8 * day, now - 15 * day, now - 15.5 * day, now - 100 * day, now + 2 * day], 4, now);
  assert.deepEqual(counts, [0, 2, 1, 2]);
});

// ── Following a company ──────────────────────────────────────────────────────
import { matchesAlert } from "../services/jobs/jobAlert.service.js";

test("a followed company only matches that company's jobs; legacy alerts without a company are unaffected", () => {
  const job = { title: "Accountant", companyName: "Aldar", category: "Accounting", description: "", categorySlug: "accounting", locationSlug: "dubai", employmentType: "full-time", workMode: "on-site", experienceLevel: "mid", company: "64b000000000000000000001" };
  assert.equal(matchesAlert({ keyword: "", company: "64b000000000000000000001" }, job), true);
  assert.equal(matchesAlert({ keyword: "", company: "64b0000000000000000000ff" }, job), false);
  assert.equal(matchesAlert({ keyword: "accountant" }, job), true, "alert saved before company-following existed");
  assert.equal(matchesAlert({ company: "64b000000000000000000001", category: "sales" }, job), false, "company combines with other filters");
});
