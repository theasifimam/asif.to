"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Archive,
  Inbox,
  LayoutGrid,
  ListChecks,
  NotebookPen,
  Plus,
  Rows3,
  Search,
  X,
} from "lucide-react";
import LogoLoader from "@/components/ui/LogoLoader";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { notesApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import NoteCard from "./NoteCard";
import NoteEditor from "./NoteEditor";

const unwrapNotes = (response) => response?.data?.data?.notes || [];
const unwrapNote = (response) => response?.data?.data?.note || null;
const isTemporaryId = (id) => String(id || "").startsWith("temp-");

function sortNotes(items) {
  return [...items].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
  });
}

function payloadFor(note) {
  return {
    title: String(note.title || "").slice(0, 200),
    type: note.type === "checklist" ? "checklist" : "text",
    content: String(note.content || "").slice(0, 50000),
    color: note.color || "neutral",
    checklist: (note.checklist || [])
      .filter((item) => item.text?.trim())
      .slice(0, 200)
      .map((item) => ({
        id: item.id,
        text: String(item.text).slice(0, 1000),
        completed: Boolean(item.completed),
      })),
    pinned: Boolean(note.pinned),
    archived: Boolean(note.archived),
  };
}

function isBlankNote(note) {
  return (
    !note?.title?.trim() &&
    !note?.content?.trim() &&
    !(note?.checklist || []).some((item) => item.text?.trim())
  );
}

