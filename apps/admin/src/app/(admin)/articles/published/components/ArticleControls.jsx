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
    <AdminFilters className="flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
      {/* Search Input */}
      <AdminSearch
        placeholder="Search articles by title or author..."
        value={searchQuery}
        onChange={setSearchQuery}
        className="w-full md:max-w-md shrink-0"
      />

      {/* Filter and View Controls Group */}
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 sm:gap-3 min-w-0 flex-1 md:flex-initial">
        {/* Status Filter Tabs */}
        <div className="flex items-center p-1 bg-white/90 dark:bg-[#121215]/90 rounded-full border border-zinc-200/80 dark:border-zinc-800/80 text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0 overflow-x-auto scrollbar-none shadow-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full transition-all whitespace-nowrap ${statusFilter === 'all' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>
            All ({stats.total})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${statusFilter === 'published' ? 'bg-blue-600 text-white shadow-xs' : 'text-zinc-500 hover:text-blue-600'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse"></span>
            Visible
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${statusFilter === 'draft' ? 'bg-amber-500 text-white shadow-xs' : 'text-zinc-500 hover:text-amber-600'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
            Hidden
          </button>
        </div>

        {/* View Switcher (List vs Card View) */}
        <div className="flex items-center p-1 bg-white/90 dark:bg-[#121215]/90 rounded-full border border-zinc-200/80 dark:border-zinc-800/80 shrink-0 shadow-xs">
          <button
            onClick={() => setViewMode('list')}
            title="List View"
            className={`p-2 rounded-full transition-all flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${viewMode === 'list' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>
            <LayoutList size={14} />
            <span className="hidden xs:inline">List</span>
          </button>
          <button
            onClick={() => setViewMode('card')}
            title="Card View"
            className={`p-2 rounded-full transition-all flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${viewMode === 'card' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>
            <LayoutGrid size={14} />
            <span className="hidden xs:inline">Cards</span>
          </button>
        </div>
      </div>
    </AdminFilters>
  );
}
