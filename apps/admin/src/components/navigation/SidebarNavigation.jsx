"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function SidebarNavigation({
  isCollapsed,
  pathname,
  user,
  navItems,
}) {
  return (
    <nav className="flex-1 px-4 flex flex-col gap-10 overflow-y-auto no-scrollbar">
      {navItems.map((group) => (
        <div key={group.group} className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 text-[10px] font-black rounded-full uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-700 truncate"
              >
                {group.group}
              </motion.h3>
            )}
          </AnimatePresence>
          <div className="flex flex-col gap-1">
            {group.items.map((item) => {
              const targetHref =
                item.name === "My Profile" && user?._id
                  ? `/users/${user._id}`
                  : item.href;
              const isActive =
                pathname === targetHref || pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={targetHref}
                  title={isCollapsed ? item.name : ""}
                  className={`group flex items-center px-4 py-3 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-600"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
                  } ${isCollapsed ? "justify-center" : "justify-between"}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      size={18}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={
                        isActive
                          ? "text-white"
                          : "text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-200"
                      }
                    />
                    {!isCollapsed && (
                      <span
                        className={`text-[13px] font-bold tracking-tight ${isActive ? "font-extrabold" : ""} truncate`}
                      >
                        {item.name}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && isActive && (
                    <motion.div
                      layoutId="active"
                      className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
