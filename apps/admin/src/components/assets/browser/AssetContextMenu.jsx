"use client";

import {
  CheckSquare,
  FolderInput,
  FolderOpen,
  FolderPlus,
  Grid2X2,
  Heart,
  List,
  Pencil,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export default function AssetContextMenu({
  children,
  item,
  isFolder = false,
  scope = "all",
  canManage = false,
  canUpload = false,
  onAction,
  onOpenFolder,
  onCreateFolder,
  onUpload,
  onRefresh,
  onSelectAll,
  hasSelectableItems = false,
  view,
  onViewChange,
  disabled = false,
}) {
  if (disabled) return children;

  const isTrash = scope === "trash";

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent
        className="w-56"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {item ? (
          isTrash ? (
            <>
              {isFolder && (
                <ContextMenuItem onSelect={() => onOpenFolder?.(item)}>
                  <FolderOpen className="text-blue-500" /> Open
                </ContextMenuItem>
              )}
              {canManage && (
                <>
                  <ContextMenuItem
                    onSelect={() => onAction?.("restore", item, isFolder)}
                  >
                    <RotateCcw /> Restore
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    variant="destructive"
                    onSelect={() => onAction?.("permanent", item, isFolder)}
                  >
                    <Trash2 /> Delete forever
                  </ContextMenuItem>
                </>
              )}
            </>
          ) : (
            <>
              {isFolder ? (
                <ContextMenuItem onSelect={() => onOpenFolder?.(item)}>
                  <FolderOpen className="text-blue-500" /> Open
                </ContextMenuItem>
              ) : (
                <ContextMenuItem
                  onSelect={() => onAction?.("inspect", item, false)}
                >
                  <Search className="text-blue-500" /> Preview details
                </ContextMenuItem>
              )}
              {canManage && (
                <>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onSelect={() => onAction?.("rename", item, isFolder)}
                  >
                    <Pencil /> Rename
                  </ContextMenuItem>
                  <ContextMenuItem
                    onSelect={() => onAction?.("move", item, isFolder)}
                  >
                    <FolderInput /> Move
                  </ContextMenuItem>
                  {!isFolder && (
                    <ContextMenuItem
                      onSelect={() => onAction?.("favorite", item, false)}
                    >
                      <Heart
                        className={
                          item.isFavorite
                            ? "fill-rose-500 text-rose-500"
                            : undefined
                        }
                      />
                      {item.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    </ContextMenuItem>
                  )}
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    variant="destructive"
                    onSelect={() => onAction?.("trash", item, isFolder)}
                  >
                    <Trash2 /> Move to Trash
                  </ContextMenuItem>
                </>
              )}
            </>
          )
        ) : (
          <>
            {!isTrash && canManage && (
              <ContextMenuItem onSelect={onCreateFolder}>
                <FolderPlus className="text-amber-500" /> New folder
              </ContextMenuItem>
            )}
            {!isTrash && canUpload && (
              <ContextMenuItem onSelect={onUpload}>
                <Upload className="text-blue-500" /> Upload files
              </ContextMenuItem>
            )}
            {!isTrash && (canManage || canUpload) && <ContextMenuSeparator />}
            {canManage && hasSelectableItems && (
              <ContextMenuItem onSelect={onSelectAll}>
                <CheckSquare /> Select all files
              </ContextMenuItem>
            )}
            {view && onViewChange && (
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  {view === "card" ? <Grid2X2 /> : <List />} View
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem onSelect={() => onViewChange("card")}>
                    <Grid2X2 /> Grid {view === "card" && <span className="ml-auto">✓</span>}
                  </ContextMenuItem>
                  <ContextMenuItem onSelect={() => onViewChange("list")}>
                    <List /> List {view === "list" && <span className="ml-auto">✓</span>}
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
            )}
            <ContextMenuItem onSelect={onRefresh}>
              <RefreshCw /> Refresh
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
