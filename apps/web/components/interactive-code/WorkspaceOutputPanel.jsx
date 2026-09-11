"use client";

import React from "react";
import LogoLoader from "@/components/ui/LogoLoader";
import { AlertTriangle, ExternalLink, Terminal } from "lucide-react";
import { SandpackPreview } from "@codesandbox/sandpack-react";
import BetterConsole from "./BetterConsole";
import WorkspaceSplitResizer from "./WorkspaceSplitResizer";
import WorkspaceTestsPanel from "./WorkspaceTestsPanel";

export default function WorkspaceOutputPanel({
  outputRef,
  isDark,
  panel,
  isOutputPanelVisible,
  consoleFirst,
  consoleOpen,
  setConsoleOpen,
  outputSplit,
  previewBusy,
  device,
  setDevice,
  sandpack,
  language,
  runtimeIssue,
  runtimeAdapter,
  startResize,
  moveResize,
  stopResize,
  tests,
  testCases,
  executionEnabled,
  handleRunTests,
  customInput,
  setCustomInput,
  handleRunCustom,
  customOutput,
}) {
  return (
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
                <LogoLoader className="h-3.5 w-3.5" />
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
                className={`rounded px-2 py-1 text-[10px] font-bold ${
                  device === value ? "bg-blue-600" : "hover:bg-zinc-700"
                }`}
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
                preview URL says it is unavailable, the external runtime failed
                to start or is blocked by the network; it does not automatically
                mean this code is incorrect.
              </p>
            </div>
          )}
          {runtimeIssue && language === "nextjs" ? (
            <div
              className={`flex h-full w-full items-center justify-center p-5 ${
                isDark ? "bg-[#181818]" : "bg-zinc-50"
              }`}
              role="alert"
            >
              <div
                className={`max-w-lg rounded-2xl border p-5 shadow-sm ${
                  isDark
                    ? "border-amber-500/30 bg-amber-500/10 text-zinc-200"
                    : "border-amber-300 bg-amber-50 text-zinc-800"
                }`}
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
                      Press Run to retry when the preview service is available.
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
        <WorkspaceSplitResizer
          direction="vertical"
          isDark={isDark}
          startResize={startResize}
          moveResize={moveResize}
          stopResize={stopResize}
        />
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

      <WorkspaceTestsPanel
        panel={panel}
        tests={tests}
        testCases={testCases}
        executionEnabled={executionEnabled}
        handleRunTests={handleRunTests}
        customInput={customInput}
        setCustomInput={setCustomInput}
        handleRunCustom={handleRunCustom}
        customOutput={customOutput}
      />
    </div>
  );
}
