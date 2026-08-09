"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileEdit,
  BookOpen,
  Users,
  User,
  Hash,
  Bell,
  Search,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  Sun,
  Moon,
  FileText,
  ShieldAlert,
  Cookie,
  HelpCircle,
  Info,
  GraduationCap,
  FileCode,
  Layers,
  Clipboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NAV_ITEMS = [
  {
    group: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "My Profile", href: "/profile", icon: User },
    ],
  },
  {
    group: "Courses & Learning",
    items: [
      { name: "All Courses", href: "/courses", icon: GraduationCap },
      { name: "Cheatsheets", href: "/cheatsheets", icon: FileCode },
      { name: "Quiz Builder", href: "/quiz", icon: Clipboard },
      { name: "Flashcards", href: "/flashcards", icon: Layers },
    ],
  },
  {
    group: "Content",
    items: [
      { name: "Article Editor", href: "/articles/new", icon: FileEdit },
      { name: "Drafts", href: "/articles/drafts", icon: BookOpen },
      { name: "All Articles", href: "/articles/published", icon: BookOpen },
      { name: "Topics", href: "/topics", icon: Hash },
    ],
  },
  {
    group: "Management",
    items: [
      { name: "Users", href: "/users", icon: Users },
    ],
  },
  {
    group: "System Pages",
    items: [
      { name: "About", href: "/legal/about", icon: Info },
      { name: "Terms of Service", href: "/legal/terms-conditions", icon: ShieldAlert },
      { name: "Privacy Policy", href: "/legal/privacy-policy", icon: FileText },
      { name: "Cookie Policy", href: "/legal/cookie-usage", icon: Cookie },
      { name: "Help & FAQ", href: "/legal/faq", icon: HelpCircle },
    ],
  },
];

