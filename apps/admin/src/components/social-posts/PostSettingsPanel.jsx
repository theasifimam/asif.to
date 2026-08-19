"use client";

import { FORMAT_LIST } from "./formats";
import { PRESETS } from "./presets";

const input =
  "w-full rounded-lg border border-zinc-200/90 dark:border-zinc-800 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/25";

export default function PostSettingsPanel({
  post,
  onPostChange,
  onSettingsChange,
  onApplyPreset,
}) {
  return (
    <div className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-muted-foreground">
          Internal name
        </span>
        <input
          className={input}
          value={post.name || ""}
          onChange={(e) => onPostChange({ name: e.target.value })}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-muted-foreground">
          Category
        </span>
        <input
          className={input}
          placeholder="React.js"
          value={post.category || ""}
          onChange={(e) => onPostChange({ category: e.target.value })}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-muted-foreground">
          Post caption
        </span>
        <textarea
          className={`${input} min-h-24 resize-y`}
          placeholder="Caption to publish with the carousel"
          value={post.caption || ""}
          onChange={(e) => onPostChange({ caption: e.target.value })}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-muted-foreground">
          Hashtags
        </span>
        <input
          className={input}
          placeholder="#ReactJS #JavaScript #WebDevelopment"
          value={(post.hashtags || []).join(" ")}
          onChange={(e) =>
            onPostChange({
              hashtags: e.target.value.split(/[\s,]+/).filter(Boolean),
            })
          }
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">
            Platform
          </span>
          <select
            className={input}
            value={post.platform}
            onChange={(e) => onPostChange({ platform: e.target.value })}
          >
            {["instagram", "linkedin", "twitter", "facebook", "general"].map(
              (platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ),
            )}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">
            Format
          </span>
          <select
            className={input}
            value={post.format}
            onChange={(e) => onPostChange({ format: e.target.value })}
          >
            {FORMAT_LIST.map((format) => (
              <option key={format.id} value={format.id}>
                {format.label} · {format.aspect}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">
            Accent
          </span>
          <input
            className={`${input} h-10 p-1`}
            type="color"
            value={post.settings?.accentColor || "#2563eb"}
            onChange={(e) => onSettingsChange({ accentColor: e.target.value })}
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">
            Code theme
          </span>
          <select
            className={input}
            value={post.settings?.codeTheme || "dark"}
            onChange={(e) => onSettingsChange({ codeTheme: e.target.value })}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>
      </div>

      <div className="space-y-2">
        {[
          ["showBranding", "Show branding"],
          ["showSlideNumbers", "Show slide numbers"],
          ["showCategory", "Show category"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={post.settings?.[key] !== false}
              onChange={(e) => onSettingsChange({ [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-muted-foreground">
          Footer text
        </span>
        <input
          className={input}
          value={post.settings?.footerText || "asif.to"}
          onChange={(e) => onSettingsChange({ footerText: e.target.value })}
        />
      </label>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">
          Start from preset
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset.id)}
              className="rounded-xl border border-zinc-200/90 dark:border-zinc-800 p-3 text-left hover:bg-muted/50"
            >
              <div className="text-sm font-semibold">
                {preset.icon} {preset.label}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
