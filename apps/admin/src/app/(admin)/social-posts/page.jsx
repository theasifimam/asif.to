"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Copy,
  Edit3,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { socialPostsApi } from "@/lib/api";
import SocialMediaTabs from "@/components/social-posts/SocialMediaTabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { listingReturnTo, useUrlFilters } from "@/hooks/useUrlFilters";
import { Skeleton } from "@/components/ui";

function SocialPostCardSkeleton() {
  return (
    <div className="admin-surface group flex flex-col justify-between p-5 rounded-3xl min-h-80">
      <div className="space-y-3">
        <Skeleton className="w-full aspect-square rounded-2xl" />
        <Skeleton className="h-5 w-3/4 rounded-md" />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function SocialPostRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4.5">
        <Skeleton className="h-5 w-48 rounded-md" />
      </td>
      <td className="px-6 py-4.5">
        <Skeleton className="h-4 w-20 rounded-md" />
      </td>
      <td className="px-6 py-4.5">
        <Skeleton className="h-5 w-28 rounded-full" />
      </td>
      <td className="px-6 py-4.5">
        <Skeleton className="h-4 w-6 rounded-md" />
      </td>
      <td className="px-6 py-4.5">
        <Skeleton className="h-5 w-16 rounded-full" />
      </td>
      <td className="px-6 py-4.5">
        <div className="flex justify-end gap-1">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </td>
    </tr>
  );
}
import {
  AdminContent,
  AdminEmptyState,
  AdminFilters,
  AdminPage,
  AdminPageHeader,
  AdminPagination,
  AdminSearch,
} from "@/components/admin";

const statusStyles = {
  published:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20",
  scheduled:
    "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-500/20",
  ready:
    "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-500/20",
  draft:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/20",
};

