"use client";

import React from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import LogoLoader from "@/components/ui/LogoLoader";

export default function SettingsSaveBar({ username, isUpdating }) {
  return (
    <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 p-4 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl mt-2">
      <Link
        href={`/${username || ""}`}
        className="px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold transition-all text-center"
      >
        Cancel
      </Link>

      <button
        type="submit"
        disabled={isUpdating}
        className="px-7 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
      >
        {isUpdating ? (
          <>
            <LogoLoader size={15} />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Save size={15} />
            <span>Save Changes</span>
          </>
        )}
      </button>
    </div>
  );
}
