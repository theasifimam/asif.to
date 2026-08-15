"use client";

import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronDown,
  User,
  LogOut,
  Sun,
  Moon,
  Shield,
  LayoutDashboard,
  ExternalLink,
  Kanban,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function HeaderAccount({
  user,
  avatarUrl,
  setIsLogoutDialogOpen,
}) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const handleNavigate = (path) => {
    setIsOpen(false);
    router.push(path);
  };

  const profileHref = "/profile";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="User Account Menu"
          className="flex items-center gap-2 ml-1 md:ml-2 group/header-user cursor-pointer transition-all hover:opacity-90 outline-none rounded-full border border-zinc-200 dark:border-zinc-900 p-0.5"
        >
          <div className="flex-col items-end leading-none hidden xs:flex">
            <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate max-w-28 md:max-w-36">
              {user?.fullName?.split(" ")[0] || "Admin"}
            </span>
            <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-0.5">
              {user?.role || "Admin"}
            </span>
          </div>

          <div className="relative">
            <Avatar className="w-9 h-9 md:w-10 md:h-9 border border-zinc-100 dark:border-zinc-800 shrink-0 transition-transform group-hover/header-user:scale-105">
              <AvatarImage src={avatarUrl || ""} className="object-cover" />
              <AvatarFallback className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-black uppercase text-xs">
                {getInitials(user?.fullName)}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-950" />
          </div>

          <ChevronDown
            size={14}
            className={`text-zinc-400 dark:text-zinc-500 transition-transform duration-200 hidden sm:block ${
              isOpen ? "rotate-180 text-zinc-900 dark:text-white" : ""
            }`}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={10}
        className="z-50 flex w-76 flex-col gap-3 rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-[0_20px_55px_-24px_rgba(24,24,27,.32)] dark:border-zinc-800/80 dark:bg-[#121215]"
      >
        {/* User Details Summary */}
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Avatar className="w-11 h-11 border border-zinc-200 dark:border-zinc-700 shrink-0">
            <AvatarImage src={avatarUrl || ""} className="object-cover" />
            <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-black uppercase text-sm">
              {getInitials(user?.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-zinc-900 dark:text-white uppercase truncate">
                {user?.fullName || "System Admin"}
              </span>
            </div>
            <span className="text-[10px] font-medium text-zinc-400 truncate">
              {user?.email || "admin@asif.to"}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Shield size={10} />
                {user?.role || "Admin"}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => handleNavigate(profileHref)}
            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all text-zinc-800 dark:text-zinc-200 font-bold text-xs cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <User size={15} />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Visit Profile Page
                </span>
                <span className="text-[10px] font-medium text-zinc-400 mt-0.5">
                  Manage personal account
                </span>
              </div>
            </div>
            <ExternalLink
              size={13}
              className="text-zinc-400 opacity-60 group-hover:opacity-100 transition-opacity"
            />
          </button>

          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all text-zinc-800 dark:text-zinc-200 font-bold text-xs cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                {theme === "dark" ? (
                  <Sun size={15} className="text-amber-500" />
                ) : (
                  <Moon size={15} className="text-blue-600" />
                )}
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Change Theme
                </span>
                <span className="text-[10px] font-medium text-zinc-400 mt-0.5">
                  Switch to {theme === "dark" ? "Light" : "Dark"} mode
                </span>
              </div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50">
              {theme === "dark" ? "Dark" : "Light"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/dashboard")}
            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all text-zinc-800 dark:text-zinc-200 font-bold text-xs cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:scale-105 transition-transform">
                <LayoutDashboard size={15} />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Dashboard
                </span>
                <span className="text-[10px] font-medium text-zinc-400 mt-0.5">
                  Overview & analytics
                </span>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/planner")}
            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all text-zinc-800 dark:text-zinc-200 font-bold text-xs cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:scale-105 transition-transform">
                <Kanban size={15} />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Planner
                </span>
                <span className="text-[10px] font-medium text-zinc-400 mt-0.5">
                  Create & manage tasks
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Log Out Section */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsLogoutDialogOpen(true);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-all font-bold text-xs cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100/60 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                <LogOut size={15} />
              </div>
              <span className="text-xs font-black uppercase tracking-wider">
                Log Out
              </span>
            </div>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
