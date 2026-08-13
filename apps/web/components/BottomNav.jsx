"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  BookOpen,
  Menu,
  X,
  FileCode,
  Layers,
  HelpCircle,
  ChevronRight,
  LogOut,
  Sparkles,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { clearCredentials } from "@/lib/store/authSlice";
import { useSignoutMutation } from "@/lib/api/authApi";
import { getImageUrl } from "@/lib/config";
import { useScrollNavVisible } from "@/components/ScrollNavProvider";
import { ThemeToggle } from "./ThemeToggle";
import AuthModal from "./AuthModal";
import LogoutConfirm from "./header/LogoutConfirm";
import { toast } from "sonner";

const MENU_SECTIONS = [
  {
    title: "Courses & Tutorials",
    description: "Step-by-step full-stack learning tracks",
    href: "/",
    icon: BookOpen,
    badge: "Interactive",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    title: "Syntax Cheatsheets",
    description: "Instant syntax & API reference sheets",
    href: "/cheatsheets",
    icon: FileCode,
    badge: "Reference",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Revision Flashcards",
    description: "Active recall deck for quick interviews",
    href: "/revision",
    icon: Layers,
    badge: "Flashcards",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    title: "Practice Quiz",
    description: "Test your coding knowledge & retain more",
    href: "/quiz",
    icon: HelpCircle,
    badge: "Quiz",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const isNavVisible = useScrollNavVisible();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isInitialized } = useAppSelector(
    (s) => s.auth,
  );
  const [signout] = useSignoutMutation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [authTab, setAuthTab] = useState("signin");

  const isHomeActive = pathname === "/";
  const profilePath = user?.username ? `/@${user.username}` : null;
  const isProfileActive = profilePath ? pathname.startsWith(profilePath) : false;

  const handleLogout = async () => {
    try {
      await signout().unwrap();
      dispatch(clearCredentials());
      toast.success("Signed out successfully");
      setIsLogoutConfirmOpen(false);
      setIsMenuOpen(false);
    } catch {
      dispatch(clearCredentials());
      setIsLogoutConfirmOpen(false);
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      {/* Floating Bottom Tab Bar for Mobile */}
      <nav
        className={`fixed left-1/2 -translate-x-1/2 z-50 md:hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl px-3 py-1.5 rounded-full shadow-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-1.5 sm:gap-2 transition-[bottom,opacity] duration-300 ease-in-out ${
          isNavVisible
            ? "bottom-4 opacity-100"
            : "bottom-[-5rem] opacity-0 pointer-events-none"
        }`}
      >
        {/* Home Tab */}
        <Link
          href="/"
          onClick={() => setIsMenuOpen(false)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all duration-300 ${
            isHomeActive && !isMenuOpen
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105"
              : "text-zinc-500 dark:text-zinc-400 hover:text-foreground active:scale-95"
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-xs font-bold tracking-tight">Home</span>
        </Link>

        {/* Profile Tab */}
        <Link
          href={profilePath || "/"}
          onClick={(e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              setAuthTab("signin");
              setIsAuthOpen(true);
            } else {
              setIsMenuOpen(false);
            }
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all duration-300 ${
            isProfileActive && !isMenuOpen
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
                  alt={user.fullName || "User"}
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

        {/* Divider */}
        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

        {/* Menu Expansion Tab Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all duration-300 cursor-pointer ${
            isMenuOpen
              ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md scale-105"
              : "text-zinc-500 dark:text-zinc-400 hover:text-foreground active:scale-95"
          }`}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
          <span className="text-xs font-bold tracking-tight">Menu</span>
        </button>
      </nav>

      {/* Refined Bottom Tab Bar Expansion Sheet */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-100 md:hidden flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
            />

            {/* Bottom Expansion Container */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-h-[85vh] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-t-[2.5rem] border-t border-zinc-200/90 dark:border-zinc-800/90 shadow-2xl flex flex-col overflow-hidden pb-8"
            >
              {/* Drag Pill Handle */}
              <div className="pt-3 pb-1 flex justify-center cursor-pointer" onClick={() => setIsMenuOpen(false)}>
                <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors" />
              </div>

              {/* Sheet Header */}
              <div className="px-6 py-3 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/70">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.png"
                    alt="asif.to"
                    className="w-8 h-8 rounded-xl object-contain shadow-sm"
                  />
                  <div className="flex flex-col">
                    <span className="font-outfit font-black text-base tracking-tight text-zinc-900 dark:text-white leading-none">
                      asif<span className="text-blue-600 dark:text-blue-400">.to</span>
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 mt-0.5">
                      Explore & Learn
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Navigation Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-none">
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 px-1 block">
                    Learning Sections
                  </span>

                  <div className="grid grid-cols-1 gap-2.5">
                    {MENU_SECTIONS.map((section, idx) => {
                      const Icon = section.icon;
                      const isActive =
                        pathname === section.href ||
                        (section.href !== "/" && pathname.startsWith(section.href));

                      return (
                        <motion.div
                          key={section.href}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                        >
                          <Link
                            href={section.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all active:scale-[0.98] ${
                              isActive
                                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                                : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/80 border-zinc-100 dark:border-zinc-800/60 text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`p-2 rounded-xl shrink-0 transition-colors ${
                                  isActive
                                    ? "bg-white/20 text-white"
                                    : section.color
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex flex-col">
                                <span className="text-xs font-bold tracking-tight truncate">
                                  {section.title}
                                </span>
                                <span
                                  className={`text-[11px] truncate ${
                                    isActive
                                      ? "text-blue-100 font-normal"
                                      : "text-zinc-500 dark:text-zinc-400"
                                  }`}
                                >
                                  {section.description}
                                </span>
                              </div>
                            </div>
                            <ChevronRight
                              className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 ${
                                isActive ? "text-white" : "text-zinc-400"
                              }`}
                            />
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Interactive Tip Banner */}
                <div className="p-3.5 rounded-2xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Interactive Full-Stack Tutorials</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed font-medium">
                    Practice code challenges, mark chapters done, and earn verified skill certificates.
                  </p>
                </div>
              </div>

              {/* User Profile & Authentication Footer */}
              <div className="px-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/70">
                {!isInitialized ? (
                  <div className="w-full h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                ) : !isAuthenticated ? (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setAuthTab("signin");
                      setIsAuthOpen(true);
                    }}
                    className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
                  >
                    Sign In / Create Account
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
                    <Link
                      href={user?.username ? `/@${user.username}` : "/"}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 overflow-hidden min-w-0"
                    >
                      <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                        {user?.avatar ? (
                          <Image
                            src={getImageUrl(user.avatar)}
                            alt={user?.fullName || "User"}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          user?.fullName?.[0]?.toUpperCase() || "U"
                        )}
                      </div>
                      <div className="flex flex-col truncate min-w-0">
                        <span className="text-xs font-bold text-foreground truncate">
                          {user?.fullName}
                        </span>
                        <span className="text-[10px] text-zinc-400 truncate">
                          @{user?.username}
                        </span>
                      </div>
                    </Link>

                    <button
                      onClick={() => setIsLogoutConfirmOpen(true)}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 shrink-0"
                      title="Sign Out"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <LogoutConfirm
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onOpenChange={setIsAuthOpen}
        defaultTab={authTab}
      />
    </>
  );
}
