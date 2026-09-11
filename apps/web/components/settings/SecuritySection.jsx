"use client";

import React from "react";
import { ChevronDown, Shield } from "lucide-react";
import AccountManagementSettings from "@/components/auth/AccountManagementSettings";

export default function SecuritySection({
  isOpen,
  onToggle,
  user,
}) {
  return (
    <div className="transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 sm:p-7 text-left hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
      >
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
        <ChevronDown
          size={18}
          className={`text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-5 sm:p-7 pt-0 animate-in fade-in duration-200">
          <AccountManagementSettings user={user} />
        </div>
      )}
    </div>
  );
}
