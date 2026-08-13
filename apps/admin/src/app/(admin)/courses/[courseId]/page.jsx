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
import { ViewToggle } from "@/components/ViewToggle";

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
  const [viewMode, setViewMode] = useState("table");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [deleteChapter, setDeleteChapter] = useState(null);

  const orderingView =
    filters.status === "all" && pagination.pages <= 1;

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
      chaptersApi.listByCourse(courseId, {
        search: debouncedSearch,
        status: filters.status,
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
  }, [
    courseId,
    debouncedSearch,
    filters.limit,
    filters.page,
    filters.status,
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
      setChapters((current) =>
        current.map((item) =>
          item._id === chapter._id ? { ...item, status } : item
        )
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
        current.filter((item) => item._id !== deleteChapter._id)
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
    <main className="mx-auto max-w-7xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex items-start gap-3 min-w-0">
          <Button
            variant="outline"
            size="icon"
            asChild
            title="Back to courses"
            className="shrink-0 mt-1"
          >
            <Link href="/courses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Content / Courses / Chapters
            </p>
            <h1 className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white line-clamp-2">
              {course?.title || "Course chapters"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500 truncate">
              {course
                ? `/courses/${course.slug} · ${pagination.total} chapters`
                : "Loading course"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 [&>a]:flex-1 sm:[&>a]:flex-initial [&>button]:flex-1 sm:[&>button]:flex-initial">
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
          {course?.status === "published" && (
            <Button variant="outline" asChild className="w-full sm:w-auto">
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
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href={`/courses/${courseId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit course
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/courses/${courseId}/chapters/new`}>
              <Plus className="mr-2 h-4 w-4" />
              New chapter
            </Link>
          </Button>
        </div>
      </header>

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
          value={filters.status}
          onValueChange={(value) => setFilter("status", value)}
        >
          <SelectTrigger
            className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900 md:w-48"
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

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-950">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : chapters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-950">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
          <p className="text-sm font-medium">No chapters match these filters.</p>
        </div>
      ) : viewMode === "card" ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chapters.map((chapter, index) => (
              <div
                key={chapter._id}
                className="group flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/10 text-xs font-black text-blue-600 dark:text-blue-400">
                      #{chapter.order}
                    </span>
                    <button
                      onClick={() => toggleStatus(chapter)}
                      disabled={updating === chapter._id}
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
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

                  <div>
                    <Link
                      href={`/courses/${courseId}/chapters/${chapter._id}`}
                      className="font-bold text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors line-clamp-2"
                    >
                      {chapter.title}
                    </Link>
                    <p className="mt-1 text-xs text-zinc-400 truncate">
                      /{chapter.slug}
                    </p>
                  </div>

                  {chapter.summary && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {chapter.summary}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      title="Move up"
                      disabled={!orderingView || Boolean(filters.search.trim()) || index === 0}
                      onClick={() => moveChapter(index, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      title="Move down"
                      disabled={!orderingView || Boolean(filters.search.trim()) || index === chapters.length - 1}
                      onClick={() => moveChapter(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {course?.status === "published" && chapter.status === "published" && (
                      <a
                        href={`https://asif.to/${course.slug}/${chapter.slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" title="View chapter">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    <Link href={`/courses/${courseId}/chapters/${chapter._id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" title="Edit chapter">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete chapter"
                      onClick={() => setDeleteChapter(chapter)}
                      className="h-8 w-8 rounded-lg text-zinc-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <footer className="flex items-center justify-between rounded-3xl border border-zinc-200/60 bg-white px-5 py-4 text-sm text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-950">
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
        </div>
      ) : (
        <section className="w-full bg-white dark:bg-zinc-900 rounded-3xl sm:rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left text-sm">
              <thead className="border-b border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                <tr>
                  <th className="px-6 py-4 w-16">#</th>
                  <th className="px-6 py-4">Chapter</th>
                  <th className="px-6 py-4 w-28">Views</th>
                  <th className="px-6 py-4 w-28">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                {chapters.map((chapter, index) => (
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
                ))}
              </tbody>
            </table>
          </div>
          <footer className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/70 px-6 py-3.5 text-xs text-zinc-400 font-medium">
            <span>
              {pagination.total} chapter{pagination.total === 1 ? "" : "s"}
            </span>
            {!orderingView && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-xl"
                  title="Previous page"
                  disabled={loading || pagination.page <= 1}
                  onClick={() => setFilter("page", pagination.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-20 text-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
                  {pagination.page} / {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-xl"
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
    </main>
  );
}
