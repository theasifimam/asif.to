"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpDown,
  Check,
  ChevronRight,
  Clock3,
  Filter,
  Folder,
  FolderPlus,
  Grid2X2,
  List,
  ListFilter,
  RefreshCw,
  SlidersHorizontal,
  SortAsc,
  Upload,
  User,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DATE_LABELS,
  SCOPE_LABELS,
  SORT_LABELS,
  USAGE_LABELS,
} from "./constants";

const scopeOptions = [
  ["all", "All Files"],
  ["images", "Images"],
  ["videos", "Videos"],
  ["audio", "Audio"],
  ["documents", "Documents"],
  ["code", "Code & Archives"],
  ["recent", "Recent"],
  ["favorites", "Favorites"],
  ["unused", "Orphans"],
  ["trash", "Trash"],
];

const sortOptions = Object.entries(SORT_LABELS);
const usageOptions = Object.entries(USAGE_LABELS);
const dateOptions = Object.entries(DATE_LABELS);

function OptionRow({ label, active, onClick, destructive = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-colors",
        active
          ? "bg-blue-600 text-white shadow-sm"
          : destructive
            ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
      )}
    >
      <span>{label}</span>
      {active && <Check className="h-4 w-4 shrink-0" />}
    </button>
  );
}

function NavigationRow({ icon: Icon, label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-zinc-900 dark:text-zinc-100">{label}</span>
        {value && <span className="mt-0.5 block truncate text-[11px] font-medium text-zinc-500">{value}</span>}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" />
    </button>
  );
}

