"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  User,
  MapPin,
  Phone,
  Edit3,
  Twitter,
  Linkedin,
  Globe,
  ChevronLeft,
  Save,
  Loader2,
  ShieldCheck,
  Camera,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/lib/api/authApi";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/config";
import { setCredentials } from "@/lib/store/authSlice";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user: storeUser } = useAppSelector(
    (state) => state.auth,
  );
  const username = storeUser?.username;
  const { data: profileRes, isLoading: profileLoading } = useGetProfileQuery(
    undefined,
    {
      skip: !isAuthenticated,
    },
  );
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    location: "",
    mNumber: "",
    socials: {
      twitter: "",
      linkedin: "",
      website: "",
    },
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

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
          website: u.socials?.website || "",
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
      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      const res = await updateProfile(data).unwrap();
      if (res.success) {
        const token = localStorage.getItem("asif_token") || "";
        dispatch(setCredentials({ user: res.data.user, token }));
        toast.success("Profile updated successfully!");
        router.push(`/${username}`);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  const inputClasses =
    "w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 rounded-2xl px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all text-foreground placeholder:text-zinc-400";

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground flex flex-col transition-colors duration-300 pb-28 sm:pb-16">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-6">
        {/* Navigation & Header Banner */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-foreground transition-colors w-fit group"
          >
            <ChevronLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back to Profile</span>
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black font-outfit tracking-tight text-foreground">
                Edit Profile Settings
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                Customize your developer avatar, bio, and social presence.
              </p>
            </div>
            <span className="px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Developer Account</span>
            </span>
          </div>
        </div>

        {/* Main Settings Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Section 1: Visual Avatar */}
          <section className="p-6 sm:p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md border border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-blue-500/20 shadow-xl bg-zinc-100 dark:bg-zinc-800">
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
                    <User size={40} />
                  </div>
                )}

                <label className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200">
                  <Camera className="text-white" size={20} />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
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

              <label className="absolute bottom-0 right-0 w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-900 cursor-pointer transition-transform active:scale-90">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>

            <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1.5 flex-1">
              <h3 className="font-extrabold text-base text-foreground">
                Profile Photo
              </h3>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-md">
                Upload a professional avatar image. Recommended size 400x400px
                (JPG, PNG, or GIF).
              </p>
              <label className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-xs">
                <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                <span>Upload New Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
          </section>

          {/* Section 2: Personal Information */}
          <section className="p-6 sm:p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md border border-zinc-100 dark:border-zinc-800/80 space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <User size={18} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-foreground">
                  Personal Information
                </h2>
                <p className="text-[11px] text-zinc-400 font-medium">
                  Your public name and contact details
                </p>
              </div>
            </div>

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
                  placeholder="e.g. Asif Khan"
                  className={inputClasses}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 ml-1">
                  Phone / Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="mNumber"
                    value={formData.mNumber}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
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
                  placeholder="Full-stack developer building modern React & Node.js web applications..."
                  rows={3}
                  className={`${inputClasses} resize-none leading-relaxed`}
                />
              </div>
            </div>
          </section>

          {/* Section 3: Social & Portfolio Links */}
          <section className="p-6 sm:p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md border border-zinc-100 dark:border-zinc-800/80 space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Globe size={18} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-foreground">
                  Social & Portfolio Connections
                </h2>
                <p className="text-[11px] text-zinc-400 font-medium">
                  Link your public developer channels
                </p>
              </div>
            </div>

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

              <div className="flex flex-col gap-1.5 sm:col-span-2">
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
          </section>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="px-6 py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Info Card */}
        <div className="p-6 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-sm border border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground mb-1">
              Encrypted & Privacy Protected
            </h3>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed">
              Your profile information is securely synced. Only public details
              (name, avatar, location, bio, and social links) are shown on your
              public author page.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
