"use client";

import React from "react";
import { Github, Globe, Linkedin, Twitter } from "lucide-react";
import { inputClasses } from "./settingsConstants";

export default function SocialsSection({
  formData,
  onInputChange,
  socialsConnectedCount,
}) {
  return (
    <div className="transition-colors">
      <div className="w-full p-5 text-left sm:p-7">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
            <Globe size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-foreground">
                Social & Portfolio Links
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-bold">
                {socialsConnectedCount > 0
                  ? `${socialsConnectedCount} Connected`
                  : "Optional"}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              Link your GitHub, Twitter, LinkedIn, and personal portfolio.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5 pt-0 sm:p-7 sm:pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                Twitter / X
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  name="socials.twitter"
                  value={formData.socials.twitter}
                  onChange={onInputChange}
                  placeholder="twitter.com/username"
                  className={`${inputClasses} pl-7`}
                />
                <Twitter
                  className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={15}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                LinkedIn Profile
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  name="socials.linkedin"
                  value={formData.socials.linkedin}
                  onChange={onInputChange}
                  placeholder="linkedin.com/in/username"
                  className={`${inputClasses} pl-7`}
                />
                <Linkedin
                  className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={15}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                GitHub Profile
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  name="socials.github"
                  value={formData.socials.github || ""}
                  onChange={onInputChange}
                  placeholder="github.com/username"
                  className={`${inputClasses} pl-7`}
                />
                <Github
                  className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={15}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                Personal Website / Portfolio
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  name="socials.website"
                  value={formData.socials.website}
                  onChange={onInputChange}
                  placeholder="https://yourportfolio.dev"
                  className={`${inputClasses} pl-7`}
                />
                <Globe
                  className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={15}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
