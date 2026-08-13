"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Edit3,
  FilePlus2,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { coursesApi, interviewQuestionsApi, quizApi } from "@/lib/api";
import { Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/confirm-dialog";
import AdminFormShell from "@/components/AdminFormShell";
import {
  AdminContent,
  AdminFilters,
  AdminPagination,
  AdminSearch,
} from "@/components/admin";
import { ViewToggle } from "@/components/ViewToggle";

const difficultyStyles = {
  easy: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  hard: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState("all");
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = {
      type,
      page,
      limit: 20,
      ...(courseId !== "all" && { courseId }),
    };
    const [response, courseResponse] = await Promise.all([
      quizApi.listAll(params),
      courses.length ? null : coursesApi.listAll(),
    ]);
    if (response.success) {
      setQuestions(response.data?.data || []);
      setPagination(
        response.data?.pagination || { page: 1, pages: 1, total: 0 },
      );
    } else toast.error(response.error || "Unable to load questions");
    if (courseResponse?.success)
      setCourses(
        courseResponse.data?.data?.data || courseResponse.data?.data || [],
      );
    setLoading(false);
  }, [courseId, courses.length, page, type]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

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

  const filter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const response = await (
      deleteTarget.type === "interview" ? interviewQuestionsApi : quizApi
    ).delete(deleteTarget._id);
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
    } else toast.error(response.error || "Unable to delete question");
    setDeleting(false);
  };

  return (
    <AdminFormShell
      eyebrow="Learning / Assessment"
      title="Question bank"
      description="Manage quiz/practice and detailed interview questions from one collection."
      actions={
        <div className="flex items-center gap-2 sm:w-full">
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
          <Link href="/quiz/new" className="md:flex-1 sm:flex-2 sm:w-full">
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Question
            </Button>
          </Link>
        </div>
      }
    >
      <AdminFilters>
        <AdminSearch
          value={search}
          onChange={setSearch}
          placeholder="Search questions and answers"
        />
        <div className="relative md:w-52">
          <select
            value={type}
            onChange={filter(setType)}
            className="h-12 w-full appearance-none rounded-2xl border-0 bg-zinc-100 px-4 text-sm dark:bg-zinc-900"
          >
            <option value="all">All types</option>
            <option value="quiz">Quiz / practice</option>
            <option value="interview">Interview</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-4 h-4 w-4 text-zinc-400" />
        </div>
        <div className="relative md:w-64">
          <select
            value={courseId}
            onChange={filter(setCourseId)}
            className="h-12 w-full appearance-none rounded-2xl border-0 bg-zinc-100 px-4 text-sm dark:bg-zinc-900"
          >
            <option value="all">All courses</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-4 h-4 w-4 text-zinc-400" />
        </div>
      </AdminFilters>

      <AdminContent plain={viewMode === "card"}>
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-950">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-950">
            <FilePlus2 className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
            <p className="text-sm font-medium">
              No questions match these filters.
            </p>
          </div>
        ) : viewMode === "card" ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((item) => (
                <div
                  key={item._id}
                  className="group flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                          {item.type}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            difficultyStyles[item.difficulty] || ""
                          }`}
                        >
                          {item.difficulty}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Link
                        href={`/quiz/${item._id}/edit`}
                        className="font-bold text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors line-clamp-3"
                      >
                        {item.question}
                      </Link>
                      <p className="mt-2 line-clamp-2 text-xs text-zinc-400">
                        {item.type === "interview"
                          ? item.answer
                          : `Correct: ${item.options?.[item.correctIndex] || "—"}`}
                      </p>
                    </div>

                    {(item.courses?.length > 0 || item.course?.title) && (
                      <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                        {item.type === "interview"
                          ? item.course?.title
                          : item.courses?.map((c) => c.title).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80">
                    <Link
                      href={`/quiz/${item._id}/edit`}
                      className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Edit question &rarr;
                    </Link>

                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/quiz/${item._id}/edit`}>
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
              ))}
            </div>
            <AdminPagination
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              itemLabel="questions"
              onPageChange={setPage}
            />
          </div>
        ) : (
          <div className="w-full bg-white dark:bg-zinc-900 rounded-3xl sm:rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-220 text-left text-sm">
                <thead className="border-b border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  <tr>
                    <th className="px-6 py-4">Question</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Difficulty</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                  {visible.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="max-w-xl px-6 py-4">
                        <Link
                          href={`/quiz/${item._id}/edit`}
                          className="font-bold text-zinc-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition-colors line-clamp-2"
                        >
                          {item.question}
                        </Link>
                        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-400">
                          {item.type === "interview"
                            ? item.answer
                            : `Correct: ${item.options?.[item.correctIndex] || "—"}`}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-500/20">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        {item.type === "interview"
                          ? item.course?.title || "—"
                          : (item.courses || [])
                              .map((course) => course.title)
                              .join(", ") || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            difficultyStyles[item.difficulty] || ""
                          }`}
                        >
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <Link href={`/quiz/${item._id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              title="Edit question"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete question"
                            className="h-8 w-8 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                            onClick={() => setDeleteTarget(item)}
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
            <AdminPagination
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              itemLabel="questions"
              onPageChange={setPage}
            />
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
