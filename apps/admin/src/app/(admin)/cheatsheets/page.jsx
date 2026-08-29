"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, FileCode, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cheatsheetsApi } from "@/lib/api";
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
  AdminPage,
  AdminPageHeader,
  AdminPagination,
  AdminSearch,
} from "@/components/admin";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { TECH_IDS } from "./components/CheatsheetForm";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { Skeleton } from "@/components/ui/skeleton";

function CheatsheetCardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950 min-h-45">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-10 rounded-md" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-1/3 rounded-md" />
        </div>
        <Skeleton className="h-3 w-full rounded-md" />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80">
        <Skeleton className="h-4 w-24 rounded-md" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function CheatsheetRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4.5">
        <Skeleton className="h-5 w-48 rounded-md" />
        <Skeleton className="mt-1.5 h-3 w-32 rounded-md" />
      </td>
      <td className="px-6 py-4.5">
        <Skeleton className="h-5 w-14 rounded-full" />
      </td>
      <td className="px-6 py-4.5">
        <Skeleton className="h-4 w-12 rounded-md" />
      </td>
      <td className="px-6 py-4.5">
        <Skeleton className="h-5 w-16 rounded-full" />
      </td>
      <td className="px-6 py-4.5">
        <Skeleton className="h-4 w-6 rounded-md" />
      </td>
      <td className="px-6 py-4.5">
        <div className="flex justify-end gap-1">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </td>
    </tr>
  );
}

