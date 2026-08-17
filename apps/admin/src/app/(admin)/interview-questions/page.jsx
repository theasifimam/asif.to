"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  GripVertical,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
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
import { coursesApi, interviewQuestionsApi, topicCategoriesApi } from "@/lib/api";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { AdminPage, AdminPageHeader } from "@/components/admin";

export default function InterviewQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: "all",
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const load = async () => {
    setLoading(true);
    const response = await interviewQuestionsApi.list({
      ...filters,
      category: filters.category === "all" ? "" : filters.category,
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
    Promise.all([coursesApi.listAll(), topicCategoriesApi.list("all")]).then(
      ([courseResponse, categoryResponse]) => {
        if (courseResponse.success) setCourses(courseResponse.data?.data || []);
        if (categoryResponse?.success) setCategories(categoryResponse.data?.data || []);
      },
    );
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, filters.search || filters.tag ? 250 : 0);
    return () => clearTimeout(timer);
  }, [
    filters.category,
    filters.course,
    filters.search,
    filters.difficulty,
    filters.questionType,
    filters.tag,
    filters.page,
  ]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q._id === active.id);
    const newIndex = questions.findIndex((q) => q._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(questions, oldIndex, newIndex).map(
      (item, idx) => ({
        ...item,
        order: idx,
      }),
    );

    // Optimistic update
    setQuestions(reordered);

    try {
      const itemsPayload = reordered.map((item, idx) => ({
        _id: item._id,
        order: idx,
      }));
      const res = await interviewQuestionsApi.reorder(itemsPayload);
      if (res.success) {
        toast.success("Question order updated");
      } else {
        toast.error(res.error || "Failed to update question order");
        load();
      }
    } catch {
      toast.error("Failed to update question order");
      load();
    }
  };

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
        description="Maintain canonical questions assigned to primary interview categories. Drag and drop to reorder questions."
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

      <section className="grid gap-3 rounded-3xl border border-zinc-200/80 bg-white/90 p-3 sm:p-4 dark:border-zinc-800/80 dark:bg-[#121215]/90 md:grid-cols-2 xl:grid-cols-[220px_180px_minmax(180px,1fr)_150px_150px]">
        <Select
          value={filters.category}
          onValueChange={(value) => {
            if (value === "all") {
              setFilter("category", "all");
            } else {
              const selectedCat = categories.find((c) => c._id === value);
              const catCourseId =
                selectedCat?.course?._id || selectedCat?.course;
              setFilters((current) => ({
                ...current,
                category: value,
                course: catCourseId ? String(catCourseId) : current.course,
                page: 1,
              }));
            }
          }}
        >
          <SelectTrigger className="h-10 rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b] max-h-80">
            <SelectItem value="all">All categories</SelectItem>
            {(filters.course !== "all"
              ? categories.filter((c) => {
                  const catCourseId = c.course?._id || c.course;
                  return (
                    !catCourseId ||
                    String(catCourseId) === String(filters.course)
                  );
                })
              : categories
            ).map((cat) => {
              const courseTitle =
                cat.course?.title ||
                courses.find((c) => String(c._id) === String(cat.course))
                  ?.title;
              return (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}{" "}
                  <span className="text-zinc-400 font-normal">
                    ({courseTitle ? courseTitle : "Global / Standalone"})
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select
          value={filters.course}
          onValueChange={(value) => {
            setFilters((current) => {
              const currentCat = categories.find(
                (c) => c._id === current.category,
              );
              const catCourseId = currentCat?.course?._id || currentCat?.course;
              const keepCat =
                value === "all" ||
                !catCourseId ||
                String(catCourseId) === String(value);
              return {
                ...current,
                course: value,
                category: keepCat ? current.category : "all",
                page: 1,
              };
            });
          }}
        >
          <SelectTrigger className="h-10 rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
            <SelectItem value="all">All courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course._id} value={course._id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            placeholder="Search questions..."
            className="h-10 rounded-full border-zinc-200/80 bg-zinc-50/80 pl-9.5 text-xs font-medium dark:border-zinc-800/80 dark:bg-[#18181b]"
          />
        </div>
        <Select
          value={filters.difficulty}
          onValueChange={(value) => setFilter("difficulty", value)}
        >
          <SelectTrigger className="h-10 rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
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
          <SelectTrigger className="h-10 rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
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
          placeholder="Filter by tag..."
          className="h-10 rounded-full border-zinc-200/80 bg-zinc-50/80 px-4 text-xs font-medium dark:border-zinc-800/80 dark:bg-[#18181b]"
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
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map((q) => q._id)}
            strategy={verticalListSortingStrategy}
          >
            {viewMode === "card" ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {questions.map((item) => (
                    <SortableCard
                      key={item._id}
                      item={item}
                      onPreview={setPreview}
                      onDelete={setDeleteTarget}
                    />
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
              <div className="space-y-6">
                <section className="admin-surface w-full rounded-[28px] sm:rounded-4xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="admin-table w-full min-w-205 text-left text-sm">
                      <thead className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/75 dark:bg-[#18181b]/60 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                        <tr>
                          <th className="py-4.5 pl-4 sm:pl-6 w-10"></th>
                          <th className="px-4 py-4.5">Question</th>
                          <th className="px-6 py-4.5">Category</th>
                          <th className="px-6 py-4.5">Course</th>
                          <th className="px-6 py-4.5">Difficulty</th>
                          <th className="px-6 py-4.5">Type</th>
                          <th className="px-6 py-4.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                        {questions.map((item) => (
                          <SortableTableRow
                            key={item._id}
                            item={item}
                            onPreview={setPreview}
                            onDelete={setDeleteTarget}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

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
            )}
          </SortableContext>
        </DndContext>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl sm:rounded-4xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <button
              onClick={() => setPreview(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-4 pr-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{preview.difficulty}</Badge>
                <Badge variant="outline">{preview.questionType}</Badge>
                {preview.category?.name && (
                  <Badge variant="secondary">{preview.category.name}</Badge>
                )}
                {preview.course?.title && (
                  <Badge variant="outline">{preview.course.title}</Badge>
                )}
              </div>
              <h2 className="text-xl font-black text-zinc-950 dark:text-white">
                {preview.question}
              </h2>
              <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Answer
                </p>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {preview.answer}
                </div>
              </div>
              {preview.codeExample && (
                <div className="rounded-2xl bg-zinc-950 p-4 text-xs font-mono text-zinc-100 overflow-x-auto">
                  <p className="text-zinc-500 mb-2">Code Example</p>
                  <pre>{preview.codeExample}</pre>
                </div>
              )}
              {preview.expectedOutput && (
                <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-4 text-xs font-mono text-zinc-800 dark:text-zinc-200 overflow-x-auto">
                  <p className="text-zinc-400 mb-1">Expected Output</p>
                  <pre>{preview.expectedOutput}</pre>
                </div>
              )}
              {preview.followUps?.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Follow-up Questions
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-xs text-zinc-600 dark:text-zinc-400">
                    {preview.followUps.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Interview Question"
        description={`Are you sure you want to delete "${deleteTarget?.question}"? This will remove it from its interview category landing page.`}
        confirmText="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={remove}
      />
    </AdminPage>
  );
}

function SortableTableRow({ item, onPreview, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group transition-colors ${
        isDragging
          ? "bg-blue-50/50 dark:bg-blue-900/20 shadow-lg"
          : "hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
      }`}
    >
      <td className="py-4.5 pl-4 sm:pl-6 w-10">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td className="max-w-xl px-4 py-4.5">
        <p
          className="font-bold font-outfit text-zinc-950 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer line-clamp-2"
          onClick={() => onPreview(item)}
        >
          {item.question}
        </p>
        <p className="mt-0.5 text-xs text-zinc-400 truncate">
          #{item.slug}
        </p>
      </td>
      <td className="px-6 py-4.5">
        <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-black uppercase text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-500/20">
          {item.category?.name || "Global / Unassigned"}
        </span>
      </td>
      <td className="px-6 py-4.5">
        {item.course?.title ? (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            {item.course.title}
          </span>
        ) : (
          <span className="text-xs text-zinc-400 font-mono">None</span>
        )}
      </td>
      <td className="px-6 py-4.5">
        <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-300">
          {item.difficulty}
        </span>
      </td>
      <td className="px-6 py-4.5">
        <span className="text-xs font-semibold capitalize text-zinc-600 dark:text-zinc-400">
          {item.questionType}
        </span>
      </td>
      <td className="px-6 py-4.5">
        <div className="flex justify-end gap-1">
          {(item.category?.slug || item.course?.slug) && (
            <Link
              href={
                item.course?.slug && item.category?.slug
                  ? `https://asif.to/${item.course.slug}/interview-questions/${item.category.slug}`
                  : `https://asif.to/interview-questions/${item.category?.slug || item.course?.slug || "fundamentals"}`
              }
              target="_blank"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title="View landing page on asif.to"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Preview in admin"
            onClick={() => onPreview(item)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Link href={`/interview-questions/${item._id}/edit`}>
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
            className="h-8 w-8 rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            title="Delete question"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function SortableCard({ item, onPreview, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex min-w-0 flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950 ${
        isDragging ? "ring-2 ring-blue-500 shadow-xl" : ""
      }`}
    >
      <div className="min-w-0 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-500/20 shrink-0">
              {item.category?.name || "No Category"}
            </span>
            {item.course?.title && (
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 truncate max-w-full inline-block">
                {item.course.title}
              </span>
            )}
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0">
              {item.difficulty}
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <h3
            className="font-bold text-zinc-900 dark:text-white line-clamp-3 wrap-break-word cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={() => onPreview(item)}
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
          onClick={() => onPreview(item)}
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
            onClick={() => onPreview(item)}
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
            onClick={() => onDelete(item)}
            className="h-8 w-8 rounded-lg text-zinc-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}
