"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, User } from "lucide-react";
import { useAppSelector } from "@/lib/store/hooks";
import { getImageUrl } from "@/lib/config";
import { useScrollNavVisible } from "@/components/ScrollNavProvider";

export default function BottomNav() {
  const pathname = usePathname();
  const isNavVisible = useScrollNavVisible();
  const { user, isAuthenticated, isInitialized } = useAppSelector(
    (s) => s.auth,
  );

  const isHomeActive = pathname === "/";
  const profilePath = user?.username ? `/@${user.username}` : null;
  const isProfileActive = profilePath ? pathname.startsWith(profilePath) : false;

  return (
    <nav
      className={`fixed left-1/2 -translate-x-1/2 z-50 md:hidden bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl px-4 py-2 rounded-full shadow-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-3 transition-[bottom,opacity] duration-300 ease-in-out ${
        isNavVisible
          ? "bottom-4 opacity-100"
          : "bottom-[-5rem] opacity-0 pointer-events-none"
      }`}
    >
      {/* Home Tab Button */}
      <Link
        href="/"
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
          isHomeActive
            ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105"
            : "text-zinc-500 dark:text-zinc-400 hover:text-foreground active:scale-95"
        }`}
      >
        <Home className="w-4 h-4" />
        <span className="text-xs font-bold tracking-tight">Home</span>
      </Link>

      {/* Divider */}
      <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800" />

      {/* Profile Tab Button */}
      <Link
        href={profilePath || "/"}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
          isProfileActive
            ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105"
            : "text-zinc-500 dark:text-zinc-400 hover:text-foreground active:scale-95"
        }`}
      >
        {!isInitialized ? (
          <div className="w-4 h-4 rounded-full bg-zinc-300 dark:bg-zinc-700 animate-pulse" />
        ) : isAuthenticated && user ? (
          <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 border border-white/40">
            {user.avatar ? (
              <Image
                src={getImageUrl(user.avatar)}
                alt={user.fullName}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="w-full h-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center">
                {user.fullName?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>
        ) : (
          <User className="w-4 h-4" />
        )}
        <span className="text-xs font-bold tracking-tight">Profile</span>
      </Link>
    </nav>
  );
}
