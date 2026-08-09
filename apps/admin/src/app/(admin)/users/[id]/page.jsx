"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Mail,
  Calendar,
  FileText,
  FileEdit,
  Eye,
  Shield,
  User as UserIcon,
  Ban,
  CheckCircle2,
  Key,
  Trash2,
  MapPin,
  Globe,
  ArrowRight,
  Settings,
  Edit3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

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
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@/components/ui";

const ROLE_CONFIG = {
  admin: {
    label: "Administrator",
    color: "text-rose-500",
    bg: "bg-rose-500/5",
    ring: "ring-rose-500/20",
    icon: Shield,
  },
  editor: {
    label: "Editor",
    color: "text-blue-500",
    bg: "bg-blue-500/5",
    ring: "ring-blue-500/20",
    icon: FileEdit,
  },
  author: {
    label: "Author",
    color: "text-emerald-500",
    bg: "bg-emerald-500/5",
    ring: "ring-emerald-500/20",
    icon: FileText,
  },
  reader: {
    label: "Reader",
    color: "text-zinc-500",
    bg: "bg-zinc-500/5",
    ring: "ring-zinc-500/20",
    icon: UserIcon,
  },
};

const STATUS_CONFIG = {
  active: {
    label: "Active",
    dot: "bg-emerald-500",
    text: "text-emerald-500",
    bg: "bg-emerald-500/5",
  },
  suspended: {
    label: "Suspended",
    dot: "bg-rose-500",
    text: "text-rose-500",
    bg: "bg-rose-500/5",
  },
  pending: {
    label: "Pending",
    dot: "bg-amber-500",
    text: "text-amber-500",
    bg: "bg-amber-500/5",
  },
};

