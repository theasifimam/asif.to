"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FilePenLine,
  FolderOpen,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
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
import { ViewToggle } from "@/components/ui/ViewToggle";
import { AdminPage, AdminPageHeader, AdminPagination } from "@/components/admin";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { useAuth } from "@/contexts/AuthContext";
import CourseDeletionDialog from "./components/CourseDeletionDialog";
import CourseDeletionApprovalDialog from "./components/CourseDeletionApprovalDialog";

const initialPagination = { page: 1, pages: 1, total: 0, limit: 20 };

const statusStyles = {
  published:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  draft: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
};

export default function CoursesAdminPage() {
  const { user } = useAuth();
  const canDeleteCourse = ["admin", "super_admin"].includes(user?.role);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    level: "all",
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
      setCourses((current) =>
        current.map((item) =>
          item._id === course._id ? { ...item, status } : item,
        ),
      );
    } else {
      toast.error(response.error || "Unable to update course status");
    }
    setUpdating(null);
  };

return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Content / Courses"
        title="Courses"
        description="Manage course publishing, metadata, and chapter collections."
        actions={
          <>
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
            <Button asChild className="flex-1 sm:flex-initial">
              <Link href="/courses/new">
                <Plus className="mr-2 h-4 w-4" /> New course
              </Link>
            </Button>
          </>
        }
      />

      <section className="flex flex-col gap-3 rounded-3xl border border-zinc-200/80 bg-white/90 p-3 sm:p-4 dark:border-zinc-800/80 dark:bg-[#121215]/90 md:flex-row shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            placeholder="Search courses by title, slug, technology..."
            className="rounded-full border-zinc-200/80 bg-zinc-50/80 pl-9.5 text-xs font-medium dark:border-zinc-800/80 dark:bg-[#18181b] h-10"
          />
        </div>
        <Select
          value={filters.status}
          onValueChange={(value) => setFilter("status", value)}
        >
          <SelectTrigger
            className="h-10 w-full rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b] md:w-40"
            aria-label="Filter by status"
          >
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.level}
          onValueChange={(value) => setFilter("level", value)}
        >
          <SelectTrigger
            className="h-10 w-full rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b] md:w-48"
            aria-label="Filter by level"
          >
            <SelectValue placeholder="All levels" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
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

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-[#121215]">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-3xl border border-zinc-200/80 bg-white text-zinc-500 dark:border-zinc-800/80 dark:bg-[#121215]">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
          <p className="text-sm font-medium">No courses match these filters.</p>
        </div>
      ) : viewMode === "card" ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course._id}
                className="admin-surface group flex flex-col justify-between p-5 rounded-3xl transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {course.techId}
                      </span>
                      <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                        {course.level}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleStatus(course)}
                      disabled={updating === course._id}
                      className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider transition-all ${
                        updating === course._id
                          ? "bg-zinc-100 text-zinc-400"
                          : statusStyles[course.status]
                      }`}
                      title="Toggle status"
                    >
                      {updating === course._id ? (
                        <Loader2 className="inline h-2.5 w-2.5 animate-spin" />
                      ) : (
                        course.status
                      )}
                    </button>
                  </div>

                  <div>
                    <Link
                      href={`/courses/${course._id}`}
                      className="font-bold text-zinc-950 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors line-clamp-2 text-sm sm:text-base"
                    >
                      {course.title}
                    </Link>
                    <Link
                      href={`/courses/${course._id}/categories`}
                      className="ml-2 text-xs font-bold text-green-600 hover:underline dark:text-green-400"
                    >
                      Categories
                    </Link>
                    <p className="mt-1 text-xs text-zinc-400 truncate">
                      /courses/{course.slug}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    <Layers className="h-4 w-4 text-zinc-400" />
                    <span>{course.chapterCount || 0} Chapters</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80">
                  <Link
                    href={`/courses/${course._id}`}
                    className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Manage chapters &rarr;
                  </Link>

                  <div className="flex items-center gap-1 shrink-0">
                    {course.status === "published" && (
                      <a
                        href={`https://asif.to/courses/${course.slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          title="View public course"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    <Link href={`/courses/${course._id}/edit`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        title="Edit course"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      title={canDeleteCourse ? "Delete course" : "Only admin/super admin can delete courses"}
                      onClick={() => canDeleteCourse && setDeleteCourse(course)}
                      className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <AdminPagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(p) => setFilter("page", p)}
            onLimitChange={(l) => setFilter("limit", l)}
          />
        </div>
      ) : (
        <section className="admin-surface w-full overflow-hidden rounded-[28px] sm:rounded-4xl">
          <div className="overflow-x-auto">
            <table className="admin-table w-full min-w-190 text-left text-sm">
              <thead className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/75 dark:bg-[#18181b]/60 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                <tr>
                  <th className="px-6 py-4.5">Course</th>
                  <th className="px-6 py-4.5">Level</th>
                  <th className="px-6 py-4.5">Chapters</th>
                  <th className="px-6 py-4.5">Status</th>
                  <th className="px-6 py-4.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                {courses.map((course) => (
                  <tr
                    key={course._id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="px-6 py-4.5">
                      <Link
                        href={`/courses/${course._id}`}
                        className="font-bold font-outfit text-zinc-950 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors line-clamp-1"
                      >
                        {course.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-zinc-400 truncate">
                        /courses/{course.slug} ·{" "}
                        <span className="font-semibold text-zinc-500">
                          {course.techId}
                        </span>
                      </p>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[9px] font-black uppercase text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-500/20">
                        {course.level}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                        <Layers className="h-4 w-4 text-zinc-400" />
                        <span>{course.chapterCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <button
                        onClick={() => toggleStatus(course)}
                        disabled={updating === course._id}
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider transition-all ${
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
                    <td className="px-6 py-4.5">
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
                              className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
                            className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            title="Manage chapters"
                          >
                            <FilePenLine className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/courses/${course._id}/categories`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-zinc-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                            title="Manage categories"
                          >
                            <FolderOpen className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/courses/${course._id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            title="Edit course"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={canDeleteCourse ? "Delete course" : "Only admin/super admin can delete courses"}
                          onClick={() => canDeleteCourse && setDeleteCourse(course)}
                          className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 className="h-4 w-4 text-rose-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            limit={filters.limit}
            itemLabel="courses"
            onPageChange={(p) => setFilter("page", p)}
            onLimitChange={(l) => setFilter("limit", l)}
          />
        </section>
      )}

      <CourseDeletionDialog
        course={deleteCourse}
        open={Boolean(deleteCourse)}
        onClose={() => setDeleteCourse(null)}
        onDeleted={async () => {
          setDeleteCourse(null);
          await load();
        }}
      />

      <CourseDeletionApprovalDialog
        onDeleted={async () => {
          await load();
        }}
      />
    </AdminPage>
  );
}
