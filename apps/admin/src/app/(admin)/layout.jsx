"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import LogoLoader from "@/components/ui/LogoLoader";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileEdit,
  BookOpen,
  Users,
  Hash,
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
  ScrollText,
  Image,
  Share2,
  Files,
  Megaphone,
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
import NotificationCenter from "@/components/navigation/NotificationCenter";
import MessageHeaderButton from "@/components/navigation/MessageHeaderButton";
import QuickPlannerAdd from "@/components/navigation/QuickPlannerAdd";
import NotesQuickAccess from "@/components/navigation/NotesQuickAccess";
import { MessagingProvider } from "@/contexts/MessagingContext";
import { FloatingChatDock } from "@/components/messaging";
import { ModuleHistoryTracker } from "@/hooks/useModuleHistory";

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
        name: "Activity",
        href: "/activity",
        icon: ScrollText,
        permission: "users.view",
        description: "Platform change history",
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
      {
        name: "Social Media",
        href: "/social-posts",
        icon: Image,
        permission: "articles.create",
        description: "Create, publish & connect accounts",
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
        permission: "messages.view",
        description: "Direct & team conversations",
      },
    ],
  },
  {
    group: "System Pages",
    items: [
      {
        name: "Announcements",
        href: "/announcements",
        icon: Megaphone,
        permission: "settings.manage",
        description: "Site notices & maintenance",
      },
      {
        name: "Files",
        href: "/files",
        icon: Files,
        permission: "assets.view",
        description: "Reusable files, usage & orphans",
      },
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
    setIsNavVisible(true);
    lastScrollY.current = 0;
  }, [pathname]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = (event) => {
      const target = event?.target;

      // Ignore scroll events originating from inside dialogs, modals, floating docks, or the menu island
      if (
        target &&
        target !== document &&
        target !== window &&
        target !== mainRef.current
      ) {
        if (
          target.closest?.(
            "[data-scroll-ignore], [role='dialog'], nav, .scrollbar-none, aside, header, [id*='dock'], [id*='island']",
          ) ||
          (mainRef.current && !mainRef.current.contains(target))
        ) {
          return;
        }
      }

      if (!ticking) {
        window.requestAnimationFrame(() => {
          let currentScroll = 0;

          if (mainRef.current && mainRef.current.scrollTop > 0) {
            currentScroll = mainRef.current.scrollTop;
          } else {
            currentScroll =
              window.scrollY || document.documentElement.scrollTop || 0;
          }

          const delta = currentScroll - lastScrollY.current;

          // When at top of page, always show header & navbar
          if (currentScroll <= 20) {
            setIsNavVisible(true);
          } else if (delta > 8) {
            // Scrolling down on page -> Hide both top header and bottom tab bar
            setIsNavVisible(false);
          } else if (delta < -8) {
            // Scrolling up on page -> Reveal both top header and bottom tab bar
            setIsNavVisible(true);
          }

          lastScrollY.current = Math.max(0, currentScroll);
          ticking = false;
        });
        ticking = true;
      }
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
          <LogoLoader className="h-12 w-12" />
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
  const isMessagesRoute = pathname?.startsWith("/messages");
  const isFilesRoute = pathname?.startsWith("/files");
  const isFullAppRoute = isMessagesRoute || isFilesRoute;

  const headerDisplayClass = isMessagesRoute
    ? "hidden"
    : isFilesRoute
    ? "hidden md:flex"
    : "flex";

  const mainPaddingClass = isMessagesRoute
    ? "pt-0 pb-0 flex flex-col h-full overflow-hidden"
    : isFilesRoute
    ? "pt-0 md:pt-16 pb-0 flex flex-col h-full overflow-hidden"
    : "pt-16 pb-24 lg:pb-8";

  return (
    <MessagingProvider>
      <ModuleHistoryTracker />
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
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Global Minimal Header - Absolute over content for zero layout shift during scroll */}
          <header
            className={`absolute top-0 left-0 right-0 z-40 h-16 shrink-0 items-center justify-between bg-zinc-100 backdrop-blur-xl dark:bg-[#09090b]/85 dark:backdrop-blur-xl px-4 transition-all duration-300 ease-out sm:px-6 md:px-8 lg:px-10 ${headerDisplayClass} ${
              isNavVisible
                ? "translate-y-0 opacity-100"
                : "-translate-y-full opacity-0 pointer-events-none"
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
                  className="w-7 h-7 rounded-xl object-contain shrink-0"
                />
                <span className="font-outfit font-black text-sm tracking-tight text-zinc-950 dark:text-white leading-none">
                  asif
                  <span className="text-blue-600 dark:text-blue-400">.to</span>
                </span>
              </Link>

              <div className="hidden sm:block">
                <AdminGlobalSearch />
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
              {hasPermission(user, "planner.view") && <QuickPlannerAdd />}

              <NotesQuickAccess />

              {/* Utility Icon Actions - Hidden on smaller devices */}
              <div className="hidden sm:block">
                <MessageHeaderButton />
              </div>
              <div className="hidden sm:block">
                <NotificationCenter />
              </div>

              {/* Subtle Divider */}
              {hasPermission(user, "articles.create") &&
                pathname !== "/articles/new" &&
                !pathname.startsWith("/articles/edit/") && (
                  <div className="hidden h-5 w-px bg-zinc-200 dark:bg-zinc-800 lg:block mx-0.5" />
                )}

              <HeaderAccount
                user={user}
                avatarUrl={avatarUrl}
                setIsLogoutDialogOpen={setIsLogoutDialogOpen}
              />
            </div>
          </header>

          {/* Content Viewport with constant top and bottom padding */}
          <main
            ref={mainRef}
            className={`min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain scrollbar-none bg-[#f3f4f6] dark:bg-[#09090b] ${mainPaddingClass}`}
          >
            {canViewPage ? (
              children
            ) : (
              <AccessDenied permission={requiredPermission} />
            )}
          </main>

          {/* Floating LinkedIn/Instagram-style Docked Messaging Drawer */}
          <FloatingChatDock isNavVisible={isNavVisible} />
        </div>

        {/* Mobile Bottom Navbar */}
        <MobileBottomNavbar
          navItems={visibleNavItems}
          user={user}
          isVisible={isNavVisible && !isFullAppRoute}
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
    </MessagingProvider>
  );
}
