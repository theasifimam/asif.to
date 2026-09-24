"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ThemeToggle } from "../ui/ThemeToggle";
import { ArrowLeft, BriefcaseBusiness, ChevronDown, ChevronRight, GraduationCap, FileCode2, BookOpen, Layers, HelpCircle, Code2, Sparkles, Bookmark } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { clearCredentials } from "@/lib/store/authSlice";
import { useSignoutMutation } from "@/lib/api/authApi";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { useScrollNavVisible } from "@/components/layout/ScrollNavProvider";
import GlobalSearch from "@/components/search/GlobalSearch";
import { useGetCoursesQuery, useGetCheatsheetsQuery } from "@/lib/api/courseApi";
import { signOut as oauthSignOut, useSession } from "next-auth/react";
import AuthUserMenu from "@/components/auth/AuthUserMenu";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/config";
// ASIF_COURSE_LEARNING_FLOW_V1:header-progress-import
import ContinueCoursePill from "@/components/layout/ContinueCoursePill";
import SiteAnnouncement from "@/components/layout/SiteAnnouncement";
import { useSiteBranding } from "@/components/providers/SiteBrandingProvider";

const LogoutConfirm = dynamic(() => import("./header/LogoutConfirm"), {
  ssr: false,
});

export default function Header() {
  const pathname = usePathname();
  const branding = useSiteBranding();
  const { data: oauthSession, status: oauthStatus } = useSession();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const { data: coursesData } = useGetCoursesQuery();
  const courses = coursesData?.data || [];

  const { data: cheatsheetsData } = useGetCheatsheetsQuery();
  const cheatsheets = cheatsheetsData?.data || [];

  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isInitialized } = useAppSelector(
    (s) => s.auth,
  );
  const [signout] = useSignoutMutation();

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
      toast.success("Signed out successfully.");
      window.location.reload();
    }
  };

  const isNavVisible = useScrollNavVisible();
  const isArticlePage =
    pathname.includes("/articles/") || pathname.includes("/tutorials/");

  const isLearnActive =
    pathname.startsWith("/courses") ||
    pathname.startsWith("/cheatsheets") ||
    pathname.startsWith("/articles") ||
    pathname.startsWith("/tutorials");

  const isPracticeActive =
    pathname.startsWith("/revision") ||
    pathname.startsWith("/quiz") ||
    pathname.startsWith("/interview-questions") ||
    pathname.startsWith("/playground") ||
    pathname.startsWith("/play");

  const isLibraryActive = pathname.startsWith("/library");
  const isJobsActive = pathname.startsWith("/jobs");

  // Align Header with 7xl layout across all pages
  const containerMaxWidth = "max-w-7xl";

  return (
    <>
      <header
        className={`fixed left-0 w-full z-50 px-1.5 sm:px-3 md:px-8 transition-[top,opacity] duration-300 ease-in-out ${
          isNavVisible
            ? "top-[max(.5rem,env(safe-area-inset-top))] sm:top-3 opacity-100"
            : "-top-22 opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`${containerMaxWidth} mx-auto bg-white/40 dark:bg-zinc-950/40 backdrop-blur-2xl rounded-[1.4rem] sm:rounded-full px-3 sm:px-4 md:px-6 h-14 md:h-16 flex items-center justify-between transition-all duration-300`}
        >
          {/* Brand Logo & Circular Menu Trigger */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isArticlePage && (
                <Link
                  href="/"
                  className="p-1.5 -ml-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-foreground transition-colors"
                  title="Back to Home"
                >
                  <ArrowLeft size={20} strokeWidth={2.5} />
                </Link>
              )}
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative">
                  <img
                    src={branding.logoUrl || "/logo.png"}
                    alt={`${branding.title || "asif.to"} logo`}
                    className="w-8 h-8 rounded-xl object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-outfit font-black text-lg sm:text-xl tracking-tight text-foreground leading-none">
                    {branding.title || "asif.to"}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hidden xs:block -mt-0.5">
                    {branding.tagline || "Tutorials"}
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation - Minimal Aesthetic */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-bold relative z-[100]">
            {/* Learn Dropdown (Tree Structure) */}
            <div className="relative group/learn">
              <Link
                href="/courses"
                className={`flex h-9 items-center gap-1.5 px-4 rounded-full transition-all ${
                  isLearnActive
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-300 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span>Learn</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover/learn:rotate-180" />
              </Link>

              <div className="absolute top-full left-0 pt-2 w-64 opacity-0 invisible translate-y-2 group-hover/learn:translate-y-0 group-hover/learn:opacity-100 group-hover/learn:visible transition-all duration-200 z-[100] flex flex-col">
                <div className="p-2.5 rounded-[1.5rem] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-3 py-1.5 mb-1 block">
                    Curriculum
                  </span>
                  
                  {/* Nested Courses Item */}
                  <div className="relative group/course">
                    <Link href="/courses" className="flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <div className="flex items-center gap-2.5">
                        <GraduationCap className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-sm">Courses</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </Link>
                    
                    {/* Courses Sub-Menu */}
                    <div className="absolute top-0 left-full pl-2 w-72 opacity-0 invisible -translate-x-2 group-hover/course:translate-x-0 group-hover/course:opacity-100 group-hover/course:visible transition-all duration-200 flex flex-col">
                      <div className="p-2.5 rounded-[1.5rem] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col">
                        <div className="flex flex-col max-h-[60vh] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-3 py-1.5 mb-1 block shrink-0">
                            All Courses
                          </span>
                          {courses.length > 0 ? courses.map(course => (
                            <Link key={course._id} href={`/courses/${course.slug}`} className="px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors flex items-center gap-3 shrink-0">
                              <div className="flex flex-col min-w-0 py-0.5">
                                <span className="text-[13px] font-bold truncate">{course.title}</span>
                              </div>
                            </Link>
                          )) : (
                            <span className="px-4 py-3 text-xs text-zinc-500 shrink-0">Loading courses...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nested Cheatsheets Item */}
                  <div className="relative group/cheatsheet">
                    <Link href="/cheatsheets" className="flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <div className="flex items-center gap-2.5">
                        <FileCode2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold text-sm">Cheatsheets</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </Link>
                    
                    {/* Cheatsheets Sub-Menu */}
                    <div className="absolute top-0 left-full pl-2 w-72 opacity-0 invisible -translate-x-2 group-hover/cheatsheet:translate-x-0 group-hover/cheatsheet:opacity-100 group-hover/cheatsheet:visible transition-all duration-200 flex flex-col">
                      <div className="p-2.5 rounded-[1.5rem] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col">
                        <div className="flex flex-col max-h-[60vh] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-3 py-1.5 mb-1 block shrink-0">
                            All Cheatsheets
                          </span>
                          {cheatsheets.length > 0 ? cheatsheets.map(cs => (
                            <Link key={cs._id} href={`/cheatsheets/${cs.slug}`} className="px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors flex items-center gap-3 shrink-0">
                              <div className="flex flex-col min-w-0 py-0.5">
                                <span className="text-[13px] font-bold truncate">{cs.title}</span>
                              </div>
                            </Link>
                          )) : (
                            <span className="px-4 py-3 text-xs text-zinc-500 shrink-0">Loading cheatsheets...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link href="/articles" className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    <span className="font-semibold text-sm">Articles</span>
                  </Link>

                </div>
              </div>
            </div>

            {/* Practice Dropdown */}
            <div className="relative group/practice">
              <Link
                href="/practice"
                className={`flex h-9 items-center gap-1.5 px-4 rounded-full transition-all ${
                  isPracticeActive
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-300 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span>Practice</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover/practice:rotate-180" />
              </Link>

              <div className="absolute top-full left-0 pt-2 w-56 opacity-0 invisible translate-y-2 group-hover/practice:translate-y-0 group-hover/practice:opacity-100 group-hover/practice:visible transition-all duration-200 z-[100] flex flex-col">
                <div className="p-2.5 rounded-[1.5rem] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-3 py-1.5 mb-1 block">
                    Interactive
                  </span>
                  
                  <Link href="/revision" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-sm">Revision Deck</span>
                  </Link>
                  
                  <Link href="/quiz" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-sm">Quizzes</span>
                  </Link>
                  
                  <Link href="/playground" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                      <Code2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-sm">Playground</span>
                  </Link>
                  
                  <Link href="/interview-questions" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-sm">Interview Prep</span>
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="/jobs"
              className={`flex h-9 items-center px-4 rounded-full transition-all ${
                isJobsActive
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-300 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              Jobs
            </Link>

            <Link
              href="/library"
              className={`flex h-9 items-center px-4 rounded-full transition-all ${
                isLibraryActive
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-300 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              Library
            </Link>
          </nav>

          {/* User Profile & Actions (Jobs icon on mobile, darkmode toggle & profile on desktop) */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* ASIF_COURSE_LEARNING_FLOW_V1:header-progress */}
            <ContinueCoursePill />
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
            <Link
              href="/jobs"
              className={`lg:hidden flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-full border border-zinc-200 dark:border-zinc-800 transition-colors touch-manipulation ${
                isJobsActive
                  ? "bg-blue-600 text-white border-blue-600 dark:border-blue-600 shadow-sm"
                  : "bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
              aria-label="Jobs"
              title="Jobs"
            >
              <BriefcaseBusiness size={18} />
            </Link>
            <GlobalSearch />
            <div className="hidden lg:flex items-center gap-2">
              {oauthStatus === "loading" || !isInitialized ? (
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              ) : oauthSession?.user ? (
                <AuthUserMenu user={oauthSession.user} />
              ) : isAuthenticated && user ? (
                <Link
                  href={`/${user.username}`}
                  className="flex h-10 items-center gap-2.5 px-4 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-foreground transition-all active:scale-95 shadow-sm"
                >
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-black shadow-sm overflow-hidden shrink-0 relative">
                    {user.avatar ? (
                      <img
                        src={getImageUrl(user.avatar)}
                        alt={user.fullName || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.fullName?.[0]?.toUpperCase() || "U"
                    )}
                  </span>
                  <span>{user.fullName?.split(" ")[0] || "User"}</span>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" className="h-10 text-xs px-4">
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`}
                    >
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild className="h-10 text-xs px-4">
                    <Link
                      href={`/signup?callbackUrl=${encodeURIComponent(pathname || "/")}`}
                    >
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <SiteAnnouncement isNavVisible={isNavVisible} />

      <LogoutConfirm
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
