"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import MessageNavBadge from "./MessageNavBadge";

export default function SidebarNavigation({
  isCollapsed,
  pathname,
  user,
  navItems,
}) {
  return (
    <nav className="no-scrollbar flex flex-1 flex-col gap-6 overflow-y-auto px-3.5 pb-4">
      {navItems.map((group) => (
        <div key={group.group} className="flex flex-col gap-1.5">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="truncate px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500"
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

              const checkIsActive = (href) => {
                if (pathname === href) return true;
                if (!href || href === "/") return false;
                const baseHref = href.startsWith("/articles")
                  ? "/articles"
                  : href;
                return (
                  pathname.startsWith(baseHref + "/") || pathname === baseHref
                );
              };

              const isActive =
                checkIsActive(targetHref) || checkIsActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={targetHref}
                  title={
                    isCollapsed
                      ? `${item.name}${item.description ? ` — ${item.description}` : ""}`
                      : ""
                  }
                  className={`group relative flex items-center rounded-2xl transition-all duration-200 ${
                    isCollapsed
                      ? "h-11 w-11 justify-center p-0 mx-auto"
                      : "px-3 py-2.5 justify-start"
                  } ${
                    isActive
                      ? "bg-blue-600 text-white font-bold dark:bg-blue-600 dark:text-white"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white"
                      }`}
                    >
                      <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    {!isCollapsed && (
                      <div className="flex flex-col min-w-0 leading-tight">
                        <span
                          className={`truncate text-[13px] tracking-tight font-bold ${
                            isActive
                              ? "text-white"
                              : "text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white"
                          }`}
                        >
                          {item.name}
                        </span>
                        {item.description && (
                          <span
                            className={`truncate text-[10px] tracking-tight mt-0.5 ${
                              isActive
                                ? "text-blue-100/80 font-medium dark:text-blue-200/70"
                                : "text-zinc-400 dark:text-zinc-500 font-normal"
                            }`}
                          >
                            {item.description}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {item.href === "/messages" && <MessageNavBadge compact={isCollapsed} />}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
