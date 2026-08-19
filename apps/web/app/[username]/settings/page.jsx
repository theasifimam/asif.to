"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  User,
  MapPin,
  Phone,
  Edit3,
  Twitter,
  Linkedin,
  Github,
  Globe,
  ChevronLeft,
  ChevronDown,
  Save,
  Loader2,
  ShieldCheck,
  Camera,
  Bell,
  Eye,
  Shield,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/lib/api/authApi";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/config";
import { setCredentials, setOAuthCredentials } from "@/lib/store/authSlice";
import AccountManagementSettings from "@/components/auth/AccountManagementSettings";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    isAuthenticated,
    isInitialized,
    user: storeUser,
  } = useAppSelector((state) => state.auth);
  const username = storeUser?.username;
  const { data: profileRes, isLoading: profileLoading } = useGetProfileQuery(
    undefined,
    {
      skip: !isAuthenticated,
    },
  );
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // Accordion open/collapse states
  const [openSections, setOpenSections] = useState({
    profile: true,
    socials: true,
    notifications: false,
    privacy: false,
    security: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    setOpenSections({
      profile: true,
      socials: true,
      notifications: true,
      privacy: true,
      security: true,
    });
  };

  const collapseAll = () => {
    setOpenSections({
      profile: false,
      socials: false,
      notifications: false,
      privacy: false,
      security: false,
    });
  };

  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    location: "",
    mNumber: "",
    socials: {
      twitter: "",
      linkedin: "",
      github: "",
      website: "",
    },
    settings: {
      newsletter: true,
      notifications: true,
      profileVisibility: "public",
      showLearningActivity: true,
      showAchievements: true,
    },
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace(`/login?callbackUrl=${encodeURIComponent("/account")}`);
    }
  }, [isAuthenticated, isInitialized, router]);

  useEffect(() => {
    if (profileRes?.data?.user) {
      const u = profileRes.data.user;
      setFormData({
        fullName: u.fullName || "",
        bio: u.bio || "",
        location: u.location || "",
        mNumber: u.mNumber || "",
        socials: {
          twitter: u.socials?.twitter || "",
          linkedin: u.socials?.linkedin || "",
          github: u.socials?.github || "",
          website: u.socials?.website || "",
        },
        settings: {
          newsletter: u.settings?.newsletter ?? true,
          notifications: u.settings?.notifications ?? true,
          profileVisibility: u.settings?.profileVisibility || "public",
          showLearningActivity: u.settings?.showLearningActivity ?? true,
          showAchievements: u.settings?.showAchievements ?? true,
        },
      });
      if (u.avatar) {
        setAvatarPreview(getImageUrl(u.avatar));
      }
    }
  }, [profileRes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("fullName", formData.fullName);
      data.append("bio", formData.bio);
      data.append("location", formData.location);
      data.append("mNumber", formData.mNumber);
      data.append("socials", JSON.stringify(formData.socials));
      data.append("settings", JSON.stringify(formData.settings));
      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      const res = await updateProfile(data).unwrap();
      if (res.success) {
        const token = localStorage.getItem("asif_token") || "";
        dispatch(
          token
            ? setCredentials({ user: res.data.user, token })
            : setOAuthCredentials({ user: res.data.user }),
        );
        toast.success("Profile updated successfully!");
        router.push(`/${username}`);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  const inputClasses =
    "w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all text-foreground placeholder:text-zinc-400";

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  const socialsConnectedCount = Object.values(formData.socials).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground flex flex-col transition-colors duration-300 pb-28 sm:pb-20">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-6">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/${username || ""}`}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-foreground transition-colors w-fit group"
          >
            <ChevronLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back to Profile</span>
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black font-outfit tracking-tight text-foreground">
                Settings & Preferences
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                Manage your public profile, social links, notifications, and security.
              </p>
            </div>

            {/* Quick Accordion Toggles */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={expandAll}
                className="px-3 py-1.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-[11px] font-bold transition-colors cursor-pointer"
              >
                Expand all
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="px-3 py-1.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-[11px] font-bold transition-colors cursor-pointer"
              >
                Collapse all
              </button>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* ============================================================ */}
          {/* SINGLE BIG UNIFIED CARD FOR ALL ACCORDION SECTIONS           */}
          {/* ============================================================ */}
          <div className="rounded-[2.5rem] bg-white dark:bg-zinc-900/95 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md divide-y divide-zinc-100 dark:divide-zinc-800/80 overflow-hidden">
            
            {/* 1. Profile & Photo Section */}
            <div className="transition-colors">
              <button
                type="button"
                onClick={() => toggleSection("profile")}
                className="w-full flex items-center justify-between p-5 sm:p-7 text-left hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-extrabold text-foreground">
                        Personal Identity & Photo
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold">
                        Public Profile
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                      Avatar, full name, phone number, location, and bio.
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-zinc-400 transition-transform duration-200 ${
                    openSections.profile ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSections.profile && (
                <div className="p-5 sm:p-7 pt-0 space-y-6 animate-in fade-in duration-200">
                  {/* Visual Avatar */}
                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60">
                    <div className="relative group shrink-0">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-blue-500/30 shadow-md bg-zinc-100 dark:bg-zinc-800">
                        {avatarPreview ? (
                          <Image
                            src={avatarPreview}
                            alt="Avatar Preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400">
                            <User size={32} />
                          </div>
                        )}

                        <label className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200">
                          <Camera className="text-white" size={18} />
                          <span className="text-[9px] font-bold text-white uppercase">
                            Change
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </label>
                      </div>

                      <label className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-zinc-900 cursor-pointer transition-transform active:scale-90">
                        <Camera size={13} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </div>

                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1 flex-1">
                      <h3 className="font-extrabold text-sm text-foreground">
                        Profile Avatar
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium max-w-md">
                        JPG, PNG, or WebP. Optimal resolution 400x400px.
                      </p>
                      <label className="mt-1.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 text-foreground text-xs font-bold cursor-pointer transition-all border border-zinc-200 dark:border-zinc-600 shadow-xs">
                        <Edit3 className="w-3 h-3 text-blue-500" />
                        <span>Select image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 ml-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g. Asif Imam"
                        className={inputClasses}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 ml-1">
                        Phone Number (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="mNumber"
                          value={formData.mNumber}
                          onChange={handleInputChange}
                          placeholder="+1 555-0199"
                          className={`${inputClasses} pl-10`}
                        />
                        <Phone
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                          size={15}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 ml-1">
                        Location
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="e.g. San Francisco, CA or Remote"
                          className={`${inputClasses} pl-10`}
                        />
                        <MapPin
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                          size={15}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 ml-1">
                        Bio & Learning Goals
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Full-stack developer building modern web applications..."
                        rows={3}
                        className={`${inputClasses} resize-none leading-relaxed`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Socials & Online Presence Section */}
            <div className="transition-colors">
              <button
                type="button"
                onClick={() => toggleSection("socials")}
                className="w-full flex items-center justify-between p-5 sm:p-7 text-left hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                    <Globe size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-extrabold text-foreground">
                        Social & Portfolio Links
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-bold">
                        {socialsConnectedCount > 0
                          ? `${socialsConnectedCount} Connected`
                          : "Optional"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                      Link your GitHub, Twitter, LinkedIn, and personal portfolio.
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-zinc-400 transition-transform duration-200 ${
                    openSections.socials ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSections.socials && (
                <div className="p-5 sm:p-7 pt-0 space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 ml-1">
                        Twitter / X
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="socials.twitter"
                          value={formData.socials.twitter}
                          onChange={handleInputChange}
                          placeholder="twitter.com/username"
                          className={`${inputClasses} pl-10`}
                        />
                        <Twitter
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                          size={15}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 ml-1">
                        LinkedIn Profile
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="socials.linkedin"
                          value={formData.socials.linkedin}
                          onChange={handleInputChange}
                          placeholder="linkedin.com/in/username"
                          className={`${inputClasses} pl-10`}
                        />
                        <Linkedin
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                          size={15}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 ml-1">
                        GitHub Profile
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="socials.github"
                          value={formData.socials.github || ""}
                          onChange={handleInputChange}
                          placeholder="github.com/username"
                          className={`${inputClasses} pl-10`}
                        />
                        <Github
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                          size={15}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 ml-1">
                        Personal Website / Portfolio
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="socials.website"
                          value={formData.socials.website}
                          onChange={handleInputChange}
                          placeholder="https://yourportfolio.dev"
                          className={`${inputClasses} pl-10`}
                        />
                        <Globe
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                          size={15}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Notifications & Updates Section */}
            <div className="transition-colors">
              <button
                type="button"
                onClick={() => toggleSection("notifications")}
                className="w-full flex items-center justify-between p-5 sm:p-7 text-left hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                    <Bell size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-extrabold text-foreground">
                        Notifications & Updates
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold">
                        {formData.settings.newsletter || formData.settings.notifications
                          ? "Active"
                          : "Muted"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                      Manage newsletters, course updates, and system alerts.
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-zinc-400 transition-transform duration-200 ${
                    openSections.notifications ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSections.notifications && (
                <div className="p-5 sm:p-7 pt-0 divide-y divide-zinc-100 dark:divide-zinc-800 animate-in fade-in duration-200">
                  <SettingToggle
                    label="Email Newsletter & Highlights"
                    description="Receive weekly developer guides, tech breakdowns, and new course releases."
                    checked={formData.settings.newsletter}
                    onChange={(checked) =>
                      setFormData((current) => ({
                        ...current,
                        settings: { ...current.settings, newsletter: checked },
                      }))
                    }
                  />
                  <SettingToggle
                    label="Account & Course Activity"
                    description="Get notifications for certificate completions, streak reminders, and quiz results."
                    checked={formData.settings.notifications}
                    onChange={(checked) =>
                      setFormData((current) => ({
                        ...current,
                        settings: { ...current.settings, notifications: checked },
                      }))
                    }
                  />
                </div>
              )}
            </div>

            {/* 4. Privacy & Visibility Section */}
            <div className="transition-colors">
              <button
                type="button"
                onClick={() => toggleSection("privacy")}
                className="w-full flex items-center justify-between p-5 sm:p-7 text-left hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Eye size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-extrabold text-foreground">
                        Privacy & Profile Visibility
                      </h2>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          formData.settings.profileVisibility === "public"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {formData.settings.profileVisibility === "public"
                          ? "Public"
                          : "Private"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                      Control who can view your profile, learning activity, and certs.
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-zinc-400 transition-transform duration-200 ${
                    openSections.privacy ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSections.privacy && (
                <div className="p-5 sm:p-7 pt-0 divide-y divide-zinc-100 dark:divide-zinc-800 animate-in fade-in duration-200">
                  <SettingToggle
                    label="Public Profile"
                    description="Allow visitors to view your public profile at your @username URL."
                    checked={formData.settings.profileVisibility === "public"}
                    onChange={(checked) =>
                      setFormData((current) => ({
                        ...current,
                        settings: {
                          ...current.settings,
                          profileVisibility: checked ? "public" : "private",
                        },
                      }))
                    }
                    icon={Eye}
                  />
                  <SettingToggle
                    label="Show Learning Activity"
                    description="Display public quiz attempts, completed lessons, and study progress."
                    checked={formData.settings.showLearningActivity}
                    disabled={formData.settings.profileVisibility === "private"}
                    onChange={(checked) =>
                      setFormData((current) => ({
                        ...current,
                        settings: {
                          ...current.settings,
                          showLearningActivity: checked,
                        },
                      }))
                    }
                  />
                  <SettingToggle
                    label="Show Certificates & Badges"
                    description="Display verified course certificates on your public profile."
                    checked={formData.settings.showAchievements}
                    disabled={formData.settings.profileVisibility === "private"}
                    onChange={(checked) =>
                      setFormData((current) => ({
                        ...current,
                        settings: {
                          ...current.settings,
                          showAchievements: checked,
                        },
                      }))
                    }
                  />
                </div>
              )}
            </div>

            {/* 5. Account Security & Danger Zone Section */}
            <div className="transition-colors">
              <button
                type="button"
                onClick={() => toggleSection("security")}
                className="w-full flex items-center justify-between p-5 sm:p-7 text-left hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                    <Shield size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-extrabold text-foreground">
                        Account Security & Danger Zone
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold">
                        Security
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                      Change password, active sessions, deactivation, and account deletion.
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-zinc-400 transition-transform duration-200 ${
                    openSections.security ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSections.security && (
                <div className="p-5 sm:p-7 pt-0 animate-in fade-in duration-200">
                  <AccountManagementSettings user={profileRes?.data?.user || storeUser} />
                </div>
              )}
            </div>
          </div>

          {/* Sticky Actions Bar */}
          <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 p-4 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl mt-2">
            <Link
              href={`/${username || ""}`}
              className="px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold transition-all text-center"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isUpdating}
              className="px-7 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="animate-spin" size={15} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Info Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-xs border border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground mb-1">
              Encrypted & Privacy Protected
            </h3>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed">
              Your profile information is securely synced. Only public details
              (name, avatar, location, bio, and connected links) are displayed on your
              public profile.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  icon: Icon,
}) {
  return (
    <label
      className={`flex items-center justify-between gap-5 py-4 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <span className="flex gap-3">
        {Icon && (
          <span className="mt-0.5">
            <Icon size={16} className="text-zinc-400" />
          </span>
        )}
        <span>
          <span className="block text-xs sm:text-sm font-bold">{label}</span>
          <span className="mt-0.5 block text-[11px] sm:text-xs leading-relaxed text-zinc-500">
            {description}
          </span>
        </span>
      </span>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-zinc-200 transition peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 dark:bg-zinc-700">
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </span>
    </label>
  );
}
