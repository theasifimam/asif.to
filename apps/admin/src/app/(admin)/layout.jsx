"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileEdit,
  BookOpen,
  Users,
  Hash,
  Bell,
  Search,
  LogOut,
  Info,
  GraduationCap,
  FileCode,
  Clipboard,
  FolderTree,
  X,
  MessageSquare,
  KanbanSquare,
  ChartNoAxesCombined,
} from "lucide-react";
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

import {
  Sidebar,
  MobileBottomNavbar,
  HeaderAccount,
} from "@/components/navigation";

const NAV_ITEMS = [
  {
    group: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Planner", href: "/planner", icon: KanbanSquare },
      { name: "Analytics", href: "/analytics", icon: ChartNoAxesCombined },
    ],
  },
  {
    group: "Courses & Learning",
    items: [
      { name: "Cheatsheets", href: "/cheatsheets", icon: FileCode },
      { name: "Question Bank", href: "/quiz", icon: Clipboard },
    ],
  },
  {
    group: "Content",
    items: [
      { name: "Courses", href: "/courses", icon: GraduationCap },
      { name: "Topics", href: "/topics", icon: Hash },
      {
        name: "Interview Questions",
        href: "/interview-questions",
        icon: MessageSquare,
      },
      { name: "Categories", href: "/categories", icon: FolderTree },
      { name: "All Articles", href: "/articles/published", icon: BookOpen },
    ],
  },
  {
    group: "Management",
    items: [
      { name: "Users", href: "/users", icon: Users },
      { name: "Messages", href: "/messages", icon: MessageSquare },
    ],
  },
  {
    group: "System Pages",
    items: [{ name: "Legal & Help", href: "/legal", icon: Info }],
  },
];

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL;

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = React.useRef(0);
  const mainRef = React.useRef(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && pathname !== "/signin") {
      router.push("/signin");
    }
  }, [user, loading, pathname, router]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = mainRef.current
        ? mainRef.current.scrollTop
        : window.scrollY || document.documentElement.scrollTop || 0;
      const delta = currentScroll - lastScrollY.current;

      if (currentScroll <= 15) {
        setIsNavVisible(true);
      } else if (delta > 6) {
        setIsNavVisible(false);
      } else if (delta < -6) {
        setIsNavVisible(true);
      }

      lastScrollY.current = currentScroll;
    };

    const mainEl = mainRef.current;
    if (mainEl) {
      mainEl.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      if (mainEl) mainEl.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
    <div className="flex h-dvh w-full max-w-full overflow-hidden bg-zinc-50 font-sans text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-200">
      {/* Desktop Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        pathname={pathname}
        user={user}
        avatarUrl={avatarUrl}
        navItems={NAV_ITEMS}
        setIsLogoutDialogOpen={setIsLogoutDialogOpen}
      />

      {/* Main Panel */}
      <div
        className={`relative flex min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isNavVisible ? "pb-16 lg:pb-0" : "pb-0 lg:pb-0"
        }`}
      >
        {/* Global Masthead */}
        <header
          className={`z-40 flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white/90 px-3 backdrop-blur-xl transition-all duration-300 ease-in-out dark:border-zinc-900 dark:bg-zinc-950/90 sm:px-4 md:px-12 ${
            isNavVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 pointer-events-none -mb-16"
          }`}
        >
          <div className="flex items-center gap-4 md:gap-8">
            {/* Logo in top header for mobile since sidebar is hidden */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 lg:hidden"
            >
              <img
                src="/logo.png"
                alt="asif.to logo"
                className="w-7 h-7 rounded-lg object-contain shadow-sm shrink-0"
              />
              <span className="font-outfit font-black text-sm tracking-tight text-zinc-900 dark:text-white leading-none">
                asif
                <span className="text-blue-600 dark:text-blue-400">.to</span>
              </span>
            </Link>

            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-500 group cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors">
              <Search size={18} />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] border-b border-transparent group-hover:border-zinc-400 dark:group-hover:border-zinc-500 pb-0.5 hidden md:inline">
                Search...
              </span>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3 md:gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900/50 px-3 md:px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">System Active</span>
            </div>
            <button className="relative hidden h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 xs:flex md:h-10 md:w-10">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-zinc-950"></span>
            </button>

            <HeaderAccount
              user={user}
              avatarUrl={avatarUrl}
              setIsLogoutDialogOpen={setIsLogoutDialogOpen}
            />
          </div>
        </header>

        {/* Content Viewport */}
        <main
          ref={mainRef}
          className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.03),transparent)] dark:bg-[radial-gradient(circle_at_top_right,rgba(24,24,27,0.3),transparent)]"
        >
          {children}
        </main>

        <Link
          href="/articles/new"
          aria-label="Write a new article"
          className={`fixed right-4 lg:right-7 z-40 inline-flex h-12 w-12 items-center justify-center gap-2 rounded-full bg-blue-600 text-sm font-bold text-white shadow-xl shadow-blue-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:translate-y-0 sm:h-14 sm:w-auto sm:px-6 ${
            isNavVisible
              ? "bottom-20 lg:bottom-7 translate-y-0"
              : "bottom-4 lg:bottom-7 translate-y-0"
          }`}
        >
          <FileEdit className="h-5 w-5" />
          <span className="hidden sm:inline">Write article</span>
        </Link>
      </div>

      {/* Mobile Bottom Navbar */}
      <MobileBottomNavbar
        navItems={NAV_ITEMS}
        user={user}
        isVisible={isNavVisible}
      />

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
              className="flex-1 rounded-full text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all h-12"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsLogoutDialogOpen(false);
                logout();
              }}
              className="flex-1 rounded-full bg-red-500 hover:bg-red-600 text-white text-[11px] font-black uppercase tracking-widest transition-all h-12 shadow-lg shadow-red-500/20"
            >
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
