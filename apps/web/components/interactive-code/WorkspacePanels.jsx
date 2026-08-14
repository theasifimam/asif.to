import {
  GripVertical,
  Loader2,
  ExternalLink,
  AlertTriangle,
  GripHorizontal,
  Code2,
  Monitor,
  Terminal,
} from "lucide-react";
import {
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import FileExplorer from "./FileExplorer";
import BetterConsole from "./BetterConsole";

export function WorkspacePanels({ workspace }) {
  const {
    state: {
      panel,
      split,
      outputSplit,
      fontSize,
      explorerOpen,
      runtimeIssue,
      device,
      tests,
      customInput,
      customOutput,
      previewBusy,
    },
    setters: { setPanel, setDevice, setCustomInput },
    refs: { splitRef, outputRef },
    computed: { isDark, consoleFirst },
    handlers: { runTests, runCustom, startResize, moveResize, stopResize },
    sandpack,
    language,
    testCases,
    runtimeAdapter,
  } = workspace;

  return (
    <div
      ref={splitRef}
      className={`relative flex min-h-0 flex-1 flex-col transition-colors lg:grid ${
        isDark ? "bg-zinc-950" : "bg-zinc-100"
      }`}
      style={{ gridTemplateColumns: `${split}% 8px minmax(0, 1fr)` }}
    >
      {/* Left Side: File Explorer + Code Editor */}
      <div
        className={`${
          panel === "code" || panel === "files" ? "flex flex-col" : "hidden"
        } min-h-0 min-w-0 flex-1 lg:grid ${
          explorerOpen ? "lg:grid-cols-[190px_minmax(0,1fr)]" : "lg:grid-cols-1"
        }`}
      >
        <div
          className={`${
            panel === "files" ? "block" : "hidden"
          } h-full min-h-0 ${explorerOpen ? "lg:block" : "lg:hidden"}`}
        >
          <FileExplorer isDark={isDark} onFileSelect={() => setPanel("code")} />
        </div>
        <div
          className={`${panel === "code" ? "block" : "hidden"} h-full min-h-0 min-w-0 lg:block`}
        >
          <SandpackCodeEditor
            showTabs
            showLineNumbers
            wrapContent={false}
            closableTabs={false}
            style={{ height: "100%", fontSize }}
          />
        </div>
      </div>

      {/* Desktop Split Resize Bar */}
      <button
        type="button"
        onPointerDown={(event) => startResize("horizontal", event)}
        onPointerMove={moveResize}
        onPointerUp={stopResize}
        onPointerCancel={stopResize}
        onLostPointerCapture={stopResize}
        className={`group hidden touch-none cursor-col-resize items-center justify-center border-x transition hover:bg-blue-600 lg:flex ${
          isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-300 bg-zinc-200"
        }`}
        aria-label="Resize editor and output panels"
        title="Drag to resize panels"
      >
        <GripVertical
          className={`h-5 w-5 group-hover:text-white ${
            isDark ? "text-zinc-500" : "text-zinc-400"
          }`}
        />
      </button>

      {/* Right Side: Output (Preview & Console) */}
      <div
        ref={outputRef}
        className={`playground-output relative min-h-0 min-w-0 flex-1 border-l transition-colors ${
          isDark ? "border-zinc-800" : "border-zinc-200"
        } ${
          panel === "preview" || panel === "console" || panel === "tests"
            ? "flex flex-col"
            : "hidden"
        } lg:flex lg:flex-col ${consoleFirst ? "" : "playground-output-split"}`}
        style={{ "--preview-size": `${outputSplit}%` }}
      >
        {consoleFirst && !runtimeAdapter && (
          <div
            className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
            aria-hidden="true"
          >
            <SandpackPreview
              showNavigator={false}
              showOpenInCodeSandbox={false}
              showRefreshButton={false}
              style={{ height: 1, width: 1 }}
            />
          </div>
        )}
        {!consoleFirst && (
          <div
            className={`${
              panel === "preview" ? "flex flex-1" : "hidden"
            } relative min-h-0 overflow-hidden lg:block`}
          >
            {previewBusy && (
              <div
                className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-white/65 backdrop-blur-[1px] dark:bg-zinc-950/65"
                role="status"
                aria-live="polite"
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-2 text-xs font-bold text-white shadow-lg">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating preview...
                </span>
              </div>
            )}
            <div
              className="absolute right-2 top-2 z-30 flex gap-1 rounded-lg bg-zinc-950/80 p-1 text-white backdrop-blur"
              aria-label="Preview size"
            >
              {[
                ["desktop", "Desktop"],
                ["tablet", "Tablet"],
                ["mobile", "Mobile"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDevice(value)}
                  className={`rounded px-2 py-1 text-[10px] font-bold ${device === value ? "bg-blue-600" : "hover:bg-zinc-700"}`}
                  aria-pressed={device === value}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  const client = Object.values(sandpack.clients || {})[0];
                  const url = client?.iframe?.src;
                  if (url) window.open(url, "_blank", "noopener,noreferrer");
                }}
                className="rounded px-2 py-1 hover:bg-zinc-700"
                aria-label="Open preview separately"
                title="Open Preview"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
            {language === "nextjs" && !runtimeIssue && (
              <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex justify-center">
                <p className="max-w-2xl rounded-xl border border-amber-400/30 bg-zinc-950/90 px-3 py-2 text-[11px] font-semibold leading-4 text-zinc-200 shadow-lg backdrop-blur">
                  Next.js uses a temporary CodeSandbox Nodebox runtime. If the
                  preview URL says it is unavailable, the external runtime
                  failed to start or is blocked by the network; it does not
                  automatically mean this code is incorrect.
                </p>
              </div>
            )}
            {runtimeIssue && language === "nextjs" ? (
              <div
                className={`flex h-full w-full items-center justify-center p-5 ${isDark ? "bg-[#181818]" : "bg-zinc-50"}`}
                role="alert"
              >
                <div
                  className={`max-w-lg rounded-2xl border p-5 shadow-sm ${isDark ? "border-amber-500/30 bg-amber-500/10 text-zinc-200" : "border-amber-300 bg-amber-50 text-zinc-800"}`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-sm font-black">
                        Why the Next.js code did not run
                      </p>
                      <p className="mt-2 text-xs font-medium leading-5 opacity-85">
                        {runtimeIssue}
                      </p>
                      <p className="mt-3 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        Press Run to retry when the preview service is
                        available.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="mx-auto h-full max-w-full transition-[width]"
                style={{
                  width:
                    device === "mobile"
                      ? 375
                      : device === "tablet"
                        ? 768
                        : "100%",
                }}
              >
                <SandpackPreview
                  showNavigator={language === "nextjs"}
                  startRoute="/"
                  showOpenInCodeSandbox={false}
                  showRefreshButton={language !== "nextjs"}
                  style={{ height: "100%", width: "100%" }}
                />
              </div>
            )}
          </div>
        )}
        {!consoleFirst && (
          <button
            type="button"
            onPointerDown={(event) => startResize("vertical", event)}
            onPointerMove={moveResize}
            onPointerUp={stopResize}
            onPointerCancel={stopResize}
            onLostPointerCapture={stopResize}
            className={`group hidden h-2 w-full touch-none cursor-row-resize items-center justify-center border-y transition hover:bg-blue-600 lg:flex ${
              isDark
                ? "border-zinc-800 bg-zinc-900"
                : "border-zinc-300 bg-zinc-200"
            }`}
            aria-label="Resize preview and console panels"
            title="Drag up or down to resize preview and console"
          >
            <GripHorizontal
              className={`h-4 w-4 group-hover:text-white ${
                isDark ? "text-zinc-500" : "text-zinc-400"
              }`}
            />
          </button>
        )}
        <div
          className={`${
            panel === "console" ? "flex flex-1" : "hidden"
          } min-h-0 overflow-hidden lg:block`}
        >
          {runtimeAdapter ? (
            runtimeAdapter.output
          ) : (
            <BetterConsole standalone={consoleFirst} />
          )}
        </div>
        <div
          className={`${panel === "tests" ? "block" : "hidden"} absolute inset-0 z-40 overflow-auto bg-inherit p-4`}
          aria-live="polite"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-black">Tests</h3>
            <button
              type="button"
              onClick={runTests}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
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
                {tests.filter((test) => test.passed).length} / {tests.length}{" "}
                passed
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
                onClick={runCustom}
                className="mt-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white"
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
      </div>

      {/* Mobile Quick-Switch Floating Pill */}
      <div className="pointer-events-none absolute bottom-3 right-3 z-30 lg:hidden">
        {panel === "code" ? (
          <button
            type="button"
            onClick={() => setPanel(consoleFirst ? "console" : "preview")}
            className={`pointer-events-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-xl backdrop-blur transition active:scale-95 ${
              isDark
                ? "border-zinc-700 bg-zinc-900/95 text-zinc-200 hover:bg-zinc-800 hover:text-white"
                : "border-zinc-300 bg-white/95 text-zinc-800 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            {consoleFirst ? (
              <Terminal className="h-3.5 w-3.5 text-amber-500" />
            ) : (
              <Monitor className="h-3.5 w-3.5 text-blue-500" />
            )}
            <span>View Output →</span>
          </button>
        ) : panel === "preview" || panel === "console" ? (
          <button
            type="button"
            onClick={() => setPanel("code")}
            className={`pointer-events-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-xl backdrop-blur transition active:scale-95 ${
              isDark
                ? "border-zinc-700 bg-zinc-900/95 text-zinc-200 hover:bg-zinc-800 hover:text-white"
                : "border-zinc-300 bg-white/95 text-zinc-800 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <Code2 className="h-3.5 w-3.5 text-blue-500" />
            <span>← Back to Code</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
