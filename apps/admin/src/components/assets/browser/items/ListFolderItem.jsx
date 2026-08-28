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
  isMobile = false,
}) {
  if (isMobile) {
    return (
      <AssetContextMenu
        key={folder._id}
        item={folder}
        isFolder
        scope={scope}
        canManage={canManage}
        onAction={handleAction}
        onOpenFolder={openFolder}
        disabled={pickerMode}
      >
        <div
          data-asset-context-item
          onContextMenu={(event) => event.stopPropagation()}
          role="button"
          tabIndex={0}
          onClick={() => openFolder(folder)}
          className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-white p-3 transition-colors active:bg-blue-50/50 dark:border-zinc-800 dark:bg-zinc-950 dark:active:bg-blue-950/30"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            <Folder className="h-5 w-5 fill-blue-500/20" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-black text-zinc-900 dark:text-white">
              {folder.name}
            </p>
            <p className="mt-0.5 truncate text-[10px] font-medium text-zinc-400">
              Folder · {folder.assetCount} files
            </p>
          </div>
          {!pickerMode && canManage && (
            <div onClick={(event) => event.stopPropagation()}>
              <AssetItemMenu
                item={folder}
                isFolder
                scope={scope}
                onAction={handleAction}
              />
            </div>
          )}
        </div>
      </AssetContextMenu>
    );
  }

  return (
    <AssetContextMenu
      key={folder._id}
      item={folder}
      isFolder
      scope={scope}
      canManage={canManage}
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
        onClick={() => openFolder(folder)}
        className={cn(
          "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
          dragOverTarget === folder._id && "bg-blue-50/70 dark:bg-blue-950/20",
        )}
      >
        <td
          className="px-4 py-2"
          onClick={(event) => event.stopPropagation()}
        />
        <td className="px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Folder className="h-5 w-5 fill-blue-500/20" />
            </div>
            <span className="max-w-60 truncate font-bold text-zinc-900 dark:text-white">
              {folder.name}
            </span>
          </div>
        </td>
        <td className="px-3 py-2 font-medium text-zinc-500">Folder</td>
        <td className="px-3 py-2 font-medium text-zinc-500">
          {folder.assetCount} files
        </td>
        <td className="px-3 py-2 font-medium text-zinc-500">—</td>
        <td className="px-3 py-2 font-medium text-zinc-500">—</td>
        <td className="px-3 py-2 font-medium text-zinc-500">
          {folder.createdAt
            ? new Date(folder.createdAt).toLocaleDateString()
            : "—"}
        </td>
        <td className="px-3 py-2 font-bold text-zinc-600 dark:text-zinc-300">
          {folder.childCount || 0} subfolders
        </td>
        <td className="px-2" onClick={(event) => event.stopPropagation()}>
          {!pickerMode && canManage && (
            <AssetItemMenu
              item={folder}
              isFolder
              scope={scope}
              onAction={handleAction}
            />
          )}
        </td>
      </tr>
    </AssetContextMenu>
  );
}
