"use client";

import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
          className={`w-full flex items-center justify-between p-2.5 rounded-2xl bg-zinc-50 dark:bg-[#18181b] hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800/80 transition-all group/user shadow-xs cursor-pointer ${
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
            <Avatar className="w-9 h-9 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs shrink-0 transition-transform group-hover/user:scale-105">
              <AvatarImage src={avatarUrl || ""} className="object-cover" />
              <AvatarFallback className="bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-white font-black uppercase text-xs">
                {user?.fullName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2) || "AD"}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col text-left leading-tight truncate">
                <span className="text-xs font-black text-zinc-950 dark:text-white tracking-tight uppercase truncate">
                  {user?.fullName || "Admin User"}
                </span>
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mt-0.5 truncate">
                  {user?.role || "Admin"}
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <ChevronRight
              size={15}
              className="text-zinc-400 group-hover/user:text-zinc-900 dark:group-hover/user:text-white transition-transform shrink-0"
            />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="top"
        sideOffset={10}
        className="w-68 z-[100] bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-[24px] p-3.5 shadow-2xl flex flex-col gap-2.5"
      >
        {/* User Info Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Avatar className="w-9 h-9 border border-zinc-200 dark:border-zinc-700 shadow-xs shrink-0">
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
            <span className="text-[10px] font-medium text-zinc-400 truncate">
              {user?.email || "admin@asif.to"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              router.push("/profile");
            }}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all text-zinc-700 dark:text-zinc-300 font-bold text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <User size={14} />
              </div>
              <span>My Profile</span>
            </div>
            <ChevronRight size={13} className="text-zinc-400" />
          </button>

          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all text-zinc-700 dark:text-zinc-300 font-bold text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                {theme === "dark" ? (
                  <Sun size={14} />
                ) : (
                  <Moon size={14} className="text-blue-600" />
                )}
              </div>
              <span>Theme</span>
            </div>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              {theme === "dark" ? "Dark" : "Light"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLogoutDialogOpen(true);
            }}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all text-rose-600 dark:text-rose-400 font-bold text-xs mt-1 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-100/60 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <LogOut size={14} />
              </div>
              <span>Log Out</span>
            </div>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
