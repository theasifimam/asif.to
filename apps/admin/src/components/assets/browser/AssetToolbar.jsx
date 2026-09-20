"use client";

import {
  ChevronLeft,
  ChevronRight,
  Folder,
  Search,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import AssetSettingsIsland from "./AssetSettingsIsland";
import { SCOPE_LABELS } from "./constants";

export default function AssetToolbar({
  scope,
  setScope,
  currentFolderId,
  breadcrumbs = [],
  openFolder,
  handleDragOver,
  clearDropTarget,
  handleDrop,
  search,
  setSearch,
  setPage,
  setSelectedIds,
  mobileSearchOpen,
  setMobileSearchOpen,
  view,
  setView,
  refresh,
  canUpload,
  canManage,
  setUploadOpen,
  setDialog,
  pickerMode = false,
  sort,
  setSort,
  usageFilter,
  setUsageFilter,
  uploaderFilter,
  setUploaderFilter,
  dateFilter,
  setDateFilter,
  uploaders,
  activeFilterCount,
  resetFilters,
  onScopeChange,
}) {
  return (
    <>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-100 p-3 sm:px-6 dark:border-zinc-800/80">
        {/* Left Side: Page Heading & Breadcrumbs */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {currentFolderId && (
            <button
              type="button"
              onClick={() => openFolder(null)}
              className="flex rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black font-outfit text-zinc-950 dark:text-white tracking-tight shrink-0">
              Files
            </h1>

            <div className="flex items-center gap-1 min-w-0 text-xs font-semibold text-zinc-500 whitespace-nowrap overflow-x-auto scrollbar-none">
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <button
                type="button"
                onClick={() => openFolder(null)}
                onDragOver={(event) => handleDragOver(event, "root")}
                onDragLeave={clearDropTarget}
                onDrop={(event) => handleDrop(event, null)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
                  currentFolderId === null &&
                    "font-bold text-zinc-900 dark:text-white",
                )}
              >
                <Folder className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span className="truncate">{SCOPE_LABELS[scope] || "All Files"}</span>
              </button>
              {breadcrumbs.map((folder) => (
                <span key={folder._id} className="flex items-center gap-1">
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <button
                    type="button"
                    onClick={() => openFolder(folder)}
                    onDragOver={(event) => handleDragOver(event, folder._id)}
                    onDragLeave={clearDropTarget}
                    onDrop={(event) => handleDrop(event, folder._id)}
                    className="rounded-lg px-2 py-1 font-bold text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 truncate"
                  >
                    {folder.name}
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Search Toggle */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/80 text-zinc-600 sm:hidden dark:border-zinc-800 dark:text-zinc-300"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Search Input */}
          <div className="relative hidden sm:block sm:w-48 lg:w-60">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
                setSelectedIds([]);
              }}
              placeholder="Search files..."
              className="h-9 rounded-xl bg-zinc-50 pl-9 pr-8 text-xs dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <AssetSettingsIsland
            scope={scope}
            setScope={setScope}
            usageFilter={usageFilter}
            setUsageFilter={setUsageFilter}
            uploaderFilter={uploaderFilter}
            setUploaderFilter={setUploaderFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            uploaders={uploaders}
            activeFilterCount={activeFilterCount}
            resetFilters={resetFilters}
            pickerMode={pickerMode}
            onScopeChange={onScopeChange}
            sort={sort}
            setSort={setSort}
            setPage={setPage}
            view={view}
            setView={setView}
            refresh={refresh}
            canUpload={canUpload}
            canManage={canManage}
            setUploadOpen={setUploadOpen}
            setDialog={setDialog}
          />
        </div>
      </header>

      {/* Mobile Search Input */}
      {mobileSearchOpen && (
        <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50 p-2 sm:hidden dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
                setSelectedIds([]);
              }}
              placeholder="Search files..."
              className="h-9 rounded-xl bg-white pl-9 pr-8 text-xs dark:bg-zinc-950"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMobileSearchOpen(false)}
            className="rounded-lg p-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
}
