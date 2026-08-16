"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Edit3,
  ExternalLink,
  Eye,
  FolderTree,
  Globe,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AdminFilters,
  AdminPage,
  AdminPageHeader,
  AdminSearch,
} from "@/components/admin";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { Button } from "@/components/ui/button";
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
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { coursesApi, topicCategoriesApi } from "@/lib/api";

export default function CategoriesListPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    coursesApi.listAll().then((response) => {
      setCourses(response.data?.data || []);
    });
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const response = await topicCategoriesApi.list(filterCourse);
    if (response.success) {
      setCategories(response.data?.data || []);
    } else {
      toast.error(response.error || "Unable to load categories");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, [filterCourse]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchSearch =
        !search ||
        cat.name?.toLowerCase().includes(search.toLowerCase()) ||
        cat.slug?.toLowerCase().includes(search.toLowerCase()) ||
        cat.description?.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        filterStatus === "all" || cat.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [categories, search, filterStatus]);

  const remove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const response = await topicCategoriesApi.delete(deleteTarget._id);
    if (response.success) {
      toast.success("Category deleted");
      setDeleteTarget(null);
      loadCategories();
    } else {
      toast.error(response.error || "Unable to delete category");
    }
    setDeleting(false);
  };

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Taxonomy & Landing Pages"
        title="Interview Categories"
        description="Manage category taxonomies, landing intro guides, and search engine metadata."
        actions={
          <>
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
            <Button asChild className="shadow-lg shadow-blue-500/20">
              <Link href="/categories/new">
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
          onChange={setSearch}
          placeholder="Search categories by name, slug, or description..."
        />

        <div className="w-full sm:w-56">
          <Select value={filterCourse} onValueChange={setFilterCourse}>
            <SelectTrigger className="h-10 rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b]">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
              <SelectItem value="all">All Categories (Global & Course)</SelectItem>
              {courses.map((item) => (
                <SelectItem key={item._id} value={item._id}>
                  {item.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-40">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
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
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-950">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-950">
          <FolderTree className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-700" />
          <p className="text-sm font-medium">No categories match your filters.</p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/categories/new">
              <Plus className="mr-1.5 h-4 w-4" /> Create Category
            </Link>
          </Button>
        </div>
      ) : viewMode === "card" ? (
        /* Cards View */
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((item) => {
              const liveUrl = item.slug
                ? `https://asif.to/interview-questions/${item.slug}`
                : "";
              return (
                <div
                  key={item._id}
                  className="group flex min-w-0 flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950"
                >
                  <div className="min-w-0 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 truncate max-w-full inline-block">
                          {item.course?.title || "Global Category"}
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
                      <span className="text-[10px] font-bold text-zinc-400">
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
                      <p className="mt-1 text-xs text-zinc-400 truncate">
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
                      onClick={() => setPreview(item)}
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
                        onClick={() => setPreview(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Link href={`/categories/${item._id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          title="Edit category"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete category"
                        onClick={() => setDeleteTarget(item)}
                        className="h-8 w-8 rounded-lg text-zinc-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table View */
        <section className="admin-surface w-full rounded-[28px] sm:rounded-4xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="admin-table w-full min-w-160 text-left text-sm">
              <thead className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/75 dark:bg-[#18181b]/60 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Category</th>
                  <th className="py-3.5 px-4">Course Assignment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4 text-right sm:pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredCategories.map((item) => {
                  const liveUrl = item.slug
                    ? `https://asif.to/interview-questions/${item.slug}`
                    : "";
                  return (
                    <tr
                      key={item._id}
                      className="group transition-colors hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40"
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <div className="min-w-0">
                          <Link
                            href={`/categories/${item._id}/edit`}
                            className="font-bold text-zinc-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition-colors"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-zinc-400">
                            /{item.slug}
                          </p>
                          {item.description && (
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 max-w-md">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {item.course?.title || "Global Standalone"}
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
                      <td className="py-4 px-4 text-xs font-mono text-zinc-500">
                        #{item.order ?? 0}
                      </td>
                      <td className="py-4 px-4 text-right sm:pr-6">
                        <div className="flex items-center justify-end gap-1">
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
                            title="Preview category"
                            onClick={() => setPreview(item)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Link href={`/categories/${item._id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              title="Edit category"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete category"
                            onClick={() => setDeleteTarget(item)}
                            className="h-8 w-8 rounded-lg text-zinc-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Quick View Dialog */}
      <Dialog open={Boolean(preview)} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl border-zinc-200/80 bg-white p-6 shadow-2xl dark:border-zinc-800/80 dark:bg-[#121215]">
          {preview && (
            <div className="space-y-5">
              <DialogHeader className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    {preview.course?.title || "Global Category"}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {preview.status || "published"}
                  </span>
                </div>
                <DialogTitle className="font-outfit text-2xl font-black text-zinc-950 dark:text-white pt-1">
                  {preview.name}
                </DialogTitle>
                <p className="text-xs text-zinc-400 font-mono">
                  Slug: /{preview.slug}
                </p>
              </DialogHeader>

              {preview.description && (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Description
                  </h4>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {preview.description}
                  </p>
                </div>
              )}

              {preview.content && (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Landing Guide Notes
                  </h4>
                  <div
                    className="mt-2 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4 text-xs dark:border-zinc-800/80 dark:bg-zinc-900/50 max-h-48 overflow-y-auto leading-relaxed prose dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: preview.content }}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                    SEO Title
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                    {preview.seoTitle || preview.name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                    Sort Order
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                    #{preview.order ?? 0}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Button variant="outline" onClick={() => setPreview(null)}>
                  Close
                </Button>
                <Button asChild>
                  <Link href={`/categories/${preview._id}/edit`}>
                    <Edit3 className="mr-2 h-4 w-4" /> Edit Category
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Category?"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Questions and topics linked to this category may become unassigned.`}
        confirmLabel="Delete Category"
        tone="destructive"
        loading={deleting}
        onConfirm={remove}
      />
    </AdminPage>
  );
}
