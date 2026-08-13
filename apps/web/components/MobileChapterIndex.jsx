"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, List, X } from "lucide-react";
import { useScrollNavVisible } from "@/components/ScrollNavProvider";

export default function MobileChapterIndex({ chapters, activeCourseSlug }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const scrollNavVisible = useScrollNavVisible();
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastScrollY.current =
      window.scrollY || document.documentElement.scrollTop || 0;

    const updateVisibility = () => {
      const current = window.scrollY || document.documentElement.scrollTop || 0;
      const movement = current - lastScrollY.current;

      if (current <= 30) {
        setVisible(true);
      } else if (movement > 5) {
        // Scrolling downward -> hide
        setVisible(false);
      } else if (movement < -5) {
        // Scrolling upward -> show
        setVisible(true);
      }

      lastScrollY.current = current;
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        window.requestAnimationFrame(updateVisibility);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, {
      passive: true,
      capture: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const closeWithEscape = (event) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [open]);

  const goToChapter = () => setOpen(false);

  if (!chapters || chapters.length === 0) return null;

  const isBarShown = (visible && scrollNavVisible) || open;

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close chapter index"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        className={`fixed inset-x-3 top-20 z-40 transition-all duration-300 ease-in-out lg:hidden ${
          isBarShown
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-28 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-md overflow-hidden rounded-4xl border border-zinc-200/90 bg-white/95 shadow-md backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-chapter-index"
            onClick={() => setOpen((value) => !value)}
            className="flex w-full items-center gap-2 px-6 py-4 text-left active:bg-zinc-100 dark:active:bg-zinc-800/60 transition-colors"
          >
            <List className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span className="min-w-0 flex-1 truncate text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Chapters 1–{chapters.length}
            </span>
            <span className="text-[11px] font-semibold text-zinc-500">
              {open ? "Close" : "View Chapters"}
            </span>
            {open ? (
              <X className="h-4 w-4 text-zinc-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            )}
          </button>
          {open && (
            <nav
              id="mobile-chapter-index"
              aria-label="Chapters in this course"
              className="max-h-[min(65vh,30rem)] overflow-y-auto border-t border-zinc-200/80 p-2 px-3 dark:border-zinc-800 scrollbar-none"
            >
              <ol className="space-y-1">
                {chapters.map((item, index) => {
                  const number = index + 1;
                  return (
                    <li key={item._id || item.slug}>
                      <Link
                        href={`/${activeCourseSlug}/${item.slug}`}
                        onClick={goToChapter}
                        className="flex items-start gap-3 rounded-xl px-3 py-2.5 text-xs sm:text-sm leading-5 hover:bg-blue-50 dark:hover:bg-blue-500/10 active:bg-blue-100 transition-colors"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[11px] font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 font-outfit">
                          {number}
                        </span>
                        <span className="pt-0.5 font-medium text-zinc-800 dark:text-zinc-200">
                          {item.title}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
