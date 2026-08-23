"use client";

import { ShieldAlert, UserCheck, UserPlus, Users } from "lucide-react";
import { useGetUserOverviewQuery } from "@/redux/services/userApi";

export function UserOverview() {
  const { data, isLoading } = useGetUserOverviewQuery();
  const summary = data?.data?.summary || {};
  const metrics = [
    ["Total users", summary.total, Users],
    ["Active", summary.active, UserCheck],
    ["New · 30d", summary.newUsers, UserPlus],
    ["Restricted", summary.suspended, ShieldAlert],
    ["Readers", summary.readers, Users],
    ["Authors", summary.authors, Users],
    ["Admins", summary.admins, UserCheck],
    ["Pending Invites", summary.pendingInvitations, UserPlus],
  ];

  return (
    <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 xl:grid-cols-8">
      {metrics.map(([label, value, Icon]) => (
        <div
          key={label}
          className="admin-surface flex min-h-32 flex-col justify-between p-4.5 rounded-3xl transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 mb-2">
            <Icon size={15} />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-outfit tracking-tight text-zinc-950 dark:text-white">
              {isLoading ? "—" : Number(value || 0).toLocaleString()}
            </div>
            <div className="mt-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
