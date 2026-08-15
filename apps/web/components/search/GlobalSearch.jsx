"use client";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
const SearchDialog = dynamic(() => import("./SearchDialog"), { ssr: false });

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");
  const triggerRef = useRef(null);
  useEffect(() => {
    const handler = (event) => {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          /INPUT|TEXTAREA|SELECT/.test(target.tagName));
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setInitialQuery("");
        setOpen(true);
      } else if (
        event.key === "/" &&
        !typing &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();
        setInitialQuery("");
        setOpen(true);
      }
    };
    const openFromPage = (event) => {
      setInitialQuery(event.detail?.query || "");
      setOpen(true);
    };
    addEventListener("keydown", handler);
    addEventListener("asif:open-search", openFromPage);
    return () => {
      removeEventListener("keydown", handler);
      removeEventListener("asif:open-search", openFromPage);
    };
  }, []);
  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        aria-label="Search site"
        title="Search (Ctrl/Command + K)"
        className="flex h-10 items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 text-zinc-600 dark:text-zinc-300 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:block text-xs font-semibold">Search</span>
        <kbd className="hidden lg:block text-[9px] text-zinc-400">⌘K</kbd>
      </button>
      {open && (
        <SearchDialog
          key={initialQuery}
          initialQuery={initialQuery}
          open={open}
          onClose={() => setOpen(false)}
          triggerRef={triggerRef}
        />
      )}
    </>
  );
}
