"use client";

import React from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useMonetization,
  Surface,
} from "../MonetizationContext";

export default function SettingsPage() {
  const {
    canManage,
    saving,
    settings,
    setSettings,
    patchSettings,
  } = useMonetization();

  if (!settings) {
    return (
      <div className="p-8 text-center text-xs text-zinc-400">
        Loading settings…
      </div>
    );
  }

  return (
    <>
      <Surface
        title="Content-density thresholds"
        description="These caps are conservative defaults. Saving does not enable ads or placements."
        action={
          <Button
            disabled={!canManage || saving === "settings"}
            onClick={() =>
              patchSettings(
                { contentRules: settings.contentRules },
                "Content rules updated."
              )
            }
          >
            <Save className="h-4 w-4" />
            Save rules
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(settings.contentRules?.thresholds || []).map(
            (threshold, index) => (
              <label
                key={`${threshold.minWords}-${index}`}
                className="rounded-2xl border border-zinc-200 p-3 text-xs font-bold dark:border-zinc-800"
              >
                Minimum words
                <input
                  type="number"
                  min="0"
                  max="100000"
                  value={threshold.minWords}
                  disabled={!canManage}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      contentRules: {
                        ...current.contentRules,
                        thresholds: current.contentRules.thresholds.map(
                          (item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  minWords: Number(event.target.value),
                                }
                              : item
                        ),
                      },
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                />
                <span className="mt-3 block">Maximum ads</span>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={threshold.maxAds}
                  disabled={!canManage}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      contentRules: {
                        ...current.contentRules,
                        thresholds: current.contentRules.thresholds.map(
                          (item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  maxAds: Number(event.target.value),
                                }
                              : item
                        ),
                      },
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </label>
            )
          )}
        </div>
      </Surface>

      <Surface
        title="Environment and deployment"
        description="Configuration supplied by build/deploy environment variables."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Environment Master
            </span>
            <p className="mt-2 text-sm font-bold">
              {settings.environment?.masterEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              AdSense Client ID
            </span>
            <p className="mt-2 font-mono text-xs">
              {settings.adsenseClientId || "Not configured"}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              API Status
            </span>
            <p className="mt-2 text-sm font-bold">Connected</p>
          </div>
        </div>
      </Surface>
    </>
  );
}
