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
  selectedAll,
  setSelectedIds,
  setInspected,
  accept,
}) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-190 text-left text-xs">
          <thead className="border-b border-zinc-100 bg-zinc-50/70 text-[10px] uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50">
            <tr>
              <th className="w-10 px-4 py-3">
                {!pickerMode && canManage && (
                  <input
                    type="checkbox"
                    checked={selectedAll}
                    onChange={() =>
                      setSelectedIds(
                        selectedAll ? [] : assets.map((asset) => asset._id),
                      )
                    }
                  />
                )}
              </th>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Size / Items</th>
              <th className="px-3 py-3">Folder</th>
              <th className="px-3 py-3">Uploaded by</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Usage</th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {/* Desktop Folder Rows */}
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
                />
              ))}

            {/* Desktop File Rows */}
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
                toggleSelected={toggleSelected}
                setInspected={setInspected}
                accept={accept}
                handleAction={handleAction}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile List View */}
      <div className="sm:hidden space-y-1.5 p-2.5">
        {/* Mobile Folder Tiles */}
        {folderSectionVisible &&
          folders.map((folder) => (
            <ListFolderItem
              key={folder._id}
              folder={folder}
              scope={scope}
              canManage={canManage}
              openFolder={openFolder}
              handleAction={handleAction}
              pickerMode={pickerMode}
              isMobile
            />
          ))}

        {/* Mobile File Tiles */}
        {assets.map((asset) => (
          <ListFileItem
            key={asset._id}
            asset={asset}
            pickerMode={pickerMode}
            scope={scope}
            canManage={canManage}
            pickerSelection={pickerSelection}
            setPickerSelection={setPickerSelection}
            selectedIds={selectedIds}
            setInspected={setInspected}
            accept={accept}
            handleAction={handleAction}
            isMobile
          />
        ))}
      </div>
    </>
  );
}
