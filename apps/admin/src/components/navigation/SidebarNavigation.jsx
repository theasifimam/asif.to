"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import MessageNavBadge from "./MessageNavBadge";

/**
 * Tree connector branch line component (SVG)
 * Draws a continuous vertical stem with an L-curved branch extending to the child item.
 * For the last child, the stem terminates smoothly at the branch curve.
 */
function TreeBranchLine({ isLast }) {
  return (
    <div className="absolute left-0 top-0 bottom-0 w-6 pointer-events-none flex items-center">
      <svg
        className="w-full h-full stroke-zinc-400/60 dark:stroke-zinc-700/80"
        viewBox="0 0 24 36"
        fill="none"
        preserveAspectRatio="none"
      >
        {isLast ? (
          <path
            d="M 12 0 V 10 Q 12 18 22 18"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ) : (
          <>
            <line x1="12" y1="0" x2="12" y2="36" strokeWidth="1.5" />
            <path
              d="M 12 10 Q 12 18 22 18"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </div>
  );
}

/**
 * Item badge pill supporting emerald, amber, blue, and zinc variants
 */
function ItemBadge({ badge }) {
  if (!badge) return null;
  const text = typeof badge === "object" ? badge.text : badge;
  const variant = typeof badge === "object" ? badge.variant : "emerald";

  const colorClasses =
    {
      emerald:
        "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/30",
      amber:
        "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/30",
      blue: "bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/30",
      zinc: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700",
    }[variant] ||
    "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/30";

  return (
    <span
      className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[10px] font-bold rounded-full border leading-none shrink-0 ${colorClasses}`}
    >
      {text}
    </span>
  );
}

/**
 * Quick action button (e.g. '+' to create a new item)
 */
function ItemAction({ action }) {
  if (!action) return null;
  const Icon = action.icon || Plus;

  return (
    <Link
      href={action.href}
      title={action.title || "Quick action"}
      onClick={(e) => e.stopPropagation()}
      className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-950 dark:bg-zinc-800/90 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white transition-colors cursor-pointer shrink-0"
    >
      <Icon size={11} strokeWidth={2.5} />
    </Link>
  );
}

export default function SidebarNavigation({
  isCollapsed,
  pathname,
  user,
  navItems,
}) {
  const [mounted, setMounted] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [openSubmenus, setOpenSubmenus] = useState({});

  // Hover state for collapsed sidebar flyouts and tooltips
  const [hoveredItem, setHoveredItem] = useState(null);
  const [flyoutPosition, setFlyoutPosition] = useState(null);
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Collect all distinct nav hrefs across all groups & submenus
  const allNavHrefs = useMemo(() => {
    const list = [];
    navItems.forEach((group) => {
      group.items.forEach((item) => {
        if (item.href) list.push(item.href.split("?")[0]);
        if (item.children) {
          item.children.forEach((child) => {
            if (child.href) list.push(child.href.split("?")[0]);
          });
        }
      });
    });
    return list;
  }, [navItems]);

  /**
   * Determine if a child href is actively selected.
   * Compares query params for parameterized URLs and exact routes for nested subpages.
   */
  const isChildActive = (childHref, allSiblings = []) => {
    if (!childHref) return false;

    // 1. If childHref has query parameters (e.g. /analytics?source=ga4, /planner?category=Development)
    if (childHref.includes("?")) {
      const [pathPart, queryPart] = childHref.split("?");
      if (pathname !== pathPart) return false;
      if (typeof window !== "undefined") {
        const currentParams = new URLSearchParams(window.location.search);
        const targetParams = new URLSearchParams(queryPart);
        for (const [key, val] of targetParams.entries()) {
          if (currentParams.get(key) !== val) return false;
        }
        return true;
      }
      return false;
    }

    const cleanHref = childHref.split("?")[0];

    // 2. Exact match
    if (pathname === cleanHref) {
      if (typeof window !== "undefined" && window.location.search) {
        // If current URL has a query param matching a sibling item, then base route is not active
        const hasMatchingQuerySibling = allSiblings.some(
          (s) => s.href?.includes("?") && isChildActive(s.href, []),
        );
        if (hasMatchingQuerySibling) return false;
      }
      return true;
    }

    // 3. Subpath match for detail/edit views (e.g. /jobs/sources/new matches /jobs/sources)
    if (cleanHref !== "/" && pathname.startsWith(cleanHref + "/")) {
      const candidateList = allSiblings.length
        ? allSiblings.map((s) => s.href?.split("?")[0]).filter(Boolean)
        : allNavHrefs;
      const otherMatchingHrefs = candidateList.filter(
        (h) =>
          h !== cleanHref && (pathname === h || pathname.startsWith(h + "/")),
      );
      const hasMoreSpecificMatch = otherMatchingHrefs.some(
        (h) => h.length > cleanHref.length || pathname === h,
      );
      if (!hasMoreSpecificMatch) return true;
    }

    return false;
  };

  /**
   * Check if a top-level nav item is active (either itself or any child is active)
   */
  const isItemActive = (item) => {
    const targetHref =
      item.name === "My Profile" && user?._id
        ? `/users/${user._id}`
        : item.href;

    if (
      item.children?.some((child) => isChildActive(child.href, item.children))
    ) {
      return true;
    }

    if (isChildActive(targetHref, [])) return true;
    return false;
  };

  // Automatically keep active group and active submenus open on route navigation
  useEffect(() => {
    navItems.forEach((group) => {
      const hasActiveChild = group.items.some((item) => isItemActive(item));
      if (hasActiveChild) {
        setCollapsedGroups((prev) => ({ ...prev, [group.group]: false }));
      }

      group.items.forEach((item) => {
        if (
          item.children?.some((child) =>
            isChildActive(child.href, item.children),
          )
        ) {
          setOpenSubmenus((prev) => ({ ...prev, [item.name]: true }));
        }
      });
    });
  }, [pathname, navItems, user?._id]);

  const toggleGroup = (groupName) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const toggleSubmenu = (itemName) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  // Hover handlers for collapsed sidebar tooltips & flyouts
  const handleItemMouseEnter = (item, e) => {
    if (!isCollapsed) return;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredItem(item);
    setFlyoutPosition({
      top: rect.top,
      left: rect.right + 10,
      centerY: rect.top + rect.height / 2,
    });
  };

  const handleItemMouseLeave = () => {
    if (!isCollapsed) return;
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
      setFlyoutPosition(null);
    }, 180);
  };

  const handleFlyoutMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleFlyoutMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
      setFlyoutPosition(null);
    }, 180);
  };

  return (
    <nav className="no-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto px-3 pb-6">
      {navItems.map((group) => {
        const isGroupCollapsed = Boolean(collapsedGroups[group.group]);
        const hasActiveItem = group.items.some((item) => isItemActive(item));

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
                  animate={
                    !isCollapsed ? { opacity: 1, height: "auto" } : false
                  }
                  exit={!isCollapsed ? { opacity: 0, height: 0 } : false}
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="flex flex-col gap-1 overflow-hidden"
                >
                  {group.items.map((item) => {
                    const targetHref =
                      item.name === "My Profile" && user?._id
                        ? `/users/${user._id}`
                        : item.href;

                    const active = isItemActive(item);
                    const hasChildren =
                      Array.isArray(item.children) && item.children.length > 0;
                    const isSubmenuOpen = Boolean(openSubmenus[item.name]);

                    // COLLAPSED MODE ITEM
                    if (isCollapsed) {
                      return (
                        <div
                          key={item.name || item.href}
                          onMouseEnter={(e) => handleItemMouseEnter(item, e)}
                          onMouseLeave={handleItemMouseLeave}
                          className="relative flex justify-center py-0.5"
                        >
                          {hasChildren ? (
                            <button
                              type="button"
                              onClick={() => toggleSubmenu(item.name)}
                              className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 cursor-pointer ${
                                active
                                  ? "bg-blue-600 text-white font-bold dark:bg-blue-600 dark:text-white shadow-sm shadow-blue-500/20"
                                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                              }`}
                            >
                              <item.icon
                                size={18}
                                strokeWidth={active ? 2.5 : 2}
                              />
                              {item.badge && (
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#121215]" />
                              )}
                            </button>
                          ) : (
                            <Link
                              href={targetHref}
                              className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 ${
                                active
                                  ? "bg-blue-600 text-white font-bold dark:bg-blue-600 dark:text-white shadow-sm shadow-blue-500/20"
                                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                              }`}
                            >
                              <item.icon
                                size={18}
                                strokeWidth={active ? 2.5 : 2}
                              />
                              {item.href === "/messages" && (
                                <MessageNavBadge compact={true} />
                              )}
                              {item.badge && (
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#121215]" />
                              )}
                            </Link>
                          )}
                        </div>
                      );
                    }

                    // EXPANDED MODE: ITEM WITH SUBMENU
                    if (hasChildren) {
                      return (
                        <div key={item.name} className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => toggleSubmenu(item.name)}
                            className={`group relative flex items-center justify-between rounded-2xl px-3 py-2 transition-all duration-200 cursor-pointer ${
                              active
                                ? "bg-zinc-100 dark:bg-zinc-800/70 text-zinc-950 dark:text-white font-bold"
                                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 font-medium"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                  active
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white"
                                }`}
                              >
                                <item.icon
                                  size={17}
                                  strokeWidth={active ? 2.5 : 2}
                                />
                              </div>
                              <div className="flex flex-col min-w-0 leading-tight text-left">
                                <span
                                  className={`truncate text-xs tracking-tight font-bold ${
                                    active
                                      ? "text-zinc-950 dark:text-white"
                                      : "text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white"
                                  }`}
                                >
                                  {item.name}
                                </span>
                                {item.description && (
                                  <span className="truncate text-[10px] tracking-tight mt-0.5 text-zinc-400 dark:text-zinc-500 font-normal">
                                    {item.description}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              {item.action && (
                                <ItemAction action={item.action} />
                              )}
                              {item.badge && <ItemBadge badge={item.badge} />}
                              <ChevronDown
                                size={14}
                                className={`text-zinc-400 transition-transform duration-200 ${
                                  isSubmenuOpen
                                    ? "rotate-180 text-zinc-700 dark:text-zinc-200"
                                    : "rotate-0"
                                }`}
                              />
                            </div>
                          </button>

                          {/* Nested Sub-items with Tree Branch Lines */}
                          <AnimatePresence initial={false}>
                            {isSubmenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{
                                  duration: 0.18,
                                  ease: "easeInOut",
                                }}
                                className="overflow-hidden flex flex-col pl-3 pt-1 pb-1"
                              >
                                <div className="flex flex-col relative gap-0.5">
                                  {item.children.map((child, idx) => {
                                    const childIsActive = isChildActive(
                                      child.href,
                                      item.children,
                                    );
                                    const isLast =
                                      idx === item.children.length - 1;

                                    return (
                                      <div
                                        key={child.href}
                                        className="relative flex items-center min-h-[34px]"
                                      >
                                        <TreeBranchLine isLast={isLast} />
                                        <Link
                                          href={child.href}
                                          className={`group relative flex flex-1 items-center justify-between ml-6 pl-2.5 pr-3 py-1.5 text-xs rounded-xl transition-all duration-150 ${
                                            childIsActive
                                              ? "bg-zinc-200/90 dark:bg-zinc-800 text-zinc-950 dark:text-white font-bold shadow-xs"
                                              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40 font-medium"
                                          }`}
                                        >
                                          <span className="truncate">
                                            {child.name}
                                          </span>
                                          {childIsActive && (
                                            <ChevronRight
                                              size={13}
                                              strokeWidth={2.5}
                                              className="text-zinc-400 dark:text-zinc-400 shrink-0 ml-auto"
                                            />
                                          )}
                                        </Link>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    }

                    // EXPANDED MODE: REGULAR LINK ITEM
                    return (
                      <Link
                        key={item.href}
                        href={targetHref}
                        className={`group relative flex items-center justify-between rounded-2xl px-3 py-2 transition-all duration-200 ${
                          active
                            ? "bg-blue-600 text-white font-bold dark:bg-blue-600 dark:text-white shadow-sm shadow-blue-500/20"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                              active
                                ? "text-white"
                                : "text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white"
                            }`}
                          >
                            <item.icon
                              size={17}
                              strokeWidth={active ? 2.5 : 2}
                            />
                          </div>
                          <div className="flex flex-col min-w-0 leading-tight">
                            <span
                              className={`truncate text-xs tracking-tight font-bold ${
                                active
                                  ? "text-white"
                                  : "text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white"
                              }`}
                            >
                              {item.name}
                            </span>
                            {item.description && (
                              <span
                                className={`truncate text-[10px] tracking-tight mt-0.5 ${
                                  active
                                    ? "text-blue-100/80 font-medium dark:text-blue-200/70"
                                    : "text-zinc-400 dark:text-zinc-500 font-normal"
                                }`}
                              >
                                {item.description}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {item.action && <ItemAction action={item.action} />}
                          {item.badge && <ItemBadge badge={item.badge} />}
                          {item.href === "/messages" && (
                            <MessageNavBadge compact={false} />
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Floating Hover Popover & Tooltip Portal for Collapsed Sidebar */}
      {mounted &&
        isCollapsed &&
        hoveredItem &&
        flyoutPosition &&
        createPortal(
          <div
            style={{
              top: flyoutPosition.top,
              left: flyoutPosition.left,
            }}
            className="fixed z-[9999] flex flex-col gap-1.5 pointer-events-auto select-none"
            onMouseEnter={handleFlyoutMouseEnter}
            onMouseLeave={handleFlyoutMouseLeave}
          >
            {/* Title / Tooltip Badge */}
            <div className="self-start rounded-lg bg-zinc-900 dark:bg-[#1e1e24] border border-zinc-700/80 px-3 py-1.5 text-xs font-bold text-white shadow-xl flex items-center gap-2">
              <span>{hoveredItem.name}</span>
              {hoveredItem.badge && <ItemBadge badge={hoveredItem.badge} />}
            </div>

            {/* Submenu Popover Card if Item Has Children */}
            {hoveredItem.children && hoveredItem.children.length > 0 && (
              <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-xl p-2.5 shadow-2xl min-w-[190px] flex flex-col gap-0.5">
                {hoveredItem.children.map((child, idx) => {
                  const childIsActive = isChildActive(
                    child.href,
                    hoveredItem.children,
                  );
                  const isLast = idx === hoveredItem.children.length - 1;

                  return (
                    <div
                      key={child.href}
                      className="relative flex items-center min-h-[32px]"
                    >
                      <TreeBranchLine isLast={isLast} />
                      <Link
                        href={child.href}
                        onClick={() => {
                          setHoveredItem(null);
                          setFlyoutPosition(null);
                        }}
                        className={`group relative flex flex-1 items-center justify-between ml-6 pl-2 pr-2.5 py-1.5 text-xs rounded-xl transition-all ${
                          childIsActive
                            ? "bg-zinc-200/90 dark:bg-zinc-800 text-zinc-950 dark:text-white font-bold"
                            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40 font-medium"
                        }`}
                      >
                        <span className="truncate">{child.name}</span>
                        {childIsActive && (
                          <ChevronRight
                            size={13}
                            strokeWidth={2.5}
                            className="text-zinc-500 dark:text-zinc-400 shrink-0 ml-auto"
                          />
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>,
          document.body,
        )}
    </nav>
  );
}
