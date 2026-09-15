"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellRing, Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const API = process.env.NEXT_PUBLIC_API_URL;

function taxonomyOptions(items = [], fallback = []) {
  if (items.length)
    return items.map((item) => ({
      label:
        item.slug === "software-development"
          ? "Web & Software Development"
          : item.name,
      value: item.slug,
      count: item.count,
    }));
  return fallback.map((item) => ({
    label: item,
    value: item.toLowerCase().replaceAll(" ", "-"),
  }));
}

function JobsFiltersForm({ values = {}, taxonomy = {}, fixed = {} }) {
  const router = useRouter();
  const { requireAuth, isAuthenticated } = useAuthPrompt();
  const [isPending, startTransition] = useTransition();
  const [alertId, setAlertId] = useState(null);
  const [alertCriteriaKey, setAlertCriteriaKey] = useState("");
  const [alertWorking, setAlertWorking] = useState(false);

  const [keyword, setKeyword] = useState(values.keyword || "");
  const [location, setLocation] = useState(values.location || "all");
  const [category, setCategory] = useState(values.category || "all");
  const [employmentType, setEmploymentType] = useState(
    values.employmentType || "all",
  );
  const [workMode, setWorkMode] = useState(values.workMode || "all");
  const [experienceLevel, setExperienceLevel] = useState(
    values.experienceLevel || "all",
  );
  const [datePosted, setDatePosted] = useState(values.datePosted || "all");
  const [salaryMin, setSalaryMin] = useState(values.salaryMin || "");
  const [salaryMax, setSalaryMax] = useState(values.salaryMax || "");
  const locationOptions = taxonomyOptions(
    taxonomy.locations,
    taxonomy.availableLocations,
  );
  const categoryOptions = taxonomyOptions(
    taxonomy.categories,
    taxonomy.availableCategories,
  );
  const alertCriteria = {
    keyword: keyword.trim(),
    category: fixed.category || (category !== "all" ? category : ""),
    location: fixed.location || (location !== "all" ? location : ""),
    employmentType: employmentType !== "all" ? employmentType : "",
    workMode: workMode !== "all" ? workMode : "",
    experienceLevel: experienceLevel !== "all" ? experienceLevel : "",
  };
  const alertKey = JSON.stringify(alertCriteria);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get("/jobs/me/alerts").then(({ data }) => {
      const current = data?.data?.find((alert) => Object.entries(alertCriteria).every(([key, value]) => (alert[key] || "") === value));
      setAlertId(current?._id || null);
      setAlertCriteriaKey(alertKey);
    }).catch(() => {});
    // The filter form is remounted when the search changes; this only loads its current alert.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const toggleAlert = async () => {
    if (!requireAuth()) return;
    setAlertWorking(true);
    const activeAlertId = alertId && alertCriteriaKey === alertKey ? alertId : null;
    try {
      if (activeAlertId) {
        await api.delete(`/jobs/me/alerts/${activeAlertId}`);
        setAlertId(null);
        toast.success("Job alert turned off");
      } else {
        const { data } = await api.post("/jobs/me/alerts", alertCriteria);
        setAlertId(data?.data?._id || "active");
        setAlertCriteriaKey(alertKey);
        toast.success("You’ll be notified when a matching job is posted");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update your job alert");
    } finally {
      setAlertWorking(false);
    }
  };

  // Analytics event recording
  useEffect(() => {
    const active = Object.entries(values).filter(
      ([key, value]) => value && !["page", "sort"].includes(key),
    );
    if (!active.length || !API) return;
    fetch(`${API}/jobs/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      keepalive: true,
      body: JSON.stringify({
        event: values.keyword ? "search" : "filter",
        query: values.keyword || "",
        filters: active.map(([key]) => key),
        location: values.location,
        category: values.category,
      }),
    }).catch(() => {});
  }, [values]);

  const applyFilters = (overrides = {}) => {
    const next = {
      keyword,
      location,
      category,
      employmentType,
      workMode,
      experienceLevel,
      datePosted,
      salaryMin,
      salaryMax,
      ...overrides,
    };
    const query = new URLSearchParams();

    if (next.keyword?.trim()) query.set("keyword", next.keyword.trim());
    if (!fixed.location && next.location && next.location !== "all")
      query.set("location", next.location);
    if (!fixed.category && next.category && next.category !== "all")
      query.set("category", next.category);
    if (next.employmentType && next.employmentType !== "all")
      query.set("employmentType", next.employmentType);
    if (next.workMode && next.workMode !== "all") query.set("workMode", next.workMode);
    if (next.experienceLevel && next.experienceLevel !== "all")
      query.set("experienceLevel", next.experienceLevel);
    if (next.datePosted && next.datePosted !== "all") query.set("datePosted", next.datePosted);
    if (next.salaryMin) query.set("salaryMin", next.salaryMin);
    if (next.salaryMax) query.set("salaryMax", next.salaryMax);
    if (values.sort && values.sort !== "newest") query.set("sort", values.sort);

    const basePath = fixed.location
      ? `/jobs/location/${fixed.location}`
      : fixed.category
        ? `/jobs/category/${fixed.category}`
        : "/jobs";

    const targetUrl = query.toString()
      ? `${basePath}?${query.toString()}`
      : basePath;
    startTransition(() => {
      router.push(targetUrl);
    });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    applyFilters();
  };

  const keywordInitialized = useRef(false);
  useEffect(() => {
    if (!keywordInitialized.current) {
      keywordInitialized.current = true;
      return;
    }
    const timer = setTimeout(() => applyFilters(), 450);
    return () => clearTimeout(timer);
  }, [keyword]);

  const clearHref = fixed.location
    ? `/jobs/location/${fixed.location}`
    : fixed.category
      ? `/jobs/category/${fixed.category}`
      : "/jobs";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 sm:rounded-4xl sm:p-5"
    >
      {fixed.location && (
        <input type="hidden" name="location" value={fixed.location} />
      )}
      {fixed.category && (
        <input type="hidden" name="category" value={fixed.category} />
      )}

      {/* Keyword search input */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          name="keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Job title, company, skill…"
          className="h-12 rounded-2xl bg-zinc-50/80 pl-10 pr-4 text-sm font-semibold dark:bg-zinc-950"
        />
      </div>

      {/* Location & Category Selects */}
      <div className="grid grid-cols-1 gap-2.5">
        {!fixed.location && (
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Location</label>
            <Select value={location} onValueChange={(value) => { setLocation(value); applyFilters({ location: value }); }}>
              <SelectTrigger
                aria-label="UAE location"
                className="h-11 rounded-2xl bg-zinc-50/80 text-xs font-semibold dark:bg-zinc-950"
              >
                <SelectValue placeholder="All UAE locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All UAE locations</SelectItem>
                {locationOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                    {Number.isFinite(item.count) ? ` (${item.count})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {!fixed.category && (
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Category</label>
            <Select value={category} onValueChange={(value) => { setCategory(value); applyFilters({ category: value }); }}>
              <SelectTrigger
                aria-label="Category"
                className="h-11 rounded-2xl bg-zinc-50/80 text-xs font-semibold dark:bg-zinc-950"
              >
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categoryOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                    {Number.isFinite(item.count) ? ` (${item.count})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Work Mode Chips */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Work mode</label>
        <div className="flex flex-wrap gap-1.5">
          {["all", ...(taxonomy.workModes || ["on-site", "remote", "hybrid"])].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => { setWorkMode(mode); applyFilters({ workMode: mode }); }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                workMode === mode
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {mode === "all" ? "All" : mode.charAt(0).toUpperCase() + mode.slice(1).replaceAll("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Employment Type Chips */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Employment type</label>
        <div className="flex flex-wrap gap-1.5">
          {["all", ...(taxonomy.employmentTypes || ["full-time", "part-time", "contract", "freelance", "internship"])].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => { setEmploymentType(type); applyFilters({ employmentType: type }); }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                employmentType === type
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1).replaceAll("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Level Chips */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Experience level</label>
        <div className="flex flex-wrap gap-1.5">
          {["all", ...(taxonomy.experienceLevels || ["entry", "mid", "senior", "lead", "executive"])].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => { setExperienceLevel(lvl); applyFilters({ experienceLevel: lvl }); }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                experienceLevel === lvl
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {lvl === "all" ? "All" : lvl.charAt(0).toUpperCase() + lvl.slice(1).replaceAll("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Date Posted Segmented Control */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Date posted</label>
        <div className="grid grid-cols-4 gap-1 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-950">
          {[
            ["all", "Anytime"],
            ["day", "24h"],
            ["week", "Week"],
            ["month", "Month"],
          ].map(([value, labelText]) => (
            <button
              key={value}
              type="button"
              onClick={() => { setDatePosted(value); applyFilters({ datePosted: value }); }}
              className={`rounded-xl py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                datePosted === value
                  ? "bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              {labelText}
            </button>
          ))}
        </div>
      </div>

      {/* Salary inputs */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Monthly Salary (AED)</label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            name="salaryMin"
            type="number"
            min="0"
            step="1000"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            onBlur={() => applyFilters()}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyFilters(); } }}
            placeholder="Min AED"
            className="h-11 rounded-2xl bg-zinc-50/80 text-xs font-semibold dark:bg-zinc-950"
          />
          <Input
            name="salaryMax"
            type="number"
            min="0"
            step="1000"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            onBlur={() => applyFilters()}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyFilters(); } }}
            placeholder="Max AED"
            className="h-11 rounded-2xl bg-zinc-50/80 text-xs font-semibold dark:bg-zinc-950"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="pt-1 space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={toggleAlert}
          disabled={alertWorking}
          className="h-11 w-full rounded-full border-blue-200 text-xs font-black text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/40"
        >
          {alertId && alertCriteriaKey === alertKey ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          {alertWorking ? "Saving alert…" : alertId && alertCriteriaKey === alertKey ? "Job alert active" : "Notify me about matching jobs"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(clearHref)}
          disabled={isPending}
          className="h-9 w-full gap-1.5 border-zinc-200 text-[11px] font-bold text-zinc-500 hover:border-blue-300 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-blue-700 dark:hover:text-blue-400"
        >
          <RotateCcw className="h-3 w-3" />
          Reset all filters
        </Button>
      </div>
    </form>
  );
}

export default function JobsFilters(props) {
  const values = props.values || {};
  const formKey = [
    values.keyword,
    values.location,
    values.category,
    values.employmentType,
    values.workMode,
    values.experienceLevel,
    values.datePosted,
    values.salaryMin,
    values.salaryMax,
  ].join("|");

  return <JobsFiltersForm key={formKey} {...props} />;
}
