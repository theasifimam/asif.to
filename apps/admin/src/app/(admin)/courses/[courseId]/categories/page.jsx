"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Edit3,
  ExternalLink,
  Eye,
  FolderTree,
  GripVertical,
  Plus,
  Trash2,
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
import {
  AdminFilters,
  AdminPage,
  AdminPageHeader,
  AdminPagination,
  AdminSearch,
} from "@/components/admin";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DeletionDialog from "@/components/shared/DeletionDialog";
import DeletionApprovalDialog from "@/components/shared/DeletionApprovalDialog";
import { coursesApi, topicCategoriesApi } from "@/lib/api";

function CategoryCardSkeleton() {
  return (
    <div className="admin-surface flex flex-col justify-between p-5 rounded-3xl min-h-40">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-3/4 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-1/2 rounded-md" />
          <Skeleton className="h-4.5 w-full rounded-md" />
        </div>
      </div>
      <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-12 rounded-md" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function CategoryRowSkeleton() {
  return (
    <tr>
      <td className="py-3.5 pl-4 sm:pl-6 w-10">
        <Skeleton className="h-4 w-4 rounded-md" />
      </td>
      <td className="py-3.5 px-4">
        <Skeleton className="h-5 w-48 rounded-md" />
        <Skeleton className="mt-1 h-3.5 w-32 rounded-md" />
      </td>
      <td className="py-3.5 px-4">
        <Skeleton className="h-4 w-20 rounded-md" />
      </td>
      <td className="py-3.5 px-4">
        <Skeleton className="h-5 w-16 rounded-full" />
      </td>
      <td className="py-3.5 px-4">
        <Skeleton className="h-4 w-6 rounded-md" />
      </td>
      <td className="py-3.5 px-4 text-right sm:pr-6">
        <div className="flex justify-end gap-1.5">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </td>
    </tr>
  );
}

export default function CourseCategoriesPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("card");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [preview, setPreview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Load course info for page header title
  useEffect(() => {
    if (!courseId) return;
    coursesApi.getById(courseId).then((res) => {
      if (res.success) setCourse(res.data?.data);
      else toast.error(res.error || "Unable to load course details");
    });
  }, [courseId]);

  const loadCategories = async () => {
    setLoading(true);
    const resp = await topicCategoriesApi.list(courseId);
    if (resp.success) {
      setCategories(resp.data?.data || []);
    } else {
      toast.error(resp.error || "Unable to load categories");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const s = search.toLowerCase();
      const matchSearch =
        !search ||
        cat.name?.toLowerCase().includes(s) ||
        cat.slug?.toLowerCase().includes(s) ||
        cat.description?.toLowerCase().includes(s);

      const matchStatus = filterStatus === "all" || cat.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [categories, search, filterStatus]);

  const totalPages = Math.max(Math.ceil(filteredCategories.length / limit), 1);
  const paginatedCategories = filteredCategories.slice(
    (page - 1) * limit,
    page * limit,
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = categories.findIndex((c) => c._id === active.id);
    const newIdx = categories.findIndex((c) => c._id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    const reordered = arrayMove(categories, oldIdx, newIdx).map((c, i) => ({
      ...c,
      order: i,
    }));

    setCategories(reordered);
    setIsReordering(true);
    try {
      const payload = reordered.map((c, i) => ({ _id: c._id, order: i }));
      const res = await topicCategoriesApi.reorder(payload);
      if (res.success) toast.success("Category order updated");
      else {
        toast.error(res.error || "Failed to update category order");
        loadCategories();
      }
    } catch {
      toast.error("Failed to update category order");
      loadCategories();
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Content / Courses / Categories"
        title={course?.title ? `${course.title} – Categories` : "Course Categories"}
        description="Manage categories for this course. Drag and drop to reorder."
        actions={
          <>
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
            <Button asChild className="shadow-lg shadow-blue-500/20">
              <Link href={`/categories/new?course=${courseId}`}>
                <Plus className="mr-1.5 h-4 w-4" /> New category
              </Link>
            </Button>
          </>
        }
      />

      {/* Filters Bar */}
      <AdminFilters>
        <AdminSearch
          value={search}
          onChange={(s) => {
            setSearch(s);
            setPage(1);
          }}
          placeholder="Search categories by name, slug, or description..."
        />

        <div className="w-full sm:w-40">
          <Select
            value={filterStatus}
            onValueChange={(status) => {
              setFilterStatus(status);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-10 rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AdminFilters>

      {/* Content Section */}
      {viewMode === "card" ? (
        <div className="space-y-6">
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: limit }).map((_, i) => (
                <CategoryCardSkeleton key={i} />
              ))
            ) : filteredCategories.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-950">
                <FolderTree className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                <p className="text-sm font-medium">No categories match your filters.</p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link href={`/categories/new?course=${courseId}`}>
                    <Plus className="mr-1.5 h-4 w-4" /> Create Category
                  </Link>
                </Button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredCategories.map((c) => c._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {paginatedCategories.map((item) => (
                    <SortableCategoryCard
                      key={item._id}
                      item={item}
                      courseTitle={course?.title}
                      onPreview={() => setPreview(item)}
                      onDelete={() => setDeleteTarget(item)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>

          {!loading && filteredCategories.length > 0 && (
            <AdminPagination
              page={page}
              pages={totalPages}
              total={filteredCategories.length}
              limit={limit}
              itemLabel="categories"
              onPageChange={(p) => setPage(p)}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
            />
          )}
        </div>
      ) : (
        <section className="admin-surface w-full rounded-[28px] sm:rounded-4xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="admin-table w-full min-w-160 text-left text-sm">
                <thead className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/75 dark:bg-[#18181b]/60 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                  <tr>
                    <th className="py-3.5 pl-4 sm:pl-6 w-10"></th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Course Assignment</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Order</th>
                    <th className="py-3.5 px-4 text-right sm:pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {loading ? (
                    Array.from({ length: limit }).map((_, i) => (
                      <CategoryRowSkeleton key={i} />
                    ))
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center">
                        <div className="flex flex-col items-center justify-center text-zinc-500">
                          <FolderTree className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                          <p className="text-sm font-medium">No categories match your filters.</p>
                          <Button asChild variant="outline" size="sm" className="mt-4">
                            <Link href={`/categories/new?course=${courseId}`}>
                              <Plus className="mr-1.5 h-4 w-4" /> Create Category
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <SortableContext
                      items={paginatedCategories.map((c) => c._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {paginatedCategories.map((item) => (
                        <SortableCategoryRow
                          key={item._id}
                          item={item}
                          courseId={courseId}
                          courseTitle={course?.title}
                          onPreview={() => setPreview(item)}
                          onDelete={() => setDeleteTarget(item)}
                        />
                      ))}
                    </SortableContext>
                  )}
                </tbody>
              </table>
            </DndContext>
          </div>

          {!loading && filteredCategories.length > 0 && (
            <AdminPagination
              page={page}
              pages={totalPages}
              total={filteredCategories.length}
              limit={limit}
              itemLabel="categories"
              onPageChange={(p) => setPage(p)}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
            />
          )}
        </section>
      )}

      {/* Quick View Dialog */}
      {preview && (
        <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
            <DialogHeader>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                <FolderTree size={16} />
                <span>{course?.title || preview.course?.title || "Course Category"}</span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-black font-outfit mt-1">
                {preview.name}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-5 text-sm text-zinc-600 dark:text-zinc-300">
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  Slug: #{preview.slug}
                </span>
                <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  Order Index: #{preview.order ?? 0}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  Status: {preview.status || "published"}
                </span>
              </div>

              {preview.description && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Subtitle / Summary
                  </h4>
                  <p className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 leading-relaxed">
                    {preview.description}
                  </p>
                </div>
              )}

              {preview.seoTitle && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    SEO Meta Title
                  </h4>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {preview.seoTitle}
                  </p>
                </div>
              )}

              {preview.seoDescription && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    SEO Meta Description
                  </h4>
                  <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {preview.seoDescription}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <Button variant="outline" onClick={() => setPreview(null)}>
                Close
              </Button>
              <Button asChild>
                <Link href={`/categories/${preview._id}/edit`}>
                  <Edit3 className="mr-1.5 h-4 w-4" /> Edit Category
                </Link>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <DeletionDialog
        entityModel="TopicCategory"
        entity={deleteTarget}
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={async () => {
          setDeleteTarget(null);
          await loadCategories();
        }}
      />

      <DeletionApprovalDialog
        onDeleted={async () => {
          await loadCategories();
        }}
      />
    </AdminPage>
  );
}

function SortableCategoryRow({ item, courseId, courseTitle, onPreview, onDelete }) {
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

  const liveUrl = item.slug
    ? item.course?.slug
      ? `https://asif.to/${item.course.slug}/interview-questions/${item.slug}`
      : `https://asif.to/interview-questions/${item.slug}`
    : "";

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group transition-colors ${
        isDragging
          ? "bg-blue-50/50 dark:bg-blue-900/20 shadow-lg"
          : "hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40"
      }`}
    >
      <td className="py-4 pl-4 sm:pl-6 w-10">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors touch-none"
        >
          <GripVertical size={16} />
        </button>
      </td>
      <td className="py-4 px-4">
        <div className="min-w-0">
          <Link
            href={`/courses/${courseId}/categories/${item._id}/interview-questions`}
            className="font-bold text-zinc-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition-colors"
          >
            {item.name}
          </Link>
          <p className="text-xs text-zinc-400 font-mono">/{item.slug}</p>
          {item.description && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 max-w-md">
              {item.description}
            </p>
          )}
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="inline-flex items-center text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          {courseTitle || item.course?.title || "Global Standalone"}
        </span>
      </td>
      <td className="py-4 px-4">
        <span
          className={`inline-flex items-center text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
            item.status === "published"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/20"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          {item.status || "published"}
        </span>
      </td>
      <td className="py-4 px-4 text-xs font-mono font-bold text-zinc-500">
        #{item.order ?? 0}
      </td>
      <td className="py-4 px-4 text-right sm:pr-6">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/courses/${courseId}/categories/${item._id}/interview-questions`}
            className="mr-2 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            Questions
          </Link>
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
              title="View Frontend Landing Page"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            title="Preview details"
            onClick={onPreview}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8 rounded-lg"
            title="Edit category"
          >
            <Link href={`/categories/${item._id}/edit`}>
              <Edit3 className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete category"
            onClick={onDelete}
            className="h-8 w-8 rounded-lg text-zinc-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function SortableCategoryCard({ item, courseTitle, onPreview, onDelete }) {
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

  const liveUrl = item.slug
    ? item.course?.slug
      ? `https://asif.to/${item.course.slug}/interview-questions/${item.slug}`
      : `https://asif.to/interview-questions/${item.slug}`
    : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex min-w-0 flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950 ${
        isDragging ? "ring-2 ring-blue-500 shadow-xl" : ""
      }`}
    >
      <div className="min-w-0 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <button
              type="button"
              {...attributes}
              {...listeners}
              aria-label="Drag to reorder"
              className="cursor-grab active:cursor-grabbing p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 touch-none"
            >
              <GripVertical size={15} />
            </button>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 truncate max-w-full inline-block">
              {courseTitle || item.course?.title || "Global Category"}
            </span>
            <span
              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shrink-0 ${
                item.status === "published"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/20"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {item.status || "published"}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-zinc-400">
            #{item.order ?? 0}
          </span>
        </div>

        <div className="min-w-0">
          <Link
            href={`/categories/${item._id}/edit`}
            className="font-bold text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors text-base line-clamp-2 wrap-break-word"
          >
            {item.name}
          </Link>
          <p className="mt-1 text-xs text-zinc-400 font-mono truncate">
            #{item.slug}
          </p>
          {item.description && (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80">
        <button
          onClick={onPreview}
          className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
        >
          Quick view
        </button>

        <div className="flex items-center gap-1 shrink-0">
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
              title="View Frontend Landing Page"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            title="Preview details"
            onClick={onPreview}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8 rounded-lg"
            title="Edit category"
          >
            <Link href={`/categories/${item._id}/edit`}>
              <Edit3 className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete category"
            onClick={onDelete}
            className="h-8 w-8 rounded-lg text-zinc-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}
