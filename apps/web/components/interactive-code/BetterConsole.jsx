"use client";

import { Trash2 } from "lucide-react";
import { useSandpackConsole } from "@codesandbox/sandpack-react";

function printable(value) {
  if (typeof value === "string") return value;
  try { return JSON.stringify(value, null, 2); } catch { return String(value); }
}

export default function BetterConsole({ standalone = false }) {
  const { logs, reset } = useSandpackConsole({ resetOnPreviewRestart: true, showSyntaxError: true });
  return <section className="flex h-full min-h-0 flex-col bg-[#1e1e1e] text-zinc-200" aria-label="Console output">
    <header className="flex h-10 shrink-0 items-center justify-between border-b border-zinc-800 px-3"><h3 className="text-xs font-black uppercase tracking-wide">Console</h3><button type="button" onClick={reset} className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white" aria-label="Clear console" title="Clear console"><Trash2 className="h-3.5 w-3.5" /></button></header>
    <div className="min-h-0 flex-1 overflow-auto p-3 font-mono text-xs" aria-live="polite">
      {!logs.length ? <p className="font-sans text-zinc-500">Run your code to see console output here.</p> : logs.map((log) => <pre key={log.id} className={`m-0 whitespace-pre-wrap break-words border-b border-zinc-800/70 py-2 last:border-0 ${log.method === "error" ? "text-red-400" : log.method === "warn" ? "text-amber-400" : log.method === "info" ? "text-blue-300" : "text-zinc-200"}`}>{(log.data || []).map(printable).join(" ")}</pre>)}
    </div>
    {standalone && <span className="sr-only">Standalone console</span>}
  </section>;
}
