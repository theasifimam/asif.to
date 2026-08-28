"use client";

import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import AssetContextMenu from "../AssetContextMenu";
import AssetItemMenu from "../AssetItemMenu";

export default function ListFolderItem({
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
      <tr
        data-asset-context-item
        onContextMenu={(event) => event.stopPropagation()}
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
        className={cn(
          "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors",
          selected && "bg-blue-50/70 dark:bg-blue-950/30 font-bold",
          dragOverTarget === folder._id && "bg-blue-50/70 dark:bg-blue-950/20",
        )}
      >
        <td className="px-3 sm:px-4 py-2.5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-9 sm:h-10 sm:w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Folder className="h-4 w-4 sm:h-5 sm:w-5 fill-blue-500/20" />
            </div>
            <span className="max-w-36 sm:max-w-60 truncate font-bold text-zinc-900 dark:text-white">
              {folder.name}
            </span>
          </div>
        </td>
        <td className="hidden md:table-cell px-3 py-2.5 font-medium text-zinc-500">Folder</td>
        <td className="px-3 py-2.5 font-medium text-zinc-500">
          {folder.assetCount} files
        </td>
        <td className="hidden lg:table-cell px-3 py-2.5 font-medium text-zinc-500">—</td>
        <td className="hidden xl:table-cell px-3 py-2.5 font-medium text-zinc-500">—</td>
        <td className="hidden sm:table-cell px-3 py-2.5 font-medium text-zinc-500">
          {folder.createdAt
            ? new Date(folder.createdAt).toLocaleDateString()
            : "—"}
        </td>
        <td className="hidden md:table-cell px-3 py-2.5 font-bold text-zinc-600 dark:text-zinc-300">
          {folder.childCount || 0} subfolders
        </td>
        <td className="w-8 sm:w-12 px-1 sm:px-2" onClick={(event) => event.stopPropagation()}>
          {!pickerMode && canManage && (
            <AssetItemMenu
              item={folder}
              isFolder
              scope={scope}
              isSelected={selected}
              onAction={handleAction}
            />
          )}
        </td>
      </tr>
    </AssetContextMenu>
  );
}
