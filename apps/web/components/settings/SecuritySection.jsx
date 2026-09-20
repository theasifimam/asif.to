"use client";

import React from "react";
import { Shield } from "lucide-react";
import AccountManagementSettings from "@/components/auth/AccountManagementSettings";

export default function SecuritySection({
  user,
}) {
  return (
    <div className="transition-colors">
      <div className="w-full p-5 text-left sm:p-7">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
            <Shield size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-foreground">
                Account Security & Danger Zone
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold">
                Security
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              Change password, active sessions, deactivation, and account deletion.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0 sm:p-7 sm:pt-0">
          <AccountManagementSettings user={user} />
      </div>
    </div>
  );
}
