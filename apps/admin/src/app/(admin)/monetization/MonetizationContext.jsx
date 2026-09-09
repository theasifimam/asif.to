"use client";

import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/permissions";
import { monetizationApi } from "@/lib/api";
import { Switch } from "@/components/ui/switch";

export const CONTENT_TYPES = [
  ["article", "Articles", "Long-form editorial content"],
  ["course", "Course chapters", "Published learning chapters"],
  ["cheatsheet", "Cheatsheets", "Reference and revision sheets"],
  ["interview", "Interview questions", "Individual question pages"],
];

export const STATUS_STYLES = {
  Opportunity:
    "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/25 dark:text-blue-200",
  Warning:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-200",
  Healthy:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-200",
  Experiment:
    "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/50 dark:bg-violet-950/25 dark:text-violet-200",
};

export const number = (value) =>
  Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 1 });
export const percentage = (value) => `${(Number(value || 0) * 100).toFixed(1)}%`;

export function rangeFor(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export function Surface({ title, description, action, children, className = "" }) {
  return (
    <section
      className={`rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#121215] sm:p-6 ${className}`}
    >
      {(title || action) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && (
              <h2 className="text-base font-black text-zinc-950 dark:text-white">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Metric({ label, value, source, note, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-blue-500" />}
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
        {value}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-semibold text-zinc-400">
        <span>{note || " "}</span>
        {source && (
          <span className="rounded-full border border-zinc-200 px-2 py-0.5 uppercase dark:border-zinc-700">
            {source}
          </span>
        )}
      </div>
    </div>
  );
}

export function ToggleRow({ label, description, checked, onChange, disabled }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span>
        <span className="block text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {label}
        </span>
        <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
          {description}
        </span>
      </span>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </label>
  );
}

export function SimpleTable({ headers, rows, empty }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-400 dark:border-zinc-800">
        {empty || "No data available."}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-md text-left text-xs">
        <thead className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-400 dark:border-zinc-800">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-2 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
          {rows.map((row, idx) => (
            <tr key={idx}>
              {row.map((cell, cidx) => (
                <td key={cidx} className="px-2 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const MonetizationContext = createContext(null);

export function MonetizationProvider({ children }) {
  const { user } = useAuth();
  const canManage = hasPermission(user, "monetization.manage");
  const [days, setDays] = useState(28);
  const range = useMemo(() => rangeFor(days), [days]);

  const [settings, setSettings] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [overview, setOverview] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [confirmEnable, setConfirmEnable] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [
      settingsResult,
      placementsResult,
      overviewResult,
      performanceResult,
      recommendationsResult,
    ] = await Promise.all([
      monetizationApi.settings(),
      monetizationApi.placements(),
      monetizationApi.overview(range),
      monetizationApi.performance(range),
      monetizationApi.recommendations(range),
    ]);
    setLoading(false);

    const failed = [
      settingsResult,
      placementsResult,
      overviewResult,
      performanceResult,
      recommendationsResult,
    ].find((res) => !res.success);

    if (failed) {
      toast.error(failed.error || "Unable to load monetization data.");
      return;
    }

    setSettings(settingsResult.data?.data || null);
    setPlacements(placementsResult.data?.data || []);
    setOverview(overviewResult.data?.data || null);
    setPerformance(performanceResult.data?.data || null);
    setRecommendations(recommendationsResult.data?.data || []);
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const patchSettings = useCallback(
    async (patch, message) => {
      if (!canManage) return;
      setSaving("settings");
      const result = await monetizationApi.updateSettings(patch);
      setSaving("");
      if (result.success) {
        setSettings(result.data?.data || null);
        toast.success(message || "Settings updated.");
      } else {
        toast.error(result.error || "Failed to update settings.");
      }
    },
    [canManage]
  );

  const editPlacement = useCallback(
    (key, patch) => {
      setPlacements((current) =>
        current.map((item) => (item.key === key ? { ...item, ...patch } : item))
      );
    },
    []
  );

  const savePlacement = useCallback(
    async (placement) => {
      if (!canManage) return;
      setSaving(placement.key);
      const result = await monetizationApi.updatePlacement(placement.key, {
        enabled: placement.enabled,
        slotId: placement.slotId,
        minWordCount: placement.minWordCount,
        maxPerPage: placement.maxPerPage,
      });
      setSaving("");
      if (result.success) {
        toast.success(`Updated ${placement.label || placement.key}`);
        load();
      } else {
        toast.error(result.error || "Unable to save placement.");
      }
    },
    [canManage, load]
  );

  const live = Boolean(settings?.runtimeEffective?.live);

  const value = {
    user,
    canManage,
    days,
    setDays,
    range,
    settings,
    setSettings,
    placements,
    setPlacements,
    overview,
    performance,
    recommendations,
    loading,
    saving,
    live,
    confirmEnable,
    setConfirmEnable,
    load,
    patchSettings,
    editPlacement,
    savePlacement,
  };

  return (
    <MonetizationContext.Provider value={value}>
      {children}
    </MonetizationContext.Provider>
  );
}

export function useMonetization() {
  const ctx = useContext(MonetizationContext);
  if (!ctx) {
    throw new Error("useMonetization must be used within MonetizationProvider");
  }
  return ctx;
}
