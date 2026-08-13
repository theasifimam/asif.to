"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight, Copy, Download, Expand, FileCode2, FilePlus2, Folder, FolderOpen, FolderPlus, FolderTree, GripHorizontal, GripVertical, Loader2, Maximize2, Minimize2, Minus, Moon, MoreHorizontal, PanelLeftClose, PanelLeftOpen, Pencil, Play, Plus, RotateCcw, ShieldCheck, Sun, Terminal, Trash2, Monitor, Code2, X } from "lucide-react";
import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { sandpackTemplateFor } from "@/lib/playground/config";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const VSCODE_DARK_THEME = {
  colors: {
    surface1: "#1e1e1e",
    surface2: "#252526",
    surface3: "#333333",
    clickable: "#cccccc",
    base: "#9d9d9d",
    disabled: "#666666",
    hover: "#ffffff",
    accent: "#007acc",
    error: "#f48771",
    errorSurface: "#3c1f1e",
  },
  syntax: {
    plain: "#d4d4d4",
    comment: { color: "#6a9955", fontStyle: "italic" },
    keyword: "#c586c0",
    tag: "#569cd6",
    punctuation: "#d4d4d4",
    definition: "#dcdcaa",
    property: "#9cdcfe",
    static: "#4ec9b0",
    string: "#ce9178",
  },
  font: {
    body: "Inter, system-ui, sans-serif",
    mono: "Consolas, 'Cascadia Code', 'Fira Code', monospace",
    size: "14px",
    lineHeight: "1.6",
  },
};

const VSCODE_LIGHT_THEME = {
  colors: {
    surface1: "#ffffff", surface2: "#f3f3f3", surface3: "#e5e5e5",
    clickable: "#3b3b3b", base: "#616161", disabled: "#a0a0a0",
    hover: "#111111", accent: "#0066b8", error: "#a1260d", errorSurface: "#fff1f0",
  },
  syntax: {
    plain: "#1f1f1f", comment: { color: "#008000", fontStyle: "italic" },
    keyword: "#af00db", tag: "#800000", punctuation: "#1f1f1f",
    definition: "#795e26", property: "#001080", static: "#267f99", string: "#a31515",
  },
  font: VSCODE_DARK_THEME.font,
};

async function executeCurrentFiles(sandpack) {
  const clients = Object.values(sandpack.clients || {});
  if (sandpack.status !== "running" || clients.length === 0) {
    await sandpack.runSandpack();
    return;
  }

  await Promise.all(
    clients.map((client) =>
      client.updateSandbox({
        files: sandpack.files,
        template: sandpack.environment,
      }),
    ),
  );
}

function normalizeFiles(language, code, files) {
  const normalized = files ? { ...files } : null;
  if (normalized && !["react", "nextjs", "javascript"].includes(language) && normalized["/index.html"]) {
    let html = normalized["/index.html"];
    if (normalized["/style.css"] && !html.includes("style.css")) html = `<link rel="stylesheet" href="/style.css">\n${html}`;
    if (normalized["/index.js"] && !html.includes("index.js")) html += `\n<script type="module" src="/index.js"></script>`;
    if (!html.includes("data-asif-hidden-scrollbars")) html += `\n<style data-asif-hidden-scrollbars>html,body{scrollbar-width:none;-ms-overflow-style:none}html::-webkit-scrollbar,body::-webkit-scrollbar,*::-webkit-scrollbar{display:none;width:0;height:0}</style>`;
    normalized["/index.html"] = html;
  }
  if (normalized) return normalized;
  if (language === "react") return { "/App.js": code || "" };
  if (language === "typescript") return { "/index.ts": code || "" };
  if (language === "react-typescript") return { "/App.tsx": code || "" };
  if (language === "nextjs") return { "/pages/index.js": code || "" };
  if (language === "html") return { "/index.html": `${code || ""}\n<style data-asif-hidden-scrollbars>html,body{scrollbar-width:none;-ms-overflow-style:none}html::-webkit-scrollbar,body::-webkit-scrollbar,*::-webkit-scrollbar{display:none;width:0;height:0}</style>`, "/style.css": "", "/index.js": "" };
  if (language === "css") return { "/index.html": '<div class="preview">Edit the CSS</div>', "/style.css": code || "", "/index.js": "" };
  return { "/index.js": code || "" };
}

