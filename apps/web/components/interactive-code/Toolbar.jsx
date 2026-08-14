"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Share2,
  WandSparkles,
  ExternalLink,
  Expand,
  FileCode2,
  FilePlus2,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderTree,
  GripHorizontal,
  GripVertical,
  Loader2,
  Maximize2,
  Minimize2,
  Minus,
  Moon,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sun,
  Terminal,
  Trash2,
  Monitor,
  Code2,
  X,
} from "lucide-react";
import {
  SandpackCodeEditor,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";
import BetterConsole from "./BetterConsole";
import {
  executeCurrentFiles,
  normalizeFiles,
  VSCODE_DARK_THEME,
  VSCODE_LIGHT_THEME,
} from "./sandpackConfig";
import { sandpackTemplateFor } from "@/lib/playground/config";
import {
  decodeShareState,
  encodeShareState,
  explainError,
  formatSource,
  RECENT_PRACTICE_KEY,
  storageKey,
  unsupportedFeedback,
} from "@/lib/playground/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Toolbar({
  title,
  language,
  languageOptions,
  onLanguageChange,
  onSelect,
  fullscreen,
  onFullscreen,
  fontSize,
  setFontSize,
  editorTheme,
  onThemeChange,
  onResetLayout,
  explorerOpen,
  onToggleExplorer,
  onRuntimeIssue,
  onFormat,
  onReset,
  onShare,
  shareStatus,
  saveStatus,
  formatting,
  runtimeAdapter,
}) {
  const { sandpack, listen } = useSandpack();
  const [copied, setCopied] = useState(false);
  const [executing, setExecuting] = useState(false);
  const isRunning = executing || runtimeAdapter?.status === "loading";
  const executionTimeoutRef = useRef(null);

  useEffect(() => {
    const unsubscribe = listen((message) => {
      const messageText = JSON.stringify(message).toLowerCase();
      if (
        language === "nextjs" &&
        (messageText.includes("nodebox") ||
          messageText.includes("network") ||
          messageText.includes("failed to fetch"))
      ) {
        onRuntimeIssue?.(
          "The Next.js preview could not start because its temporary CodeSandbox Nodebox runtime is unavailable or blocked. This is a preview-service/network failure, not necessarily an error in your code.",
        );
      }
      if (
        message.type === "done" ||
        message.type === "success" ||
        (message.type === "action" && message.action === "show-error")
      ) {
        setExecuting(false);
        if (executionTimeoutRef.current)
          clearTimeout(executionTimeoutRef.current);
      }
    });
    return () => {
      unsubscribe();
      if (executionTimeoutRef.current)
        clearTimeout(executionTimeoutRef.current);
    };
  }, [language, listen, onRuntimeIssue]);

  const run = async () => {
    if (executing || runtimeAdapter?.status === "loading") return;
    if (runtimeAdapter) {
      onSelect("console");
      runtimeAdapter.run();
      return;
    }
    setExecuting(true);
    onRuntimeIssue?.("");
    onSelect("preview");
    if (executionTimeoutRef.current) clearTimeout(executionTimeoutRef.current);
    executionTimeoutRef.current = setTimeout(() => {
      setExecuting(false);
      if (language === "nextjs") {
        onRuntimeIssue?.(
          "The Next.js preview timed out while starting its temporary CodeSandbox Nodebox runtime. The external preview service may be unavailable or blocked by your network; this does not automatically mean the code is wrong.",
        );
      }
    }, 30000);
    try {
      await executeCurrentFiles(sandpack);
    } catch {
      setExecuting(false);
      clearTimeout(executionTimeoutRef.current);
      if (language === "nextjs") {
        onRuntimeIssue?.(
          "The Next.js preview could not connect to its temporary CodeSandbox Nodebox runtime. This is an external preview-runtime failure, not necessarily a problem with the snippet.",
        );
      }
    }
  };

  const copy = async () => {
    const source = Object.entries(sandpack.files)
      .map(([name, file]) => `// ${name}\n${file.code}`)
      .join("\n\n");
    await navigator.clipboard.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = async () => {
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

  const activeLanguageObj = languageOptions?.find(
    (opt) => opt.value === language,
  );
  const isDark = editorTheme === "dark";

  return (
    <div
      className={`flex items-center justify-between gap-2 border-b px-2.5 py-2 transition-colors sm:px-4 ${
        isDark
          ? "border-zinc-800 bg-[#1e1e1e] text-white"
          : "border-zinc-200 bg-[#f3f3f3] text-zinc-900"
      }`}
    >
      {/* Left side: Explorer toggle + asif.to Logo/Branding + Language picker or Title */}
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onToggleExplorer}
          className={`hidden h-8 w-8 items-center justify-center rounded-lg transition lg:inline-flex ${
            isDark
              ? "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
          }`}
          title={explorerOpen ? "Collapse file explorer" : "Show file explorer"}
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

        {/* asif.to Branding with Logo */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex shrink-0 items-center gap-1.5 rounded-lg px-1 py-0.5 transition hover:opacity-85"
          title="asif.to - Learn & Practice"
          aria-label="asif.to home"
        >
          <img
            src="/logo.png"
            alt="asif.to logo"
            className="h-5 w-5 rounded-md object-contain shadow-xs transition-transform group-hover:scale-105"
          />
          <span className="font-outfit text-xs font-black tracking-tight leading-none sm:text-sm">
            asif<span className="text-blue-500">.to</span>
          </span>
        </a>

        <span
          className={`text-xs ${isDark ? "text-zinc-600" : "text-zinc-300"}`}
        >
          /
        </span>

        {languageOptions && onLanguageChange ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition active:scale-95 ${
                  isDark
                    ? "border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800"
                    : "border-zinc-300 bg-white text-zinc-800 shadow-sm hover:border-zinc-400 hover:bg-zinc-100"
                }`}
                aria-label="Select technology language"
                title="Select technology language"
              >
                <Code2 className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                <span className="max-w-27.5 truncate sm:max-w-40">
                  {activeLanguageObj?.label || language}
                </span>
                <ChevronDown className="h-3 w-3 shrink-0 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className={`w-64 p-1.5 shadow-2xl backdrop-blur-md ${
                isDark
                  ? "border-zinc-800 bg-zinc-900 text-zinc-100 shadow-black/80"
                  : "border-zinc-200 bg-white text-zinc-900 shadow-zinc-400/30"
              }`}
            >
              <DropdownMenuLabel
                className={`text-[10px] font-black uppercase tracking-wider ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Switch Technology
              </DropdownMenuLabel>
              <DropdownMenuSeparator
                className={isDark ? "bg-zinc-800" : "bg-zinc-200"}
              />
              {languageOptions.map((opt) => {
                const isSelected = opt.value === language;
                return (
                  <DropdownMenuItem
                    key={opt.value}
                    onSelect={() => onLanguageChange(opt.value)}
                    className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                      isSelected
                        ? isDark
                          ? "bg-blue-600/30 font-bold text-blue-300"
                          : "bg-blue-50 font-bold text-blue-700"
                        : isDark
                          ? "text-zinc-100 hover:bg-zinc-800 hover:text-white data-highlighted:bg-zinc-800 data-highlighted:text-white"
                          : "text-zinc-800 hover:bg-zinc-100 hover:text-zinc-900 data-highlighted:bg-zinc-100 data-highlighted:text-zinc-900"
                    }`}
                  >
                    <div className="flex min-w-0 flex-col">
                      <span
                        className={`truncate ${isSelected ? "font-bold" : "font-semibold"} ${isDark ? (isSelected ? "text-blue-300" : "text-zinc-100") : isSelected ? "text-blue-700" : "text-zinc-800"}`}
                      >
                        {opt.label}
                      </span>
                      {opt.description && (
                        <span
                          className={`line-clamp-1 text-[10px] font-medium ${
                            isSelected
                              ? isDark
                                ? "text-blue-300/90"
                                : "text-blue-600/90"
                              : isDark
                                ? "text-zinc-400"
                                : "text-zinc-500"
                          }`}
                        >
                          {opt.description}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="ml-2 h-4 w-4 shrink-0 text-blue-500" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div
            className={`flex min-w-0 items-center gap-1.5 text-xs font-black sm:text-sm ${
              isDark ? "text-white" : "text-zinc-900"
            }`}
          >
            <Code2 className="h-4 w-4 shrink-0 text-blue-500" />
            <span className="max-w-32.5 truncate sm:max-w-65">
              {title || language || "Code Playground"}
            </span>
          </div>
        )}
      </div>

      {/* Right side: Icon-only header action buttons */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={run}
          disabled={isRunning}
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500 active:scale-95 disabled:cursor-wait disabled:bg-emerald-600/60"
          title={executing ? "Executing code…" : "Run code (Ctrl + Enter)"}
          aria-label={executing ? "Executing code" : "Run code"}
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          )}
        </button>

        <button
          type="button"
          onClick={onReset}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition active:scale-95 ${
            isDark
              ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 hover:text-zinc-900"
          }`}
          title="Reset starter code"
          aria-label="Reset starter code"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition active:scale-95 ${
                isDark
                  ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 hover:text-zinc-900"
              }`}
              title="Editor options & settings"
              aria-label="Editor options & settings"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={`w-56 p-1.5 shadow-2xl backdrop-blur-md ${
              isDark
                ? "border-zinc-700 bg-zinc-900 text-zinc-100 shadow-black/80"
                : "border-zinc-200 bg-white text-zinc-900 shadow-zinc-400/30"
            }`}
          >
            <DropdownMenuLabel
              className={`text-[10px] font-black uppercase tracking-wider ${
                isDark ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              File actions
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem
                disabled={formatting}
                onSelect={onFormat}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                  isDark
                    ? "text-zinc-100 hover:bg-zinc-800 hover:text-white data-highlighted:bg-zinc-800 data-highlighted:text-white"
                    : "text-zinc-800 hover:bg-zinc-100 hover:text-zinc-900 data-highlighted:bg-zinc-100 data-highlighted:text-zinc-900"
                }`}
              >
                {formatting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                ) : (
                  <WandSparkles
                    className={`h-4 w-4 shrink-0 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
                  />
                )}
                <span>
                  {formatting ? "Formatting..." : "Format active file"}
                </span>
                <span
                  className={`ml-auto text-[10px] font-mono ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
                >
                  Ctrl+Shift+F
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={onShare}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                  isDark
                    ? "text-zinc-100 hover:bg-zinc-800 hover:text-white data-highlighted:bg-zinc-800 data-highlighted:text-white"
                    : "text-zinc-800 hover:bg-zinc-100 hover:text-zinc-900 data-highlighted:bg-zinc-100 data-highlighted:text-zinc-900"
                }`}
              >
                <Share2
                  className={`h-4 w-4 shrink-0 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
                />
                <span>{shareStatus || "Share playground"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={copy}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                  isDark
                    ? "text-zinc-100 hover:bg-zinc-800 hover:text-white data-highlighted:bg-zinc-800 data-highlighted:text-white"
                    : "text-zinc-800 hover:bg-zinc-100 hover:text-zinc-900 data-highlighted:bg-zinc-100 data-highlighted:text-zinc-900"
                }`}
              >
                {copied ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <Copy
                    className={`h-4 w-4 shrink-0 ${
                      isDark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  />
                )}
                <span>{copied ? "Copied to clipboard" : "Copy all files"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={download}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                  isDark
                    ? "text-zinc-100 hover:bg-zinc-800 hover:text-white data-highlighted:bg-zinc-800 data-highlighted:text-white"
                    : "text-zinc-800 hover:bg-zinc-100 hover:text-zinc-900 data-highlighted:bg-zinc-100 data-highlighted:text-zinc-900"
                }`}
              >
                <Download
                  className={`h-4 w-4 shrink-0 ${
                    isDark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                />
                <span>
                  {Object.keys(sandpack.files).length > 1
                    ? "Download project (.zip)"
                    : "Download active file"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator
              className={isDark ? "bg-zinc-800" : "bg-zinc-200"}
            />
            <DropdownMenuLabel
              className={`text-[10px] font-black uppercase tracking-wider ${
                isDark ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              Appearance
            </DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={onThemeChange}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                isDark
                  ? "text-zinc-100 hover:bg-zinc-800 hover:text-white data-highlighted:bg-zinc-800 data-highlighted:text-white"
                  : "text-zinc-800 hover:bg-zinc-100 hover:text-zinc-900 data-highlighted:bg-zinc-100 data-highlighted:text-zinc-900"
              }`}
            >
              {isDark ? (
                <Sun className="h-4 w-4 shrink-0 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 shrink-0 text-indigo-500" />
              )}
              <span>Use {isDark ? "light" : "dark"} theme</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setFontSize((value) => Math.min(20, value + 1))}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                isDark
                  ? "text-zinc-100 hover:bg-zinc-800 hover:text-white data-highlighted:bg-zinc-800 data-highlighted:text-white"
                  : "text-zinc-800 hover:bg-zinc-100 hover:text-zinc-900 data-highlighted:bg-zinc-100 data-highlighted:text-zinc-900"
              }`}
            >
              <Plus
                className={`h-4 w-4 shrink-0 ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              />
              <span>Increase text size</span>
              <span
                className={`ml-auto font-mono text-[10px] ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                {fontSize}px
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setFontSize((value) => Math.max(11, value - 1))}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                isDark
                  ? "text-zinc-100 hover:bg-zinc-800 hover:text-white data-highlighted:bg-zinc-800 data-highlighted:text-white"
                  : "text-zinc-800 hover:bg-zinc-100 hover:text-zinc-900 data-highlighted:bg-zinc-100 data-highlighted:text-zinc-900"
              }`}
            >
              <Minus
                className={`h-4 w-4 shrink-0 ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              />
              <span>Decrease text size</span>
              <span
                className={`ml-auto font-mono text-[10px] ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                {fontSize}px
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator
              className={isDark ? "bg-zinc-800" : "bg-zinc-200"}
            />
            <DropdownMenuItem
              onSelect={onResetLayout}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                isDark
                  ? "text-zinc-100 hover:bg-zinc-800 hover:text-white data-highlighted:bg-zinc-800 data-highlighted:text-white"
                  : "text-zinc-800 hover:bg-zinc-100 hover:text-zinc-900 data-highlighted:bg-zinc-100 data-highlighted:text-zinc-900"
              }`}
            >
              <Maximize2
                className={`h-4 w-4 shrink-0 ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              />
              <span>Reset panel layout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          onClick={onFullscreen}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition active:scale-95 ${
            isDark
              ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 hover:text-zinc-900"
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
      <span className="sr-only" aria-live="polite">
        {saveStatus} {shareStatus}
      </span>
    </div>
  );
}

export default Toolbar;