const STORAGE_URL =
  process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:5000";

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser, checkUser } = useAuth();

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

  // Still using axios for articles for now, or could create articleApi
  const [recentArticles, setRecentArticles] = useState([]);
  const [stats, setStats] = useState({
    articles: 0,
    drafts: 0,
    totalViews: 0,
  });
  const [articlesLoading, setArticlesLoading] = useState(false);

  const user = userResponse?.data?.user;

  // Modal visible states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPwOpen, setIsPwOpen] = useState(false);

  const [confirmAction, setConfirmAction] = useState(null);

  const fetchArticles = useCallback(async () => {
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
        const newStatus = user.status === "active" ? "suspended" : "active";
        await updateStatus({ id, status: newStatus }).unwrap();
        toast.success(`User state updated to ${newStatus}`);
      } else if (type === "delete") {
        await deleteUser(id).unwrap();
        toast.success("User record purged");
        router.push("/users");
        return;
      } else if (type === "role") {
        await updateRole({ id, role: data.role }).unwrap();
        toast.success(`Access level updated to ${data.role}`);
      }

      if (currentUser?._id === id) await checkUser();
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
      if (currentUser?._id === id) await checkUser();
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

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) return <LoadingSkeleton />;

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
      className="min-h-screen bg-[#fafafa] dark:bg-black text-zinc-900 dark:text-zinc-400 font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black"
    >
      {/* Minimal Top Nav */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/users")}
            className="group flex items-center gap-2 -ml-3 hover:bg-transparent text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all font-medium"
          >
            <ChevronLeft
              size={18}
              className="transition-transform group-hover:-translate-x-1"
            />
            <span>Users</span>
          </Button>

          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-100 dark:border-zinc-800 ${statusConf.bg}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${statusConf.text}`}
              >
                {statusConf.label}
              </span>
            </div>
            <Button
              onClick={() => setIsEditOpen(true)}
              className="h-9 px-6 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-xl shadow-zinc-900/10 dark:shadow-none"
            >
              <Edit3 size={14} />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
        {/* Hero Section */}
        <header className="flex flex-col md:flex-row items-center md:items-end gap-8 pb-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-linear-to-tr from-zinc-200 to-transparent dark:from-zinc-800 rounded-[2.5rem] -rotate-3 group-hover:rotate-0 transition-transform duration-500" />
            <Avatar className="w-44 h-44 rounded-[2.5rem] border-8 border-white dark:border-zinc-900 shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-[1.02] overflow-hidden">
              <AvatarImage src={avatarUrl || ""} className="object-cover" />
              <AvatarFallback className="text-4xl font-bold bg-zinc-50 dark:bg-zinc-800 text-zinc-400">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 text-center md:text-left space-y-3 pb-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight dark:text-white leading-none whitespace-nowrap">
                {user.fullName}
              </h1>
              <Badge
                className={`${roleConf.bg} ${roleConf.color} ${roleConf.ring} ring-1 border-none rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest`}
              >
                {roleConf.label}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-zinc-500 font-medium">
              <div className="flex items-center gap-2 font-bold">
                <Mail size={16} /> {user.email}
              </div>
              <div className="flex items-center gap-2 uppercase text-[10px] tracking-widest">
                <MapPin size={16} /> {user.location || "Remote Node"}
              </div>
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-zinc-300" />{" "}
                <span className="opacity-60">@{user.username}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatBox
            label="Total Articles"
            value={stats.articles}
            icon={FileText}
            trend="+2.4%"
          />
          <StatBox label="Active Drafts" value={stats.drafts} icon={FileEdit} />
          <StatBox
            label="Cumulative Views"
            value={stats.totalViews}
            icon={Eye}
          />
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Bio & Expertise */}
          <div className="lg:col-span-8 space-y-10">
            <section className="space-y-6">
              <SectionHeader title="Biography" />
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-4xl p-10 shadow-sm relative overflow-hidden group min-h-50">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <UserIcon size={120} />
                </div>
                <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium relative z-10">
                  {user.bio ||
                    "No biography provided for this user. Their professional narrative remains a draft."}
                </p>
                {user.expertise && user.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-10 relative z-10">
                    {user.expertise.map((exp) => (
                      <span
                        key={exp}
                        className="px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-[11px] font-black uppercase tracking-wider text-zinc-500 border border-zinc-100 dark:border-zinc-800"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <SectionHeader title="Recent Articles" />
                <Button
                  variant="link"
                  className="text-zinc-400 hover:text-zinc-900 font-bold transition-all h-auto p-0 text-[10px] uppercase tracking-widest"
                >
                  Browse All
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {recentArticles.length > 0 ? (
                  recentArticles.map((article, i) => (
                    <motion.div
                      key={article._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center gap-6 shadow-sm hover:translate-x-1"
                    >
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 shadow-inner">
                        <img
                          src={article.image}
                          alt=""
                          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight group-hover:text-black dark:group-hover:text-white transition-colors truncate">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                          <span>
                            {format(new Date(article.createdAt), "MMM d, yyyy")}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} />{" "}
                            {article.readCount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                        <ArrowRight size={18} />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl py-20 text-center text-zinc-400 font-bold uppercase tracking-[0.2em] text-[11px]">
                    User has no published articles
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right: Security & Identity Overrides */}
          <aside className="lg:col-span-4 space-y-10">
            <section className="space-y-6">
              <SectionHeader title="System Identity" />
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] p-8 space-y-8 shadow-sm">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Clearance Role
                  </label>
                  <Select
                    value={user.role}
                    onValueChange={(val) =>
                      setConfirmAction({
                        type: "role",
                        isOpen: true,
                        title: "Authorize Level Shift?",
                        description: `Elevate or reduce user clearance to '${val}'?`,
                        variant: "warning",
                        data: { role: val },
                      })
                    }
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 font-bold text-sm focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800">
                      <SelectItem value="reader">Reader Only</SelectItem>
                      <SelectItem value="author">
                        Contributing Author
                      </SelectItem>
                      <SelectItem value="editor">Editor-in-Chief</SelectItem>
                      <SelectItem value="admin">System Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Security Credentials
                  </label>
                  <Button
                    variant="outline"
                    onClick={() => setIsPwOpen(true)}
                    className="w-full h-14 rounded-2xl border-zinc-100 dark:border-zinc-800 gap-3 font-black uppercase tracking-widest text-[10px] hover:bg-zinc-50 dark:hover:bg-zinc-950 bg-white dark:bg-transparent shadow-sm transition-all"
                  >
                    <Key size={16} />
                    Rotate Password Cipher
                  </Button>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Joined Lifecycle
                  </label>
                  <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                      <span className="text-zinc-400">Registration</span>
                      <span className="text-zinc-600 dark:text-zinc-300">
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                      <span className="text-zinc-400">Engagement</span>
                      <span className="text-zinc-600 dark:text-zinc-300">
                        {user.lastLogin
                          ? format(new Date(user.lastLogin), "MMM d, yyyy")
                          : "Null"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <SectionHeader title="Danger Zone" />
              <div className="bg-rose-50/30 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/20 rounded-[2rem] p-8 space-y-4">
                <Button
                  variant={user.status === "active" ? "destructive" : "default"}
                  onClick={() =>
                    setConfirmAction({
                      type: "suspend",
                      isOpen: true,
                      title:
                        user.status === "active"
                          ? "Suspend System Access?"
                          : "Restore System Access?",
                      description:
                        user.status === "active"
                          ? "User will be blocked from all nodes."
                          : "Re-authorizing user access.",
                      variant:
                        user.status === "active" ? "destructive" : "default",
                    })
                  }
                  className={`w-full h-14 rounded-2xl gap-3 font-black uppercase tracking-widest text-[10px] ${user.status === "active" ? "bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-500/20 border-none" : ""}`}
                >
                  {user.status === "active" ? (
                    <>
                      <Ban size={16} /> Suspend Operations
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Activate Protocol
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() =>
                    setConfirmAction({
                      type: "delete",
                      isOpen: true,
                      title: "Delete User Permanently?",
                      description:
                        "This will purge all user metadata. There is no recovery sequence.",
                      variant: "destructive",
                    })
                  }
                  className="w-full h-14 rounded-2xl gap-3 font-black uppercase tracking-widest text-[10px] text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                >
                  <Trash2 size={16} />
                  Purge Data Record
                </Button>
              </div>
            </section>
          </aside>
        </div>
      </main>

      <AnimatePresence>
        {confirmAction && (
          <ConfirmDialog
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

function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 whitespace-nowrap">
        {title}
      </h2>
      <div className="h-[1px] w-full bg-zinc-100 dark:bg-zinc-900" />
    </div>
  );
}

function StatBox({ label, value, icon: Icon, trend }) {
  return (
    <div className="relative bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] p-8 shadow-sm group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between overflow-hidden">
      <div className="space-y-4 flex-1">
        <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            {label}
          </h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-outfit dark:text-white">
              {value.toLocaleString()}
            </span>
            {trend && (
              <span className="text-emerald-500 text-[10px] font-black">
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        <Icon size={120} />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black p-10 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <div className="flex items-end gap-8">
          <Skeleton className="w-44 h-44 rounded-[2.5rem]" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-12 w-1/3 rounded-xl" />
            <Skeleton className="h-4 w-1/4 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-[2rem]" />
          <Skeleton className="h-32 rounded-[2rem]" />
          <Skeleton className="h-32 rounded-[2rem]" />
        </div>
      </div>
    </div>
  );
}
