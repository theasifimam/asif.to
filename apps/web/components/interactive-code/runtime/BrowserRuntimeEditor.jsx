"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Code2,
  FileCode2,
  FolderTree,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Play,
  RotateCcw,
  ShieldCheck,
  Terminal,
  Trash2,
} from "lucide-react";
import { storageKey } from "@/lib/playground/client";
import { BROWSER_RUNTIME_CONFIG, initialRuntimeCode } from "./runtimeConfig";
import {
  SandpackCodeEditor,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { VSCODE_DARK_THEME } from "../sandpackConfig";
import Workspace from "../Workspace";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) return "size unavailable";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );
  return `${(value / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function sourceFromProps(language, code, files) {
  const config = BROWSER_RUNTIME_CONFIG[language];
  const entry = files?.[config.file] ?? files?.[Object.keys(files || {})[0]];
  return entry?.code ?? entry ?? code ?? initialRuntimeCode(language);
}

function BrowserRuntimeWorkspace({
  language,
  languageOptions,
  onLanguageChange,
  title,
  playgroundId = "scratch",
  fillViewport = false,
  starter,
  executionEnabled = true,
  compact = false,
}) {
  const { requireAuth } = useAuthPrompt();
  const config = BROWSER_RUNTIME_CONFIG[language];
  const { sandpack } = useSandpack();
  const activeFile = sandpack.activeFile || config.file;
  const source =
    sandpack.files[activeFile]?.code || sandpack.files[config.file]?.code || "";
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const [statusText, setStatusText] = useState("");
  const [progress, setProgress] = useState(null);
  const [javaMounted, setJavaMounted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const workspaceRef = useRef(null);
  const workerRef = useRef(null);
  const javaRef = useRef(null);
  const pendingJavaRef = useRef(null);
  const javaReadyRef = useRef(false);
  const watchdogRef = useRef(null);
  const saveRef = useRef(null);
  const key = storageKey(
    playgroundId || title || "runtime",
    language,
    config.file,
  );

  const finish = useCallback((message) => {
    if (message.type === "ready") {
      javaReadyRef.current = true;
      if (pendingJavaRef.current && javaRef.current?.contentWindow)
        javaRef.current.contentWindow.postMessage(pendingJavaRef.current, "*");
      return;
    }
    if (message.type === "status") {
      setStatus("loading");
      setStatusText(message.message);
      if (message.progress) setProgress(message.progress);
      return;
    }
    if (message.type === "progress") {
      setStatus("loading");
      setStatusText(message.message || "Downloading browser runtime...");
      setProgress(message);
      return;
    }
    clearTimeout(watchdogRef.current);
    setProgress(null);
    if (message.type === "result") {
      setOutput(message.stdout || "");
      setError(message.stderr || "");
      setStatus(message.stderr ? "error" : "done");
      setStatusText("");
      pendingJavaRef.current = null;
    }
    if (message.type === "error") {
      setError(message.error || "Execution failed.");
      setStatus("error");
      setStatusText("");
      pendingJavaRef.current = null;
    }
  }, []);

  const ensureWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;
    const worker = new Worker(config.worker, {
      type: config.workerType || "module",
      name: `asif-${language}-runtime`,
    });
    worker.onmessage = (event) => finish(event.data || {});
    worker.onerror = (event) =>
      finish({
        type: "error",
        error: event.message || "The browser runtime could not start.",
      });
    workerRef.current = worker;
    return worker;
  }, [config.worker, config.workerType, finish, language]);

  const run = useCallback(() => {
    if (!executionEnabled) return;
    if (!requireAuth()) return;
    setConsoleOpen(true);
    clearTimeout(watchdogRef.current);
    setOutput("");
    setError("");
    setProgress(null);
    setStatus("loading");
    setStatusText(config.loading);
    if (["c", "cpp"].includes(language) && !window.crossOriginIsolated) {
      finish({
        type: "error",
        error: `${config.label} needs browser isolation to run its WebAssembly compiler. Reload this page once; if the message remains, use the full playground.`,
      });
      return;
    }
    watchdogRef.current = setTimeout(
      () =>
        finish({
          type: "error",
          error: `${config.label} did not finish loading. Check your connection or content blocker, then run it again.`,
        }),
      ["c", "cpp"].includes(language)
        ? 600000
        : language === "java"
          ? 360000
          : 180000,
    );
    if (language === "java") {
      const request = {
        type: "run",
        code: source,
        files: sandpack.files,
        entry: activeFile,
      };
      pendingJavaRef.current = request;
      if (!javaMounted) {
        setJavaMounted(true);
      } else if (javaReadyRef.current && javaRef.current?.contentWindow) {
        javaRef.current.contentWindow.postMessage(request, "*");
      }
      return;
    }
    const payload = {
      type: "run",
      language,
      code: source,
      files: sandpack.files,
      entry: activeFile,
    };
    if (["c", "cpp"].includes(language)) {
      payload.input = window.prompt("Program input (optional):") || "";
    }
    ensureWorker().postMessage(payload);
  }, [
    config.label,
    config.loading,
    ensureWorker,
    finish,
    javaMounted,
    language,
    source,
    sandpack.files,
    activeFile,
    executionEnabled,
    requireAuth,
  ]);

  useEffect(() => {
    const onMessage = (event) => {
      if (
        event.source === javaRef.current?.contentWindow &&
        event.data?.source === "asif-java-runtime"
      )
        finish(event.data);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [finish]);
  useEffect(
    () => () => {
      clearTimeout(watchdogRef.current);
      workerRef.current?.terminate();
    },
    [],
  );
  useEffect(() => {
    const onFullscreenChange = () =>
      setFullscreen(document.fullscreenElement === workspaceRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);
  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (fullscreen) {
        setFullscreen(false);
      } else {
        await workspaceRef.current?.requestFullscreen();
      }
    } catch {
      setFullscreen((current) => !current);
    }
  }, [fullscreen]);
  useEffect(() => {
    const shortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        run();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [run]);

  const runtimeOutput = (
    <section
      className="flex h-full w-full min-h-0 flex-1 flex-col bg-[#1e1e1e] text-zinc-200"
      aria-label="Console output"
    >
      <header className="flex h-10 w-full shrink-0 items-center justify-between border-b border-zinc-800 px-3">
        <h3 className="text-xs font-black uppercase tracking-wide">Console</h3>
        <button
          type="button"
          onClick={() => {
            setOutput("");
            setError("");
          }}
          className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer"
          aria-label="Clear console"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </header>
      <div
        className="relative min-h-0 w-full flex-1 overflow-auto p-3 font-mono text-xs"
        aria-live="polite"
      >
        {status === "loading" && (
          <div className="absolute inset-0 grid place-items-center bg-zinc-950/90 p-6 text-center">
            <div className="w-full max-w-sm">
              <LogoLoader className="mx-auto h-6 w-6  text-blue-400" />
              <p className="mt-3 font-sans text-sm font-bold">{statusText}</p>
              {progress && (
                <>
                  <progress
                    className="mt-4 h-2 w-full accent-blue-500"
                    max={progress.total || 1}
                    value={
                      progress.total
                        ? Math.min(progress.loaded || 0, progress.total)
                        : undefined
                    }
                    aria-label="Runtime download progress"
                  />
                  <p className="mt-2 text-xs text-zinc-400">
                    {progress.file ? `${progress.file} · ` : ""}
                    {formatBytes(progress.loaded)}
                    {progress.total
                      ? ` of ${formatBytes(progress.total)}`
                      : " downloaded"}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
        {!output && !error && status !== "loading" && (
          <p className="font-sans text-zinc-500">
            Run your code to see console output here.
          </p>
        )}
        {output && (
          <pre className="m-0 w-full whitespace-pre-wrap wrap-break-word text-zinc-200">
            {output}
          </pre>
        )}
        {error && (
          <pre className="m-0 w-full whitespace-pre-wrap wrap-break-word text-red-400">
            {error}
          </pre>
        )}
      </div>
    </section>
  );

  if (compact) {
    return (
      <>
        <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#1e1e1e] text-white shadow-lg">
          <header className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400">
                Try it
              </p>
              <h3 className="mt-0.5 truncate text-sm font-bold">
                {title || `${config.label} example`}
              </h3>
            </div>
            <button
              type="button"
              onClick={run}
              disabled={!executionEnabled || status === "loading"}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-black hover:bg-blue-500 disabled:opacity-50"
            >
              {status === "loading" ? (
                <LogoLoader className="h-4 w-4 " />
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
              style={{ minHeight: 120, height: "auto", fontSize: 14 }}
            />
          </div>
          <div className="h-44 border-t border-zinc-800">{runtimeOutput}</div>
        </section>
        {javaMounted && (
          <iframe
            ref={javaRef}
            src={config.iframe}
            sandbox="allow-scripts allow-same-origin"
            credentialless="true"
            referrerPolicy="no-referrer"
            className="hidden"
            title="Isolated credentialless Java browser runtime"
          />
        )}
      </>
    );
  }

  return (
    <>
      <Workspace
        language={language}
        languageOptions={languageOptions}
        onLanguageChange={onLanguageChange}
        title={title}
        editorTheme="dark"
        onThemeChange={() => {}}
        fillViewport={fillViewport}
        playgroundId={playgroundId}
        starterFiles={{ [config.file]: starter }}
        runtimeAdapter={{ run, status, output: runtimeOutput }}
        executionEnabled={executionEnabled !== false}
      />
      {javaMounted && (
        <iframe
          ref={javaRef}
          src={config.iframe}
          sandbox="allow-scripts allow-same-origin"
          credentialless="true"
          referrerPolicy="no-referrer"
          className="hidden"
          title="Isolated credentialless Java browser runtime"
        />
      )}
    </>
  );

  /* The legacy standalone shell below is intentionally unreachable while the
     shared Workspace owns the interface. It will be removed after rollout. */
  return (
    <section
      ref={workspaceRef}
      className={`overflow-hidden border border-zinc-800 bg-[#181818] text-white shadow-2xl ${fullscreen ? "fixed inset-0 z-100 h-screen max-h-none rounded-none" : `rounded-2xl sm:rounded-3xl ${fillViewport ? "h-[calc(100dvh-130px)] min-h-120" : "h-[68vh] min-h-115 max-h-175"}`}`}
      aria-label={`${config.label} browser code editor`}
    >
      <header className="flex h-12 items-center justify-between gap-3 border-b border-zinc-800 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setExplorerOpen((value) => !value)}
            className="hidden rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white lg:inline-flex"
            aria-label={
              explorerOpen ? "Collapse file explorer" : "Show file explorer"
            }
          >
            {explorerOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </button>
          <Code2 className="h-4 w-4 shrink-0 text-blue-400" />
          <strong className="truncate text-sm">
            {title || `${config.label} Playground`}
          </strong>
          {languageOptions && onLanguageChange && (
            <select
              value={language}
              onChange={(event) => onLanguageChange(event.target.value)}
              className="max-w-36 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs"
              aria-label="Select language"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-full bg-zinc-800 p-2 text-zinc-300 hover:bg-zinc-700"
            aria-label={
              fullscreen ? "Exit fullscreen editor" : "Open fullscreen editor"
            }
            title={fullscreen ? "Exit fullscreen" : "Open fullscreen"}
          >
            {fullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setConsoleOpen((v) => !v)}
            className="rounded-full bg-zinc-800 p-2 text-zinc-300 hover:bg-zinc-700 cursor-pointer"
            aria-label={consoleOpen ? "Collapse output" : "Open output"}
            title={consoleOpen ? "Collapse output" : "Open output"}
          >
            {consoleOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              sandpack.resetAllFiles();
              setOutput("");
              setError("");
            }}
            className="rounded-full bg-zinc-800 p-2 text-zinc-300 hover:bg-zinc-700"
            aria-label="Reset code"
            title="Reset code"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={run}
            disabled={!executionEnabled || status === "loading"}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-xs font-black hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60"
            title={
              !executionEnabled
                ? "Execution is temporarily disabled"
                : "Run (Ctrl/Cmd + Enter)"
            }
          >
            {status === "loading" ? (
              <LogoLoader className="h-4 w-4 " />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
            Run
          </button>
        </div>
      </header>
      <div
        className={`grid h-[calc(100%-84px)] min-h-0 ${consoleOpen ? "grid-rows-2 lg:grid-cols-2 lg:grid-rows-1" : "grid-cols-1"}`}
      >
        <div
          className={`relative min-h-0 border-b border-zinc-800 lg:border-b-0 lg:border-r ${explorerOpen ? "lg:grid lg:grid-cols-[190px_minmax(0,1fr)]" : ""}`}
        >
          {explorerOpen && (
            <aside className="hidden min-h-0 border-r border-zinc-800 bg-[#181818] lg:flex lg:flex-col">
              <div className="flex h-9 items-center gap-2 border-b border-zinc-800 px-3 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                <FolderTree className="h-3.5 w-3.5" />
                Explorer
              </div>
              <div className="flex items-center gap-2 bg-[#37373d] px-4 py-2 font-mono text-[11px] text-zinc-200">
                <FileCode2 className="h-3.5 w-3.5 text-blue-400" />
                {activeFile.slice(1)}
              </div>
            </aside>
          )}
          <div className="relative min-h-0">
            <div className="flex h-9 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 text-[11px] font-bold text-zinc-400">
              <span>{activeFile.slice(1)}</span>
              <span className="hidden truncate pl-3 sm:block">
                {config.note}
              </span>
            </div>
            <SandpackCodeEditor
              showTabs={false}
              showLineNumbers
              wrapContent
              style={{ height: "calc(100% - 36px)", fontSize: 14 }}
            />
          </div>
        </div>
        <div className={`${consoleOpen ? "flex" : "hidden"} min-h-0 flex-col`}>
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3">
            <strong className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-zinc-400">
              <Terminal className="h-3.5 w-3.5" />
              Output
            </strong>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setOutput("");
                  setError("");
                }}
                className="rounded p-1 text-zinc-500 hover:text-white cursor-pointer"
                aria-label="Clear output"
                title="Clear output"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setConsoleOpen(false)}
                className="rounded p-1 text-zinc-500 hover:text-white cursor-pointer"
                aria-label="Collapse output"
                title="Collapse output"
              >
                <PanelRightClose className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div
            className="relative min-h-0 flex-1 overflow-auto p-4"
            aria-live="polite"
          >
            {status === "loading" && (
              <div className="absolute inset-0 grid place-items-center bg-zinc-950/90 p-6 text-center">
                <div className="w-full max-w-sm">
                  <LogoLoader className="mx-auto h-6 w-6  text-blue-400" />
                  <p className="mt-3 text-sm font-bold">{statusText}</p>
                  {progress && (
                    <>
                      <progress
                        className="mt-4 h-2 w-full accent-blue-500"
                        max={progress.total || 1}
                        value={
                          progress.total
                            ? Math.min(progress.loaded || 0, progress.total)
                            : undefined
                        }
                        aria-label="Runtime download progress"
                      />
                      <p className="mt-2 text-xs tabular-nums text-zinc-400">
                        {progress.file ? `${progress.file} · ` : ""}
                        {formatBytes(progress.loaded)}
                        {progress.total
                          ? ` of ${formatBytes(progress.total)}`
                          : " downloaded"}
                      </p>
                    </>
                  )}
                  <p className="mt-2 text-xs text-zinc-500">
                    First use can take longer. The runtime is cached by your
                    browser.
                  </p>
                </div>
              </div>
            )}
            {!output && !error && status !== "loading" && (
              <p className="text-sm text-zinc-500">
                Run your code to see its exact output here.
              </p>
            )}
            {output && (
              <pre className="m-0 whitespace-pre font-mono text-sm leading-5 text-zinc-100">
                {output}
              </pre>
            )}
            {error && (
              <pre className="mt-3 whitespace-pre-wrap border-l-2 border-red-500 pl-3 font-mono text-xs text-red-400">
                {error}
              </pre>
            )}
          </div>
        </div>
      </div>
      <footer className="flex h-9 items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-900 px-4 text-[11px] text-zinc-400">
        <span className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          Code runs in an isolated browser runtime.
        </span>
        <span className="hidden font-mono sm:inline">
          Ctrl/⌘ + Enter to run
        </span>
      </footer>
      {javaMounted && (
        <iframe
          ref={javaRef}
          src={config.iframe}
          sandbox="allow-scripts allow-same-origin"
          credentialless="true"
          referrerPolicy="no-referrer"
          className="hidden"
          title="Isolated credentialless Java browser runtime"
        />
      )}
    </section>
  );
}

export default function BrowserRuntimeEditor(props) {
  const config = BROWSER_RUNTIME_CONFIG[props.language];
  const starter = useMemo(
    () => sourceFromProps(props.language, props.code, props.files),
    [props.code, props.files, props.language],
  );
  return (
    <SandpackProvider
      key={`${props.playgroundId || "playground"}-${props.language}-${config.file}`}
      template="vanilla"
      files={{
        [config.file]: { code: starter, active: true, readOnly: false },
        "/index.js": { code: "", hidden: true },
        "/index.html": { code: "", hidden: true },
        "/styles.css": { code: "", hidden: true },
        "/package.json": { code: "{}", hidden: true },
      }}
      theme={VSCODE_DARK_THEME}
      options={{
        autorun: false,
        recompileMode: "delayed",
        recompileDelay: 2147000000,
      }}
    >
      <BrowserRuntimeWorkspace {...props} starter={starter} />
    </SandpackProvider>
  );
}
