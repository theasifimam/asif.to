import test from "node:test";
import assert from "node:assert/strict";
import {
  MIN_CAREER_CATEGORY_QUESTIONS,
  countQuestionsByCategory,
  isThinInterviewCategory,
  pickSiblingCareerCategories,
  withIndexability,
} from "../utils/interviewCategoryQuality.js";
import { buildJobLearning, careerGuidesForJobCategory, _resetJobLearningCache } from "../services/jobs/jobLearning.service.js";
import TopicCategory from "../models/TopicCategory.js";

test("quality gate: empty categories are never indexable, career guides need the minimum", () => {
  assert.equal(isThinInterviewCategory({ track: "technology" }, 0), true);
  assert.equal(isThinInterviewCategory({ track: "technology" }, 1), false, "tech categories keep their old behaviour");
  assert.equal(isThinInterviewCategory({}, 3), false, "missing track is treated as technology");
  assert.equal(isThinInterviewCategory({ track: "career" }, MIN_CAREER_CATEGORY_QUESTIONS - 1), true);
  assert.equal(isThinInterviewCategory({ track: "career" }, MIN_CAREER_CATEGORY_QUESTIONS), false);
  assert.equal(isThinInterviewCategory({ track: "career" }, undefined), true);
});

test("withIndexability forces noindex on thin categories and never lifts an existing noindex", () => {
  assert.equal(withIndexability({ track: "career", noindex: false }, 5).noindex, true);
  assert.equal(withIndexability({ track: "career", noindex: false }, 20).noindex, false);
  assert.equal(withIndexability({ track: "career", noindex: true }, 20).noindex, true);
  const original = { track: "career", slug: "x" };
  withIndexability(original, 1);
  assert.equal(original.noindex, undefined, "does not mutate its input");
});

test("countQuestionsByCategory handles populated and raw category references", () => {
  const counts = countQuestionsByCategory([
    { category: { _id: "a", slug: "a" } }, { category: "a" }, { category: { _id: "b" } }, { category: null }, {},
  ]);
  assert.equal(counts.get("a"), 2);
  assert.equal(counts.get("b"), 1);
  assert.equal(counts.size, 2);
});

test("pickSiblingCareerCategories returns other qualifying career guides only", () => {
  const categories = [
    { _id: "1", slug: "hospitality", track: "career" },
    { _id: "2", slug: "sales", track: "career" },
    { _id: "3", slug: "thin", track: "career" },
    { _id: "4", slug: "react", track: "technology" },
  ];
  const counts = new Map([["1", 20], ["2", 15], ["3", 4], ["4", 50]]);
  const siblings = pickSiblingCareerCategories(categories, counts, "1");
  assert.deepEqual(siblings.map((c) => c.slug), ["sales"]);
  assert.equal(siblings[0].questionCount, 15);
  assert.equal(pickSiblingCareerCategories(categories, counts, "1", 0).length, 0);
});

test("TopicCategory.jobCategorySlugs normalises and de-duplicates slugs", () => {
  const doc = new TopicCategory({ name: "Hospitality", slug: "hospitality", track: "career", jobCategorySlugs: ["Hospitality", " hospitality ", "Customer Service", "", null] });
  assert.deepEqual([...doc.jobCategorySlugs], ["hospitality", "customer-service"]);
  assert.deepEqual([...new TopicCategory({ name: "x", slug: "x" }).jobCategorySlugs], []);
});

const fakeCategories = (rows) => {
  const calls = [];
  return {
    calls,
    find: (filter) => { calls.push(filter); return { sort: () => ({ select: () => ({ lean: async () => rows }) }) }; },
  };
};
const fakeQuestions = (counts) => ({ aggregate: async () => Object.entries(counts).map(([id, count]) => ({ _id: id, count })) });
const noCourses = { find: () => ({ select: () => ({ lean: async () => [] }) }) };

test("career guides for a job category skip thin and empty guides", async () => {
  _resetJobLearningCache();
  const categories = fakeCategories([
    { _id: "1", slug: "hospitality", name: "Hospitality", description: "Hotels" },
    { _id: "2", slug: "draft-ish", name: "Thin" },
    { _id: "3", slug: "empty", name: "Empty" },
  ]);
  const guides = await careerGuidesForJobCategory("Hospitality", { CategoryModel: categories, QuestionModel: fakeQuestions({ 1: 18, 2: 3 }) });
  assert.deepEqual(guides.map((g) => g.slug), ["hospitality"]);
  assert.equal(guides[0].href, "/interview-questions/hospitality");
  assert.equal(guides[0].questionCount, 18);
  assert.equal(categories.calls[0].jobCategorySlugs, "hospitality");
  assert.equal(categories.calls[0].track, "career");
  assert.deepEqual(await careerGuidesForJobCategory("", { CategoryModel: categories }), []);
});

test("buildJobLearning returns career guides for a job with no taught skills", async () => {
  _resetJobLearningCache();
  const learning = await buildJobLearning(
    { title: "Housekeeping Supervisor", description: "Lead the housekeeping team.", skills: [], categorySlug: "hospitality" },
    { CourseModel: noCourses, CategoryModel: fakeCategories([{ _id: "1", slug: "hospitality", name: "Hospitality" }]), QuestionModel: fakeQuestions({ 1: 12 }) },
  );
  assert.deepEqual(learning.items, []);
  assert.deepEqual(learning.careerGuides.map((g) => g.slug), ["hospitality"]);
});

test("buildJobLearning gives no career guides when course items exist", async () => {
  _resetJobLearningCache();
  const courses = { find: () => ({ select: () => ({ lean: async () => [{ _id: "c1", slug: "reactjs", title: "React" }] }) }) };
  const learning = await buildJobLearning(
    { title: "React Developer", description: "React", skills: [], categorySlug: "software-development" },
    { CourseModel: courses, CategoryModel: { find: () => ({ sort: () => ({ select: () => ({ lean: async () => [] }) }) }) }, QuestionModel: fakeQuestions({}) },
  );
  assert.equal(learning.items.length, 1);
  assert.deepEqual(learning.careerGuides, []);
});
