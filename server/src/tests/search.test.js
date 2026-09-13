import assert from "node:assert/strict";
import test from "node:test";
import { getSearchIndex, getAdminSearchIndex } from "../controllers/search.controller.js";
import routes from "../routes/search.routes.js";
import Article from "../models/Article.js";
import Chapter from "../models/Chapter.js";
import Course from "../models/Course.js";
import CourseTopic from "../models/CourseTopic.js";
import TopicCategory from "../models/TopicCategory.js";
import Question from "../models/Question.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Company from "../models/Company.js";

function fixtures(t, values = {}) {
  const calls = {};
  for (const Model of [Article, Chapter, Course, CourseTopic, TopicCategory, Question, User, Job, Company]) {
    t.mock.method(Model, "find", (filter) => {
      calls[Model.modelName] = { filter };
      return {
        select(fields) { calls[Model.modelName].fields = fields; return this; },
        populate() { return this; },
        async lean() { return values[Model.modelName] || []; },
      };
    });
  }
  return calls;
}
const response = () => ({
  headers: {}, set(key, value) { this.headers[key] = value; return this; },
  json(body) { this.body = body; return this; },
  status(code) { this.statusCode = code; return this; },
});

test("public search uses visible profiles and active content without private user fields", async (t) => {
  const calls = fixtures(t, {
    User: [{ _id: "u", fullName: "Ada Lovelace", username: "ada", email: "private@example.com", bio: "Developer", expertise: ["JavaScript"] }],
    Job: [{ _id: "j", title: "Developer", slug: "developer", companyName: "Acme" }],
    Company: [{ _id: "co", name: "Acme", slug: "acme" }],
    Chapter: [{ _id: "hidden", course: { status: "draft" } }],
  });
  const res = response();
  await getSearchIndex({}, res);
  assert.equal(res.body.success, true);
  assert.deepEqual(calls.User.filter, { deletedAt: null, status: "active", "settings.profileVisibility": { $ne: "private" } });
  assert.ok(!calls.User.fields.includes("email"));
  assert.equal(calls.Job.filter.status, "published");
  assert.ok(calls.Job.filter.postedAt.$lte instanceof Date);
  assert.equal(calls.Job.filter.$or.length, 3);
  assert.deepEqual(calls.Company.filter, { active: true });
  assert.deepEqual(calls.Article.filter.visibility, { $nin: ["private", "unlisted"] });
  assert.deepEqual(calls.Article.filter.isUserGenerated, { $ne: true });
  const items = res.body.data.items;
  assert.equal(items.find(item => item.type === "user").url, "/ada");
  assert.equal(items.find(item => item.type === "company").url, "/jobs/company/acme");
  assert.ok(!items.some(item => item.id === "chapter:hidden"));
  assert.ok(items.every(item => !item.adminUrl));
  assert.ok(!JSON.stringify(items).includes("private@example.com"));
});

test("admin search includes drafts and user management details without sharing its cache", async (t) => {
  const calls = fixtures(t, {
    User: [{ _id: "u", fullName: "Ada", username: "ada", email: "admin-only@example.com", status: "suspended", role: "reader" }],
    Course: [{ _id: "draft", title: "Draft course", slug: "draft" }],
  });
  const res = response();
  await getAdminSearchIndex({ user: { _id: "admin", role: "super_admin" } }, res);
  assert.equal(res.body.success, true);
  assert.deepEqual(calls.Course.filter, {});
  assert.deepEqual(calls.User.filter, { deletedAt: null });
  assert.equal(res.headers["Cache-Control"], "private, no-store");
  assert.equal(res.body.data.items.find(item => item.type === "user").adminUrl, "/users/u");
  assert.ok(JSON.stringify(res.body).includes("admin-only@example.com"));
  const publicRes = response();
  await getSearchIndex({}, publicRes);
  assert.ok(!JSON.stringify(publicRes.body).includes("admin-only@example.com"));
});

test("admin search queries only permitted modules and scopes authors to their articles", async (t) => {
  const calls = fixtures(t);
  await getAdminSearchIndex({ user: { _id: "author", role: "author", effectivePermissions: ["articles.edit_own"] } }, response());
  for (const model of ["User", "Job", "Company", "Course", "Chapter", "CourseTopic", "TopicCategory", "Question"]) {
    assert.equal(calls[model], undefined, `${model} should not be queried`);
  }
  assert.equal(calls.Article.filter.$or[0].author, "author");
  assert.equal(calls.Article.filter.$or.length, 2);
});

test("admin search requires authentication and rejects ordinary readers", async () => {
  const route = routes.stack.find(layer => layer.route?.path === "/admin/index").route;
  assert.equal(route.stack[0].handle.name, "protect");
  const res = response();
  route.stack[1].handle({ user: { role: "reader" } }, res, () => assert.fail("reader entered admin search"));
  assert.equal(res.statusCode, 403);
});
