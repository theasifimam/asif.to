"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, List, X } from "lucide-react";

export default function MobileQuestionIndex({ questions, firstNumber }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const handleScroll = () => {
      const current = window.scrollY;
      const movement = current - lastScrollY.current;
      if (Math.abs(movement) > 8) {
        setVisible(current < 120 || movement < 0);
        lastScrollY.current = current;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const closeWithEscape = (event) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [open]);

  const goToQuestion = () => setOpen(false);

  return <>
    {open && <button type="button" aria-label="Close question index" className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden" onClick={() => setOpen(false)} />}
    <div className={`fixed inset-x-3 top-20 z-50 transition-all duration-300 lg:hidden ${visible || open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-20 opacity-0"}`}>
      <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 shadow-xl shadow-black/10 backdrop-blur-xl dark:border-zinc-700 dark:bg-zinc-900/95">
        <button type="button" aria-expanded={open} aria-controls="mobile-question-index" onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-2 px-4 py-3 text-left">
          <List className="h-4 w-4 shrink-0 text-orange-500" />
          <span className="min-w-0 flex-1 truncate text-sm font-bold">Questions {firstNumber}–{firstNumber + questions.length - 1}</span>
          <span className="text-xs font-semibold text-zinc-500">View index</span>
          {open ? <X className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {open && <nav id="mobile-question-index" aria-label="Questions on this page" className="max-h-[min(65vh,32rem)] overflow-y-auto border-t border-zinc-200 p-2 dark:border-zinc-800">
          <ol className="space-y-1">
            {questions.map((item, index) => {
              const number = firstNumber + index;
              return <li key={item._id}><a href={`#question-${number}`} onClick={goToQuestion} className="flex items-start gap-3 rounded-xl px-3 py-3 text-sm leading-5 hover:bg-orange-50 dark:hover:bg-orange-500/10"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-xs font-black text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">{number}</span><span className="pt-1 font-medium text-zinc-700 dark:text-zinc-200">{item.question}</span></a></li>;
            })}
          </ol>
        </nav>}
      </div>
    </div>
  </>;
}
