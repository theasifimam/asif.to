"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ThemeToggle } from "../ui/ThemeToggle";
import {
  LogOut,
  Menu,
  ArrowLeft,
  ChevronDown,
  BookOpen,
  FileCode,
  Layers,
  HelpCircle,
  Bookmark,
  Code2,
  Zap,
  Server,
  Database,
  Sparkles,
  Plus,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { clearCredentials } from "@/lib/store/authSlice";
import { useSignoutMutation } from "@/lib/api/authApi";
import {
  useGetCoursesQuery,
  useGetCheatsheetsQuery,
} from "@/lib/api/courseApi";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { useScrollNavVisible } from "@/components/layout/ScrollNavProvider";
import GlobalSearch from "@/components/search/GlobalSearch";
import { signOut as oauthSignOut, useSession } from "next-auth/react";
import AuthUserMenu from "@/components/auth/AuthUserMenu";

const Sidebar = dynamic(() => import("./header/Sidebar"), { ssr: false });
const LogoutConfirm = dynamic(() => import("./header/LogoutConfirm"), {
  ssr: false,
});

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: oauthSession, status: oauthStatus } = useSession();
  const [currentTime, setCurrentTime] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Dropdown states
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const [cheatsheetsDropdownOpen, setCheatsheetsDropdownOpen] = useState(false);

  const coursesRef = useRef(null);
  const cheatsheetsRef = useRef(null);

  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isInitialized } = useAppSelector(
    (s) => s.auth,
  );
  const [signout] = useSignoutMutation();
  const { data: coursesData } = useGetCoursesQuery();
  const { data: cheatsheetsData } = useGetCheatsheetsQuery();
  const courses = coursesData?.data || [];
  const cheatsheets = cheatsheetsData?.data || [];

  const handleLogout = async () => {
    try {
      if (oauthSession?.user) {
        await fetch("/api/auth/backend-session", { method: "DELETE" }).catch(
          () => {},
        );
        await oauthSignOut({ redirectTo: "/" });
        return;
      }
      await signout().unwrap();
    } catch {
      /* ignore */
    } finally {
      dispatch(clearCredentials());
      setIsLogoutConfirmOpen(false);
      setIsMenuOpen(false);
      toast.success("Signed out successfully.");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (coursesRef.current && !coursesRef.current.contains(e.target)) {
        setCoursesDropdownOpen(false);
      }
      if (
        cheatsheetsRef.current &&
        !cheatsheetsRef.current.contains(e.target)
      ) {
        setCheatsheetsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isNavVisible = useScrollNavVisible();
  const isArticlePage =
    pathname.includes("/articles/") || pathname.includes("/tutorials/");

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
                    className="w-8 h-8 rounded-xl object-contain shadow-sm group-hover:scale-105 transition-transform"
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

          {/* Desktop Navigation with Dropdowns */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-full text-xs font-bold">
            <Link
              href="/library"
              className={`flex items-center gap-1 px-4 py-1.5 rounded-full transition-all ${pathname.startsWith("/library") ? "bg-blue-600 text-white shadow-sm" : "text-zinc-600 dark:text-zinc-300 hover:text-foreground"}`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>My Library</span>
            </Link>
            {/* Courses Dropdown */}
            <div className="relative" ref={coursesRef}>
              <button
                onClick={() => {
                  setCoursesDropdownOpen(!coursesDropdownOpen);
                  setCheatsheetsDropdownOpen(false);
                }}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-full transition-all ${
                  pathname.startsWith("/courses") || coursesDropdownOpen
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-300 hover:text-foreground"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Courses</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${coursesDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {coursesDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 p-3 rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border-0 z-50 animate-fadeIn space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 px-3 py-1 block">
                    Select a Course
                  </span>
                  {courses.map((course) => {
                    const slug = course.slug || course.id;
                    return (
                      <Link
                        key={course._id || course.id}
                        href={`/courses/${slug}`}
                        onClick={() => setCoursesDropdownOpen(false)}
                        className="flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-foreground text-xs font-bold"
                      >
                        <span className="w-6 h-6 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-[10px]">
                          {course.title.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="flex flex-col">
                          <span className="line-clamp-1">
                            {course.title.split(":")[0]}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-normal">
                            {course.chapterCount ??
                              course.chapters?.length ??
                              0}{" "}
                            Lessons
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cheatsheets Dropdown */}
            <div className="relative" ref={cheatsheetsRef}>
              <button
                onClick={() => {
                  setCheatsheetsDropdownOpen(!cheatsheetsDropdownOpen);
                  setCoursesDropdownOpen(false);
                }}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-full transition-all ${
                  pathname === "/cheatsheets" || cheatsheetsDropdownOpen
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-300 hover:text-foreground"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Cheatsheets</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${cheatsheetsDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {cheatsheetsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 p-3 rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border-0 z-50 animate-fadeIn space-y-1">
                  <div className="flex items-center justify-between px-3 py-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 block">
                      Syntax Cheatsheets
                    </span>
                    <Link
                      href="/cheatsheets"
                      onClick={() => setCheatsheetsDropdownOpen(false)}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  {cheatsheets.map((cs) => {
                    const csSlug = cs.slug || cs.id || cs._id;
                    return (
                      <Link
                        key={cs._id || cs.id}
                        href={`/cheatsheets/${csSlug}`}
                        onClick={() => setCheatsheetsDropdownOpen(false)}
                        className="flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-foreground text-xs font-bold"
                      >
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <div className="flex flex-col">
                          <span className="line-clamp-1">{cs.title}</span>
                          <span className="text-[10px] text-zinc-400 font-normal">
                            Article reference
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Revision Deck Link */}
            <Link
              href="/revision"
              className={`px-4 py-1.5 rounded-full transition-all ${
                pathname === "/revision"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-300 hover:text-foreground"
              }`}
            >
              Revise
            </Link>

            {/* Quiz Link */}
            <Link
              href="/quiz"
              className={`px-4 py-1.5 rounded-full transition-all ${
                pathname === "/quiz"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-300 hover:text-foreground"
              }`}
            >
              Quiz
            </Link>
          </nav>

          {/* User Profile & Actions (Theme toggle visible on mobile, profile on desktop) */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <GlobalSearch />
            <div className="hidden md:flex items-center gap-2">
              {oauthStatus === "loading" || !isInitialized ? (
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              ) : oauthSession?.user ? (
                <AuthUserMenu user={oauthSession.user} />
              ) : isAuthenticated && user ? (
                <Link
                  href={`/@${user.username}`}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-foreground transition-all active:scale-95 shadow-sm"
                >
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-black shadow-sm">
                    {user.fullName?.[0]?.toUpperCase() || "U"}
                  </span>
                  <span>{user.fullName.split(" ")[0]}</span>
                </Link>
              ) : (
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`}
                  className="px-4 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold active:scale-95 transition-all"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <LogoutConfirm
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
