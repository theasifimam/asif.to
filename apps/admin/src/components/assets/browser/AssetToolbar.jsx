"use client";

import {
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderPlus,
  Plus,
  RefreshCw,
  Search,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ViewToggle } from "@/components/ui/ViewToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import AssetFilterMenu from "./AssetFilterMenu";
import AssetSortMenu from "./AssetSortMenu";
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
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-zinc-100 p-2.5 sm:p-3 sm:px-5 dark:border-zinc-800/80">
        {/* Breadcrumbs & Navigation */}
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            onClick={() => openFolder(null)}
            disabled={!currentFolderId && scope === "all"}
            className="hidden sm:flex rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold text-zinc-500 truncate scrollbar-none">
            <button
              type="button"
              onClick={() => openFolder(null)}
              onDragOver={(event) => handleDragOver(event, "root")}
              onDragLeave={clearDropTarget}
              onDrop={(event) => handleDrop(event, null)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                currentFolderId === null &&
                  "font-bold text-zinc-900 dark:text-white",
              )}
            >
              <Folder className="h-3.5 w-3.5 text-blue-500" />
              <span>{SCOPE_LABELS[scope] || "All Files"}</span>
            </button>
            {breadcrumbs.map((folder) => (
              <span key={folder._id} className="flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                <button
                  type="button"
                  onClick={() => openFolder(folder)}
                  onDragOver={(event) => handleDragOver(event, folder._id)}
                  onDragLeave={clearDropTarget}
                  onDrop={(event) => handleDrop(event, folder._id)}
                  className="rounded-lg px-2 py-1 font-bold text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {folder.name}
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Button Toggle */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/80 text-zinc-600 sm:hidden dark:border-zinc-800 dark:text-zinc-300"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Desktop Search Input */}
          <div className="relative hidden sm:block sm:min-w-50">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
                setSelectedIds([]);
              }}
              placeholder="Search files…"
              className="h-9 rounded-xl bg-zinc-50 pl-9 pr-8 text-xs dark:bg-zinc-900"
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

          {/* View Switcher Toggle */}
          <ViewToggle view={view} onViewChange={setView} />

          {/* Refresh Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={refresh}
            aria-label="Refresh"
            className="h-9 w-9 rounded-xl"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Filter Dropdown */}
          <AssetFilterMenu
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
          />

          {/* Sort Dropdown */}
          <AssetSortMenu
            sort={sort}
            setSort={setSort}
            setPage={setPage}
          />

          {/* Consolidated Action Dropdown (+ New) for Desktop */}
          {scope !== "trash" && (canUpload || canManage) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  className="hidden sm:flex h-9 gap-1 rounded-xl font-bold text-xs shadow-md shadow-blue-600/15 px-3"
                >
                  <Plus className="h-4 w-4" />
                  <span>New</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1.5">
                {canUpload && (
                  <DropdownMenuItem
                    onSelect={() => setUploadOpen(true)}
                    className="gap-2.5 py-2 font-semibold"
                  >
                    <Upload className="h-4 w-4 text-blue-600" />
                    <span>Upload files</span>
                  </DropdownMenuItem>
                )}
                {!pickerMode && canManage && (
                  <DropdownMenuItem
                    onSelect={() => setDialog({ type: "create-folder" })}
                    className="gap-2.5 py-2 font-semibold"
                  >
                    <FolderPlus className="h-4 w-4 text-amber-500" />
                    <span>New folder</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* Mobile Expandable Search Bar */}
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
              placeholder="Search files by name..."
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
