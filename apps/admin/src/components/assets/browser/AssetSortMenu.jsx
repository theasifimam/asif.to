"use client";

import { ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SORT_LABELS } from "./constants";

export default function AssetSortMenu({ sort, setSort, setPage }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={sort !== "newest" ? "secondary" : "outline"}
          className={cn(
            "h-9 relative gap-1.5 rounded-xl transition-all text-xs font-semibold px-2.5 sm:px-3",
            sort !== "newest" &&
              "border-blue-500/50 bg-blue-50/50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold",
          )}
        >
          <ArrowUpDown className="h-4 w-4" />
          <span className="hidden sm:inline">
            {sort === "newest" ? "Sort" : SORT_LABELS[sort] || "Sort"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-1">
        <DropdownMenuRadioGroup
          value={sort}
          onValueChange={(val) => {
            setSort(val);
            setPage?.(1);
          }}
        >
          <DropdownMenuRadioItem value="newest" className="text-xs">
            Newest first
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="oldest" className="text-xs">
            Oldest first
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="name_az" className="text-xs">
            Name (A to Z)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="name_za" className="text-xs">
            Name (Z to A)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="largest" className="text-xs">
            Size (Largest first)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="smallest" className="text-xs">
            Size (Smallest first)
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
