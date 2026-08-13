"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, PanelLeftClose } from "lucide-react";
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
        width: isCollapsed ? 80 : 288,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="hidden lg:flex fixed inset-y-0 left-0 h-full max-w-[calc(100vw-1rem)] shrink-0 flex-col border-r border-zinc-200 bg-white backdrop-blur-xl transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950 lg:relative z-45"
    >
      {/* Toggle Button (Desktop) */}
      <div
        className={`absolute top-8 z-50 transition-all duration-300 ${isCollapsed ? "right-0 translate-x-1/2 top-12" : "right-4"}`}
      >
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white shadow-sm cursor-pointer ${isCollapsed ? "scale-110" : ""}`}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <PanelLeftClose size={20} />
          )}
        </button>
      </div>

      <div
        className={`p-6 pb-8 flex items-center justify-between gap-2 ${isCollapsed ? "items-center px-0 justify-center" : ""}`}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="asif.to"
            className="w-8 h-8 rounded-xl object-contain shadow-sm shrink-0"
          />
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="font-outfit font-black text-xl tracking-tight text-zinc-900 dark:text-white">
                asif
                <span className="text-blue-600 dark:text-blue-400">.to</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                Admin
              </span>
            </div>
          )}
        </Link>
      </div>

      <SidebarNavigation
        isCollapsed={isCollapsed}
        pathname={pathname}
        user={user}
        navItems={navItems}
      />

      <div className={`p-4 mt-auto border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300 relative ${isCollapsed ? "flex justify-center" : ""}`}>
        <SidebarAccount
          user={user}
          avatarUrl={avatarUrl}
          isCollapsed={isCollapsed}
          setIsLogoutDialogOpen={setIsLogoutDialogOpen}
        />
      </div>
    </motion.aside>
  );
}
