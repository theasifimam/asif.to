"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthModal from "@/components/auth/AuthModal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { clearCredentials } from "@/lib/store/authSlice";
import {
  useGetProfileQuery,
  useGetPublicProfileQuery,
  useSignoutMutation,
  useGetMySavedItemsQuery,
  useUpdateAttemptVisibilityMutation,
} from "@/lib/api/authApi";
import { useGetArticlesQuery } from "@/lib/api/articlesApi";
import {
  useGetMyLibraryQuery,
  useGetPublicLibraryQuery,
} from "@/lib/api/libraryApi";
import {
  BookMarked,
  Bookmark,
  CheckCircle2,
  Award,
  BookOpen,
  Newspaper,
  MessageSquare,
  LogOut,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// Modular Sub-Components
import ProfileHero from "@/components/profile/ProfileHero";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileTabsNav from "@/components/profile/ProfileTabsNav";
import ProfileLibraryTab from "@/components/profile/ProfileLibraryTab";
import ProfileSavedTab from "@/components/profile/ProfileSavedTab";
import ProfileCoursesTab from "@/components/profile/ProfileCoursesTab";
import ProfileCertificatesTab from "@/components/profile/ProfileCertificatesTab";
import ProfileQuizTab from "@/components/profile/ProfileQuizTab";
import ProfileArticlesTab from "@/components/profile/ProfileArticlesTab";
import ProfilePrivateView from "@/components/profile/ProfilePrivateView";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import ProfileCommunityActivity from "@/components/community/ProfileCommunityActivity";

export default function UserProfileClient({ username }) {
  const cleanParam = decodeURIComponent(username || "")
    .replace(/^@+/, "")
    .trim()
    .toLowerCase();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [, startTransition] = useTransition();

  const dispatch = useAppDispatch();
  const { data: session, status: sessionStatus } = useSession();
  const {
    user: storeUser,
    isAuthenticated,
    isInitialized,
  } = useAppSelector((state) => state.auth);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("signin");
  const [activeTab, setActiveTab] = useState(tabParam || "library");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [signout, { isLoading: isSigningOut }] = useSignoutMutation();

  const {
    data: profileRes,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useGetProfileQuery(undefined, { skip: !isAuthenticated });

  const activeUser = profileRes?.data?.user || storeUser || session?.user;

  const activeUsername = (
    activeUser?.username ||
    storeUser?.username ||
    session?.user?.username ||
    ""
  )
    .trim()
    .toLowerCase();
  const activeUserId = String(
    activeUser?._id ||
      activeUser?.id ||
      storeUser?._id ||
      storeUser?.id ||
      session?.user?.id ||
      "",
  );
  const activeEmail = (
    activeUser?.email ||
    storeUser?.email ||
    session?.user?.email ||
    ""
  )
    .trim()
    .toLowerCase();

  // Robust case-insensitive comparison across username, ID, and email
  const isOwnProfile = Boolean(
    (isAuthenticated || session?.user) &&
      cleanParam &&
      (activeUsername === cleanParam ||
        activeUserId === cleanParam ||
        activeEmail === cleanParam ||
        (session?.user?.name &&
          session.user.name.toLowerCase().replace(/\s+/g, "") === cleanParam)),
  );

  // If viewing someone else, attempt to fetch their public profile
  const { data: publicProfileRes, isLoading: publicProfileLoading } =
    useGetPublicProfileQuery(cleanParam, {
      skip: isOwnProfile || !cleanParam,
    });

  const publicUser = publicProfileRes?.data?.user;
  const user = isOwnProfile ? activeUser : publicUser;

  const isAuthChecking =
    sessionStatus === "loading" || (!isInitialized && !session?.user);
  const isProfileLoading =
    (isAuthenticated && profileLoading && !activeUser) ||
    (!isOwnProfile && publicProfileLoading);
  const isPageLoading = isAuthChecking || isProfileLoading;

  const showRestrictedView = !isPageLoading && !isOwnProfile && !publicUser;

  // Sync tab with URL if query param is set
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Ensure valid tab when switching profile views
  useEffect(() => {
    if (!isOwnProfile && activeTab === "saved") {
      setActiveTab("library");
    }
  }, [isOwnProfile, activeTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    startTransition(() => {
      const params = new URLSearchParams(window.location.search);
      params.set("tab", key);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // Queries
  const { data: savedItemsRes, isLoading: savedItemsLoading } =
    useGetMySavedItemsQuery(undefined, { skip: !isAuthenticated || !isOwnProfile });
  const savedItems = savedItemsRes?.data?.savedItems || [];

  const { data: myLibraryRes, isLoading: myLibraryLoading } =
    useGetMyLibraryQuery(undefined, { skip: !isOwnProfile || !isAuthenticated });
  const { data: publicLibraryRes, isLoading: publicLibraryLoading } =
    useGetPublicLibraryQuery(cleanParam, { skip: isOwnProfile || !cleanParam });

  const libraryData = isOwnProfile
    ? (myLibraryRes?.data || { entries: [], bookmarks: [], collections: [] })
    : { entries: publicLibraryRes?.data?.entries || [], bookmarks: [], collections: [] };
  const libraryEntries = libraryData.entries || [];
  const libraryBookmarks = libraryData.bookmarks || [];
  const libraryCollections = libraryData.collections || [];

  const { data: articlesRes, isLoading: articlesLoading } = useGetArticlesQuery(
    { author: user?._id, status: "published" },
    { skip: !user?._id || activeTab !== "articles" },
  );

  const completedCourses = user?.completedCourses || [];
  const certificates = user?.certificates || [];
  const quizAttempts = user?.quizAttempts || [];
  const [updateAttemptVisibility, { isLoading: updatingPrivacy }] =
    useUpdateAttemptVisibilityMutation();

  const changeScorePrivacy = async (attemptId, visibility) => {
    try {
      await updateAttemptVisibility({ attemptId, visibility }).unwrap();
      await refetchProfile();
      toast.success(`Score is now ${visibility}`);
    } catch (error) {
      toast.error(error?.data?.message || "Unable to update score privacy");
    }
  };

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

  const allTabs = [
    {
      key: "library",
      label: isOwnProfile ? "My Library" : "Library",
      icon: BookMarked,
      badge: libraryEntries.length + libraryBookmarks.length || null,
    },
    {
      key: "saved",
      label: "Saved",
      icon: Bookmark,
      ownOnly: true,
      badge: savedItems.length + (user?.bookmarks?.length || 0) || null,
    },
    {
      key: "courses",
      label: "Completed",
      icon: CheckCircle2,
      badge: completedCourses.length || null,
    },
    {
      key: "certificates",
      label: "Certificates",
      icon: Award,
      badge: certificates.length || null,
    },
    {
      key: "quiz",
      label: "Quiz & Revision",
      icon: BookOpen,
      badge: quizAttempts.length || null,
    },
    {
      key: "articles",
      label: isOwnProfile ? "My Articles" : "Articles",
      icon: Newspaper,
    },
    {
      key: "community",
      label: "Community",
      icon: MessageSquare,
    },
  ];

  const tabs = isOwnProfile ? allTabs : allTabs.filter((t) => !t.ownOnly);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-24 sm:pb-12">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-6">
        {isPageLoading ? (
          <ProfileSkeleton />
        ) : showRestrictedView ? (
          <ProfilePrivateView
            cleanParam={cleanParam}
            isAuthenticated={isAuthenticated}
            onOpenAuth={openAuth}
          />
        ) : (
          <>
            {/* User Profile Hero Card */}
            <ProfileHero
              user={user}
              isOwnProfile={isOwnProfile}
              onOpenLogout={() => setIsLogoutModalOpen(true)}
            />

            {/* Quick Stats Grid */}
            <ProfileStats
              user={user}
              streak={user?.streak || 0}
              libraryCount={libraryEntries.length + libraryBookmarks.length || 0}
              completedCoursesCount={completedCourses.length || 0}
              certificatesCount={certificates.length || 0}
              masteryLevel={user?.masteryLevel || 1}
              onSelectTab={handleTabChange}
            />

            {/* Profile Tabs Navigation */}
            <section className="space-y-4">
              <ProfileTabsNav
                tabs={tabs}
                activeTab={activeTab}
                onSelectTab={handleTabChange}
              />

              {/* Tab Contents */}
              {activeTab === "library" && (
                <ProfileLibraryTab
                  user={user}
                  isOwnProfile={isOwnProfile}
                  entries={libraryEntries}
                  bookmarks={libraryBookmarks}
                  collections={libraryCollections}
                  isLoading={myLibraryLoading || publicLibraryLoading}
                />
              )}

              {activeTab === "saved" && (
                <ProfileSavedTab
                  savedItems={savedItems}
                  savedItemsLoading={savedItemsLoading}
                  bookmarks={user?.bookmarks || []}
                />
              )}

              {activeTab === "courses" && (
                <ProfileCoursesTab completedCourses={completedCourses} />
              )}

              {activeTab === "certificates" && (
                <ProfileCertificatesTab
                  user={user}
                  certificates={certificates}
                />
              )}

              {activeTab === "quiz" && (
                <ProfileQuizTab
                  quizAttempts={quizAttempts}
                  updatingPrivacy={updatingPrivacy}
                  onChangeScorePrivacy={changeScorePrivacy}
                />
              )}

              {activeTab === "articles" && (
                <ProfileArticlesTab
                  articles={articlesRes?.data || []}
                  isLoading={articlesLoading}
                />
              )}

              {activeTab === "community" && (
                <ProfileCommunityActivity username={user?.username} isOwnProfile={isOwnProfile} />
              )}
            </section>
          </>
        )}
      </main>

      {/* Logout Modal Confirmation */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 sm:p-7 shadow-2xl space-y-4 text-center border border-zinc-100 dark:border-zinc-800">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-foreground">
              Sign Out of asif.to?
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Are you sure you want to log out? Your saved bookmarks and learning
              progress will remain safely synced.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleLogout}
                disabled={isSigningOut}
                className="flex-1 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSigningOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Yes, Sign Out"
                )}
              </button>
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95 cursor-pointer"
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
