"use client";

import React from "react";
import { Skeleton } from "@/components/ui";

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 sm:p-10 animate-pulse transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <Skeleton className="h-8 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden h-64 flex flex-col justify-end p-6 gap-4">
          <Skeleton className="h-10 w-1/3 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <Skeleton className="h-4 w-1/4 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-[2rem] bg-zinc-200 dark:bg-zinc-800" />
          <Skeleton className="h-32 rounded-[2rem] bg-zinc-200 dark:bg-zinc-800" />
          <Skeleton className="h-32 rounded-[2rem] bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
