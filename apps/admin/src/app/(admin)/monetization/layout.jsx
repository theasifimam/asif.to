"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MonetizationProvider,
  useMonetization,
} from "./MonetizationContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const TABS = [
  { name: "Overview", href: "/monetization" },
  { name: "Ad Controls", href: "/monetization/ad-controls" },
  { name: "Placements", href: "/monetization/placements" },
  { name: "Performance", href: "/monetization/performance" },
  { name: "Recommendations", href: "/monetization/recommendations" },
  { name: "Settings", href: "/monetization/settings" },
];

function MonetizationLayoutInner({ children }) {
  const pathname = usePathname();
  const {
    live,
    days,
    setDays,
    confirmEnable,
    setConfirmEnable,
    patchSettings,
  } = useMonetization();

  const showDaysFilter =
    pathname === "/monetization" ||
    pathname === "/monetization/performance" ||
    pathname === "/monetization/recommendations";

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-3.5 sm:gap-8 sm:p-6 md:p-8 lg:p-10 font-sans text-zinc-900 dark:text-zinc-200">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            asif.to monetization
          </p>
          <h1 className="mt-1 font-outfit text-2xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
            Monetization
          </h1>
          <p className="mt-1.5 max-w-3xl text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Control ad eligibility, placements, provider readiness, traffic context, and recommendations from one module.
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-xs font-bold ${
            live
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-200"
              : "border border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              live ? "bg-emerald-500" : "bg-zinc-400"
            }`}
          />
          {live ? "ADS LIVE" : "ADS DISABLED"}
        </div>
      </header>

      {/* Navigation tabs */}
      <nav
        className="flex max-w-full min-w-0 gap-1 overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-100/70 p-1 dark:border-zinc-800 dark:bg-zinc-900/70 custom-scrollbar"
        aria-label="Monetization sections"
      >
        {TABS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                isActive
                  ? "bg-white text-blue-600 shadow-sm dark:bg-zinc-950 dark:text-blue-400"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Days Range Filter for relevant pages */}
      {showDaysFilter && (
        <div className="flex flex-wrap gap-2">
          {[7, 28, 90].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDays(value)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                days === value
                  ? "bg-blue-600 text-white"
                  : "border border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:border-zinc-300"
              }`}
            >
              {value} days
            </button>
          ))}
        </div>
      )}

      {/* Subpage Content */}
      <div className="flex flex-col gap-6">{children}</div>

      {/* Enable Confirmation Dialog */}
      <Dialog open={confirmEnable} onOpenChange={setConfirmEnable}>
        <DialogContent className="max-w-md rounded-3xl border-zinc-200 p-6 dark:border-zinc-800 dark:bg-[#121215]">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-zinc-950 dark:text-white">
              Enable global advertisements?
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              This permits ad units with valid slot IDs to render across enabled content types.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setConfirmEnable(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setConfirmEnable(false);
                patchSettings({ adsEnabled: true }, "Global ads enabled.");
              }}
            >
              Enable ads
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MonetizationLayout({ children }) {
  return (
    <MonetizationProvider>
      <MonetizationLayoutInner>{children}</MonetizationLayoutInner>
    </MonetizationProvider>
  );
}
