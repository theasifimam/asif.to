"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { NotebookPen } from "lucide-react";

const NotesDrawer = dynamic(() => import("@/components/notes/NotesDrawer"), {
  ssr: false,
});

export default function NotesQuickAccess() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [createSignal, setCreateSignal] = useState(0);

  const openNotes = (create = false) => {
    setLoaded(true);
    setOpen(true);
    if (create) setCreateSignal((value) => value + 1);
  };

  useEffect(() => {
    const handleShortcut = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "n"
      ) {
        event.preventDefault();
        openNotes(true);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => openNotes(false)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white md:h-10 md:w-10"
        aria-label="Open notes"
        title="Notes (Ctrl/Cmd + Shift + N)"
      >
        <NotebookPen className="h-4.5 w-4.5" />
      </button>
      {loaded && (
        <NotesDrawer
          open={open}
          onClose={() => setOpen(false)}
          createSignal={createSignal}
        />
      )}
    </>
  );
}
