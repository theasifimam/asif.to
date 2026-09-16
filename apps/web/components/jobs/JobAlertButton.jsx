"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Bell, BellRing, Search, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { useAppSelector } from "@/lib/store/hooks";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBottomSheetDrag } from "@/lib/hooks/useBottomSheetDrag";

export default function JobAlertButton({ criteria = {}, taxonomy = {} }) {
  const { requireAuth, isAuthenticated } = useAuthPrompt();
  const user = useAppSelector((state) => state.auth.user);
  const [alertId, setAlertId] = useState(null);
  const [working, setWorking] = useState(false);
  const [open, setOpen] = useState(false);
  const { dragProps, sheetStyle } = useBottomSheetDrag({
    onClose: () => setOpen(false),
  });

  // Local filter options state for interactive configuration inside the sheet
  const [keyword, setKeyword] = useState(criteria.keyword || "");
  const [location, setLocation] = useState(criteria.location || "all");
  const [category, setCategory] = useState(criteria.category || "all");
  const [workMode, setWorkMode] = useState(criteria.workMode || "all");
  const [employmentType, setEmploymentType] = useState(criteria.employmentType || "all");

  // Sync state when dialog opens or incoming criteria changes
  useEffect(() => {
    if (open) {
      setKeyword(criteria.keyword || "");
      setLocation(criteria.location || "all");
      setCategory(criteria.category || "all");
      setWorkMode(criteria.workMode || "all");
      setEmploymentType(criteria.employmentType || "all");
    }
  }, [open, criteria]);

  // Compute active filter criteria payload
  const activeCriteria = {
    keyword: keyword.trim(),
    category: category !== "all" ? category : "",
    location: location !== "all" ? location : "",
    workMode: workMode !== "all" ? workMode : "",
    employmentType: employmentType !== "all" ? employmentType : "",
  };

  const activeCriteriaKey = JSON.stringify(activeCriteria);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get("/jobs/me/alerts").then(({ data }) => {
      const current = data?.data?.find((alert) =>
        Object.entries(activeCriteria).every(([key, value]) => (alert[key] || "") === value),
      );
      setAlertId(current?._id || null);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeCriteriaKey]);

  const openAlertSheet = () => {
    if (!requireAuth()) return;
    setOpen(true);
  };

  const resetFilters = () => {
    setKeyword("");
    setLocation("all");
    setCategory("all");
    setWorkMode("all");
    setEmploymentType("all");
  };

  const toggle = async () => {
    setWorking(true);
    try {
      if (alertId) {
        await api.delete(`/jobs/me/alerts/${alertId}`);
        setAlertId(null);
        setOpen(false);
        toast.success("Job alert turned off");
      } else {
        const { data } = await api.post("/jobs/me/alerts", activeCriteria);
        setAlertId(data?.data?._id || "active");
        setOpen(false);
        toast.success("You’ll be notified when a matching job is posted");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update your job alert");
    } finally {
      setWorking(false);
    }
  };

  // Location & Category options resolution
  const locationOptions = taxonomy?.locations?.length
    ? taxonomy.locations.map((item) => ({ label: item.name, value: item.slug }))
    : [
        { label: "Dubai", value: "dubai" },
        { label: "Abu Dhabi", value: "abu-dhabi" },
        { label: "Sharjah", value: "sharjah" },
        { label: "Ajman", value: "ajman" },
        { label: "Ras Al Khaimah", value: "ras-al-khaimah" },
        { label: "Fujairah", value: "fujairah" },
        { label: "Umm Al Quwain", value: "umm-al-quwain" },
        { label: "Al Ain", value: "al-ain" },
      ];

  const categoryOptions = taxonomy?.categories?.length
    ? taxonomy.categories.map((item) => ({ label: item.name, value: item.slug }))
    : [
        { label: "Web & Software Development", value: "software-development" },
        { label: "Accounting & Finance", value: "accounting-finance" },
        { label: "Sales & Business Development", value: "sales-business-development" },
        { label: "Marketing & Media", value: "marketing-media" },
        { label: "Human Resources", value: "human-resources" },
        { label: "Customer Support & Operations", value: "customer-support" },
        { label: "Engineering & Construction", value: "engineering" },
        { label: "Healthcare & Medical", value: "healthcare" },
        { label: "Hospitality & Tourism", value: "hospitality" },
      ];

  const activeBadges = Object.entries(activeCriteria)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => {
      const formattedKey = key === "keyword" ? "Role" : key.replace(/[A-Z]/g, (l) => ` ${l.toLowerCase()}`);
      return `${formattedKey}: ${value.replaceAll("-", " ")}`;
    });

  return (
    <>
      <button
        type="button"
        onClick={openAlertSheet}
        title="Set up job notifications"
        aria-label="Set up job notifications"
        className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-lg transition hover:-translate-y-0.5 cursor-pointer ${
          alertId
            ? "border-blue-300 bg-blue-600 text-white shadow-blue-600/30"
            : "border-blue-300 bg-blue-600 text-white shadow-blue-600/25 hover:bg-blue-700"
        }`}
      >
        {alertId ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-200 bg-zinc-950/60 backdrop-blur-sm transition-opacity" />
          <Dialog.Content
            style={sheetStyle}
            className="fixed inset-x-0 bottom-0 z-201 mx-auto flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-4xl border border-zinc-200 bg-white text-zinc-950 shadow-2xl outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 sm:max-w-xl sm:rounded-4xl sm:bottom-1/2 sm:-translate-y-1/2 motion-safe:animate-[job-sheet-in_420ms_cubic-bezier(0.16,1,0.3,1)]"
          >
            <div
              className="shrink-0 select-none touch-none cursor-grab active:cursor-grabbing border-b border-zinc-100 dark:border-zinc-800/80"
              {...dragProps}
            >
              {/* Top Drag Handle for mobile */}
              <div className="pt-3 pb-1 flex justify-center shrink-0 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              </div>

              {/* Header */}
              <div className="px-6 pt-2 sm:pt-4 pb-3 flex items-start justify-between">
                <div>
                  <Dialog.Title className="font-outfit text-xl sm:text-2xl font-black tracking-tight">
                    Get notified about matching jobs
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                    We’ll email you automatically when a new published job matches these criteria.
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label="Close"
                    className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Email box */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5 dark:border-blue-900/60 dark:bg-blue-950/30">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Notification email
                </p>
                <p className="mt-0.5 text-xs sm:text-sm font-bold">{user?.email || "Your account email"}</p>
              </div>

              {/* Interactive Filter Options */}
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                    Filter Options
                  </p>
                  {(keyword || location !== "all" || category !== "all" || workMode !== "all" || employmentType !== "all") && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Clear options
                    </button>
                  )}
                </div>

                {/* Keyword / Role search */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                    Keyword / Job Title
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                    <Input
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="e.g. Software Engineer, Accountant, Sales..."
                      className="h-10 rounded-xl bg-zinc-50 pl-9 pr-3 text-xs font-semibold dark:bg-zinc-900 dark:border-zinc-800"
                    />
                  </div>
                </div>

                {/* Location & Category Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">Location</label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger className="h-10 rounded-xl bg-zinc-50 text-xs font-semibold dark:bg-zinc-900 dark:border-zinc-800">
                        <SelectValue placeholder="All UAE locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All UAE locations</SelectItem>
                        {locationOptions.map((loc) => (
                          <SelectItem key={loc.value} value={loc.value}>
                            {loc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-10 rounded-xl bg-zinc-50 text-xs font-semibold dark:bg-zinc-900 dark:border-zinc-800">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {categoryOptions.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Work Mode & Employment Type Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">Work Mode</label>
                    <Select value={workMode} onValueChange={setWorkMode}>
                      <SelectTrigger className="h-10 rounded-xl bg-zinc-50 text-xs font-semibold dark:bg-zinc-900 dark:border-zinc-800">
                        <SelectValue placeholder="All work modes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All work modes</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">Employment Type</label>
                    <Select value={employmentType} onValueChange={setEmploymentType}>
                      <SelectTrigger className="h-10 rounded-xl bg-zinc-50 text-xs font-semibold dark:bg-zinc-900 dark:border-zinc-800">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        <SelectItem value="full-time">Full-Time</SelectItem>
                        <SelectItem value="part-time">Part-Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Selected Filters Badges */}
                <div className="pt-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                    Your Active Alert Filters
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeBadges.length ? (
                      activeBadges.map((badge) => (
                        <span
                          key={badge}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60 capitalize"
                        >
                          {badge}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-500">
                        All UAE Jobs (No specific filter selected)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="p-6 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex gap-3 shrink-0">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="h-11 flex-1 rounded-full border border-zinc-200 text-sm font-bold dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="button"
                onClick={toggle}
                disabled={working}
                className="h-11 flex-1 rounded-full bg-blue-600 text-sm font-black text-white hover:bg-blue-700 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                {working ? "Saving…" : alertId ? "Turn off alert" : "Enable notifications"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
