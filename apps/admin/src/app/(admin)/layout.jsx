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
    items: [{ name: "Users", href: "/users", icon: Users }],
  },
  {
    group: "System Pages",
    items: [
      { name: "About", href: "/legal/about", icon: Info },
      {
        name: "Terms of Service",
        href: "/legal/terms-conditions",
        icon: ShieldAlert,
      },
      { name: "Privacy Policy", href: "/legal/privacy-policy", icon: FileText },
      { name: "Cookie Policy", href: "/legal/cookie-usage", icon: Cookie },
      { name: "Help & FAQ", href: "/legal/faq", icon: HelpCircle },
    ],
  },
];

const STORAGE_URL =
  process.env.NEXT_PUBLIC_STORAGE_URL;

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
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-800 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
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
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200 overflow-hidden font-sans transition-colors duration-300">
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
        className={`border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-950/95 backdrop-blur-xl shrink-0 fixed lg:relative h-full transition-colors duration-300 ${isMobileMenuOpen ? "z-10 shadow-2xl shadow-black/50" : "z-30"}`}
      >
        {/* Toggle Button (Desktop) */}
        <div
          className={`absolute top-8 z-10 hidden lg:flex transition-all duration-300 ${isCollapsed ? "right-0 translate-x-1/2 top-12" : "right-4"}`}
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
          className={`p-6 pb-8 flex flex-col gap-2 ${isCollapsed ? "items-center px-0" : ""}`}
        >
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-500/30 shrink-0">
              &lt;/&gt;
            </span>
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <span className="font-outfit font-black text-xl tracking-tight text-zinc-900 dark:text-white">
                  asif
                  <span className="text-blue-600 dark:text-blue-400">.to</span>
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                  Admin
                </span>
              </div>
            )}
          </Link>
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
                  const targetHref =
                    item.name === "My Profile" && user?._id
                      ? `/users/${user._id}`
                      : item.href;
                  const isActive =
                    pathname === targetHref || pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={targetHref}
                      title={isCollapsed ? item.name : ""}
                      className={`group flex items-center px-4 py-3 rounded-2xl transition-all duration-300 ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-600"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
                      } ${isCollapsed ? "justify-center" : "justify-between"}`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          size={18}
                          strokeWidth={isActive ? 2.5 : 2}
                          className={
                            isActive
                              ? "text-white"
                              : "text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-200"
                          }
                        />
                        {!isCollapsed && (
                          <span
                            className={`text-[13px] font-bold tracking-tight ${isActive ? "font-extrabold" : ""} truncate`}
                          >
                            {item.name}
                          </span>
                        )}
                      </div>
                      {!isCollapsed && isActive && (
                        <motion.div
                          layoutId="active"
                          className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
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
          className={`p-4 mt-auto border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300 relative ${isCollapsed ? "flex justify-center" : ""}`}
        >
          {/* User Account Popover Menu at sidebar position */}
          <AnimatePresence>
            {isUserMenuDialogOpen && (
              <>
                {/* Backdrop to dismiss when clicking outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuDialogOpen(false)}
                />

                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`absolute bottom-full mb-3 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-2xl shadow-black/10 dark:shadow-black/60 flex flex-col gap-3 ${
                    isCollapsed ? "left-2 w-64" : "left-4 right-4"
                  }`}
                >
                  {/* User Info Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <Avatar className="w-10 h-10 border border-zinc-200 dark:border-zinc-700 shadow-sm shrink-0">
                      <AvatarImage
                        src={avatarUrl || ""}
                        className="object-cover"
                      />
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
                      onClick={() => {
                        setIsUserMenuDialogOpen(false);
                        router.push(
                          user?._id ? `/users/${user._id}` : "/profile",
                        );
                      }}
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all text-zinc-800 dark:text-zinc-200 font-bold text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <User
                          size={16}
                          className="text-blue-600 dark:text-blue-400"
                        />
                        <span>My Profile</span>
                      </div>
                      <ChevronRight size={14} className="text-zinc-400" />
                    </button>

                    <button
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all text-zinc-800 dark:text-zinc-200 font-bold text-xs"
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
                      onClick={() => {
                        setIsUserMenuDialogOpen(false);
                        setIsLogoutDialogOpen(true);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-red-600 dark:text-red-400 font-bold text-xs mt-1"
                    >
                      <div className="flex items-center gap-2.5">
                        <LogOut size={16} />
                        <span>Log Out</span>
                      </div>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsUserMenuDialogOpen(!isUserMenuDialogOpen)}
            className={`w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/60 hover:bg-zinc-200/80 dark:hover:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 transition-all group/user shadow-sm ${
              isCollapsed ? "p-2 justify-center w-auto" : ""
            }`}
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
                className={`text-zinc-400 group-hover/user:text-zinc-900 dark:group-hover/user:text-white transition-transform shrink-0 ${
                  isUserMenuDialogOpen ? "-rotate-90 text-blue-600" : ""
                }`}
              />
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main Panel */}
      <div className="flex-1 z-10 flex flex-col relative overflow-hidden transition-colors duration-300">
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
              href={user?._id ? `/users/${user._id}` : "/profile"}
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
              Are you sure you want to log out of asif.to Admin Panel?
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