const STORAGE_URL =
  process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:5000";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isUserMenuDialogOpen, setIsUserMenuDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user && pathname !== "/signin") {
      router.push("/signin");
    }
  }, [user, loading, pathname, router]);

  if (loading || !mounted || !user) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-zinc-900 border-t-[#E2FF54] rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 italic">
            Loading Admin Panel...
          </span>
        </div>
      </div>
    );
  }

  const avatarUrl = user?.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `${STORAGE_URL}${user.avatar}`
    : user?.profilePicture?.url;

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-800 dark:text-zinc-400 overflow-hidden font-sans transition-colors duration-300">
      {/* Toggle Overlay for Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 288,
          x: isMobileMenuOpen
            ? 0
            : mounted && window.innerWidth < 1024
              ? -288
              : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-950/95 backdrop-blur-xl shrink-0 fixed lg:relative h-full transition-colors duration-300 ${isMobileMenuOpen ? "z-50 shadow-2xl shadow-black/50" : "z-30"}`}
      >
        {/* Toggle Button (Desktop) */}
        <div
          className={`absolute top-8 z-40 hidden lg:flex transition-all duration-300 ${isCollapsed ? "right-0 translate-x-1/2 top-12" : "right-4"}`}
        >
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white shadow-sm ${isCollapsed ? "scale-110" : ""}`}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <PanelLeftClose size={20} />
            )}
          </button>
        </div>

        <div
          className={`p-8 pb-12 flex flex-col gap-1 ${isCollapsed ? "items-center px-0" : ""}`}
        >
          <Link
            href="/"
            className="font-outfit font-black text-2xl tracking-tighter text-black dark:text-white leading-none"
          >
            {isCollapsed ? "M." : "MAZLIS."}
          </Link>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-[10px] uppercase font-bold tracking-[0.3em] text-zinc-500 dark:text-zinc-600 truncate"
              >
                Admin Panel
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-10 overflow-y-auto no-scrollbar">
          {NAV_ITEMS.map((group) => (
            <div key={group.group} className="flex flex-col gap-4">
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-4 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-700 truncate"
                  >
                    {group.group}
                  </motion.h3>
                )}
              </AnimatePresence>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.name : ""}
                      className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white shadow-sm shadow-black/5 dark:shadow-zinc-950/50 border border-zinc-200 dark:border-zinc-800"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
                      } ${isCollapsed ? "justify-center" : "justify-between"}`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          size={18}
                          strokeWidth={isActive ? 2.5 : 2}
                          className={
                            isActive
                              ? "text-black dark:text-white"
                              : "text-zinc-500 dark:text-zinc-600 group-hover:text-zinc-800 dark:group-hover:text-zinc-400"
                          }
                        />
                        {!isCollapsed && (
                          <span
                            className={`text-[13px] font-bold tracking-tight uppercase ${isActive ? "tracking-wider" : ""} truncate`}
                          >
                            {item.name}
                          </span>
                        )}
                      </div>
                      {!isCollapsed && isActive && (
                        <motion.div
                          layoutId="active"
                          className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] dark:shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div
          className={`p-4 mt-auto border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300 ${isCollapsed ? "flex justify-center" : ""}`}
        >
          <button
            onClick={() => setIsUserMenuDialogOpen(true)}
            className={`w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/60 hover:bg-zinc-200/80 dark:hover:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 transition-all group/user shadow-sm ${isCollapsed ? "p-2 justify-center w-auto" : ""}`}
            title={isCollapsed ? user?.fullName || "Account Options" : ""}
          >
            <div className="flex items-center gap-3 min-w-0">
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
                className="text-zinc-400 group-hover/user:text-zinc-900 dark:group-hover/user:text-white transition-all transform group-hover/user:translate-x-0.5 shrink-0"
              />
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col relative overflow-hidden transition-colors duration-300">
        {/* Global Masthead */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-900 px-4 md:px-12 flex items-center justify-between bg-white/50 dark:bg-zinc-950/20 backdrop-blur-md z-40 transition-colors duration-300">
          <div className="flex items-center gap-4 md:gap-8">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm active:scale-90"
            >
              <LayoutDashboard size={20} />
            </button>

            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-500 group cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors">
              <Search size={18} />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] border-b border-transparent group-hover:border-zinc-400 dark:group-hover:border-zinc-500 pb-0.5 hidden md:inline">
                Search...
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900/50 px-3 md:px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">System Active</span>
            </div>
            <button className="relative w-9 h-9 md:w-10 md:h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all text-zinc-600 dark:text-zinc-400">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-zinc-950"></span>
            </button>

            <Link
              href="/profile"
              className="flex items-center gap-3 pl-3 md:pl-4 border-l border-zinc-200 dark:border-zinc-800 ml-1 md:ml-2 group/header-user cursor-pointer transition-opacity hover:opacity-80"
            >
              <div className="flex-col items-end leading-none hidden xs:flex">
                <span className="text-[11px] font-black text-black dark:text-white uppercase truncate max-w-25 md:max-w-30">
                  {user?.fullName?.split(" ")[0] || "Admin"}
                </span>
                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-widest mt-0.5">
                  {user?.role || "Admin"}
                </span>
              </div>
              <Avatar className="w-9 h-9 md:w-10 md:h-10 border border-zinc-200 dark:border-zinc-800/50 shadow-sm shrink-0 transition-transform group-hover/header-user:scale-105">
                <AvatarImage src={avatarUrl || ""} className="object-cover" />
                <AvatarFallback className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-black uppercase text-xs">
                  {user?.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2) || "AD"}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.03),transparent)] dark:bg-[radial-gradient(circle_at_top_right,rgba(24,24,27,0.3),transparent)]">
          {children}
        </main>
      </div>

      {/* User Account & Settings Dialog */}
      <Dialog
        open={isUserMenuDialogOpen}
        onOpenChange={setIsUserMenuDialogOpen}
      >
        <DialogContent className="max-w-100 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 md:p-8 rounded-4xl gap-6">
          <DialogHeader className="gap-4 text-center items-center">
            <Avatar className="w-20 h-20 border-2 border-zinc-200 dark:border-zinc-800 shadow-md">
              <AvatarImage src={avatarUrl || ""} className="object-cover" />
              <AvatarFallback className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-black uppercase text-base">
                {user?.fullName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2) || "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 items-center">
              <DialogTitle className="text-xl font-black font-outfit uppercase tracking-tight text-zinc-900 dark:text-white">
                {user?.fullName || "Admin User"}
              </DialogTitle>
              <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                {user?.email || "admin@mazlis.com"} &bull;{" "}
                <span className="uppercase text-amber-500 dark:text-amber-400 font-bold">
                  {user?.role || "Admin"}
                </span>
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
            {/* View Profile */}
            <button
              onClick={() => {
                setIsUserMenuDialogOpen(false);
                router.push("/profile");
              }}
              className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900/80 transition-all text-zinc-800 dark:text-zinc-200 group font-bold text-xs uppercase tracking-wider"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                  <User size={18} />
                </div>
                <span>My Profile</span>
              </div>
              <ChevronRight
                size={16}
                className="text-zinc-400 group-hover:translate-x-1 transition-transform"
              />
            </button>

            {/* Toggle Theme */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900/80 transition-all text-zinc-800 dark:text-zinc-200 group font-bold text-xs uppercase tracking-wider"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </div>
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </div>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900">
                {theme === "dark" ? "Dark" : "Light"}
              </span>
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                setIsUserMenuDialogOpen(false);
                setIsLogoutDialogOpen(true);
              }}
              className="flex items-center justify-between p-4 rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-red-600 dark:text-red-400 group font-bold text-xs uppercase tracking-wider mt-2"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-100/50 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                  <LogOut size={18} />
                </div>
                <span>Log Out</span>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="max-w-100 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 rounded-4xl gap-8">
          <DialogHeader className="gap-4">
            <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
              <LogOut size={32} />
            </div>
            <DialogTitle className="text-2xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
              Log Out?
            </DialogTitle>
            <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-[13px] font-medium leading-relaxed">
              Are you sure you want to log out of Mazlis Admin Panel?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
            <Button
              variant="ghost"
              onClick={() => setIsLogoutDialogOpen(false)}
              className="flex-1 rounded-2xl text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all h-12"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsLogoutDialogOpen(false);
                logout();
              }}
              className="flex-1 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-[11px] font-black uppercase tracking-widest transition-all h-12 shadow-lg shadow-red-500/20"
            >
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
