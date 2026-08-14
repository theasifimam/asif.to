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
import { executeCurrentFiles, normalizeFiles, VSCODE_DARK_THEME, VSCODE_LIGHT_THEME } from "./sandpackConfig";
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
}) {
  const { sandpack, listen } = useSandpack();
  const [copied, setCopied] = useState(false);
  const [executing, setExecuting] = useState(false);
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
    if (executing) return;
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
      link.download = `${String(title || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project"}.zip`;
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
                      <span className={`truncate ${isSelected ? "font-bold" : "font-semibold"} ${isDark ? (isSelected ? "text-blue-300" : "text-zinc-100") : (isSelected ? "text-blue-700" : "text-zinc-800")}`}>
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
          disabled={executing}
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500 active:scale-95 disabled:cursor-wait disabled:bg-emerald-600/60"
          title={executing ? "Executing code…" : "Run code (Ctrl + Enter)"}
          aria-label={executing ? "Executing code" : "Run code"}
        >
          {executing ? (
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
                  <WandSparkles className={`h-4 w-4 shrink-0 ${isDark ? "text-zinc-400" : "text-zinc-500"}`} />
                )}
                <span>{formatting ? "Formatting..." : "Format active file"}</span>
                <span className={`ml-auto text-[10px] font-mono ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
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
                <Share2 className={`h-4 w-4 shrink-0 ${isDark ? "text-zinc-400" : "text-zinc-500"}`} />
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
      <span className="sr-only" aria-live="polite">{saveStatus} {shareStatus}</span>
    </div>
  );
}

function FileExplorer({ isDark = true, onFileSelect }) {
  const { sandpack } = useSandpack();
  const [editMode, setEditMode] = useState(null);
  const [pathValue, setPathValue] = useState("");
  const [error, setError] = useState("");
  const [virtualFolders, setVirtualFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(() => new Set());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const files = Object.keys(sandpack.files).sort((a, b) => a.localeCompare(b));
  const folders = Array.from(
    new Set([
      ...virtualFolders,
      ...files.flatMap((path) => {
        const parts = path.split("/").filter(Boolean).slice(0, -1);
        return parts.map(
          (_, index) => `/${parts.slice(0, index + 1).join("/")}`,
        );
      }),
    ]),
  ).sort((a, b) => a.localeCompare(b));

  const beginCreate = () => {
    setEditMode({ type: "create" });
    setPathValue("/");
    setError("");
  };
  const beginCreateFolder = () => {
    setEditMode({ type: "folder" });
    setPathValue("/");
    setError("");
  };
  const beginRename = (path) => {
    setEditMode({ type: "rename", path });
    setPathValue(path);
    setError("");
  };
  const cancelEdit = () => {
    setEditMode(null);
    setPathValue("");
    setError("");
  };
  const savePath = () => {
    const nextPath = `/${pathValue.trim().replace(/^\/+/, "")}`;
    if (nextPath === "/" || nextPath.endsWith("/"))
      return setError(
        editMode?.type === "folder"
          ? "Enter a folder name."
          : "Enter a file name with an extension.",
      );
    if (editMode?.type === "folder") {
      if (folders.includes(nextPath))
        return setError("This folder already exists.");
      setVirtualFolders((current) => [...current, nextPath]);
      setExpandedFolders((current) => new Set([...current, nextPath]));
      cancelEdit();
      return;
    }
    if (sandpack.files[nextPath] && nextPath !== editMode?.path)
      return setError("A file with this path already exists.");
    if (editMode?.type === "create") {
      sandpack.addFile(nextPath, "", false);
    } else if (editMode?.type === "rename") {
      const source = sandpack.files[editMode.path]?.code || "";
      sandpack.addFile(nextPath, source, false);
      sandpack.deleteFile(editMode.path, false);
    }
    requestAnimationFrame(() => sandpack.setActiveFile(nextPath));
    onFileSelect?.();
    cancelEdit();
  };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "file") {
      sandpack.deleteFile(deleteTarget.path, false);
      if (sandpack.activeFile === deleteTarget.path)
        requestAnimationFrame(() =>
          sandpack.setActiveFile(
            files.find((file) => file !== deleteTarget.path),
          ),
        );
    } else {
      const prefix = `${deleteTarget.path}/`;
      const remaining = files.find((file) => !file.startsWith(prefix));
      if (!remaining) {
        setDeleteTarget(null);
        setError("A project must keep at least one file.");
        return;
      }
      files
        .filter((file) => file.startsWith(prefix))
        .forEach((file) => sandpack.deleteFile(file, false));
      setVirtualFolders((current) =>
        current.filter(
          (folder) =>
            folder !== deleteTarget.path && !folder.startsWith(prefix),
        ),
      );
      if (sandpack.activeFile.startsWith(prefix))
        requestAnimationFrame(() => sandpack.setActiveFile(remaining));
    }
    setDeleteTarget(null);
  };
  const toggleFolder = (path) =>
    setExpandedFolders((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  const ancestorsAreExpanded = (path, isFolder = false) => {
    const parts = path.split("/").filter(Boolean);
    const ancestorCount = isFolder ? parts.length - 1 : parts.length - 1;
    for (let index = 1; index <= ancestorCount; index++) {
      const ancestor = `/${parts.slice(0, index).join("/")}`;
      if (ancestor !== path && !expandedFolders.has(ancestor)) return false;
    }
    return true;
  };
  const entries = [
    ...folders.map((path) => ({ type: "folder", path })),
    ...files.map((path) => ({ type: "file", path })),
  ].sort(
    (a, b) => a.path.localeCompare(b.path) || (a.type === "folder" ? -1 : 1),
  );

  return (
    <aside
      className={`flex h-full min-h-0 flex-col border-r transition-colors ${
        isDark ? "border-zinc-800 bg-[#181818]" : "border-zinc-200 bg-[#f8f8f8]"
      }`}
      aria-label="Project file explorer"
    >
      <div
        className={`flex h-10 items-center justify-between border-b px-2 ${
          isDark ? "border-zinc-800" : "border-zinc-200"
        }`}
      >
        <span
          className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-wider ${
            isDark ? "text-zinc-400" : "text-zinc-500"
          }`}
        >
          <FolderTree className="h-3.5 w-3.5" />
          Explorer
        </span>
        <div className="flex">
          <button
            type="button"
            onClick={beginCreate}
            className={`rounded p-1.5 transition ${
              isDark
                ? "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
            }`}
            title="Create file"
            aria-label="Create file"
          >
            <FilePlus2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={beginCreateFolder}
            className={`rounded p-1.5 transition ${
              isDark
                ? "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
            }`}
            title="Create folder"
            aria-label="Create folder"
          >
            <FolderPlus className="h-4 w-4" />
          </button>
        </div>
      </div>
      {editMode && (
        <div
          className={`border-b p-2 ${
            isDark ? "border-zinc-800" : "border-zinc-200"
          }`}
        >
          <div className="flex gap-1">
            <input
              autoFocus
              value={pathValue}
              onChange={(event) => setPathValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") savePath();
                if (event.key === "Escape") cancelEdit();
              }}
              className={`min-w-0 flex-1 rounded border px-2 py-1.5 font-mono text-[11px] outline-none ${
                isDark
                  ? "border-blue-500 bg-zinc-950 text-white"
                  : "border-blue-500 bg-white text-zinc-900"
              }`}
              aria-label={
                editMode.type === "create"
                  ? "New file path"
                  : "Rename file path"
              }
            />
            <button
              type="button"
              onClick={savePath}
              className="rounded bg-blue-600 p-1.5 text-white"
              title="Save"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className={`rounded p-1.5 ${
                isDark
                  ? "bg-zinc-800 text-zinc-300"
                  : "bg-zinc-200 text-zinc-700"
              }`}
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {error && (
            <p className="mt-1.5 text-[10px] font-semibold text-red-500">
              {error}
            </p>
          )}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        {entries.map((entry) => {
          const depth = entry.path.split("/").filter(Boolean).length - 1;
          const name = entry.path.split("/").filter(Boolean).pop();
          if (!ancestorsAreExpanded(entry.path, entry.type === "folder"))
            return null;
          if (entry.type === "folder") {
            const expanded = expandedFolders.has(entry.path);
            return (
              <div
                key={`folder-${entry.path}`}
                className={`group flex items-center gap-1 pr-1 ${
                  isDark ? "hover:bg-zinc-800/70" : "hover:bg-zinc-200/70"
                }`}
                style={{ paddingLeft: `${depth * 12 + 4}px` }}
              >
                <button
                  type="button"
                  onClick={() => toggleFolder(entry.path)}
                  className={`flex min-w-0 flex-1 items-center gap-1.5 py-2 text-left font-mono text-[11px] ${
                    isDark ? "text-zinc-300" : "text-zinc-700"
                  }`}
                  aria-expanded={expanded}
                >
                  <span className={isDark ? "text-zinc-500" : "text-zinc-400"}>
                    {expanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </span>
                  {expanded ? (
                    <FolderOpen className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                  ) : (
                    <Folder className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                  )}
                  <span className="truncate">{name}</span>
                </button>
                <div className="hidden shrink-0 items-center group-hover:flex group-focus-within:flex">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode({ type: "create" });
                      setPathValue(`${entry.path}/`);
                      setError("");
                      setExpandedFolders(
                        (current) => new Set([...current, entry.path]),
                      );
                    }}
                    className={`rounded p-1 transition ${
                      isDark
                        ? "text-zinc-400 hover:bg-zinc-700 hover:text-white"
                        : "text-zinc-600 hover:bg-zinc-300 hover:text-zinc-900"
                    }`}
                    title={`Create file in ${entry.path}`}
                  >
                    <FilePlus2 className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({ type: "folder", path: entry.path })
                    }
                    className="rounded p-1 text-zinc-400 hover:bg-red-500/20 hover:text-red-500"
                    title={`Delete ${entry.path}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          }
          const isActive = sandpack.activeFile === entry.path;
          return (
            <div
              key={entry.path}
              className={`group flex items-center gap-1 pr-1 ${
                isActive
                  ? isDark
                    ? "bg-[#37373d]"
                    : "bg-[#e4e4e7]"
                  : isDark
                    ? "hover:bg-zinc-800/70"
                    : "hover:bg-zinc-200/70"
              }`}
              style={{ paddingLeft: `${depth * 12 + 20}px` }}
            >
              <button
                type="button"
                onClick={() => {
                  sandpack.setActiveFile(entry.path);
                  onFileSelect?.();
                }}
                className={`flex min-w-0 flex-1 items-center gap-2 py-2 text-left font-mono text-[11px] ${
                  isActive
                    ? isDark
                      ? "font-bold text-white"
                      : "font-bold text-zinc-950"
                    : isDark
                      ? "text-zinc-300"
                      : "text-zinc-700"
                }`}
              >
                <FileCode2 className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                <span className="truncate" title={entry.path}>
                  {name}
                </span>
              </button>
              <div className="hidden shrink-0 items-center group-hover:flex group-focus-within:flex">
                <button
                  type="button"
                  onClick={() => beginRename(entry.path)}
                  className={`rounded p-1 transition ${
                    isDark
                      ? "text-zinc-400 hover:bg-zinc-700 hover:text-white"
                      : "text-zinc-600 hover:bg-zinc-300 hover:text-zinc-900"
                  }`}
                  title={`Rename ${entry.path}`}
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    files.length === 1
                      ? setError("A project must keep at least one file.")
                      : setDeleteTarget({ type: "file", path: entry.path })
                  }
                  className="rounded p-1 text-zinc-400 hover:bg-red-500/20 hover:text-red-500"
                  title={`Delete ${entry.path}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {!editMode && error && (
        <p
          className={`border-t p-2 text-[10px] font-semibold text-red-500 ${
            isDark ? "border-zinc-800" : "border-zinc-200"
          }`}
        >
          {error}
        </p>
      )}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-file-title"
        >
          <div
            className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl ${
              isDark
                ? "border-zinc-700 bg-zinc-900 text-white"
                : "border-zinc-300 bg-white text-zinc-900"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <Trash2 className="h-5 w-5" />
            </div>
            <h3 id="delete-file-title" className="mt-4 text-base font-black">
              Delete {deleteTarget.type}?
            </h3>
            <p
              className={`mt-2 text-sm leading-relaxed ${
                isDark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              This will remove{" "}
              <span className="font-mono font-bold">{deleteTarget.path}</span>
              {deleteTarget.type === "folder"
                ? " and every file inside it"
                : ""}
              . Reset can restore starter files, but newly created work cannot
              be recovered.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  isDark
                    ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                    : "bg-zinc-200 text-zinc-800 hover:bg-zinc-300"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

const PANELS = [
  { id: "code", label: "Code", icon: Code2 },
  { id: "preview", label: "Preview", icon: Monitor },
  { id: "console", label: "Console", icon: Terminal },
  { id: "files", label: "Files", icon: FolderTree },
];

function Workspace({
  language,
  languageOptions,
  onLanguageChange,
  title,
  editorTheme,
  onThemeChange,
  fillViewport = false,
  playgroundId,
  starterFiles,
  testCases = [],
}) {
  const [panel, setPanel] = useState("code");
  const [split, setSplit] = useState(50);
  const [outputSplit, setOutputSplit] = useState(68);
  const [fontSize, setFontSize] = useState(14);
  const [fullscreen, setFullscreen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [resizeAxis, setResizeAxis] = useState(null);
  const [runtimeIssue, setRuntimeIssue] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [shareStatus, setShareStatus] = useState("");
  const [device, setDevice] = useState("desktop");
  const [resetOpen, setResetOpen] = useState(false);
  const [tests, setTests] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [customOutput, setCustomOutput] = useState("");
  const [smartError, setSmartError] = useState(null);
  const [formatting, setFormatting] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [previewBusy, setPreviewBusy] = useState(false);
  const restoredRef = useRef(false);
  const restoreStartedRef = useRef(false);
  const saveTimerRef = useRef(null);
  const saveIdleRef = useRef(null);
  const previewTimerRef = useRef(null);
  const workspaceRef = useRef(null);
  const splitRef = useRef(null);
  const outputRef = useRef(null);
  const resizeRef = useRef(null);
  const resizeFrameRef = useRef(null);
  const { sandpack, listen } = useSandpack();
  const consoleFirst = ["javascript", "typescript"].includes(language);
  const isDark = editorTheme === "dark";
  const unsupportedIssue = useMemo(() => unsupportedFeedback(sandpack.files), [sandpack.files]);

  useEffect(() => listen((message) => {
    const raw = message?.error?.message || message?.message || message?.title;
    if ((message?.type === "action" && message?.action === "show-error") || message?.type === "error") setSmartError(explainError(raw || JSON.stringify(message.error || message)));
    if (message?.type === "success" || message?.type === "done") { clearTimeout(previewTimerRef.current); setSmartError(null); setPreviewBusy(false); }
  }), [listen]);

  useEffect(() => {
    if (restoreStartedRef.current) return;
    restoreStartedRef.current = true;
    async function restore() {
      try {
        const shared = await decodeShareState(new URLSearchParams(window.location.search).get("share"));
        const sharedFiles = shared?.language === language ? shared.files : null;
        Object.keys(sandpack.files).forEach((path) => {
          const saved = localStorage.getItem(storageKey(playgroundId, language, path));
          const value = sharedFiles?.[path] ?? saved;
          if (value != null) sandpack.updateFile(path, value);
        });
      } catch { /* Ignore malformed or unavailable stored state. */ }
      finally { restoredRef.current = true; setRestoring(false); }
    }
    restore();
  }, [language, playgroundId, sandpack]);

  useEffect(() => {
    if (!restoredRef.current) return;
    setSaveStatus("Saving...");
    if (!["javascript", "typescript", "nextjs"].includes(language)) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = setTimeout(() => {
        setPreviewBusy(true);
        previewTimerRef.current = setTimeout(() => setPreviewBusy(false), 2500);
      }, 120);
    }
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const save = () => {
        Object.entries(sandpack.files).forEach(([path, file]) => localStorage.setItem(storageKey(playgroundId, language, path), file.code));
        if (playgroundId && playgroundId !== "scratch") localStorage.setItem(RECENT_PRACTICE_KEY, JSON.stringify({ id: playgroundId, language, title, href: window.location.pathname, editedAt: Date.now() }));
        setSaveStatus("Saved");
      };
      saveIdleRef.current = "requestIdleCallback" in window ? window.requestIdleCallback(save, { timeout: 1000 }) : window.setTimeout(save, 0);
    }, 500);
    return () => {
      clearTimeout(saveTimerRef.current);
      if (saveIdleRef.current != null) {
        if ("cancelIdleCallback" in window) window.cancelIdleCallback(saveIdleRef.current); else clearTimeout(saveIdleRef.current);
      }
    };
  }, [sandpack.files, language, playgroundId, title]);

  const formatActive = useCallback(async () => {
    if (formatting) return;
    const path = sandpack.activeFile || Object.keys(sandpack.files)[0];
    setFormatting(true);
    try {
      const formatted = await formatSource(sandpack.files[path]?.code || "", path);
      sandpack.updateFile(path, formatted);
    } catch (error) {
      setSmartError(explainError(error?.message || "The active file could not be formatted."));
    } finally {
      setFormatting(false);
    }
  }, [formatting, sandpack]);

  const share = async () => {
    try {
      const files = Object.fromEntries(Object.entries(sandpack.files).map(([path, file]) => [path, file.code]));
      const encoded = await encodeShareState({ language, files, playgroundId });
      const url = new URL(window.location.href); url.searchParams.set("share", encoded);
      await navigator.clipboard.writeText(url.toString());
      setShareStatus("Link copied"); setTimeout(() => setShareStatus(""), 2000);
    } catch { setShareStatus("Could not copy link"); }
  };

  const hasSubstantialChanges = () => Object.entries(sandpack.files).some(([path, file]) => {
    const original = starterFiles[path]?.code ?? starterFiles[path] ?? "";
    return Math.abs(file.code.length - String(original).length) > 20 || (file.code !== original && file.code.split("\n").length > 3);
  });
  const reset = () => { if (hasSubstantialChanges()) setResetOpen(true); else sandpack.resetAllFiles(); };
  const confirmReset = () => { Object.keys(sandpack.files).forEach((path) => localStorage.removeItem(storageKey(playgroundId, language, path))); sandpack.resetAllFiles(); setResetOpen(false); };

  const runTests = () => {
    const source = sandpack.files["/index.js"]?.code || "";
    const results = testCases.map((test) => {
      try { const fn = new Function(`${source}\n;return typeof ${test.functionName} === "function" ? ${test.functionName} : null;`)(); const received = fn ? fn(...test.args) : undefined; return { ...test, received, passed: JSON.stringify(received) === JSON.stringify(test.expected) }; }
      catch (error) { return { ...test, received: error.message, passed: false }; }
    });
    setTests(results); setPanel("tests");
  };
  const runCustom = () => {
    try { const source = sandpack.files["/index.js"]?.code || ""; const first = testCases[0]; const fn = new Function(`${source}\n;return ${first.functionName};`)(); const input = JSON.parse(customInput); setCustomOutput(JSON.stringify(fn(...(Array.isArray(input) && first.spreadInput ? input : [input])))); }
    catch (error) { setCustomOutput(error.message); }
  };

  const activeFileName = (sandpack.activeFile || "")
    .split("/")
    .filter(Boolean)
    .pop();

  useEffect(() => {
    const handleFullscreen = () =>
      setFullscreen(document.fullscreenElement === workspaceRef.current);
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreen);
  }, []);

  useEffect(() => {
    const runShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        executeCurrentFiles(sandpack);
        setPanel(consoleFirst ? "console" : "preview");
      } else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "f") {
        event.preventDefault(); formatActive();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault(); setSaveStatus("Saving...");
      }
    };
    window.addEventListener("keydown", runShortcut);
    return () => window.removeEventListener("keydown", runShortcut);
  }, [consoleFirst, formatActive, sandpack]);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await workspaceRef.current?.requestFullscreen();
  };

  const startResize = (axis, event) => {
    event.preventDefault();
    const bounds = (
      axis === "horizontal" ? splitRef.current : outputRef.current
    )?.getBoundingClientRect();
    if (!bounds) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeRef.current = {
      axis,
      bounds,
      pointerId: event.pointerId,
      target: event.currentTarget,
    };
    setResizeAxis(axis);
    document.body.style.cursor =
      axis === "horizontal" ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";
  };

  const moveResize = (event) => {
    const drag = resizeRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const clientX = event.clientX;
    const clientY = event.clientY;
    if (resizeFrameRef.current) cancelAnimationFrame(resizeFrameRef.current);
    resizeFrameRef.current = requestAnimationFrame(() => {
      if (drag.axis === "horizontal") {
        setSplit(
          Math.min(
            75,
            Math.max(
              25,
              ((clientX - drag.bounds.left) / drag.bounds.width) * 100,
            ),
          ),
        );
      } else {
        setOutputSplit(
          Math.min(
            82,
            Math.max(
              30,
              ((clientY - drag.bounds.top) / drag.bounds.height) * 100,
            ),
          ),
        );
      }
    });
  };

  const stopResize = (event) => {
    const drag = resizeRef.current;
    if (
      !drag ||
      (event?.pointerId != null && drag.pointerId !== event.pointerId)
    )
      return;
    resizeRef.current = null;
    if (resizeFrameRef.current) cancelAnimationFrame(resizeFrameRef.current);
    resizeFrameRef.current = null;
    if (drag.target?.hasPointerCapture?.(drag.pointerId))
      drag.target.releasePointerCapture(drag.pointerId);
    setResizeAxis(null);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  useEffect(
    () => () => {
      if (resizeFrameRef.current) cancelAnimationFrame(resizeFrameRef.current);
      clearTimeout(previewTimerRef.current);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    },
    [],
  );

  const activePanels = PANELS.filter(
    (item) => !(consoleFirst && item.id === "preview"),
  );
  if (testCases.length && !activePanels.some((item) => item.id === "tests")) activePanels.push({ id: "tests", label: "Tests", icon: Check });

  return (
    <div
      ref={workspaceRef}
      data-editor-theme={editorTheme}
      className={`asif-playground relative flex flex-col overflow-hidden border shadow-2xl transition-colors ${
        isDark
          ? "border-[#3c3c3c] bg-[#1e1e1e] text-white"
          : "border-zinc-300 bg-white text-zinc-900"
      } ${
        fullscreen
          ? "fixed inset-0 z-100 h-screen rounded-none"
          : fillViewport
            ? "h-[calc(100dvh-130px)] min-h-120 rounded-2xl sm:rounded-3xl"
            : "min-h-115 h-[68vh] max-h-175 lg:h-130 rounded-2xl sm:rounded-3xl"
      }`}
    >
      {resizeAxis && (
        <div
          className={`pointer-events-none absolute inset-0 z-50 ${
            resizeAxis === "horizontal"
              ? "cursor-col-resize"
              : "cursor-row-resize"
          }`}
          aria-hidden="true"
        />
      )}

      {/* Top Header Toolbar */}
      <Toolbar
        title={title}
        language={language}
        languageOptions={languageOptions}
        onLanguageChange={onLanguageChange}
        onSelect={(value) =>
          setPanel(consoleFirst && value === "preview" ? "console" : value)
        }
        fullscreen={fullscreen}
        onFullscreen={toggleFullscreen}
        fontSize={fontSize}
        setFontSize={setFontSize}
        editorTheme={editorTheme}
        onThemeChange={onThemeChange}
        onResetLayout={() => {
          setSplit(50);
          setOutputSplit(68);
          setExplorerOpen(true);
        }}
        explorerOpen={explorerOpen}
        onToggleExplorer={() => setExplorerOpen((value) => !value)}
        onRuntimeIssue={setRuntimeIssue}
        onFormat={formatActive}
        onReset={reset}
        onShare={share}
        shareStatus={shareStatus}
        saveStatus={saveStatus}
        formatting={formatting}
      />

      {restoring && <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/75 backdrop-blur-sm" role="status" aria-live="polite"><div className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-bold text-white shadow-xl"><Loader2 className="h-4 w-4 animate-spin" />Restoring your code...</div></div>}

      {/* Mobile App Segmented Tab Navigation (< 1024px) */}
      <nav
        aria-label="Editor panels"
        className={`flex shrink-0 items-center justify-around border-b p-1 transition-colors lg:hidden ${
          isDark
            ? "border-zinc-800 bg-[#161616]"
            : "border-zinc-200 bg-[#f8f8f8]"
        }`}
      >
        {activePanels.map(({ id, label, icon: Icon }) => {
          const isActive = panel === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPanel(id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : isDark
                    ? "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                    : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
              {id === "code" && activeFileName && (
                <span className="hidden max-w-16.25 truncate text-[10px] font-normal opacity-80 xs:inline">
                  ({activeFileName})
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Main Workspace area */}
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
            explorerOpen
              ? "lg:grid-cols-[190px_minmax(0,1fr)]"
              : "lg:grid-cols-1"
          }`}
        >
          <div
            className={`${
              panel === "files" ? "block" : "hidden"
            } h-full min-h-0 ${explorerOpen ? "lg:block" : "lg:hidden"}`}
          >
            <FileExplorer
              isDark={isDark}
              onFileSelect={() => setPanel("code")}
            />
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
            isDark
              ? "border-zinc-800 bg-zinc-900"
              : "border-zinc-300 bg-zinc-200"
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
          {!consoleFirst && (
            <div
              className={`${
                panel === "preview" ? "flex flex-1" : "hidden"
              } relative min-h-0 overflow-hidden lg:block`}
            >
              {previewBusy && <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-white/65 backdrop-blur-[1px] dark:bg-zinc-950/65" role="status" aria-live="polite"><span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-2 text-xs font-bold text-white shadow-lg"><Loader2 className="h-3.5 w-3.5 animate-spin" />Updating preview...</span></div>}
              <div className="absolute right-2 top-2 z-30 flex gap-1 rounded-lg bg-zinc-950/80 p-1 text-white backdrop-blur" aria-label="Preview size">
                {[['desktop','Desktop'],['tablet','Tablet'],['mobile','Mobile']].map(([value,label]) => <button key={value} type="button" onClick={() => setDevice(value)} className={`rounded px-2 py-1 text-[10px] font-bold ${device === value ? 'bg-blue-600' : 'hover:bg-zinc-700'}`} aria-pressed={device === value}>{label}</button>)}
                <button type="button" onClick={() => { const client = Object.values(sandpack.clients || {})[0]; const url = client?.iframe?.src; if (url) window.open(url, "_blank", "noopener,noreferrer"); }} className="rounded px-2 py-1 hover:bg-zinc-700" aria-label="Open preview separately" title="Open Preview"><ExternalLink className="h-3.5 w-3.5" /></button>
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
                <div className="mx-auto h-full max-w-full transition-[width]" style={{ width: device === "mobile" ? 375 : device === "tablet" ? 768 : "100%" }}>
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
            <BetterConsole
              standalone={consoleFirst}
            />
          </div>
          <div className={`${panel === "tests" ? "block" : "hidden"} absolute inset-0 z-40 overflow-auto bg-inherit p-4`} aria-live="polite">
            <div className="flex items-center justify-between"><h3 className="font-black">Tests</h3><button type="button" onClick={runTests} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Run tests</button></div>
            {!tests.length ? <p className="mt-6 text-sm text-zinc-500">Run your solution to check the test cases.</p> : <div className="mt-4 space-y-3">{tests.map((test,index) => <div key={index} className={`rounded-xl border p-3 text-xs ${test.passed ? "border-emerald-500/40" : "border-red-500/40"}`}><p className="font-black">{test.passed ? "✓" : "✕"} Test {index + 1} {test.passed ? "passed" : "failed"}</p>{!test.passed && <dl className="mt-2 grid gap-1 font-mono"><dt>Input:</dt><dd>{JSON.stringify(test.args)}</dd><dt>Expected:</dt><dd>{JSON.stringify(test.expected)}</dd><dt>Received:</dt><dd>{JSON.stringify(test.received)}</dd></dl>}</div>)}<p className="font-black">{tests.filter((test) => test.passed).length} / {tests.length} passed</p></div>}
            {testCases.length > 0 && <div className="mt-6 border-t border-zinc-700 pt-4"><h3 className="font-black">Custom Test</h3><label className="mt-2 block text-xs">Input<textarea value={customInput} onChange={(event) => setCustomInput(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-700 bg-transparent p-2 font-mono" placeholder='"hello"' /></label><button type="button" onClick={runCustom} className="mt-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white">Run Test</button>{customOutput && <div className="mt-3"><p className="text-xs font-bold">Output</p><pre className="mt-1 whitespace-pre-wrap rounded-lg bg-black/20 p-2">{customOutput}</pre></div>}</div>}
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

      {(smartError || unsupportedIssue) && <div className="shrink-0 border-t border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs" role="alert" aria-live="assertive">{unsupportedIssue ? <p className="font-bold">{unsupportedIssue}</p> : <><p className="font-mono font-bold">{smartError.original}</p>{smartError.file && <p className="mt-1">{smartError.file}:{smartError.line}:{smartError.column}</p>}<p className="mt-2"><strong>What happened:</strong> {smartError.explanation}</p><p className="mt-1"><strong>Likely reason:</strong> {smartError.reason}</p><p className="mt-1"><strong>Possible fix:</strong> {smartError.suggestion}</p></>}</div>}

      {resetOpen && <div className="absolute inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="reset-title"><div className={`max-w-sm rounded-2xl border p-5 shadow-2xl ${isDark ? "border-zinc-700 bg-zinc-900" : "border-zinc-200 bg-white"}`}><h2 id="reset-title" className="font-black">Reset code?</h2><p className="mt-2 text-sm opacity-75">Your current changes will be replaced with the starter code.</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setResetOpen(false)} className="rounded-lg px-3 py-2 text-sm font-bold">Cancel</button><button type="button" onClick={confirmReset} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white">Reset</button></div></div></div>}

      {/* Footer Info Bar with asif.to Branding */}
      <div
        className={`flex shrink-0 items-center justify-between gap-3 border-t px-3 py-1.5 text-[11px] transition-colors sm:px-4 ${
          isDark
            ? "border-zinc-800 bg-[#181818] text-zinc-400"
            : "border-zinc-200 bg-[#f8f8f8] text-zinc-600"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="flex shrink-0 items-center gap-1.5">
            <img
              src="/logo.png"
              alt="asif.to"
              className="h-3.5 w-3.5 rounded object-contain"
            />
            <span className="font-bold">asif.to</span>
          </span>
          <span className="opacity-40">•</span>
          <span className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <span className="truncate">Isolated sandbox</span>
          </span>
          <span aria-live="polite">{activeFileName || "File"} · {saveStatus}</span>
        </div>
        <span className="hidden font-mono sm:inline">
          Ctrl/⌘ + Enter to run
        </span>
      </div>

      <style jsx global>{`
        .asif-playground .sp-console-item::after {
          display: none !important;
        }
        .asif-playground .sp-console-item {
          border: 0 !important;
          padding-block: 6px !important;
        }
        .asif-playground[data-editor-theme="dark"] .sp-console-list {
          background: #1e1e1e !important;
          color: #d4d4d4 !important;
        }
        .asif-playground[data-editor-theme="light"] .sp-console-list {
          background: #ffffff !important;
          color: #1f1f1f !important;
        }
        .asif-playground[data-editor-theme="dark"] .cm-activeLine {
          background: #2a2d2e !important;
        }
        .asif-playground[data-editor-theme="dark"] .cm-gutters {
          background: #1e1e1e !important;
          border-right: 1px solid #333 !important;
        }
        .asif-playground[data-editor-theme="dark"] .cm-selectionBackground,
        .asif-playground[data-editor-theme="dark"] .cm-content ::selection {
          background: #264f78 !important;
          color: #ffffff !important;
        }
        .asif-playground * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .asif-playground *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .asif-playground .cm-scroller,
        .asif-playground .sp-console-list,
        .asif-playground .sp-preview-container {
          overflow: auto !important;
        }
        .asif-playground[data-editor-theme="light"] .cm-activeLine {
          background: #f0f0f0 !important;
        }
        .asif-playground[data-editor-theme="light"] .cm-gutters {
          background: #ffffff !important;
          border-right-color: #e5e5e5 !important;
        }
        .asif-playground[data-editor-theme="light"] .cm-selectionBackground,
        .asif-playground[data-editor-theme="light"] .cm-content ::selection {
          background: #add6ff !important;
          color: #111111 !important;
        }
        @media (min-width: 1024px) {
          .asif-playground .playground-output-split {
            display: grid !important;
            grid-template-rows: minmax(0, var(--preview-size)) 8px minmax(
                0,
                calc(100% - var(--preview-size) - 8px)
              );
          }
        }
      `}</style>
    </div>
  );
}

export default function InteractiveCodeSandbox({
  language = "javascript",
  languageOptions,
  onLanguageChange,
  code,
  files,
  title,
  fillViewport = false,
  playgroundId,
  testCases = [],
}) {
  const [editorTheme, setEditorTheme] = useState("dark");
  const initialFiles = useMemo(
    () => normalizeFiles(language, code, files),
    [language, code, files],
  );
  const stablePlaygroundId = useMemo(() => {
    if (playgroundId) return playgroundId;
    const signature = `${title || "playground"}:${language}:${Object.entries(initialFiles).map(([path, value]) => `${path}:${value.code ?? value}`).join("|")}`;
    let hash = 0; for (let index = 0; index < signature.length; index += 1) hash = ((hash << 5) - hash + signature.charCodeAt(index)) | 0;
    return `${String(title || "playground").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.abs(hash)}`;
  }, [initialFiles, language, playgroundId, title]);

  return (
    <SandpackProvider
      key={`${language}-${Object.keys(initialFiles).join("-")}`}
      template={sandpackTemplateFor(language)}
      files={initialFiles}
      theme={editorTheme === "dark" ? VSCODE_DARK_THEME : VSCODE_LIGHT_THEME}
      options={{
        autorun: !["javascript", "typescript", "nextjs"].includes(language),
        recompileMode: "delayed",
        recompileDelay: 500,
      }}
    >
      <Workspace
        language={language}
        languageOptions={languageOptions}
        onLanguageChange={onLanguageChange}
        title={title}
        editorTheme={editorTheme}
        onThemeChange={() =>
          setEditorTheme((value) => (value === "dark" ? "light" : "dark"))
        }
        fillViewport={fillViewport}
        playgroundId={stablePlaygroundId}
        starterFiles={initialFiles}
        testCases={testCases}
      />
    </SandpackProvider>
  );
}
