"use client";

import { FileText, Folder } from "lucide-react";
import CardFolderItem from "./items/CardFolderItem";
import CardFileItem from "./items/CardFileItem";

export default function AssetCardGrid({
  folderSectionVisible,
  folders = [],
  assets = [],
  pickerMode = false,
  scope,
  canManage,
  dragOverTarget,
  handleDragStart,
  handleDragOver,
  clearDropTarget,
  handleDrop,
  openFolder,
  handleAction,
  pickerSelection,
  setPickerSelection,
  selectedIds = [],
  toggleSelected,
  selectedFolderIds = [],
  toggleSelectedFolder,
  setInspected,
  accept,
}) {
  const showFolders = folderSectionVisible && folders.length > 0;
  const showFiles = assets.length > 0;

  return (
    <div className="p-2 sm:p-4 space-y-6">
      {/* Folders Section */}
      {showFolders && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <Folder className="h-4 w-4 text-amber-500 fill-amber-500/20" />
              <span>Folders</span>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                {folders.length}
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
            {folders.map((folder) => (
              <CardFolderItem
                key={folder._id}
                folder={folder}
                scope={scope}
                canManage={canManage}
                dragOverTarget={dragOverTarget}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                clearDropTarget={clearDropTarget}
                handleDrop={handleDrop}
                openFolder={openFolder}
                handleAction={handleAction}
                pickerMode={pickerMode}
                selectedIds={selectedIds}
                selectedFolderIds={selectedFolderIds}
                toggleSelectedFolder={toggleSelectedFolder}
              />
            ))}
          </div>
        </section>
      )}

      {/* Files Section */}
      {showFiles && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span>Files &amp; Media Assets</span>
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-extrabold text-blue-600 dark:text-blue-400">
                {assets.length}
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-9 gap-2 sm:gap-2.5">
            {assets.map((asset) => (
              <CardFileItem
                key={asset._id}
                asset={asset}
                pickerMode={pickerMode}
                scope={scope}
                canManage={canManage}
                handleDragStart={handleDragStart}
                pickerSelection={pickerSelection}
                setPickerSelection={setPickerSelection}
                selectedIds={selectedIds}
                selectedFolderIds={selectedFolderIds}
                toggleSelected={toggleSelected}
                setInspected={setInspected}
                accept={accept}
                handleAction={handleAction}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
