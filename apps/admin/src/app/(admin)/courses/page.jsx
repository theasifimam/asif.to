"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FilePenLine,
  Layers,
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
import { coursesApi } from "@/lib/api";

const initialPagination = { page: 1, pages: 1, total: 0, limit: 20 };

export default function CoursesAdminPage() {
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    level: "all",
    page: 1,
    limit: 20,
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [deleteCourse, setDeleteCourse] = useState(null);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(filters.search.trim()),
      250,
    );
    return () => clearTimeout(timer);
  }, [filters.search]);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await coursesApi.listAll({
      search: debouncedSearch,
      status: filters.status,
      level: filters.level,
      page: filters.page,
      limit: filters.limit,
    });
    if (response.success) {
      setCourses(response.data?.data || []);
      setPagination(response.data?.pagination || initialPagination);
    } else {
      toast.error(response.error || "Unable to load courses");
    }
    setLoading(false);
  }, [
    debouncedSearch,
    filters.level,
    filters.limit,
    filters.page,
    filters.status,
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

  const toggleStatus = async (course) => {
    const status = course.status === "published" ? "draft" : "published";
    setUpdating(course._id);
    const response = await coursesApi.update(course._id, { status });
    if (response.success) {
      toast.success(
        status === "published" ? "Course published" : "Course moved to draft",
      );
      load();
    } else {
      toast.error(response.error || "Unable to update course status");
    }
    setUpdating(null);
  };

  const remove = async () => {
    if (!deleteCourse) return;
    setUpdating(deleteCourse._id);
    const response = await coursesApi.delete(deleteCourse._id);
    if (response.success) {
      toast.success("Course and its chapters deleted");
      setDeleteCourse(null);
      load();
    } else {
      toast.error(response.error || "Unable to delete course");
    }
    setUpdating(null);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Courses
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage course publishing, metadata, and chapter collections.
          </p>
        </div>
        <Button asChild>
          <Link href="/courses/new">
            <Plus className="h-4 w-4" />
            New course
          </Link>
        </Button>
      </header>

      <section className="grid gap-3 border-y border-zinc-200 py-4 dark:border-zinc-800 md:grid-cols-[minmax(260px,1fr)_200px_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            className="pl-9"
            placeholder="Search title, slug, technology, or keyword"
          />
        </div>
        <Select
          value={filters.status}
          onValueChange={(value) => setFilter("status", value)}
        >
          <SelectTrigger className="w-full" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.level}
          onValueChange={(value) => setFilter("level", value)}
        >
          <SelectTrigger className="w-full" aria-label="Filter by level">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
            <SelectItem value="Beginner - Advanced">
              Beginner - Advanced
            </SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section className="overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <div className="hidden grid-cols-[minmax(260px,1.8fr)_140px_130px_110px_190px] gap-4 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground dark:bg-zinc-900 md:grid">
          <span>Course</span>
          <span>Level</span>
          <span>Chapters</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <BookOpen className="h-9 w-9 opacity-40" />
            <p className="text-sm font-medium">
              No courses match these filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {courses.map((course) => (
              <div
                key={course._id}
                className="grid gap-4 px-4 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 md:grid-cols-[minmax(260px,1.8fr)_140px_130px_110px_190px] md:items-center"
              >
                <div className="min-w-0">
                  <Link
                    href={`/courses/${course._id}`}
                    className="block truncate text-sm font-semibold text-foreground hover:text-blue-600"
                  >
                    {course.title}
                  </Link>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    /courses/{course.slug} · {course.techId}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {course.level}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  {course.chapterCount || 0}
                </span>
                <button
                  type="button"
                  onClick={() => toggleStatus(course)}
                  disabled={updating === course._id}
                  className={`w-fit text-xs font-semibold capitalize ${
                    course.status === "published"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                  title="Toggle publishing status"
                >
                  {updating === course._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    course.status
                  )}
                </button>
                <div className="flex items-center justify-end gap-1">
                  {course.status === "published" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      title="View public course"
                    >
                      <a
                        href={`https://asif.to/courses/${course.slug}`}
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
                    title="Manage chapters"
                  >
                    <Link href={`/courses/${course._id}`}>
                      <FilePenLine className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    title="Edit course"
                  >
                    <Link href={`/courses/${course._id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete course"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setDeleteCourse(course)}
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
          {pagination.total} course{pagination.total === 1 ? "" : "s"}
        </span>
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
      </footer>

      <ConfirmDialog
        isOpen={Boolean(deleteCourse)}
        onClose={() => setDeleteCourse(null)}
        onConfirm={remove}
        title="Delete course"
        description={`Delete ${deleteCourse?.title || "this course"} and all of its chapters? This cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        loading={updating === deleteCourse?._id}
      />
    </div>
  );
}
