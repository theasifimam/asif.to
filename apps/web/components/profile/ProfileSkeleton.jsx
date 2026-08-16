"use client";

import React from "react";

export default function ProfileSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Hero Card Skeleton */}
      <div className="p-6 sm:p-9 rounded-[2.5rem] bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
        <div className="flex-1 space-y-3 w-full text-center sm:text-left">
          <div className="h-7 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-xl mx-auto sm:mx-0" />
          <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg mx-auto sm:mx-0" />
          <div className="h-4 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg mx-auto sm:mx-0" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 h-24"
          />
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="h-12 w-full max-w-md bg-zinc-200 dark:bg-zinc-800 rounded-full" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 h-44"
          />
        ))}
      </div>
    </div>
  );
}
