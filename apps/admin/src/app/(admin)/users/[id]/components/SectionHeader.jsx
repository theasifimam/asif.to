"use client";

import React from "react";

export default function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 whitespace-nowrap">
        {title}
      </h2>
      <div className="h-[1px] w-full bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
