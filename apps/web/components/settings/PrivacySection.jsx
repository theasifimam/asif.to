"use client";

import React from "react";
import { ChevronDown, Eye } from "lucide-react";
import SettingToggle from "./SettingToggle";

export default function PrivacySection({
  isOpen,
  onToggle,
  formData,
  setFormData,
}) {
  return (
    <div className="transition-colors">
      <button
        type="button"
        onClick={onToggle}
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
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
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
  );
}
