"use client";

import { useSearchParams } from "next/navigation";
import { ChevronLeft, Edit3 } from "lucide-react";
import { Button } from "@/components/ui";
import { getModuleBackUrl } from "@/hooks/useModuleHistory";

export default function ProfileTopNav({
  isOwnProfile,
  statusConf,
  setIsEditOpen,
  router,
}) {
  const searchParams = useSearchParams();
  const returnTo = getModuleBackUrl("/users", searchParams.get("returnTo"));

  return (
    <div className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-850 px-3 sm:px-6 py-2.5 sm:py-4 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 min-w-0">
        <Button
          variant="ghost"
          onClick={() => router.push(returnTo)}
          className="group flex items-center gap-1 -ml-2 sm:-ml-3 text-xs sm:text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-all rounded-full cursor-pointer shrink-0 px-2 sm:px-4"
        >
          <ChevronLeft
            size={18}
            className="transition-transform group-hover:-translate-x-1 shrink-0"
          />
          <span>Back to users</span>
        </Button>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 flex-wrap justify-end">
          {isOwnProfile && (
            <span className="hidden sm:inline-block bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-500/20">
              Your Profile
            </span>
          )}

          <div
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border border-zinc-200/50 dark:border-zinc-800 ${statusConf.bg}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
            <span
              className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${statusConf.text}`}
            >
              {statusConf.label}
            </span>
          </div>

          <Button
            onClick={() => setIsEditOpen(true)}
            className="h-8 sm:h-9 px-3 sm:px-5 rounded-full font-bold text-[10px] uppercase tracking-wider sm:tracking-widest flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
          >
            <Edit3 size={13} className="shrink-0" />
            <span className="hidden sm:inline">
              {isOwnProfile ? "Edit My Profile" : "Edit Profile"}
            </span>
            <span className="sm:hidden">Edit</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
