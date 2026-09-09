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
  if (items.length) return items.map((item) => ({
    label: item.slug === "software-development" ? "Web & Software Development" : item.name,
    value: item.slug,
    count: item.count,
  }));
  return fallback.map((item) => ({ label: item, value: item.toLowerCase().replaceAll(" ", "-") }));
}

function JobsFiltersForm({ values = {}, taxonomy = {}, fixed = {} }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [keyword, setKeyword] = useState(values.keyword || "");
  const [location, setLocation] = useState(values.location || "all");
  const [category, setCategory] = useState(values.category || "all");
  const [employmentType, setEmploymentType] = useState(values.employmentType || "all");
  const [workMode, setWorkMode] = useState(values.workMode || "all");
  const [experienceLevel, setExperienceLevel] = useState(values.experienceLevel || "all");
  const [datePosted, setDatePosted] = useState(values.datePosted || "all");
  const [salaryMin, setSalaryMin] = useState(values.salaryMin || "");
  const [salaryMax, setSalaryMax] = useState(values.salaryMax || "");
  const locationOptions = taxonomyOptions(taxonomy.locations, taxonomy.availableLocations);
  const categoryOptions = taxonomyOptions(taxonomy.categories, taxonomy.availableCategories);

  // Analytics event recording
  useEffect(() => {
    const active = Object.entries(values).filter(
      ([key, value]) => value && !["page", "sort"].includes(key)
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
    if (!fixed.location && location && location !== "all") query.set("location", location);
    if (!fixed.category && category && category !== "all") query.set("category", category);
    if (employmentType && employmentType !== "all") query.set("employmentType", employmentType);
    if (workMode && workMode !== "all") query.set("workMode", workMode);
    if (experienceLevel && experienceLevel !== "all") query.set("experienceLevel", experienceLevel);
    if (datePosted && datePosted !== "all") query.set("datePosted", datePosted);
    if (salaryMin) query.set("salaryMin", salaryMin);
    if (salaryMax) query.set("salaryMax", salaryMax);
    if (values.sort && values.sort !== "newest") query.set("sort", values.sort);

    const basePath = fixed.location
      ? `/jobs/location/${fixed.location}`
      : fixed.category
        ? `/jobs/category/${fixed.category}`
        : "/jobs";

    const targetUrl = query.toString() ? `${basePath}?${query.toString()}` : basePath;
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
      className="rounded-4xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-5"
    >
      {fixed.location && <input type="hidden" name="location" value={fixed.location} />}
      {fixed.category && <input type="hidden" name="category" value={fixed.category} />}

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

      {/* Select dropdowns */}
      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
        {!fixed.location && (
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
                <SelectItem
                  key={item.value}
                  value={item.value}
                >
                  {item.label}{Number.isFinite(item.count) ? ` (${item.count})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {!fixed.category && (
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
                <SelectItem
                  key={item.value}
                  value={item.value}
                >
                  {item.label}{Number.isFinite(item.count) ? ` (${item.count})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={employmentType} onValueChange={setEmploymentType}>
          <SelectTrigger
            aria-label="Employment type"
            className="h-11 rounded-2xl bg-zinc-50/80 text-xs font-semibold dark:bg-zinc-950"
          >
            <SelectValue placeholder="Employment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All employment types</SelectItem>
            {(taxonomy.employmentTypes || []).map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={workMode} onValueChange={setWorkMode}>
          <SelectTrigger
            aria-label="Work mode"
            className="h-11 rounded-2xl bg-zinc-50/80 text-xs font-semibold dark:bg-zinc-950"
          >
            <SelectValue placeholder="Work mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All work modes</SelectItem>
            {(taxonomy.workModes || []).map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={experienceLevel} onValueChange={setExperienceLevel}>
          <SelectTrigger
            aria-label="Experience level"
            className="h-11 rounded-2xl bg-zinc-50/80 text-xs font-semibold dark:bg-zinc-950"
          >
            <SelectValue placeholder="Experience level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All experience levels</SelectItem>
            {(taxonomy.experienceLevels || []).map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={datePosted} onValueChange={setDatePosted}>
          <SelectTrigger
            aria-label="Date posted"
            className="h-11 rounded-2xl bg-zinc-50/80 text-xs font-semibold dark:bg-zinc-950"
          >
            <SelectValue placeholder="Date posted" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any date</SelectItem>
            <SelectItem value="day">Past 24 hours</SelectItem>
            <SelectItem value="week">Past week</SelectItem>
            <SelectItem value="month">Past month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Salary inputs */}
      <div className="mt-3 grid grid-cols-2 gap-2">
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

      {/* Action buttons */}
      <Button
        type="submit"
        disabled={isPending}
        loading={isPending}
        className="mt-3.5 h-11 w-full rounded-full bg-blue-600 text-xs font-black text-white shadow-md shadow-blue-600/15 transition hover:bg-blue-700 active:scale-[0.985]"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Find jobs
      </Button>

      <a
        href={clearHref}
        className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[11px] font-bold text-zinc-400 transition hover:text-blue-600 dark:text-zinc-500 dark:hover:text-blue-400"
      >
        <RotateCcw className="h-3 w-3" />
        Clear filters
      </a>
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
