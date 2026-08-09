"use client";

import React from 'react';
import { Search } from 'lucide-react';

export default function SearchHero() {
  return (
    <section className="w-full pt-24 md:pt-28 pb-8">
            <div className="flex items-center justify-between pb-4 mb-8 border-b border-zinc-200/60 dark:border-zinc-800/60 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                <div className="flex items-center gap-2 text-emerald-500">
                    <Search size={14} />
                    <span className="text-zinc-900 dark:text-white font-bold">DISCOVER & SEARCH</span>
                    <span>•</span>
                    <span className="text-zinc-400">INTELLIGENCE SEARCH ENGINE</span>
                </div>
            </div>

            <div className="flex flex-col gap-3 max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-black font-outfit tracking-tight text-zinc-900 dark:text-white">
                    Discover.
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-base font-light leading-relaxed">
                    Search through our comprehensive database of investigative dispatches, technical reports, and philosophical essays.
                </p>
            </div>
        </section>);

}