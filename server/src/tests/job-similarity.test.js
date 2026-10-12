import assert from "node:assert/strict";
import test from "node:test";
import { rankSimilarJobs, similarityScore } from "../services/jobs/jobSimilarity.service.js";

const job = (id, over = {}) => ({ _id: id, title: "Frontend Developer", skills: ["React", "TypeScript"], categorySlug: "software-development", experienceLevel: "mid", locationSlug: "dubai", company: `c-${id}`, postedAt: "2026-10-01", ...over });

test("shared skills and title words outrank a merely same-category job", () => {
  const base = job("base");
  const strong = job("strong", { title: "React Frontend Engineer" });
  const weak = job("weak", { title: "Accountant", skills: [], categorySlug: "software-development" });
  assert.ok(similarityScore(base, strong) > similarityScore(base, weak));
  assert.equal(similarityScore(base, weak), 0, "category alone is not similarity");
});

test("rankSimilarJobs excludes the job itself and low-signal results", () => {
  const base = job("base");
  const result = rankSimilarJobs(base, [base, job("a"), job("b", { title: "Chef", skills: [] })]);
  assert.deepEqual(result.map((item) => item._id), ["a"]);
});

test("rankSimilarJobs caps jobs per employer for variety", () => {
  const base = job("base");
  const sameCompany = ["x1", "x2", "x3", "x4"].map((id) => job(id, { company: "acme" }));
  const other = job("y1", { company: "other" });
  const ids = rankSimilarJobs(base, [...sameCompany, other], { limit: 6, perCompany: 2 }).map((item) => item._id);
  assert.equal(ids.filter((id) => id.startsWith("x")).length, 2);
  assert.ok(ids.includes("y1"));
});
