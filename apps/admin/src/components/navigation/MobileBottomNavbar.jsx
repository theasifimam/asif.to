"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronRight,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Sparkles,
  X,
} from "lucide-react";
import { activityApi } from "@/lib/api";
import MessageNavBadge from "./MessageNavBadge";

export default function MobileBottomNavbar({
  navItems = [],
  user,
  isVisible = true,
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const islandRef = useRef(null);

  // Load unread notifications count
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await activityApi.notifications({ limit: 1 });
        if (response.success && response.data?.data) {
          setUnreadNotifications(response.data.data.unreadCount || 0);
        }
      } catch {
        // ignore
      }
    };
    loadNotifications();
    const interval = setInterval(loadNotifications, 60_000);
    window.addEventListener("notifications:refresh", loadNotifications);
    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications:refresh", loadNotifications);
    };
  }, []);

  // Close island on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
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
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  const checkIsActive = (href) => {
    if (pathname === href) return true;
    if (!href || href === "/") return false;
    const baseHref = href.startsWith("/articles") ? "/articles" : href;
    return pathname.startsWith(baseHref + "/") || pathname === baseHref;
  };

  const primaryTabs = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      name: "Activity",
      href: "/activity",
      icon: Bell,
      isActive: pathname.startsWith("/activity"),
      badge: unreadNotifications,
    },
    {
      name: "Messages",
      href: "/messages",
      icon: MessageSquare,
      isActive: pathname.startsWith("/messages"),
      isMessageBadge: true,
    },
  ];

  return (
    <>
      {/* Light Backdrop when Menu Island is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 lg:hidden"
        />
      )}

      {/* Floating Menu Island - Positioned directly above bottom pill bar */}
      {isOpen && (
        <div
          ref={islandRef}
          id="mobile-menu-island"
          data-scroll-ignore="true"
          onScroll={(e) => e.stopPropagation()}
          className="fixed bottom-22 left-4 right-4 z-45 mx-auto max-w-sm rounded-[28px] border border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-3xl shadow-2xl p-4.5 max-h-[calc(100dvh-7.5rem)] overflow-y-auto animate-in slide-in-from-bottom-3 zoom-in-95 duration-200 scrollbar-none lg:hidden"
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
              className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Navlink Groups */}
          <div className="flex flex-col gap-4">
            {navItems.map((group) => (
              <div key={group.group} className="flex flex-col gap-2">
                <h3 className="px-1 text-[9.5px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
                  {group.group}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map((item) => {
                    const targetHref =
                      item.name === "My Profile" && user?._id
                        ? `/users/${user._id}`
                        : item.href;
                    const isActive = checkIsActive(targetHref);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={targetHref}
                        onClick={() => setIsOpen(false)}
                        className={`group relative flex items-center gap-2.5 rounded-2xl border p-2.5 transition-all active:scale-95 ${
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
          </div>
        </div>
      )}

      {/* Floating Rounded Pill Bottom Tab Bar */}
      <nav
        aria-label="Mobile navigation"
        className={`fixed bottom-4 left-4 right-4 z-45 mx-auto flex h-16 max-w-sm items-center justify-around rounded-full border border-zinc-200/80 bg-white/80 px-3 shadow-2xl shadow-zinc-950/15 backdrop-blur-xl transition-all duration-300 ease-out dark:border-zinc-800/80 dark:bg-[#121215]/80 dark:shadow-black/60 lg:hidden ${
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
              className={`relative flex h-12 w-16 flex-col items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${
                tab.isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon size={19} strokeWidth={tab.isActive ? 2.5 : 2} />
                {tab.isMessageBadge && (
                  <div className="absolute -top-1 -right-2">
                    <MessageNavBadge />
                  </div>
                )}
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-black text-white shadow-xs">
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                )}
              </div>
              <span className="mt-1 max-w-full truncate font-outfit text-[10px] font-bold tracking-tight">
                {tab.name}
              </span>
            </Link>
          );
        })}

        {/* More Menu Island Toggle Button */}
        <button
          id="mobile-menu-island-toggle"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-12 w-16 flex-col items-center justify-center rounded-full transition-all duration-200 active:scale-90 cursor-pointer ${
            isOpen
              ? "text-blue-600 dark:text-blue-400"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          {isOpen ? <X size={19} strokeWidth={2.5} /> : <Menu size={19} />}
          <span className="mt-1 font-outfit text-[10px] font-bold tracking-tight">
            {isOpen ? "Close" : "More"}
          </span>
        </button>
      </nav>
    </>
  );
}