export default function NotesDrawer({ open, onClose, createSignal = 0 }) {
  const [notes, setNotes] = useState([]);
  const notesRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [activeNote, setActiveNote] = useState(null);
  const draftRef = useRef(null);
  const dirtyRef = useRef(false);
  const saveTimerRef = useRef(null);
  const saveQueueRef = useRef(Promise.resolve());
  const creationPromisesRef = useRef(new Map());
  const freshNoteIdsRef = useRef(new Set());
  const loadedViewsRef = useRef(new Set());
  const [saveState, setSaveState] = useState("saved");
  const [menuOpen, setMenuOpen] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const lastCreateSignalRef = useRef(0);
  const dragStartYRef = useRef(null);
  const dragOffsetRef = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const updateNotes = useCallback((updater) => {
    setNotes((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      notesRef.current = next;
      return next;
    });
  }, []);

  const mergeNotes = useCallback(
    (incoming) => {
      updateNotes((current) => {
        const map = new Map(current.map((note) => [String(note._id), note]));
        incoming.forEach((note) => map.set(String(note._id), note));
        return sortNotes([...map.values()]);
      });
    },
    [updateNotes],
  );

  const loadNotes = useCallback(
    async (archived, force = false) => {
      const key = archived ? "archived" : "active";
      if (!force && loadedViewsRef.current.has(key)) return;
      setLoading(true);
      setError("");
      const response = await notesApi.list({ archived: String(archived) });
      if (response.success) {
        mergeNotes(unwrapNotes(response));
        loadedViewsRef.current.add(key);
      } else {
        setError(response.error || "Notes are temporarily unavailable.");
      }
      setLoading(false);
    },
    [mergeNotes],
  );

  const replaceTemporaryId = useCallback(
    (temporaryId, created) => {
      if (freshNoteIdsRef.current.delete(temporaryId)) {
        freshNoteIdsRef.current.add(String(created._id));
      }
      updateNotes((current) =>
        current.map((note) =>
          String(note._id) === String(temporaryId)
            ? {
                ...note,
                _id: created._id,
                createdAt: created.createdAt,
              }
            : note,
        ),
      );
      if (String(draftRef.current?._id) === String(temporaryId)) {
        const next = {
          ...draftRef.current,
          _id: created._id,
          createdAt: created.createdAt,
        };
        draftRef.current = next;
        setActiveNote(next);
      }
      return created;
    },
    [updateNotes],
  );

  const createOnServer = useCallback(
    (temporaryId, note) => {
      const request = notesApi.create(payloadFor(note)).then((response) => {
        const created = response.success ? unwrapNote(response) : null;
        if (!created) throw new Error(response.error || "Unable to create note.");
        return replaceTemporaryId(temporaryId, created);
      });
      creationPromisesRef.current.set(temporaryId, request);
      return request;
    },
    [replaceTemporaryId],
  );

  const resolvePersistedNote = useCallback(
    async (snapshot) => {
      if (!isTemporaryId(snapshot._id)) return snapshot;
      let creation = creationPromisesRef.current.get(snapshot._id);
      if (!creation) creation = createOnServer(snapshot._id, snapshot);
      try {
        const created = await creation;
        return { ...snapshot, _id: created._id, createdAt: created.createdAt };
      } catch {
        creationPromisesRef.current.delete(snapshot._id);
        const created = await createOnServer(snapshot._id, snapshot);
        return { ...snapshot, _id: created._id, createdAt: created.createdAt };
      }
    },
    [createOnServer],
  );

  const persistSnapshot = useCallback(
    async (snapshot) => {
      const persisted = await resolvePersistedNote(snapshot);
      const response = await notesApi.update(persisted._id, payloadFor(persisted));
      if (!response.success) {
        const error = new Error(response.error || "Unable to save note.");
        error.noteId = persisted._id;
        throw error;
      }
      const saved = unwrapNote(response);
      if (!isBlankNote(persisted)) {
        freshNoteIdsRef.current.delete(String(snapshot._id));
        freshNoteIdsRef.current.delete(String(persisted._id));
      }
      updateNotes((current) =>
        sortNotes(
          current.map((note) =>
            String(note._id) === String(persisted._id) ||
            String(note._id) === String(snapshot._id)
              ? {
                  ...note,
                  _id: persisted._id,
                  updatedAt: saved?.updatedAt || new Date().toISOString(),
                  _saveError: false,
                }
              : note,
          ),
        ),
      );
      return saved || persisted;
    },
    [resolvePersistedNote, updateNotes],
  );

  const enqueueSave = useCallback(
    (snapshot) => {
      if (!snapshot) return Promise.resolve();
      const tracksActiveDraft =
        String(draftRef.current?._id) === String(snapshot._id);
      if (tracksActiveDraft) {
        dirtyRef.current = false;
        setSaveState("saving");
      }
      const operation = saveQueueRef.current
        .catch(() => {})
        .then(() => persistSnapshot(snapshot))
        .then((saved) => {
          if (
            !dirtyRef.current &&
            (String(draftRef.current?._id) === String(snapshot._id) ||
              String(draftRef.current?._id) === String(saved?._id))
          ) {
            setSaveState("saved");
          }
        })
        .catch((saveError) => {
          console.error("Unable to save note:", saveError);
          updateNotes((current) =>
            current.map((note) =>
              String(note._id) === String(snapshot._id) ||
              String(note._id) === String(saveError.noteId)
                ? { ...note, _saveError: true }
                : note,
            ),
          );
          if (
            String(draftRef.current?._id) === String(snapshot._id) ||
            String(draftRef.current?._id) === String(saveError.noteId)
          ) {
            dirtyRef.current = true;
            setSaveState("error");
          }
        });
      saveQueueRef.current = operation;
      return operation;
    },
    [persistSnapshot, updateNotes],
  );

  const flushCurrent = useCallback(() => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = null;
    if (!draftRef.current) return Promise.resolve();
    let snapshot = { ...draftRef.current };
    const checklist = (snapshot.checklist || []).filter((item) => item.text?.trim());
    if (checklist.length !== (snapshot.checklist || []).length) {
      snapshot = { ...snapshot, checklist };
      draftRef.current = snapshot;
      setActiveNote(snapshot);
      updateNotes((current) =>
        current.map((note) =>
          String(note._id) === String(snapshot._id) ? snapshot : note,
        ),
      );
    }
    if (!dirtyRef.current) return Promise.resolve();
    return enqueueSave(snapshot);
  }, [enqueueSave, updateNotes]);

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    setSaveState("saving");
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      enqueueSave({ ...draftRef.current });
    }, 650);
  }, [enqueueSave]);

  const discardBlankDraft = useCallback(
    (note) => {
      if (!note || !freshNoteIdsRef.current.has(String(note._id)) || !isBlankNote(note)) {
        return false;
      }
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
      dirtyRef.current = false;
      freshNoteIdsRef.current.delete(String(note._id));
      updateNotes((current) =>
        current.filter((entry) => String(entry._id) !== String(note._id)),
      );
      const creation = isTemporaryId(note._id)
        ? creationPromisesRef.current.get(note._id)
        : Promise.resolve(note);
      creation
        ?.then((created) => created?._id && notesApi.delete(created._id))
        .catch(() => {});
      return true;
    },
    [updateNotes],
  );

  const changeDraft = useCallback(
    (changes, immediate = false) => {
      if (!draftRef.current) return;
      const next = {
        ...draftRef.current,
        ...changes,
        updatedAt: new Date().toISOString(),
      };
      draftRef.current = next;
      dirtyRef.current = true;
      setActiveNote(next);
      updateNotes((current) =>
        sortNotes(
          current.map((note) =>
            String(note._id) === String(next._id) ? next : note,
          ),
        ),
      );
      if (immediate) {
        if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
        enqueueSave({ ...next });
      } else {
        scheduleSave();
      }
    },
    [enqueueSave, scheduleSave, updateNotes],
  );

  const startNewNote = useCallback(
    (type = "text") => {
      if (!discardBlankDraft(draftRef.current)) void flushCurrent();
      const temporaryId = `temp-${crypto.randomUUID()}`;
      const now = new Date().toISOString();
      const note = {
        _id: temporaryId,
        _clientId: temporaryId,
        title: "",
        type,
        content: "",
        color: "neutral",
        checklist:
          type === "checklist"
            ? [{ id: crypto.randomUUID(), text: "", completed: false }]
            : [],
        pinned: false,
        archived: false,
        createdAt: now,
        updatedAt: now,
      };
      updateNotes((current) => sortNotes([note, ...current]));
      freshNoteIdsRef.current.add(temporaryId);
      draftRef.current = note;
      dirtyRef.current = false;
      setActiveNote(note);
      setSaveState("saving");
      setQuery("");
      setShowArchived(false);
      createOnServer(temporaryId, note)
        .then((created) => {
          if (
            !dirtyRef.current &&
            String(draftRef.current?._id) === String(created._id)
          ) {
            setSaveState("saved");
          }
        })
        .catch((creationError) => {
          console.error("Unable to create note:", creationError);
          if (String(draftRef.current?._id) === temporaryId) {
            setSaveState("error");
          }
        });
    },
    [createOnServer, discardBlankDraft, flushCurrent, updateNotes],
  );

  const openNote = useCallback(
    (note) => {
      if (!discardBlankDraft(draftRef.current)) void flushCurrent();
      const next = {
        ...note,
        checklist: (note.checklist || []).map((item) => ({ ...item })),
      };
      draftRef.current = next;
      dirtyRef.current = Boolean(note._saveError);
      setSaveState(note._saveError ? "error" : "saved");
      setActiveNote(next);
      setMenuOpen(null);
    },
    [discardBlankDraft, flushCurrent],
  );

  const backToList = useCallback(() => {
    if (!discardBlankDraft(draftRef.current)) void flushCurrent();
    draftRef.current = null;
    dirtyRef.current = false;
    setActiveNote(null);
  }, [discardBlankDraft, flushCurrent]);

  const closeDrawer = useCallback(() => {
    if (!discardBlankDraft(draftRef.current)) void flushCurrent();
    draftRef.current = null;
    dirtyRef.current = false;
    setActiveNote(null);
    setMenuOpen(null);
    dragStartYRef.current = null;
    dragOffsetRef.current = 0;
    setDragOffset(0);
    setDragging(false);
    onClose();
  }, [discardBlankDraft, flushCurrent, onClose]);

  const beginSheetDrag = (event) => {
    dragStartYRef.current = event.clientY;
    dragOffsetRef.current = 0;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveSheetDrag = (event) => {
    if (dragStartYRef.current === null) return;
    const nextOffset = Math.max(0, event.clientY - dragStartYRef.current);
    dragOffsetRef.current = nextOffset;
    setDragOffset(nextOffset);
  };

  const finishSheetDrag = () => {
    dragStartYRef.current = null;
    setDragging(false);
    if (dragOffsetRef.current > 96) {
      closeDrawer();
      return;
    }
    dragOffsetRef.current = 0;
    setDragOffset(0);
  };

  const updateImmediately = useCallback(
    (note, changes) => {
      const next = { ...note, ...changes, updatedAt: new Date().toISOString() };
      if (String(draftRef.current?._id) === String(note._id)) {
        changeDraft(changes, true);
      } else {
        updateNotes((current) =>
          sortNotes(
            current.map((entry) =>
              String(entry._id) === String(note._id) ? next : entry,
            ),
          ),
        );
        enqueueSave(next);
      }
      setMenuOpen(null);
      return next;
    },
    [changeDraft, enqueueSave, updateNotes],
  );

  const requestDelete = useCallback((note) => {
    setMenuOpen(null);
    setPendingDelete(note);
  }, []);

  const confirmDelete = async () => {
    const note = pendingDelete;
    if (!note || deleting) return;
    setDeleting(true);
    if (String(draftRef.current?._id) === String(note._id)) {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
      dirtyRef.current = false;
    }
    try {
      const persisted = await resolvePersistedNote(note);
      const operation = saveQueueRef.current
        .catch(() => {})
        .then(() => notesApi.delete(persisted._id));
      saveQueueRef.current = operation;
      const response = await operation;
      if (!response.success) throw new Error(response.error || "Unable to delete note.");
      updateNotes((current) =>
        current.filter(
          (entry) =>
            String(entry._id) !== String(note._id) &&
            String(entry._id) !== String(persisted._id),
        ),
      );
      if (
        String(draftRef.current?._id) === String(note._id) ||
        String(draftRef.current?._id) === String(persisted._id)
      ) {
        draftRef.current = null;
        setActiveNote(null);
      }
      setPendingDelete(null);
    } catch (deleteError) {
      toast.error("Note was not deleted", { description: deleteError.message });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    Promise.resolve().then(() => loadNotes(showArchived));
  }, [loadNotes, open, showArchived]);

  useEffect(() => {
    if (!open || createSignal <= lastCreateSignalRef.current) return;
    lastCreateSignalRef.current = createSignal;
    startNewNote("text");
  }, [createSignal, open, startNewNote]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key !== "Escape" || pendingDelete) return;
      event.preventDefault();
      if (draftRef.current) backToList();
      else closeDrawer();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [backToList, closeDrawer, open, pendingDelete]);

  useEffect(
    () => () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    },
    [],
  );

  const visibleNotes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return sortNotes(
      notes.filter((note) => {
        if (Boolean(note.archived) !== showArchived) return false;
        if (!normalized) return true;
        return [
          note.title,
          note.content,
          ...(note.checklist || []).map((item) => item.text),
        ].some((value) => String(value || "").toLowerCase().includes(normalized));
      }),
    );
  }, [notes, query, showArchived]);

  if (!open) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-5000 bg-zinc-950/30 backdrop-blur-[1px]"
        onMouseDown={closeDrawer}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Personal notes"
        data-scroll-ignore
        onMouseDown={(event) => event.stopPropagation()}
        onClick={() => setMenuOpen(null)}
        className="fixed inset-x-0 bottom-0 z-5001 flex h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-b-0 border-zinc-200 bg-zinc-50 shadow-2xl animate-in slide-in-from-bottom duration-200 dark:border-zinc-800 dark:bg-[#09090b] sm:inset-y-0 sm:left-auto sm:right-0 sm:h-auto sm:w-110 sm:rounded-none sm:border-y-0 sm:border-r-0 sm:border-l sm:slide-in-from-right"
        style={{
          transform: dragOffset ? `translateY(${dragOffset}px)` : undefined,
          transition: dragging ? "none" : "transform 160ms ease-out",
        }}
      >
        <div
          className="flex h-6 shrink-0 touch-none cursor-grab items-center justify-center active:cursor-grabbing sm:hidden"
          onPointerDown={beginSheetDrag}
          onPointerMove={moveSheetDrag}
          onPointerUp={finishSheetDrag}
          onPointerCancel={finishSheetDrag}
          aria-label="Swipe down to close notes"
        >
          <span className="h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>
        {activeNote ? (
          <NoteEditor
            key={activeNote._clientId || activeNote._id}
            note={activeNote}
            saveState={saveState}
            onChange={changeDraft}
            onBack={backToList}
            onClose={closeDrawer}
            onPin={() => changeDraft({ pinned: !activeNote.pinned }, true)}
            onArchive={() => {
              changeDraft({ archived: !activeNote.archived }, true);
              backToList();
            }}
            onDelete={() => requestDelete(activeNote)}
          />
        ) : (
          <>
            <header className="flex h-16 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-[#121215]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
                <NotebookPen className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-black text-zinc-900 dark:text-white">Notes</h2>
                <p className="text-[10px] font-medium text-zinc-400">
                  {showArchived ? "Archived notes" : "Your private scratchpad"}
                </p>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setViewMode((current) => (current === "list" ? "grid" : "list"));
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                aria-label={viewMode === "list" ? "Use card view" : "Use list view"}
                title={viewMode === "list" ? "Card view" : "List view"}
              >
                {viewMode === "list" ? (
                  <LayoutGrid className="h-4 w-4" />
                ) : (
                  <Rows3 className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowArchived((value) => !value);
                  setQuery("");
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                  showArchived
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                }`}
                aria-label={showArchived ? "Show current notes" : "Show archived notes"}
                title={showArchived ? "Current notes" : "Archived notes"}
              >
                {showArchived ? <Inbox className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={closeDrawer}
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                aria-label="Close notes"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </header>

            <div className="shrink-0 space-y-3 border-b border-zinc-200 bg-white px-4 py-3.5 dark:border-zinc-800 dark:bg-[#121215]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search notes..."
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-xs font-medium text-zinc-900 outline-none transition focus:border-blue-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startNewNote("text")}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-black text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" /> New Note
                </button>
                <button
                  type="button"
                  onClick={() => startNewNote("checklist")}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
                  aria-label="New checklist"
                  title="New checklist"
                >
                  <ListChecks className="h-4 w-4" />
                  <span className="hidden xs:inline">Checklist</span>
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3.5" data-scroll-ignore>
              {loading && !visibleNotes.length ? (
                <div className="flex h-40 items-center justify-center">
                  <LogoLoader className="h-8 w-8 text-blue-600" />
                </div>
              ) : error && !visibleNotes.length ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center dark:border-rose-500/20 dark:bg-rose-500/10">
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-300">{error}</p>
                  <button
                    type="button"
                    onClick={() => loadNotes(showArchived, true)}
                    className="mt-3 text-xs font-black text-rose-700 underline dark:text-rose-200"
                  >
                    Try again
                  </button>
                </div>
              ) : visibleNotes.length ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 items-start gap-2.5"
                      : "space-y-2.5"
                  }
                >
                  {visibleNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      viewMode={viewMode}
                      menuOpen={menuOpen === note._id}
                      onToggleMenu={(id) => setMenuOpen((current) => (current === id ? null : id))}
                      onOpen={openNote}
                      onPin={(item) => updateImmediately(item, { pinned: !item.pinned })}
                      onArchive={(item) => updateImmediately(item, { archived: !item.archived })}
                      onDelete={requestDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center px-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600">
                    {query ? <Search className="h-5 w-5" /> : <NotebookPen className="h-5 w-5" />}
                  </div>
                  <p className="mt-4 text-sm font-black text-zinc-900 dark:text-white">
                    {query
                      ? "No matching notes"
                      : showArchived
                        ? "No archived notes"
                        : "No notes yet"}
                  </p>
                  <p className="mt-1 max-w-64 text-xs leading-relaxed text-zinc-500">
                    {query
                      ? "Try a different title, phrase, or checklist item."
                      : showArchived
                        ? "Archived notes will stay out of your main list."
                        : "Save quick ideas, reminders, or checklists here."}
                  </p>
                  {!query && !showArchived && (
                    <button
                      type="button"
                      onClick={() => startNewNote("text")}
                      className="mt-4 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white"
                    >
                      <Plus className="h-4 w-4" /> New Note
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </aside>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onClose={() => !deleting && setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete this note?"
        description="This permanently deletes the note. This action cannot be undone."
        confirmText="Delete note"
        variant="destructive"
        loading={deleting}
      />
    </>,
    document.body,
  );
}
