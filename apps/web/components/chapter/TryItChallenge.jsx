"use client";

import { Play } from "lucide-react";

export default function TryItChallenge({ challenge }) {
  if (!challenge) return null;

  return (
    <div className="p-4 sm:p-8 rounded-4xl sm:rounded-[2.5rem] bg-linear-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 shadow-none sm:shadow-xs border-y sm:border border-indigo-500/20 space-y-3">
      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm sm:text-base">
        <Play className="w-4 h-4 fill-current" />
        <span>Try It Challenge</span>
      </div>
      <p className="text-xs sm:text-sm text-foreground font-semibold leading-relaxed">
        {challenge}
      </p>
    </div>
  );
}
