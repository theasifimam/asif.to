"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Edit3, FilePlus2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  chaptersApi,
  coursesApi,
  quizApi,
  topicCategoriesApi,
} from "@/lib/api";
import { Button, Skeleton } from "@/components/ui";

function QuizCardSkeleton() {
  return (
    <div className="group flex min-w-0 flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950 min-h-40">
      <div className="min-w-0 space-y-3">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-3/4 rounded-md" />
          <Skeleton className="h-3.5 w-1/3 rounded-md" />
        </div>
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

function QuizRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4.5">
        <Skeleton className="h-5 w-48 rounded-md" />
        <Skeleton className="mt-1 h-3 w-32 rounded-md" />
      </td>
      <td className="px-6 py-4.5">
        <Skeleton className="h-5 w-16 rounded-full" />
      </td>
      <td className="px-6 py-4.5">
        <Skeleton className="h-4 w-12 rounded-md" />
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import AdminFormShell from "@/components/forms/AdminFormShell";
import {
  AdminContent,
  AdminFilters,
  AdminPagination,
  AdminSearch,
} from "@/components/admin";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { listingReturnTo, useUrlFilters } from "@/hooks/useUrlFilters";

const difficultyStyles = {
  easy: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  hard: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
};

export default function QuestionsPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnTo = listingReturnTo(pathname, searchParams);

  // Data state
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 20,
  });

  // URL-synced filters (course, category, chapter, search, view)
  const [filters, setFilters] = useUrlFilters({
    courseId: "all",
    categoryId: "all",
    chapterId: "all",
    search: "",
    view: "table",
  });
  const { courseId, categoryId, chapterId, search } = filters;

  const setCourseId = (value) =>
    setFilters((current) => ({
      ...current,
      courseId: value,
      categoryId: "all",
      chapterId: "all",
    }));
  const setCategoryId = (value) =>
    setFilters((current) => ({ ...current, categoryId: value }));
  const setChapterId = (value) =>
    setFilters((current) => ({ ...current, chapterId: value }));
  const setSearch = (value) =>
    setFilters((current) => ({ ...current, search: value }));
  const setViewMode = (v) => setFilters((current) => ({ ...current, view: v }));

  const viewMode = filters.view || "table";
  const editHref = (id) =>
    `/quiz/${id}/edit?returnTo=${encodeURIComponent(returnTo)}`;

  useEffect(() => {
    let active = true;

    async function loadQuestionTaxonomy() {
      if (courseId === "all") {
        setCategories([]);
        setChapters([]);
        setTaxonomyLoading(false);
        return;
      }

      setTaxonomyLoading(true);

      const [categoryResponse, chapterResponse] = await Promise.all([
        topicCategoriesApi.list(courseId),
        chaptersApi.list(courseId, { limit: 100 }),
      ]);

      if (!active) return;

      const categoryItems =
        categoryResponse?.data?.data?.data ||
        categoryResponse?.data?.data ||
        [];

      const chapterItems =
        chapterResponse?.data?.data?.data || chapterResponse?.data?.data || [];

      setCategories(Array.isArray(categoryItems) ? categoryItems : []);
      setChapters(Array.isArray(chapterItems) ? chapterItems : []);
      setTaxonomyLoading(false);
    }

    loadQuestionTaxonomy();

    return () => {
      active = false;
    };
  }, [courseId]);

  // Data fetching - strictly fetch quiz/practice questions
  const load = useCallback(async () => {
    setLoading(true);
    const params = {
      type: "quiz",
      page,
      limit,
      ...(courseId !== "all" && { courseId }),
      ...(categoryId !== "all" && { categoryId }),
      ...(chapterId !== "all" && { chapterId }),
    };
    const [response, courseResponse] = await Promise.all([
      quizApi.listAll(params),
      courses.length ? null : coursesApi.listAll(),
    ]);
    if (response.success) {
      setQuestions(response.data?.data || []);
      setPagination(
        response.data?.pagination || { page: 1, pages: 1, total: 0, limit },
      );
    } else {
      toast.error(response.error || "Unable to load questions");
    }
    if (courseResponse?.success) {
      setCourses(
        courseResponse.data?.data?.data || courseResponse.data?.data || [],
      );
    }
    setLoading(false);
  }, [courseId, categoryId, chapterId, courses.length, page, limit]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  // Client-side search filter on top of server results
  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? questions.filter((item) =>
          [
            item.question,
            item.answer,
            item.explanation,
            ...(item.options || []),
          ]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(query)),
        )
      : questions;
  }, [questions, search]);

  // Reset page when filter changes
  const filter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  // Delete handler
  const remove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const response = await quizApi.delete(deleteTarget._id);
    if (response.success) {
      toast.success("Question deleted");
      setQuestions((current) =>
        current.filter((item) => item._id !== deleteTarget._id),
      );
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
      setDeleteTarget(null);
    } else {
      toast.error(response.error || "Unable to delete question");
    }
    setDeleting(false);
  };

  return (
    <AdminFormShell
      eyebrow="Learning / Assessment"
      title="Question bank"
      description="Manage quiz and practice questions."
      actions={
        <>
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
          <Button asChild>
            <Link href={`/quiz/new?returnTo=${encodeURIComponent(returnTo)}`}>
              <Plus className="mr-2 h-4 w-4" /> New question
            </Link>
          </Button>
        </>
      }
    >
      <AdminFilters>
        <AdminSearch
          value={search}
          onChange={setSearch}
          placeholder="Search questions and answers..."
        />

        <div className="w-full md:w-56">
          <Select value={courseId} onValueChange={filter(setCourseId)}>
            <SelectTrigger className="h-10 w-full rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold dark:border-zinc-800/80 dark:bg-[#18181b]">
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-52">
          <Select
            value={categoryId}
            onValueChange={filter(setCategoryId)}
            disabled={courseId === "all" || taxonomyLoading}
          >
            <SelectTrigger className="h-10 w-full rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold dark:border-zinc-800/80 dark:bg-[#18181b]">
              <SelectValue
                placeholder={
                  courseId === "all" ? "Select course first" : "All categories"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-56">
          <Select
            value={chapterId}
            onValueChange={filter(setChapterId)}
            disabled={courseId === "all" || taxonomyLoading}
          >
            <SelectTrigger className="h-10 w-full rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold dark:border-zinc-800/80 dark:bg-[#18181b]">
              <SelectValue
                placeholder={
                  courseId === "all" ? "Select course first" : "All chapters"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All chapters</SelectItem>
              {chapters.map((chapter) => (
                <SelectItem key={chapter._id} value={chapter._id}>
                  {chapter.order ? `${chapter.order}. ` : ""}
                  {chapter.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </AdminFilters>

      <AdminContent plain={viewMode === "card"}>
        {viewMode === "card" ? (
          <div className="space-y-6">
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <QuizCardSkeleton key={i} />
                ))
              ) : visible.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-950">
                  <FilePlus2 className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
                  <p className="text-sm font-medium">
                    No questions match these filters.
                  </p>
                </div>
              ) : (
                visible.map((item) => (
                  <div
                    key={item._id}
                    className="group flex min-w-0 flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950"
                  >
                    <div className="min-w-0 space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shrink-0 ${
                              difficultyStyles[item.difficulty] || ""
                            }`}
                          >
                            {item.difficulty}
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <Link
                          href={editHref(item._id)}
                          className="font-bold text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors line-clamp-2"
                        >
                          {item.question}
                        </Link>
                        <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                          Correct: {item.options?.[item.correctIndex] || "—"}
                        </p>
                      </div>

                      {item.courses && item.courses.length > 0 && (
                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                          Courses: {item.courses.map((c) => c.title).join(", ")}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80">
                      <Link
                        href={editHref(item._id)}
                        className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Edit question &rarr;
                      </Link>

                      <div className="flex items-center gap-1 shrink-0">
                        <Link href={editHref(item._id)}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            title="Edit question"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete question"
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
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total}
                limit={limit}
                itemLabel="questions"
                onPageChange={setPage}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
              />
            )}
          </div>
        ) : (
          <div className="space-y-0">
            <div className="admin-surface w-full rounded-[28px] sm:rounded-4xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="admin-table w-full min-w-220 text-left text-sm">
                  <thead className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/75 dark:bg-[#18181b]/60 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                    <tr>
                      <th className="px-6 py-4.5">Question</th>
                      <th className="px-6 py-4.5">Course</th>
                      <th className="px-6 py-4.5">Difficulty</th>
                      <th className="px-6 py-4.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                    {loading ? (
                      Array.from({ length: limit }).map((_, i) => (
                        <QuizRowSkeleton key={i} />
                      ))
                    ) : visible.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center">
                          <div className="flex flex-col items-center justify-center text-zinc-500">
                            <FilePlus2 className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
                            <p className="text-sm font-medium">
                              No questions match these filters.
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
                              href={editHref(item._id)}
                              className="font-bold font-outfit text-zinc-950 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition-colors line-clamp-2"
                            >
                              {item.question}
                            </Link>
                            <p className="mt-0.5 line-clamp-1 text-xs text-zinc-400">
                              Correct:{" "}
                              {item.options?.[item.correctIndex] || "—"}
                            </p>
                          </td>
                          <td className="px-6 py-4.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                            {(item.courses || [])
                              .map((course) => course.title)
                              .join(", ") || "—"}
                          </td>
                          <td className="px-6 py-4.5">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                difficultyStyles[item.difficulty] || ""
                              }`}
                            >
                              {item.difficulty}
                            </span>
                          </td>
                          <td className="px-6 py-4.5">
                            <div className="flex justify-end gap-1">
                              <Link href={editHref(item._id)}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                  title="Edit question"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Delete question"
                                onClick={() => setDeleteTarget(item)}
                                className="h-8 w-8 rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                              >
                                <Trash2 className="h-4 w-4" />
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
            {!loading && visible.length > 0 && (
              <AdminPagination
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total}
                limit={limit}
                itemLabel="questions"
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
        variant="destructive"
        title="Delete question?"
        description="This permanently removes the selected question."
        confirmText="Delete"
      />
    </AdminFormShell>
  );
}
