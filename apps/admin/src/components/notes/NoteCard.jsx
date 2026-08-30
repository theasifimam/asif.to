"use client";

import {
  Archive,
  ArchiveRestore,
  Check,
  ListChecks,
  MoreHorizontal,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import { getNoteColor } from "./note-colors";

function timeAgo(value) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value)) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString();
}

export default function NoteCard({
  note,
  menuOpen,
  onToggleMenu,
  onOpen,
  onPin,
  onArchive,
  onDelete,
  viewMode = "list",
}) {
  const pending = (note.checklist || []).filter((item) => !item.completed);
  const completed = (note.checklist || []).filter((item) => item.completed);
  const previewLimit = viewMode === "grid" ? 3 : 4;
  const previewItems = [...pending, ...completed].slice(0, previewLimit);
  const color = getNoteColor(note.color);

  return (
    <article
      className={`relative rounded-2xl border shadow-xs transition hover:brightness-[0.99] hover:shadow-sm dark:hover:brightness-110 ${color.card} ${
        viewMode === "grid" ? "h-full" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(note)}
        className={`block w-full cursor-pointer px-4 py-3.5 pr-12 text-left ${
          viewMode === "grid" ? "h-full min-h-36" : ""
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          {note.pinned && (
            <Pin className="h-3.5 w-3.5 shrink-0 fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400" />
          )}
          <h3 className="truncate text-sm font-black text-zinc-900 dark:text-white">
            {note.title?.trim() || (note.type === "checklist" ? "Checklist" : "Untitled note")}
          </h3>
        </div>

        {note.type === "checklist" ? (
          <div className="mt-2.5 space-y-1.5">
            {previewItems.length ? (
              previewItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 text-xs ${
                    item.completed
                      ? "text-zinc-400 line-through dark:text-zinc-600"
                      : "text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  <span
                    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border ${
                      item.completed
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-zinc-300 dark:border-zinc-700"
                    }`}
                  >
                    {item.completed && <Check className="h-2.5 w-2.5" />}
                  </span>
                  <span className="truncate">{item.text || "Empty item"}</span>
                </div>
              ))
            ) : (
              <p className="flex items-center gap-2 text-xs text-zinc-400">
                <ListChecks className="h-3.5 w-3.5" /> Empty checklist
              </p>
            )}
            {note.checklist?.length > previewItems.length && (
              <p className="text-[10px] font-semibold text-zinc-400">
                +{note.checklist.length - previewItems.length} more
              </p>
            )}
          </div>
        ) : (
          <p
            className={`mt-2 whitespace-pre-wrap text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 ${
              viewMode === "grid" ? "line-clamp-5" : "line-clamp-4"
            }`}
          >
            {note.content || "Empty note"}
          </p>
        )}

        <p
          className={`mt-3 text-[10px] font-medium ${
            note._saveError
              ? "text-rose-500"
              : "text-zinc-400 dark:text-zinc-600"
          }`}
        >
          {note._saveError ? "Not saved · Open to retry" : `Updated ${timeAgo(note.updatedAt)}`}
          {!note._saveError && completed.length ? ` · ${completed.length} completed` : ""}
        </p>
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggleMenu(note._id);
        }}
        className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
        aria-label={`Actions for ${note.title || "note"}`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {menuOpen && (
        <div
          className="absolute right-2.5 top-10 z-20 w-40 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onPin(note)}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {note.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
            {note.pinned ? "Unpin" : "Pin"}
          </button>
          <button
            type="button"
            onClick={() => onArchive(note)}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {note.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
            {note.archived ? "Unarchive" : "Archive"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(note)}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      )}
    </article>
  );
}
