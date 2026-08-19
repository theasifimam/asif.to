"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowLeft,
  Home,
  BookOpen,
  FileCode,
  MessagesSquare,
  Code2,
  Bookmark,
  Sparkles,
  Terminal,
  Compass,
  ArrowRight,
} from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  const openGlobalSearch = (query = "") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("asif:open-search", {
          detail: { query: typeof query === "string" ? query.trim() : "" },
        }),
      );
    }
  };

  const quickLinks = [
    {
      title: "Explore Courses",
      description:
        "Step-by-step masterclasses with chapters, quizzes, and projects.",
      href: "/",
      icon: BookOpen,
      badge: "Curriculum",
      color:
        "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50",
      iconBg: "bg-blue-600 text-white",
    },
    {
      title: "Interview Questions",
      description:
        "Real-world technical questions, curated answers, and code examples.",
      href: "/interview-questions",
      icon: MessagesSquare,
      badge: "Interview Prep",
      color:
        "from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400 border-orange-200/50 dark:border-orange-800/50",
      iconBg: "bg-orange-600 text-white",
    },
    {
      title: "Syntax Cheatsheets",
      description: "Quick reference cards, methods, and syntax lookup tables.",
      href: "/cheatsheets",
      icon: FileCode,
      badge: "Quick Reference",
      color:
        "from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50",
      iconBg: "bg-purple-600 text-white",
    },
    {
      title: "Technical Articles",
      description:
        "Deep dive explanations, tutorials, and practical architecture guides.",
      href: "/articles",
      icon: Sparkles,
      badge: "Articles",
      color:
        "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50",
      iconBg: "bg-emerald-600 text-white",
    },
    {
      title: "Code Playground",
      description:
        "Test, prototype, and run JavaScript and web code snippets interactively.",
      href: "/playground",
      icon: Code2,
      badge: "Interactive",
      color:
        "from-cyan-500/10 to-sky-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200/50 dark:border-cyan-800/50",
      iconBg: "bg-cyan-600 text-white",
    },
    {
      title: "Personal Library",
      description:
        "Access your saved notes, bookmarks, snippets, and collections.",
      href: "/library",
      icon: Bookmark,
      badge: "Saved",
      color:
        "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50",
      iconBg: "bg-rose-600 text-white",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-20 flex flex-col gap-10">
        {/* Top Hero Error Card */}
        <section className="relative overflow-hidden rounded-4xl sm:rounded-[3rem] bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-12 shadow-xl shadow-zinc-200/50 dark:shadow-black/40">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-linear-to-br from-blue-500/15 via-purple-500/15 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 rounded-full bg-linear-to-tr from-cyan-500/10 via-emerald-500/10 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-black tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>404 · Page Not Found</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-5 font-outfit text-4xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
              Lost in the Codebase?
            </h1>

            <p className="mt-4 text-sm sm:text-base font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
              The page or resource you are looking for might have been moved,
              renamed, or temporarily took a coffee break.
            </p>

            {/* Developer Code Box */}
            <div className="w-full mt-6 rounded-2xl bg-zinc-900 text-zinc-300 p-4 text-left font-mono text-xs border border-zinc-800 shadow-inner overflow-x-auto">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-800 text-zinc-500">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] font-semibold">
                  asif.to/router-diagnostics
                </span>
              </div>
              <p className="text-red-400">
                <span className="text-zinc-500">$</span> HTTP 404:
                ERR_RESOURCE_NOT_FOUND
              </p>
              <p className="text-zinc-400 mt-1">
                &gt; Resolution suggested: Try searching below or navigating to
                popular roadmaps.
              </p>
            </div>

            {/* Global Search Trigger Bar */}
            <button
              type="button"
              onClick={() => openGlobalSearch()}
              aria-label="Open Global Search"
              className="group w-full mt-7 relative flex items-center justify-between pl-4 pr-2 py-3 sm:py-3.5 rounded-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-left shadow-md shadow-zinc-200/50 dark:shadow-black/20 hover:border-blue-500/80 dark:hover:border-blue-500/80 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0 text-zinc-400 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors">
                <Search className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="text-xs sm:text-sm font-medium truncate">
                  Search courses, chapters, interview questions, syntax...
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 shadow-2xs">
                  ⌘K
                </kbd>
                <span className="px-3.5 py-1.5 rounded-full bg-blue-600 group-hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/25">
                  Search
                </span>
              </div>
            </button>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 text-xs font-extrabold transition-all active:scale-95 shadow-sm"
              >
                <Home className="w-4 h-4" />
                <span>Return to Homepage</span>
              </Link>
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-extrabold transition-all active:scale-95 border border-zinc-200 dark:border-zinc-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </section>

        {/* Popular Resources Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-outfit font-black tracking-tight text-foreground flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Popular Destinations
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                Quick pathways to continue learning and building on asif.to
              </p>
            </div>
            <Link
              href="/search"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className="group relative flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div
                        className={`w-10 h-10 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="font-outfit font-extrabold text-base text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                    <span>Jump to section</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
