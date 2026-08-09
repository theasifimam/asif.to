import React from 'react';
import { Search, LayoutList, LayoutGrid } from 'lucide-react';

export default function ArticleControls({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  viewMode,
  setViewMode,
  stats
}) {
  return (
    <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-zinc-950/60 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
      {/* Search Input */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-900/60 rounded-2xl flex-1 max-w-md border border-zinc-200/50 dark:border-zinc-800/50">
        <Search size={18} className="text-zinc-400" />
        <input
          type="text"
          placeholder="Search articles by title or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-xs font-medium w-full text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between md:justify-end gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-xl transition-all ${statusFilter === 'all' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>
            All ({stats.total})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${statusFilter === 'published' ? 'bg-emerald-500 text-white shadow-sm' : 'text-zinc-500 hover:text-emerald-600'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
            Visible
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${statusFilter === 'draft' ? 'bg-amber-500 text-white shadow-sm' : 'text-zinc-500 hover:text-amber-600'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
            Invisible
          </button>
        </div>

        {/* View Switcher (List vs Card View) */}
        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setViewMode('list')}
            title="List View"
            className={`p-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider ${viewMode === 'list' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>
            <LayoutList size={16} />
            <span className="hidden sm:inline">List</span>
          </button>
          <button
            onClick={() => setViewMode('card')}
            title="Card View (Show Images)"
            className={`p-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider ${viewMode === 'card' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>
            <LayoutGrid size={16} />
            <span className="hidden sm:inline">Cards</span>
          </button>
        </div>
      </div>
    </section>
  );
}
