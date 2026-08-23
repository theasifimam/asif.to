"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getModuleBackUrl } from "@/hooks/useModuleHistory";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

function ChapterCardSkeleton() {
  return (
    <div className="admin-surface group flex flex-col justify-between p-5 rounded-3xl min-h-40">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-10 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-3/4 rounded-md" />
          <Skeleton className="h-3.5 w-1/2 rounded-md" />
        </div>
      </div>
      <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800/80 flex items-center justify-between">
        <Skeleton className="h-4 w-16 rounded-md" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function ChapterRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4 font-black text-xs">
        <Skeleton className="h-4 w-6 rounded-md" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-5 w-48 rounded-md" />
        <Skeleton className="mt-1 h-3.5 w-32 rounded-md" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-5 w-24 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-14 rounded-md" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-5 w-16 rounded-full" />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-1">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </td>
    </tr>
  );
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chaptersApi, coursesApi, topicCategoriesApi } from "@/lib/api";
import { ViewToggle } from "@/components/ui/ViewToggle";
import {
  AdminPage,
  AdminPageHeader,
  AdminPagination,
} from "@/components/admin";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import DiscussButton from "@/components/messaging/DiscussButton";

const initialPagination = { page: 1, pages: 1, total: 0, limit: 20 };

const statusStyles = {
  published:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  draft: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
};

