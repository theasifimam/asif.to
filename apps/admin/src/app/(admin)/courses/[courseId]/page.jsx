"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chaptersApi, coursesApi } from "@/lib/api";

const initialPagination = { page: 1, pages: 1, total: 0, limit: 20 };

const statusStyles = {
  published:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  draft: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
};

export default function CourseChaptersPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    page: 1,
    limit: 20,
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [deleteChapter, setDeleteChapter] = useState(null);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(filters.search.trim()),
      250,
    );
    return () => clearTimeout(timer);
  }, [filters.search]);

  const orderingView = !debouncedSearch && filters.status === "all";

  const load = useCallback(async () => {
    setLoading(true);
    const chapterParams = orderingView
      ? undefined
      : {
          search: debouncedSearch,
          status: filters.status,
          page: filters.page,
          limit: filters.limit,
        };
    const [courseResponse, chapterResponse] = await Promise.all([
      coursesApi.getById(courseId),
      chaptersApi.list(courseId, chapterParams),
    ]);

    if (courseResponse.success) setCourse(courseResponse.data?.data || null);
    else toast.error(courseResponse.error || "Unable to load course");

    if (chapterResponse.success) {
      setChapters(chapterResponse.data?.data || []);
      setPagination(chapterResponse.data?.pagination || initialPagination);
    } else toast.error(chapterResponse.error || "Unable to load chapters");

    setLoading(false);
  }, [
    courseId,
    debouncedSearch,
    filters.limit,
    filters.page,
    filters.status,
    orderingView,
  ]);

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
      load();
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
      load();
    } else toast.error(response.error || "Unable to reorder chapters");
    setUpdating(null);
  };

  const remove = async () => {
    if (!deleteChapter) return;
    setUpdating(deleteChapter._id);
    const response = await chaptersApi.delete(deleteChapter._id);
    if (response.success) {
      toast.success("Chapter deleted");
      setDeleteChapter(null);
      load();
    } else toast.error(response.error || "Unable to delete chapter");
    setUpdating(null);
  };

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex items-start gap-3 min-w-0">
          <Button variant="outline" size="icon" asChild title="Back to courses">
            <Link href="/courses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Content / Courses / Chapters
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white truncate">
              {course?.title || "Course chapters"}
            </h1>
            <p className="mt-2 text-sm text-zinc-500 truncate">
              {course
                ? `/courses/${course.slug} · ${pagination.total} chapters`
                : "Loading course"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
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
        </div>
      </header>

      <section className="flex flex-col gap-3 rounded-4xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-950 md:flex-row">
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
          value={filters.status}
          onValueChange={(value) => setFilter("status", value)}
        >
          <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900 md:w-48" aria-label="Filter chapters by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section className="overflow-hidden rounded-4xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left text-sm">
            <thead className="border-b border-zinc-200/60 bg-zinc-50/80 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-900/60">
              <tr>
                <th className="px-5 py-3 w-20">Order</th>
                <th className="px-5 py-3">Chapter</th>
                <th className="px-5 py-3 w-28">Views</th>
                <th className="px-5 py-3 w-28">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-16 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
                  </td>
                </tr>
              ) : chapters.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-16 text-center text-zinc-500"
                  >
                    <BookOpen className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
                    No chapters match these filters.
                  </td>
                </tr>
              ) : (
                chapters.map((chapter, index) => (
                  <tr
                    key={chapter._id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                  >
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300 font-semibold">
                      {chapter.order}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/courses/${courseId}/chapters/${chapter._id}`}
                        className="font-semibold text-zinc-900 hover:text-primary dark:text-white dark:hover:text-primary"
                      >
                        {chapter.title}
                      </Link>
                      <p className="mt-1 text-xs text-zinc-400">
                        /{chapter.slug}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                      {chapter.viewCount || 0}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleStatus(chapter)}
                        disabled={updating === chapter._id}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
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
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
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
                            title="Edit chapter"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete chapter"
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
        <footer className="flex items-center justify-between border-t border-zinc-200/60 px-5 py-4 text-sm text-zinc-500 dark:border-zinc-800/60">
          <span>
            {pagination.total} chapter{pagination.total === 1 ? "" : "s"}
          </span>
          {!orderingView && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                title="Previous page"
                disabled={loading || pagination.page <= 1}
                onClick={() => setFilter("page", pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-24 text-center text-xs font-medium">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="icon"
                title="Next page"
                disabled={loading || pagination.page >= pagination.pages}
                onClick={() => setFilter("page", pagination.page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </footer>
      </section>

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
    </main>
  );
}
