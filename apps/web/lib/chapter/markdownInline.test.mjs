import assert from "node:assert/strict";
import test from "node:test";
import { formatInlineMarkdown } from "./markdownInline.mjs";

test("parses markdown links and opens in a new tab", () => {
  const input = "You already know [how JSX works](https://asif.to/reactjs/chapter-2-jsx-javascript-xml).";
  const result = formatInlineMarkdown(input);

  assert.equal(
    result,
    'You already know <a href="https://asif.to/reactjs/chapter-2-jsx-javascript-xml" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline font-bold hover:text-blue-700">how JSX works</a>.'
  );
});

test("marks external links with target _blank and rel noopener noreferrer", () => {
  const input = "Check out [React Documentation](https://react.dev).";
  const result = formatInlineMarkdown(input);

  assert.equal(
    result,
    'Check out <a href="https://react.dev" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline font-bold hover:text-blue-700">React Documentation</a>.'
  );
});

test("preserves underscores in URLs without creating spurious italics", () => {
  const input = "See [API Guide](https://example.com/api_v1/endpoint_info) for details.";
  const result = formatInlineMarkdown(input);

  assert.equal(
    result,
    'See <a href="https://example.com/api_v1/endpoint_info" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline font-bold hover:text-blue-700">API Guide</a> for details.'
  );
});

test("supports formatting inside link text", () => {
  const input = "Read [the **official** guide](https://asif.to/reactjs).";
  const result = formatInlineMarkdown(input);

  assert.equal(
    result,
    'Read <a href="https://asif.to/reactjs" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline font-bold hover:text-blue-700">the <strong>official</strong> guide</a>.'
  );
});

test("supports code inside link text", () => {
  const input = "Learn about [`useState` hook](https://asif.to/reactjs/chapter-4-state-usestate).";
  const result = formatInlineMarkdown(input);

  assert.equal(
    result,
    'Learn about <a href="https://asif.to/reactjs/chapter-4-state-usestate" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline font-bold hover:text-blue-700"><code class="bg-zinc-200/80 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-mono text-xs px-1.5 py-0.5 rounded-md wrap-break-word max-w-full">useState</code> hook</a>.'
  );
});

test("distinguishes inline images from links", () => {
  const input = "Here is an image ![My Image](https://example.com/pic.png) and a [link](https://asif.to).";
  const result = formatInlineMarkdown(input);

  assert.ok(result.includes('<img src="https://example.com/pic.png" alt="My Image"'));
  assert.ok(result.includes('<a href="https://asif.to" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline font-bold hover:text-blue-700">link</a>'));
});

test("supports URLs with balanced parentheses", () => {
  const input = "Read about [Closures](https://en.wikipedia.org/wiki/Closure_(computer_programming)).";
  const result = formatInlineMarkdown(input);

  assert.equal(
    result,
    'Read about <a href="https://en.wikipedia.org/wiki/Closure_(computer_programming)" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline font-bold hover:text-blue-700">Closures</a>.'
  );
});

test("neutralizes javascript: URLs", () => {
  const input = "[Dangerous link](javascript:alert(1))";
  const result = formatInlineMarkdown(input);

  assert.equal(result, "Dangerous link");
});

test("keeps anchor hash links in same tab", () => {
  const input = "Jump to [Overview](#overview).";
  const result = formatInlineMarkdown(input);

  assert.equal(
    result,
    'Jump to <a href="#overview" class="text-blue-600 dark:text-blue-400 underline font-bold hover:text-blue-700">Overview</a>.'
  );
});
