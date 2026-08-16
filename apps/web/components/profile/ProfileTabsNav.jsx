"use client";

import React from "react";

export default function ProfileTabsNav({
  tabs = [],
  activeTab,
  onSelectTab,
}) {
  return (
    <div className="w-full overflow-x-auto pb-1 scrollbar-none">
      <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl sm:rounded-full bg-zinc-200/60 dark:bg-zinc-900 text-xs font-bold shrink-0 min-w-full sm:min-w-0">
        {tabs.map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            onClick={() => onSelectTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl sm:rounded-full transition-all whitespace-nowrap text-xs font-bold cursor-pointer ${
              activeTab === key
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-zinc-600 dark:text-zinc-400 hover:text-foreground hover:bg-zinc-300/40 dark:hover:bg-zinc-800/40"
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{label}</span>
            {badge !== undefined && badge !== null && badge > 0 && (
              <span
                className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[9.5px] font-black ${
                  activeTab === key
                    ? "bg-white/20 text-white"
                    : "bg-zinc-300 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                }`}
              >
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
