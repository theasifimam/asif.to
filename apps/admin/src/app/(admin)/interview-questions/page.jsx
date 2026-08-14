"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { coursesApi, interviewQuestionsApi } from "@/lib/api";
import { ViewToggle } from "@/components/ViewToggle";
import { AdminPage, AdminPageHeader } from "@/components/admin";

export default function InterviewQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    course: "all",
    search: "",
    difficulty: "all",
    questionType: "all",
    tag: "",
    page: 1,
  });
  const [viewMode, setViewMode] = useState("table");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    const response = await interviewQuestionsApi.list({
      ...filters,
      course: filters.course === "all" ? "" : filters.course,
      difficulty: filters.difficulty === "all" ? "" : filters.difficulty,
      questionType: filters.questionType === "all" ? "" : filters.questionType,
      limit: 20,
    });
    if (response.success) {
      setQuestions(response.data?.data || []);
      setPagination(
        response.data?.pagination || { page: 1, pages: 1, total: 0 },
      );
    } else toast.error(response.error || "Unable to load interview questions");
    setLoading(false);
  };

  useEffect(() => {
    coursesApi.listAll().then((response) => {
      if (response.success) setCourses(response.data?.data || []);
      else toast.error(response.error || "Unable to load courses");
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, filters.search || filters.tag ? 250 : 0);
    return () => clearTimeout(timer);
  }, [
    filters.course,
    filters.search,
    filters.difficulty,
    filters.questionType,
    filters.tag,
    filters.page,
  ]);

  const remove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const response = await interviewQuestionsApi.delete(deleteTarget._id);
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

  const setFilter = (key, value) =>
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Content / Interview Questions"
        title="Question library"
        description="Maintain canonical questions that can be reused across interview topics."
        actions={
          <>
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
            <Button asChild className="flex-1 sm:flex-initial">
              <Link href="/interview-questions/new">
                <Plus className="h-4 w-4" /> Question
              </Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-3 rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white p-3.5 sm:p-5 dark:border-zinc-800/60 dark:bg-zinc-950 md:grid-cols-2 xl:grid-cols-[200px_minmax(220px,1fr)_170px_190px_minmax(180px,0.6fr)]">
        <Select
          value={filters.course}
          onValueChange={(value) => setFilter("course", value)}
        >
          <SelectTrigger className="h-12 rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900">
            <SelectValue />
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            placeholder="Search questions"
            className="rounded-2xl bg-zinc-100 pl-9 dark:bg-zinc-900"
          />
        </div>
        <Select
          value={filters.difficulty}
          onValueChange={(value) => setFilter("difficulty", value)}
        >
          <SelectTrigger className="h-12 rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.questionType}
          onValueChange={(value) => setFilter("questionType", value)}
        >
          <SelectTrigger className="h-12 rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="conceptual">Conceptual</SelectItem>
            <SelectItem value="coding">Coding</SelectItem>
            <SelectItem value="behavioral">Behavioral</SelectItem>
            <SelectItem value="scenario">Scenario</SelectItem>
            <SelectItem value="debugging">Debugging</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={filters.tag}
          onChange={(event) => setFilter("tag", event.target.value)}
          placeholder="Filter by tag"
          className="rounded-2xl bg-zinc-100 dark:bg-zinc-900"
        />
      </section>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-950">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-950">
          <p className="text-sm font-medium">
            No questions match these filters.
          </p>
        </div>
      ) : viewMode === "card" ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {questions.map((item) => (
              <div
                key={item._id}
                className="group flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        {item.course?.title || "Unassigned"}
                      </span>
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {item.difficulty}
                      </span>
                      <span className="text-[10px] font-bold capitalize text-zinc-400">
                        {item.questionType}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3
                      className="font-bold text-zinc-900 dark:text-white line-clamp-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={() => setPreview(item)}
                    >
                      {item.question}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400 truncate">
                      #{item.slug}
                    </p>
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-lg bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-[10px] font-bold text-zinc-400 self-center">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80">
                  <button
                    onClick={() => setPreview(item)}
                    className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
                  >
                    Quick view
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      title="Preview question"
                      onClick={() => setPreview(item)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Link href={`/interview-questions/${item._id}/edit`}>
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

          <footer className="flex items-center justify-between rounded-3xl border border-zinc-200/60 bg-white px-5 py-4 text-sm text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-950">
            <span>{pagination.total || 0} questions</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page - 1,
                  }))
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-20 text-center text-xs font-medium">
                {pagination.page || 1} / {pagination.pages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={pagination.page >= pagination.pages}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page + 1,
                  }))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </footer>
        </div>
      ) : (
        <section className="w-full bg-white dark:bg-zinc-900 rounded-3xl sm:rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-205 text-left text-sm">
              <thead className="border-b border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                <tr>
                  <th className="px-6 py-4">Question</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Tags</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                {questions.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="max-w-xl px-6 py-4">
                      <p
                        className="font-bold text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer line-clamp-2"
                        onClick={() => setPreview(item)}
                      >
                        {item.question}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400 truncate">
                        #{item.slug}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-500/20">
                        {item.course?.title || "Unassigned"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-300">
                        {item.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold capitalize text-zinc-600 dark:text-zinc-400">
                        {item.questionType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex max-w-56 flex-wrap gap-1">
                        {(item.tags || []).slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-lg bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        {item.course?.slug && item.slug && (
                          <Link
                            href={`https://asif.to/courses/${item.course.slug}/interview-questions/${item.slug}`}
                            target="_blank"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              title="View on asif.to"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Preview in admin"
                          onClick={() => setPreview(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Link href={`/interview-questions/${item._id}/edit`}>
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
          <footer className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/70 px-6 py-3.5 text-xs text-zinc-400 font-medium">
            <span>{pagination.total || 0} questions</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-xl"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page - 1,
                  }))
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-20 text-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
                {pagination.page || 1} / {pagination.pages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-xl"
                disabled={pagination.page >= pagination.pages}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page + 1,
                  }))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </footer>
        </section>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <article className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl sm:rounded-4xl bg-white p-5 sm:p-6 shadow-xl dark:bg-zinc-950">
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-500">
                  {preview.course?.title || "Unassigned"} / {preview.difficulty}{" "}
                  / {preview.questionType}
                </p>
                <h2 className="mt-2 text-xl sm:text-2xl font-bold">
                  {preview.question}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                title="Close preview"
                onClick={() => setPreview(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </header>
            <div className="mt-6 whitespace-pre-wrap leading-7 text-zinc-700 dark:text-zinc-300 text-sm sm:text-base">
              {preview.answer}
            </div>
            {preview.codeExample && (
              <pre className="mt-6 overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-xs sm:text-sm text-white">
                <code>{preview.codeExample}</code>
              </pre>
            )}
          </article>
        </div>
      )}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        loading={deleting}
        title="Delete interview question?"
        description="This permanently removes the canonical question. Questions assigned to topics must be detached first."
        confirmText="Delete"
        variant="destructive"
      />
    </AdminPage>
  );
}
