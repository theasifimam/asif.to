"use client";
import SocialsSection from "@/components/settings/SocialsSection";
import SettingsSaveBar from "@/components/settings/SettingsSaveBar";
import { useProfileSettings } from "@/components/settings/ProfileSettingsContext";

export default function SocialSettingsPage() { const settings = useProfileSettings(); return <form onSubmit={settings.handleSubmit} className="space-y-5"><div className="overflow-hidden rounded-[2.5rem] border border-zinc-200/80 bg-white shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/95"><SocialsSection formData={settings.formData} onInputChange={settings.handleInputChange} socialsConnectedCount={settings.socialsConnectedCount} /></div><SettingsSaveBar username={settings.username} isUpdating={settings.isUpdating} /></form>; }
