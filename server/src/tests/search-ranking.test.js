import assert from "node:assert/strict";
import test from "node:test";
import { FILTERS, rankResults } from "../../../apps/web/lib/search/rankResults.js";
import { SEARCH_TYPES, rankAdminResults } from "../../../apps/admin/src/lib/admin-search.js";

const items = [
  { id: "user:1", type: "user", title: "Ada Lovelace", keywords: ["ada_dev"], url: "/ada_dev", adminUrl: "/users/1" },
  { id: "job:1", type: "job", title: "Frontend Developer", keywords: ["Acme", "Dubai"], url: "/jobs/frontend", adminUrl: "/jobs/1/edit" },
  { id: "company:1", type: "company", title: "Acme", url: "/jobs/company/acme", adminUrl: "/jobs/companies/1/edit" },
  { id: "category:1", type: "interview-category", title: "JavaScript Interview Questions", url: "/interview-questions/javascript", adminUrl: "/categories" },
];

test("public and admin search find users by name and username prefix", () => {
  for (const rank of [rankResults, rankAdminResults]) {
    assert.equal(rank(items, "Ada Lovelace")[0].id, "user:1");
    assert.equal(rank(items, "@ada_de")[0].id, "user:1");
  }
});

test("all new result types have filters and preserve context-specific destinations", () => {
  for (const item of items) {
    assert.ok(FILTERS.includes(item.type));
    assert.ok(SEARCH_TYPES[item.type]);
    assert.equal(rankResults(items, item.title, { type: item.type })[0].url, item.url);
    assert.equal(rankAdminResults(items, item.title, item.type)[0].adminUrl, item.adminUrl);
  }
  assert.equal(rankResults(items, "Dubai", { type: "job" })[0].id, "job:1");
  assert.equal(rankAdminResults(items, "Acme", "company").length, 1);
});

test("category counts can include users beyond the first page of tutorial matches", () => {
  const many = Array.from({ length: 350 }, (_, id) => ({ id: `course:${id}`, type: "course", title: "Developer", adminUrl: `/courses/${id}` }));
  many.push({ ...items[0], keywords: ["Developer"] });
  assert.ok(rankAdminResults(many, "Developer").some(item => item.type === "user"));
  assert.ok(rankResults(many, "Developer", { limit: many.length }).some(item => item.type === "user"));
});
