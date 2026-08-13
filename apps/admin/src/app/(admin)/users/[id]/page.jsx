"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
} from "@/redux/services/userApi";
import { EditUserModal } from "../EditUserModal";
import { PasswordResetModal } from "../PasswordResetModal";
import { articlesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  ProfileTopNav,
  ProfileHeroHeader,
  ProfileStatsGrid,
  ProfileBioSection,
  ProfileArticlesSection,
  ProfileClearanceSidebar,
  ProfileSkeleton,
  ProfileNotFound,
  ProfileConfirmDialog,
  ROLE_CONFIG,
  STATUS_CONFIG,
  getInitials,
} from "./components";

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL;

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser, checkUser } = useAuth();

  const isOwnProfile = currentUser?._id === id;

  // RTK Query hooks
  const {
    data: userResponse,
    isLoading: userLoading,
    refetch: refetchUser,
  } = useGetUserByIdQuery(id);
  const [updateUser, { isLoading: updateLoading }] = useUpdateUserMutation();
  const [updateRole, { isLoading: roleLoading }] = useUpdateUserRoleMutation();
  const [updateStatus, { isLoading: statusLoading }] =
    useUpdateUserStatusMutation();
  const [deleteUser, { isLoading: deleteLoading }] = useDeleteUserMutation();
  const [resetPassword, { isLoading: resetLoading }] =
    useResetUserPasswordMutation();

  const [recentArticles, setRecentArticles] = useState([]);
  const [stats, setStats] = useState({
    articles: 0,
    drafts: 0,
    totalViews: 0,
  });
  const [articlesLoading, setArticlesLoading] = useState(false);

  const user = userResponse?.data?.user;

  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPwOpen, setIsPwOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchArticles = useCallback(async () => {
    if (!id) return;
    setArticlesLoading(true);
    try {
      const [articlesRes, draftsRes] = await Promise.all([
        articlesApi.list({ author: id, limit: 5 }),
        articlesApi.list({ author: id, status: "draft", limit: 1 }),
      ]);

      const articlesData = articlesRes.data?.data || articlesRes.data || [];
      const draftsData = draftsRes.data?.data || draftsRes.data || [];

      setRecentArticles(Array.isArray(articlesData) ? articlesData : []);
      const totalViews = (
        Array.isArray(articlesData) ? articlesData : []
      ).reduce((acc, art) => acc + (art.readCount || 0), 0);
      setStats({
        articles:
          articlesRes.data?.pagination?.totalCount || articlesData.length || 0,
        drafts:
          draftsRes.data?.pagination?.totalCount || draftsData.length || 0,
        totalViews: totalViews,
      });
    } catch (err) {
      console.error("Failed to load user production stats", err);
    } finally {
      setArticlesLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleAction = async () => {
    if (!confirmAction || !user) return;
    try {
      const { type, data } = confirmAction;
      if (type === "suspend") {
        if (isOwnProfile) {
          toast.error("You cannot suspend your own account.");
          setConfirmAction(null);
          return;
        }
        const newStatus = user.status === "active" ? "suspended" : "active";
        await updateStatus({ id, status: newStatus }).unwrap();
        toast.success(`User state updated to ${newStatus}`);
      } else if (type === "delete") {
        if (isOwnProfile) {
          toast.error("You cannot delete your own account.");
          setConfirmAction(null);
          return;
        }
        await deleteUser(id).unwrap();
        toast.success("User record purged");
        router.push("/users");
        return;
      } else if (type === "role") {
        if (isOwnProfile) {
          toast.error("You cannot modify your own role clearance.");
          setConfirmAction(null);
          return;
        }
        await updateRole({ id, role: data.role }).unwrap();
        toast.success(`Access level updated to ${data.role}`);
      }

      if (isOwnProfile) await checkUser();
      setConfirmAction(null);
    } catch (err) {
      toast.error(err.data?.message || "Action failed");
    }
  };

  const handleUpdateProfile = async (formData) => {
    try {
      await updateUser({ id, formData }).unwrap();
      toast.success("Profile records synchronized");
      setIsEditOpen(false);
      if (isOwnProfile) await checkUser();
    } catch (err) {
      toast.error(err.data?.message || "Sync failed");
    }
  };

  const handleResetPassword = async (newPassword) => {
    try {
      await resetPassword({ id, newPassword }).unwrap();
      toast.success("Password reset confirmed");
      setIsPwOpen(false);
    } catch (err) {
      toast.error(err.data?.message || "Reset failed");
    }
  };

  const isActionLoading =
    updateLoading ||
    roleLoading ||
    statusLoading ||
    deleteLoading ||
    resetLoading;
  const loading = userLoading || articlesLoading;

  if (loading) return <ProfileSkeleton />;
  if (!user) return <ProfileNotFound router={router} />;

  const roleConf = ROLE_CONFIG[user.role] || ROLE_CONFIG.reader;
  const statusConf = STATUS_CONFIG[user.status] || STATUS_CONFIG.active;
  const avatarUrl = user.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `${STORAGE_URL}${user.avatar}`
    : user?.profilePicture?.url || null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-300 font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300"
    >
      {/* Top Navigation */}
      <ProfileTopNav
        isOwnProfile={isOwnProfile}
        statusConf={statusConf}
        setIsEditOpen={setIsEditOpen}
        router={router}
      />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10 space-y-10">
        {/* Profile Hero Header Card */}
        <ProfileHeroHeader
          user={user}
          avatarUrl={avatarUrl}
          roleConf={roleConf}
          statusConf={statusConf}
          getInitials={getInitials}
        />

        {/* Stats Grid */}
        <ProfileStatsGrid stats={stats} />

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Bio & Articles */}
          <div className="lg:col-span-8 space-y-8">
            <ProfileBioSection user={user} />
            <ProfileArticlesSection recentArticles={recentArticles} />
          </div>

          {/* Right Column: Clearance & Actions */}
          <ProfileClearanceSidebar
            user={user}
            isOwnProfile={isOwnProfile}
            setConfirmAction={setConfirmAction}
            setIsPwOpen={setIsPwOpen}
          />
        </div>
      </main>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmAction && (
          <ProfileConfirmDialog
            isOpen={confirmAction.isOpen}
            onClose={() => setConfirmAction(null)}
            onConfirm={handleAction}
            title={confirmAction.title}
            description={confirmAction.description}
            variant={confirmAction.variant}
            loading={isActionLoading}
            confirmText="Confirm Action"
          />
        )}
      </AnimatePresence>

      {/* Feature Modals */}
      <EditUserModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={user}
        onUpdate={handleUpdateProfile}
        submitting={isActionLoading}
      />

      <PasswordResetModal
        isOpen={isPwOpen}
        onClose={() => setIsPwOpen(false)}
        user={user}
        onReset={handleResetPassword}
        submitting={isActionLoading}
      />
    </motion.div>
  );
}