export default function AssetSettingsIsland({
  scope,
  setScope,
  usageFilter,
  setUsageFilter,
  uploaderFilter,
  setUploaderFilter,
  dateFilter,
  setDateFilter,
  uploaders = [],
  activeFilterCount,
  resetFilters,
  pickerMode = false,
  onScopeChange,
  sort,
  setSort,
  setPage,
  view,
  setView,
  refresh,
  canUpload,
  canManage,
  setUploadOpen,
  setDialog,
}) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState(null);
  const hasActiveSettings = activeFilterCount > 0 || sort !== "newest" || view !== "list";

  const close = () => {
    setOpen(false);
    setSection(null);
  };

  const choose = (callback, closeAfter = false) => {
    callback();
    if (closeAfter) close();
  };

  const renderSection = () => {
    if (section === "category") {
      return (
        <div className="space-y-1">
          {scopeOptions.map(([value, label]) => (
            <OptionRow
              key={value}
              label={label}
              active={scope === value}
              destructive={value === "trash"}
              onClick={() => choose(() => { setScope(value); onScopeChange?.(); }, true)}
            />
          ))}
        </div>
      );
    }

    if (section === "usage") {
      return (
        <div className="space-y-1">
          {usageOptions.map(([value, label]) => (
            <OptionRow
              key={value}
              label={label}
              active={usageFilter === value}
              onClick={() => choose(() => setUsageFilter(value), true)}
            />
          ))}
        </div>
      );
    }

    if (section === "uploader") {
      return (
        <div className="max-h-[45dvh] space-y-1 overflow-y-auto">
          <OptionRow
            label="All uploaders"
            active={uploaderFilter === "all"}
            onClick={() => choose(() => setUploaderFilter("all"), true)}
          />
          {uploaders.map((uploader) => (
            <OptionRow
              key={uploader._id}
              label={uploader.fullName || uploader.username}
              active={uploaderFilter === uploader._id}
              onClick={() => choose(() => setUploaderFilter(uploader._id), true)}
            />
          ))}
        </div>
      );
    }

    if (section === "date") {
      return (
        <div className="space-y-1">
          {dateOptions.map(([value, label]) => (
            <OptionRow
              key={value}
              label={label}
              active={dateFilter === value}
              onClick={() => choose(() => setDateFilter(value), true)}
            />
          ))}
        </div>
      );
    }

    if (section === "sort") {
      return (
        <div className="space-y-1">
          {sortOptions.map(([value, label]) => (
            <OptionRow
              key={value}
              label={label}
              active={sort === value}
              onClick={() => choose(() => { setSort(value); setPage?.(1); }, true)}
            />
          ))}
        </div>
      );
    }

    if (section === "view") {
      return (
        <div className="space-y-1">
          <OptionRow label="List view" active={view === "list"} onClick={() => choose(() => setView("list"), true)} />
          <OptionRow label="Grid view" active={view === "card"} onClick={() => choose(() => setView("card"), true)} />
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <NavigationRow icon={Folder} label="File type" value={SCOPE_LABELS[scope] || "All Files"} onClick={() => setSection("category")} />
        {!pickerMode && <NavigationRow icon={ListFilter} label="Usage" value={USAGE_LABELS[usageFilter] || "Any usage"} onClick={() => setSection("usage")} />}
        {!pickerMode && <NavigationRow icon={User} label="Uploaded by" value={uploaderFilter === "all" ? "Everyone" : uploaders.find((item) => item._id === uploaderFilter)?.fullName || "Selected user"} onClick={() => setSection("uploader")} />}
        {!pickerMode && <NavigationRow icon={Clock3} label="Date modified" value={DATE_LABELS[dateFilter] || "Any date"} onClick={() => setSection("date")} />}
        <NavigationRow icon={ArrowUpDown} label="Sort files" value={SORT_LABELS[sort] || "Newest first"} onClick={() => setSection("sort")} />
        <NavigationRow icon={view === "card" ? Grid2X2 : List} label="View" value={view === "card" ? "Grid view" : "List view"} onClick={() => setSection("view")} />

        <div className="my-2 border-t border-zinc-100 dark:border-zinc-800" />
        <button type="button" onClick={() => choose(refresh, true)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <RefreshCw className="ml-1 h-4 w-4 text-zinc-500" />
          Refresh files
        </button>
        {scope !== "trash" && canUpload && (
          <button type="button" onClick={() => choose(() => setUploadOpen(true), true)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30">
            <Upload className="ml-1 h-4 w-4" />
            Upload files
          </button>
        )}
        {scope !== "trash" && !pickerMode && canManage && (
          <button type="button" onClick={() => choose(() => setDialog({ type: "create-folder" }), true)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold text-amber-600 transition-colors hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30">
            <FolderPlus className="ml-1 h-4 w-4" />
            New folder
          </button>
        )}
        {activeFilterCount > 0 && (
          <button type="button" onClick={() => choose(resetFilters, true)} className="flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-3 text-xs font-black text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30">
            Reset all filters
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <Button
        type="button"
        variant={hasActiveSettings ? "secondary" : "outline"}
        size="icon"
        className={cn("relative h-9 w-9 rounded-xl", hasActiveSettings && "border-blue-500/50 bg-blue-50/50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300")}
        aria-label="Open file settings"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        {hasActiveSettings && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-blue-600 ring-2 ring-white dark:ring-zinc-950" />}
      </Button>

      <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : close())}>
        <DialogContent
          showCloseButton={false}
          className="rounded-[2rem] p-0 sm:max-w-xl"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              {section ? (
                <button type="button" onClick={() => setSection(null)} className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Back to file settings">
                  <ArrowLeft className="h-4 w-4" />
                </button>
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white"><SlidersHorizontal className="h-4 w-4" /></span>
              )}
              <div className="min-w-0">
                <DialogTitle className="truncate text-base font-black">{section ? ({ category: "File type", usage: "Usage", uploader: "Uploaded by", date: "Date modified", sort: "Sort files", view: "View" }[section]) : "File settings"}</DialogTitle>
                <DialogDescription className="mt-0.5 truncate text-xs text-zinc-500">{section ? "Choose an option" : "Navigate files, filters, views, and actions"}</DialogDescription>
              </div>
            </div>
            <button type="button" onClick={close} className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white" aria-label="Close file settings">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
            {renderSection()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
