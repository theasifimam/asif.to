import React from 'react';
import { LayoutList, LayoutGrid } from 'lucide-react';
import { AdminFilters, AdminSearch } from '@/components/admin';

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
    <AdminFilters className="items-stretch md:items-center">
      {/* Search Input */}
      <AdminSearch
          placeholder="Search articles by title or author..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="max-w-md"
      />

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
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${statusFilter === 'published' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-500 hover:text-blue-600'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse"></span>
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
    </AdminFilters>
  );
}
