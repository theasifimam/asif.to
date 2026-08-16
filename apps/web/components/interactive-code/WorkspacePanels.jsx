import { useState } from "react";
import {
  GripVertical,
  Loader2,
  ExternalLink,
  AlertTriangle,
  GripHorizontal,
  Code2,
  Monitor,
  Terminal,
  Play,
  RotateCcw,
  MoreHorizontal,
  Minimize2,
  Expand,
  WandSparkles,
  Share2,
  Copy,
  Download,
  Plus,
  Minus,
} from "lucide-react";
import {
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import FileExplorer from "./FileExplorer";
import BetterConsole from "./BetterConsole";
import { executeCurrentFiles } from "./sandpackConfig";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WorkspacePanels({ workspace }) {
  const {
    state: {
      panel,
      split,
      outputSplit,
      fontSize,
      fullscreen,
      explorerOpen,
      consoleOpen,
      runtimeIssue,
      device,
      tests,
      customInput,
      customOutput,
      previewBusy,
      shareStatus,
      formatting,
    },
    setters: { setPanel, setDevice, setCustomInput, setFontSize, setConsoleOpen },
    refs: { splitRef, outputRef, workspaceRef },
    computed: { isDark, consoleFirst },
    handlers: {
      runTests,
      runCustom,
      startResize,
      moveResize,
      stopResize,
      reset,
      formatActive,
      share,
      toggleFullscreen,
    },
    sandpack,
    language,
    title,
    testCases,
    runtimeAdapter,
    executionEnabled,
  } = workspace;

  const [executing, setExecuting] = useState(false);
  const isRunning = executing || runtimeAdapter?.status === "loading";

  const handleRun = async () => {
    if (executionEnabled === false) return;
    if (isRunning) return;
    if (consoleFirst) {
      setConsoleOpen(true);
    }
    if (runtimeAdapter) {
      setPanel("console");
      runtimeAdapter.run();
      return;
    }
    setExecuting(true);
    setPanel(consoleFirst ? "console" : "preview");
    try {
      await executeCurrentFiles(sandpack);
    } catch {
      // ignore
    } finally {
      setTimeout(() => setExecuting(false), 500);
    }
  };

  const handleCopy = async () => {
    const source = Object.entries(sandpack.files)
      .map(([name, file]) => `// ${name}\n${file.code}`)
      .join("\n\n");
    await navigator.clipboard.writeText(source);
  };

  const handleDownload = async () => {
    const entries = Object.entries(sandpack.files);
    if (entries.length > 1) {
      const { default: JSZip } = await import("jszip");
      const archive = new JSZip();
      entries.forEach(([path, file]) => {
        const projectPath = path.replace(/^\/+/, "");
        if (projectPath) archive.file(projectPath, file.code || "");
      });
      const blob = await archive.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${
        String(title || "project")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "project"
      }.zip`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }
    const activePath = sandpack.activeFile || Object.keys(sandpack.files)[0];
    const source = sandpack.files[activePath]?.code || "";
    const filename = activePath.split("/").filter(Boolean).pop() || "index.js";
    const extension = filename.split(".").pop()?.toLowerCase();
    const mimeTypes = {
      html: "text/html",
      css: "text/css",
      js: "text/javascript",
      jsx: "text/jsx",
      ts: "text/typescript",
      tsx: "text/tsx",
      json: "application/json",
    };
    const url = URL.createObjectURL(
      new Blob([source], { type: mimeTypes[extension] || "text/plain" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isOutputPanelVisible = consoleFirst ? consoleOpen : true;

  return (
    <div
      ref={splitRef}
      className={`relative flex min-h-0 flex-1 flex-col transition-colors lg:grid ${
        isDark ? "bg-zinc-950" : "bg-zinc-100"
      }`}
      style={{
        gridTemplateColumns: isOutputPanelVisible
          ? `${split}% 8px minmax(0, 1fr)`
          : "1fr",
      }}
    >
      {/* Left Side: File Explorer + Code Editor */}
      <div
        className={`${
          panel === "code" || panel === "files"
            ? "flex flex-col w-full"
            : "hidden"
        } min-h-0 min-w-0 flex-1 lg:grid ${
          explorerOpen ? "lg:grid-cols-[190px_minmax(0,1fr)]" : "lg:grid-cols-1"
        }`}
      >
        <div
          className={`${
            panel === "files" ? "block w-full" : "hidden"
          } h-full min-h-0 ${explorerOpen ? "lg:block" : "lg:hidden"}`}
        >
          <FileExplorer isDark={isDark} onFileSelect={() => setPanel("code")} />
        </div>
        <div
          className={`${panel === "code" ? "block w-full" : "hidden"} h-full min-h-0 min-w-0 lg:block`}
        >
          <SandpackCodeEditor
            showTabs={false}
            showLineNumbers
            wrapContent={true}
            style={{ height: "100%", fontSize }}
          />
        </div>
      </div>

      {/* Desktop Split Resize Bar */}
      {isOutputPanelVisible && (
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
      )}

      {/* Right Side: Output (Preview & Console) - Takes full 100% width on smaller devices */}
      <div
        ref={outputRef}
        className={`playground-output relative min-h-0 min-w-0 flex-1 w-full transition-colors ${
          isDark ? "border-zinc-800" : "border-zinc-200"
        } ${
          panel === "preview" || panel === "console" || panel === "tests"
            ? "flex flex-col w-full"
            : "hidden"
        } ${
          isOutputPanelVisible
            ? "lg:flex lg:flex-col lg:border-l"
            : "lg:hidden"
        } ${
          !consoleFirst && consoleOpen ? "playground-output-split" : ""
        }`}
        style={
          !consoleFirst && consoleOpen
            ? { "--preview-size": `${outputSplit}%` }
            : undefined
        }
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
              panel === "preview" ? "flex flex-1 w-full" : "hidden"
            } relative min-h-0 overflow-hidden lg:flex lg:flex-col w-full h-full`}
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

            {/* Quick Open Console Button when console is collapsed on desktop */}
            {!consoleOpen && (
              <div className="hidden lg:block absolute bottom-2.5 right-2.5 z-30">
                <button
                  type="button"
                  onClick={() => setConsoleOpen(true)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold shadow-lg backdrop-blur transition-all active:scale-95 cursor-pointer ${
                    isDark
                      ? "bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700/80"
                      : "bg-white/95 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-300/80 shadow-zinc-400/20"
                  }`}
                  title="Open console"
                  aria-label="Open console"
                >
                  <Terminal className="h-3.5 w-3.5 text-amber-500" />
                  <span>Console</span>
                </button>
              </div>
            )}
          </div>
        )}
        {!consoleFirst && consoleOpen && (
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
            panel === "console" ? "flex flex-1 w-full" : "hidden"
          } min-h-0 overflow-hidden ${
            consoleOpen ? "lg:block" : "lg:hidden"
          } w-full h-full`}
        >
          {runtimeAdapter ? (
            runtimeAdapter.output
          ) : (
            <BetterConsole
              standalone={consoleFirst}
              onCollapse={() => setConsoleOpen(false)}
            />
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
      </div>

      {/* Mobile Floating Island Control Dock (Centered Horizontally) */}
      <div className="pointer-events-none absolute bottom-3 inset-x-0 z-30 flex justify-center items-center lg:hidden px-3">
        <div
          className={`pointer-events-auto flex items-center gap-1.5 p-1 rounded-full border shadow-2xl backdrop-blur-2xl transition-all ${
            isDark
              ? "bg-[#18181b]/95 border-zinc-700/80 text-white shadow-black/70"
              : "bg-white/95 border-zinc-200/90 text-zinc-900 shadow-zinc-400/40"
          }`}
        >
          {/* 1. Play / Run Button */}
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning || executionEnabled === false}
            className="h-8.5 w-8.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-sm active:scale-95 transition-all disabled:opacity-60 cursor-pointer shrink-0"
            title={executionEnabled === false ? "Execution is temporarily disabled" : "Run code (Ctrl + Enter)"}
            aria-label={executionEnabled === false ? "Execution temporarily disabled" : "Run code"}
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4 ml-0.5 fill-current" />
            )}
          </button>

          {/* 2. Reset Starter Code Button */}
          <button
            type="button"
            onClick={reset}
            className={`h-8.5 w-8.5 rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0 ${
              isDark
                ? "bg-zinc-800/90 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900"
            }`}
            title="Reset starter code"
            aria-label="Reset starter code"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* 3. View Output / Back to Code Toggle Button (Icon only) */}
          <button
            type="button"
            onClick={() =>
              setPanel(
                panel === "code"
                  ? consoleFirst
                    ? "console"
                    : "preview"
                  : "code",
              )
            }
            className={`h-8.5 w-8.5 rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0 ${
              panel !== "code"
                ? "bg-blue-600 text-white shadow-sm"
                : isDark
                  ? "bg-zinc-800/90 text-blue-400 hover:bg-zinc-700 hover:text-blue-300"
                  : "bg-zinc-100 text-blue-600 hover:bg-zinc-200 hover:text-blue-700"
            }`}
            title={panel === "code" ? "View Output" : "Back to Code"}
            aria-label={panel === "code" ? "View Output" : "Back to Code"}
          >
            {panel === "code" ? (
              consoleFirst ? (
                <Terminal className="h-4 w-4 text-amber-400" />
              ) : (
                <Monitor className="h-4 w-4" />
              )
            ) : (
              <Code2 className="h-4 w-4" />
            )}
          </button>

          {/* 4. More Options Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`h-8.5 w-8.5 rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0 ${
                  isDark
                    ? "bg-zinc-800/90 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900"
                }`}
                title="Options & Settings"
                aria-label="Options & Settings"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              side="top"
              sideOffset={8}
              container={workspaceRef?.current || undefined}
              className={`w-52 p-1.5 shadow-2xl backdrop-blur-md rounded-2xl ${
                isDark
                  ? "!bg-[#18181b] !border-zinc-800 !text-zinc-100 shadow-black/80"
                  : "!bg-white !border-zinc-200 !text-zinc-900 shadow-zinc-400/40"
              }`}
            >
              <DropdownMenuLabel
                className={`text-[10px] font-black uppercase tracking-wider ${
                  isDark ? "!text-zinc-400" : "!text-zinc-500"
                }`}
              >
                File Actions
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  disabled={formatting}
                  onSelect={formatActive}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition ${
                    isDark
                      ? "!text-zinc-200 hover:!bg-zinc-800/80 hover:!text-white data-highlighted:!bg-blue-600 data-highlighted:!text-white"
                      : "!text-zinc-800 hover:!bg-zinc-100 hover:!text-zinc-950 data-highlighted:!bg-blue-600 data-highlighted:!text-white"
                  }`}
                >
                  <WandSparkles className={`h-4 w-4 shrink-0 ${isDark ? "!text-zinc-400" : "!text-zinc-500"}`} />
                  <span>{formatting ? "Formatting..." : "Format Code"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={share}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition ${
                    isDark
                      ? "!text-zinc-200 hover:!bg-zinc-800/80 hover:!text-white data-highlighted:!bg-blue-600 data-highlighted:!text-white"
                      : "!text-zinc-800 hover:!bg-zinc-100 hover:!text-zinc-950 data-highlighted:!bg-blue-600 data-highlighted:!text-white"
                  }`}
                >
                  <Share2 className={`h-4 w-4 shrink-0 ${isDark ? "!text-zinc-400" : "!text-zinc-500"}`} />
                  <span>{shareStatus || "Share Snippet"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={handleCopy}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition ${
                    isDark
                      ? "!text-zinc-200 hover:!bg-zinc-800/80 hover:!text-white data-highlighted:!bg-blue-600 data-highlighted:!text-white"
                      : "!text-zinc-800 hover:!bg-zinc-100 hover:!text-zinc-950 data-highlighted:!bg-blue-600 data-highlighted:!text-white"
                  }`}
                >
                  <Copy className={`h-4 w-4 shrink-0 ${isDark ? "!text-zinc-400" : "!text-zinc-500"}`} />
                  <span>Copy Code</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={handleDownload}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition ${
                    isDark
                      ? "!text-zinc-200 hover:!bg-zinc-800/80 hover:!text-white data-highlighted:!bg-blue-600 data-highlighted:!text-white"
                      : "!text-zinc-800 hover:!bg-zinc-100 hover:!text-zinc-950 data-highlighted:!bg-blue-600 data-highlighted:!text-white"
                  }`}
                >
                  <Download className={`h-4 w-4 shrink-0 ${isDark ? "!text-zinc-400" : "!text-zinc-500"}`} />
                  <span>Download</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator
                className={isDark ? "!bg-zinc-800" : "!bg-zinc-200"}
              />
              <DropdownMenuLabel
                className={`text-[10px] font-black uppercase tracking-wider ${
                  isDark ? "!text-zinc-400" : "!text-zinc-500"
                }`}
              >
                Text Size
              </DropdownMenuLabel>
              <div className="flex items-center justify-between px-2.5 py-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setFontSize((v) => Math.max(11, v - 1))}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                    isDark ? "!bg-zinc-800 !text-zinc-300 hover:!bg-zinc-700 hover:!text-white" : "!bg-zinc-100 !text-zinc-700 hover:!bg-zinc-200 hover:!text-zinc-900"
                  }`}
                  aria-label="Decrease text size"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className={`font-mono text-xs font-bold ${isDark ? "!text-zinc-200" : "!text-zinc-800"}`}>
                  {fontSize}px
                </span>
                <button
                  type="button"
                  onClick={() => setFontSize((v) => Math.min(20, v + 1))}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                    isDark ? "!bg-zinc-800 !text-zinc-300 hover:!bg-zinc-700 hover:!text-white" : "!bg-zinc-100 !text-zinc-700 hover:!bg-zinc-200 hover:!text-zinc-900"
                  }`}
                  aria-label="Increase text size"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 5. Minimise / Maximise Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`h-8.5 w-8.5 rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0 ${
              isDark
                ? "bg-zinc-800/90 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900"
            }`}
            title={fullscreen ? "Exit fullscreen" : "Open fullscreen"}
            aria-label={fullscreen ? "Exit fullscreen" : "Open fullscreen"}
          >
            {fullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Expand className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
