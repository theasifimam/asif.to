"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Edit3 } from "lucide-react";
import { toast } from "sonner";

import {
  useGetManagedUserQuery,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
} from "@/redux/services/userApi";
import { AdminPage, AdminPageHeader } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { getModuleBackUrl } from "@/hooks/useModuleHistory";
import { EditUserModal } from "../EditUserModal";
import { PasswordResetModal } from "../PasswordResetModal";
import { useAuth } from "@/contexts/AuthContext";
import {
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
import UserAdminHistory from "./components/UserAdminHistory";

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL;

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, checkUser } = useAuth();
  const returnTo = getModuleBackUrl("/users", searchParams.get("returnTo"));

  const isOwnProfile = currentUser?._id === id;

  // RTK Query hooks
  const { data: userResponse, isLoading: userLoading } =
    useGetManagedUserQuery(id);
  const [updateUser, { isLoading: updateLoading }] = useUpdateUserMutation();
  const [updateRole, { isLoading: roleLoading }] = useUpdateUserRoleMutation();
  const [updateStatus, { isLoading: statusLoading }] =
    useUpdateUserStatusMutation();
  const [deleteUser, { isLoading: deleteLoading }] = useDeleteUserMutation();
  const [resetPassword, { isLoading: resetLoading }] =
    useResetUserPasswordMutation();

  const user = userResponse?.data?.user;
  const recentArticles = userResponse?.data?.recentArticles || [];
  const contentStats = userResponse?.data?.content || [];
  const stats = {
    articles: contentStats.reduce((total, item) => total + item.count, 0),
    drafts: contentStats.find((item) => item._id === "draft")?.count || 0,
    totalViews: contentStats.reduce((total, item) => total + item.views, 0),
  };

  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPwOpen, setIsPwOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const handleAction = async (reason = "") => {
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
        await updateStatus({ id, status: newStatus, reason }).unwrap();
        toast.success(`User state updated to ${newStatus}`);
      } else if (type === "ban") {
        await updateStatus({ id, status: "banned", reason }).unwrap();
        toast.success("User account banned");
      } else if (type === "delete") {
        if (isOwnProfile) {
          toast.error("You cannot delete your own account.");
          setConfirmAction(null);
          return;
        }
        await deleteUser({ id, reason }).unwrap();
        toast.success("User deleted from active users");
        router.push("/users");
        return;
      } else if (type === "role") {
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
  const loading = userLoading;

  if (loading) return <ProfileSkeleton />;
  if (!user) return <ProfileNotFound router={router} />;

  const roleConf =
    ROLE_CONFIG[user.role] ||
    ROLE_CONFIG[user.role?.toLowerCase()] ||
    ROLE_CONFIG.reader;
  const statusConf = STATUS_CONFIG[user.status] || STATUS_CONFIG.active;
  const avatarUrl =
    user.avatar && !user.avatar.includes("ui-avatars.com")
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `${STORAGE_URL}${user.avatar}`
      : null;

  return (
    <AdminPage size="xl">
      <AdminPageHeader
        eyebrow="User Management / Profile"
        title={user.fullName}
        description="View public profile details, clearance authorization level, content dispatches, and administrative audit logs."
        back={
          <Link
            href={returnTo}
            className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors mb-1"
          >
            <ChevronLeft className="h-4 w-4" /> Back to users
          </Link>
        }
        actions={
          <>
            {isOwnProfile && (
              <span className="inline-flex items-center rounded-full bg-emerald-100/90 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                Your Profile
              </span>
            )}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200/80 dark:border-zinc-800 ${statusConf.bg}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
              <span
                className={`text-[10px] font-black uppercase tracking-wider ${statusConf.text}`}
              >
                {statusConf.label}
              </span>
            </div>
            <Button
              onClick={() => setIsEditOpen(true)}
              className="rounded-full font-bold text-xs px-5 shadow-2xs"
            >
              <Edit3 className="mr-1.5 h-3.5 w-3.5" />
              {isOwnProfile ? "Edit My Profile" : "Edit Profile"}
            </Button>
          </>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1 sm:space-y-1"
      >
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 sm:gap-1 items-start">
          {/* Left Column: Published Dispatches / Articles */}
          <div className="lg:col-span-8 space-y-5 sm:space-y-6">
            <ProfileArticlesSection recentArticles={recentArticles} />
          </div>

          {/* Right Column: Clearance & Actions */}
          <ProfileClearanceSidebar
            user={user}
            isOwnProfile={isOwnProfile}
            setConfirmAction={setConfirmAction}
            setIsPwOpen={setIsPwOpen}
            canManageRoles={currentUser?.role === "super_admin"}
          />
        </div>

        {/* Audit & Notes */}
        <UserAdminHistory
          userId={id}
          notes={userResponse?.data?.notes}
          audit={userResponse?.data?.audit}
          isOwnProfile={isOwnProfile}
        />
      </motion.div>

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
            requireReason={confirmAction.requireReason}
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
    </AdminPage>
  );
}
