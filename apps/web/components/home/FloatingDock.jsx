"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { Home, Compass, Search, User } from "lucide-react";

export default function FloatingDock() {
  const pathname = usePathname();
  const { user } = useAppSelector((s) => s.auth);

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Articles", href: "/articles", icon: Compass },
    { label: "Search", href: "/search", icon: Search },
    { label: "Profile", href: user?.username ? `/@${user.username}` : "/", icon: User },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
      <div className="flex items-center gap-1.5 p-2 bg-[#191f13]/95 text-[#f2f5e8] backdrop-blur-2xl border border-[#2d3624] rounded-full shadow-2xl shadow-black/50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all android-haptic ${
                isActive
                  ? "bg-[#b6c173] text-[#1b2111] shadow-md shadow-[#b6c173]/30"
                  : "text-[#c4cb9a] hover:text-white hover:bg-[#21281a]"
              }`}
              title={item.label}
            >
              <Icon size={18} />
              <span className={isActive ? "inline" : "hidden md:inline"}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
