"use client";

import {
  Copy,
  FolderInput,
  Heart,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Search,
  Scissors,
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
  const selectAction = (action, folder = isFolder) => (event) => {
    event.stopPropagation();
    onAction(action, item, folder);
  };

  const stopItemInteraction = (event) => event.stopPropagation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Actions for ${item.name}`}
          onClick={stopItemInteraction}
          onPointerDown={stopItemInteraction}
          onKeyDown={stopItemInteraction}
          className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={stopItemInteraction}
        onPointerDown={stopItemInteraction}
        onKeyDown={stopItemInteraction}
      >
        {scope === "trash" ? (
          <>
            <DropdownMenuItem
              onSelect={selectAction("restore")}
            >
              <RotateCcw /> Restore
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={selectAction("permanent")}
            >
              <Trash2 /> Delete forever
            </DropdownMenuItem>
          </>
        ) : (
          <>
            {!isFolder && (
              <DropdownMenuItem
                onSelect={selectAction("inspect", false)}
              >
                <Search /> Preview details
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onSelect={selectAction("rename")}
            >
              <Pencil /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={selectAction("copy")}>
              <Copy /> Copy
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={selectAction("cut")}>
              <Scissors /> Cut
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={selectAction("move")}>
              <FolderInput /> Move
            </DropdownMenuItem>
            {!isFolder && (
              <DropdownMenuItem
                onSelect={selectAction("favorite", false)}
              >
                <Heart /> {item.isFavorite ? "Unfavorite" : "Favorite"}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={selectAction("trash")}
            >
              <Trash2 /> Move to Trash
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