export default function SocialPostsPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnTo = listingReturnTo(pathname, searchParams);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [filters, setFilters] = useUrlFilters({
    search: "",
    platform: "all",
    status: "all",
    page: 1,
    limit: 20,
    view: "card",
  });
  const { search, platform, status, page, limit } = filters;
  const viewMode = filters.view || "card";
  const setViewMode = (view) => setFilters((current) => ({ ...current, view }));

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await socialPostsApi.list(
        debouncedSearch ? { search: debouncedSearch } : {},
      );
      if (result?.success) {
        const data = result?.data?.data;
        setPosts(Array.isArray(data) ? data : []);
      } else {
        setPosts([]);
        if (result?.error) toast.error(result.error);
      }
    } catch (error) {
      console.error("Failed to load social posts:", error);
      toast.error("Failed to load social posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchPlatform =
        platform === "all" ||
        (post.platform &&
          post.platform.toLowerCase() === platform.toLowerCase());
      const matchStatus =
        status === "all" ||
        (post.status && post.status.toLowerCase() === status.toLowerCase());
      return matchPlatform && matchStatus;
    });
  }, [posts, platform, status]);

  const pages = Math.max(Math.ceil(filteredPosts.length / limit), 1);
  const visible = useMemo(
    () => filteredPosts.slice((page - 1) * limit, page * limit),
    [filteredPosts, page, limit],
  );

  const duplicate = async (id) => {
    setDuplicatingId(id);
    const result = await socialPostsApi.duplicate(id);
    if (result?.success) {
      toast.success("Social post duplicated");
      load();
    } else {
      toast.error(result?.error || "Failed to duplicate post");
    }
    setDuplicatingId(null);
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await socialPostsApi.delete(deleteTarget._id);
    if (result?.success) {
      toast.success("Social post deleted");
      setDeleteTarget(null);
      load();
    } else {
      toast.error(result?.error || "Failed to delete post");
    }
    setDeleting(false);
  };

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Social Media & Publishing"
        title="Social Media"
        description="Create, manage and publish branded social content across platforms."
        back={
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-1"
          >
            <ChevronLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        }
        actions={
          <>
            <SocialMediaTabs />
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
            <Button asChild className="shadow-lg shadow-blue-500/20">
              <Link
                href={`/social-posts/new?returnTo=${encodeURIComponent(returnTo)}`}
              >
                <Plus className="mr-1.5 h-4 w-4" /> New post
              </Link>
            </Button>
          </>
        }
      />

      <AdminFilters>
        <AdminSearch
          value={search}
          onChange={(val) =>
            setFilters((current) => ({ ...current, search: val, page: 1 }))
          }
          placeholder="Search social posts by title, category, format..."
        />

        <div className="w-full sm:w-44">
          <Select
            value={platform}
            onValueChange={(val) =>
              setFilters((current) => ({ ...current, platform: val, page: 1 }))
            }
          >
            <SelectTrigger className="h-10 rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b]">
              <SelectValue placeholder="All platforms" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
              <SelectItem value="all">All platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-40">
          <Select
            value={status}
            onValueChange={(val) =>
              setFilters((current) => ({ ...current, status: val, page: 1 }))
            }
          >
            <SelectTrigger className="h-10 rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AdminFilters>

      <AdminContent plain={viewMode === "card"}>
        {viewMode === "card" ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <SocialPostCardSkeleton key={i} />
                ))
              ) : filteredPosts.length === 0 ? (
                <div className="col-span-full">
                  <AdminEmptyState
                    icon={ImageIcon}
                    title="No social posts found"
                    description="Create your first branded post or carousel, or adjust your filters."
                    action={
                      <Button asChild size="sm">
                        <Link
                          href={`/social-posts/new?returnTo=${encodeURIComponent(returnTo)}`}
                        >
                          <Plus className="mr-1.5 h-4 w-4" /> Create post
                        </Link>
                      </Button>
                    }
                  />
                </div>
              ) : (
                visible.map((post) => (
                  <div
                    key={post._id}
                    className="admin-surface group flex flex-col justify-between p-5 rounded-3xl transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700"
                  >
                    <div className="space-y-3">
                      <Link
                        href={`/social-posts/${post._id}`}
                        className="block"
                      >
                        <div className="mb-4 aspect-square rounded-2xl bg-linear-to-br from-zinc-900 via-zinc-950 to-black p-5 text-white shadow-inner flex flex-col justify-between relative overflow-hidden group-hover:scale-[1.01] transition-transform duration-200">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                              {post.category || "asif.to"}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                                statusStyles[post.status] ||
                                "bg-zinc-800 text-zinc-300"
                              }`}
                            >
                              {post.status}
                            </span>
                          </div>
                          <div>
                            <div className="text-xl sm:text-2xl font-black line-clamp-3 leading-tight tracking-tight">
                              {post.name}
                            </div>
                          </div>
                        </div>
                      </Link>

                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
                        <span className="capitalize">
                          {post.platform || "social"}
                        </span>
                        <span>·</span>
                        <span className="capitalize">
                          {post.format || "post"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                          {post.slideCount || 0} slides
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Link href={`/social-posts/${post._id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                            title="Edit post"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => duplicate(post._id)}
                          disabled={duplicatingId === post._id}
                          className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                          title="Duplicate"
                        >
                          {duplicatingId === post._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(post)}
                          className="h-8 w-8 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-rose-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {!loading && filteredPosts.length > 0 && (
              <AdminPagination
                page={page}
                pages={pages}
                total={filteredPosts.length}
                limit={limit}
                itemLabel="social posts"
                onPageChange={(p) =>
                  setFilters((current) => ({ ...current, page: p }))
                }
                onLimitChange={(l) =>
                  setFilters((current) => ({ ...current, limit: l, page: 1 }))
                }
              />
            )}
          </div>
        ) : (
          <div className="space-y-0">
            <div className="admin-surface w-full rounded-[28px] sm:rounded-4xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="admin-table w-full min-w-190 text-left text-sm">
                  <thead className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/75 dark:bg-[#18181b]/60 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                    <tr>
                      <th className="px-6 py-4.5">Post</th>
                      <th className="px-6 py-4.5">Category</th>
                      <th className="px-6 py-4.5">Platform & Format</th>
                      <th className="px-6 py-4.5">Slides</th>
                      <th className="px-6 py-4.5">Status</th>
                      <th className="px-6 py-4.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                    {loading ? (
                      Array.from({ length: limit }).map((_, i) => (
                        <SocialPostRowSkeleton key={i} />
                      ))
                    ) : filteredPosts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10">
                          <AdminEmptyState
                            icon={ImageIcon}
                            title="No social posts found"
                            description="Create your first branded post or carousel, or adjust your filters."
                            action={
                              <Button asChild size="sm">
                                <Link
                                  href={`/social-posts/new?returnTo=${encodeURIComponent(returnTo)}`}
                                >
                                  <Plus className="mr-1.5 h-4 w-4" /> Create
                                  post
                                </Link>
                              </Button>
                            }
                          />
                        </td>
                      </tr>
                    ) : (
                      visible.map((post) => (
                        <tr
                          key={post._id}
                          className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <td className="px-6 py-4.5">
                            <Link
                              href={`/social-posts/${post._id}`}
                              className="font-bold font-outfit text-zinc-950 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition-colors line-clamp-1"
                            >
                              {post.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4.5">
                            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                              {post.category || "asif.to"}
                            </span>
                          </td>
                          <td className="px-6 py-4.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold capitalize text-zinc-800 dark:text-zinc-200">
                                {post.platform || "Social"}
                              </span>
                              <span className="text-zinc-400">·</span>
                              <span className="text-xs font-medium capitalize text-zinc-500 dark:text-zinc-400">
                                {post.format || "post"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4.5">
                            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                              {post.slideCount || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4.5">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                statusStyles[post.status] ||
                                "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                              }`}
                            >
                              {post.status}
                            </span>
                          </td>
                          <td className="px-6 py-4.5">
                            <div className="flex justify-end gap-1">
                              <Link href={`/social-posts/${post._id}`}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                  title="Edit post"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              </Link>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => duplicate(post._id)}
                                disabled={duplicatingId === post._id}
                                className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                title="Duplicate"
                              >
                                {duplicatingId === post._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteTarget(post)}
                                className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title="Delete"
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
            </div>

            {!loading && filteredPosts.length > 0 && (
              <AdminPagination
                page={page}
                pages={pages}
                total={filteredPosts.length}
                limit={limit}
                itemLabel="social posts"
                onPageChange={(p) =>
                  setFilters((current) => ({ ...current, page: p }))
                }
                onLimitChange={(l) =>
                  setFilters((current) => ({ ...current, limit: l, page: 1 }))
                }
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
        variant="destructive"
        title="Delete social post?"
        description={`This permanently removes "${deleteTarget?.name || "this social post"}".`}
        confirmText="Delete post"
      />
    </AdminPage>
  );
}
