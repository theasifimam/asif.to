"use client";

import { ShieldAlert, UserCheck, UserPlus, Users } from "lucide-react";
import { useGetUserOverviewQuery } from "@/redux/services/userApi";

const USER_METRIC_THEMES = {
  sky: {
    card: "bg-sky-50/75 dark:bg-[#0c1524] border-sky-200/70 dark:border-sky-900/40",
    borderHover: "hover:border-sky-300 dark:hover:border-sky-600/60",
    glow: "from-sky-400/20 via-sky-400/5 to-transparent",
    iconContainer:
      "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/30",
  },
  emerald: {
    card: "bg-emerald-50/75 dark:bg-[#0a1a14] border-emerald-200/70 dark:border-emerald-900/40",
    borderHover: "hover:border-emerald-300 dark:hover:border-emerald-600/60",
    glow: "from-emerald-400/20 via-emerald-400/5 to-transparent",
    iconContainer:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30",
  },
  indigo: {
    card: "bg-indigo-50/75 dark:bg-[#12132b] border-indigo-200/70 dark:border-indigo-900/40",
    borderHover: "hover:border-indigo-300 dark:hover:border-indigo-600/60",
    glow: "from-indigo-400/20 via-indigo-400/5 to-transparent",
    iconContainer:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/30",
  },
  rose: {
    card: "bg-rose-50/75 dark:bg-[#1a0c14] border-rose-200/70 dark:border-rose-900/40",
    borderHover: "hover:border-rose-300 dark:hover:border-rose-600/60",
    glow: "from-rose-400/20 via-rose-400/5 to-transparent",
    iconContainer:
      "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200/80 dark:border-rose-500/30",
  },
  teal: {
    card: "bg-teal-50/75 dark:bg-[#091b1a] border-teal-200/70 dark:border-teal-900/40",
    borderHover: "hover:border-teal-300 dark:hover:border-teal-600/60",
    glow: "from-teal-400/20 via-teal-400/5 to-transparent",
    iconContainer:
      "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300 border border-teal-200/80 dark:border-teal-500/30",
  },
  purple: {
    card: "bg-purple-50/75 dark:bg-[#160d24] border-purple-200/70 dark:border-purple-900/40",
    borderHover: "hover:border-purple-300 dark:hover:border-purple-600/60",
    glow: "from-purple-400/20 via-purple-400/5 to-transparent",
    iconContainer:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 border border-purple-200/80 dark:border-purple-500/30",
  },
  amber: {
    card: "bg-amber-50/75 dark:bg-[#1c140a] border-amber-200/70 dark:border-amber-900/40",
    borderHover: "hover:border-amber-300 dark:hover:border-amber-600/60",
    glow: "from-amber-400/20 via-amber-400/5 to-transparent",
    iconContainer:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200/80 dark:border-amber-500/30",
  },
  cyan: {
    card: "bg-cyan-50/75 dark:bg-[#0a1921] border-cyan-200/70 dark:border-cyan-900/40",
    borderHover: "hover:border-cyan-300 dark:hover:border-cyan-600/60",
    glow: "from-cyan-400/20 via-cyan-400/5 to-transparent",
    iconContainer:
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-500/30",
  },
};

export function UserOverview() {
  const { data, isLoading } = useGetUserOverviewQuery();
  const summary = data?.data?.summary || {};

  const metrics = [
    ["Total users", summary.total, Users, "sky"],
    ["Active", summary.active, UserCheck, "emerald"],
    ["New · 30d", summary.newUsers, UserPlus, "indigo"],
    ["Restricted", summary.suspended, ShieldAlert, "rose"],
    ["Readers", summary.readers, Users, "teal"],
    ["Authors", summary.authors, Users, "purple"],
    ["Admins", summary.admins, UserCheck, "amber"],
    ["Pending Invites", summary.pendingInvitations, UserPlus, "cyan"],
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 xl:grid-cols-8">
      {metrics.map(([label, value, Icon, tone]) => {
        const theme = USER_METRIC_THEMES[tone] || USER_METRIC_THEMES.sky;
        return (
          <div
            key={label}
            className={`group relative flex min-h-32 flex-col justify-between overflow-hidden p-4.5 rounded-3xl border shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${theme.card} ${theme.borderHover}`}
          >
            {/* Ultra-minimal ambient corner glow */}
            <div
              className={`pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full bg-linear-to-br ${theme.glow} blur-lg transition-opacity duration-300 group-hover:opacity-100 opacity-70`}
            />

            <div
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-2xs ${theme.iconContainer} mb-2`}
            >
              <Icon size={15} />
            </div>
            <div className="relative z-10">
              <div className="text-xl sm:text-2xl font-black font-outfit tracking-tight text-zinc-950 dark:text-white">
                {isLoading ? "—" : Number(value || 0).toLocaleString()}
              </div>
              <div className="mt-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                {label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
