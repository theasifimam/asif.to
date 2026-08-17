"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import MessageNavBadge from "./MessageNavBadge";

export default function SidebarNavigation({
  isCollapsed,
  pathname,
  user,
  navItems,
}) {
  const checkIsActive = (href) => {
    if (pathname === href) return true;
    if (!href || href === "/") return false;
    const baseHref = href.startsWith("/articles") ? "/articles" : href;
    return pathname.startsWith(baseHref + "/") || pathname === baseHref;
  };

  // Track collapsed state per group
  const [collapsedGroups, setCollapsedGroups] = useState({});

  // Automatically keep active group open on route navigation
  useEffect(() => {
    navItems.forEach((group) => {
      const hasActiveChild = group.items.some((item) => {
        const targetHref =
          item.name === "My Profile" && user?._id
            ? `/users/${user._id}`
            : item.href;
        return checkIsActive(targetHref) || checkIsActive(item.href);
      });
      if (hasActiveChild) {
        setCollapsedGroups((prev) => ({ ...prev, [group.group]: false }));
      }
    });
  }, [pathname, navItems, user?._id]);

  const toggleGroup = (groupName) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  return (
    <nav className="no-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto px-3.5 pb-6">
      {navItems.map((group) => {
        const isGroupCollapsed = Boolean(collapsedGroups[group.group]);
        const hasActiveItem = group.items.some((item) => {
          const targetHref =
            item.name === "My Profile" && user?._id
              ? `/users/${user._id}`
              : item.href;
          return checkIsActive(targetHref) || checkIsActive(item.href);
        });

        return (
          <div key={group.group} className="flex flex-col gap-1">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.button
                  type="button"
                  onClick={() => toggleGroup(group.group)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="group/header flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer select-none"
                >
                  <span className="truncate flex items-center gap-1.5">
                    <span>{group.group}</span>
                    {hasActiveItem && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    )}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-semibold text-zinc-400/80 dark:text-zinc-600">
                      {group.items.length}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`text-zinc-400 dark:text-zinc-600 transition-transform duration-200 ${
                        isGroupCollapsed ? "-rotate-90" : "rotate-0"
                      }`}
                    />
                  </div>
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {(!isGroupCollapsed || isCollapsed) && (
                <motion.div
                  initial={!isCollapsed ? { opacity: 0, height: 0 } : false}
                  animate={!isCollapsed ? { opacity: 1, height: "auto" } : false}
                  exit={!isCollapsed ? { opacity: 0, height: 0 } : false}
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="flex flex-col gap-1 overflow-hidden"
                >
                  {group.items.map((item) => {
                    const targetHref =
                      item.name === "My Profile" && user?._id
                        ? `/users/${user._id}`
                        : item.href;

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
                            : "px-3 py-2 justify-start"
                        } ${
                          isActive
                            ? "bg-blue-600 text-white font-bold dark:bg-blue-600 dark:text-white shadow-sm shadow-blue-500/20"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                              isActive
                                ? "text-white"
                                : "text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white"
                            }`}
                          >
                            <item.icon
                              size={17}
                              strokeWidth={isActive ? 2.5 : 2}
                            />
                          </div>
                          {!isCollapsed && (
                            <div className="flex flex-col min-w-0 leading-tight">
                              <span
                                className={`truncate text-xs tracking-tight font-bold ${
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
                        {item.href === "/messages" && (
                          <MessageNavBadge compact={isCollapsed} />
                        )}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}
