"use client";

import React from "react";
import Image from "next/image";
import { Camera, ChevronDown, Edit3, MapPin, Phone, User } from "lucide-react";
import { inputClasses } from "./settingsConstants";

export default function ProfileInfoSection({
  isOpen,
  onToggle,
  formData,
  onInputChange,
  avatarPreview,
  onAvatarChange,
}) {
  return (
    <div className="transition-colors">
      <button
        type="button"
        onClick={onToggle}
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
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
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
                    onChange={onAvatarChange}
                  />
                </label>
              </div>

              <label className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-zinc-900 cursor-pointer transition-transform active:scale-90">
                <Camera size={13} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onAvatarChange}
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
                  onChange={onAvatarChange}
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
                onChange={onInputChange}
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
                  onChange={onInputChange}
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
                  onChange={onInputChange}
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
                onChange={onInputChange}
                placeholder="Full-stack developer building modern web applications..."
                rows={3}
                className={`${inputClasses} resize-none leading-relaxed`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
