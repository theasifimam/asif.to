"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function AuthLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || !mounted || user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-800 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Checking session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground flex flex-col lg:flex-row items-center justify-center lg:gap-16 p-4 sm:p-8 lg:p-24 transition-colors duration-300 relative overflow-hidden font-sans">
      {/* Background Decorative Ambient Glows matching apps/web */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Left Branding Panel (Hidden on mobile/tablet, visible on lg screens) */}
      <div className="hidden lg:flex lg:flex-col lg:w-[48%] max-w-xl justify-center gap-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <img
            src="/logo.png"
            alt="asif.to"
            className="w-20 h-20 rounded-2xl object-contain shadow-md border border-zinc-200 dark:border-zinc-800"
          />
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-outfit font-black text-5xl tracking-tighter text-zinc-900 dark:text-white">
                asif
                <span className="text-blue-600 dark:text-blue-400">.to</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 self-start mt-2">
                Admin
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-2xl text-zinc-800 dark:text-zinc-200 font-outfit font-black tracking-tight leading-snug">
                Centralized{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  Command Center
                </span>
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed">
                Centralized command center and content orchestration engine for
                learning tracks, interactive articles, and course settings.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bottom Quote section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="border-t border-zinc-200 dark:border-zinc-800/80 pt-8"
        >
          <div className="relative pl-6">
            <span className="absolute left-0 top-0 text-5xl font-serif text-blue-500/40 leading-none">
              “
            </span>
            <p className="text-2xl font-black font-outfit tracking-tight text-zinc-850 dark:text-zinc-200 leading-snug">
              Simplicity is the ultimate sophistication.
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold mt-2 leading-relaxed">
              Orchestrate learning tracks & knowledge structures with absolute
              precision.
            </p>
            <span className="block mt-4 text-[10px] font-black tracking-widest text-blue-600 dark:text-blue-400 font-outfit">
              &mdash; admin.asif.to
            </span>
          </div>
        </motion.div>
      </div>

      {/* Right Form Panel with floating card */}
      <div className="flex items-center justify-center relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-blue-500/5 dark:shadow-black/50"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
