"use client";

import { useState } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { clearCredentials } from "@/lib/store/authSlice";
import { useSignoutMutation } from "@/lib/api/authApi";
import { signOut as oauthSignOut } from "next-auth/react";
import { getImageUrl } from "@/lib/config";
import { useScrollNavVisible } from "@/components/layout/ScrollNavProvider";
import { ThemeToggle } from "../ui/ThemeToggle";
import AuthModal from "@/components/auth/AuthModal";
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
  const profilePath = user?.username ? `/${user.username}` : null;
  const isProfileActive = profilePath
    ? pathname.startsWith(profilePath)
    : false;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/backend-session", { method: "DELETE" }).catch(
        () => {},
      );
      await signout().unwrap();
      await oauthSignOut({ redirect: false }).catch(() => {});
    } catch {
      /* ignore */
    } finally {
      dispatch(clearCredentials());
      setIsLogoutConfirmOpen(false);
      setIsMenuOpen(false);
      toast.success("Signed out successfully");
      window.location.reload();
    }
  };

  return (
    <>
      {/* Floating Bottom Tab Bar for Mobile - Always visible & elevated above backdrop */}
      <nav
        className={`fixed left-1/2 -translate-x-1/2 z-110 md:hidden max-w-[calc(100vw-1.5rem)] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl p-1.5 rounded-full shadow-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-center gap-1 transition-[bottom,opacity] duration-300 ease-in-out ${
          isNavVisible
            ? "bottom-4 opacity-100"
            : "-bottom-20 opacity-0 pointer-events-none"
        }`}
      >
        {/* Home Tab */}
        <Link
          href="/"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Home"
          className={`flex items-center gap-1.5 rounded-full transition-all duration-300 ${
            isHomeActive && !isMenuOpen
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 px-3.5 py-2 scale-105"
              : "p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/60 active:scale-95"
          }`}
        >
          <Home className="w-4 h-4 shrink-0" />
          {isHomeActive && !isMenuOpen && (
            <span className="text-xs font-bold tracking-tight whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
              Home
            </span>
          )}
        </Link>

        {/* Library Tab */}
        <Link
          href="/library"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Library"
          className={`flex items-center gap-1.5 rounded-full transition-all duration-300 ${
            pathname.startsWith("/library") && !isMenuOpen
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 px-3.5 py-2 scale-105"
              : "p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/60 active:scale-95"
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          {pathname.startsWith("/library") && !isMenuOpen && (
            <span className="text-xs font-bold tracking-tight whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
              Library
            </span>
          )}
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
          aria-label="Profile"
          className={`flex items-center gap-1.5 rounded-full transition-all duration-300 ${
            isProfileActive && !isMenuOpen
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 px-3.5 py-2 scale-105"
              : "p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/60 active:scale-95"
          }`}
        >
          {!isInitialized ? (
            <div className="w-4 h-4 rounded-full bg-zinc-300 dark:bg-zinc-700 animate-pulse shrink-0" />
          ) : isAuthenticated && user ? (
            <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 border border-white/40">
              {user.avatar && !user.avatar.includes("ui-avatars.com") ? (
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
            <User className="w-4 h-4 shrink-0" />
          )}
          {isProfileActive && !isMenuOpen && (
            <span className="text-xs font-bold tracking-tight whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
              Profile
            </span>
          )}
        </Link>

        {/* Divider */}
        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-0.5 shrink-0" />

        {/* Menu Expansion Tab Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          className={`flex items-center gap-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            isMenuOpen
              ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md px-3.5 py-2 scale-105"
              : "p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/60 active:scale-95"
          }`}
        >
          {isMenuOpen ? (
            <X className="w-4 h-4 shrink-0" />
          ) : (
            <Menu className="w-4 h-4 shrink-0" />
          )}
          {isMenuOpen && (
            <span className="text-xs font-bold tracking-tight whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
              Close
            </span>
          )}
        </button>
      </nav>

      {/* Floating Island Mobile Navigation Menu Sheet */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-100 md:hidden flex flex-col justify-end pointer-events-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm pointer-events-auto"
            />

            {/* Floating Island Container - situated directly above the bottom tab bar */}
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.7 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 70 || info.velocity.y > 200) {
                  setIsMenuOpen(false);
                }
              }}
              initial={{ y: "110%", opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "110%", opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative mx-3 mb-20 max-h-[76vh] bg-white/95 dark:bg-[#121215]/95 backdrop-blur-2xl rounded-[28px] sm:rounded-4xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl flex flex-col overflow-hidden pointer-events-auto touch-pan-y z-105"
            >
              {/* Drag Pill Handle */}
              <div
                className="pt-2.5 pb-1 flex justify-center cursor-grab active:cursor-grabbing shrink-0"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors" />
              </div>

              {/* Sheet Header */}
              <div className="px-5 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/logo.png"
                    alt="asif.to"
                    className="w-7 h-7 rounded-xl object-contain shrink-0"
                  />
                  <div className="flex items-center gap-2">
                    <span className="font-outfit font-black text-base tracking-tight text-zinc-950 dark:text-white leading-none">
                      asif
                      <span className="text-blue-600 dark:text-blue-400">
                        .to
                      </span>
                    </span>
                    <span className="rounded-full border border-zinc-200/80 bg-zinc-50/80 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                      Menu
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <ThemeToggle />
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="h-10 w-10 rounded-full border border-zinc-200/80 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Navigation Body */}
              <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 scrollbar-none">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 px-1 block">
                    Learning Tracks
                  </span>

                  <div className="grid grid-cols-1 gap-2">
                    {MENU_SECTIONS.map((section, idx) => {
                      const Icon = section.icon;
                      const isActive =
                        pathname === section.href ||
                        (section.href !== "/" &&
                          pathname.startsWith(section.href));

                      return (
                        <motion.div
                          key={section.href}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                        >
                          <Link
                            href={section.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`group flex items-center justify-between p-3 rounded-3xl transition-all active:scale-[0.98] ${
                              isActive
                                ? "bg-blue-600 text-white font-bold shadow-xs"
                                : " hover:bg-zinc-100  dark:hover:bg-zinc-800/80  text-zinc-900 dark:text-zinc-100"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`h-8.5 w-8.5 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                  isActive
                                    ? "text-white"
                                    : "text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white"
                                }`}
                              >
                                <Icon className="w-4.5 h-4.5" />
                              </div>
                              <div className="min-w-0 flex flex-col leading-tight">
                                <span
                                  className={`text-xs font-bold tracking-tight truncate font-outfit ${
                                    isActive
                                      ? "text-white"
                                      : "text-zinc-950 dark:text-white"
                                  }`}
                                >
                                  {section.title}
                                </span>
                                <span
                                  className={`text-[10px] truncate mt-0.5 ${
                                    isActive
                                      ? "text-blue-100/80 font-medium"
                                      : "text-zinc-400 dark:text-zinc-500 font-normal"
                                  }`}
                                >
                                  {section.description}
                                </span>
                              </div>
                            </div>
                            <ChevronRight
                              className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                                isActive ? "text-white" : "text-zinc-400"
                              }`}
                            />
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Learning Badge */}
                {/* <div className="p-3 rounded-4xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Interactive Full-Stack Platform</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed font-medium">
                    Practice code challenges, mark chapters done, and track your
                    development streak.
                  </p>
                </div>*/}
              </div>

              {/* User Profile & Bottom-Left Close Action Footer */}
              <div className="p-3.5 pt-2.5 border-zinc-100 dark:border-zinc-800/80 shrink-0">
                <div className="flex items-center gap-2">
                  {/* Dedicated Bottom-Left Close Button */}
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="h-11 w-11 rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
                    aria-label="Close menu"
                    title="Close"
                  >
                    <X size={17} />
                  </button>

                  {!isInitialized ? (
                    <div className="flex-1 h-11 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                  ) : !isAuthenticated ? (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setAuthTab("signin");
                        setIsAuthOpen(true);
                      }}
                      className="flex-1 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    >
                      Sign In / Create Account
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center justify-between p-2 rounded-full bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 min-w-0">
                      <Link
                        href={user?.username ? `/${user.username}` : "/"}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 overflow-hidden min-w-0"
                      >
                        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                          {user?.avatar &&
                          !user.avatar.includes("ui-avatars.com") ? (
                            <Image
                              src={getImageUrl(user.avatar)}
                              alt={user?.fullName || "User"}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <span className="w-full h-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-black flex items-center justify-center text-xs uppercase">
                              {user?.fullName?.[0]?.toUpperCase() || "U"}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col truncate min-w-0 leading-tight">
                          <span className="text-xs font-bold text-zinc-950 dark:text-white truncate font-outfit">
                            {user?.fullName}
                          </span>
                          <span className="text-[10px] text-zinc-400 truncate">
                            @{user?.username}
                          </span>
                        </div>
                      </Link>

                      <button
                        onClick={() => setIsLogoutConfirmOpen(true)}
                        className="h-8 w-8 rounded-full border border-zinc-200/80 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-400 hover:text-rose-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                        title="Sign Out"
                      >
                        <LogOut size={14} />
                      </button>
                    </div>
                  )}
                </div>
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
