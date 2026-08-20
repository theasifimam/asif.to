"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Trash2, Plus } from "lucide-react";
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
} from "@dnd-kit/sortable";
import {
  AdminFilters,
  AdminPage,
  AdminPageHeader,
  AdminSearch,
  AdminPagination,
} from "@/components/admin";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { topicCategoriesApi, coursesApi } from "@/lib/api";
import { useState, useEffect, useMemo } from "react";

export default function CourseCategoriesPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  // Pagination — keep page/limit as independent state so they are stable deps
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Load course info for title
  useEffect(() => {
    coursesApi.getById(courseId).then((res) => {
      if (res.success) setCourse(res.data?.data);
      else toast.error(res.error || "Unable to load course");
    });
  }, [courseId]);

  const loadCategories = async () => {
    setLoading(true);
    const resp = await topicCategoriesApi.list(courseId, { page, limit });
    if (resp.success) {
      setCategories(resp.data?.data || []);
      const pag = resp.data?.pagination || {};
      setPagination({ page: pag.page || page, pages: pag.pages || 1, total: pag.total || 0, limit });
    } else {
      toast.error(resp.error || "Unable to load categories");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, page, limit]);

  const filtered = useMemo(() => {
    return categories.filter((cat) => {
      const s = search.toLowerCase();
      return (
        !search ||
        cat.name?.toLowerCase().includes(s) ||
        cat.slug?.toLowerCase().includes(s) ||
        cat.description?.toLowerCase().includes(s)
      );
    });
  }, [categories, search]);

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
      const payload = reordered.map((c) => ({ _id: c._id, order: c.order }));
      const res = await topicCategoriesApi.reorder(payload);
      if (res.success) toast.success("Category order updated");
      else {
        toast.error(res.error || "Failed to update order");
        loadCategories();
      }
    } catch {
      toast.error("Failed to update order");
      loadCategories();
    } finally {
      setIsReordering(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const resp = await topicCategoriesApi.delete(deleteTarget._id);
    if (resp.success) {
      toast.success("Category deleted");
      setDeleteTarget(null);
      loadCategories();
    } else toast.error(resp.error || "Unable to delete category");
    setDeleting(false);
  };

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Content / Courses / Categories"
        title={
          course?.title ? `${course.title} – Categories` : "Course Categories"
        }
        description="Manage categories for this course. Drag to reorder."
        actions={
          <>
            <Button asChild className="shadow-lg shadow-blue-500/20">
              <Link href={`/categories/new?course=${courseId}`}>
                <Plus className="mr-1.5 h-4 w-4" /> New category
              </Link>
            </Button>
          </>
        }
      />

      <AdminFilters>
        <AdminSearch
          value={search}
          onChange={setSearch}
          placeholder="Search categories..."
        />
      </AdminFilters>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-[#121215]">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filtered.map((c) => c._id)}
            strategy={verticalListSortingStrategy}
          >
            <table className="admin-table w-full min-w-190 text-left text-sm">
              <thead className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/75 dark:bg-[#18181b]/60 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                <tr>
                  <th className="px-6 py-4.5">Name</th>
                  <th className="px-6 py-4.5">Slug</th>
                  <th className="px-6 py-4.5">Status</th>
                  <th className="px-6 py-4.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                {filtered.map((cat) => (
                  <tr
                    key={cat._id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="px-6 py-4.5">
                      <Link
                        href={`/courses/${courseId}/categories/${cat._id}/interview-questions`}
                        className="font-semibold text-zinc-950 hover:text-blue-600 hover:underline dark:text-zinc-100 dark:hover:text-blue-400"
                      >
                        {cat.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4.5">{cat.slug}</td>
                    <td className="px-6 py-4.5">{cat.status}</td>
                    <td className="px-6 py-4.5 text-right">
                      <Link
                        href={`/courses/${courseId}/categories/${cat._id}/interview-questions`}
                        className="mr-3 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Questions
                      </Link>
                      <Link
                        href={`/categories/${cat._id}/edit?course=${courseId}`}
                        className="mr-2 text-xs font-bold text-green-600 hover:underline dark:text-green-400"
                      >
                        Edit
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete category"
                        onClick={() => setDeleteTarget(cat)}
                        className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        setOpen={() => setDeleteTarget(null)}
        title="Delete category?"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={remove}
        confirmLabel="Delete"
        loading={deleting}
      />
      {/* Pagination Controls */}
      <AdminPagination
        page={pagination.page}
        pages={pagination.pages}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
        className="mt-4"
      />
    </AdminPage>
  );
}
