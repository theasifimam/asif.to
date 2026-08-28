"use client";

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
  return (
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-2.5 p-2.5 sm:gap-3.5 sm:p-4">
      {/* Folder Cards */}
      {folderSectionVisible &&
        folders.map((folder) => (
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

      {/* File Cards */}
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
  );
}
