"use client";

import React, { useState } from "react";
import { Code2, ChevronDown, MessageSquareText, Eye } from "lucide-react";
import InterviewAnswer from "./InterviewAnswer";

export default function ArticleAnswerSection({ answer, codeExample }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="py-5 sm:py-8">
      {/* Plain Toggle Header */}
      <div className="border-l-4 border-orange-500 pl-3 sm:pl-5">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between gap-3 text-left transition-opacity hover:opacity-80 focus:outline-none"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-orange-700 dark:text-orange-300 sm:text-sm">
            <MessageSquareText className="h-4 w-4 shrink-0 text-orange-500" />
            <span>Detailed interview answer</span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400">
            <span className="hidden sm:inline">{isOpen ? "Hide answer" : "Show answer"}</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? "rotate-0" : "-rotate-90"
              }`}
            />
          </span>
        </button>

        {isOpen ? (
          <div className="mt-4 space-y-5 pt-1">
            <div className="min-w-0 max-w-full text-justify text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-base sm:leading-7">
              <InterviewAnswer content={answer} />
            </div>

            {codeExample && (
              <section className="mt-5">
                <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  <Code2 className="h-3.5 w-3.5 text-orange-500" />
                  <span>Code example</span>
                </h2>
                <div className="mt-2 overflow-x-auto rounded-2xl bg-zinc-950 p-3.5 text-xs leading-5 text-zinc-100 shadow-inner sm:p-4 sm:text-sm sm:leading-6">
                  <pre className="font-mono">
                    <code>{codeExample}</code>
                  </pre>
                </div>
              </section>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="mt-2.5 inline-flex items-center gap-2 rounded-xl bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-700 transition hover:bg-orange-500/20 dark:text-orange-300"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Tap to reveal detailed answer & code</span>
          </button>
        )}
      </div>
    </div>
  );
}
