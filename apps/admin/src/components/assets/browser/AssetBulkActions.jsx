"use client";

import { Copy, FolderInput, Heart, RotateCcw, Scissors, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AssetBulkActions({
  selectedIds = [],
  setSelectedIds,
  scope,
  runBulk,
  user,
  pickerMode = false,
}) {
  if (selectedIds.length <= 0 || pickerMode) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-blue-100 bg-blue-50 px-4 py-2.5 dark:border-blue-900/40 dark:bg-blue-950/30">
      <span className="mr-1 text-xs font-black text-blue-700 dark:text-blue-300">
        {selectedIds.length} selected
      </span>
      {scope === "trash" ? (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => runBulk("restore")}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Restore
          </Button>
          {user?.role === "super_admin" && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => runBulk("permanent")}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete forever
            </Button>
          )}
        </>
      ) : (
        <>
          <Button size="sm" variant="outline" onClick={() => runBulk("move")}>
            <FolderInput className="h-3.5 w-3.5" /> Move
          </Button>
          <Button size="sm" variant="outline" onClick={() => runBulk("copy")}>
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
          <Button size="sm" variant="outline" onClick={() => runBulk("cut")}>
            <Scissors className="h-3.5 w-3.5" /> Cut
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => runBulk("favorite")}
          >
            <Heart className="h-3.5 w-3.5" /> Favorite
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600"
            onClick={() => runBulk("trash")}
          >
            <Trash2 className="h-3.5 w-3.5" /> Trash
          </Button>
        </>
      )}
      <button
        type="button"
        className="ml-auto text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        onClick={() => setSelectedIds([])}
      >
        Clear
      </button>
    </div>
  );
}
