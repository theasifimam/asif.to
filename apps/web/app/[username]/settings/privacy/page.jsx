"use client";
import PrivacySection from "@/components/settings/PrivacySection";
import SettingsSaveBar from "@/components/settings/SettingsSaveBar";
import { useProfileSettings } from "@/components/settings/ProfileSettingsContext";

export default function PrivacySettingsPage() { const settings = useProfileSettings(); return <form onSubmit={settings.handleSubmit} className="space-y-5"><div className="overflow-hidden rounded-[2.5rem] border border-zinc-200/80 bg-white shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/95"><PrivacySection formData={settings.formData} setFormData={settings.setFormData} /></div><SettingsSaveBar username={settings.username} isUpdating={settings.isUpdating} /></form>; }