export default function CourseChaptersPage() {
  const { courseId } = useParams();
  const searchParams = useSearchParams();
  const returnTo = getModuleBackUrl("/courses", searchParams.get("returnTo"));
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
    page: 1,
    limit: 20,
  });
  const [urlFilters, setUrlFilters] = useUrlFilters({ view: "table" });
  const viewMode = urlFilters.view || "table";
  const setViewMode = (v) =>
    setUrlFilters((current) => ({ ...current, view: v }));
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [deleteChapter, setDeleteChapter] = useState(null);

  const orderingView =
    filters.status === "all" &&
    filters.category === "all" &&
    pagination.pages <= 1;

  useEffect(() => {
    async function loadCategories() {
      const response = await topicCategoriesApi.list(courseId);
      if (response.success) {
        setCategories(response.data?.data || response.data || []);
      }
    }
    if (courseId) loadCategories();
  }, [courseId]);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(filters.search.trim()),
      250,
    );
    return () => clearTimeout(timer);
  }, [filters.search]);

  const load = useCallback(async () => {
    setLoading(true);
    const [courseResponse, chaptersResponse] = await Promise.all([
      coursesApi.getById(courseId),
      chaptersApi.list(courseId, {
        search: debouncedSearch,
        status: filters.status,
        category: filters.category,
        page: filters.page,
        limit: filters.limit,
      }),
    ]);

    if (courseResponse.success) {
      setCourse(courseResponse.data?.data);
    } else {
      toast.error(courseResponse.error || "Unable to load course");
    }

    if (chaptersResponse.success) {
      setChapters(chaptersResponse.data?.data || []);
      setPagination(chaptersResponse.data?.pagination || initialPagination);
    } else {
      toast.error(chaptersResponse.error || "Unable to load chapters");
    }
    setLoading(false);
  }, [courseId, debouncedSearch, filters.limit, filters.page, filters.status, filters.category]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const setFilter = (key, value) =>
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === "page" ? value : 1,
    }));

  const toggleStatus = async (chapter) => {
    const status = chapter.status === "published" ? "draft" : "published";
    setUpdating(chapter._id);
    const response = await chaptersApi.update(chapter._id, { status });
    if (response.success) {
      toast.success(
        status === "published" ? "Chapter published" : "Chapter moved to draft",
      );
      setChapters((current) =>
        current.map((item) =>
          item._id === chapter._id ? { ...item, status } : item,
        ),
      );
    } else toast.error(response.error || "Unable to update chapter status");
    setUpdating(null);
  };

  const moveChapter = async (index, direction) => {
    if (!orderingView || filters.search.trim()) return;

    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= chapters.length) return;

    const current = chapters[index];
    const target = chapters[targetIndex];
    setUpdating(current._id);
    const response = await chaptersApi.reorder([
      { id: current._id, order: target.order },
      { id: target._id, order: current.order },
    ]);
    if (response.success) {
      toast.success("Chapter order updated");
      const nextChapters = [...chapters];
      const temp = nextChapters[index];
      nextChapters[index] = nextChapters[targetIndex];
      nextChapters[targetIndex] = temp;
      setChapters(nextChapters);
    } else toast.error(response.error || "Unable to reorder chapters");
    setUpdating(null);
  };

  const remove = async () => {
    if (!deleteChapter) return;
    setUpdating(deleteChapter._id);
    const response = await chaptersApi.delete(deleteChapter._id);
    if (response.success) {
      toast.success("Chapter deleted");
      setChapters((current) =>
        current.filter((item) => item._id !== deleteChapter._id),
      );
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
      setDeleteChapter(null);
    } else toast.error(response.error || "Unable to delete chapter");
    setUpdating(null);
  };

  return (
    <AdminPage size="xl">
      <AdminPageHeader
        eyebrow="Content / Courses / Chapters"
        title={course?.title || "Course chapters"}
        description={
          course
            ? `/courses/${course.slug} · ${pagination.total} chapters`
            : "Loading course"
        }
        back={
          <Link
            href={returnTo}
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to courses
          </Link>
        }
        actions={
          <>
            {course && (
              <DiscussButton entityType="course" entityId={courseId} />
            )}
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
            {course?.status === "published" && (
              <Button variant="outline" asChild>
                <a
                  href={`https://asif.to/courses/${course.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View course
                </a>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={`/courses/${courseId}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit course
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/courses/${courseId}/chapters/new`}>
                <Plus className="mr-2 h-4 w-4" />
                New chapter
              </Link>
            </Button>
          </>
        }
      />

      <section className="flex flex-col gap-3 rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white p-3.5 sm:p-5 dark:border-zinc-800/60 dark:bg-zinc-950 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            placeholder="Search title, summary, slug, or keyword"
            className="rounded-2xl bg-zinc-100 pl-9 dark:bg-zinc-900"
          />
        </div>
        <Select
          value={filters.category}
          onValueChange={(value) => setFilter("category", value)}
        >
          <SelectTrigger
            className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900 md:w-56"
            aria-label="Filter by category"
          >
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="uncategorized">
              Uncategorized (No Category)
            </SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={(value) => setFilter("status", value)}
        >
          <SelectTrigger
            className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900 md:w-44"
            aria-label="Filter by status"
          >
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </section>
      {viewMode === "card" ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: filters.limit || 20 }).map((_, i) => (
                <ChapterCardSkeleton key={i} />
              ))
            ) : chapters.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-950">
                <BookOpen className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
                <p className="text-sm font-medium">
                  No chapters match these filters.
                </p>
              </div>
            ) : (
              chapters.map((chapter, index) => (
                <div
                  key={chapter._id}
                  className="group flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/10 text-xs font-black text-blue-600 dark:text-blue-400">
                        #{chapter.order}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {chapter.category ? (
                          <span className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 text-[9px] font-extrabold text-blue-600 dark:text-blue-400 truncate max-w-32">
                            {chapter.category.name || "Category"}
                          </span>
                        ) : (
                          <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[9px] font-bold text-zinc-400">
                            Uncategorized
                          </span>
                        )}
                        <button
                          onClick={() => toggleStatus(chapter)}
                          disabled={updating === chapter._id}
                          className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider transition-all ${
                            updating === chapter._id
                              ? "bg-zinc-100 text-zinc-400"
                              : statusStyles[chapter.status]
                          }`}
                          title="Toggle status"
                        >
                          {updating === chapter._id ? (
                            <Loader2 className="inline h-2.5 w-2.5 animate-spin" />
                          ) : (
                            chapter.status
                          )}
                        </button>
                      </div>
                    </div>

                    <Link
                      href={`/courses/${courseId}/chapters/${chapter._id}`}
                      className="block"
                    >
                      <h3 className="font-bold text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {chapter.title}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-400 truncate">
                        /{chapter.slug}
                      </p>
                    </Link>
                  </div>

                  <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      {chapter.viewCount || 0} views
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title={
                          orderingView && !filters.search.trim()
                            ? "Move chapter up"
                            : "Clear filters to reorder chapters"
                        }
                        disabled={
                          !orderingView ||
                          Boolean(filters.search.trim()) ||
                          index === 0 ||
                          updating === chapter._id
                        }
                        onClick={() => moveChapter(index, -1)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title={
                          orderingView && !filters.search.trim()
                            ? "Move chapter down"
                            : "Clear filters to reorder chapters"
                        }
                        disabled={
                          !orderingView ||
                          Boolean(filters.search.trim()) ||
                          index === chapters.length - 1 ||
                          updating === chapter._id
                        }
                        onClick={() => moveChapter(index, 1)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      {course?.status === "published" &&
                        chapter.status === "published" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            asChild
                            title="View public chapter"
                          >
                            <a
                              href={`https://asif.to/${course.slug}/${chapter.slug}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete chapter"
                        className="h-8 w-8 rounded-lg text-zinc-400 hover:text-red-600"
                        onClick={() => setDeleteChapter(chapter)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {!loading && chapters.length > 0 && (
            <AdminPagination
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              limit={filters.limit}
              itemLabel="chapters"
              onPageChange={(p) => setFilter("page", p)}
              onLimitChange={(l) => setFilter("limit", l)}
            />
          )}
        </div>
      ) : (
        <section className="w-full bg-white dark:bg-zinc-900 rounded-3xl sm:rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left text-sm">
              <thead className="border-b border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                <tr>
                  <th className="px-6 py-4 w-16">#</th>
                  <th className="px-6 py-4">Chapter</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 w-28">Views</th>
                  <th className="px-6 py-4 w-28">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                {loading ? (
                  Array.from({ length: filters.limit || 20 }).map((_, i) => (
                    <ChapterRowSkeleton key={i} />
                  ))
                ) : chapters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center text-zinc-500">
                        <BookOpen className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
                        <p className="text-sm font-medium">
                          No chapters match these filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  chapters.map((chapter, index) => (
                    <tr
                      key={chapter._id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-6 py-4 font-black text-xs text-zinc-400">
                        #{chapter.order}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/courses/${courseId}/chapters/${chapter._id}`}
                          className="font-bold text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors line-clamp-1"
                        >
                          {chapter.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-zinc-400 truncate">
                          /{chapter.slug}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {chapter.category ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            {chapter.category.name || "Category"}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400 font-medium italic">
                            Uncategorized
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                          {chapter.viewCount || 0} views
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(chapter)}
                          disabled={updating === chapter._id}
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            updating === chapter._id
                              ? "bg-zinc-100 text-zinc-400"
                              : statusStyles[chapter.status]
                          }`}
                          title="Toggle publishing status"
                        >
                          {updating === chapter._id ? (
                            <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                          ) : (
                            chapter.status
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            title={
                              orderingView && !filters.search.trim()
                                ? "Move chapter up"
                                : "Clear filters to reorder chapters"
                            }
                            disabled={
                              !orderingView ||
                              Boolean(filters.search.trim()) ||
                              index === 0 ||
                              updating === chapter._id
                            }
                            onClick={() => moveChapter(index, -1)}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            title={
                              orderingView && !filters.search.trim()
                                ? "Move chapter down"
                                : "Clear filters to reorder chapters"
                            }
                            disabled={
                              !orderingView ||
                              Boolean(filters.search.trim()) ||
                              index === chapters.length - 1 ||
                              updating === chapter._id
                            }
                            onClick={() => moveChapter(index, 1)}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          {course?.status === "published" &&
                            chapter.status === "published" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                asChild
                                title="View public chapter"
                              >
                                <a
                                  href={`https://asif.to/${course.slug}/${chapter.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          <Link
                            href={`/courses/${courseId}/chapters/${chapter._id}`}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              title="Edit chapter"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete chapter"
                            className="h-8 w-8 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                            onClick={() => setDeleteChapter(chapter)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && chapters.length > 0 && (
            <AdminPagination
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              limit={filters.limit}
              itemLabel="chapters"
              onPageChange={(p) => setFilter("page", p)}
              onLimitChange={(l) => setFilter("limit", l)}
            />
          )}
        </section>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteChapter)}
        onClose={() => setDeleteChapter(null)}
        onConfirm={remove}
        title="Delete chapter"
        description={`Delete ${deleteChapter?.title || "this chapter"}? This cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        loading={updating === deleteChapter?._id}
      />
    </AdminPage>
  );
}
