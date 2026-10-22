import test from "node:test";
import assert from "node:assert/strict";
import {
  classifySection,
  computeChanges,
  summarizeSections,
} from "../services/searchChanges.service.js";

test("classifySection maps URLs to site sections", () => {
  assert.equal(classifySection("https://asif.to/jobs/waiter-dubai"), "jobs");
  assert.equal(classifySection("/jobs"), "jobs");
  assert.equal(classifySection("https://asif.to/articles/foo"), "articles");
  assert.equal(classifySection("/interview-questions/hospitality"), "interview-questions");
  assert.equal(classifySection("/react/interview-questions/hooks"), "interview-questions");
  assert.equal(classifySection("/courses/react"), "courses");
  assert.equal(classifySection("/tutorials/x"), "courses");
  assert.equal(classifySection("/jobsearch-tips"), "other");
  assert.equal(classifySection("/"), "other");
});

test("computeChanges keeps rows that only exist in the previous period", () => {
  const current = [{ _id: "/a", clicks: 5, impressions: 100, ctr: 5, position: 8 }];
  const previous = [
    { _id: "/a", clicks: 10, impressions: 200, ctr: 5, position: 6 },
    { _id: "/lost", clicks: 3, impressions: 50, ctr: 6, position: 12 },
  ];
  const rows = computeChanges(current, previous);
  assert.equal(rows.length, 2);
  const a = rows.find((row) => row.key === "/a");
  assert.equal(a.impressionsChange, -100);
  assert.equal(a.impressionsChangePct, -50);
  assert.equal(a.positionChange, 2);
  assert.equal(a.lost, false);
  const lost = rows.find((row) => row.key === "/lost");
  assert.equal(lost.lost, true);
  assert.equal(lost.impressions, 0);
  assert.equal(lost.impressionsChange, -50);
  assert.equal(lost.positionChange, 0);
});

test("computeChanges flags new rows and supports key-based rows", () => {
  const rows = computeChanges(
    [{ key: "q", clicks: 1, impressions: 10, ctr: 10, position: 4 }],
    [],
  );
  assert.equal(rows[0].isNew, true);
  assert.equal(rows[0].impressionsChangePct, 100);
});

test("summarizeSections weights position by impressions per period", () => {
  const rows = computeChanges(
    [
      { _id: "/jobs/a", clicks: 2, impressions: 100, ctr: 2, position: 10 },
      { _id: "/jobs/b", clicks: 1, impressions: 300, ctr: 0.3, position: 20 },
    ],
    [
      { _id: "/jobs/a", clicks: 8, impressions: 400, ctr: 2, position: 5 },
      { _id: "/articles/x", clicks: 4, impressions: 40, ctr: 10, position: 3 },
    ],
  );
  const summary = summarizeSections(rows);
  const jobs = summary.find((s) => s.section === "jobs");
  assert.equal(jobs.pages, 2);
  assert.equal(jobs.impressions, 400);
  assert.equal(jobs.position, (10 * 100 + 20 * 300) / 400);
  assert.equal(jobs.previous.impressions, 400);
  assert.equal(jobs.clicksChangePct, ((3 - 8) / 8) * 100);
  const articles = summary.find((s) => s.section === "articles");
  assert.equal(articles.impressions, 0);
  assert.equal(articles.impressionsChangePct, -100);
});
