"use client";

import React from "react";

export default function WorkspaceTestsPanel({
  panel,
  tests = [],
  testCases = [],
  executionEnabled,
  handleRunTests,
  customInput,
  setCustomInput,
  handleRunCustom,
  customOutput,
}) {
  return (
    <div
      className={`${panel === "tests" ? "block" : "hidden"} absolute inset-0 z-40 overflow-auto bg-inherit p-4`}
      aria-live="polite"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-black">Tests</h3>
        <button
          type="button"
          onClick={handleRunTests}
          disabled={executionEnabled === false}
          title={executionEnabled === false ? "Test execution is temporarily disabled" : "Run tests"}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Run tests
        </button>
      </div>
      {!tests.length ? (
        <p className="mt-6 text-sm text-zinc-500">
          Run your solution to check the test cases.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {tests.map((test, index) => (
            <div
              key={index}
              className={`rounded-xl border p-3 text-xs ${test.passed ? "border-emerald-500/40" : "border-red-500/40"}`}
            >
              <p className="font-black">
                {test.passed ? "✓" : "✕"} Test {index + 1}{" "}
                {test.passed ? "passed" : "failed"}
              </p>
              {!test.passed && (
                <dl className="mt-2 grid gap-1 font-mono">
                  <dt>Input:</dt>
                  <dd>{JSON.stringify(test.args)}</dd>
                  <dt>Expected:</dt>
                  <dd>{JSON.stringify(test.expected)}</dd>
                  <dt>Received:</dt>
                  <dd>{JSON.stringify(test.received)}</dd>
                </dl>
              )}
            </div>
          ))}
          <p className="font-black">
            {tests.filter((test) => test.passed).length} / {tests.length} passed
          </p>
        </div>
      )}
      {testCases.length > 0 && (
        <div className="mt-6 border-t border-zinc-700 pt-4">
          <h3 className="font-black">Custom Test</h3>
          <label className="mt-2 block text-xs">
            Input
            <textarea
              value={customInput}
              onChange={(event) => setCustomInput(event.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-transparent p-2 font-mono"
              placeholder='"hello"'
            />
          </label>
          <button
            type="button"
            onClick={handleRunCustom}
            disabled={executionEnabled === false}
            title={executionEnabled === false ? "Test execution is temporarily disabled" : "Run custom test"}
            className="mt-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Run Test
          </button>
          {customOutput && (
            <div className="mt-3">
              <p className="text-xs font-bold">Output</p>
              <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-black/20 p-2">
                {customOutput}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
