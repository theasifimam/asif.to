"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NeoDropdown, NeoDropdownItem, NeoDropdownLabel, NeoDropdownSeparator } from "@/components/ui/neo-dropdown";
import { NeoModal } from "@/components/ui/neo-modal";
import { Button } from "@/components/ui/button";
import {
  User,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  ShieldCheck } from
"lucide-react";

import { PAGE_CONFIG } from "@/lib/constants";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // logout in context already handles redirect usually, but keeping this just in case
  };

  // Get page config or fallback
  const currentConfig = PAGE_CONFIG[pathname] || {
    title: pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard",
    description: "asif.to Admin Panel"
  };

  // Sync document title
  useEffect(() => {
    document.title = `${currentConfig.title} | asif.to Admin`;
  }, [currentConfig.title]);

  return (
    <header className="sticky top-0 z-40 w-full mb-6">
            <div className="flex items-center justify-between p-4 lg:px-8 py-4 bg-background/50 backdrop-blur-md border-b border-border/5">
                {/* Title Area */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Admin Console / {pathname.split("/")[1] || "overview"}
                        </span>
                    </div>
                    <h1 className="text-xl font-black uppercase tracking-tight text-foreground">
                        {currentConfig.title}
                    </h1>
                    <p className="text-[11px] font-medium text-muted-foreground/80 tracking-wide mt-0.5">
                        {currentConfig.description}
                    </p>
                </div>

                {/* Actions Area */}
                <div className="flex items-center gap-4">
                    {/* Notification Bell (Mock) */}
                    <button className="relative p-2 rounded-full hover:bg-muted/10 transition-colors text-muted-foreground hover:text-foreground">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-background animate-pulse" />
                    </button>

                    {/* Theme Toggle */}
                    <div className="hidden md:block">
                        <ThemeToggle />
                    </div>

                    {/* User Dropdown */}
                    <NeoDropdown
            align="right"
            trigger={
            <div className="flex items-center gap-3 pl-2 py-1 pr-1 bg-muted/5 hover:bg-muted/10 border border-border/10 rounded-full transition-all group cursor-pointer">
                                <div className="hidden md:flex flex-col items-end mr-1">
                                    <span className="text-xs font-bold text-foreground leading-none">{user?.fullName || "Admin"}</span>
                                    <span className="text-[9px] font-medium text-muted-foreground uppercase">{user?.role || "User"}</span>
                                </div>
                                <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                                    <AvatarImage src={user?.profilePicture?.url} className="object-cover" />
                                    <AvatarFallback>{user?.fullName?.[0] || "A"}</AvatarFallback>
                                </Avatar>
                                <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors mr-2" />
                            </div>
            }>
            
                        <NeoDropdownLabel>My Account</NeoDropdownLabel>
                        <Link href={`/users/${user?.id}`}>
                            <NeoDropdownItem icon={<User className="w-4 h-4" />}>
                                Profile
                            </NeoDropdownItem>
                        </Link>
                        <Link href="/settings">
                            <NeoDropdownItem icon={<Settings className="w-4 h-4" />}>
                                Settings
                            </NeoDropdownItem>
                        </Link>
                        <Link href="/verification">
                            <NeoDropdownItem icon={<ShieldCheck className="w-4 h-4" />}>
                                Verification
                            </NeoDropdownItem>
                        </Link>

                        <NeoDropdownSeparator />

                        <NeoDropdownItem
              variant="destructive"
              icon={<LogOut className="w-4 h-4" />}
              onClick={() => setIsLogoutModalOpen(true)}>
              
                            Log Out
                        </NeoDropdownItem>
                    </NeoDropdown>
                </div>
            </div>

            {/* LOGOUT CONFIRMATION MODAL */}
            <NeoModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Log Out?"
        description="Are you sure you want to end your session?"
        variant="danger"
        footer={
        <div className="flex gap-3 w-full">
                        <Button variant="ghost" onClick={() => setIsLogoutModalOpen(false)} className="flex-1 rounded-[12px] font-bold">
                            Cancel
                        </Button>
                        <Button
            onClick={handleLogout}
            className="flex-1 rounded-[12px] bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-wide">
            
                            Confirm Exit
                        </Button>
                    </div>
        }>
        
                <div className="p-4 bg-red-500/5 rounded-[16px] border border-red-500/10 flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-red-500" />
                    <p className="text-xs text-red-500 font-medium">You will be returned to the login screen.</p>
                </div>
            </NeoModal>
        </header>);

}