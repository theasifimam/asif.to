"use client";

import React from "react";
import { BookOpen } from "lucide-react";

export default function HomeFinalCta() {
  return (
    <section className="relative overflow-hidden rounded-4xl sm:rounded-[2.5rem] bg-linear-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 sm:p-8 text-white shadow-lg shadow-blue-500/15">
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-100">
            Choose one technology. Start today.
          </span>
          <h2 className="font-outfit mt-1 text-xl sm:text-2xl font-black tracking-tight">
            Build real software engineering skills.
          </h2>
          <p className="mt-1 max-w-xl text-xs font-medium text-blue-100/90 leading-relaxed">
            Learn the concept, run live code in the playground, test your recall
            with flashcards, and prepare for technical interviews.
          </p>
        </div>
        <a
          href="#courses"
          className="h-11 shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 text-xs font-black text-blue-700 hover:bg-blue-50 shadow-md active:scale-95 transition-all"
        >
          <BookOpen className="w-4 h-4" />
          Get Started Now
        </a>
      </div>
    </section>
  );
}
