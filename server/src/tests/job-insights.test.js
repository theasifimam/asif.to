import assert from "node:assert/strict";
import test from "node:test";
import { diversifyByCompany } from "../utils/jobFeedOrder.js";
import { buildJobLearning, skillsForJob, _resetJobLearningCache } from "../services/jobs/jobLearning.service.js";
import { buildImportedUpdate, normalizeImportedJob } from "../services/jobs/jobImport.service.js";
import { GreenhouseJobProvider } from "../services/jobs/providers/greenhouse.provider.js";

// ── Feed order ───────────────────────────────────────────────────────────────
const row = (id, company, iso) => ({ _id: id, company, postedAt: new Date(iso) });

test("diversifyByCompany interleaves companies within a day and keeps days in order", () => {
  const rows = [
    row("k1", "kempinski", "2026-10-09T10:00Z"), row("k2", "kempinski", "2026-10-09T09:59Z"), row("k3", "kempinski", "2026-10-09T09:58Z"),
    row("t1", "tabby", "2026-10-09T09:57Z"), row("t2", "tabby", "2026-10-09T09:56Z"), row("c1", "careem", "2026-10-09T09:55Z"),
    row("old1", "kempinski", "2026-10-08T10:00Z"), row("old2", "tabby", "2026-10-08T09:00Z"),
  ];
  assert.deepEqual(diversifyByCompany(rows).map((item) => item._id), ["k1", "t1", "c1", "k2", "t2", "k3", "old1", "old2"]);
});

test("diversifyByCompany keeps every row exactly once and handles empty input", () => {
  assert.deepEqual(diversifyByCompany([]), []);
  const rows = Array.from({ length: 50 }, (_, i) => row(`j${i}`, `c${i % 4}`, "2026-10-09T10:00Z"));
  const ordered = diversifyByCompany(rows);
  assert.equal(new Set(ordered.map((item) => item._id)).size, 50);
  const firstFour = ordered.slice(0, 4).map((item) => item.company);
  assert.equal(new Set(firstFour).size, 4, "first page slots go to different companies");
});

// ── Posted date stays honest ─────────────────────────────────────────────────
const source = { _id: "source-id", name: "Example Co", type: "greenhouse", providerOrganizationId: "example", autoPublish: true, trusted: true, qualityThreshold: 70 };
const provider = () => new GreenhouseJobProvider(source, { validateRemoteHost: false });
const body = (extra = "") => `<p>${"Build reliable systems for a growing UAE team. ".repeat(4)}${extra}</p>`;
const raw = (extra = {}, text = "") => ({ id: 1, title: "Frontend Developer", content: body(text), location: { name: "Dubai, UAE" }, absolute_url: "https://example.com/jobs/1", ...extra });

test("a job with no provider date is marked first_seen, a dated one is marked provider", async () => {
  const now = new Date("2026-10-09T12:00:00Z");
  const undated = await normalizeImportedJob(raw(), source, provider(), now);
  assert.equal(undated.data.postedAtSource, "first_seen");
  assert.equal(undated.data.postedAt.toISOString(), now.toISOString());
  const dated = await normalizeImportedJob(raw({ updated_at: "2026-09-01T00:00:00Z", first_published: "2026-09-01T00:00:00Z" }), source, provider(), now);
  assert.equal(dated.data.postedAtSource, "provider");
  assert.equal(dated.data.postedAt.toISOString(), "2026-09-01T00:00:00.000Z");
});

test("later syncs never move a first_seen date, and legacy rows are repaired from createdAt", () => {
  const firstSeen = new Date("2026-09-20T08:00:00Z");
  const later = new Date("2026-10-09T12:00:00Z");
  const settled = buildImportedUpdate({ postedAt: firstSeen, postedAtSource: "first_seen", createdAt: firstSeen }, { postedAt: later, postedAtSource: "first_seen" });
  assert.equal("postedAt" in settled.update, false);

  const legacy = buildImportedUpdate({ postedAt: later, postedAtSource: "provider", createdAt: firstSeen }, { postedAt: later, postedAtSource: "first_seen" });
  assert.equal(legacy.update.postedAt.toISOString(), firstSeen.toISOString());
});

// ── Extraction wired into import ─────────────────────────────────────────────
test("import extracts skills, salary and experience that the provider did not send", async () => {
  const text = "Requirements: 3-5 years of experience with React, TypeScript and Node.js. Salary: AED 18,000 - 22,000 per month.";
  const { data } = await normalizeImportedJob(raw({}, text), source, provider(), new Date("2026-10-09T12:00:00Z"));
  assert.deepEqual(data.skills, ["React", "TypeScript", "Node.js"]);
  assert.equal(data.salaryVisible, true);
  assert.equal(data.minimumSalary, 18000);
  assert.equal(data.maximumSalary, 22000);
  assert.equal(data.salarySource, "description");
  assert.equal(data.minimumExperience, 3);
  assert.equal(data.experienceLevel, "mid");
});

test("a job without any stated salary stays undisclosed instead of being guessed", async () => {
  const { data } = await normalizeImportedJob(raw(), source, provider(), new Date("2026-10-09T12:00:00Z"));
  assert.equal(data.salaryVisible, false);
  assert.equal(data.salarySource, "provider");
});

// ── Skills → learning ────────────────────────────────────────────────────────
const fakeCourses = (published) => ({
  find: (filter) => ({
    select: () => ({ lean: async () => published.filter((course) => filter.slug.$in.includes(course.slug)) }),
  }),
});
const fakeCategories = (categories) => ({
  find: () => ({ sort: () => ({ select: () => ({ lean: async () => categories }) }) }),
});

test("skillsForJob merges stored labels with skills found in the text", () => {
  const skills = skillsForJob({ title: "Full Stack Developer", skills: ["MongoDB"], description: "Daily work in React and TypeScript." });
  assert.deepEqual(skills.map((skill) => skill.id), ["react", "typescript", "mongodb"]);
});

test("buildJobLearning links only published courses and builds quiz and interview links", async () => {
  _resetJobLearningCache();
  const courses = fakeCourses([
    { _id: "c1", slug: "reactjs", title: "The Complete React.js Course", subtitle: "Zero to production" },
    { _id: "c2", slug: "typescript", title: "TypeScript Complete Course" },
  ]);
  const categories = fakeCategories([{ slug: "react-core", name: "React Core", course: "c1" }]);
  const learning = await buildJobLearning(
    { title: "React Developer", description: "React, TypeScript and Node.js", skills: [] },
    { CourseModel: courses, CategoryModel: categories },
  );
  // Node.js has a catalog course but it is not published in this fixture, so it must not be linked.
  assert.deepEqual(learning.items.map((item) => item.course.slug), ["reactjs", "typescript"]);
  assert.equal(learning.items[0].course.href, "/courses/reactjs");
  assert.equal(learning.items[0].quizHref, "/quiz?course=reactjs");
  assert.equal(learning.items[0].interviewHref, "/reactjs/interview-questions/react-core");
  assert.equal(learning.items[1].interviewHref, "/interview-questions", "falls back when a course has no interview category");
  assert.deepEqual(learning.items[0].skills, ["React"]);
});

test("buildJobLearning returns no items for non-technical jobs", async () => {
  _resetJobLearningCache();
  const learning = await buildJobLearning({ title: "Housekeeping Supervisor", description: "Lead the housekeeping team.", skills: [] }, { CourseModel: fakeCourses([]), CategoryModel: fakeCategories([]) });
  assert.deepEqual(learning.items, []);
  assert.deepEqual(learning.skills, []);
});
