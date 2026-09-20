"use client";
import ProfileInfoSection from "@/components/settings/ProfileInfoSection";
import SettingsSaveBar from "@/components/settings/SettingsSaveBar";
import { useProfileSettings } from "@/components/settings/ProfileSettingsContext";

export default function ProfileSettingsPage() {
  const settings = useProfileSettings();
  return (
    <form onSubmit={settings.handleSubmit} className="space-y-5">
      <div className="overflow-hidden rounded-[2.5rem] border border-zinc-200/80 bg-white shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/95">
        <ProfileInfoSection
          formData={settings.formData}
          onInputChange={settings.handleInputChange}
          avatarPreview={settings.avatarPreview}
          onAvatarChange={settings.handleAvatarChange}
        />
      </div>
      <SettingsSaveBar
        username={settings.username}
        isUpdating={settings.isUpdating}
      />
    </form>
  );
}
