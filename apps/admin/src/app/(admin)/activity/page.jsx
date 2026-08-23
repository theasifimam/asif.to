"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminPagination } from "@/components/admin";
import { activityApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

function ActivityRowSkeleton() {
  return (
    <div className="flex gap-3.5 sm:gap-4 border-b border-zinc-100 p-4 sm:p-5 last:border-0 dark:border-zinc-800">
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-4 w-2/3 rounded-md" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        <Skeleton className="h-3 w-1/3 rounded-md" />
      </div>
    </div>
  );
}

const roles = ["all", "author", "editor", "admin", "super_admin"];
const severities = ["all", "info", "important", "critical"];
const entityTypes = [
  "all",
  "article",
  "course",
  "chapter",
  "user",
  "seo_setting",
  "playground_setting",
  "invitation",
];
const tone = {
  info: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  important:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  critical: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};
const timeAgo = (date) => {
  const minutes = Math.floor((Date.now() - new Date(date)) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`;
  return new Date(date).toLocaleDateString();
};

export default function ActivityPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 25,
    actorRole: "all",
    severity: "all",
    entityType: "all",
    search: "",
  });
  const [data, setData] = useState({ activities: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    const result = await activityApi.list(filters);
    if (result.success) setData(result.data.data);
    setLoading(false);
  };
  useEffect(() => {
    const timer = setTimeout(load, filters.search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [filters]);
  const update = (key, value) =>
    setFilters((old) => ({
      ...old,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  return (
    <div className="mx-auto w-full max-w-6xl p-3.5 sm:p-8">
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[.2em] text-blue-600 dark:text-blue-400">
          Operational awareness
        </p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
          Activity log
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-500">
          Meaningful platform changes, newest first.
        </p>
      </div>

      <div className="mb-4 flex flex-col md:flex-row gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-[#121215]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <input
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            placeholder="Search activity"
            className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-xs outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none -mx-3 px-3 md:mx-0 md:px-0 md:overflow-visible">
          <div className="shrink-0 w-32 md:w-36">
            <ActivityFilterSelect
              value={filters.actorRole}
              onChange={(value) => update("actorRole", value)}
              values={roles}
              label="Role"
            />
          </div>
          <div className="shrink-0 w-36">
            <ActivityFilterSelect
              value={filters.entityType}
              onChange={(value) => update("entityType", value)}
              values={entityTypes}
              label="Content type"
            />
          </div>
          <div className="shrink-0 w-32 md:w-36">
            <ActivityFilterSelect
              value={filters.severity}
              onChange={(value) => update("severity", value)}
              values={severities}
              label="Severity"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-[#121215]">
        {loading ? (
          Array.from({ length: filters.limit }).map((_, i) => (
            <ActivityRowSkeleton key={i} />
          ))
        ) : data.activities.length ? (
          data.activities
            .filter((item) => {
              if (item.entityType === "message") {
                const content =
                  `${item.description || ""} ${item.entityTitle || ""}`.toLowerCase();
                return (
                  user?.username &&
                  content.includes(`@${user.username.toLowerCase()}`)
                );
              }
              return true;
            })
            .map((item) => (
              <div
                key={item._id}
                className="flex gap-3.5 sm:gap-4 border-b border-zinc-100 p-4 sm:p-5 last:border-0 dark:border-zinc-800"
              >
                <div className="mt-1 h-9 w-9 shrink-0 rounded-full bg-blue-600/10 text-center text-sm font-black leading-9 text-blue-600">
                  {item.actorId?.fullName?.[0] || "S"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                      <span className="font-black">
                        {item.actorId?.fullName || "System"}
                      </span>{" "}
                      {item.description}{" "}
                      {item.entityTitle && (
                        <span className="font-black">"{item.entityTitle}"</span>
                      )}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                        tone[item.severity]
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    <span className="capitalize">
                      {item.actorRole?.replace("_", " ")}
                    </span>{" "}
                    · {timeAgo(item.createdAt)} ·{" "}
                    {item.entityType.replace("_", " ")}
                  </p>
                </div>
                {item.url && (
                  <Link
                    href={item.url}
                    className="self-center text-zinc-400 hover:text-blue-600"
                  >
                    <ExternalLink size={16} />
                  </Link>
                )}
              </div>
            ))
        ) : (
          <p className="p-12 text-center text-sm text-zinc-500">
            No activity matches these filters.
          </p>
        )}
      </div>
      <AdminPagination
        page={filters.page}
        pages={data.pagination.totalPages || 1}
        total={data.pagination.total || 0}
        limit={filters.limit}
        itemLabel="events"
        onPageChange={(p) => update("page", p)}
        onLimitChange={(l) =>
          setFilters((old) => ({ ...old, limit: l, page: 1 }))
        }
        className="mt-5"
      />
    </div>
  );
}

function ActivityFilterSelect({ value, onChange, values, label }) {
  const isSeverity = label.toLowerCase() === "severity";
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        size="sm"
        aria-label={label}
        className="h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs capitalize dark:border-zinc-800 dark:bg-zinc-900 cursor-pointer"
      >
        <SelectValue
          placeholder={isSeverity ? "All Severities" : `All ${label}s`}
        />
      </SelectTrigger>
      <SelectContent>
        {values.map((item) => (
          <SelectItem
            key={item}
            value={item}
            className="capitalize text-xs cursor-pointer"
          >
            {item === "all"
              ? isSeverity
                ? "All Severities"
                : `All ${label}s`
              : item.replaceAll("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
