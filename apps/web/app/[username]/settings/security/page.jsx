"use client";
import SecuritySection from "@/components/settings/SecuritySection";
import { useProfileSettings } from "@/components/settings/ProfileSettingsContext";

export default function SecuritySettingsPage() {
  const settings = useProfileSettings();
  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-zinc-200/80 bg-white shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/95">
      <SecuritySection
        user={settings.profileRes?.data?.user || settings.storeUser}
      />
    </div>
  );
}
