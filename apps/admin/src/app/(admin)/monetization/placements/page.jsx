"use client";

import React from "react";
import { Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  useMonetization,
  Surface,
} from "../MonetizationContext";

export default function PlacementsPage() {
  const {
    canManage,
    saving,
    settings,
    placements,
    editPlacement,
    savePlacement,
  } = useMonetization();

  return (
    <Surface
      title="AdSense placements"
      description="Slot IDs live here, not in page components. A placement cannot be enabled without a valid numeric slot ID."
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-xs">
          <thead className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-400 dark:border-zinc-800">
            <tr>
              {[
                "Placement",
                "Enabled",
                "Slot ID",
                "Content",
                "Position",
                "Min words",
                "Max",
                "Device",
                "",
              ].map((item) => (
                <th key={item} className="px-2 py-3">
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
            {placements.map((placement) => (
              <tr key={placement.key}>
                <td className="px-2 py-3">
                  <p className="font-bold text-zinc-900 dark:text-white">
                    {placement.label}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-zinc-400">
                    {placement.key}
                    {placement.implementationStatus === "reserved"
                      ? " · Reserved"
                      : ""}
                  </p>
                </td>
                <td className="px-2 py-3">
                  <Switch
                    checked={Boolean(placement.enabled)}
                    disabled={
                      !canManage ||
                      placement.implementationStatus === "reserved"
                    }
                    onCheckedChange={(checked) =>
                      editPlacement(placement.key, { enabled: checked })
                    }
                  />
                </td>
                <td className="px-2 py-3">
                  <input
                    value={placement.slotId || ""}
                    disabled={!canManage}
                    onChange={(event) =>
                      editPlacement(placement.key, {
                        slotId: event.target.value.replace(/\D/g, ""),
                      })
                    }
                    placeholder="1234567890"
                    className="w-36 rounded-xl border border-zinc-200 bg-white px-3 py-2 font-mono outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </td>
                <td className="px-2 py-3">{placement.pageType}</td>
                <td className="px-2 py-3 capitalize">
                  {placement.position}
                </td>
                <td className="px-2 py-3">
                  <input
                    type="number"
                    min="0"
                    max="100000"
                    value={placement.minWordCount}
                    disabled={!canManage}
                    onChange={(event) =>
                      editPlacement(placement.key, {
                        minWordCount: Number(event.target.value),
                      })
                    }
                    className="w-24 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </td>
                <td className="px-2 py-3">
                  <input
                    type="number"
                    min="1"
                    max="3"
                    value={placement.maxPerPage}
                    disabled={!canManage}
                    onChange={(event) =>
                      editPlacement(placement.key, {
                        maxPerPage: Number(event.target.value),
                      })
                    }
                    className="w-16 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </td>
                <td className="px-2 py-3 capitalize">
                  {placement.deviceTargeting}
                </td>
                <td className="px-2 py-3">
                  <Button
                    size="sm"
                    disabled={!canManage || saving === placement.key}
                    onClick={() => savePlacement(placement)}
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {settings?.previewMode && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {placements.map((placement) => (
            <div
              key={placement.key}
              className="grid min-h-28 place-items-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-center dark:border-zinc-700 dark:bg-zinc-950"
            >
              <div>
                <p className="text-xs text-zinc-400">Advertisement</p>
                <p className="mt-1 font-mono text-xs font-bold">
                  {placement.key}
                </p>
                <p className="mt-1 text-[10px] text-zinc-400">
                  {placement.enabled ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Surface>
  );
}
