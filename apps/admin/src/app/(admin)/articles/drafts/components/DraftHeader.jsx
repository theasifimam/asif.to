import React from "react";
import Link from "next/link";
import { Plus, LayoutGrid, LayoutList } from "lucide-react";

export default function DraftHeader({ viewMode, setViewMode }) {
  return (
    <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="w-12 h-px bg-zinc-400 dark:bg-zinc-800"></span>
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">
            Draft Articles
          </span>
        </div>
        <h1 className="text-4xl md:text-7xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white">
          Drafts.
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* View Mode Toggle */}
        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setViewMode("card")}
            className={`p-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider ${viewMode === "card" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
          >
            <LayoutGrid size={16} />
            <span className="hidden sm:inline">Cards</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider ${viewMode === "list" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
          >
            <LayoutList size={16} />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>

        <Link
          href="/articles/new"
          className="flex items-center gap-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-xl shadow-black/10 transition-all"
        >
          <Plus size={18} />
          Create Article
        </Link>
      </div>
    </section>
  );
}
