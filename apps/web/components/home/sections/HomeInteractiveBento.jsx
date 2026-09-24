"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  FileCode,
  HelpCircle,
  Layers,
  MessageSquareText,
  Play,
  Sparkles,
} from "lucide-react";

export default function HomeInteractiveBento() {
  return (
    <section className="scroll-mt-24 space-y-4">
      <div className="mb-2">
        <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em]">
            Interactive Learning Hub
          </span>
        </div>
        <h2 className="font-outfit mt-1 text-lg sm:text-2xl font-black tracking-tight">
          Everything You Need to Master Coding
        </h2>
      </div>

      <div className="mt-3 flex gap-3.5 sm:gap-4 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory py-4 w-full">
        {/* Top Row: Playground Hero Bento Card */}
        <div className="flex flex-col justify-between overflow-hidden rounded-4xl sm:rounded-[2.5rem] bg-zinc-950 text-white p-5 sm:p-6 border border-zinc-800 shadow-xl min-w-0 w-[85vw] sm:w-[38rem] shrink-0 snap-start">
          <div>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 text-blue-400">
                <Code2 className="w-4 h-4" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em]">
                  Browser Code Playground
                </span>
              </div>
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live IDE Sandbox
              </span>
            </div>

            <h3 className="font-outfit mt-2 text-xl sm:text-2xl font-black tracking-tight">
              Don&apos;t just read code.{" "}
              <span className="text-blue-400">Run it live.</span>
            </h3>
            <p className="mt-1 text-xs leading-relaxed font-medium text-zinc-400">
              Experiment instantly with HTML, CSS, JS, React and Next.js right
              inside your browser with zero configuration.
            </p>

            {/* Code Editor Preview Window */}
            <div className="mt-3.5 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/90 font-mono text-[11px] shadow-inner">
              <div className="flex items-center justify-between bg-zinc-900 border-b border-zinc-800 px-3 py-2 text-[10px] text-zinc-400 font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 font-bold text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-md text-[9.5px]">
                    App.jsx
                  </span>
                </div>
                <span className="text-blue-400 text-[10px] font-bold">
                  React 18
                </span>
              </div>

              <div className="p-3 text-zinc-300 space-y-1 text-[10.5px] leading-relaxed">
                <div>
                  <span className="text-purple-400 font-bold">import</span>{" "}
                  <span className="text-blue-300">React</span>, {"{"}{" "}
                  <span className="text-amber-300">useState</span> {"}"}{" "}
                  <span className="text-purple-400 font-bold">from</span>{" "}
                  <span className="text-emerald-300">&apos;react&apos;</span>;
                </div>
                <div>
                  <span className="text-purple-400 font-bold">
                    export default function
                  </span>{" "}
                  <span className="text-amber-300">Counter</span>() {"{"}
                </div>
                <div className="pl-3">
                  <span className="text-purple-400 font-bold">const</span> [
                  <span className="text-blue-300">count</span>,{" "}
                  <span className="text-blue-300">setCount</span>] ={" "}
                  <span className="text-amber-300">useState</span>(
                  <span className="text-orange-300">0</span>);
                </div>
                <div className="pl-3">
                  <span className="text-purple-400 font-bold">return</span> (
                </div>
                <div className="pl-6 text-zinc-400">
                  &lt;<span className="text-blue-400">button</span>{" "}
                  <span className="text-teal-300">onClick</span>={"{"}() =&gt;{" "}
                  <span className="text-blue-300">setCount</span>(c =&gt; c + 1)
                  {"}"}&gt;
                </div>
                <div className="pl-9 text-emerald-300">
                  Clicked {"{"}count{"}"} times ✨
                </div>
                <div className="pl-6 text-zinc-400">
                  &lt;/<span className="text-blue-400">button</span>&gt;
                </div>
                <div className="pl-3">);</div>
                <div>{"}"}</div>
              </div>

              <div className="border-t border-zinc-800/80 bg-zinc-950/80 px-3 py-1.5 flex items-center justify-between text-[10px] font-sans text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  &gt; Console: Rendered in 12ms (0 errors)
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[9.5px] font-bold text-blue-300">
                ⚡ Instant React & JS
              </span>
              <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-[9.5px] font-bold text-purple-300">
                🔥 Zero Setup
              </span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[9.5px] font-bold text-emerald-300">
                🚀 Multi-language
              </span>
            </div>
          </div>

          <Link
            href="/run"
            className="mt-4 h-10 sm:h-11 w-full inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 text-xs font-black shadow-md transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Open Code Playground
          </Link>
        </div>

        {/* Feature 1: Revision Flashcards */}
        <Link
          href="/revision"
          className="group flex flex-col justify-between rounded-4xl sm:rounded-[2.5rem] border border-indigo-500/20 bg-linear-to-br from-indigo-500/10 via-purple-500/5 to-white dark:to-zinc-900/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-indigo-500/40 transition-all min-w-0 w-67.5 xs:w-75 sm:w-82.5 md:w-87.5 shrink-0 snap-start"
        >
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
              <Layers className="h-5.5 w-5.5" />
            </div>
            <h3 className="font-outfit mt-4 text-base sm:text-lg font-black text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Revision Flashcards
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
              Review important concepts quickly with focused, swipeable revision
              decks.
            </p>
          </div>
          <div className="flex-1 mt-8 mb-4 flex flex-col items-center justify-center relative w-full min-h-[120px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-[80%] h-[72px] bg-indigo-500/10 border border-indigo-500/20 rounded-xl transform -rotate-6 transition-transform group-hover:-rotate-12"></div>
              <div className="absolute w-[85%] h-[80px] bg-indigo-500/15 border border-indigo-500/30 rounded-xl transform rotate-3 transition-transform group-hover:rotate-6"></div>
              <div className="relative w-[90%] h-[88px] bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-xl p-3 flex flex-col justify-between transition-transform group-hover:scale-105">
                <div className="flex justify-between items-center text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                  <span>JS Basics</span>
                  <span>4/20</span>
                </div>
                <div className="text-center font-medium text-xs text-zinc-200">
                  What is a closure?
                </div>
                <div className="flex gap-1.5">
                  <div className="h-1 flex-1 bg-rose-500/20 rounded-full"></div>
                  <div className="h-1 flex-1 bg-emerald-500/50 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-indigo-500/15 flex items-center justify-between text-xs font-black text-indigo-600 dark:text-indigo-400">
            <span>Swipeable Decks</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Feature 2: Interview Preparation */}
        <Link
          href="#interview-prep"
          className="group flex flex-col justify-between rounded-4xl sm:rounded-[2.5rem] border border-orange-500/20 bg-linear-to-br from-orange-500/10 via-amber-500/5 to-white dark:to-zinc-900/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-orange-500/40 transition-all min-w-0 w-67.5 xs:w-75 sm:w-82.5 md:w-87.5 shrink-0 snap-start"
        >
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20 group-hover:scale-105 transition-transform">
              <MessageSquareText className="h-5.5 w-5.5" />
            </div>
            <h3 className="font-outfit mt-4 text-base sm:text-lg font-black text-zinc-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              Interview Preparation
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
              Practice categorized questions with detailed, interview-ready
              answers.
            </p>
          </div>
          <div className="flex-1 mt-8 mb-4 flex flex-col justify-center gap-2.5 w-full relative min-h-[120px]">
            <div className="w-[85%] self-end bg-orange-500/10 border border-orange-500/20 rounded-2xl rounded-tr-sm p-2.5 shadow-sm transform transition-transform group-hover:-translate-x-1">
              <div className="h-1.5 w-16 bg-orange-500/30 rounded-full mb-2" />
              <div className="h-1 w-full bg-orange-500/20 rounded-full mb-1.5" />
              <div className="h-1 w-2/3 bg-orange-500/20 rounded-full" />
            </div>
            <div className="w-[90%] self-start bg-zinc-800/60 border border-zinc-700/60 rounded-2xl rounded-tl-sm p-2.5 shadow-sm transform transition-transform group-hover:translate-x-1">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
                <div className="h-1.5 w-12 bg-zinc-600 rounded-full" />
              </div>
              <div className="h-1 w-full bg-zinc-700 rounded-full mb-1.5" />
              <div className="h-1 w-[85%] bg-zinc-700 rounded-full mb-1.5" />
              <div className="h-1 w-[95%] bg-zinc-700 rounded-full" />
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-orange-500/15 flex items-center justify-between text-xs font-black text-orange-600 dark:text-orange-400">
            <span>Q&A Answer Keys</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Feature 3: Practice Quizzes */}
        <Link
          href="/quiz"
          className="group flex flex-col justify-between rounded-4xl sm:rounded-[2.5rem] border border-purple-500/20 bg-linear-to-br from-purple-500/10 via-fuchsia-500/5 to-white dark:to-zinc-900/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-purple-500/40 transition-all min-w-0 w-67.5 xs:w-75 sm:w-82.5 md:w-87.5 shrink-0 snap-start"
        >
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
              <HelpCircle className="h-5.5 w-5.5" />
            </div>
            <h3 className="font-outfit mt-4 text-base sm:text-lg font-black text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Practice Quizzes
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
              Check your understanding and find concepts that need another
              revision.
            </p>
          </div>
          <div className="flex-1 mt-8 mb-4 flex flex-col justify-center w-full relative min-h-[120px]">
            <div className="text-[10px] font-bold text-zinc-400 mb-2.5 text-center">
              Which hook runs a side effect?
            </div>
            <div className="space-y-1.5">
              <div className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-lg p-2 flex items-center gap-2 transform transition-transform group-hover:translate-x-1">
                <div className="w-2.5 h-2.5 rounded-full border border-zinc-600 shrink-0" />
                <div className="h-1 w-16 bg-zinc-700 rounded-full" />
              </div>
              <div className="w-full bg-purple-500/15 border border-purple-500/30 rounded-lg p-2 flex items-center gap-2 transform transition-transform group-hover:translate-x-2 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>
                <div className="h-1 w-24 bg-purple-400 rounded-full" />
              </div>
              <div className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-lg p-2 flex items-center gap-2 transform transition-transform group-hover:translate-x-1">
                <div className="w-2.5 h-2.5 rounded-full border border-zinc-600 shrink-0" />
                <div className="h-1 w-20 bg-zinc-700 rounded-full" />
              </div>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-purple-500/15 flex items-center justify-between text-xs font-black text-purple-600 dark:text-purple-400">
            <span>Test Recall</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Feature 4: Developer Cheatsheets */}
        <Link
          href="/cheatsheets"
          className="group flex flex-col justify-between rounded-4xl sm:rounded-[2.5rem] border border-emerald-500/20 bg-linear-to-br from-emerald-500/10 via-teal-500/5 to-white dark:to-zinc-900/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all min-w-0 w-67.5 xs:w-75 sm:w-82.5 md:w-87.5 shrink-0 snap-start"
        >
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <FileCode className="h-5.5 w-5.5" />
            </div>
            <h3 className="font-outfit mt-4 text-base sm:text-lg font-black text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Developer Cheatsheets
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
              Keep syntax, commands and commonly used patterns within quick
              reach.
            </p>
          </div>
          <div className="flex-1 mt-8 mb-4 flex flex-col items-center justify-center relative w-full min-h-[120px]">
            <div className="w-full h-full max-h-[110px] bg-zinc-950 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg flex flex-col transform transition-transform group-hover:scale-105">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 border-b border-zinc-800/80">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <span className="ml-1.5 text-[8.5px] font-mono font-medium text-zinc-500 uppercase tracking-widest">
                  git.sh
                </span>
              </div>
              <div className="p-2.5 text-[9.5px] font-mono leading-relaxed space-y-1.5">
                <div>
                  <span className="text-emerald-400 font-bold">$</span>{" "}
                  <span className="text-blue-300">git</span>{" "}
                  <span className="text-zinc-300">commit -m</span>
                </div>
                <div className="text-zinc-600 text-[8.5px] italic">
                  # Commits staged changes
                </div>
                <div className="pt-0.5">
                  <span className="text-emerald-400 font-bold">$</span>{" "}
                  <span className="text-blue-300">git</span>{" "}
                  <span className="text-zinc-300">rebase -i</span>
                </div>
                <div className="text-zinc-600 text-[8.5px] italic">
                  # Interactive rebase
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-emerald-500/15 flex items-center justify-between text-xs font-black text-emerald-600 dark:text-emerald-400">
            <span>Quick Syntax</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </section>
  );
}
