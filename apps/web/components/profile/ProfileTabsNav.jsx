"use client";

import React from "react";

export default function ProfileTabsNav({ tabs = [], activeTab, onSelectTab }) {
  return (
    <div className="w-full overflow-x-auto pb-1 scrollbar-none">
      <div className="inline-flex max-w-full items-center gap-1 text-xs font-bold">
        {tabs.map(({ key, label, icon: Icon, badge }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onSelectTab(key)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? "bg-white text-blue-600 shadow-xs dark:bg-zinc-800 dark:text-blue-400"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <Icon
                size={14}
                className={
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-zinc-400 dark:text-zinc-500"
                }
              />
              <span>{label}</span>
              {badge !== undefined && badge !== null && badge > 0 && (
                <span
                  className={`ml-0.5 px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-950/10 dark:text-blue-400"
                      : "bg-zinc-200/70 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
