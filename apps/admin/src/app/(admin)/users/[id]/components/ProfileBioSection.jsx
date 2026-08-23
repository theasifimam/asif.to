"use client";

import React from "react";
import SectionHeader from "./SectionHeader";

export default function ProfileBioSection({ user }) {
  return (
    <section className="space-y-3">
      <SectionHeader title="Biography & Narrative" />
      <div className="rounded-[28px] sm:rounded-[32px] bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
        <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
          {user.bio || "No public biography provided for this user profile."}
        </p>
        {user.expertise && user.expertise.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            {user.expertise.map((exp) => (
              <span
                key={exp}
                className="px-3 py-1 rounded-full bg-zinc-50 dark:bg-zinc-900 text-[10px] font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800"
              >
                {exp}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
