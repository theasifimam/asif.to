"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Bookmark,
  Share2,
  Check,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react";

function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={`${className} fill-current`} viewBox="0 0 24 24">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.105 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

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
        <div className="p-6 sm:p-10 rounded-4xl sm:rounded-[3rem] bg-white dark:bg-zinc-900/90 shadow-lg shadow-black/5 dark:shadow-black/20 flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            {/* Brand */}
            <div className="flex flex-col gap-3.5 max-w-sm">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative">
                  <img
                    src="/logo.png"
                    alt="asif.to"
                    className="w-9 h-9 rounded-xl object-contain group-hover:scale-105 transition-transform"
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

              {/* Social Media Badges */}
              <div className="flex flex-col gap-1.5 pt-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                  Follow Us{" "}
                  <span className="text-blue-600 dark:text-blue-400">
                    @theasifto
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://instagram.com/theasifto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-linear-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white transition-all shadow-xs"
                    title="Instagram @theasifto"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="https://facebook.com/theasifto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-[#1877F2] hover:text-white transition-all shadow-xs"
                    title="Facebook @theasifto"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href="https://linkedin.com/company/asif.to"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-[#0A66C2] hover:text-white transition-all shadow-xs"
                    title="LinkedIn @theasifto"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="https://wa.me/theasifto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-[#25D366] hover:text-white transition-all shadow-xs"
                    title="WhatsApp @theasifto"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                  </a>
                </div>
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

              {/* Follow Us Handles */}
              <div className="flex flex-col gap-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Follow @theasifto
                </h4>
                <nav className="flex flex-col gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  <a
                    href="https://instagram.com/theasifto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </a>
                  <a
                    href="https://facebook.com/theasifto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                    <span>Facebook</span>
                  </a>
                  <a
                    href="https://linkedin.com/in/theasifto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="https://wa.me/theasifto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-emerald-500 transition-colors"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
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
                    href="/privacy"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
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
