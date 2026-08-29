"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import React from 'react';
import { Search as SearchIcon, SlidersHorizontal } from 'lucide-react';
import CategoryTabs from '@/components/articles/CategoryTabs';










export default function SearchFilters({
  searchQuery,
  onSearchChange,
  topics,
  topicsLoading,
  activeTopicId,
  onTopicChange
}) {
  return (
    <div className="w-full flex flex-col gap-2">
            {/* Search Bar */}
            <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400">
                    <SearchIcon size={20} />
                </div>
                <input
          type="text"
          placeholder="Search Investigations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-[1.5rem] py-5 pl-16 pr-16 text-sm font-bold tracking-tight text-zinc-900 dark:text-white focus:outline-none focus:ring-0 transition-all placeholder:text-zinc-400" />
        
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 cursor-pointer">
                    <SlidersHorizontal size={20} />
                </div>
            </div>

            {/* Category Tabs */}
            {topicsLoading ?
      <div className="flex items-center gap-4 py-8">
                    <LogoLoader className=" text-zinc-400" size={20}  />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Retrieving Topics...</span>
                </div> :

      <CategoryTabs
        categories={topics.map((t) => t.name)}
        activeCategory={topics.find((t) => t._id === activeTopicId)?.name || ''}
        onCategoryChange={(name) => {
          const topic = topics.find((t) => t.name === name);
          if (topic) onTopicChange(topic._id);
        }} />

      }
        </div>);

}