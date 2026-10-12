import assert from "node:assert/strict";
import test from "node:test";
import { buildVocabulary, correctKeywordFromVocabulary, editDistance, suggestFromVocabulary } from "../services/jobs/jobSearch.service.js";

const vocab = buildVocabulary([
  { title: "Senior Software Engineer", companyName: "Tabby", companySlug: "tabby", location: "Dubai", locationSlug: "dubai", category: "Software Development", categorySlug: "software-development", skills: ["React", "TypeScript"] },
  { title: "Software Engineer", companyName: "Careem", companySlug: "careem", location: "Dubai", locationSlug: "dubai", category: "Software Development", categorySlug: "software-development", skills: ["React"] },
  { title: "Accountant", companyName: "Aldar Properties", companySlug: "aldar", location: "Abu Dhabi", locationSlug: "abu-dhabi", category: "Accounting", categorySlug: "accounting", skills: [] },
  { title: "Housekeeping Supervisor", companyName: "Kempinski", companySlug: "kempinski", location: "Dubai", locationSlug: "dubai", category: "Hospitality", categorySlug: "hospitality", skills: [] },
]);

test("editDistance counts insertions, substitutions and transpositions", () => {
  assert.equal(editDistance("developer", "developer"), 0);
  assert.equal(editDistance("develper", "developer"), 1);
  assert.equal(editDistance("acountant", "accountant"), 1);
  assert.equal(editDistance("engineer", "enginere"), 1, "transposition is one edit");
  assert.ok(editDistance("react", "kubernetes") > 3);
});

test("suggestions match prefixes across titles, skills, companies and places", () => {
  const types = (query) => suggestFromVocabulary(query, vocab).map((item) => `${item.type}:${item.label}`);
  assert.ok(types("soft").includes("title:Software Engineer"));
  assert.ok(types("rea").includes("skill:React"));
  assert.ok(types("tab").includes("company:Tabby"));
  assert.ok(types("abu").includes("location:Abu Dhabi"));
  assert.deepEqual(suggestFromVocabulary("s", vocab), [], "needs at least two characters");
});

test("suggestions rank an exact skill above a loose title match and de-duplicate", () => {
  const results = suggestFromVocabulary("react", vocab);
  assert.equal(results[0].type, "skill");
  assert.equal(new Set(results.map((item) => `${item.type}:${item.label}`)).size, results.length);
});

test("suggestions survive typos", () => {
  const labels = suggestFromVocabulary("acountant", vocab).map((item) => item.label);
  assert.ok(labels.includes("Accountant"));
  assert.ok(suggestFromVocabulary("enginere", vocab).some((item) => item.label.includes("Engineer")));
});

test("keyword correction fixes unknown words and leaves valid ones alone", () => {
  assert.equal(correctKeywordFromVocabulary("sofware enginer", vocab), "software engineer");
  assert.equal(correctKeywordFromVocabulary("software engineer", vocab), null);
  assert.equal(correctKeywordFromVocabulary("zzzzzz", vocab), null, "no near word means no guess");
  assert.equal(correctKeywordFromVocabulary("hr", vocab), null, "very short tokens are not corrected");
});

test("correction is cautious: short words and one-off words are never 'fixed'", () => {
  const small = buildVocabulary([
    { title: "Code Reviewer", companyName: "A", location: "Dubai", category: "IT", skills: [] },
    { title: "Code Reviewer", companyName: "B", location: "Dubai", category: "IT", skills: [] },
    { title: "Accountant", companyName: "C", location: "Dubai", category: "Accounting", skills: [] },
  ]);
  assert.equal(correctKeywordFromVocabulary("node", small), null, "node must not become code");
  assert.equal(correctKeywordFromVocabulary("acountant", small), null, "a word seen on one job is too rare to trust");
  assert.equal(correctKeywordFromVocabulary("reveiwer", small), "reviewer", "a common word is corrected");
});

test("dotted names are indexed as separate words so Node.js makes 'node' a known word", () => {
  const dotted = buildVocabulary([{ title: "Node.js Developer", companyName: "A", location: "Dubai", category: "IT", skills: [] }]);
  assert.equal(dotted.wordCounts.has("node"), true);
  assert.equal(dotted.wordCounts.has("js"), true);
});
