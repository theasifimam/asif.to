"use client";

import React from "react";
import { Bell } from "lucide-react";
import SettingToggle from "./SettingToggle";

export default function NotificationsSection({
  formData,
  setFormData,
}) {
  return (
    <div className="transition-colors">
      <div className="w-full p-5 text-left sm:p-7">
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
      </div>

      <div className="divide-y divide-zinc-100 p-5 pt-0 dark:divide-zinc-800 sm:p-7 sm:pt-0">
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
      </div>
  );
}
