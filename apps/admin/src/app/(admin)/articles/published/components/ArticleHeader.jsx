import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function ArticleHeader() {
  return (
    <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="w-12 h-[1px] bg-zinc-400 dark:bg-zinc-800"></span>
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Articles Manager</span>
        </div>
        <h1 className="text-4xl md:text-7xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white">
          Articles.
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/articles/new"
          className="flex items-center gap-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 shadow-xl shadow-black/10 dark:shadow-white/5 transition-all">
          <Plus size={18} />
          Create New Article
        </Link>
      </div>
    </section>
  );
}
