"use client";

import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, User, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function SidebarAccount({
  user,
  avatarUrl,
  isCollapsed,
  setIsLogoutDialogOpen,
}) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/60 hover:bg-zinc-200/80 dark:hover:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 transition-all group/user shadow-sm cursor-pointer ${
            isCollapsed ? "justify-center w-full" : ""
          }`}
          title={isCollapsed ? user?.fullName || "Account Options" : ""}
        >
          <div
            className={
              isCollapsed
                ? "flex items-center"
                : "flex items-center gap-3 min-w-0"
            }
          >
            <Avatar className="w-10 h-10 border border-zinc-200 dark:border-zinc-700 shadow-sm shrink-0 transition-transform group-hover/user:scale-105">
              <AvatarImage src={avatarUrl || ""} className="object-cover" />
              <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-black uppercase text-xs">
                {user?.fullName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2) || "AD"}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col text-left leading-tight truncate">
                <span className="text-[13px] font-black text-black dark:text-white tracking-tight uppercase truncate">
                  {user?.fullName || "Admin User"}
                </span>
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-none mt-0.5 truncate">
                  {user?.role || "Admin"}
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <ChevronRight
              size={16}
              className="text-zinc-400 group-hover/user:text-zinc-900 dark:group-hover/user:text-white transition-transform shrink-0"
            />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="top"
        sideOffset={12}
        className="w-64 z-[100] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-2xl shadow-black/10 dark:shadow-black/60 flex flex-col gap-3"
      >
        {/* User Info Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Avatar className="w-10 h-10 border border-zinc-200 dark:border-zinc-700 shadow-sm shrink-0">
            <AvatarImage src={avatarUrl || ""} className="object-cover" />
            <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-black uppercase text-xs">
              {user?.fullName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2) || "AD"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black font-outfit text-zinc-900 dark:text-white uppercase truncate">
              {user?.fullName || "Admin User"}
            </span>
            <span className="text-[10px] font-bold text-zinc-400 truncate">
              {user?.email || "admin@asif.to"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              router.push(user?._id ? `/users/${user._id}` : "/profile");
            }}
            className="flex items-center justify-between p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all text-zinc-800 dark:text-zinc-200 font-bold text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <User size={16} className="text-blue-600 dark:text-blue-400" />
              <span>My Profile</span>
            </div>
            <ChevronRight size={14} className="text-zinc-400" />
          </button>

          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center justify-between p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all text-zinc-800 dark:text-zinc-200 font-bold text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              {theme === "dark" ? (
                <Sun size={16} className="text-amber-500" />
              ) : (
                <Moon size={16} className="text-blue-600" />
              )}
              <span>Theme</span>
            </div>
            <span className="text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              {theme === "dark" ? "Dark" : "Light"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLogoutDialogOpen(true);
            }}
            className="flex items-center justify-between p-2.5 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-red-600 dark:text-red-400 font-bold text-xs mt-1 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <LogOut size={16} />
              <span>Log Out</span>
            </div>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
