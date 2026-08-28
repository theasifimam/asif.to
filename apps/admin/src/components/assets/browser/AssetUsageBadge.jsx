"use client";

import { Link2, Unlink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AssetUsageBadge({ usageCount = 0, className }) {
  const count = Number(usageCount) || 0;
  const isUsed = count > 0;
  const Icon = isUsed ? Link2 : Unlink;

  return (
    <span
      title={
        isUsed
          ? `Referenced in ${count} content item${count === 1 ? "" : "s"}`
          : "Not referenced by any tracked content"
      }
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide",
        isUsed
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300",
        className,
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {isUsed ? `Used · ${count}` : "Orphan"}
    </span>
  );
}
