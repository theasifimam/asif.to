"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";
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
  const [isPending, startTransition] = useTransition();

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

  const handleSubmit = (e) => {
    e?.preventDefault();
    const query = new URLSearchParams();

    if (keyword?.trim()) query.set("keyword", keyword.trim());
    if (!fixed.location && location && location !== "all")
      query.set("location", location);
    if (!fixed.category && category && category !== "all")
      query.set("category", category);
    if (employmentType && employmentType !== "all")
      query.set("employmentType", employmentType);
    if (workMode && workMode !== "all") query.set("workMode", workMode);
    if (experienceLevel && experienceLevel !== "all")
      query.set("experienceLevel", experienceLevel);
    if (datePosted && datePosted !== "all") query.set("datePosted", datePosted);
    if (salaryMin) query.set("salaryMin", salaryMin);
    if (salaryMax) query.set("salaryMax", salaryMax);
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
            <Select value={location} onValueChange={setLocation}>
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
            <Select value={category} onValueChange={setCategory}>
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
              onClick={() => setWorkMode(mode)}
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
              onClick={() => setEmploymentType(type)}
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
              onClick={() => setExperienceLevel(lvl)}
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
              onClick={() => setDatePosted(value)}
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
            placeholder="Max AED"
            className="h-11 rounded-2xl bg-zinc-50/80 text-xs font-semibold dark:bg-zinc-950"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="pt-1 space-y-2">
        <Button
          type="submit"
          disabled={isPending}
          loading={isPending}
          className="h-12 w-full rounded-full bg-blue-600 text-xs font-black text-white shadow-md shadow-blue-600/15 transition hover:bg-blue-700 active:scale-[0.985] cursor-pointer"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Apply filters
        </Button>

        <a
          href={clearHref}
          className="flex items-center justify-center gap-1.5 text-center text-[11px] font-bold text-zinc-400 transition hover:text-blue-600 dark:text-zinc-500 dark:hover:text-blue-400 py-1"
        >
          <RotateCcw className="h-3 w-3" />
          Reset all filters
        </a>
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
