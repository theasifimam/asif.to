"use client";

import React from "react";
import { LEARNING_STEPS } from "../homeConstants";

export default function HomeLearningLoop() {
  return (
    <section className="rounded-4xl sm:rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-5 sm:p-7 shadow-xs">
      <div className="mx-auto max-w-xl text-center">
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
          Complete Learning Loop
        </span>
        <h2 className="font-outfit mt-1 text-lg sm:text-2xl font-black tracking-tight">
          Learn &rarr; Practice &rarr; Master
        </h2>
        <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          From initial conceptual explanation to instant code execution, active
          flashcard revision, and interview readiness.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {LEARNING_STEPS.map(([Icon, label, detail], index) => (
          <div
            key={label}
            className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 p-3 text-center"
          >
            <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Icon className="h-4 w-4" />
            </span>
            <span className="font-outfit mt-2 block text-xs font-black text-zinc-900 dark:text-white">
              {index + 1}. {label}
            </span>
            <span className="mt-0.5 block text-[10px] font-medium text-zinc-500">
              {detail}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
