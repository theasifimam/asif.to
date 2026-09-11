"use client";

import React from "react";

export default function SettingToggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  icon: Icon,
}) {
  return (
    <label
      className={`flex items-center justify-between gap-5 py-4 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <span className="flex gap-3">
        {Icon && (
          <span className="mt-0.5">
            <Icon size={16} className="text-zinc-400" />
          </span>
        )}
        <span>
          <span className="block text-xs sm:text-sm font-bold">{label}</span>
          <span className="mt-0.5 block text-[11px] sm:text-xs leading-relaxed text-zinc-500">
            {description}
          </span>
        </span>
      </span>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-zinc-200 transition peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 dark:bg-zinc-700">
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </span>
    </label>
  );
}
