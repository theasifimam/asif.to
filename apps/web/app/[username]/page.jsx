"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import AuthModal from "@/components/AuthModal";
import SaveButton from "@/components/SaveButton";
import { generateCertificate } from "@/components/exam/generateCertificate";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { clearCredentials } from "@/lib/store/authSlice";
import {
  useGetProfileQuery,
  useSignoutMutation,
  useGetMySavedItemsQuery,
  useUpdateAttemptVisibilityMutation,
} from "@/lib/api/authApi";
import { useGetArticlesQuery } from "@/lib/api/articlesApi";
import { getImageUrl } from "@/lib/config";
import {
  User,
  Bookmark,
  LogOut,
  MapPin,
  Calendar,
  Edit3,
  LogIn,
  UserPlus,
  Newspaper,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  CheckCircle2,
  Loader2,
  ChevronRight,
  GraduationCap,
  ShieldOff,
  Link2,
  BadgeCheck,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export default function UserProfilePage() {
  const params = useParams();
  const rawUsernameParam = decodeURIComponent(params?.username || "");
  const usernameParam = rawUsernameParam.replace(/^@+/, "");
  useEffect(() => {
    if (rawUsernameParam && !rawUsernameParam.startsWith("@"))
      window.history.replaceState(window.history.state, "", `/@${usernameParam}`);
  }, [rawUsernameParam, usernameParam]);

  const dispatch = useAppDispatch();
  const {
    user: storeUser,
    isAuthenticated,
    isInitialized,
  } = useAppSelector((state) => state.auth);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("signin");
  const [activeTab, setActiveTab] = useState("saved");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [downloadingCertificate, setDownloadingCertificate] = useState(null);

  const [signout, { isLoading: isSigningOut }] = useSignoutMutation();

  const { data: profileRes, refetch: refetchProfile } = useGetProfileQuery(
    undefined,
    { skip: !isAuthenticated },
  );
  const user = profileRes?.data?.user || storeUser;
  const { data: savedItemsRes, isLoading: savedItemsLoading } =
    useGetMySavedItemsQuery(undefined, { skip: !isAuthenticated });
  const savedItems = savedItemsRes?.data?.savedItems || [];

  const { data: articlesRes, isLoading: articlesLoading } = useGetArticlesQuery(
    { author: user?._id, status: "published" },
    { skip: !user?._id || activeTab !== "articles" },
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

  // --- Access Control Logic ---
  // Determine if the logged-in user is viewing their own profile
  const isOwnProfile =
    isAuthenticated && user && user.username === usernameParam;

  // If auth is initialized and the user is not authenticated or the username does not match,
  // show a "restricted" state instead of the profile data.
  const showRestrictedView = isInitialized && !isOwnProfile;

  const completedCourses = user?.completedCourses || [];
  const certificates = user?.certificates || [];
  const quizAttempts = user?.quizAttempts || [];
  const [updateAttemptVisibility, { isLoading: updatingPrivacy }] = useUpdateAttemptVisibilityMutation();

  const changeScorePrivacy = async (attemptId, visibility) => {
    try {
      await updateAttemptVisibility({ attemptId, visibility }).unwrap();
      await refetchProfile();
      toast.success(`Score is now ${visibility}`);
    } catch (error) {
      toast.error(error?.data?.message || "Unable to update score privacy");
    }
  };

  const downloadCertificate = async (certificate) => {
    if (!Number.isFinite(certificate.score) || !certificate.total) {
      toast.error("This older certificate does not contain a recorded score and cannot be regenerated.");
      return;
    }
    setDownloadingCertificate(certificate._id);
    try {
      const verificationUrl = certificate.certificateUrl
        ? `${window.location.origin}${certificate.certificateUrl}`
        : "";
      await generateCertificate({
        studentName: user.fullName || user.username,
        studentEmail: user.email || "",
        courseName: certificate.courseId?.title || "Course",
        score: certificate.score,
        total: certificate.total,
        date: new Date(certificate.issueDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        verificationUrl,
      });
    } catch {
      toast.error("Unable to generate the certificate PDF. Please try again.");
    } finally {
      setDownloadingCertificate(null);
    }
  };

  const tabs = [
    { key: "saved", label: "Saved", icon: Bookmark },
    { key: "courses", label: "Completed", icon: CheckCircle2 },
    { key: "certificates", label: "Certificates", icon: Award },
    { key: "quiz", label: "Quiz & Revision", icon: BookOpen },
    { key: "articles", label: "My Articles", icon: Newspaper },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-24 sm:pb-12">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-6">
        {!isInitialized ? (
          /* Loading State */
          <div className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : showRestrictedView ? (
          /* Restricted: Not logged in or viewing someone else's private profile */
          <div className="p-10 sm:p-16 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md text-center flex flex-col items-center gap-4 my-8">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2">
              {isAuthenticated ? (
                <ShieldOff className="w-8 h-8" />
              ) : (
                <User className="w-8 h-8" />
              )}
            </div>
            <h1 className="text-2xl font-black text-foreground">
              {isAuthenticated
                ? "This profile is private"
                : "Sign In to View Your Profile"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md leading-relaxed">
              {isAuthenticated
                ? `The profile for @${usernameParam} is not accessible. You can only view your own profile.`
                : "Track your course progress, manage saved syntax cheatsheets, flashcard revision decks, and personalized learning preferences."}
            </p>

            {!isAuthenticated && (
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
            )}
          </div>
        ) : (
          /* Own Profile View */
          <>
            {/* User Profile Hero Card */}
            <section className="p-6 sm:p-9 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md flex flex-col gap-6 relative overflow-hidden">
              {/* Subtle gradient blob */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar with Ring */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shrink-0 shadow-lg ring-4 ring-blue-500/20 bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src={
                      user?.avatar
                        ? getImageUrl(user.avatar)
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user?.fullName || "User",
                          )}&background=2563eb&color=ffffff&size=256`
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

                  {/* Username pill */}
                  <div className="flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-400">
                      asif.to/@{user.username}
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
                      Member since{" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })
                        : "2024"}
                    </span>
                  </div>

                  {user.bio && (
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed mt-1">
                      {user.bio}
                    </p>
                  )}
                </div>

                {/* Profile Action Buttons */}
                <div className="flex items-center gap-2 self-stretch sm:self-start justify-center">
                  <Link
                    href={`/@${user.username}/settings`}
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
                  <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                    Streak
                  </span>
                  <Flame className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-foreground mt-1">
                  {user?.streak || 0} Days
                </span>
                <span className="text-[11px] text-zinc-400 font-medium">
                  Daily Learning
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm flex flex-col gap-1">
                <div className="flex items-center justify-between text-indigo-500">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                    Courses
                  </span>
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-foreground mt-1">
                  {completedCourses.length || 0} Done
                </span>
                <span className="text-[11px] text-zinc-400 font-medium">
                  Completed Tracks
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm flex flex-col gap-1">
                <div className="flex items-center justify-between text-emerald-500">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                    Certs
                  </span>
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-foreground mt-1">
                  {certificates.length || 0} Won
                </span>
                <span className="text-[11px] text-zinc-400 font-medium">
                  Certificates
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm flex flex-col gap-1">
                <div className="flex items-center justify-between text-amber-500">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                    Mastery
                  </span>
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-foreground mt-1">
                  Level {user?.masteryLevel || 1}
                </span>
                <span className="text-[11px] text-zinc-400 font-medium">
                  Pro Developer
                </span>
              </div>
            </section>

            {/* Profile Tabs Section */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-full bg-zinc-200/60 dark:bg-zinc-900 w-fit text-xs font-bold">
                {tabs.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all ${
                      activeTab === key
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}

              {/* Saved Items */}
              {activeTab === "saved" && (
                <div className="space-y-8">
                  {/* Saved Learning Resources */}
                  <div>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      Saved Learning Resources ({savedItems.length})
                    </h3>

                    {savedItemsLoading ? (
                      <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      </div>
                    ) : savedItems.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedItems.map((item) => {
                          const metadata = {
                            course: {
                              label: "Course",
                              title: item.title,
                              href: `/courses/${item.slug}`,
                            },
                            chapter: {
                              label: item.course?.title || "Chapter",
                              title: item.title,
                              description: item.summary,
                              href: `/${item.course?.slug}/${item.slug}`,
                            },
                            cheatsheet: {
                              label: "Cheatsheet",
                              title: item.title,
                              href: "/cheatsheets",
                            },
                            quiz_question: {
                              label: "Quiz Question",
                              title: item.question,
                              href: "/quiz",
                            },
                            interview_question: {
                              label: item.course?.title || "Interview Question",
                              title: item.question,
                              href: `/${item.course?.slug}/interview-questions/${item.slug}`,
                            },
                          }[item.itemType];

                          if (!metadata) return null;

                          return (
                            <div
                              key={`${item.itemType}-${item._id}`}
                              className="p-5 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between gap-3 hover:border-blue-500/30 transition-all"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[10px] line-clamp-1">
                                    {metadata.label}
                                  </span>
                                  <SaveButton
                                    itemId={item._id}
                                    itemType={item.itemType}
                                    label="Save"
                                    size="sm"
                                    className="shrink-0"
                                  />
                                </div>
                                <h4 className="font-extrabold text-sm text-foreground leading-snug line-clamp-2">
                                  {metadata.title}
                                </h4>
                                {metadata.description && (
                                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium line-clamp-2">
                                    {metadata.description}
                                  </p>
                                )}
                              </div>
                              <Link
                                href={metadata.href}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline pt-2 border-t border-zinc-100 dark:border-zinc-800/80 mt-1"
                              >
                                <span>Open Resource</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm text-center flex flex-col items-center gap-2 border border-zinc-100 dark:border-zinc-800">
                        <Bookmark className="w-8 h-8 text-zinc-200 dark:text-zinc-700" />
                        <p className="text-xs text-zinc-500 font-medium">
                          Save courses, chapters, cheatsheets, and quiz
                          questions to find them here.
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
                              date: new Date(
                                item.createdAt,
                              ).toLocaleDateString(),
                              imageUrl: item.image,
                              views: item.readCount || 120,
                            }}
                            variant="vertical"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm text-center flex flex-col items-center gap-2 border border-zinc-100 dark:border-zinc-800">
                        <Bookmark className="w-8 h-8 text-zinc-200 dark:text-zinc-700" />
                        <p className="text-xs text-zinc-500 font-medium">
                          No saved articles found in your bookmarks collection.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Completed Courses */}
              {activeTab === "courses" && (
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Completed Courses ({completedCourses.length})
                  </h3>

                  {completedCourses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {completedCourses.map((course) => (
                        <Link
                          key={course._id || course}
                          href={`/courses/${course.slug || course}`}
                          className="group p-5 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col gap-3 hover:border-emerald-500/30 transition-all"
                        >
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-foreground leading-snug group-hover:text-emerald-600 transition-colors">
                              {course.title || "Course"}
                            </h4>
                            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                              Completed
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-auto">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completed</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-sm text-center flex flex-col items-center gap-3 border border-zinc-100 dark:border-zinc-800">
                      <GraduationCap className="w-10 h-10 text-zinc-200 dark:text-zinc-700" />
                      <h3 className="font-extrabold text-base text-foreground">
                        No Completed Courses Yet
                      </h3>
                      <p className="text-xs text-zinc-500 max-w-sm">
                        Complete a course and pass the final exam to see it
                        appear here.
                      </p>
                      <Link
                        href="/courses"
                        className="mt-2 px-6 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:bg-blue-700 transition-all active:scale-95"
                      >
                        Browse Courses
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Certificates */}
              {activeTab === "certificates" && (
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    My Certificates ({certificates.length})
                  </h3>

                  {certificates.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {certificates.map((cert, idx) => (
                        <div
                          key={cert._id || idx}
                          className="p-6 rounded-3xl bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-800/30 shadow-sm flex flex-col gap-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center shadow-sm">
                              <Award className="w-6 h-6" />
                            </div>
                            <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                              <BadgeCheck className="w-3 h-3" />
                              Verified
                            </span>
                          </div>

                          <div>
                            <h4 className="font-extrabold text-base text-foreground leading-snug">
                              {cert.courseId?.title || "Course Certificate"}
                            </h4>
                            <p className="text-xs text-zinc-500 font-medium mt-1">
                              Issued on{" "}
                              {cert.issueDate
                                ? new Date(cert.issueDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )
                                : "N/A"}
                            </p>
                          </div>

                          {cert.certificateUrl && <div className="flex items-end justify-between gap-3"><div className="flex flex-col items-start gap-2"><a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:underline dark:text-amber-400"><span>View Certificate</span><ChevronRight className="h-3.5 w-3.5" /></a><button type="button" onClick={() => downloadCertificate(cert)} disabled={downloadingCertificate === cert._id || !Number.isFinite(cert.score) || !cert.total} className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-3.5 w-3.5" />{downloadingCertificate === cert._id ? "Generating…" : "Download PDF"}</button></div><img src={`/api/certificate-qr?data=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || "https://asif.to"}${cert.certificateUrl}`)}`} alt="QR code to verify certificate" className="h-16 w-16 rounded-lg border border-amber-200 bg-white p-1" /></div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-sm text-center flex flex-col items-center gap-3 border border-zinc-100 dark:border-zinc-800">
                      <Award className="w-10 h-10 text-zinc-200 dark:text-zinc-700" />
                      <h3 className="font-extrabold text-base text-foreground">
                        No Certificates Yet
                      </h3>
                      <p className="text-xs text-zinc-500 max-w-sm">
                        Pass the final proctored exam of any course to earn your
                        verified certificate.
                      </p>
                      <Link
                        href="/quiz"
                        className="mt-2 px-6 py-2.5 rounded-full bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-500/25 hover:bg-amber-600 transition-all active:scale-95"
                      >
                        Go to Exams
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Quiz & Revision */}
              {activeTab === "quiz" && (
                <div className="space-y-5">
                  <div><h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-zinc-400"><BookOpen className="h-4 w-4 text-blue-500" />Quiz attempts ({quizAttempts.length})</h3>{quizAttempts.length ? <div className="space-y-3">{[...quizAttempts].reverse().map((attempt) => <div key={attempt._id} className="flex flex-col gap-4 rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 sm:flex-row sm:items-center"><div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${attempt.passed ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"}`}>{attempt.percentage}%</div><div className="min-w-0 flex-1"><h4 className="font-bold text-foreground">{attempt.courseId?.title || "Course quiz"}</h4><p className="mt-1 text-xs text-zinc-500">{attempt.score}/{attempt.total} correct · {attempt.passed ? "Passed" : "Not passed"} · {new Date(attempt.attemptedAt).toLocaleDateString()}</p>{attempt.certificateId && <Link href={`/certificates/${attempt.certificateId}`} className="mt-2 inline-flex text-xs font-bold text-emerald-600 hover:underline">View earned certificate</Link>}</div><label className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300"><span>Public score</span><input type="checkbox" checked={attempt.visibility === "public"} disabled={updatingPrivacy} onChange={(event) => changeScorePrivacy(attempt._id, event.target.checked ? "public" : "private")} className="h-4 w-4 accent-blue-600" /></label></div>)}</div> : <p className="rounded-3xl bg-white p-8 text-center text-sm text-zinc-500 dark:bg-zinc-900">Your logged-in quiz attempts will appear here.</p>}</div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="p-6 rounded-4xl bg-white dark:bg-zinc-900/90 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h3 className="font-extrabold text-base text-foreground">
                        Interactive Practice Quizzes
                      </h3>
                      <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                        Test your JavaScript, React, Next.js, and Node.js
                        knowledge with real-time feedback and explanations.
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
                      <h3 className="font-extrabold text-base text-foreground">
                        Flashcard Revision Deck
                      </h3>
                      <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                        Quickly review key full-stack concepts, syntax
                        definitions, and interview questions on the go.
                      </p>
                    </div>
                    <Link
                      href="/revision"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-500/25 hover:bg-purple-700 transition-all active:scale-95 w-full sm:w-auto"
                    >
                      <span>Practice Flashcards</span>
                    </Link>
                  </div>
                </div></div>
              )}

              {/* My Articles */}
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
                      <h3 className="font-extrabold text-base text-foreground">
                        No Published Articles Yet
                      </h3>
                      <p className="text-xs text-zinc-500 max-w-sm">
                        Share your technical insights, tutorials, and coding
                        notes with the asif.to community.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Logout Modal Confirmation */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 sm:p-7 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-foreground">
              Sign Out of asif.to?
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Are you sure you want to log out? Your saved bookmarks and
              learning progress will remain safely synced.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleLogout}
                disabled={isSigningOut}
                className="flex-1 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSigningOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Yes, Sign Out"
                )}
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
