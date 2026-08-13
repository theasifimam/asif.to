"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GraduationCap, Users, Menu } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function MobileBottomNavbar({
  navItems,
  user,
  isVisible = true,
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Bottom tab buttons configuration
  const primaryTabs = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Courses", href: "/courses", icon: GraduationCap },
    { name: "Users", href: "/users", icon: Users },
  ];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-45 h-16 border-t border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-850 dark:bg-zinc-950/95 lg:hidden flex items-center justify-around px-2 shadow-lg shadow-black/5 dark:shadow-black/25 transition-all duration-300 ease-in-out ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      {primaryTabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-200 ${
              isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold mt-1 tracking-tight truncate max-w-full">
              {tab.name}
            </span>
          </Link>
        );
      })}

      {/* More Button opens shadcn Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-200 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
          >
            <Menu size={20} />
            <span className="text-[10px] font-bold mt-1 tracking-tight">
              More
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-[calc(100vw-2rem)] max-h-[80vh] overflow-y-auto rounded-4xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 gap-6 scrollbar-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
              Navigation Menu
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6 pt-2">
            {navItems.map((group) => (
              <div key={group.group} className="flex flex-col gap-2.5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600 px-1">
                  {group.group}
                </h3>
                <div className="grid grid-cols-2 gap-2">
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
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                          isActive
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 border-transparent text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        <item.icon
                          size={16}
                          strokeWidth={isActive ? 2.5 : 2}
                          className="shrink-0"
                        />
                        <span className="text-xs font-bold truncate tracking-tight">
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
