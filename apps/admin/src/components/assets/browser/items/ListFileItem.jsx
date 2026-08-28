"use client";

import { assetAccepts, ASSET_TYPE_LABELS, formatAssetBytes } from "@/lib/assets";
import { cn } from "@/lib/utils";
import AssetThumbnail from "../../AssetThumbnail";
import AssetContextMenu from "../AssetContextMenu";
import AssetItemMenu from "../AssetItemMenu";
import AssetUsageBadge from "../AssetUsageBadge";

export default function ListFileItem({
  asset,
  pickerMode = false,
  scope,
  canManage,
  handleDragStart,
  pickerSelection,
  setPickerSelection,
  selectedIds = [],
  selectedFolderIds = [],
  toggleSelected,
  setInspected,
  accept,
  handleAction,
}) {
  const accepted = assetAccepts(asset, accept);
  const selected = pickerMode
    ? pickerSelection?._id === asset._id
    : selectedIds.includes(asset._id);
  const isSelectionActive = selectedIds.length > 0 || selectedFolderIds.length > 0;

  return (
    <AssetContextMenu
      key={asset._id}
      item={asset}
      scope={scope}
      canManage={canManage}
      isSelected={selected}
      onAction={handleAction}
      disabled={pickerMode || !accepted}
    >
      <tr
        data-asset-context-item
        onContextMenu={(event) => event.stopPropagation()}
        draggable={!pickerMode && scope !== "trash" && canManage}
        onDragStart={(event) => handleDragStart(event, asset, "asset")}
        onClick={(event) => {
          if (!accepted) return;
          if (!pickerMode && canManage && (isSelectionActive || event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            toggleSelected?.(asset._id);
            return;
          }
          if (pickerMode) setPickerSelection(asset);
          else setInspected(asset);
        }}
        className={cn(
          "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors",
          selected && "bg-blue-50/70 dark:bg-blue-950/30 font-bold",
          !accepted && "opacity-40",
        )}
      >
        <td className="px-3 sm:px-4 py-2.5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-9 sm:h-10 sm:w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
              <AssetThumbnail asset={asset} iconClassName="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="max-w-36 sm:max-w-60 truncate font-bold text-zinc-900 dark:text-white">
              {asset.name}
            </span>
          </div>
        </td>
        <td className="hidden md:table-cell px-3 py-2.5 font-medium text-zinc-500">
          {ASSET_TYPE_LABELS[asset.category]}
        </td>
        <td className="px-3 py-2.5 font-medium text-zinc-500">
          {formatAssetBytes(asset.size)}
        </td>
        <td className="hidden lg:table-cell px-3 py-2.5 font-medium text-zinc-500">
          {asset.folder?.name || "Root"}
        </td>
        <td className="hidden xl:table-cell px-3 py-2.5 font-medium text-zinc-500">
          {asset.uploadedBy?.fullName || "Imported"}
        </td>
        <td className="hidden sm:table-cell px-3 py-2.5 font-medium text-zinc-500">
          {new Date(asset.createdAt).toLocaleDateString()}
        </td>
        <td className="hidden md:table-cell px-3 py-2.5">
          <AssetUsageBadge usageCount={asset.usageCount} />
        </td>
        <td className="w-8 sm:w-12 px-1 sm:px-2" onClick={(event) => event.stopPropagation()}>
          {!pickerMode && canManage && (
            <AssetItemMenu
              item={asset}
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
