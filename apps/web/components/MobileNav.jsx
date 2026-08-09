"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, User } from "lucide-react";
import { motion } from "framer-motion";
import { useAppSelector } from "@/lib/store/hooks";
import { getImageUrl } from "@/lib/config";
import Image from "next/image";

export default function MobileNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized } = useAppSelector((s) => s.auth);

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-white/95 dark:bg-[#1a1c18]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 px-6 py-2.5 z-[100] rounded-full shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isProfile = item.label === "Profile";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center justify-center p-2.5 rounded-full transition-all duration-350 android-haptic ${
                isActive
                  ? "text-[#1b2111] dark:text-[#1b2111]"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeMobileNavPill"
                  className="absolute inset-0 bg-[#b6c173] dark:bg-[#c2d08a] rounded-full -z-10 shadow-md shadow-[#b6c173]/25 dark:shadow-[#c2d08a]/25 border border-[#9fa963] dark:border-[#a3b363]"
                  transition={{ type: "spring", stiffness: 350, damping: 26 }}
                />
              )}

              {isProfile && !isInitialized ? (
                <div className="w-6 h-6 rounded-full bg-zinc-150 dark:bg-zinc-850 animate-pulse" />
              ) : isProfile && isAuthenticated && user ? (
                <div
                  className={`w-6 h-6 rounded-full overflow-hidden border transition-all ${
                    isActive ? "border-[#1b2111]" : "border-transparent"
                  }`}
                >
                  <Image
                    src={
                      user.avatar
                        ? getImageUrl(user.avatar)
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=1b2111&color=ffffff`
                    }
                    alt={user.fullName}
                    width={24}
                    height={24}
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}