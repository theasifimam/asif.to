"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ThemeToggle } from "../ui/ThemeToggle";
import {
  ArrowLeft,
  ChevronDown,
  BookOpen,
  FileCode,
  Layers,
  HelpCircle,
  Bookmark,
  Code2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { clearCredentials } from "@/lib/store/authSlice";
import { useSignoutMutation } from "@/lib/api/authApi";
import {
  useGetCoursesQuery,
  useGetCheatsheetsQuery,
} from "@/lib/api/courseApi";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { useScrollNavVisible } from "@/components/layout/ScrollNavProvider";
import GlobalSearch from "@/components/search/GlobalSearch";
import { signOut as oauthSignOut, useSession } from "next-auth/react";
import AuthUserMenu from "@/components/auth/AuthUserMenu";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/config";
// ASIF_COURSE_LEARNING_FLOW_V1:header-progress-import
import ContinueCoursePill from "@/components/layout/ContinueCoursePill";
import SiteAnnouncement from "@/components/layout/SiteAnnouncement";

const LogoutConfirm = dynamic(() => import("./header/LogoutConfirm"), {
  ssr: false,
});

export default function Header() {
  const pathname = usePathname();
  const { data: oauthSession, status: oauthStatus } = useSession();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Dropdown states
  const [learnDropdownOpen, setLearnDropdownOpen] = useState(false);
  const [practiceDropdownOpen, setPracticeDropdownOpen] = useState(false);

  const learnRef = useRef(null);
  const practiceRef = useRef(null);

  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isInitialized } = useAppSelector(
    (s) => s.auth,
  );
  const [signout] = useSignoutMutation();
  const { data: coursesData } = useGetCoursesQuery();
  const { data: cheatsheetsData } = useGetCheatsheetsQuery();
  const courses = coursesData?.data || [];

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

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (learnRef.current && !learnRef.current.contains(e.target)) {
        setLearnDropdownOpen(false);
      }
      if (practiceRef.current && !practiceRef.current.contains(e.target)) {
        setPracticeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Align Header with 7xl layout across all pages
  const containerMaxWidth = "max-w-7xl";

  const navLinksForSidebar = [
    { label: "Home / Courses", href: "/" },
    { label: "Cheatsheets", href: "/cheatsheets" },
    { label: "Revision Deck", href: "/revision" },
    { label: "Practice Quiz", href: "/quiz" },
  ];
  const displayedUser = oauthSession?.user
    ? {
        ...oauthSession.user,
        fullName: oauthSession.user.name,
        avatar: oauthSession.user.image,
      }
    : user;

  return (
    <>
      <header
        className={`fixed left-0 w-full z-50 px-1.5 sm:px-3 md:px-8 transition-[top,opacity] duration-300 ease-in-out ${
          isNavVisible
            ? "top-3 opacity-100"
            : "-top-22 opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`${containerMaxWidth} mx-auto bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-full px-3 sm:px-4 md:px-6 h-14 md:h-16 flex items-center justify-between border border-zinc-200/80 dark:border-zinc-800/80 transition-all duration-300`}
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
                    src="/logo.png"
                    alt="asif.to logo"
                    className="w-8 h-8 rounded-xl object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-outfit font-black text-lg sm:text-xl tracking-tight text-foreground leading-none">
                    asif
                    <span className="text-blue-600 dark:text-blue-400">
                      .to
                    </span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hidden xs:block -mt-0.5">
                    Tutorials
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation with Categorized Mega-Dropdowns */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-bold">
            {/* Learn & Explore Dropdown */}
            <div className="relative" ref={learnRef}>
              <button
                onClick={() => {
                  setLearnDropdownOpen(!learnDropdownOpen);
                  setPracticeDropdownOpen(false);
                }}
                className={`flex h-10 items-center gap-1.5 px-4 rounded-full transition-all ${
                  isLearnActive || learnDropdownOpen
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-300 hover:text-foreground hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Learn</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    learnDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {learnDropdownOpen && (
                <div className="absolute top-full left-0 mt-2.5 w-84 p-3 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 z-50 animate-fadeIn space-y-2">
                  <div className="px-3 py-1 border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                      Learn & Explore
                    </span>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/courses"
                      onClick={() => setLearnDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1">
                          Interactive Courses
                        </span>
                        <span className="text-[10px] text-zinc-400 font-normal">
                          Step-by-step full-stack learning tracks
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/cheatsheets"
                      onClick={() => setLearnDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground">
                          Syntax Cheatsheets
                        </span>
                        <span className="text-[10px] text-zinc-400 font-normal">
                          Instant code syntax & API references
                        </span>
                      </div>
                    </Link>
                  </div>

                  {/* Featured Courses Sub-section */}
                  {courses.length > 0 && (
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 px-3 block mb-1.5">
                        Top Courses
                      </span>
                      <div className="space-y-1">
                        {courses.slice(0, 3).map((course) => {
                          const slug = course.slug || course.id;
                          return (
                            <Link
                              key={course._id || course.id}
                              href={`/courses/${slug}`}
                              onClick={() => setLearnDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-foreground text-xs font-bold"
                            >
                              <span className="w-5 h-5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-[9px] shrink-0">
                                {course.title.slice(0, 2).toUpperCase()}
                              </span>
                              <span className="line-clamp-1 text-[11px]">
                                {course.title.split(":")[0]}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Action Footer Link */}
                  <div className="pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80">
                    <Link
                      href="/courses"
                      onClick={() => setLearnDropdownOpen(false)}
                      className="flex items-center justify-center gap-1.5 w-full py-2 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-extrabold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                    >
                      <span>Explore All Courses</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Practice & Tools Dropdown */}
            <div className="relative" ref={practiceRef}>
              <button
                onClick={() => {
                  setPracticeDropdownOpen(!practiceDropdownOpen);
                  setLearnDropdownOpen(false);
                }}
                className={`flex h-10 items-center gap-1.5 px-4 rounded-full transition-all ${
                  isPracticeActive || practiceDropdownOpen
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-300 hover:text-foreground hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Practice & Tools</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    practiceDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {practiceDropdownOpen && (
                <div className="absolute top-full left-0 mt-2.5 w-84 p-3 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 z-50 animate-fadeIn space-y-1">
                  <div className="px-3 py-1 border-b border-zinc-100 dark:border-zinc-800/80 pb-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                      Practice & Tools
                    </span>
                  </div>

                  <Link
                    href="/revision"
                    onClick={() => setPracticeDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground">
                        Revision Deck
                      </span>
                      <span className="text-[10px] text-zinc-400 font-normal">
                        Active recall spaced flashcards
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/quiz"
                    onClick={() => setPracticeDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground">
                        Practice Quiz
                      </span>
                      <span className="text-[10px] text-zinc-400 font-normal">
                        Knowledge checks & topic quizzes
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/playground"
                    onClick={() => setPracticeDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground">
                        Code Playground
                      </span>
                      <span className="text-[10px] text-zinc-400 font-normal">
                        Interactive live code sandbox
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/interview-questions"
                    onClick={() => setPracticeDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground">
                        Interview Q&A
                      </span>
                      <span className="text-[10px] text-zinc-400 font-normal">
                        Technical interview questions & answers
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* My Library Direct Link */}
            <Link
              href="/library"
              className={`flex h-10 items-center gap-1.5 px-4 rounded-full transition-all ${
                isLibraryActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-300 hover:text-foreground hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>My Library</span>
            </Link>
          </nav>

          {/* User Profile & Actions (Theme toggle visible on mobile, profile on desktop) */}
          <div className="flex items-center gap-2">
            {/* ASIF_COURSE_LEARNING_FLOW_V1:header-progress */}
            <ContinueCoursePill />
            <ThemeToggle />
            <GlobalSearch />
            <div className="hidden md:flex items-center gap-2">
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
