"use client";

import ListFolderItem from "./items/ListFolderItem";
import ListFileItem from "./items/ListFileItem";

export default function AssetTableListView({
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
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-zinc-100 bg-zinc-50/70 text-[10px] uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50">
          <tr>
            <th className="px-3 sm:px-4 py-2.5">Name</th>
            <th className="hidden md:table-cell px-3 py-2.5">Type</th>
            <th className="px-3 py-2.5">Size / Items</th>
            <th className="hidden lg:table-cell px-3 py-2.5">Folder</th>
            <th className="hidden xl:table-cell px-3 py-2.5">Uploaded by</th>
            <th className="hidden sm:table-cell px-3 py-2.5">Date</th>
            <th className="hidden md:table-cell px-3 py-2.5">Usage</th>
            <th className="w-8 sm:w-12 px-1 sm:px-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {/* Folder Rows */}
          {folderSectionVisible &&
            folders.map((folder) => (
              <ListFolderItem
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

          {/* File Rows */}
          {assets.map((asset) => (
            <ListFileItem
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
        </tbody>
      </table>
    </div>
  );
}
