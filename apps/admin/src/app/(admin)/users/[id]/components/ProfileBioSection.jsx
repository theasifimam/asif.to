"use client";

import React from "react";
import { User as UserIcon } from "lucide-react";
import SectionHeader from "./SectionHeader";

export default function ProfileBioSection({ user }) {
  return (
    <section className="space-y-4">
      <SectionHeader title="Biography & Narrative" />
      <div className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-xl rounded-4xl p-8 sm:p-10 shadow-sm relative overflow-hidden group min-h-40">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <UserIcon size={120} />
        </div>
        <p className="text-base sm:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium relative z-10">
          {user.bio ||
            "No biography provided for this personnel. Professional narrative remains empty."}
        </p>
        {user.expertise && user.expertise.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 relative z-10">
            {user.expertise.map((exp) => (
              <span
                key={exp}
                className="px-3.5 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700"
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
