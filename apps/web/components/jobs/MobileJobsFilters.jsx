"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useBottomSheetDrag } from "@/lib/hooks/useBottomSheetDrag";

export default function MobileJobsFilters(props) {
  const [open, setOpen] = useState(false);
  const { dragProps, sheetStyle } = useBottomSheetDrag({
    onClose: () => setOpen(false),
  });
  const router = useRouter();
  const values = props.values || {};
  const clearHref = props.fixed?.location
    ? `/jobs/location/${props.fixed.location}`
    : props.fixed?.category
      ? `/jobs/category/${props.fixed.category}`
      : "/jobs";

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

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push(clearHref);
            }}
            className="shrink-0 inline-flex min-h-10 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 text-xs font-black text-zinc-600 transition hover:border-blue-300 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-blue-700 dark:hover:text-blue-400"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset filters</span>
          </button>
        )}

        {quickChips.map((chip) => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => setOpen(true)}
              className={`shrink-0 inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-all capitalize cursor-pointer ${
                chip.active
                  ? "bg-blue-600 text-white border border-blue-600 dark:bg-blue-600 dark:text-white dark:border-blue-500 font-black shadow-xs shadow-blue-600/20"
                  : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800/80"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 ${chip.active ? "text-white dark:text-white" : "text-zinc-400 dark:text-zinc-400"}`}
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
          <Dialog.Overlay className="fixed inset-0 z-300 bg-zinc-950/60 backdrop-blur-sm transition-opacity" />
          <Dialog.Content
            style={sheetStyle}
            className="fixed inset-x-0 bottom-0 z-301 mx-auto flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-4xl border border-zinc-200 bg-white text-zinc-950 shadow-2xl outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 motion-safe:animate-[job-sheet-in_420ms_cubic-bezier(0.16,1,0.3,1)]"
          >
            <div
              className="shrink-0 select-none touch-none cursor-grab active:cursor-grabbing border-b border-zinc-100 dark:border-zinc-800"
              {...dragProps}
            >
              {/* Top Drag Handle */}
              <div className="pt-3 pb-1 flex justify-center shrink-0">
                <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              </div>

              {/* App Sheet Header */}
              <div className="flex items-center justify-between px-5 pb-3 pt-1 shrink-0">
                <div className="flex items-center gap-2">
                  <Dialog.Title className="font-outfit text-lg font-black tracking-tight">
                    Filter jobs
                  </Dialog.Title>
                  {activeCount > 0 && (
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-black text-blue-700 dark:bg-blue-900/60 dark:text-blue-200">
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
