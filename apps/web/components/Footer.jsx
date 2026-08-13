"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Bookmark, Share2, Check, Sparkles } from "lucide-react";

export default function Footer({ containerWidth = "max-w-7xl" }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("https://asif.to");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBookmark = () => {
    if (typeof window !== "undefined") {
      alert("Press Ctrl+D (or Cmd+D) to bookmark asif.to in your browser!");
    }
  };

  return (
    <footer className="w-full mt-auto pt-8">
      <div
        className={`w-full ${containerWidth} mx-auto px-4 sm:px-6 pb-28 md:pb-12 transition-all duration-300`}
      >
        <div className="p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] bg-white dark:bg-zinc-900/90 shadow-lg shadow-black/5 dark:shadow-black/20 flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            {/* Brand */}
            <div className="flex flex-col gap-3.5 max-w-sm">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative">
                  <img
                    src="/logo.png"
                    alt="asif.to"
                    className="w-9 h-9 rounded-xl object-contain shadow-sm group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-outfit font-black text-2xl tracking-tight text-foreground leading-none">
                    asif
                    <span className="text-blue-600 dark:text-blue-400">
                      .to
                    </span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    Coding Tutorials & Cheatsheets
                  </span>
                </div>
              </Link>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Modern step-by-step coding courses, instant syntax cheatsheets,
                interactive flashcards, and practice quizzes for React, Next.js,
                Express, Node & MongoDB.
              </p>

              {/* Bookmark & Share CTA Buttons */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  onClick={handleBookmark}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all border border-blue-500/20 active:scale-95"
                  title="Bookmark asif.to in your browser"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Bookmark asif.to</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 text-xs font-bold transition-all active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share asif.to</span>
                    </>
                  )}
                </button>
              </div>

              <a
                href="mailto:support@asif.to"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit pt-0.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>support@asif.to</span>
              </a>
            </div>

            {/* Navigation Columns */}
            <div className="flex flex-wrap gap-8 sm:gap-12">
              {/* Learning Navigation */}
              <div className="flex flex-col gap-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Navigation
                </h4>
                <nav className="flex flex-col gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  <Link
                    href="/"
                    className="hover:text-foreground transition-colors"
                  >
                    Courses
                  </Link>
                  <Link
                    href="/cheatsheets"
                    className="hover:text-foreground transition-colors"
                  >
                    Cheatsheets
                  </Link>
                  <Link
                    href="/revision"
                    className="hover:text-foreground transition-colors"
                  >
                    Revision Deck
                  </Link>
                  <Link
                    href="/quiz"
                    className="hover:text-foreground transition-colors"
                  >
                    Practice Quiz
                  </Link>
                  <Link
                    href="/bookmarks"
                    className="hover:text-foreground transition-colors"
                  >
                    Saved Notes
                  </Link>
                </nav>
              </div>

              {/* Popular Tracks */}
              <div className="flex flex-col gap-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Popular Tracks
                </h4>
                <nav className="flex flex-col gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  <Link
                    href="/courses/reactjs"
                    className="hover:text-foreground transition-colors"
                  >
                    React.js Course
                  </Link>
                  <Link
                    href="/courses/nextjs"
                    className="hover:text-foreground transition-colors"
                  >
                    Next.js Course
                  </Link>
                  <Link
                    href="/courses/expressjs"
                    className="hover:text-foreground transition-colors"
                  >
                    Express.js API
                  </Link>
                  <Link
                    href="/courses/mongodb"
                    className="hover:text-foreground transition-colors"
                  >
                    MongoDB Database
                  </Link>
                  <Link
                    href="/courses/tailwindcss"
                    className="hover:text-foreground transition-colors"
                  >
                    Tailwind CSS
                  </Link>
                </nav>
              </div>

              {/* Company & Legal */}
              <div className="flex flex-col gap-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Company & Legal
                </h4>
                <nav className="flex flex-col gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  <Link
                    href="/about"
                    className="hover:text-foreground transition-colors"
                  >
                    About Us
                  </Link>
                  <Link
                    href="/author/asif"
                    className="hover:text-foreground transition-colors"
                  >
                    Author: Asif
                  </Link>
                  <Link
                    href="/contact"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact Us
                  </Link>
                  <Link
                    href="/legal/privacy-policy"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/legal/terms-conditions"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms & Conditions
                  </Link>
                  <Link
                    href="/legal/cookie-usage"
                    className="hover:text-foreground transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </nav>
              </div>
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-zinc-400">
            <p>
              &copy; {new Date().getFullYear()} asif.to. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-[11px]">
              <a
                href="mailto:support@asif.to"
                className="hover:text-blue-500 transition-colors"
              >
                support@asif.to
              </a>
              <span>•</span>
              <Link
                href="/legal/privacy-policy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <span>•</span>
              <Link
                href="/legal/terms-conditions"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
