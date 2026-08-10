"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  BookOpen,
  Code2,
  Layers,
  Brain,
  Sparkles,
  Mail,
  CheckCircle2,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground font-sans transition-colors duration-300">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 space-y-12">
        {/* Hero Section */}
        <section className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            About asif.to
          </div>
          <h1 className="text-3xl sm:text-6xl font-black text-foreground tracking-tight leading-tight">
            Empowering Modern Developers with Zero-Noise Web Learning.
          </h1>
          <p className="text-base sm:text-xl font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
            <strong>asif.to</strong> is a modern web development platform
            engineered for developers, students, and engineers. We build
            structured step-by-step courses, instant syntax cheatsheets,
            interactive revision decks, and practice quizzes for Full-Stack
            JavaScript technologies.
          </p>
        </section>

        {/* Core Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
            <div className="p-3 w-fit rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-foreground">
              Structured Course Tracks
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
              Step-by-step tutorial lessons on React, Next.js, Express, Node.js,
              and MongoDB built with clean examples, syntax highlights, and
              real-world projects.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
            <div className="p-3 w-fit rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-foreground">
              Instant Cheatsheets
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
              Quick reference code snippets with 1-click clipboard copying to
              streamline daily coding workflows and syntax lookups.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
            <div className="p-3 w-fit rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-foreground">
              Interactive Learning Tools
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
              Revision decks, flashcards, and quizzes designed to solidify
              fundamental algorithms, framework concepts, and interview prep.
            </p>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="p-8 sm:p-12 rounded-2xl sm:rounded-[2.5rem] bg-linear-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/20 space-y-4">
          <h2 className="text-xl sm:text-3xl font-black text-foreground">
            Our Philosophy
          </h2>
          <p className="text-xs sm:text-base text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed max-w-4xl">
            We believe technical educational resources should be clear,
            interactive, and beautifully accessible across desktop and mobile
            devices alike. No bloated paywalls or repetitive fluff — just
            high-signal, practical coding knowledge.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/courses"
              className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              Explore All Courses
            </Link>
            <a
              href="mailto:support@asif.to"
              className="px-6 py-3 rounded-full bg-white dark:bg-zinc-900 text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-xs border border-zinc-200 dark:border-zinc-800 transition-all flex items-center gap-2"
            >
              <Mail className="w-4 h-4 text-blue-500" />
              <span>support@asif.to</span>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
