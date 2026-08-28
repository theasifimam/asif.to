"use client";

import {
  FolderInput,
  Heart,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AssetItemMenu({
  item,
  isFolder = false,
  scope,
  onAction,
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Actions for ${item.name}`}
          onClick={(event) => event.stopPropagation()}
          className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {scope === "trash" ? (
          <>
            <DropdownMenuItem
              onSelect={() => onAction("restore", item, isFolder)}
            >
              <RotateCcw /> Restore
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onAction("permanent", item, isFolder)}
            >
              <Trash2 /> Delete forever
            </DropdownMenuItem>
          </>
        ) : (
          <>
            {!isFolder && (
              <DropdownMenuItem
                onSelect={() => onAction("inspect", item, false)}
              >
                <Search /> Preview details
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onSelect={() => onAction("rename", item, isFolder)}
            >
              <Pencil /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAction("move", item, isFolder)}>
              <FolderInput /> Move
            </DropdownMenuItem>
            {!isFolder && (
              <DropdownMenuItem
                onSelect={() => onAction("favorite", item, false)}
              >
                <Heart /> {item.isFavorite ? "Unfavorite" : "Favorite"}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onAction("trash", item, isFolder)}
            >
              <Trash2 /> Move to Trash
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
