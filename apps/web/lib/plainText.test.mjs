import test from "node:test";
import assert from "node:assert/strict";
import { toPlainText } from "./plainText.mjs";

test("toPlainText strips HTML tags and decodes entities", () => {
  assert.equal(
    toPlainText("<p>Tell me about <strong>yourself</strong> &amp; your goals.</p><ul><li>Be brief</li></ul>"),
    "Tell me about yourself & your goals. Be brief",
  );
});

test("toPlainText strips markdown and drops code blocks", () => {
  assert.equal(
    toPlainText("## Answer\n\nUse **STAR** and [this guide](/x).\n\n```js\nconst a = 1;\n```\n- point"),
    "Answer Use STAR and this guide. point",
  );
});

test("toPlainText handles empty values", () => {
  assert.equal(toPlainText(null), "");
  assert.equal(toPlainText(undefined), "");
});
