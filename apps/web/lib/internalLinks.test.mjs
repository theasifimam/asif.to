import test from "node:test";
import assert from "node:assert/strict";
import { processInternalLinks } from "./internalLinks.js";

test("Internal Links Processor", async (t) => {
  await t.test("replaces basic keywords with markdown links", async () => {
    const input = "You should learn React Hooks today.";
    const expected = "You should learn [React Hooks](/courses/reactjs) today.";
    const result = await processInternalLinks(input, "/some-other-path");
    assert.strictEqual(result, expected);
  });

  await t.test("respects aliases", async () => {
    const input = "Using a React hook is easy.";
    const expected = "Using a [React hook](/courses/reactjs) is easy.";
    const result = await processInternalLinks(input, "/some-other-path");
    assert.strictEqual(result, expected);
  });

  await t.test("does not link to current page (self-link)", async () => {
    const input = "Learn about React.js.";
    const currentPath = "/courses/reactjs";
    const result = await processInternalLinks(input, currentPath);
    assert.strictEqual(result, input); // Should be unchanged
  });

  await t.test("respects maxPerPage limits", async () => {
    const input = "JavaScript is great. I love JavaScript. JavaScript forever.";
    const result = await processInternalLinks(input, "/some-path");
    // JavaScript has maxPerPage: 2
    const expected =
      "[JavaScript](/courses/javascript) is great. I love [JavaScript](/courses/javascript). JavaScript forever.";
    assert.strictEqual(result, expected);
  });

  await t.test("does not modify text inside markdown code blocks", async () => {
    const input =
      "Here is code:\n```js\nconst x = 'JavaScript';\n```\nAnd outside: JavaScript.";
    const expected =
      "Here is code:\n```js\nconst x = 'JavaScript';\n```\nAnd outside: [JavaScript](/courses/javascript).";
    const result = await processInternalLinks(input, "/path");
    assert.strictEqual(result, expected);
  });

  await t.test("does not modify text inside inline code", async () => {
    const input = "Use `JavaScript` for this. But also learn JavaScript.";
    const expected =
      "Use `JavaScript` for this. But also learn [JavaScript](/courses/javascript).";
    const result = await processInternalLinks(input, "/path");
    assert.strictEqual(result, expected);
  });

  await t.test("does not modify existing markdown links", async () => {
    const input = "Check out [JavaScript](/external) or learn JavaScript.";
    const expected =
      "Check out [JavaScript](/external) or learn [JavaScript](/courses/javascript).";
    const result = await processInternalLinks(input, "/path");
    assert.strictEqual(result, expected);
  });

  await t.test("does not modify text inside HTML <a> tags", async () => {
    const input = 'Click <a href="/js">JavaScript</a> here. Normal JavaScript.';
    const expected =
      'Click <a href="/js">JavaScript</a> here. Normal [JavaScript](/courses/javascript).';
    const result = await processInternalLinks(input, "/path");
    assert.strictEqual(result, expected);
  });

  await t.test("prefers most specific phrase (longest match)", async () => {
    const input = "React and React Hooks are related.";
    // React Hooks should match entirely, not just React.
    const result = await processInternalLinks(input, "/path");
    const expected =
      "[React](/courses/reactjs) and [React Hooks](/courses/reactjs) are related.";
    assert.strictEqual(result, expected);
  });

  await t.test("does not exceed global max links", async () => {
    // We have React Hooks, React, Next.js App Router, Next.js, Node.js, Express, MongoDB, Tailwind, JavaScript
    const input = [
      "React",
      "Next.js",
      "Node",
      "Express",
      "Mongo",
      "Tailwind",
      "JS",
      "App Router",
      "React hook",
      "React",
      "Next.js",
      "Node",
      "Express",
      "Mongo",
      "Tailwind",
      "JS",
      "App Router",
    ].join(" ");

    const result = await processInternalLinks(input, "/path");
    // Max links is 15. The input has 17 valid keywords.
    const linkCount = (result.match(/\[/g) || []).length;
    assert.strictEqual(linkCount, 15);
  });
});
