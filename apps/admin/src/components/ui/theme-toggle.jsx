"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }) {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const currentTheme = resolvedTheme || theme;

  return (
    <button
      type="button"
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200/80 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer touch-manipulation",
        className,
      )}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <div className="relative flex items-center justify-center">
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-zinc-700 dark:text-zinc-300" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-zinc-700 dark:text-zinc-300" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
