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

const statusStyles = {
  published:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  draft: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
};

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
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
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
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Content / Courses
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Courses
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Manage course publishing, metadata, and chapter collections.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/courses/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New course
            </Button>
          </Link>
        </div>
      </header>

      <section className="flex flex-col gap-3 rounded-4xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-950 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            placeholder="Search title, slug, technology, or keyword"
            className="rounded-2xl bg-zinc-100 pl-9 dark:bg-zinc-900"
          />
        </div>
        <Select
          value={filters.status}
          onValueChange={(value) => setFilter("status", value)}
        >
          <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900 md:w-48" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
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
          <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900 md:w-56" aria-label="Filter by level">
            <SelectValue placeholder="All levels" />
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

      <section className="overflow-hidden rounded-4xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left text-sm">
            <thead className="border-b border-zinc-200/60 bg-zinc-50/80 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-900/60">
              <tr>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Level</th>
                <th className="px-5 py-3">Chapters</th>
                <th className="px-5 py-3">Status</th>
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
              ) : courses.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-16 text-center text-zinc-500"
                  >
                    <BookOpen className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
                    No courses match these filters.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr
                    key={course._id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/courses/${course._id}`}
                        className="font-semibold text-zinc-900 hover:text-primary dark:text-white dark:hover:text-primary"
                      >
                        {course.title}
                      </Link>
                      <p className="mt-1 text-xs text-zinc-400">
                        /courses/{course.slug} · {course.techId}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold capitalize text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                        {course.level}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-zinc-400" />
                        <span>{course.chapterCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleStatus(course)}
                        disabled={updating === course._id}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          updating === course._id
                            ? "bg-zinc-100 text-zinc-400"
                            : statusStyles[course.status]
                        }`}
                        title="Toggle publishing status"
                      >
                        {updating === course._id ? (
                          <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                        ) : (
                          course.status
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        {course.status === "published" && (
                          <a
                            href={`https://asif.to/courses/${course.slug}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View public course"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        <Link href={`/courses/${course._id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Manage chapters"
                          >
                            <FilePenLine className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/courses/${course._id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit course"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete course"
                          onClick={() => setDeleteCourse(course)}
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
      </section>

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
    </main>
  );
}
