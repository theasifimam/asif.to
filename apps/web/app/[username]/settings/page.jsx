"use client";

import React from "react";
import LogoLoader from "@/components/ui/LogoLoader";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useProfileSettingsForm } from "@/components/settings/useProfileSettingsForm";
import SettingsHeader from "@/components/settings/SettingsHeader";
import ProfileInfoSection from "@/components/settings/ProfileInfoSection";
import SocialsSection from "@/components/settings/SocialsSection";
import NotificationsSection from "@/components/settings/NotificationsSection";
import PrivacySection from "@/components/settings/PrivacySection";
import SecuritySection from "@/components/settings/SecuritySection";
import SettingsSaveBar from "@/components/settings/SettingsSaveBar";
import SecurityInfoCard from "@/components/settings/SecurityInfoCard";

export default function ProfileSettingsPage() {
  const {
    username,
    storeUser,
    profileRes,
    profileLoading,
    isUpdating,
    openSections,
    toggleSection,
    expandAll,
    collapseAll,
    formData,
    setFormData,
    handleInputChange,
    avatarPreview,
    handleAvatarChange,
    handleSubmit,
    socialsConnectedCount,
  } = useProfileSettingsForm();

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <LogoLoader className="h-14 w-14 sm:h-16 sm:w-16 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground flex flex-col transition-colors duration-300 pb-28 sm:pb-20">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-6">
        {/* Top Header & Breadcrumb */}
        <SettingsHeader
          username={username}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
        />

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="rounded-[2.5rem] bg-white dark:bg-zinc-900/95 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md divide-y divide-zinc-100 dark:divide-zinc-800/80 overflow-hidden">
            {/* 1. Profile & Photo Section */}
            <ProfileInfoSection
              isOpen={openSections.profile}
              onToggle={() => toggleSection("profile")}
              formData={formData}
              onInputChange={handleInputChange}
              avatarPreview={avatarPreview}
              onAvatarChange={handleAvatarChange}
            />

            {/* 2. Socials & Online Presence Section */}
            <SocialsSection
              isOpen={openSections.socials}
              onToggle={() => toggleSection("socials")}
              formData={formData}
              onInputChange={handleInputChange}
              socialsConnectedCount={socialsConnectedCount}
            />

            {/* 3. Notifications & Updates Section */}
            <NotificationsSection
              isOpen={openSections.notifications}
              onToggle={() => toggleSection("notifications")}
              formData={formData}
              setFormData={setFormData}
            />

            {/* 4. Privacy & Visibility Section */}
            <PrivacySection
              isOpen={openSections.privacy}
              onToggle={() => toggleSection("privacy")}
              formData={formData}
              setFormData={setFormData}
            />

            {/* 5. Account Security & Danger Zone Section */}
            <SecuritySection
              isOpen={openSections.security}
              onToggle={() => toggleSection("security")}
              user={profileRes?.data?.user || storeUser}
            />
          </div>

          {/* Sticky Actions Bar */}
          <SettingsSaveBar username={username} isUpdating={isUpdating} />
        </form>

        {/* Security Info Card */}
        <SecurityInfoCard />
      </main>

      <Footer />
    </div>
  );
}
