"use client";

import {
  FileCode,
  FileText,
  Film,
  FolderTree,
  Image as ImageIcon,
  Music,
  Star,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const CATEGORIES = [
  {
    id: "images",
    label: "Images",
    scope: "images",
    icon: ImageIcon,
    badge: "Photos & Graphics",
    accent:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:border-emerald-500/50",
    activeAccent:
      "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 border-emerald-600",
  },
  {
    id: "videos",
    label: "Videos",
    scope: "videos",
    icon: Film,
    badge: "Media & Clips",
    accent:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:border-blue-500/50",
    activeAccent:
      "bg-blue-600 text-white shadow-lg shadow-blue-500/25 border-blue-600",
  },
  {
    id: "audio",
    label: "Audio",
    scope: "audio",
    icon: Music,
    badge: "Music & Sound",
    accent:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:border-purple-500/50",
    activeAccent:
      "bg-purple-600 text-white shadow-lg shadow-purple-500/25 border-purple-600",
  },
  {
    id: "documents",
    label: "Documents",
    scope: "documents",
    icon: FileText,
    badge: "PDFs & Docs",
    accent:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:border-amber-500/50",
    activeAccent:
      "bg-amber-600 text-white shadow-lg shadow-amber-500/25 border-amber-600",
  },
  {
    id: "code",
    label: "Code & Archives",
    scope: "code",
    icon: FileCode,
    badge: "Scripts & Zip",
    accent:
      "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 hover:border-cyan-500/50",
    activeAccent:
      "bg-cyan-600 text-white shadow-lg shadow-cyan-500/25 border-cyan-600",
  },
  {
    id: "favorites",
    label: "Favorites",
    scope: "favorites",
    icon: Star,
    badge: "Starred Items",
    accent:
      "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 hover:border-yellow-500/50",
    activeAccent:
      "bg-amber-500 text-white shadow-lg shadow-amber-500/25 border-amber-500",
  },
  {
    id: "trash",
    label: "Trash",
    scope: "trash",
    icon: Trash2,
    badge: "Deleted Files",
    accent:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:border-rose-500/50",
    activeAccent:
      "bg-rose-600 text-white shadow-lg shadow-rose-500/25 border-rose-600",
  },
  {
    id: "all",
    label: "All Files",
    scope: "all",
    icon: FolderTree,
    badge: "Entire Library",
    accent:
      "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20 hover:border-zinc-500/50",
    activeAccent:
      "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-lg border-zinc-950 dark:border-white",
  },
];

export default function AssetCategoryGrid({
  scope = "all",
  setScope,
  currentFolderId,
  openFolder,
  onScopeChange,
}) {
  const handleCategoryClick = (targetScope) => {
    const nextScope =
      scope === targetScope && targetScope !== "all" ? "all" : targetScope;
    setScope(nextScope);
    if (onScopeChange) {
      onScopeChange(nextScope);
    }
  };

  return (
    <section className="mb-6 px-3 sm:px-4 pt-3">
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
          <span>Categories &amp; Collections</span>
        </h2>
        {scope !== "all" && (
          <button
            type="button"
            onClick={() => handleCategoryClick("all")}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Show All Files
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = scope === cat.scope;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.scope)}
              className={cn(
                "group relative flex flex-col justify-between p-3 rounded-xl sm:rounded-2xl border transition-all text-left cursor-pointer outline-none active:scale-[0.98] backdrop-blur-xs shadow-xs",
                isActive
                  ? cat.activeAccent
                  : cn(cat.accent, "bg-white/80 dark:bg-zinc-900/60"),
              )}
            >
              <div className="flex items-center justify-between gap-1 w-full mb-2">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                    isActive
                      ? cat.id === "all"
                        ? "bg-white/20 text-white dark:bg-zinc-950/15 dark:text-zinc-950"
                        : "bg-white/20 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-current group-hover:scale-105",
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                {isActive && (
                  <span
                    className={cn(
                      "flex h-2 w-2 rounded-full animate-pulse",
                      cat.id === "all"
                        ? "bg-white dark:bg-zinc-950"
                        : "bg-white",
                    )}
                  />
                )}
              </div>

              <div>
                <p className="text-xs font-black font-outfit truncate tracking-tight">
                  {cat.label}
                </p>
                <p
                  className={cn(
                    "text-[10px] font-medium truncate mt-0.5",
                    isActive
                      ? cat.id === "all"
                        ? "text-zinc-300 dark:text-zinc-600"
                        : "text-white/80"
                      : "text-zinc-400 dark:text-zinc-500",
                  )}
                >
                  {cat.badge}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
