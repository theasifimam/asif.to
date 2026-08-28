"use client";

import {
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
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  DATE_LABELS,
  SCOPE_LABELS,
  USAGE_LABELS,
} from "./constants";

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
      <DropdownMenuContent align="end" className="w-56 p-1.5">
        {/* Category Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-xl px-2.5 py-2 text-xs font-semibold">
            <Folder className="mr-2 h-4 w-4 text-zinc-400" />
            <span>Category</span>
            <span className="ml-auto mr-1 max-w-20 truncate text-[11px] font-medium text-zinc-400">
              {SCOPE_LABELS[scope] || "All Files"}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-48 p-1">
              <DropdownMenuRadioGroup
                value={scope}
                onValueChange={(val) => {
                  setScope(val);
                  onScopeChange?.();
                }}
              >
                <DropdownMenuRadioItem value="all" className="text-xs">
                  All Files
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="images" className="text-xs">
                  Images
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="videos" className="text-xs">
                  Videos
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="documents" className="text-xs">
                  Documents
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="code" className="text-xs">
                  Code & Archives
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="recent" className="text-xs">
                  Recent
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="favorites" className="text-xs">
                  Favorites
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="unused" className="text-xs">
                  Orphans
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="trash" className="text-xs">
                  Trash
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {!pickerMode && (
          <>
            {/* Usage Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="rounded-xl px-2.5 py-2 text-xs font-semibold">
                <ListFilter className="mr-2 h-4 w-4 text-zinc-400" />
                <span>Usage</span>
                <span className="ml-auto mr-1 text-[11px] font-medium text-zinc-400">
                  {USAGE_LABELS[usageFilter] || "Any"}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-40 p-1">
                  <DropdownMenuRadioGroup
                    value={usageFilter}
                    onValueChange={(val) => {
                      setUsageFilter(val);
                      onScopeChange?.();
                    }}
                  >
                    <DropdownMenuRadioItem value="all" className="text-xs">
                      Any usage
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="used" className="text-xs">
                      Used files
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="unused" className="text-xs">
                      Orphan files
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            {/* Uploaded By Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="rounded-xl px-2.5 py-2 text-xs font-semibold">
                <User className="mr-2 h-4 w-4 text-zinc-400" />
                <span>Uploaded by</span>
                <span className="ml-auto mr-1 max-w-17.5 truncate text-[11px] font-medium text-zinc-400">
                  {uploaderFilter === "all"
                    ? "All"
                    : uploaders.find((u) => u._id === uploaderFilter)
                        ?.fullName || "User"}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="max-h-60 w-48 overflow-y-auto p-1 scrollbar-none">
                  <DropdownMenuRadioGroup
                    value={uploaderFilter}
                    onValueChange={(val) => {
                      setUploaderFilter(val);
                      onScopeChange?.();
                    }}
                  >
                    <DropdownMenuRadioItem value="all" className="text-xs">
                      All uploaders
                    </DropdownMenuRadioItem>
                    {uploaders.map((uploader) => (
                      <DropdownMenuRadioItem
                        key={uploader._id}
                        value={uploader._id}
                        className="text-xs"
                      >
                        {uploader.fullName || uploader.username}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            {/* Date Modified Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="rounded-xl px-2.5 py-2 text-xs font-semibold">
                <Clock3 className="mr-2 h-4 w-4 text-zinc-400" />
                <span>Date modified</span>
                <span className="ml-auto mr-1 text-[11px] font-medium text-zinc-400">
                  {DATE_LABELS[dateFilter] || "Any"}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-40 p-1">
                  <DropdownMenuRadioGroup
                    value={dateFilter}
                    onValueChange={(val) => {
                      setDateFilter(val);
                      onScopeChange?.();
                    }}
                  >
                    <DropdownMenuRadioItem value="all" className="text-xs">
                      Any date
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="7" className="text-xs">
                      Last 7 days
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="30" className="text-xs">
                      Last 30 days
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="90" className="text-xs">
                      Last 90 days
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </>
        )}

        {activeFilterCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={resetFilters}
              className="justify-center rounded-xl font-bold text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950/50"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset all filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
