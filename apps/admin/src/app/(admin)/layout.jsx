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
  LogOut,
  Info,
  GraduationCap,
  FileCode,
  Clipboard,
  FolderTree,
  MessageSquare,
  KanbanSquare,
  ChartNoAxesCombined,
  SearchCheck,
  Code2,
} from "lucide-react";
import AdminGlobalSearch from "@/components/search/AdminGlobalSearch";
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
import AccessDenied from "@/components/auth/AccessDenied";
import {
  canAccessPath,
  hasPermission,
  permissionForPath,
} from "@/lib/permissions";

import {
  Sidebar,
  MobileBottomNavbar,
  HeaderAccount,
} from "@/components/navigation";

const NAV_ITEMS = [
  {
    group: "Overview",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Metrics & activity overview",
      },
      {
        name: "Planner",
        href: "/planner",
        icon: KanbanSquare,
        permission: "planner.view",
        description: "Kanban boards & tasks",
      },
      {
        name: "Analytics",
        href: "/analytics",
        icon: ChartNoAxesCombined,
        permission: "analytics.view",
        description: "GA4, Search & insights",
      },
    ],
  },
  {
    group: "Content",
    items: [
      {
        name: "All Articles",
        href: "/articles/published",
        icon: BookOpen,
        permission: "articles.create",
        description: "Manage & publish articles",
      },
      {
        name: "Topics",
        href: "/topics",
        icon: Hash,
        permission: "topics.view",
        description: "Curriculum topics & order",
      },
      {
        name: "Interview Questions",
        href: "/interview-questions",
        icon: MessageSquare,
        permission: "interview_questions.view",
        description: "Q&A bank & solutions",
      },
      {
        name: "Courses",
        href: "/courses",
        icon: GraduationCap,
        permission: "courses.view",
        description: "Courses, chapters & lessons",
      },
      {
        name: "Categories",
        href: "/categories",
        icon: FolderTree,
        permission: "topics.view",
        description: "Taxonomy & hierarchy",
      },
    ],
  },
  {
    group: "Courses & Learning",
    items: [
      {
        name: "Cheatsheets",
        href: "/cheatsheets",
        icon: FileCode,
        permission: "cheatsheets.view",
        description: "Developer quick sheets",
      },
      {
        name: "Question Bank",
        href: "/quiz",
        icon: Clipboard,
        permission: "question_bank.view",
        description: "Quizzes & assessments",
      },
    ],
  },
  {
    group: "Management",
    items: [
      {
        name: "Users",
        href: "/users",
        icon: Users,
        permission: "users.view",
        description: "Accounts, roles & invites",
      },
      {
        name: "Messages",
        href: "/messages",
        icon: MessageSquare,
        permission: "users.edit",
        description: "User inbox & inquiries",
      },
    ],
  },
  {
    group: "System Pages",
    items: [
      {
        name: "SEO Settings",
        href: "/seo-settings",
        icon: SearchCheck,
        permission: "seo.view",
        description: "Meta tags & indexing",
      },
      {
        name: "Code Playground",
        href: "/playground-settings",
        icon: Code2,
        permission: "playground.manage",
        description: "Editor, languages & runtimes",
      },
      {
        name: "Legal & Help",
        href: "/legal",
        icon: Info,
        permission: "settings.manage",
        description: "Policies & documentation",
      },
    ],
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

  const avatarUrl =
    user?.avatar && !user.avatar.includes("ui-avatars.com")
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `${STORAGE_URL}${user.avatar}`
      : null;
  const visibleNavItems = NAV_ITEMS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        hasPermission(user, item.permission) && canAccessPath(user, item.href),
    ),
  })).filter((group) => group.items.length > 0);
  const requiredPermission = permissionForPath(pathname);
  const canViewPage = hasPermission(user, requiredPermission);

  return (
    <div className="flex h-dvh w-full max-w-full overflow-hidden bg-white font-sans text-zinc-900 transition-colors duration-300 dark:bg-[#09090b] dark:text-zinc-200">
      {/* Desktop Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        pathname={pathname}
        user={user}
        avatarUrl={avatarUrl}
        navItems={visibleNavItems}
        setIsLogoutDialogOpen={setIsLogoutDialogOpen}
      />

      {/* Main Panel */}
      <div
        className={`relative flex min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isNavVisible ? "pb-16 lg:pb-0" : "pb-0 lg:pb-0"
        }`}
      >
        {/* Global Minimal Header - Transparent & Seamless */}
        <header
          className={`z-40 flex h-16 shrink-0 items-center justify-between bg-white/20 backdrop-blur-md dark:bg-zinc-900/30 dark:backdrop-blur-md px-4 transition-all duration-200 ease-out sm:px-6 md:px-8 lg:px-10 ${
            isNavVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 pointer-events-none -mb-16"
          }`}
        >
          <div className="flex items-center gap-2 md:gap-6">
            {/* Logo in top header for mobile since sidebar is hidden */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 lg:hidden"
            >
              <img
                src="/logo.png"
                alt="asif.to logo"
                className="w-7 h-7 rounded-xl object-contain shadow-xs shrink-0"
              />
              <span className="font-outfit font-black text-sm tracking-tight text-zinc-950 dark:text-white leading-none">
                asif
                <span className="text-blue-600 dark:text-blue-400">.to</span>
              </span>
            </Link>

            <AdminGlobalSearch />
          </div>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3 md:gap-2">
            <div className="hidden items-center h-10 gap-2 rounded-full border border-zinc-200/80 bg-zinc-50/80 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-colors dark:border-zinc-800/80 dark:bg-zinc-900/60 sm:flex">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">Active</span>
            </div>
            <button className="relative hidden h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white xs:flex md:h-10 md:w-10">
              <Bell size={17} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white dark:border-[#121215]"></span>
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
          className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-[#f3f4f6] dark:bg-[#09090b]"
        >
          {canViewPage ? (
            children
          ) : (
            <AccessDenied permission={requiredPermission} />
          )}
        </main>

        {hasPermission(user, "articles.create") &&
          pathname !== "/articles/new" &&
          !pathname.startsWith("/articles/edit/") && (
            <Link
              href="/articles/new"
              aria-label="Write a new article"
              className={`fixed right-4 lg:right-8 z-40 inline-flex h-12 w-12 items-center justify-center gap-2 rounded-full bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:translate-y-0 sm:h-13 sm:w-auto sm:px-6 ${
                isNavVisible
                  ? "bottom-20 lg:bottom-8 translate-y-0"
                  : "bottom-4 lg:bottom-8 translate-y-0"
              }`}
            >
              <FileEdit className="h-4.5 w-4.5" />
              <span className="hidden sm:inline">Write article</span>
            </Link>
          )}
      </div>

      {/* Mobile Bottom Navbar */}
      <MobileBottomNavbar
        navItems={visibleNavItems}
        user={user}
        isVisible={isNavVisible}
      />

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="max-w-100 border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#121215] p-8 rounded-[28px] sm:rounded-4xl gap-7 shadow-2xl">
          <DialogHeader className="gap-4 items-center sm:items-start text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-1">
              <LogOut size={26} />
            </div>
            <DialogTitle className="text-2xl font-black font-outfit uppercase tracking-tight text-zinc-950 dark:text-white leading-none">
              Log Out?
            </DialogTitle>
            <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-xs font-medium leading-relaxed">
              Are you sure you want to log out of asif.to Admin Panel?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              variant="outline"
              onClick={() => setIsLogoutDialogOpen(false)}
              className="flex-1 rounded-full text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-all h-11 border-zinc-200/80 dark:border-zinc-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsLogoutDialogOpen(false);
                logout();
              }}
              className="flex-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all h-11 shadow-sm shadow-rose-600/20"
            >
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
