"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 animate-pulse" />);

  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
      aria-label="Toggle theme">
      
      <AnimatePresence mode="wait">
        <motion.div
          key={resolvedTheme}
          initial={{ y: 20, opacity: 0, rotate: 45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: -45 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}>
          
          {resolvedTheme === "dark" ?
          <Sun size={18} className="text-zinc-100 group-hover:scale-110 transition-transform" /> :

          <Moon size={18} className="text-zinc-900 group-hover:scale-110 transition-transform" />
          }
        </motion.div>
      </AnimatePresence>
    </button>);

}