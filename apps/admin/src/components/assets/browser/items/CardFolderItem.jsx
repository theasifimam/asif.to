"use client";

import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import AssetContextMenu from "../AssetContextMenu";
import AssetItemMenu from "../AssetItemMenu";

export default function CardFolderItem({
  folder,
  scope,
  canManage,
  dragOverTarget,
  handleDragStart,
  handleDragOver,
  clearDropTarget,
  handleDrop,
  openFolder,
  handleAction,
  pickerMode = false,
  selectedIds = [],
  selectedFolderIds = [],
  toggleSelectedFolder,
}) {
  const selected = selectedFolderIds.includes(folder._id);
  const isSelectionActive = selectedIds.length > 0 || selectedFolderIds.length > 0;

  return (
    <AssetContextMenu
      key={folder._id}
      item={folder}
      isFolder
      scope={scope}
      canManage={canManage}
      isSelected={selected}
      onAction={handleAction}
      onOpenFolder={openFolder}
      disabled={pickerMode}
    >
      <article
        data-asset-context-item
        onContextMenu={(event) => event.stopPropagation()}
        role="button"
        tabIndex={0}
        draggable={!pickerMode && scope !== "trash" && canManage}
        onDragStart={(event) => handleDragStart(event, folder, "folder")}
        onDragOver={(event) => {
          event.stopPropagation();
          handleDragOver(event, folder._id);
        }}
        onDragLeave={clearDropTarget}
        onDrop={(event) => handleDrop(event, folder._id)}
        onClick={(event) => {
          if (!pickerMode && canManage && (isSelectionActive || event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            toggleSelectedFolder?.(folder._id);
            return;
          }
          if (scope !== "trash") openFolder(folder);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && scope !== "trash") openFolder(folder);
        }}
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-xl sm:rounded-xl border bg-white transition-all dark:bg-zinc-950",
          selected
            ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20"
            : dragOverTarget === folder._id
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20 dark:bg-blue-950/30"
              : "border-zinc-200/80 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-zinc-800",
        )}
      >
        <div className="aspect-4/3 flex items-center justify-center overflow-hidden bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 shadow-xs transition-transform duration-300 group-hover:scale-110 dark:bg-blue-500/20 dark:text-blue-400">
            <Folder className="h-7 w-7 sm:h-8 sm:w-8 fill-blue-500/20" />
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 sm:p-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xs font-black text-zinc-900 dark:text-white">
              {folder.name}
            </h3>
            <p className="mt-0.5 truncate text-[10px] font-medium text-zinc-400">
              Folder · {folder.assetCount} files · {folder.childCount} folders
            </p>
          </div>
          {!pickerMode && canManage && (
            <AssetItemMenu
              item={folder}
              isFolder
              scope={scope}
              isSelected={selected}
              onAction={handleAction}
            />
          )}
        </div>
      </article>
    </AssetContextMenu>
  );
}
