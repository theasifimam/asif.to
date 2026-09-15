"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Edit3,
  Eye,
  GripVertical,
  Plus,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  coursesApi,
  interviewQuestionsApi,
  topicCategoriesApi,
} from "@/lib/api";
import {
  AdminFilters,
  AdminPage,
  AdminPageHeader,
  AdminPagination,
  AdminSearch,
} from "@/components/admin";
import { listingReturnTo, useUrlFilters } from "@/hooks/useUrlFilters";

function InterviewQuestionRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4.5">
        <Skeleton className="h-5 w-48 rounded-md" />
        <Skeleton className="mt-1.5 h-3 w-32 rounded-md" />
      </td>
      <td className="px-6 py-4.5">
        <Skeleton className="h-4 w-24 rounded-md" />
      </td>
      <td className="px-6 py-4.5">
        <Skeleton className="h-4 w-16 rounded-md" />
      </td>
      <td className="px-6 py-4.5 text-right">
        <div className="flex justify-end items-center gap-3">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-4 w-10 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </td>
    </tr>
  );
}

function SortableTableRow({ item, onPreview, onDelete, editHref }) {
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
      className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors ${
        isDragging ? "bg-blue-50/50 dark:bg-blue-950/30" : ""
      }`}
    >
      <td className="px-6 py-4.5">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 shrink-0"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => onPreview(item)}
              className="text-left font-semibold text-zinc-950 hover:text-blue-600 hover:underline dark:text-zinc-100 dark:hover:text-blue-400 block truncate"
            >
              {item.question}
            </button>
            {item.slug && (
              <p className="text-xs text-zinc-400 truncate mt-0.5">#{item.slug}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4.5 text-zinc-600 dark:text-zinc-400 font-medium">
        {item.category?.name || item.course?.title || "General"}
      </td>
      <td className="px-6 py-4.5 text-zinc-600 dark:text-zinc-400">
        <span className="capitalize text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
          {item.status || "published"}
        </span>
      </td>
      <td className="px-6 py-4.5 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={() => onPreview(item)}
          className="mr-3 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
        >
          Quick view
        </button>
        <Link
          href={editHref(item._id)}
          className="mr-2 text-xs font-bold text-green-600 hover:underline dark:text-green-400"
        >
          Edit
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Delete question"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete(item);
          }}
          className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600"
        >
          <Trash2 className="h-4 w-4 text-rose-500" />
        </Button>
      </td>
    </tr>
  );
}

export default function InterviewQuestionsManager({
  lockedCourseId = "",
  lockedCategoryId = "",
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnTo = listingReturnTo(pathname, searchParams);
  const isScoped = Boolean(lockedCourseId && lockedCategoryId);
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useUrlFilters({
    category: "all",
    course: "all",
    search: "",
    difficulty: "all",
    questionType: "all",
    tag: "",
    page: 1,
  });

  const editHref = (id) =>
    `/interview-questions/${id}/edit?returnTo=${encodeURIComponent(returnTo)}`;
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [limit, setLimit] = useState(20);
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
      category:
        lockedCategoryId ||
        (filters.category === "all" ? "" : filters.category),
      course:
        lockedCourseId || (filters.course === "all" ? "" : filters.course),
      difficulty: filters.difficulty === "all" ? "" : filters.difficulty,
      questionType: filters.questionType === "all" ? "" : filters.questionType,
      limit,
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
        if (categoryResponse?.success)
          setCategories(categoryResponse.data?.data || []);
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
    limit,
    lockedCourseId,
    lockedCategoryId,
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

  const scopedCourse = isScoped
    ? courses.find((course) => String(course._id) === String(lockedCourseId))
    : null;
  const scopedCategory = isScoped
    ? categories.find(
        (category) => String(category._id) === String(lockedCategoryId),
      )
    : null;

  const newQuestionHref = isScoped
    ? `/interview-questions/new?course=${encodeURIComponent(
        lockedCourseId,
      )}&category=${encodeURIComponent(
        lockedCategoryId,
      )}&returnTo=${encodeURIComponent(returnTo)}`
    : `/interview-questions/new?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow={
          isScoped
            ? "Content / Courses / Categories / Interview Questions"
            : "Content / Interview Questions"
        }
        title={
          isScoped
            ? scopedCategory?.name
              ? `${scopedCategory.name} questions`
              : "Category interview questions"
            : "Question library"
        }
        description={
          isScoped
            ? `Manage only the interview questions in ${
                scopedCategory?.name || "this category"
              }${scopedCourse?.title ? ` · ${scopedCourse.title}` : ""}. Drag to reorder.`
            : "Maintain canonical questions assigned to primary interview categories. Drag to reorder."
        }
        actions={
          <>
            {isScoped && (
              <Button
                variant="outline"
                asChild
                className="flex-1 sm:flex-initial"
              >
                <Link href={`/courses/${lockedCourseId}/categories`}>
                  Categories
                </Link>
              </Button>
            )}
            <Button asChild className="shadow-lg shadow-blue-500/20 flex-1 sm:flex-initial">
              <Link href={newQuestionHref}>
                <Plus className="mr-1.5 h-4 w-4" /> Question
              </Link>
            </Button>
          </>
        }
      />

      <AdminFilters>
        <AdminSearch
          value={filters.search}
          onChange={(v) => setFilter("search", v)}
          placeholder="Search questions..."
        />

        <Select
          value={isScoped ? lockedCourseId : filters.course}
          disabled={isScoped}
          onValueChange={(val) => setFilter("course", val)}
        >
          <SelectTrigger className="h-10 w-full md:w-44 rounded-full border-zinc-200/80 bg-zinc-50/80 px-4 text-xs font-semibold dark:border-zinc-800/80 dark:bg-[#18181b]">
            <SelectValue placeholder="All courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={isScoped ? lockedCategoryId : filters.category}
          disabled={isScoped}
          onValueChange={(val) => setFilter("category", val)}
        >
          <SelectTrigger className="h-10 w-full md:w-44 rounded-full border-zinc-200/80 bg-zinc-50/80 px-4 text-xs font-semibold dark:border-zinc-800/80 dark:bg-[#18181b]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.difficulty}
          onValueChange={(val) => setFilter("difficulty", val)}
        >
          <SelectTrigger className="h-10 w-full md:w-36 rounded-full border-zinc-200/80 bg-zinc-50/80 px-4 text-xs font-semibold dark:border-zinc-800/80 dark:bg-[#18181b]">
            <SelectValue placeholder="All difficulties" />
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
          onValueChange={(val) => setFilter("questionType", val)}
        >
          <SelectTrigger className="h-10 w-full md:w-36 rounded-full border-zinc-200/80 bg-zinc-50/80 px-4 text-xs font-semibold dark:border-zinc-800/80 dark:bg-[#18181b]">
            <SelectValue placeholder="All types" />
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
      </AdminFilters>

      {loading || questions.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map((q) => q._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="admin-surface w-full rounded-[28px] sm:rounded-4xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="overflow-x-auto">
                <table className="admin-table w-full min-w-190 text-left text-sm">
                  <thead className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/75 dark:bg-[#18181b]/60 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                    <tr>
                      <th className="px-6 py-4.5">Question</th>
                      <th className="px-6 py-4.5">Category</th>
                      <th className="px-6 py-4.5">Status</th>
                      <th className="px-6 py-4.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                    {loading
                      ? Array.from({ length: limit }).map((_, i) => (
                          <InterviewQuestionRowSkeleton key={i} />
                        ))
                      : questions.map((item) => (
                          <SortableTableRow
                            key={item._id}
                            item={item}
                            onPreview={setPreview}
                            onDelete={setDeleteTarget}
                            editHref={editHref}
                          />
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 rounded-3xl border border-zinc-200/80 bg-white text-zinc-500 dark:border-zinc-800/80 dark:bg-[#121215]">
          <p className="text-sm font-medium">No questions match these filters.</p>
        </div>
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
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Interview Question"
        description={`Are you sure you want to delete "${deleteTarget?.question}"? Only a Super Admin, Admin, or authorized author can delete this question.`}
        confirmText="Delete Question"
        variant="destructive"
        loading={deleting}
        onConfirm={remove}
      />

      <AdminPagination
        page={pagination.page || 1}
        pages={pagination.pages || 1}
        total={pagination.total || 0}
        limit={limit}
        itemLabel="questions"
        onPageChange={(p) => setFilters((c) => ({ ...c, page: p }))}
        onLimitChange={(l) => {
          setLimit(l);
          setFilters((c) => ({ ...c, page: 1 }));
        }}
        className="mt-4"
      />
    </AdminPage>
  );
}
