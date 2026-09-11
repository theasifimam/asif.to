"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

export default function SecurityInfoCard() {
  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-xs border border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
      <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
        <ShieldCheck size={22} />
      </div>
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground mb-1">
          Encrypted & Privacy Protected
        </h3>
        <p className="text-xs text-zinc-500 font-medium leading-relaxed">
          Your profile information is securely synced. Only public details
          (name, avatar, location, bio, and connected links) are displayed on your
          public profile.
        </p>
      </div>
    </div>
  );
}
