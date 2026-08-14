"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Play, RotateCcw, Trash2 } from "lucide-react";
import { storageKey } from "@/lib/playground/client";
import { BROWSER_RUNTIME_CONFIG, initialRuntimeCode } from "./runtimeConfig";
import RuntimeCodeEditor from "./RuntimeCodeEditor";

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) return "size unavailable";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function sourceFromProps(language, code, files) {
  const config = BROWSER_RUNTIME_CONFIG[language];
  const entry = files?.[config.file] ?? files?.[Object.keys(files || {})[0]];
  return entry?.code ?? entry ?? code ?? initialRuntimeCode(language);
}

export default function BrowserRuntimeEditor({ language, languageOptions, onLanguageChange, code, files, title, playgroundId = "scratch", fillViewport = false }) {
  const config = BROWSER_RUNTIME_CONFIG[language];
  const starter = useMemo(() => sourceFromProps(language, code, files), [code, files, language]);
  const [source, setSource] = useState(starter);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const [statusText, setStatusText] = useState("");
  const [progress, setProgress] = useState(null);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [javaMounted, setJavaMounted] = useState(false);
  const workerRef = useRef(null);
  const javaRef = useRef(null);
  const pendingJavaRef = useRef(null);
  const javaReadyRef = useRef(false);
  const watchdogRef = useRef(null);
  const saveRef = useRef(null);
  const key = storageKey(playgroundId || title || "runtime", language, config.file);

  useEffect(() => { const timer = setTimeout(() => { const saved = localStorage.getItem(key); if (saved != null) setSource(saved); }, 0); return () => clearTimeout(timer); }, [key]);
  useEffect(() => {
    clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => { localStorage.setItem(key, source); setSaveStatus("Saved"); }, 600);
    return () => clearTimeout(saveRef.current);
  }, [key, source]);

  const finish = useCallback((message) => {
    if (message.type === "ready") { javaReadyRef.current = true; if (pendingJavaRef.current && javaRef.current?.contentWindow) javaRef.current.contentWindow.postMessage({ type: "run", code: pendingJavaRef.current }, "*"); return; }
    if (message.type === "status") { setStatus("loading"); setStatusText(message.message); if (message.progress) setProgress(message.progress); return; }
    if (message.type === "progress") { setStatus("loading"); setStatusText(message.message || "Downloading browser runtime..."); setProgress(message); return; }
    clearTimeout(watchdogRef.current);
    setProgress(null);
    if (message.type === "result") { setOutput(message.stdout || ""); setError(message.stderr || ""); setStatus(message.stderr ? "error" : "done"); setStatusText(""); pendingJavaRef.current = null; }
    if (message.type === "error") { setError(message.error || "Execution failed."); setStatus("error"); setStatusText(""); pendingJavaRef.current = null; }
  }, []);

  const ensureWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;
    const worker = new Worker(config.worker, { type: "module", name: `asif-${language}-runtime` });
    worker.onmessage = (event) => finish(event.data || {});
    worker.onerror = (event) => finish({ type: "error", error: event.message || "The browser runtime could not start." });
    workerRef.current = worker; return worker;
  }, [config.worker, finish, language]);

  const run = useCallback(() => {
    clearTimeout(watchdogRef.current);
    setOutput(""); setError(""); setProgress(null); setStatus("loading"); setStatusText(config.loading);
    watchdogRef.current = setTimeout(() => finish({ type: "error", error: `${config.label} did not finish loading. Check your connection or content blocker, then run it again.` }), language === "java" ? 180000 : 120000);
    if (language === "java") { pendingJavaRef.current = source; if (!javaMounted) { setJavaMounted(true); } else if (javaReadyRef.current && javaRef.current?.contentWindow) { javaRef.current.contentWindow.postMessage({ type: "run", code: source }, "*"); } return; }
    ensureWorker().postMessage({ type: "run", language, code: source });
  }, [config.label, config.loading, ensureWorker, finish, javaMounted, language, source]);

  useEffect(() => {
    const onMessage = (event) => { if (event.source === javaRef.current?.contentWindow && event.data?.source === "asif-java-runtime") finish(event.data); };
    window.addEventListener("message", onMessage); return () => window.removeEventListener("message", onMessage);
  }, [finish]);
  useEffect(() => () => { clearTimeout(watchdogRef.current); workerRef.current?.terminate(); }, []);
  useEffect(() => {
    const shortcut = (event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); run(); } if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { event.preventDefault(); localStorage.setItem(key, source); setSaveStatus("Saved"); } };
    window.addEventListener("keydown", shortcut); return () => window.removeEventListener("keydown", shortcut);
  }, [key, run, source]);

  return <section className={`overflow-hidden rounded-2xl border border-zinc-800 bg-[#181818] text-white shadow-2xl sm:rounded-3xl ${fillViewport ? "h-[calc(100dvh-130px)] min-h-120" : "h-[68vh] min-h-115 max-h-175"}`} aria-label={`${config.label} browser code editor`}>
    <header className="flex h-12 items-center justify-between gap-3 border-b border-zinc-800 px-3 sm:px-4"><div className="flex min-w-0 items-center gap-2"><strong className="truncate text-sm">{title || `${config.label} Playground`}</strong>{languageOptions && onLanguageChange && <select value={language} onChange={(event) => onLanguageChange(event.target.value)} className="max-w-36 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs" aria-label="Select language">{languageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>}</div><div className="flex items-center gap-2"><span className="hidden text-[11px] text-zinc-500 sm:inline" aria-live="polite">{saveStatus}</span><button type="button" onClick={() => { setSource(starter); setOutput(""); setError(""); }} className="rounded-lg bg-zinc-800 p-2 text-zinc-300 hover:bg-zinc-700" aria-label="Reset code" title="Reset code"><RotateCcw className="h-4 w-4" /></button><button type="button" onClick={run} disabled={status === "loading"} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black hover:bg-emerald-500 disabled:cursor-wait disabled:opacity-60" title="Run (Ctrl/Cmd + Enter)">{status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}Run</button></div></header>
    <div className="grid h-[calc(100%-48px)] min-h-0 grid-rows-2 lg:grid-cols-2 lg:grid-rows-1">
      <div className="relative min-h-0 border-b border-zinc-800 lg:border-b-0 lg:border-r"><div className="flex h-9 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 text-[11px] font-bold text-zinc-400"><span>{config.file.slice(1)}</span><span>{config.note}</span></div><RuntimeCodeEditor language={language} label={config.label} value={source} onChange={(next) => { setSource(next); setSaveStatus("Saving..."); }} /></div>
      <div className="flex min-h-0 flex-col"><div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3"><strong className="text-[11px] uppercase tracking-wide text-zinc-400">Output</strong><button type="button" onClick={() => { setOutput(""); setError(""); }} className="rounded p-1 text-zinc-500 hover:text-white" aria-label="Clear output"><Trash2 className="h-3.5 w-3.5" /></button></div><div className="relative min-h-0 flex-1 overflow-auto p-4" aria-live="polite">{status === "loading" && <div className="absolute inset-0 grid place-items-center bg-zinc-950/90 p-6 text-center"><div className="w-full max-w-sm"><Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-400" /><p className="mt-3 text-sm font-bold">{statusText}</p>{progress && <><progress className="mt-4 h-2 w-full accent-blue-500" max={progress.total || 1} value={progress.total ? Math.min(progress.loaded || 0, progress.total) : undefined} aria-label="Runtime download progress" /><p className="mt-2 text-xs tabular-nums text-zinc-400">{progress.file ? `${progress.file} · ` : ""}{formatBytes(progress.loaded)}{progress.total ? ` of ${formatBytes(progress.total)}` : " downloaded"}</p></>}<p className="mt-2 text-xs text-zinc-500">First use can take longer. The runtime is cached by your browser.</p></div></div>}{!output && !error && status !== "loading" && <p className="text-sm text-zinc-500">Run your code to see its exact output here.</p>}{output && <pre className="m-0 whitespace-pre font-mono text-sm leading-5 text-zinc-100">{output}</pre>}{error && <pre className="mt-3 whitespace-pre-wrap border-l-2 border-red-500 pl-3 font-mono text-xs text-red-400">{error}</pre>}</div></div>
    </div>
    {javaMounted && <iframe ref={javaRef} src={config.iframe} sandbox="allow-scripts" className="hidden" title="Isolated Java browser runtime" />}
  </section>;
}
