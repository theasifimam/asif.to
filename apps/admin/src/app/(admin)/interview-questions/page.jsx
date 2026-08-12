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
    setDeleting(true);
    const response = await interviewQuestionsApi.delete(deleteTarget._id);
    if (response.success) {
      toast.success("Question deleted");
      setDeleteTarget(null);
      load();
    } else toast.error(response.error || "Unable to delete question");
    setDeleting(false);
  };

  const setFilter = (key, value) =>
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Content / Interview Questions
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Question library
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Maintain canonical questions that can be reused across interview
            topics.
          </p>
        </div>
        <Link href="/interview-questions/new">
          <Button>
            <Plus className="h-4 w-4" /> New question
          </Button>
        </Link>
      </header>

      <section className="grid gap-3 rounded-4xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-950 md:grid-cols-2 xl:grid-cols-[200px_minmax(220px,1fr)_170px_190px_minmax(180px,0.6fr)]">
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

      <section className="overflow-hidden rounded-4xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-205 text-left text-sm">
            <thead className="border-b border-zinc-200/60 bg-zinc-50/80 text-xs uppercase text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-900/60">
              <tr>
                <th className="px-5 py-3">Question</th>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Difficulty</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Tags</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-600" />
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-16 text-center text-zinc-500"
                  >
                    No questions match these filters.
                  </td>
                </tr>
              ) : (
                questions.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                  >
                    <td className="max-w-xl px-5 py-4">
                      <p className="font-semibold text-zinc-900 dark:text-white">
                        {item.question}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">#{item.slug}</p>
                    </td>
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                      {item.course?.title || "Unassigned"}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="outline" className="capitalize">
                        {item.difficulty}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 capitalize text-zinc-600 dark:text-zinc-300">
                      {item.questionType}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex max-w-56 flex-wrap gap-1">
                        {(item.tags || []).slice(0, 4).map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Preview question"
                          onClick={() => setPreview(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Link href={`/interview-questions/${item._id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
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
            <span>
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
      </section>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <article className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-4xl bg-white p-6 shadow-xl dark:bg-zinc-950">
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-500">
                  {preview.course?.title || "Unassigned"} / {preview.difficulty}{" "}
                  / {preview.questionType}
                </p>
                <h2 className="mt-2 text-2xl font-bold">{preview.question}</h2>
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
            <div className="mt-6 whitespace-pre-wrap leading-7 text-zinc-700 dark:text-zinc-300">
              {preview.answer}
            </div>
            {preview.codeExample && (
              <pre className="mt-6 overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-sm text-white">
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
    </main>
  );
}
