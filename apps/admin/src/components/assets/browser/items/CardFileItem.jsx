"use client";

import { Heart } from "lucide-react";
import {
  assetAccepts,
  ASSET_TYPE_LABELS,
  formatAssetBytes,
} from "@/lib/assets";
import { cn } from "@/lib/utils";
import AssetThumbnail from "../../AssetThumbnail";
import AssetContextMenu from "../AssetContextMenu";
import AssetItemMenu from "../AssetItemMenu";
import AssetUsageBadge from "../AssetUsageBadge";

export default function CardFileItem({
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
  const selected = pickerMode
    ? pickerSelection?._id === asset._id
    : selectedIds.includes(asset._id);
  const accepted = assetAccepts(asset, accept);
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
      <article
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
          "group relative cursor-pointer overflow-hidden rounded-xl sm:rounded-xl border bg-white transition-all dark:bg-zinc-950",
          selected
            ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20"
            : "border-zinc-200/80 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-zinc-800",
          !accepted && "cursor-not-allowed opacity-40",
        )}
      >
        <div className="aspect-4/3 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
          <AssetThumbnail
            asset={asset}
            className="transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex items-center gap-2 p-2.5 sm:p-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xs font-black text-zinc-900 dark:text-white">
              {asset.name}
            </h3>
            <p className="mt-0.5 truncate text-[10px] font-medium text-zinc-400">
              {ASSET_TYPE_LABELS[asset.category]} ·{" "}
              {formatAssetBytes(asset.size)}
            </p>
            <AssetUsageBadge
              usageCount={asset.usageCount}
              className="mt-1"
            />
          </div>
          {!pickerMode && canManage && (
            <AssetItemMenu
              item={asset}
              scope={scope}
              isSelected={selected}
              onAction={handleAction}
            />
          )}
        </div>
        {asset.isFavorite && (
          <Heart className="absolute right-3 top-3 h-4 w-4 fill-rose-500 text-rose-500 drop-shadow" />
        )}
      </article>
    </AssetContextMenu>
  );
}