export default function CheatsheetsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tech, setTech] = useState("all");
  const [status, setStatus] = useState("all");
  const [urlFilters, setUrlFilters] = useUrlFilters({ view: "table" });
  const viewMode = urlFilters.view || "table";
  const setViewMode = (v) =>
    setUrlFilters((current) => ({ ...current, view: v }));
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await cheatsheetsApi.list({ status: "all" });
    if (response.success) setItems(response.data?.data || []);
    else toast.error(response.error || "Unable to load cheatsheets");
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const query = search.trim().toLowerCase();
        return (
          (!query ||
            [item.title, item.content, item.slug].some((value) =>
              value?.toLowerCase().includes(query),
            )) &&
          (tech === "all" || item.techId === tech) &&
          (status === "all" || item.status === status)
        );
      }),
    [items, search, tech, status],
  );

  const pages = Math.max(Math.ceil(filtered.length / limit), 1);
  const visible = filtered.slice((page - 1) * limit, page * limit);

  const updateFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const response = await cheatsheetsApi.delete(deleteTarget._id);
    if (response.success) {
      toast.success("Cheatsheet deleted");
      setItems((current) =>
        current.filter((item) => item._id !== deleteTarget._id),
      );
      setDeleteTarget(null);
    } else toast.error(response.error || "Unable to delete cheatsheet");
    setDeleting(false);
  };

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Learning / Reference"
        title="Cheatsheets"
        description="Create and manage article-based reference guides from the unified articles collection."
        actions={
          <>
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
            <Button asChild className="flex-1 sm:flex-initial">
              <Link href="/cheatsheets/new">
                <Plus className="mr-2 h-4 w-4" /> New cheatsheet
              </Link>
            </Button>
          </>
        }
      />
      <AdminFilters>
        <AdminSearch
          value={search}
          onChange={updateFilter(setSearch)}
          placeholder="Search titles, content, or slugs..."
        />
        <Select value={tech} onValueChange={updateFilter(setTech)}>
          <SelectTrigger className="h-10 w-full rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b] md:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
            <SelectItem value="all">All technologies</SelectItem>
            {TECH_IDS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={updateFilter(setStatus)}>
          <SelectTrigger className="h-10 w-full rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b] md:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
          </SelectContent>
        </Select>
      </AdminFilters>
      <AdminContent plain={viewMode === "card"}>
        {viewMode === "card" ? (
          <div className="space-y-6">
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <CheatsheetCardSkeleton key={i} />
                ))
              ) : visible.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-950">
                  <FileCode className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
                  <p className="text-sm font-medium">
                    No cheatsheets match these filters.
                  </p>
                </div>
              ) : (
                visible.map((item) => (
                  <div
                    key={item._id}
                    className="group flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                            {item.techId}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              item.status === "published"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-zinc-400">
                          Article
                        </span>
                      </div>

                      <div>
                        <Link
                          href={`/cheatsheets/${item._id}/edit`}
                          className="font-bold text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors line-clamp-2"
                        >
                          {item.title}
                        </Link>
                        <p className="mt-1 text-xs text-zinc-400 truncate">
                          /{item.slug}
                        </p>
                      </div>

                      {item.seoDescription && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                          {item.seoDescription}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80">
                      <Link
                        href={`/cheatsheets/${item._id}/edit`}
                        className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Edit cheatsheet &rarr;
                      </Link>

                      <div className="flex items-center gap-1 shrink-0">
                        <Link href={`/cheatsheets/${item._id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            title="Edit cheatsheet"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete cheatsheet"
                          onClick={() => setDeleteTarget(item)}
                          className="h-8 w-8 rounded-lg text-zinc-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {!loading && visible.length > 0 && (
              <AdminPagination
                page={page}
                pages={pages}
                total={filtered.length}
                limit={limit}
                itemLabel="cheatsheets"
                onPageChange={setPage}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
              />
            )}
          </div>
        ) : (
          <div className="admin-surface w-full rounded-[28px] sm:rounded-4xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table w-full min-w-190 text-left text-sm">
                <thead className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/75 dark:bg-[#18181b]/60 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                  <tr>
                    <th className="px-6 py-4.5">Cheatsheet</th>
                    <th className="px-6 py-4.5">Technology</th>
                    <th className="px-6 py-4.5">Content type</th>
                    <th className="px-6 py-4.5">Status</th>
                    <th className="px-6 py-4.5">Order</th>
                    <th className="px-6 py-4.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                  {loading ? (
                    Array.from({ length: limit }).map((_, i) => (
                      <CheatsheetRowSkeleton key={i} />
                    ))
                  ) : visible.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center">
                        <div className="flex flex-col items-center justify-center text-zinc-500">
                          <FileCode className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
                          <p className="text-sm font-medium">
                            No cheatsheets match these filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    visible.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="max-w-xl px-6 py-4.5">
                          <Link
                            href={`/cheatsheets/${item._id}/edit`}
                            className="font-bold font-outfit text-zinc-950 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition-colors line-clamp-1"
                          >
                            {item.title}
                          </Link>
                          <p className="mt-0.5 text-xs text-zinc-400 truncate">
                            /{item.slug}
                          </p>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-500/20">
                            {item.techId}
                          </span>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                            Article
                          </span>
                        </td>
                        <td className="px-6 py-4.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                              item.status === "published"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/20"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-500/20"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-xs font-black text-zinc-400">
                          #{item.order ?? 0}
                        </td>
                        <td className="px-6 py-4.5">
                          <div className="flex justify-end gap-1">
                            <Link href={`/cheatsheets/${item._id}/edit`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                title="Edit cheatsheet"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete cheatsheet"
                              className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              onClick={() => setDeleteTarget(item)}
                            >
                              <Trash2 className="h-4 w-4 text-rose-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!loading && visible.length > 0 && (
              <AdminPagination
                page={page}
                pages={pages}
                total={filtered.length}
                limit={limit}
                itemLabel="cheatsheets"
                onPageChange={setPage}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
              />
            )}
          </div>
        )}
      </AdminContent>
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        loading={deleting}
        title="Delete cheatsheet?"
        description={`This permanently removes ${deleteTarget?.title || "this cheatsheet"}.`}
        confirmText="Delete"
        variant="destructive"
      />
    </AdminPage>
  );
}
