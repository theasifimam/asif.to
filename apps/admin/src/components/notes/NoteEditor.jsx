"use client";

import { useEffect, useRef } from "react";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Check,
  FileText,
  ListChecks,
  Pin,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { getNoteColor, NOTE_COLORS } from "./note-colors";

const resizeChecklistTextarea = (element) => {
  if (!element) return;
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
};

export default function NoteEditor({
  note,
  saveState,
  onChange,
  onBack,
  onClose,
  onPin,
  onArchive,
  onDelete,
}) {
  const titleRef = useRef(null);
  const itemRefs = useRef(new Map());
  const initialFocusRef = useRef({
    checklist:
      note.type === "checklist" &&
      !note.title?.trim() &&
      note.checklist?.[0] &&
      !note.checklist[0].text?.trim(),
    itemId: note.checklist?.[0]?.id,
  });

  useEffect(() => {
    requestAnimationFrame(() => {
      if (initialFocusRef.current.checklist) {
        itemRefs.current.get(initialFocusRef.current.itemId)?.focus();
      } else {
        titleRef.current?.focus();
      }
    });
  }, []);

  const updateChecklist = (checklist, immediate = false) =>
    onChange({ checklist }, immediate);

  const addItem = (afterId = null) => {
    const item = { id: crypto.randomUUID(), text: "", completed: false };
    const current = note.checklist || [];
    const index = afterId
      ? current.findIndex((entry) => entry.id === afterId) + 1
      : current.length;
    const next = [...current];
    next.splice(Math.max(0, index), 0, item);
    updateChecklist(next);
    requestAnimationFrame(() => itemRefs.current.get(item.id)?.focus());
  };

  const removeItem = (id) => {
    const current = note.checklist || [];
    const index = current.findIndex((item) => item.id === id);
    const previous = current[index - 1];
    updateChecklist(
      current.filter((item) => item.id !== id),
      true,
    );
    if (previous) {
      requestAnimationFrame(() => itemRefs.current.get(previous.id)?.focus());
    }
  };

  const pasteItems = (event, item) => {
    const pastedText = event.clipboardData.getData("text");
    if (!/[\r\n]/.test(pastedText)) return;

    event.preventDefault();
    const lines = pastedText
      .replace(/\r\n?/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (!lines.length) return;

    const current = note.checklist || [];
    const itemIndex = current.findIndex((entry) => entry.id === item.id);
    if (itemIndex < 0) return;

    const selectionStart = event.currentTarget.selectionStart ?? item.text.length;
    const selectionEnd = event.currentTarget.selectionEnd ?? selectionStart;
    const beforeSelection = item.text.slice(0, selectionStart);
    const afterSelection = item.text.slice(selectionEnd);
    const availableNewItems = Math.max(0, 200 - current.length);
    const acceptedLines = lines.slice(0, availableNewItems + 1);
    const pastedItems = acceptedLines.map((text, index) => ({
      id: index === 0 ? item.id : crypto.randomUUID(),
      text: String(
        `${index === 0 ? beforeSelection : ""}${text}${
          index === acceptedLines.length - 1 ? afterSelection : ""
        }`,
      ).slice(0, 1000),
      completed: index === 0 ? item.completed : false,
    }));
    const next = [
      ...current.slice(0, itemIndex),
      ...pastedItems,
      ...current.slice(itemIndex + 1),
    ];
    updateChecklist(next);

    const focusId = pastedItems.at(-1)?.id;
    requestAnimationFrame(() => {
      const textarea = itemRefs.current.get(focusId);
      textarea?.focus();
      textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
      resizeChecklistTextarea(textarea);
    });
  };

  const renderItem = (item) => (
    <div key={item.id} className="group flex items-start gap-2.5 py-1">
      <button
        type="button"
        onClick={() =>
          updateChecklist(
            note.checklist.map((entry) =>
              entry.id === item.id
                ? { ...entry, completed: !entry.completed }
                : entry,
            ),
            true,
          )
        }
        className={`mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
          item.completed
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-zinc-300 bg-white hover:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
        }`}
        aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
      >
        {item.completed && <Check className="h-3.5 w-3.5" />}
      </button>
      <textarea
        ref={(node) => {
          if (node) {
            itemRefs.current.set(item.id, node);
            resizeChecklistTextarea(node);
          } else itemRefs.current.delete(item.id);
        }}
        value={item.text}
        rows={1}
        maxLength={1000}
        onChange={(event) => {
          resizeChecklistTextarea(event.currentTarget);
          updateChecklist(
            note.checklist.map((entry) =>
              entry.id === item.id
                ? { ...entry, text: event.target.value }
                : entry,
            ),
          );
        }}
        onPaste={(event) => pasteItems(event, item)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            addItem(item.id);
          } else if (event.key === "Backspace" && !item.text) {
            event.preventDefault();
            removeItem(item.id);
          }
        }}
        placeholder="Checklist item"
        className={`min-h-9 min-w-0 flex-1 resize-none overflow-hidden whitespace-pre-wrap break-words border-0 bg-transparent py-2 text-sm leading-5 outline-none placeholder:text-zinc-400 ${
          item.completed
            ? "text-zinc-400 line-through dark:text-zinc-600"
            : "text-zinc-800 dark:text-zinc-200"
        }`}
      />
      <button
        type="button"
        onClick={() => removeItem(item.id)}
        className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-300 opacity-100 transition hover:bg-zinc-100 hover:text-rose-600 focus:opacity-100 dark:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-rose-400 sm:opacity-0 sm:group-hover:opacity-100"
        aria-label="Delete checklist item"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  const incomplete = (note.checklist || []).filter((item) => !item.completed);
  const completed = (note.checklist || []).filter((item) => item.completed);
  const color = getNoteColor(note.color);

  return (
    <div className={`flex h-full min-h-0 flex-col transition-colors ${color.editor}`}>
      <header className="flex h-15 shrink-0 items-center gap-1 border-b border-zinc-200 px-3 dark:border-zinc-800">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
          aria-label="Back to notes"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div className="ml-1 min-w-0 flex-1">
          <p className="text-xs font-black text-zinc-900 dark:text-white">Edit note</p>
          <p
            className={`text-[10px] font-medium ${
              saveState === "error" ? "text-rose-500" : "text-zinc-400"
            }`}
          >
            {saveState === "saving"
              ? "Saving..."
              : saveState === "error"
                ? "Save failed — changes kept"
                : "Saved"}
          </p>
        </div>
        <button
          type="button"
          onClick={onPin}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
            note.pinned
              ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
              : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
          }`}
          aria-label={note.pinned ? "Unpin note" : "Pin note"}
          title={note.pinned ? "Unpin" : "Pin"}
        >
          <Pin className={`h-4 w-4 ${note.pinned ? "fill-current" : ""}`} />
        </button>
        <button
          type="button"
          onClick={onArchive}
          className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
          aria-label={note.archived ? "Unarchive note" : "Archive note"}
          title={note.archived ? "Unarchive" : "Archive"}
        >
          {note.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
          aria-label="Delete note"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
          aria-label="Close notes"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-6 pt-4" data-scroll-ignore>
        <input
          ref={titleRef}
          value={note.title}
          maxLength={200}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="Title (optional)"
          className="w-full border-0 bg-transparent text-xl font-black text-zinc-900 outline-none placeholder:text-zinc-300 dark:text-white dark:placeholder:text-zinc-700"
        />

        <div className="mt-4 flex items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => onChange({ type: "text" }, true)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
              note.type === "text"
                ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <FileText className="h-3.5 w-3.5" /> Text
          </button>
          <button
            type="button"
            onClick={() => {
              const checklist = note.checklist?.length
                ? note.checklist
                : [{ id: crypto.randomUUID(), text: "", completed: false }];
              onChange({ type: "checklist", checklist }, true);
              requestAnimationFrame(() =>
                itemRefs.current.get(checklist[0]?.id)?.focus(),
              );
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
              note.type === "checklist"
                ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <ListChecks className="h-3.5 w-3.5" /> Checklist
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2" aria-label="Note color">
          <span className="mr-1 text-[10px] font-bold text-zinc-400">Color</span>
          {NOTE_COLORS.map((option) => {
            const selected = color.id === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange({ color: option.id }, true)}
                className={`flex h-7 w-7 items-center justify-center rounded-full border transition hover:scale-105 ${option.swatch} ${
                  selected
                    ? "border-blue-500 ring-2 ring-blue-500/20"
                    : "border-zinc-200 dark:border-zinc-700"
                }`}
                aria-label={`Use ${option.label.toLowerCase()}`}
                aria-pressed={selected}
                title={option.label}
              >
                {selected && <Check className="h-3.5 w-3.5 text-zinc-700 dark:text-white" />}
              </button>
            );
          })}
        </div>

        {note.type === "text" ? (
          <textarea
            value={note.content}
            maxLength={50000}
            onChange={(event) => onChange({ content: event.target.value })}
            placeholder="Start typing..."
            className="mt-4 min-h-80 flex-1 resize-none border-0 bg-transparent text-sm leading-7 text-zinc-700 outline-none placeholder:text-zinc-400 dark:text-zinc-300"
          />
        ) : (
          <div className="mt-4">
            <div>{incomplete.map(renderItem)}</div>
            <button
              type="button"
              onClick={() => addItem()}
              className="mt-1 flex items-center gap-2 rounded-lg px-1 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <Plus className="h-4 w-4" /> Add item
            </button>

            {completed.length > 0 && (
              <section className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  Completed ({completed.length})
                </p>
                <div>{completed.map(renderItem)}</div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
