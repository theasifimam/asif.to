"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Button,
  Input,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  User as UserIcon,
  Mail,
  Camera,
  Loader2,
  Lock,
  AtSign,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const STORAGE_URL =
  process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:5000";

export default function ProfilePage() {
  const { user, loading: authLoading, checkUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setUsername(user.username || "");
      setEmail(user.email || "");

      // Handle profile picture URL correctly from user object
      const avatarUrl = user.avatar
        ? user.avatar.startsWith("http")
          ? user.avatar
          : `${STORAGE_URL}${user.avatar}`
        : user?.profilePicture?.url || null;
      setPreviewUrl(avatarUrl);
    }
  }, [user]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("username", username);
      if (selectedImage) {
        formData.append("avatar", selectedImage);
      }

      await api.patch("/users/me/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profile records synchronized");
      // Refresh the session context to update UI everywhere
      await checkUser();
      setSelectedImage(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update profile protocol",
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Cipher mismatch: confirmation unsuccessful");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.patch("/auth/update-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Security cipher rotated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to rotate security cipher",
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-zinc-900 border-t-[#E2FF54] rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 italic">
            Accessing Personnel Files...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-300 mx-auto flex flex-col gap-6 md:gap-10 font-sans">
      {/* Header Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 md:gap-4 mt-2 md:mt-0"
      >
        <div className="flex items-center gap-3 md:gap-4">
          <span className="w-8 md:w-12 h-px bg-zinc-300 dark:bg-zinc-800"></span>
          <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500 italic">
            Personnel Configuration
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
          Identity Settings.
        </h1>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Visual Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 lg:sticky lg:top-12"
        >
          <div className="p-6 md:p-8 rounded-4xl md:rounded-[2.5rem] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center gap-6 shadow-2xl shadow-black/5 dark:shadow-none">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-all duration-700 opacity-60"></div>
              <Avatar className="w-32 h-32 md:w-48 md:h-48 border-4 md:border-[6px] border-white dark:border-zinc-900 shadow-2xl overflow-hidden relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
                <AvatarImage src={previewUrl || ""} className="object-cover" />
                <AvatarFallback className="text-3xl md:text-5xl font-black bg-zinc-100 dark:bg-zinc-900 text-zinc-400">
                  {getInitials(fullName || user?.fullName || "")}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 md:bottom-2 md:right-2 p-2 md:p-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg md:rounded-xl shadow-2xl hover:scale-110 active:scale-95 transition-all z-20 border-2 md:border-4 border-white dark:border-zinc-900"
              >
                <Camera size={16} className="md:w-5 md:h-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-2">
                  <ShieldCheck size={12} />
                  Verified Personnel
                </span>
              </div>
              <h2 className="text-3xl font-black font-outfit uppercase tracking-tight text-zinc-900 dark:text-white leading-none italic">
                {fullName || "Incomplete Profile"}
              </h2>
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
                Global Access Role: {user?.role || "Restricted"}
              </span>
            </div>

            <div className="w-full h-px bg-zinc-100 dark:bg-zinc-900 mt-2"></div>

            <div className="flex flex-col gap-4 w-full text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Node Identifier
                </span>
                <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-300">
                  0x{user?._id?.slice(-8) || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Clearance Level
                </span>
                <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-tight">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Information Forms */}
        <div className="lg:col-span-8 flex flex-col gap-12">
          {/* General Information Form */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleUpdateProfile}
            className="flex flex-col gap-6 md:gap-8 p-6 md:p-8 bg-white dark:bg-zinc-900/30 rounded-4xl md:rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <UserIcon size={120} />
            </div>

            <div className="flex flex-col gap-2 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white">
                  <UserIcon size={20} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tighter italic">
                  General Identity.
                </h3>
              </div>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                Update your core identification markers across the network.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Legal Name
                  </label>
                  <UserIcon size={12} className="text-zinc-300" />
                </div>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-white transition-all text-[13px] font-bold tracking-tight uppercase"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Alias String (Username)
                  </label>
                  <AtSign size={12} className="text-zinc-300" />
                </div>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-white transition-all text-[13px] font-bold tracking-tight"
                  placeholder="handle"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 opacity-50 relative z-10">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Primary Transmission Hub (Email)
                </label>
                <Lock size={12} />
              </div>
              <Input
                value={email}
                disabled
                className="h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 cursor-not-allowed text-[13px] font-bold"
              />

              <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest text-right px-2 italic">
                Immutable Record Locked
              </span>
            </div>

            <Button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full md:w-fit self-end px-8 py-3.5 h-auto rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-black/10 dark:shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
            >
              {isUpdatingProfile ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Sync Identity Protocol"
              )}
            </Button>
          </motion.form>

          {/* Security/Password Form */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleUpdatePassword}
            className="flex flex-col gap-6 md:gap-8 p-6 md:p-8 bg-white dark:bg-zinc-900/30 rounded-4xl md:rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Lock size={120} />
            </div>

            <div className="flex flex-col gap-2 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white">
                  <Lock size={20} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tighter italic">
                  Security Ciphers.
                </h3>
              </div>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                Rotate your encrypted access protocols to maintain network
                integrity.
              </p>
            </div>

            <div className="flex flex-col gap-3 relative z-10 max-w-md">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Active Cipher (Current)
                </label>
              </div>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-white transition-all text-[13px]"
                placeholder="••••••••••••"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    New Protocol Key
                  </label>
                </div>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-white transition-all text-[13px]"
                  placeholder="••••••••••••"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Confirm Rotation
                  </label>
                </div>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-white transition-all text-[13px]"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="secondary"
              disabled={isUpdatingPassword}
              className="w-full md:w-fit self-end px-8 py-3.5 h-auto rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all border-none"
            >
              {isUpdatingPassword ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Rotate Security Cipher"
              )}
            </Button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
