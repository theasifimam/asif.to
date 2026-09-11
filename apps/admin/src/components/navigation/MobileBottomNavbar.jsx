"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartNoAxesCombined,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import MessageNavBadge from "./MessageNavBadge";

export default function MobileBottomNavbar({
  navItems = [],
  user,
  isVisible = true,
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [menuQuery, setMenuQuery] = useState("");
  const islandRef = useRef(null);

  // Close island on route change
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsOpen(false);
      setMenuQuery("");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const main = document.querySelector("[data-admin-main]");
    const previousOverflow = main?.style.overflowY || "";
    if (main) main.style.overflowY = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const handlePointerDown = (event) => {
      if (islandRef.current && !islandRef.current.contains(event.target)) {
        // if clicked inside bottom bar toggle button, let toggle handler run
        const toggleBtn = document.getElementById("mobile-menu-island-toggle");
        if (toggleBtn && toggleBtn.contains(event.target)) return;
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      if (main) main.style.overflowY = previousOverflow;
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const checkIsActive = (href) => {
    if (pathname === href) return true;
    if (!href || href === "/") return false;
    const baseHref = href.startsWith("/articles") ? "/articles" : href;
    return pathname.startsWith(baseHref + "/") || pathname === baseHref;
  };

  const permittedHrefs = new Set(
    navItems.flatMap((group) => group.items.map((item) => item.href?.split("?")[0])),
  );
  const primaryTabs = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: ChartNoAxesCombined,
      isActive: pathname.startsWith("/analytics"),
    },
    {
      name: "Messages",
      href: "/messages",
      icon: MessageSquare,
      isActive: pathname.startsWith("/messages"),
      isMessageBadge: true,
    },
  ].filter(
    (tab) => tab.href === "/dashboard" || permittedHrefs.has(tab.href),
  );

  const normalizedQuery = menuQuery.trim().toLowerCase();
  const filteredNavItems = navItems
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        [
          item.name,
          item.description,
          ...(item.children || []).flatMap((child) => [child.name, child.href]),
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery)),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* Light Backdrop when Menu Island is open */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 lg:hidden"
        />
      )}

      {/* Floating Menu Island - Positioned directly above bottom pill bar */}
      {isOpen && (
        <div
          ref={islandRef}
          id="mobile-menu-island"
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
          data-scroll-ignore="true"
          onScroll={(e) => e.stopPropagation()}
          data-mobile-menu
          className="fixed left-2 right-2 z-45 mx-auto max-w-md overflow-y-auto rounded-[28px] border border-zinc-200/90 bg-white/97 p-3.5 shadow-2xl backdrop-blur-3xl animate-in slide-in-from-bottom-3 zoom-in-95 duration-200 scrollbar-none dark:border-zinc-800/90 dark:bg-[#121215]/97 sm:left-4 sm:right-4 sm:p-4.5 lg:hidden"
        >
          {/* Header inside island */}
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3.5 dark:border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Sparkles size={13} />
              </span>
              <h2 className="font-outfit text-sm font-black tracking-tight text-zinc-950 dark:text-white">
                Admin Navigation
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
              aria-label="Close admin navigation"
            >
              <X size={18} />
            </button>
          </div>

          <label className="relative mb-4 block">
            <span className="sr-only">Filter admin navigation</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={menuQuery}
              onChange={(event) => setMenuQuery(event.target.value)}
              placeholder="Find a section..."
              autoComplete="off"
              className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-base font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:bg-zinc-900"
            />
          </label>

          {/* Navlink Groups */}
          <div className="flex flex-col gap-4">
            {filteredNavItems.map((group) => (
              <div key={group.group} className="flex flex-col gap-2">
                <h3 className="px-1 text-[9.5px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
                  {group.group}
                </h3>
                <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                  {group.items.map((item) => {
                    const targetHref =
                      item.name === "My Profile" && user?._id
                        ? `/users/${user._id}`
                        : item.href;
                    const isActive =
                      checkIsActive(targetHref) ||
                      Boolean(
                        item.children?.some((child) =>
                          checkIsActive(child.href)
                        )
                      );
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={targetHref}
                        onClick={() => setIsOpen(false)}
                        className={`group relative flex min-h-14 items-center gap-2.5 rounded-2xl border p-2.5 transition-all active:scale-95 ${
                          isActive
                            ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20"
                            : "border-zinc-200/60 bg-zinc-50/70 hover:border-zinc-300 hover:bg-white dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-white text-zinc-600 shadow-2xs dark:bg-zinc-800 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-outfit text-xs font-bold leading-tight">
                            {item.name}
                          </p>
                          {item.description && (
                            <p
                              className={`truncate text-[9.5px] mt-0.5 ${
                                isActive
                                  ? "text-blue-100"
                                  : "text-zinc-400 dark:text-zinc-500"
                              }`}
                            >
                              {item.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            {filteredNavItems.length === 0 && (
              <div className="rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-center text-sm font-medium text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                No admin section matches “{menuQuery}”.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Rounded Pill Bottom Tab Bar */}
      <nav
        aria-label="Mobile navigation"
        data-mobile-nav
        className={`fixed left-1/2 z-45 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center justify-center gap-0.5 rounded-full border border-zinc-200/80 bg-white/95 p-1 shadow-2xl backdrop-blur-2xl transition-[bottom,opacity] duration-300 ease-in-out dark:border-zinc-800/80 dark:bg-zinc-900/95 lg:hidden ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-28 opacity-0 pointer-events-none"
        }`}
      >
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => setIsOpen(false)}
              aria-label={tab.name}
              aria-current={tab.isActive ? "page" : undefined}
              className={`flex items-center gap-1.5 rounded-full transition-all duration-300 ${
                tab.isActive && !isOpen
                  ? "bg-blue-600 px-3.5 text-white shadow-md shadow-blue-500/25"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-white"
              }`}
            >
              <span className="relative flex min-h-11 min-w-11 items-center justify-center gap-1.5">
                <Icon className="h-4 w-4 shrink-0" strokeWidth={tab.isActive ? 2.5 : 2} />
                {tab.isMessageBadge && (
                  <span className="absolute right-1 top-0.5">
                    <MessageNavBadge />
                  </span>
                )}
                {tab.isActive && !isOpen && (
                  <span className="animate-in whitespace-nowrap text-xs font-bold tracking-tight fade-in zoom-in-95 duration-200">
                    {tab.name}
                  </span>
                )}
              </span>
            </Link>
          );
        })}

        <div className="mx-0.5 h-4 w-px shrink-0 bg-zinc-200 dark:bg-zinc-800" />

        {/* More Menu Island Toggle Button */}
        <button
          id="mobile-menu-island-toggle"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="mobile-menu-island"
          aria-label="Toggle navigation menu"
          className={`flex items-center gap-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            isOpen
              ? "bg-zinc-900 px-3.5 text-white shadow-md dark:bg-white dark:text-zinc-900"
              : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-white"
          }`}
        >
          <span className="flex min-h-11 min-w-11 items-center justify-center gap-1.5">
            {isOpen ? (
              <X className="h-4 w-4 shrink-0" />
            ) : (
              <Menu className="h-4 w-4 shrink-0" />
            )}
            {isOpen && (
              <span className="animate-in whitespace-nowrap text-xs font-bold tracking-tight fade-in zoom-in-95 duration-200">
                Close
              </span>
            )}
          </span>
        </button>
      </nav>
    </>
  );
}
