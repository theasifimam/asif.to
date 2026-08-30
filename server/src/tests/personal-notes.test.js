import test from "node:test";
import assert from "node:assert/strict";
import PersonalNote from "../models/PersonalNote.js";
import { listNotes } from "../controllers/personalNote.controller.js";

const owner = "507f1f77bcf86cd799439011";

test("personal notes stay intentionally limited to text and checklists", () => {
  const note = new PersonalNote({ owner });
  assert.equal(note.type, "text");
  assert.equal(note.title, "");
  assert.equal(note.content, "");
  assert.deepEqual(note.checklist, []);
  assert.equal(note.color, "neutral");
  assert.equal(note.pinned, false);
  assert.equal(note.archived, false);
  assert.deepEqual(PersonalNote.schema.path("type").enumValues, ["text", "checklist"]);
  assert.deepEqual(PersonalNote.schema.path("color").enumValues, [
    "neutral",
    "amber",
    "blue",
    "emerald",
    "rose",
    "violet",
  ]);
  assert.equal(PersonalNote.schema.path("tags"), undefined);
  assert.equal(PersonalNote.schema.path("dueDate"), undefined);
});

test("checklist items have stable ids and completion state", () => {
  const note = new PersonalNote({
    owner,
    type: "checklist",
    checklist: [{ text: "Check sitemap" }],
  });
  assert.ok(note.checklist[0].id);
  assert.equal(note.checklist[0].text, "Check sitemap");
  assert.equal(note.checklist[0].completed, false);
});

test("personal note ordering index is owner scoped", () => {
  assert.ok(
    PersonalNote.schema.indexes().some(
      ([keys]) =>
        keys.owner === 1 &&
        keys.archived === 1 &&
        keys.pinned === -1 &&
        keys.updatedAt === -1,
    ),
  );
});

test("personal note queries are always scoped to the authenticated owner", async () => {
  const originalFind = PersonalNote.find;
  let receivedFilter;
  PersonalNote.find = (filter) => {
    receivedFilter = filter;
    return {
      sort() { return this; },
      limit() { return this; },
      async lean() { return []; },
    };
  };
  try {
    let response;
    await listNotes(
      { user: { _id: owner }, query: {} },
      { json(payload) { response = payload; } },
    );
    assert.equal(String(receivedFilter.owner), owner);
    assert.equal(receivedFilter.archived, false);
    assert.deepEqual(response.data.notes, []);
  } finally {
    PersonalNote.find = originalFind;
  }
});
