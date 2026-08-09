import React from "react";
import Link from "next/link";

export default function Footer({ containerWidth = "max-w-5xl" }) {
  return (
    <footer className="w-full mt-auto pt-8">
      <div className={`w-full ${containerWidth} mx-auto px-4 sm:px-6 pb-28 md:pb-12 transition-all duration-300`}>
        <div className="p-8 sm:p-10 rounded-[3rem] bg-white dark:bg-zinc-900/90 shadow-lg shadow-black/5 dark:shadow-black/20 flex flex-col gap-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            {/* Brand */}
            <div className="flex flex-col gap-3 max-w-sm">
              <Link href="/" className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-500/30">
                  &lt;/&gt;
                </span>
                <span className="font-outfit font-black text-xl tracking-tight text-foreground">
                  asif<span className="text-blue-600 dark:text-blue-400">.to</span>
                </span>
              </Link>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Modern step-by-step coding courses, instant syntax cheatsheets, interactive flashcards, and quizzes for React, Next.js, Express, Node & MongoDB.
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-10">
              <div className="flex flex-col gap-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Navigation
                </h4>
                <nav className="flex flex-col gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  <Link href="/" className="hover:text-foreground transition-colors">Courses</Link>
                  <Link href="/cheatsheets" className="hover:text-foreground transition-colors">Cheatsheets</Link>
                  <Link href="/revision" className="hover:text-foreground transition-colors">Revision Deck</Link>
                  <Link href="/quiz" className="hover:text-foreground transition-colors">Practice Quiz</Link>
                  <Link href="/bookmarks" className="hover:text-foreground transition-colors">Saved Notes</Link>
                </nav>
              </div>

              <div className="flex flex-col gap-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Popular Tracks
                </h4>
                <nav className="flex flex-col gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  <Link href="/courses/reactjs" className="hover:text-foreground transition-colors">React.js Course</Link>
                  <Link href="/courses/nextjs" className="hover:text-foreground transition-colors">Next.js Course</Link>
                  <Link href="/courses/expressjs" className="hover:text-foreground transition-colors">Express.js API</Link>
                  <Link href="/courses/mongodb" className="hover:text-foreground transition-colors">MongoDB Database</Link>
                  <Link href="/courses/tailwindcss" className="hover:text-foreground transition-colors">Tailwind CSS</Link>
                </nav>
              </div>
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-zinc-400">
            <p>&copy; {new Date().getFullYear()} asif.to. Modern Web Development Platform.</p>
            <span className="text-[11px]">Mobile-First • React • Next.js • Tailwind CSS</span>
          </div>

        </div>
      </div>
    </footer>
  );
}