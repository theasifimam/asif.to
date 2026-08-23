"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { getRandomMotivationalQuote } from "@/lib/quotes";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }) {
  const [quote, setQuote] = useState(null);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    setQuote(getRandomMotivationalQuote());
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-800 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground flex flex-col lg:flex-row items-center justify-center lg:gap-12 xl:gap-16 p-4 sm:p-8 lg:p-12 transition-colors duration-300 relative overflow-hidden font-sans">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Left Branding Panel featuring Random Motivational Quote */}
      <div className="hidden lg:flex lg:flex-col lg:w-[50%] max-w-2xl justify-center gap-8 relative z-10">
        {/* Brand Header Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="asif.to"
              className="w-12 h-12 rounded-2xl object-contain shadow-xs border border-zinc-200 dark:border-zinc-800 group-hover:scale-105 transition-transform"
            />
            <div className="flex items-center gap-2">
              <span className="font-outfit font-black text-3xl tracking-tight text-zinc-900 dark:text-white">
                asif<span className="text-blue-600 dark:text-blue-400">.to</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                Learning Platform
              </span>
            </div>
          </Link>
        </motion.div>

        {/* 🌟 Random Motivational Quote Section - LARGEST TEXT ON THE SCREEN */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-5 relative"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-[0.2em] border border-blue-500/20 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Daily Motivation</span>
          </div>

          <div className="relative pl-6 sm:pl-8 border-l-4 border-blue-600 dark:border-blue-400">
            <h1 className="font-outfit text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-zinc-950 dark:text-white">
              “{quote?.text || "Simplicity is the ultimate sophistication."}”
            </h1>
            <p className="mt-4 text-base sm:text-lg font-bold font-outfit text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              &mdash; {quote?.author || "Leonardo da Vinci"}
            </p>
          </div>
        </motion.div>

        {/* Subtitle / Platform Info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80"
        >
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed max-w-xl">
            Interactive learning platform featuring hands-on courses, bite-sized tutorials, code playgrounds, and developer certificates.
          </p>
        </motion.div>
      </div>

      {/* Right Form Panel with floating card */}
      <div className="flex items-center justify-center relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
