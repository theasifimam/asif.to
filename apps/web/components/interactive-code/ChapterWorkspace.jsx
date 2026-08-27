"use client";

import { useState } from "react";
import { Loader2, Play, Terminal } from "lucide-react";
import {
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
} from "@codesandbox/sandpack-react";

import BetterConsole from "./BetterConsole";
import { executeCurrentFiles } from "./sandpackConfig";

const CONSOLE_ONLY = new Set(["javascript", "typescript"]);

export default function ChapterWorkspace({
  language,
  title,
  executionEnabled = true,
}) {
  const { sandpack } = useSandpack();
  const [running, setRunning] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const consoleOnly = CONSOLE_ONLY.has(language);

  const run = async () => {
    if (!executionEnabled || running) return;
    setRunning(true);
    try {
      await executeCurrentFiles(sandpack);
    } finally {
      window.setTimeout(() => setRunning(false), 500);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#1e1e1e] text-white shadow-lg">
      <header className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400">
            Try it yourself
          </p>
          <h3 className="mt-0.5 truncate text-sm font-bold">
            {title || "Code example"}
          </h3>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={!executionEnabled || running}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-black hover:bg-blue-500 disabled:opacity-50"
        >
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
          Run
        </button>
      </header>

      <div aria-label="Editable code">
        <SandpackCodeEditor
          showTabs={false}
          showLineNumbers
          wrapContent
          style={{ height: 260, fontSize: 14 }}
        />
      </div>

      <div className="relative border-t border-zinc-800">
        <div className="border-b border-zinc-800 bg-zinc-900 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">
          Output
        </div>

        {consoleOnly ? (
          <div className="h-44">
            <div className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0" aria-hidden="true">
              <SandpackPreview
                showNavigator={false}
                showOpenInCodeSandbox={false}
                showRefreshButton={false}
                style={{ height: 1, width: 1 }}
              />
            </div>
            <BetterConsole standalone />
          </div>
        ) : (
          <>
            <div className="h-64 bg-white">
              <SandpackPreview
                showNavigator={false}
                showOpenInCodeSandbox={false}
                showRefreshButton={false}
                style={{ height: "100%", width: "100%" }}
              />
            </div>
            {consoleOpen && (
              <div className="h-44 border-t border-zinc-800">
                <BetterConsole onCollapse={() => setConsoleOpen(false)} />
              </div>
            )}
            {!consoleOpen && (
              <button
                type="button"
                onClick={() => setConsoleOpen(true)}
                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/95 px-3 py-2 text-[11px] font-black text-zinc-200 shadow-lg hover:bg-zinc-800"
              >
                <Terminal className="h-3.5 w-3.5 text-amber-400" />
                Console
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
