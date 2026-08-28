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
  setInspected,
  accept,
}) {
  return (
    <div className="grid grid-cols-4 gap-3 p-3 sm:gap-3 sm:p-4 sm:grid-cols-5 xl:grid-cols-6">
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
          toggleSelected={toggleSelected}
          setInspected={setInspected}
          accept={accept}
          handleAction={handleAction}
        />
      ))}
    </div>
  );
}
