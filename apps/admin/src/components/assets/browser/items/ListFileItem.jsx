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
  toggleSelected,
  setInspected,
  accept,
  handleAction,
  isMobile = false,
}) {
  const accepted = assetAccepts(asset, accept);
  const selected = pickerMode
    ? pickerSelection?._id === asset._id
    : selectedIds.includes(asset._id);

  if (isMobile) {
    return (
      <AssetContextMenu
        key={asset._id}
        item={asset}
        scope={scope}
        canManage={canManage}
        onAction={handleAction}
        disabled={pickerMode || !accepted}
      >
        <div
          data-asset-context-item
          onContextMenu={(event) => event.stopPropagation()}
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!accepted) return;
            if (pickerMode) setPickerSelection(asset);
            else setInspected(asset);
          }}
          className={cn(
            "flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white p-3 transition-colors active:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:active:bg-zinc-900/50",
            selected &&
              "border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 dark:bg-blue-950/30",
            !accepted && "opacity-40",
          )}
        >
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
            <AssetThumbnail asset={asset} iconClassName="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-black text-zinc-900 dark:text-white">
              {asset.name}
            </p>
            <p className="mt-0.5 truncate text-[10px] font-medium text-zinc-400">
              {ASSET_TYPE_LABELS[asset.category]} · {formatAssetBytes(asset.size)}
            </p>
            <AssetUsageBadge usageCount={asset.usageCount} className="mt-1" />
          </div>
          {!pickerMode && canManage && (
            <div onClick={(event) => event.stopPropagation()}>
              <AssetItemMenu
                item={asset}
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
      key={asset._id}
      item={asset}
      scope={scope}
      canManage={canManage}
      onAction={handleAction}
      disabled={pickerMode || !accepted}
    >
      <tr
        data-asset-context-item
        onContextMenu={(event) => event.stopPropagation()}
        draggable={!pickerMode && scope !== "trash" && canManage}
        onDragStart={(event) => handleDragStart(event, asset, "asset")}
        onClick={() => {
          if (!accepted) return;
          if (pickerMode) setPickerSelection(asset);
          else setInspected(asset);
        }}
        className={cn(
          "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
          selected && "bg-blue-50/70 dark:bg-blue-950/20",
          !accepted && "opacity-40",
        )}
      >
        <td className="px-4 py-2" onClick={(event) => event.stopPropagation()}>
          {!pickerMode && canManage && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => toggleSelected(asset._id)}
            />
          )}
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-12 shrink-0 overflow-hidden rounded-xl">
              <AssetThumbnail asset={asset} iconClassName="h-5 w-5" />
            </div>
            <span className="max-w-60 truncate font-bold text-zinc-900 dark:text-white">
              {asset.name}
            </span>
          </div>
        </td>
        <td className="px-3 py-2 font-medium text-zinc-500">
          {ASSET_TYPE_LABELS[asset.category]}
        </td>
        <td className="px-3 py-2 font-medium text-zinc-500">
          {formatAssetBytes(asset.size)}
        </td>
        <td className="px-3 py-2 font-medium text-zinc-500">
          {asset.folder?.name || "Root"}
        </td>
        <td className="px-3 py-2 font-medium text-zinc-500">
          {asset.uploadedBy?.fullName || "Imported"}
        </td>
        <td className="px-3 py-2 font-medium text-zinc-500">
          {new Date(asset.createdAt).toLocaleDateString()}
        </td>
        <td className="px-3 py-2">
          <AssetUsageBadge usageCount={asset.usageCount} />
        </td>
        <td className="px-2">
          {!pickerMode && canManage && (
            <AssetItemMenu
              item={asset}
              scope={scope}
              onAction={handleAction}
            />
          )}
        </td>
      </tr>
    </AssetContextMenu>
  );
}
