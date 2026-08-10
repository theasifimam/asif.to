"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import AuthModal from "@/components/AuthModal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { clearCredentials } from "@/lib/store/authSlice";
import { useGetProfileQuery, useSignoutMutation } from "@/lib/api/authApi";
import { useGetArticlesQuery } from "@/lib/api/articlesApi";
import { getImageUrl } from "@/lib/config";
import {
  User,
  Settings,
  Bookmark,
  LogOut,
  MapPin,
  Calendar,
  Edit3,
  LogIn,
  UserPlus,
  Twitter,
  Linkedin,
  Globe,
  PencilLine,
  Newspaper,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  CheckCircle2,
  Loader2,
  X,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user: storeUser, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("signin");
  const [activeTab, setActiveTab] = useState("saved");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [savedLectures, setSavedLectures] = useState([]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("asif_saved_lectures");
        if (saved) setSavedLectures(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const removeSavedLecture = (chapterId) => {
    setSavedLectures((prev) => {
      const updated = prev.filter((item) => item.chapterId !== chapterId);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("asif_saved_lectures", JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
    toast.success("Saved lecture removed");
  };

  const [signout, { isLoading: isSigningOut }] = useSignoutMutation();

  const { data: profileRes, isLoading: profileLoading } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });
  const user = profileRes?.data?.user || storeUser;

  const { data: articlesRes, isLoading: articlesLoading } = useGetArticlesQuery(
    { author: user?._id, status: "published" },
    { skip: !user?._id || activeTab !== "articles" }
  );

  const handleLogout = async () => {
    try {
      await signout().unwrap();
    } catch {
      // Ignore API signout error if session expired
    } finally {
      dispatch(clearCredentials());
      setIsLogoutModalOpen(false);
      toast.success("Successfully signed out");
    }
  };

  const openAuth = (tab) => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-24 sm:pb-12">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-6">

        {!isInitialized ? (
          <div className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : isAuthenticated && user ? (
          <>
            {/* User Profile Hero Card */}
            <section className="p-6 sm:p-9 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md flex flex-col gap-6 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                
                {/* Avatar with Ring */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shrink-0 shadow-lg ring-4 ring-blue-500/20 bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src={
                      user?.avatar
                        ? getImageUrl(user.avatar)
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}&background=2563eb&color=ffffff&size=256`
                    }
                    alt={user?.fullName || "Avatar"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* User Info Details */}
                <div className="flex-1 flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
                      {user.fullName}
                    </h1>
                    <span className="px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">
                      {user.role === "admin" ? "Admin Lead" : "Pro Developer"}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-500 font-medium">
                    {user.email}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-zinc-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      {user.location || "Earth"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "2024"}
                    </span>
                  </div>

                  {user.bio && (
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed mt-1">
                      {user.bio}
                    </p>
                  )}
                </div>

                {/* Profile Action Buttons: Edit & Logout */}
                <div className="flex items-center gap-2 self-stretch sm:self-start justify-center">
                  <Link
                    href="/profile/settings"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground text-xs font-bold transition-all active:scale-95 shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Link>

                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold transition-all active:scale-95 shadow-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Quick Stats Grid */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm flex flex-col gap-1">
                <div className="flex items-center justify-between text-blue-500">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Streak</span>
                  <Flame className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-foreground mt-1">{user?.streak || 0} Days</span>
                <span className="text-[11px] text-zinc-400 font-medium">Daily Learning</span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm flex flex-col gap-1">
                <div className="flex items-center justify-between text-indigo-500">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Courses</span>
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-foreground mt-1">{user?.activeCourses || 0} Active</span>
                <span className="text-[11px] text-zinc-400 font-medium">Tech Tracks</span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm flex flex-col gap-1">
                <div className="flex items-center justify-between text-emerald-500">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Saved</span>
                  <Bookmark className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-foreground mt-1">{user?.bookmarks?.length || 0} Saved</span>
                <span className="text-[11px] text-zinc-400 font-medium">Snippets & Notes</span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm flex flex-col gap-1">
                <div className="flex items-center justify-between text-amber-500">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Mastery</span>
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-foreground mt-1">Level {user?.masteryLevel || 1}</span>
                <span className="text-[11px] text-zinc-400 font-medium">Pro Developer</span>
              </div>
            </section>

            {/* Profile Tabs Section */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-full bg-zinc-200/60 dark:bg-zinc-900 w-fit text-xs font-bold">
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full transition-all ${
                    activeTab === "saved"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-foreground"
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Saved Notes</span>
                </button>

                <button
                  onClick={() => setActiveTab("quiz")}
                  className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full transition-all ${
                    activeTab === "quiz"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-foreground"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Quiz & Revision</span>
                </button>

                <button
                  onClick={() => setActiveTab("articles")}
                  className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full transition-all ${
                    activeTab === "articles"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-foreground"
                  }`}
                >
                  <Newspaper className="w-3.5 h-3.5" />
                  <span>My Articles</span>
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "quiz" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-6 rounded-4xl bg-white dark:bg-zinc-900/90 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h3 className="font-extrabold text-base text-foreground">Interactive Practice Quizzes</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                        Test your JavaScript, React, Next.js, and Node.js knowledge with real-time feedback and explanations.
                      </p>
                    </div>
                    <Link
                      href="/quiz"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/25 hover:bg-amber-600 transition-all active:scale-95 w-full sm:w-auto"
                    >
                      <span>Start Quiz Now</span>
                    </Link>
                  </div>

                  <div className="p-6 rounded-4xl bg-white dark:bg-zinc-900/90 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h3 className="font-extrabold text-base text-foreground">Flashcard Revision Deck</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                        Quickly review key full-stack concepts, syntax definitions, and interview questions on the go.
                      </p>
                    </div>
                    <Link
                      href="/revision"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-500/25 hover:bg-purple-700 transition-all active:scale-95 w-full sm:w-auto"
                    >
                      <span>Practice Flashcards</span>
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === "saved" && (
                <div className="space-y-8">
                  {/* Saved Course Lectures */}
                  <div>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      Saved Lectures & Lessons ({savedLectures.length})
                    </h3>

                    {savedLectures.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedLectures.map((item) => (
                          <div
                            key={item.chapterId}
                            className="p-5 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between gap-3 hover:border-blue-500/30 transition-all"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[10px]">
                                  {item.courseTitle || "Course"}
                                </span>
                                <button
                                  onClick={() => removeSavedLecture(item.chapterId)}
                                  className="text-zinc-400 hover:text-red-500 p-1 transition-colors"
                                  title="Remove from saved"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <h4 className="font-extrabold text-sm text-foreground leading-snug line-clamp-2">
                                {item.chapterTitle}
                              </h4>
                              {item.summary && (
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium line-clamp-2">
                                  {item.summary}
                                </p>
                              )}
                            </div>
                            <Link
                              href={`/courses/${item.courseId}/${item.chapterId}`}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline pt-2 border-t border-zinc-100 dark:border-zinc-800/80 mt-1"
                            >
                              <span>Read Lecture</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm text-center flex flex-col items-center gap-2 border border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs text-zinc-500 font-medium">
                          No saved lectures yet. Click "Save Lecture" while reading any course chapter to add it here.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Saved Articles */}
                  <div>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-purple-500" />
                      Saved Articles ({user?.bookmarks?.length || 0})
                    </h3>

                    {user?.bookmarks && user.bookmarks.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {user.bookmarks.map((item) => (
                          <ArticleCard
                            key={item._id}
                            article={{
                              id: item._id,
                              slug: item.slug,
                              title: item.title,
                              author: item.author?.fullName || "asif.to Team",
                              date: new Date(item.createdAt).toLocaleDateString(),
                              imageUrl: item.image,
                              views: item.readCount || 120,
                            }}
                            variant="vertical"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm text-center flex flex-col items-center gap-2 border border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs text-zinc-500 font-medium">
                          No saved articles found in your bookmarks collection.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "articles" && (
                <div>
                  {articlesLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  ) : articlesRes?.data && articlesRes.data.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {articlesRes.data.map((item) => (
                        <ArticleCard
                          key={item._id}
                          article={{
                            id: item._id,
                            slug: item.slug,
                            title: item.title,
                            author: item.author.fullName,
                            date: new Date(item.createdAt).toLocaleDateString(),
                            imageUrl: item.image,
                            views: item.readCount,
                          }}
                          variant="vertical"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-sm text-center flex flex-col items-center gap-3">
                      <Newspaper className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                      <h3 className="font-extrabold text-base text-foreground">No Published Articles Yet</h3>
                      <p className="text-xs text-zinc-500 max-w-sm">
                        Share your technical insights, tutorials, and coding notes with the asif.to community.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </>
        ) : (
          /* Unauthenticated Restricted State */
          <div className="p-10 sm:p-16 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md text-center flex flex-col items-center gap-4 my-8">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2">
              <User className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-foreground">Sign In to View Your Profile</h1>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md leading-relaxed">
              Track your course progress, manage saved syntax cheatsheets, flashcard revision decks, and personalized learning preferences.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 w-full sm:w-auto">
              <button
                onClick={() => openAuth("signin")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => openAuth("signup")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Logout Modal Confirmation */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 sm:p-7 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-foreground">Sign Out of asif.to?</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Are you sure you want to log out? Your saved bookmarks and learning progress will remain safely synced.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleLogout}
                disabled={isSigningOut}
                className="flex-1 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Sign Out"}
              </button>
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground text-xs font-bold hover:bg-zinc-200 transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <AuthModal
        isOpen={isAuthOpen}
        onOpenChange={setIsAuthOpen}
        defaultTab={authTab}
      />
    </div>
  );
}