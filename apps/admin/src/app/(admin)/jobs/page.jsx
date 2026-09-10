"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Archive,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  FileCheck2,
  Plus,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import { jobsApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminContent,
  AdminFilters,
  AdminLoading,
  AdminPage,
  AdminPageHeader,
  AdminPagination,
  AdminSearch,
} from "@/components/admin";
import { ViewToggle } from "@/components/ui/ViewToggle";

const metrics = [
  ["active", "Active jobs", BriefcaseBusiness, "text-emerald-600"],
  ["pending", "Pending review", Clock3, "text-amber-600"],
  ["addedToday", "Added today", Plus, "text-blue-600"],
  ["expired", "Expired", Archive, "text-zinc-500"],
  ["featured", "Featured", Star, "text-amber-500"],
  ["applications", "Applications", FileCheck2, "text-violet-600"],
  ["externalClicks", "External clicks", ExternalLink, "text-sky-600"],
  ["activeSources", "Active sources", RefreshCw, "text-teal-600"],
  ["failedImports", "Failed imports", Clock3, "text-rose-600"],
];

const badge = {
  published:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  expired:
    "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  rejected: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  draft: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  hidden: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  archived: "bg-zinc-200 text-zinc-500 dark:bg-zinc-800",
};

const originLabels = {
  admin_created: "Admin Created",
  manual_import: "Manual Import",
  automated_import: "Automated Import",
  ats_import: "ATS Import",
  api_import: "API Import",
};
const importLabels = {
  imported: "Imported",
  updated: "Updated",
  unchanged: "Unchanged",
  duplicate: "Duplicate",
  validation_failed: "Validation Failed",
  source_removed: "Source Removed",
  sync_error: "Sync Error",
};

