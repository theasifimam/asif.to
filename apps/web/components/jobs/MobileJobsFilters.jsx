"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  SlidersHorizontal,
  X,
  MapPin,
  Briefcase,
  Sparkles,
  Clock,
  RotateCcw,
} from "lucide-react";
import JobsFilters from "./JobsFilters";

export default function MobileJobsFilters(props) {
  const [open, setOpen] = useState(false);
  const values = props.values || {};

  const activeCount = Object.entries(values).filter(
    ([key, value]) =>
      value && value !== "all" && !["page", "sort", "job"].includes(key),
  ).length;

  const quickChips = [
    {
      key: "location",
      label:
        values.location && values.location !== "all"
          ? values.location.replaceAll("-", " ")
          : "Location",
      icon: MapPin,
      active: Boolean(values.location && values.location !== "all"),
    },
    {
      key: "workMode",
      label:
        values.workMode && values.workMode !== "all"
          ? values.workMode.replaceAll("-", " ")
          : "Work Mode",
      icon: Briefcase,
      active: Boolean(values.workMode && values.workMode !== "all"),
    },
    {
      key: "category",
      label:
        values.category && values.category !== "all"
          ? values.category.replaceAll("-", " ")
          : "Category",
      icon: Sparkles,
      active: Boolean(values.category && values.category !== "all"),
    },
    {
      key: "employmentType",
      label:
        values.employmentType && values.employmentType !== "all"
          ? values.employmentType.replaceAll("-", " ")
          : "Type",
      icon: Clock,
      active: Boolean(values.employmentType && values.employmentType !== "all"),
    },
  ];

  return (
    <>
      {/* Mobile Horizontal Quick App Filter Bar */}
      <div className="lg:hidden mb-4 w-full max-w-full overflow-x-auto no-scrollbar flex items-center gap-2 py-1 min-w-0">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`shrink-0 inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-black shadow-xs transition-all cursor-pointer ${
            activeCount > 0
              ? "bg-blue-600 text-white shadow-blue-600/20"
              : "bg-white text-zinc-900 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white text-blue-600 px-1 text-[10px] font-black">
              {activeCount}
            </span>
          )}
        </button>

        {quickChips.map((chip) => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => setOpen(true)}
              className={`shrink-0 inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-all capitalize cursor-pointer ${
                chip.active
                  ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/60 font-black"
                  : "bg-white text-zinc-600 border border-zinc-200/80 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 ${chip.active ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"}`}
              />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop Sidebar (Preserved) */}
      <div className="hidden lg:block">
        <JobsFilters {...props} />
      </div>

      {/* Mobile App Bottom Sheet Filter Modal */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-200 bg-zinc-950/60 backdrop-blur-sm transition-opacity" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-201 mx-auto flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-4xl border border-zinc-200 bg-white text-zinc-950 shadow-2xl outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 motion-safe:animate-[job-sheet-in_220ms_ease-out]">
            {/* Top Drag Handle */}
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>

            {/* App Sheet Header */}
            <div className="flex items-center justify-between px-5 pb-3 pt-1 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <Dialog.Title className="font-outfit text-lg font-black tracking-tight">
                  Filter jobs
                </Dialog.Title>
                {activeCount > 0 && (
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-black text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                    {activeCount} active
                  </span>
                )}
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close filters"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* App Sheet Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 [-webkit-overflow-scrolling:touch]">
              <JobsFilters {...props} />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
