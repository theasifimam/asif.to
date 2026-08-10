"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";

export default function LogoutConfirm({ isOpen, onClose, onConfirm }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 flex flex-col items-center text-center shadow-2xl border border-zinc-200 dark:border-zinc-800"
          >
            <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 mb-8">
              <LogOut size={28} />
            </div>
            <h2 className="text-2xl font-bold font-outfit mb-3">
              Sign Out Now?
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-10 leading-relaxed font-medium">
              You are about to sign out of asif.to. You'll need to
              re-authenticate to access your Intel library.
            </p>
            <div className="flex flex-col w-full gap-3">
              <button
                onClick={onConfirm}
                className="w-full py-4 bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95"
              >
                Confirm Sign Out
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95"
              >
                Stay Signed In
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
