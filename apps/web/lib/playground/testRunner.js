// Runs user code for the practice test cases inside a throwaway Web Worker so
// an infinite loop cannot freeze the page and user code never touches the
// page's DOM, cookies or auth state. The worker is terminated on timeout.

const WORKER_SOURCE = `
function isEqual(a, b, seen = new WeakMap()) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;
  if (seen.get(a) === b) return true;
  seen.set(a, b);
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  if (a instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [k, v] of a) if (!b.has(k) || !isEqual(v, b.get(k), seen)) return false;
    return true;
  }
  if (a instanceof Set) {
    if (a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
  }
  const keysA = Reflect.ownKeys(a);
  if (keysA.length !== Reflect.ownKeys(b).length) return false;
  return keysA.every((k) => Object.prototype.hasOwnProperty.call(b, k) && isEqual(a[k], b[k], seen));
}

function show(value) {
  try {
    if (value === undefined) return "undefined";
    if (typeof value === "function") return "[Function]";
    if (typeof value === "bigint") return value + "n";
    if (typeof value === "number" && !Number.isFinite(value)) return String(value);
    if (value instanceof Map) return "Map " + JSON.stringify([...value]);
    if (value instanceof Set) return "Set " + JSON.stringify([...value]);
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

self.onmessage = async ({ data }) => {
  const { source, tests, mode } = data;
  const console_ = { log() {}, info() {}, warn() {}, error() {}, debug() {} };
  const load = (name) =>
    new Function("console", source + "\\n;return typeof " + name + " === 'function' ? " + name + " : null;")(console_);
  try {
    if (mode === "custom") {
      const fn = load(tests[0].functionName);
      if (!fn) throw new Error("Function " + tests[0].functionName + " is not defined.");
      self.postMessage({ type: "custom", output: show(await fn(...tests[0].args)) });
      return;
    }
    for (let index = 0; index < tests.length; index += 1) {
      const test = tests[index];
      let result;
      try {
        const fn = load(test.functionName);
        if (!fn) throw new Error("Function " + test.functionName + " is not defined.");
        // Fresh copies so a solution that mutates its input cannot affect later runs.
        const received = await fn(...structuredClone(test.args));
        result = { index, passed: isEqual(received, test.expected), received: show(received), expected: show(test.expected) };
      } catch (error) {
        result = { index, passed: false, received: String(error && error.message || error), expected: show(test.expected), errored: true };
      }
      self.postMessage({ type: "test", result });
    }
    self.postMessage({ type: "done" });
  } catch (error) {
    self.postMessage({ type: "fatal", error: String(error && error.message || error) });
  }
};
`;

// Solutions copied from modules may carry export keywords, which are a syntax
// error inside new Function.
function stripModuleSyntax(source) {
  return String(source).replace(/^\s*export\s+default\s+(?=function|class|async)/gm, "").replace(/^\s*export\s+(?=function|class|const|let|var|async)/gm, "");
}

function run(payload, { timeoutMs, onMessage }) {
  return new Promise((resolve, reject) => {
    let worker;
    let url;
    try {
      url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" }));
      worker = new Worker(url);
    } catch {
      if (url) URL.revokeObjectURL(url);
      reject(new Error("Tests could not start in this browser."));
      return;
    }
    const finish = (outcome) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(outcome);
    };
    const timer = setTimeout(() => finish({ timedOut: true }), timeoutMs);
    worker.onmessage = ({ data }) => {
      if (data.type === "done" || data.type === "custom" || data.type === "fatal") finish(data);
      else onMessage?.(data);
    };
    worker.onerror = (event) => {
      event.preventDefault?.();
      finish({ type: "fatal", error: event.message || "The test runner crashed." });
    };
    worker.postMessage(payload);
  });
}

export async function runTestCases(source, testCases, { timeoutMs = 10000, onResult } = {}) {
  const tests = testCases.map(({ functionName, args, expected }) => ({ functionName, args, expected }));
  const results = new Array(testCases.length).fill(null);
  const outcome = await run(
    { mode: "tests", source: stripModuleSyntax(source), tests },
    {
      timeoutMs,
      onMessage: (message) => {
        if (message.type !== "test") return;
        results[message.result.index] = message.result;
        onResult?.(results.map((item, i) => (item ? { ...testCases[i], ...item } : null)).filter(Boolean));
      },
    },
  );
  const seconds = Math.round(timeoutMs / 100) / 10;
  return testCases.map((test, index) => {
    const item = results[index];
    if (item) return { ...test, ...item };
    const reason = outcome.timedOut
      ? `Timed out after ${seconds}s (possible infinite loop).`
      : outcome.error || "Not run.";
    return { ...test, passed: false, received: reason, expected: JSON.stringify(test.expected), errored: true };
  });
}

export async function runCustomCase(source, testCase, args, { timeoutMs = 10000 } = {}) {
  const outcome = await run(
    { mode: "custom", source: stripModuleSyntax(source), tests: [{ functionName: testCase.functionName, args }] },
    { timeoutMs },
  );
  if (outcome.timedOut) return `Timed out after ${Math.round(timeoutMs / 100) / 10}s (possible infinite loop).`;
  if (outcome.type === "fatal") return outcome.error;
  return outcome.output;
}