export default function JobsAdminPage() {
  const [dashboard, setDashboard] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [sources, setSources] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    origin: "all",
    importStatus: "all",
    source: "all",
    sort: "newest",
  });
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");

  const load = async (page = pagination.page) => {
    setLoading(true);
    const queryParams = {
      ...filters,
      status: filters.status === "all" ? "" : filters.status,
      origin: filters.origin === "all" ? "" : filters.origin,
      importStatus: filters.importStatus === "all" ? "" : filters.importStatus,
      source: filters.source === "all" ? "" : filters.source,
      page,
      limit: pagination.limit,
    };
    const [jobsResult, dashboardResult, sourcesResult] = await Promise.all([
      jobsApi.list(queryParams),
      jobsApi.dashboard(),
      jobsApi.sources(),
    ]);
    setLoading(false);
    if (!jobsResult.success)
      return toast.error(jobsResult.error || "Unable to load jobs");
    setJobs(jobsResult.data?.data || []);
    setPagination(jobsResult.data?.pagination || pagination);
    setSelected([]);
    if (dashboardResult.success)
      setDashboard(dashboardResult.data?.data || null);
    if (sourcesResult.success) setSources(sourcesResult.data?.data || []);
  };

  useEffect(() => {
    const timer = setTimeout(() => load(1), 250);
    return () => clearTimeout(timer);
  }, [
    filters.search,
    filters.status,
    filters.origin,
    filters.importStatus,
    filters.source,
    filters.sort,
  ]);

  const act = async (action, ids = selected) => {
    if (!ids.length) return toast.error("Select at least one job");
    const result = await jobsApi.bulk(action, ids);
    if (!result.success) return toast.error(result.error || "Action failed");
    toast.success(`${result.data?.data?.modified || ids.length} job(s) updated`);
    load();
  };

  const remove = async (job) => {
    if (
      !window.confirm(
        `Delete “${job.title}” and its applications/activity? This cannot be undone.`,
      )
    )
      return;
    const result = await jobsApi.delete(job._id);
    if (!result.success) return toast.error(result.error || "Delete failed");
    toast.success("Job deleted");
    load();
  };

  return (
    <AdminPage className="space-y-6 py-5">
      <AdminPageHeader
        eyebrow="UAE jobs"
        title="Jobs"
        description="Moderate every manual and imported listing, review performance, and control publication individually."
        actions={
          <div className="flex gap-2">
            <Link href="/jobs/companies">
              <Button variant="outline">Companies</Button>
            </Link>
            <Link href="/jobs/new">
              <Button>
                <Plus className="h-4 w-4" />
                Add job
              </Button>
            </Link>
          </div>
        }
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-9">
        {metrics.map(([key, label, Icon, color]) => (
          <div
            key={key}
            className="rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-950"
          >
            <Icon className={`h-4 w-4 ${color}`} />
            <p className="mt-3 text-2xl font-black">
              {dashboard?.metrics?.[key] ?? "—"}
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-zinc-400">
              {label}
            </p>
          </div>
        ))}
      </section>

      {dashboard?.topJobs?.length > 0 && (
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-2">
            <h2 className="text-sm font-black">Top job performance</h2>
            <div className="mt-3 space-y-2">
              {dashboard.topJobs.slice(0, 5).map((job) => (
                <div
                  key={job._id}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-zinc-50 px-4 py-3 text-xs dark:bg-zinc-900"
                >
                  <span className="truncate font-bold">
                    {job.title}{" "}
                    <span className="font-medium text-zinc-400">
                      · {job.companyName}
                    </span>
                  </span>
                  <span className="shrink-0 text-zinc-500">
                    {job.views} views · {job.applyClicks} clicks
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-black">Popular categories</h2>
            <div className="mt-3 space-y-2">
              {dashboard.categories?.slice(0, 5).map((item) => (
                <div key={item._id} className="flex justify-between text-xs">
                  <span className="text-zinc-500">{item._id}</span>
                  <b>{item.count}</b>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <AdminFilters className="flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <AdminSearch
            value={filters.search}
            onChange={(value) =>
              setFilters((current) => ({ ...current, search: value }))
            }
            placeholder="Search title, company, location, source…"
            className="w-full sm:w-64"
          />
          <div className="w-36 sm:w-40">
            <Select
              value={filters.status}
              onValueChange={(val) =>
                setFilters((current) => ({ ...current, status: val }))
              }
            >
              <SelectTrigger size="sm" className="h-10 rounded-full px-4">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {[
                  "draft",
                  "pending",
                  "published",
                  "hidden",
                  "expired",
                  "rejected",
                  "archived",
                ].map((value) => (
                  <SelectItem key={value} value={value}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AdminSelectFilter
            value={filters.origin}
            onValueChange={(origin) =>
              setFilters((current) => ({ ...current, origin }))
            }
            placeholder="All origins"
            items={originLabels}
          />
          <AdminSelectFilter
            value={filters.importStatus}
            onValueChange={(importStatus) =>
              setFilters((current) => ({ ...current, importStatus }))
            }
            placeholder="All import states"
            items={importLabels}
          />
          <AdminSelectFilter
            value={filters.source}
            onValueChange={(source) =>
              setFilters((current) => ({ ...current, source }))
            }
            placeholder="All sources"
            items={Object.fromEntries(
              sources.map((source) => [source._id, source.name]),
            )}
          />

          <div className="w-40 sm:w-44">
            <Select
              value={filters.sort}
              onValueChange={(val) =>
                setFilters((current) => ({ ...current, sort: val }))
              }
            >
              <SelectTrigger size="sm" className="h-10 rounded-full px-4">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Recently added</SelectItem>
                <SelectItem value="posted">Posted date</SelectItem>
                <SelectItem value="expiry">Expiry</SelectItem>
                <SelectItem value="views">Most viewed</SelectItem>
                <SelectItem value="clicks">Most clicks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-end shrink-0">
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
        </div>
      </AdminFilters>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-3xl bg-zinc-900 p-3 text-white dark:bg-white dark:text-zinc-900">
          <span className="px-2 text-xs font-black">
            {selected.length} selected
          </span>
          {[
            ["publish", "Publish"],
            ["unpublish", "Unpublish"],
            ["hide", "Hide"],
            ["feature", "Feature"],
            ["unfeature", "Unfeature"],
            ["expire", "Expire"],
            ["archive", "Archive"],
            ["reject", "Reject"],
          ].map(([action, text]) => (
            <button
              key={action}
              onClick={() => act(action)}
              className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold hover:bg-white/20 dark:bg-zinc-900/10 cursor-pointer"
            >
              {text}
            </button>
          ))}
        </div>
      )}

      <AdminContent>
        {loading ? (
          <AdminLoading />
        ) : viewMode === "list" ? (
          /* List Table View */
          <div className="overflow-x-auto">
            <table className="admin-table min-w-300 w-full text-left text-xs">
              <thead>
                <tr>
                  <th className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={
                        jobs.length > 0 && selected.length === jobs.length
                      }
                      onChange={(e) =>
                        setSelected(
                          e.target.checked ? jobs.map((job) => job._id) : [],
                        )
                      }
                      aria-label="Select all"
                      className="h-4 w-4 rounded-sm accent-blue-600"
                    />
                  </th>
                  {[
                    "Job",
                    "Company",
                    "Location",
                    "Origin",
                    "Source",
                    "Import state",
                    "Status",
                    "Posted",
                    "Expiry",
                    "Views",
                    "Apply activity",
                    "Featured",
                    "Actions",
                  ].map((value) => (
                    <th key={value} className="px-4 py-4">
                      {value}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job._id}
                    className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(job._id)}
                        onChange={(e) =>
                          setSelected((current) =>
                            e.target.checked
                              ? [...current, job._id]
                              : current.filter((id) => id !== job._id),
                          )
                        }
                        className="h-4 w-4 rounded-sm accent-blue-600"
                      />
                    </td>
                    <td className="max-w-70 px-4 py-4">
                      <Link
                        href={`/jobs/${job._id}/edit`}
                        className="font-black hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {job.title}
                      </Link>
                      {job.isDemo && (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                          DEMO
                        </span>
                      )}
                      <p className="mt-1 truncate text-[10px] text-zinc-400">
                        /{job.slug}
                      </p>
                    </td>
                    <td className="px-4 py-4 font-bold">{job.companyName}</td>
                    <td className="px-4 py-4">{job.location}</td>
                    <td className="px-4 py-4">
                      <b className="whitespace-nowrap">
                        {originLabels[job.creationOrigin] || "Admin Created"}
                      </b>
                      <p className="mt-1 text-[10px] text-zinc-400">
                        {job.sourceProvider || "manual"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <b>{job.sourceName}</b>
                      <p className="mt-1 whitespace-nowrap text-[10px] text-zinc-400">
                        {job.lastSyncedAt
                          ? `Synced ${new Date(job.lastSyncedAt).toLocaleString()}`
                          : "Not synchronized"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="whitespace-nowrap rounded-full bg-zinc-100 px-2 py-1 text-[9px] font-black uppercase dark:bg-zinc-800">
                        {importLabels[job.importStatus] || "—"}
                      </span>
                      {job.importQualityScore != null && (
                        <p className="mt-1 text-[10px] text-zinc-400">
                          Quality {job.importQualityScore}/100
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${badge[job.status] || ""}`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {new Date(job.postedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      {job.expiresAt
                        ? new Date(job.expiresAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-4">{job.views}</td>
                    <td className="px-4 py-4">
                      {job.applicationCount} / {job.applyClicks}
                    </td>
                    <td className="px-4 py-4">
                      {job.featured ? (
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <a
                          href={`${process.env.NEXT_PUBLIC_WEB_URL || "https://asif.to"}/jobs/${job.slug}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button variant="ghost" size="icon" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </a>
                        <Link href={`/jobs/${job._id}/edit`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                        {job.status === "published" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Unpublish"
                            onClick={() => act("unpublish", [job._id])}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Publish"
                            onClick={() => act("publish", [job._id])}
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete"
                          onClick={() => remove(job)}
                        >
                          <Trash2 className="h-4 w-4 text-rose-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!jobs.length && (
              <div className="p-16 text-center text-sm text-zinc-500">
                No jobs match these filters.
              </div>
            )}
          </div>
        ) : (
          /* Card Grid View */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4 sm:p-5">
            {jobs.map((job) => (
              <article
                key={job._id}
                className={`relative flex flex-col justify-between rounded-3xl border bg-white p-5 shadow-xs transition-all dark:bg-zinc-950 ${
                  selected.includes(job._id)
                    ? "border-blue-500 ring-2 ring-blue-500/20 dark:border-blue-500"
                    : "border-zinc-200/80 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                }`}
              >
                <div className="space-y-3.5">
                  {/* Header: Checkbox + Title + Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={selected.includes(job._id)}
                        onChange={(e) =>
                          setSelected((current) =>
                            e.target.checked
                              ? [...current, job._id]
                              : current.filter((id) => id !== job._id),
                          )
                        }
                        className="mt-1 h-4 w-4 rounded-sm accent-blue-600 shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/jobs/${job._id}/edit`}
                          className="font-bold text-sm text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400 line-clamp-1 block"
                        >
                          {job.title}
                        </Link>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                            {job.companyName}
                          </span>
                          <span>•</span>
                          <span className="truncate">{job.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase ${badge[job.status] || ""}`}
                      >
                        {job.status}
                      </span>
                      {job.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/50">
                          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-bold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                      {originLabels[job.creationOrigin] || "Admin Created"}
                    </span>
                    {job.sourceName && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 truncate max-w-35">
                        {job.sourceName}
                      </span>
                    )}
                    {job.importQualityScore != null && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        Score: {job.importQualityScore}/100
                      </span>
                    )}
                    {job.isDemo && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 font-black text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                        DEMO
                      </span>
                    )}
                  </div>

                  {/* Metrics Box */}
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-50/80 p-2.5 dark:bg-zinc-900/60 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">
                        Views
                      </span>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">
                        {job.views || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">
                        Applies / Clicks
                      </span>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">
                        {job.applicationCount || 0} / {job.applyClicks || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer: Date & Actions */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>
                    Posted {new Date(job.postedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <a
                      href={`${process.env.NEXT_PUBLIC_WEB_URL || "https://asif.to"}/jobs/${job.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="View live"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                    <Link href={`/jobs/${job._id}/edit`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-xs"
                      >
                        Edit
                      </Button>
                    </Link>
                    {job.status === "published" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Unpublish"
                        onClick={() => act("unpublish", [job._id])}
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Publish"
                        onClick={() => act("publish", [job._id])}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-600 hover:text-rose-700"
                      title="Delete"
                      onClick={() => remove(job)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
            {!jobs.length && (
              <div className="col-span-full rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
                <p className="font-bold text-zinc-500">No jobs match these filters.</p>
              </div>
            )}
          </div>
        )}

        <AdminPagination
          page={pagination.page}
          pages={pagination.totalPages}
          total={pagination.totalCount}
          limit={pagination.limit}
          itemLabel="jobs"
          onPageChange={load}
          onLimitChange={(limit) => {
            setPagination((current) => ({ ...current, limit }));
            setTimeout(() => load(1), 0);
          }}
        />
      </AdminContent>
    </AdminPage>
  );
}

function AdminSelectFilter({ value, onValueChange, placeholder, items }) {
  return (
    <div className="w-36 sm:w-44">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger size="sm" className="h-10 rounded-full px-4">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {Object.entries(items).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
