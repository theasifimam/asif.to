"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check, AlertTriangle, ChevronDown, ChevronRight, Copy, Download, Share2, WandSparkles, ExternalLink, Expand, FileCode2, FilePlus2, Folder, FolderOpen, FolderPlus, FolderTree, GripHorizontal, GripVertical, Loader2, Maximize2, Minimize2, Minus, Moon, MoreHorizontal, PanelLeftClose, PanelLeftOpen, Pencil, Play, Plus, RotateCcw, ShieldCheck, Sun, Terminal, Trash2, Monitor, Code2, X
} from "lucide-react";
import {
  SandpackCodeEditor, SandpackPreview, SandpackProvider, useSandpack,
} from "@codesandbox/sandpack-react";
import BetterConsole from "./BetterConsole";
import {
  executeCurrentFiles, normalizeFiles, VSCODE_DARK_THEME, VSCODE_LIGHT_THEME,
} from "./sandpackConfig";
import { sandpackTemplateFor } from "@/lib/playground/config";
import {
  decodeShareState, encodeShareState, explainError, formatSource, RECENT_PRACTICE_KEY, storageKey, unsupportedFeedback,
} from "@/lib/playground/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const handleDuplicate = (path) => {
    const parts = path.split(".");
    const ext = parts.length > 1 ? `.${parts.pop()}` : "";
    const base = parts.join(".");
    let newPath = `${base}-copy${ext}`;
    let counter = 1;
    while (sandpack.files[newPath]) {
      newPath = `${base}-copy-${counter}${ext}`;
      counter++;
    }
    sandpack.addFile(newPath, sandpack.files[path]?.code || "", false);
    requestAnimationFrame(() => sandpack.setActiveFile(newPath));
    onFileSelect?.();
  };
  const handleCopyPath = (path) => {
    navigator.clipboard.writeText(path);
  };
  const handleSetEntryPoint = (path) => {
    // Basic implementation: set as active file, which many environments use as the focus.
    // For advanced runtimes, this could be synced to a global context.
    sandpack.setActiveFile(path);
    onFileSelect?.();
  };
  const handleMove = (sourcePath, targetFolder) => {
    if (!sourcePath || !targetFolder) return;
    if (targetFolder !== "/" && sourcePath.startsWith(`${targetFolder}/`)) return;
    const name = sourcePath.split("/").filter(Boolean).pop();
    const newPath = `${targetFolder === "/" ? "" : targetFolder}/${name}`;
    if (sourcePath === newPath) return;
    if (sandpack.files[newPath]) {
      setError(`Cannot move: A file named ${name} already exists in that folder.`);
      return;
    }
    const sourceCode = sandpack.files[sourcePath]?.code || "";
    sandpack.addFile(newPath, sourceCode, false);
    sandpack.deleteFile(sourcePath, false);
    if (sandpack.activeFile === sourcePath) {
      requestAnimationFrame(() => sandpack.setActiveFile(newPath));
      onFileSelect?.();
    }
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
        isDark ? "border-zinc-800/80 bg-[#141416]" : "border-zinc-200/90 bg-white"
      }`}
      aria-label="Project file explorer"
    >
      <div
        className={`flex h-10 items-center justify-between border-b px-2.5 ${
          isDark ? "border-zinc-800/80 bg-[#121214]" : "border-zinc-200/90 bg-zinc-50"
        }`}
      >
        <span
          className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider font-outfit ${
            isDark ? "text-zinc-400" : "text-zinc-500"
          }`}
        >
          <FolderTree className="h-3.5 w-3.5" />
          Explorer
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={beginCreate}
            className={`rounded-lg p-1.5 transition cursor-pointer ${
              isDark
                ? "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
            }`}
            title="Create file"
            aria-label="Create file"
          >
            <FilePlus2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={beginCreateFolder}
            className={`rounded-lg p-1.5 transition cursor-pointer ${
              isDark
                ? "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
            }`}
            title="Create folder"
            aria-label="Create folder"
          >
            <FolderPlus className="h-3.5 w-3.5" />
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
              className={`min-w-0 flex-1 rounded-lg border px-2 py-1.5 font-mono text-[11px] outline-none ${
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
              className="rounded-lg bg-blue-600 p-1.5 text-white cursor-pointer"
              title="Save"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className={`rounded-lg p-1.5 cursor-pointer ${
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
      <div 
        className="min-h-0 flex-1 overflow-y-auto p-1.5 space-y-0.5"
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={(e) => {
          e.preventDefault();
          const source = e.dataTransfer.getData("text/plain");
          if (source) handleMove(source, "/");
        }}
      >
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
                className={`group flex items-center gap-1 pr-1 rounded-lg transition-colors ${
                  isDark ? "hover:bg-zinc-800/70" : "hover:bg-zinc-100"
                }`}
                style={{ paddingLeft: `${depth * 12 + 4}px` }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const source = e.dataTransfer.getData("text/plain");
                  if (source) handleMove(source, entry.path);
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFolder(entry.path)}
                  className={`flex min-w-0 flex-1 items-center gap-1.5 py-1.5 text-left font-mono text-[11px] cursor-pointer ${
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
                    className={`rounded p-1 transition cursor-pointer ${
                      isDark
                        ? "text-zinc-400 hover:bg-zinc-700 hover:text-white"
                        : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                    }`}
                    title={`Create file in ${entry.path}`}
                  >
                    <FilePlus2 className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode({ type: "folder" });
                      setPathValue(`${entry.path}/`);
                      setError("");
                      setExpandedFolders(
                        (current) => new Set([...current, entry.path]),
                      );
                    }}
                    className={`rounded p-1 transition cursor-pointer ${
                      isDark
                        ? "text-zinc-400 hover:bg-zinc-700 hover:text-white"
                        : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                    }`}
                    title={`Create folder in ${entry.path}`}
                  >
                    <FolderPlus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({ type: "folder", path: entry.path })
                    }
                    className="rounded p-1 text-zinc-400 hover:bg-red-500/20 hover:text-red-500 cursor-pointer"
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
              draggable
              onDragStart={(e) => { e.dataTransfer.setData("text/plain", entry.path); }}
              className={`group flex items-center gap-1 pr-1 rounded-lg transition-colors ${
                isActive
                  ? isDark
                    ? "bg-blue-600/20 text-blue-300"
                    : "bg-blue-50 text-blue-700"
                  : isDark
                    ? "hover:bg-zinc-800/70"
                    : "hover:bg-zinc-100"
              }`}
              style={{ paddingLeft: `${depth * 12 + 16}px` }}
            >
              <button
                type="button"
                onClick={() => {
                  sandpack.setActiveFile(entry.path);
                  onFileSelect?.();
                }}
                className={`flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left font-mono text-[11px] cursor-pointer ${
                  isActive
                    ? isDark
                      ? "font-bold text-blue-300"
                      : "font-bold text-blue-700"
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={`rounded p-1 transition cursor-pointer ${
                        isDark
                          ? "text-zinc-400 hover:bg-zinc-700 hover:text-white"
                          : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                      }`}
                      title={`Options for ${entry.path}`}
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className={`w-48 p-1 shadow-2xl backdrop-blur-md rounded-xl ${
                      isDark
                        ? "!bg-[#18181b] !border-zinc-800 !text-zinc-100 shadow-black/80"
                        : "!bg-white !border-zinc-200 !text-zinc-900 shadow-zinc-400/40"
                    }`}
                  >
                    <DropdownMenuItem
                      onClick={() => handleSetEntryPoint(entry.path)}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                        isDark ? "hover:!bg-zinc-800 focus:!bg-zinc-800" : "hover:!bg-zinc-100 focus:!bg-zinc-100"
                      }`}
                    >
                      <Play className="h-3.5 w-3.5" /> Set as Main / Run
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className={isDark ? "!bg-zinc-800" : "!bg-zinc-200"} />
                    <DropdownMenuItem
                      onClick={() => beginRename(entry.path)}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                        isDark ? "hover:!bg-zinc-800 focus:!bg-zinc-800" : "hover:!bg-zinc-100 focus:!bg-zinc-100"
                      }`}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDuplicate(entry.path)}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                        isDark ? "hover:!bg-zinc-800 focus:!bg-zinc-800" : "hover:!bg-zinc-100 focus:!bg-zinc-100"
                      }`}
                    >
                      <Copy className="h-3.5 w-3.5" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleCopyPath(entry.path)}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                        isDark ? "hover:!bg-zinc-800 focus:!bg-zinc-800" : "hover:!bg-zinc-100 focus:!bg-zinc-100"
                      }`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Copy Path
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className={isDark ? "!bg-zinc-800" : "!bg-zinc-200"} />
                    <DropdownMenuItem
                      onClick={() =>
                        files.length === 1
                          ? setError("A project must keep at least one file.")
                          : setDeleteTarget({ type: "file", path: entry.path })
                      }
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-red-500 hover:!bg-red-500/10 focus:!bg-red-500/10 focus:!text-red-500 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
            className={`w-full max-w-sm rounded-3xl border p-6 shadow-2xl ${
              isDark
                ? "border-zinc-800 bg-[#18181b] text-white shadow-black/80"
                : "border-zinc-200 bg-white text-zinc-900 shadow-zinc-400/40"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <Trash2 className="h-5 w-5" />
            </div>
            <h3 id="delete-file-title" className="mt-4 text-base font-black font-outfit">
              Delete {deleteTarget.type}?
            </h3>
            <p
              className={`mt-2 text-xs leading-relaxed font-medium ${
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
                className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  isDark
                    ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                    : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 cursor-pointer shadow-sm"
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


export default FileExplorer;