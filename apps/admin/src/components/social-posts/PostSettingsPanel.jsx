"use client";

import { FORMAT_LIST } from "./formats";
import { PRESETS } from "./presets";

const input =
  "w-full rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-background px-3.5 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/25 transition-all";

export default function PostSettingsPanel({
  post,
  onPostChange,
  onSettingsChange,
  onApplyPreset,
}) {
  return (
    <div className="space-y-6">
      {/* Basic Post Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Internal Name
          </span>
          <input
            className={input}
            placeholder="e.g. React useEffect Carousel"
            value={post.name || ""}
            onChange={(e) => onPostChange({ name: e.target.value })}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Category / Topic
          </span>
          <input
            className={input}
            placeholder="e.g. React.js, Next.js"
            value={post.category || ""}
            onChange={(e) => onPostChange({ category: e.target.value })}
          />
        </label>
      </div>

      {/* Target Platform & Format */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <label className="space-y-1.5">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
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
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </option>
              ),
            )}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Format / Aspect Ratio
          </span>
          <select
            className={input}
            value={post.format}
            onChange={(e) => onPostChange({ format: e.target.value })}
          >
            {FORMAT_LIST.map((format) => (
              <option key={format.id} value={format.id}>
                {format.label} ({format.aspect})
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Accent Theme Color
          </span>
          <div className="flex items-center gap-2">
            <input
              className="h-10 w-12 rounded-xl border border-zinc-200/90 dark:border-zinc-800 p-1 cursor-pointer bg-background"
              type="color"
              value={post.settings?.accentColor || "#2563eb"}
              onChange={(e) => onSettingsChange({ accentColor: e.target.value })}
            />
            <input
              className={`${input} flex-1 font-mono uppercase`}
              value={post.settings?.accentColor || "#2563eb"}
              onChange={(e) => onSettingsChange({ accentColor: e.target.value })}
            />
          </div>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Code Theme
          </span>
          <select
            className={input}
            value={post.settings?.codeTheme || "dark"}
            onChange={(e) => onSettingsChange({ codeTheme: e.target.value })}
          >
            <option value="dark">Dark Theme</option>
            <option value="light">Light Theme</option>
          </select>
        </label>
      </div>

      {/* Visual Toggles & Footer */}
      <div className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-muted/20 space-y-4">
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
          Display & Branding Preferences
        </span>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            ["showBranding", "Show asif.to branding"],
            ["showSlideNumbers", "Show slide numbers"],
            ["showCategory", "Show topic badge"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary/25"
                checked={post.settings?.[key] !== false}
                onChange={(e) => onSettingsChange({ [key]: e.target.checked })}
              />
              {label}
            </label>
          ))}
        </div>

        <label className="block space-y-1.5 pt-1">
          <span className="text-xs font-semibold text-muted-foreground">
            Custom Footer Text
          </span>
          <input
            className={input}
            placeholder="asif.to"
            value={post.settings?.footerText || "asif.to"}
            onChange={(e) => onSettingsChange({ footerText: e.target.value })}
          />
        </label>
      </div>

      {/* Preset Library */}
      <div className="space-y-3 pt-2">
        <div>
          <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Quick Start Presets
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select a pre-configured theme and layout style for your carousel.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset.id)}
              className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-3.5 text-left hover:border-primary/40 hover:bg-primary/5 transition-all group"
            >
              <div className="text-sm font-bold group-hover:text-primary transition-colors flex items-center gap-1.5">
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
