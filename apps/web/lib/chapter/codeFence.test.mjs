import assert from "node:assert/strict";
import test from "node:test";
import { parseCodeFenceMeta } from "./codeFence.mjs";

test("code fences are static by default", () => {
  assert.deepEqual(parseCodeFenceMeta("javascript"), {
    language: "javascript",
    showPlay: false,
  });
  assert.deepEqual(parseCodeFenceMeta(""), {
    language: "javascript",
    showPlay: false,
  });
});

test("only a play token after the language enables running", () => {
  assert.deepEqual(parseCodeFenceMeta("javascript play"), {
    language: "javascript",
    showPlay: true,
  });
  assert.deepEqual(parseCodeFenceMeta("tsx PLAY"), {
    language: "tsx",
    showPlay: true,
  });
  assert.equal(parseCodeFenceMeta("javascript interactive").showPlay, false);
  assert.equal(parseCodeFenceMeta("play javascript").showPlay, false);
  assert.equal(parseCodeFenceMeta("javascript playground").showPlay, false);
});
