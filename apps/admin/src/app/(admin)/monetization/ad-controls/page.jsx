"use client";

import React from "react";
import {
  useMonetization,
  Surface,
  ToggleRow,
  CONTENT_TYPES,
} from "../MonetizationContext";

export default function AdControlsPage() {
  const {
    canManage,
    saving,
    settings,
    live,
    setConfirmEnable,
    patchSettings,
  } = useMonetization();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Surface
        title="Emergency control"
        description="Global OFF always wins and invalidates the runtime config cache immediately."
      >
        <ToggleRow
          label="Show ads on asif.to"
          description={
            live
              ? "Serving is permitted by environment and database controls."
              : "No AdSense slot is currently permitted to render."
          }
          checked={Boolean(settings?.adsEnabled)}
          disabled={!canManage || saving === "settings"}
          onChange={(checked) =>
            checked
              ? setConfirmEnable(true)
              : patchSettings({ adsEnabled: false }, "Global ads disabled.")
          }
        />
        {!settings?.environment?.masterEnabled && (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
            The deployment master switch is OFF. Database changes cannot make ads live until it is enabled.
          </div>
        )}
      </Surface>

      <Surface
        title="Content types"
        description="These switches apply before any individual placement rule."
      >
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {CONTENT_TYPES.map(([key, label, description]) => (
            <ToggleRow
              key={key}
              label={label}
              description={description}
              checked={settings?.contentTypes?.[key] !== false}
              disabled={!canManage || saving === "settings"}
              onChange={(checked) =>
                patchSettings(
                  { contentTypes: { [key]: checked } },
                  `${label} ads ${checked ? "enabled" : "disabled"}.`
                )
              }
            />
          ))}
        </div>
      </Surface>

      <Surface
        title="Preview mode"
        description="Shows reserved placement previews in this admin module only. It never requests Google ads or creates impressions."
      >
        <ToggleRow
          label="Preview placements"
          description="Render visual placeholders below the placement table."
          checked={Boolean(settings?.previewMode)}
          disabled={!canManage || saving === "settings"}
          onChange={(checked) =>
            patchSettings(
              { previewMode: checked },
              `Preview mode ${checked ? "enabled" : "disabled"}.`
            )
          }
        />
      </Surface>
    </div>
  );
}
