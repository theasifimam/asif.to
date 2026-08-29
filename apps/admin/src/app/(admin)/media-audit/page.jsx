"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Filter,
  Image,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { mediaAuditApi } from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { AdminPagination } from "@/components/admin";
import LogoLoader from "@/components/ui/LogoLoader";

const formatBytes = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function MediaAuditPage() {
  const { user } = useAuth();
  const [audit, setAudit] = useState({
    summary: { total: 0, referenced: 0, orphaned: 0 },
    files: [],
  });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState("");
  const [viewMode, setViewMode] = useState("card");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'in_use' | 'orphaned'
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [copiedPath, setCopiedPath] = useState("");

  const loadAudit = useCallback(async () => {
    setLoading(true);
    const response = await mediaAuditApi.list();
    setLoading(false);
    if (!response.success)
      return toast.error(response.error || "Unable to load media audit");
    setAudit(
      response.data?.data || response.data || { summary: {}, files: [] },
    );
  }, []);

  useEffect(() => {
    if (user?.role !== "super_admin") return undefined;
    const timer = setTimeout(loadAudit, 0);
    return () => clearTimeout(timer);
  }, [user, loadAudit]);

  const removeOrphan = async (row) => {
    if (
      !window.confirm(
        `Delete ${row.filename || row.path}? This cannot be undone.`,
      )
    )
      return;
    setDeleting(row.path);
    const response = await mediaAuditApi.deleteOrphan(row.path);
    setDeleting("");
    if (!response.success)
      return toast.error(response.error || "Image was not deleted");
    toast.success("Orphaned image deleted");
    loadAudit();
  };

  const handleCopy = (path) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    toast.success("Path copied to clipboard");
    setTimeout(() => setCopiedPath(""), 2000);
  };

  // Filter logic
  const filteredFiles = useMemo(() => {
    return (audit.files || []).filter((file) => {
      if (statusFilter === "in_use" && !file.associated) return false;
      if (statusFilter === "orphaned" && file.associated) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const pathMatch = file.path?.toLowerCase().includes(query);
        const filenameMatch = file.filename?.toLowerCase().includes(query);
        const associatedMatch = file.associatedWith?.some(
          (a) =>
            a.title?.toLowerCase().includes(query) ||
            a.type?.toLowerCase().includes(query),
        );
        if (!pathMatch && !filenameMatch && !associatedMatch) return false;
      }
      return true;
    });
  }, [audit.files, statusFilter, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery]);

  // Pagination logic
  const totalItems = filteredFiles.length;
  const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const paginatedFiles = useMemo(() => {
    const start = (safePage - 1) * limit;
    return filteredFiles.slice(start, start + limit);
  }, [filteredFiles, safePage, limit]);

  if (user?.role !== "super_admin") return null;

  const summary = audit.summary || {};

  return (
    <div className="mx-auto max-w-7xl space-y-7 p-4 font-sans sm:p-6 md:p-8">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Super admin tools
          </p>
          <h1 className="mt-1 font-outfit text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
            Media Audit
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Review every public image in the uploads directory, see where it is
            used, and safely remove files no longer referenced by content.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadAudit}
          disabled={loading}
          className="rounded-2xl"
        >
          {loading ? <LogoLoader className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </header>

      {/* Summary Cards (Interactive Filters) */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total images", summary.total, Image, "all"],
          ["In use", summary.referenced, CheckCircle2, "in_use"],
          ["Orphaned", summary.orphaned, AlertTriangle, "orphaned"],
        ].map(([label, value, Icon, filterKey]) => {
          const isActive = statusFilter === filterKey;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setStatusFilter(filterKey)}
              className={`admin-surface text-left rounded-3xl p-5 border transition-all cursor-pointer ${
                isActive
                  ? "border-blue-500/80 ring-2 ring-blue-500/20 bg-blue-500/5 dark:bg-blue-500/10"
                  : "border-zinc-200/70 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon
                  className={`h-5 w-5 ${
                    filterKey === "in_use"
                      ? "text-emerald-500"
                      : filterKey === "orphaned"
                        ? "text-amber-500"
                        : "text-blue-600 dark:text-blue-400"
                  }`}
                />
                {isActive && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    Active Filter
                  </span>
                )}
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                {label}
              </p>
              <p className="mt-1 text-3xl font-black text-zinc-950 dark:text-white">
                {value ?? 0}
              </p>
            </button>
          );
        })}
      </div>

      {/* Controls: Search, Filter Tabs & View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search images by path or content..."
            className="w-full h-10 sm:h-11 pl-10 pr-4 text-xs sm:text-sm font-medium rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        {/* Filters & View Toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Filter Pills */}
          <div className="inline-flex h-10 sm:h-11 items-center rounded-2xl border border-zinc-200/80 bg-zinc-100 p-1 dark:border-zinc-800/80 dark:bg-zinc-900">
            {[
              { id: "all", label: "All" },
              { id: "in_use", label: "In Use" },
              { id: "orphaned", label: "Orphaned" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`flex h-full items-center justify-center rounded-xl px-3 text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-surface overflow-hidden rounded-3xl border border-zinc-200/70 dark:border-zinc-800">
        <div className="border-b border-zinc-200/70 px-5 py-4 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="font-outfit text-lg font-black text-zinc-950 dark:text-white">
              Uploaded Images
            </h2>
            <p className="text-xs text-zinc-500">
              Associated content is protected from deletion. Only orphaned
              images can be removed.
            </p>
          </div>
          <span className="text-xs font-bold text-zinc-500">
            Showing {paginatedFiles.length} of {totalItems} items
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-zinc-500">
            <LogoLoader className="mx-auto mb-2 h-6 w-6" />
            Scanning uploads and content references…
          </div>
        ) : paginatedFiles.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-500">
            No uploaded images matching your criteria.
          </div>
        ) : viewMode === "card" || viewMode === "grid" ? (
          /* CARD / GRID VIEW */
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:p-6">
            {paginatedFiles.map((row) => (
              <div
                key={row.path}
                className="admin-surface group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200/70 shadow-xs transition-all duration-200 hover:border-blue-500/50 dark:border-zinc-800/80 dark:hover:border-blue-500/50"
              >
                {/* Image Container */}
                <div className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-zinc-950/5 p-3 dark:bg-zinc-900/60">
                  <img
                    src={getImageUrl(row.url)}
                    alt={row.filename || row.path}
                    className="max-h-full max-w-full rounded-2xl object-contain shadow-xs transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Floating Status Badge */}
                  <div className="absolute right-3 top-3">
                    {row.associated ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> In use
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                        <AlertTriangle className="h-3 w-3" /> Orphaned
                      </span>
                    )}
                  </div>
                  {/* Floating View Original Button */}
                  <a
                    href={getImageUrl(row.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute left-3 top-3 rounded-full bg-zinc-900/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-900"
                    title="View Full Image"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                {/* Card Info Body */}
                <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
                  <div className="space-y-1.5 min-w-0">
                    <p
                      className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-100"
                      title={row.path}
                    >
                      {row.path}
                    </p>
                    <p className="text-[11px] font-medium text-zinc-500">
                      {formatBytes(row.size)} ·{" "}
                      {new Date(row.modifiedAt).toLocaleDateString()}
                    </p>

                    {/* Associated Content */}
                    {row.associatedWith?.length ? (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {row.associatedWith.map((item, index) => (
                          <span
                            key={`${item.id}-${index}`}
                            className="truncate rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                            title={`${item.type}: ${item.title}`}
                          >
                            {item.type}: {item.title}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(row.path)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedPath === row.path ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {copiedPath === row.path ? "Copied" : "Copy path"}
                      </span>
                    </button>

                    {!row.associated ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-xl h-8 text-xs px-3"
                        onClick={() => removeOrphan(row)}
                        loading={deleting === row.path}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        Protected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LIST / TABLE VIEW */
          <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800">
            {paginatedFiles.map((row) => (
              <div
                key={row.path}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <img
                  src={getImageUrl(row.url)}
                  alt={row.filename || row.path}
                  className="h-16 w-20 rounded-xl bg-zinc-100 object-cover dark:bg-zinc-800 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {row.path}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopy(row.path)}
                      className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                      title="Copy path"
                    >
                      {copiedPath === row.path ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {formatBytes(row.size)} ·{" "}
                    {new Date(row.modifiedAt).toLocaleString()}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {row.associatedWith?.length ? (
                      row.associatedWith.map((item, index) => (
                        <span
                          key={`${item.id}-${index}`}
                          className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                        >
                          {item.type}: {item.title} · {item.field}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                        Orphaned
                      </span>
                    )}
                  </div>
                </div>

                {row.associated ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    In use
                  </span>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeOrphan(row)}
                    loading={deleting === row.path}
                    className="rounded-xl"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <AdminPagination
            page={safePage}
            pages={totalPages}
            total={totalItems}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            itemLabel="images"
          />
        )}
      </div>
    </div>
  );
}
