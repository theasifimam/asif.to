"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  Clock3,
  Filter,
  Folder,
  ListFilter,
  RotateCcw,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  DATE_LABELS,
  SCOPE_LABELS,
  USAGE_LABELS,
} from "./constants";

function OptionItem({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors text-left cursor-pointer",
        active
          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-bold"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60",
      )}
    >
      <span>{label}</span>
      {active && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
    </button>
  );
}

export default function AssetFilterMenu({
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
}) {
  const [expanded, setExpanded] = useState(null);

  const toggleSection = (section) => {
    setExpanded((curr) => (curr === section ? null : section));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={activeFilterCount > 0 ? "secondary" : "outline"}
          className={cn(
            "h-9 relative gap-1.5 rounded-xl transition-all text-xs font-semibold px-2.5 sm:px-3",
            activeFilterCount > 0 &&
              "border-blue-500/50 bg-blue-50/50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold",
          )}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filter</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-h-[80vh] overflow-y-auto p-1.5 scrollbar-none">
        {/* Category Section */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection("category")}
            className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Folder className="h-4 w-4 text-zinc-400 shrink-0" />
              <span className="truncate">Category</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span className="max-w-24 truncate text-[11px] font-bold text-blue-600 dark:text-blue-400">
                {SCOPE_LABELS[scope] || "All Files"}
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-zinc-400 transition-transform duration-200",
                  expanded === "category" && "rotate-180",
                )}
              />
            </div>
          </button>
          {expanded === "category" && (
            <div className="my-1 ml-3.5 space-y-0.5 border-l-2 border-blue-500/20 pl-2">
              <OptionItem
                label="All Files"
                active={scope === "all"}
                onClick={() => {
                  setScope("all");
                  onScopeChange?.();
                }}
              />
              <OptionItem
                label="Images"
                active={scope === "images"}
                onClick={() => {
                  setScope("images");
                  onScopeChange?.();
                }}
              />
              <OptionItem
                label="Videos"
                active={scope === "videos"}
                onClick={() => {
                  setScope("videos");
                  onScopeChange?.();
                }}
              />
              <OptionItem
                label="Audio"
                active={scope === "audio"}
                onClick={() => {
                  setScope("audio");
                  onScopeChange?.();
                }}
              />
              <OptionItem
                label="Documents"
                active={scope === "documents"}
                onClick={() => {
                  setScope("documents");
                  onScopeChange?.();
                }}
              />
              <OptionItem
                label="Code & Archives"
                active={scope === "code"}
                onClick={() => {
                  setScope("code");
                  onScopeChange?.();
                }}
              />
              <OptionItem
                label="Recent"
                active={scope === "recent"}
                onClick={() => {
                  setScope("recent");
                  onScopeChange?.();
                }}
              />
              <OptionItem
                label="Favorites"
                active={scope === "favorites"}
                onClick={() => {
                  setScope("favorites");
                  onScopeChange?.();
                }}
              />
              <OptionItem
                label="Orphans"
                active={scope === "unused"}
                onClick={() => {
                  setScope("unused");
                  onScopeChange?.();
                }}
              />
              <OptionItem
                label="Trash"
                active={scope === "trash"}
                onClick={() => {
                  setScope("trash");
                  onScopeChange?.();
                }}
              />
            </div>
          )}
        </div>

        {!pickerMode && (
          <>
            {/* Usage Section */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection("usage")}
                className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ListFilter className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span className="truncate">Usage</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="max-w-24 truncate text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    {USAGE_LABELS[usageFilter] || "Any"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-zinc-400 transition-transform duration-200",
                      expanded === "usage" && "rotate-180",
                    )}
                  />
                </div>
              </button>
              {expanded === "usage" && (
                <div className="my-1 ml-3.5 space-y-0.5 border-l-2 border-blue-500/20 pl-2">
                  <OptionItem
                    label="Any usage"
                    active={usageFilter === "all"}
                    onClick={() => {
                      setUsageFilter("all");
                      onScopeChange?.();
                    }}
                  />
                  <OptionItem
                    label="Used files"
                    active={usageFilter === "used"}
                    onClick={() => {
                      setUsageFilter("used");
                      onScopeChange?.();
                    }}
                  />
                  <OptionItem
                    label="Orphan files"
                    active={usageFilter === "unused"}
                    onClick={() => {
                      setUsageFilter("unused");
                      onScopeChange?.();
                    }}
                  />
                </div>
              )}
            </div>

            {/* Uploaded By Section */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection("uploader")}
                className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <User className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span className="truncate">Uploaded by</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="max-w-24 truncate text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    {uploaderFilter === "all"
                      ? "All"
                      : uploaders.find((u) => u._id === uploaderFilter)
                          ?.fullName || "User"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-zinc-400 transition-transform duration-200",
                      expanded === "uploader" && "rotate-180",
                    )}
                  />
                </div>
              </button>
              {expanded === "uploader" && (
                <div className="my-1 ml-3.5 max-h-48 overflow-y-auto space-y-0.5 border-l-2 border-blue-500/20 pl-2 scrollbar-none">
                  <OptionItem
                    label="All uploaders"
                    active={uploaderFilter === "all"}
                    onClick={() => {
                      setUploaderFilter("all");
                      onScopeChange?.();
                    }}
                  />
                  {uploaders.map((uploader) => (
                    <OptionItem
                      key={uploader._id}
                      label={uploader.fullName || uploader.username}
                      active={uploaderFilter === uploader._id}
                      onClick={() => {
                        setUploaderFilter(uploader._id);
                        onScopeChange?.();
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Date Modified Section */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection("date")}
                className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Clock3 className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span className="truncate">Date modified</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="max-w-24 truncate text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    {DATE_LABELS[dateFilter] || "Any"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-zinc-400 transition-transform duration-200",
                      expanded === "date" && "rotate-180",
                    )}
                  />
                </div>
              </button>
              {expanded === "date" && (
                <div className="my-1 ml-3.5 space-y-0.5 border-l-2 border-blue-500/20 pl-2">
                  <OptionItem
                    label="Any date"
                    active={dateFilter === "all"}
                    onClick={() => {
                      setDateFilter("all");
                      onScopeChange?.();
                    }}
                  />
                  <OptionItem
                    label="Last 7 days"
                    active={dateFilter === "7"}
                    onClick={() => {
                      setDateFilter("7");
                      onScopeChange?.();
                    }}
                  />
                  <OptionItem
                    label="Last 30 days"
                    active={dateFilter === "30"}
                    onClick={() => {
                      setDateFilter("30");
                      onScopeChange?.();
                    }}
                  />
                  <OptionItem
                    label="Last 90 days"
                    active={dateFilter === "90"}
                    onClick={() => {
                      setDateFilter("90");
                      onScopeChange?.();
                    }}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {activeFilterCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <button
              type="button"
              onClick={resetFilters}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset all filters
            </button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