function Toolbar({ title, onSelect, fullscreen, onFullscreen, fontSize, setFontSize, editorTheme, onThemeChange, onResetLayout, explorerOpen, onToggleExplorer }) {
  const { sandpack, listen } = useSandpack();
  const [copied, setCopied] = useState(false);
  const [executing, setExecuting] = useState(false);
  const executionTimeoutRef = useRef(null);

  useEffect(() => {
    const unsubscribe = listen((message) => {
      if (message.type === "done" || message.type === "success" || (message.type === "action" && message.action === "show-error")) {
        setExecuting(false);
        if (executionTimeoutRef.current) clearTimeout(executionTimeoutRef.current);
      }
    });
    return () => {
      unsubscribe();
      if (executionTimeoutRef.current) clearTimeout(executionTimeoutRef.current);
    };
  }, [listen]);

  const run = async () => {
    if (executing) return;
    setExecuting(true);
    onSelect("preview");
    if (executionTimeoutRef.current) clearTimeout(executionTimeoutRef.current);
    executionTimeoutRef.current = setTimeout(() => setExecuting(false), 30000);
    try {
      await executeCurrentFiles(sandpack);
    } catch {
      setExecuting(false);
      clearTimeout(executionTimeoutRef.current);
    }
  };
  const copy = async () => {
    const source = Object.entries(sandpack.files).map(([name, file]) => `// ${name}\n${file.code}`).join("\n\n");
    await navigator.clipboard.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const download = () => {
    const activePath = sandpack.activeFile || Object.keys(sandpack.files)[0];
    const source = sandpack.files[activePath]?.code || "";
    const filename = activePath.split("/").filter(Boolean).pop() || "index.js";
    const extension = filename.split(".").pop()?.toLowerCase();
    const mimeTypes = { html: "text/html", css: "text/css", js: "text/javascript", jsx: "text/jsx", ts: "text/typescript", tsx: "text/tsx", json: "application/json" };
    const url = URL.createObjectURL(new Blob([source], { type: mimeTypes[extension] || "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950 px-3 py-3 sm:px-4">
      <div className="flex items-center gap-2 text-sm font-black text-white"><button type="button" onClick={onToggleExplorer} className="hidden rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white lg:inline-flex" title={explorerOpen ? "Collapse file explorer" : "Show file explorer"} aria-label={explorerOpen ? "Collapse file explorer" : "Show file explorer"}>{explorerOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}</button><Code2 className="h-4 w-4 text-blue-400" />{title || "Try it yourself"}</div>
      <div className="flex gap-2">
        <button type="button" onClick={run} disabled={executing} className="inline-flex min-w-24 items-center justify-center gap-1.5 rounded-full bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-wait disabled:bg-blue-500/60">{executing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}{executing ? "Executing…" : "Run"}</button>
        <button type="button" onClick={() => sandpack.resetAllFiles()} className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-700"><RotateCcw className="h-3.5 w-3.5" />Reset</button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><button type="button" className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-700" aria-label="Open editor options"><MoreHorizontal className="h-4 w-4" /><span className="hidden sm:inline">Options</span></button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>File actions</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={copy}>{copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy all files"}</DropdownMenuItem>
              <DropdownMenuItem onSelect={download}><Download className="h-4 w-4" />Download active file</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
            <DropdownMenuItem onSelect={onThemeChange}>{editorTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}Use {editorTheme === "dark" ? "light" : "dark"} theme</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFontSize((value) => Math.min(20, value + 1))}><Plus className="h-4 w-4" />Increase text size<span className="ml-auto text-[10px] text-zinc-400">{fontSize}px</span></DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFontSize((value) => Math.max(11, value - 1))}><Minus className="h-4 w-4" />Decrease text size<span className="ml-auto text-[10px] text-zinc-400">{fontSize}px</span></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onResetLayout}><Maximize2 className="h-4 w-4" />Reset panel layout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button type="button" onClick={onFullscreen} className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-700" title={fullscreen ? "Exit fullscreen" : "Open fullscreen"}>{fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Expand className="h-3.5 w-3.5" />}<span className="hidden sm:inline">{fullscreen ? "Exit" : "Full screen"}</span></button>
      </div>
    </div>
  );
}

function FileExplorer() {
  const { sandpack } = useSandpack();
  const [editMode, setEditMode] = useState(null);
  const [pathValue, setPathValue] = useState("");
  const [error, setError] = useState("");
  const [virtualFolders, setVirtualFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(() => new Set());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const files = Object.keys(sandpack.files).sort((a, b) => a.localeCompare(b));
  const folders = Array.from(new Set([...virtualFolders, ...files.flatMap((path) => {
    const parts = path.split("/").filter(Boolean).slice(0, -1);
    return parts.map((_, index) => `/${parts.slice(0, index + 1).join("/")}`);
  })])).sort((a, b) => a.localeCompare(b));

  const beginCreate = () => { setEditMode({ type: "create" }); setPathValue("/"); setError(""); };
  const beginCreateFolder = () => { setEditMode({ type: "folder" }); setPathValue("/"); setError(""); };
  const beginRename = (path) => { setEditMode({ type: "rename", path }); setPathValue(path); setError(""); };
  const cancelEdit = () => { setEditMode(null); setPathValue(""); setError(""); };
  const savePath = () => {
    const nextPath = `/${pathValue.trim().replace(/^\/+/, "")}`;
    if (nextPath === "/" || nextPath.endsWith("/")) return setError(editMode?.type === "folder" ? "Enter a folder name." : "Enter a file name with an extension.");
    if (editMode?.type === "folder") {
      if (folders.includes(nextPath)) return setError("This folder already exists.");
      setVirtualFolders((current) => [...current, nextPath]);
      setExpandedFolders((current) => new Set([...current, nextPath]));
      cancelEdit();
      return;
    }
    if (sandpack.files[nextPath] && nextPath !== editMode?.path) return setError("A file with this path already exists.");
    if (editMode?.type === "create") {
      sandpack.addFile(nextPath, "", false);
    } else if (editMode?.type === "rename") {
      const source = sandpack.files[editMode.path]?.code || "";
      sandpack.addFile(nextPath, source, false);
      sandpack.deleteFile(editMode.path, false);
    }
    requestAnimationFrame(() => sandpack.setActiveFile(nextPath));
    cancelEdit();
  };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "file") {
      sandpack.deleteFile(deleteTarget.path, false);
      if (sandpack.activeFile === deleteTarget.path) requestAnimationFrame(() => sandpack.setActiveFile(files.find((file) => file !== deleteTarget.path)));
    } else {
      const prefix = `${deleteTarget.path}/`;
      const remaining = files.find((file) => !file.startsWith(prefix));
      if (!remaining) {
        setDeleteTarget(null);
        setError("A project must keep at least one file.");
        return;
      }
      files.filter((file) => file.startsWith(prefix)).forEach((file) => sandpack.deleteFile(file, false));
      setVirtualFolders((current) => current.filter((folder) => folder !== deleteTarget.path && !folder.startsWith(prefix)));
      if (sandpack.activeFile.startsWith(prefix)) requestAnimationFrame(() => sandpack.setActiveFile(remaining));
    }
    setDeleteTarget(null);
  };
  const toggleFolder = (path) => setExpandedFolders((current) => {
    const next = new Set(current);
    if (next.has(path)) next.delete(path); else next.add(path);
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
  ].sort((a, b) => a.path.localeCompare(b.path) || (a.type === "folder" ? -1 : 1));

  return <aside className="flex h-full min-h-0 flex-col border-r border-zinc-800 bg-[#181818]" aria-label="Project file explorer">
    <div className="flex h-10 items-center justify-between border-b border-zinc-800 px-2"><span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-zinc-400"><FolderTree className="h-3.5 w-3.5" />Explorer</span><div className="flex"><button type="button" onClick={beginCreate} className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white" title="Create file" aria-label="Create file"><FilePlus2 className="h-4 w-4" /></button><button type="button" onClick={beginCreateFolder} className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white" title="Create folder" aria-label="Create folder"><FolderPlus className="h-4 w-4" /></button></div></div>
    {editMode && <div className="border-b border-zinc-800 p-2"><div className="flex gap-1"><input autoFocus value={pathValue} onChange={(event) => setPathValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") savePath(); if (event.key === "Escape") cancelEdit(); }} className="min-w-0 flex-1 rounded border border-blue-500 bg-zinc-950 px-2 py-1.5 font-mono text-[11px] text-white outline-none" aria-label={editMode.type === "create" ? "New file path" : "Rename file path"} /><button type="button" onClick={savePath} className="rounded bg-blue-600 p-1.5 text-white" title="Save"><Check className="h-3.5 w-3.5" /></button><button type="button" onClick={cancelEdit} className="rounded bg-zinc-800 p-1.5 text-zinc-300" title="Cancel"><X className="h-3.5 w-3.5" /></button></div>{error && <p className="mt-1.5 text-[10px] font-semibold text-red-400">{error}</p>}</div>}
    <div className="min-h-0 flex-1 overflow-y-auto py-1">{entries.map((entry) => {
      const depth = entry.path.split("/").filter(Boolean).length - 1;
      const name = entry.path.split("/").filter(Boolean).pop();
      if (!ancestorsAreExpanded(entry.path, entry.type === "folder")) return null;
      if (entry.type === "folder") {
        const expanded = expandedFolders.has(entry.path);
        return <div key={`folder-${entry.path}`} className="group flex items-center gap-1 pr-1 hover:bg-zinc-800/70" style={{ paddingLeft: `${depth * 12 + 4}px` }}><button type="button" onClick={() => toggleFolder(entry.path)} className="flex min-w-0 flex-1 items-center gap-1.5 py-2 text-left font-mono text-[11px] text-zinc-300" aria-expanded={expanded}><span className="text-zinc-500">{expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}</span>{expanded ? <FolderOpen className="h-3.5 w-3.5 shrink-0 text-amber-400" /> : <Folder className="h-3.5 w-3.5 shrink-0 text-amber-400" />}<span className="truncate">{name}</span></button><div className="hidden shrink-0 items-center group-hover:flex group-focus-within:flex"><button type="button" onClick={() => { setEditMode({ type: "create" }); setPathValue(`${entry.path}/`); setError(""); setExpandedFolders((current) => new Set([...current, entry.path])); }} className="rounded p-1 text-zinc-400 hover:bg-zinc-700 hover:text-white" title={`Create file in ${entry.path}`}><FilePlus2 className="h-3 w-3" /></button><button type="button" onClick={() => setDeleteTarget({ type: "folder", path: entry.path })} className="rounded p-1 text-zinc-400 hover:bg-red-500/20 hover:text-red-400" title={`Delete ${entry.path}`}><Trash2 className="h-3 w-3" /></button></div></div>;
      }
      return <div key={entry.path} className={`group flex items-center gap-1 pr-1 ${sandpack.activeFile === entry.path ? "bg-[#37373d]" : "hover:bg-zinc-800/70"}`} style={{ paddingLeft: `${depth * 12 + 20}px` }}><button type="button" onClick={() => sandpack.setActiveFile(entry.path)} className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left font-mono text-[11px] text-zinc-300"><FileCode2 className="h-3.5 w-3.5 shrink-0 text-blue-400" /><span className="truncate" title={entry.path}>{name}</span></button><div className="hidden shrink-0 items-center group-hover:flex group-focus-within:flex"><button type="button" onClick={() => beginRename(entry.path)} className="rounded p-1 text-zinc-400 hover:bg-zinc-700 hover:text-white" title={`Rename ${entry.path}`}><Pencil className="h-3 w-3" /></button><button type="button" onClick={() => files.length === 1 ? setError("A project must keep at least one file.") : setDeleteTarget({ type: "file", path: entry.path })} className="rounded p-1 text-zinc-400 hover:bg-red-500/20 hover:text-red-400" title={`Delete ${entry.path}`}><Trash2 className="h-3 w-3" /></button></div></div>;
    })}</div>
    {!editMode && error && <p className="border-t border-zinc-800 p-2 text-[10px] font-semibold text-red-400">{error}</p>}
    {deleteTarget && <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-file-title"><div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400"><Trash2 className="h-5 w-5" /></div><h3 id="delete-file-title" className="mt-4 text-base font-black text-white">Delete {deleteTarget.type}?</h3><p className="mt-2 text-sm leading-relaxed text-zinc-400">This will remove <span className="font-mono text-zinc-200">{deleteTarget.path}</span>{deleteTarget.type === "folder" ? " and every file inside it" : ""}. Reset can restore starter files, but newly created work cannot be recovered.</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setDeleteTarget(null)} className="rounded-full bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-700">Cancel</button><button type="button" onClick={confirmDelete} className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700">Delete</button></div></div></div>}
  </aside>;
}

const PANELS = [{ id: "files", label: "Files", icon: FolderTree }, { id: "code", label: "Code", icon: Code2 }, { id: "preview", label: "Preview", icon: Monitor }, { id: "console", label: "Console", icon: Terminal }];

function Workspace({ language, title, editorTheme, onThemeChange, fillViewport = false }) {
  const [panel, setPanel] = useState("code");
  const [split, setSplit] = useState(50);
  const [outputSplit, setOutputSplit] = useState(68);
  const [fontSize, setFontSize] = useState(14);
  const [fullscreen, setFullscreen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [resizeAxis, setResizeAxis] = useState(null);
  const workspaceRef = useRef(null);
  const splitRef = useRef(null);
  const outputRef = useRef(null);
  const resizeRef = useRef(null);
  const resizeFrameRef = useRef(null);
  const { sandpack } = useSandpack();
  const consoleFirst = ["javascript", "typescript"].includes(language);

  useEffect(() => {
    const handleFullscreen = () => setFullscreen(document.fullscreenElement === workspaceRef.current);
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => document.removeEventListener("fullscreenchange", handleFullscreen);
  }, []);

  useEffect(() => {
    const runShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        executeCurrentFiles(sandpack);
        setPanel(consoleFirst ? "console" : "preview");
      }
    };
    window.addEventListener("keydown", runShortcut);
    return () => window.removeEventListener("keydown", runShortcut);
  }, [consoleFirst, sandpack]);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await workspaceRef.current?.requestFullscreen();
  };

  const startResize = (axis, event) => {
    event.preventDefault();
    const bounds = (axis === "horizontal" ? splitRef.current : outputRef.current)?.getBoundingClientRect();
    if (!bounds) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeRef.current = { axis, bounds, pointerId: event.pointerId, target: event.currentTarget };
    setResizeAxis(axis);
    document.body.style.cursor = axis === "horizontal" ? "col-resize" : "row-resize";
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
        setSplit(Math.min(75, Math.max(25, ((clientX - drag.bounds.left) / drag.bounds.width) * 100)));
      } else {
        setOutputSplit(Math.min(82, Math.max(30, ((clientY - drag.bounds.top) / drag.bounds.height) * 100)));
      }
    });
  };

  const stopResize = (event) => {
    const drag = resizeRef.current;
    if (!drag || (event?.pointerId != null && drag.pointerId !== event.pointerId)) return;
    resizeRef.current = null;
    if (resizeFrameRef.current) cancelAnimationFrame(resizeFrameRef.current);
    resizeFrameRef.current = null;
    if (drag.target?.hasPointerCapture?.(drag.pointerId)) drag.target.releasePointerCapture(drag.pointerId);
    setResizeAxis(null);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  useEffect(() => () => {
    if (resizeFrameRef.current) cancelAnimationFrame(resizeFrameRef.current);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);
  const workspaceHeight = fullscreen ? "calc(100vh - 117px)" : fillViewport ? "calc(100vh - 190px)" : "460px";
  return (
    <div ref={workspaceRef} data-editor-theme={editorTheme} className={`asif-playground relative overflow-hidden border border-[#3c3c3c] bg-[#1e1e1e] shadow-xl ${fullscreen ? "h-screen rounded-none" : "rounded-3xl"}`}>
      {resizeAxis && <div className={`pointer-events-none absolute inset-0 z-50 ${resizeAxis === "horizontal" ? "cursor-col-resize" : "cursor-row-resize"}`} aria-hidden="true" />}
      <Toolbar title={title} onSelect={(value) => setPanel(consoleFirst && value === "preview" ? "console" : value)} fullscreen={fullscreen} onFullscreen={toggleFullscreen} fontSize={fontSize} setFontSize={setFontSize} editorTheme={editorTheme} onThemeChange={onThemeChange} onResetLayout={() => { setSplit(50); setOutputSplit(68); setExplorerOpen(true); }} explorerOpen={explorerOpen} onToggleExplorer={() => setExplorerOpen((value) => !value)} />
      <div className="flex border-b border-zinc-800 bg-zinc-900 p-1 lg:hidden">
        {PANELS.filter((item) => !(consoleFirst && item.id === "preview")).map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setPanel(id)} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${panel === id ? "bg-blue-600 text-white" : "text-zinc-400"}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}
      </div>
      <div ref={splitRef} className="block bg-zinc-950 lg:grid" style={{ gridTemplateColumns: `${split}% 8px minmax(0, 1fr)` }}>
        <div className={`${panel === "code" || panel === "files" ? "block" : "hidden"} min-w-0 lg:grid ${explorerOpen ? "lg:grid-cols-[190px_minmax(0,1fr)]" : "lg:grid-cols-1"}`} style={{ height: workspaceHeight }}>
          <div className={`${panel === "files" ? "block" : "hidden"} h-full min-h-0 ${explorerOpen ? "lg:block" : "lg:hidden"}`}><FileExplorer /></div>
          <div className={`${panel === "code" ? "block" : "hidden"} min-w-0 lg:block`}><SandpackCodeEditor showTabs showLineNumbers wrapContent closableTabs={false} style={{ height: workspaceHeight, fontSize }} /></div>
        </div>
        <button type="button" onPointerDown={(event) => startResize("horizontal", event)} onPointerMove={moveResize} onPointerUp={stopResize} onPointerCancel={stopResize} onLostPointerCapture={stopResize} className="group hidden touch-none cursor-col-resize items-center justify-center border-x border-zinc-800 bg-zinc-900 hover:bg-blue-600 lg:flex" aria-label="Resize editor and output panels" title="Drag to resize panels"><GripVertical className="h-5 w-5 text-zinc-500 group-hover:text-white" /></button>
        <div ref={outputRef} className={`playground-output min-w-0 border-l border-zinc-800 ${consoleFirst ? "" : "playground-output-split"}`} style={{ height: workspaceHeight, "--preview-size": `${outputSplit}%` }}>
          {!consoleFirst && <div className={`${panel === "preview" ? "block" : "hidden"} min-h-0 overflow-hidden lg:block`}><SandpackPreview showNavigator={language === "nextjs"} startRoute="/" showOpenInCodeSandbox={false} showRefreshButton={language !== "nextjs"} style={{ height: "100%" }} /></div>}
          {!consoleFirst && <button type="button" onPointerDown={(event) => startResize("vertical", event)} onPointerMove={moveResize} onPointerUp={stopResize} onPointerCancel={stopResize} onLostPointerCapture={stopResize} className="group hidden h-2 w-full touch-none cursor-row-resize items-center justify-center border-y border-zinc-800 bg-zinc-900 hover:bg-blue-600 lg:flex" aria-label="Resize preview and console panels" title="Drag up or down to resize preview and console"><GripHorizontal className="h-4 w-4 text-zinc-500 group-hover:text-white" /></button>}
          <div className={`${panel === "console" ? "block" : "hidden"} min-h-0 overflow-hidden lg:block`}><SandpackConsole standalone={consoleFirst} showHeader resetOnPreviewRestart style={{ height: "100%" }} /></div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-900 px-4 py-2 text-[11px] text-zinc-400"><span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />Code runs in an isolated browser sandbox.</span><span className="hidden font-mono sm:inline">Ctrl/⌘ + Enter to run</span></div>
      <style jsx global>{`
        .asif-playground .sp-console-item::after { display: none !important; }
        .asif-playground .sp-console-item { border: 0 !important; padding-block: 6px !important; }
        .asif-playground .sp-console-list { background: #1e1e1e !important; }
        .asif-playground .cm-activeLine { background: #2a2d2e !important; }
        .asif-playground .cm-gutters { background: #1e1e1e !important; border-right: 1px solid #333 !important; }
        .asif-playground .cm-selectionBackground,
        .asif-playground .cm-content ::selection { background: #264f78 !important; color: #ffffff !important; }
        .asif-playground * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
        .asif-playground *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        .asif-playground .cm-scroller,
        .asif-playground .sp-console-list,
        .asif-playground .sp-preview-container { overflow: auto !important; }
        .asif-playground[data-editor-theme="light"] .cm-activeLine { background: #f0f0f0 !important; }
        .asif-playground[data-editor-theme="light"] .cm-gutters { background: #ffffff !important; border-right-color: #e5e5e5 !important; }
        .asif-playground[data-editor-theme="light"] .cm-selectionBackground,
        .asif-playground[data-editor-theme="light"] .cm-content ::selection { background: #add6ff !important; color: #111111 !important; }
        @media (min-width: 1024px) {
          .asif-playground .playground-output-split {
            display: grid !important;
            grid-template-rows: minmax(0, var(--preview-size)) 8px minmax(0, calc(100% - var(--preview-size) - 8px));
          }
        }
      `}</style>
    </div>
  );
}

export default function InteractiveCodeSandbox({ language = "javascript", code, files, title, fillViewport = false }) {
  const [editorTheme, setEditorTheme] = useState("dark");
  const initialFiles = useMemo(() => normalizeFiles(language, code, files), [language, code, files]);
  return (
    <SandpackProvider key={`${language}-${Object.keys(initialFiles).join("-")}`} template={sandpackTemplateFor(language)} files={initialFiles} theme={editorTheme === "dark" ? VSCODE_DARK_THEME : VSCODE_LIGHT_THEME} options={{ autorun: false, recompileMode: "delayed", recompileDelay: 2147000000 }}>
      <Workspace language={language} title={title} editorTheme={editorTheme} onThemeChange={() => setEditorTheme((value) => value === "dark" ? "light" : "dark")} fillViewport={fillViewport} />
    </SandpackProvider>
  );
}
