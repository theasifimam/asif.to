"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import SidebarNavigation from "./SidebarNavigation";
import SidebarAccount from "./SidebarAccount";

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  pathname,
  user,
  avatarUrl,
  navItems,
  setIsLogoutDialogOpen,
}) {
  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? 84 : 280,
      }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="z-45 hidden h-dvh  max-w-[calc(100vw-1rem)] shrink-0 flex-col lg:flex relative"
    >
      {/* Single Dedicated Floating Collapse/Expand Button */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-10 -right-5.5 z-50 h-12 w-12 rounded-full border border-zinc-200/90 bg-white flex items-center justify-center text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-[#18181b] dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-all cursor-pointer"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Main Floating Squircle Card Container */}
      <div className="h-full w-full flex flex-col transition-colors duration-300 border border-zinc-200/80 bg-white  dark:border-zinc-800/80 dark:bg-[#121215] overflow-hidden">
        {/* Sidebar Header / Logo */}
        <div
          className={`flex items-center justify-between gap-2 p-5 sm:p-6 pb-4 sm:pb-5 ${
            isCollapsed ? "items-center justify-center px-0" : ""
          }`}
        >
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="asif.to logo"
              className="w-8 h-8 rounded-xl object-contain shrink-0 group-hover:scale-105 transition-transform"
            />
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <span className="font-outfit font-black text-xl tracking-tight text-zinc-950 dark:text-white">
                  asif
                  <span className="text-blue-600 dark:text-blue-400">.to</span>
                </span>
                <span className="rounded-full border border-zinc-200/80 bg-zinc-50/80 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                  Admin
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <SidebarNavigation
          isCollapsed={isCollapsed}
          pathname={pathname}
          user={user}
          navItems={navItems}
        />

        {/* User Account / Footer */}
        <div
          className={`p-4 mt-auto border-t border-zinc-100 dark:border-zinc-800/80 transition-colors duration-300 relative ${
            isCollapsed ? "flex justify-center" : ""
          }`}
        >
          <SidebarAccount
            user={user}
            avatarUrl={avatarUrl}
            isCollapsed={isCollapsed}
            setIsLogoutDialogOpen={setIsLogoutDialogOpen}
          />
        </div>
      </div>
    </motion.aside>
  );
}
