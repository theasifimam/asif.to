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
    load();
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
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" asChild title="Back to courses">
            <Link href="/courses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-foreground">
              {course?.title || "Course chapters"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
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
                <ExternalLink className="h-4 w-4" />
                View course
              </a>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/courses/${courseId}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit course
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/courses/${courseId}/chapters/new`}>
              <Plus className="h-4 w-4" />
              New chapter
            </Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-3 border-y border-zinc-200 py-4 dark:border-zinc-800 md:grid-cols-[minmax(260px,1fr)_200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            className="pl-9"
            placeholder="Search title, summary, slug, or keyword"
          />
        </div>
        <Select
          value={filters.status}
          onValueChange={(value) => setFilter("status", value)}
        >
          <SelectTrigger
            className="w-full"
            aria-label="Filter chapters by status"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section className="overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <div className="hidden grid-cols-[70px_minmax(280px,1fr)_110px_110px_210px] gap-4 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground dark:bg-zinc-900 md:grid">
          <span>Order</span>
          <span>Chapter</span>
          <span>Views</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          </div>
        ) : chapters.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <BookOpen className="h-9 w-9 opacity-40" />
            <p className="text-sm font-medium">
              No chapters match these filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {chapters.map((chapter, index) => (
              <div
                key={chapter._id}
                className="grid gap-4 px-4 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 md:grid-cols-[70px_minmax(280px,1fr)_110px_110px_210px] md:items-center"
              >
                <span className="text-sm font-semibold text-muted-foreground">
                  {chapter.order}
                </span>
                <div className="min-w-0">
                  <Link
                    href={`/courses/${courseId}/chapters/${chapter._id}`}
                    className="block truncate text-sm font-semibold text-foreground hover:text-blue-600"
                  >
                    {chapter.title}
                  </Link>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    /{chapter.slug}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {chapter.viewCount || 0}
                </span>
                <button
                  type="button"
                  onClick={() => toggleStatus(chapter)}
                  disabled={updating === chapter._id}
                  className={`w-fit text-xs font-semibold capitalize ${
                    chapter.status === "published"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                  title="Toggle publishing status"
                >
                  {updating === chapter._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    chapter.status
                  )}
                </button>
                <div className="flex items-center justify-end gap-1">
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
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    title="Edit chapter"
                  >
                    <Link href={`/courses/${courseId}/chapters/${chapter._id}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete chapter"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setDeleteChapter(chapter)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
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
    </div>
  );
}
