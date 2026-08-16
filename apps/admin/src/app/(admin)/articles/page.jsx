"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, FileText, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { articlesApi } from "@/lib/api";
import AdminFormShell from "@/components/forms/AdminFormShell";
import { Button, Input } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { ViewToggle } from "@/components/ui/ViewToggle";

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await articlesApi.list({ status, limit: 100 });
    if (response.success)
      setArticles(response.data?.data || response.data || []);
    else toast.error(response.error || "Unable to load articles");
    setLoading(false);
  }, [status]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const filtered = useMemo(
    () =>
      articles.filter(
        (article) =>
          article.title?.toLowerCase().includes(search.toLowerCase()) ||
          article.author?.fullName
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          article.slug?.toLowerCase().includes(search.toLowerCase()),
      ),
    [articles, search],
  );

  const remove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const response = await articlesApi.delete(deleteTarget._id);
    if (response.success) {
      toast.success("Article deleted");
      setArticles((current) =>
        current.filter((item) => item._id !== deleteTarget._id),
      );
      setDeleteTarget(null);
    } else {
      toast.error(response.error || "Unable to delete article");
    }
    setDeleting(false);
  };

  return (
    <AdminFormShell
      eyebrow="Content & Curriculum"
      title="Articles"
      description="Manage educational content, tutorials, and written guides."
      actions={
        <>
          <ViewToggle
            view={viewMode}
            onViewChange={setViewMode}
          />
          <Button size="sm" className="shadow-lg shadow-blue-500/20" asChild>
            <Link href="/articles/new">
              <Plus className="mr-1.5 h-4 w-4" /> New article
            </Link>
          </Button>
        </>
      }
    >
      <section className="flex flex-col gap-3 rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white p-3.5 sm:p-5 dark:border-zinc-800/60 dark:bg-zinc-950 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, slug, or author"
            className="rounded-2xl bg-zinc-100 pl-9 dark:bg-zinc-900"
          />
        </div>
        <div className="md:w-48">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-12 rounded-2xl border-0 bg-zinc-100 px-4 text-sm dark:bg-zinc-900">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-950">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-950">
          <FileText className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
          <p className="text-sm font-medium">
            No articles match these filters.
          </p>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <div
              key={article._id}
              className="admin-surface group flex flex-col justify-between p-5 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      article.status === "published"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                    }`}
                  >
                    {article.status}
                  </span>
                  <span className="text-[11px] font-bold text-zinc-400">
                    {article.readCount || 0} reads
                  </span>
                </div>

                <div>
                  <Link
                    href={`/articles/edit/${article._id}`}
                    className="font-bold text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors line-clamp-2"
                  >
                    {article.title}
                  </Link>
                  <p className="mt-1 text-xs text-zinc-400 truncate">
                    /{article.slug}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 text-[10px] font-black">
                    {article.author?.fullName?.charAt(0) || "A"}
                  </div>
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 truncate">
                    {article.author?.fullName || "Anonymous"}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Link href={`/articles/edit/${article._id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      title="Edit article"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(article)}
                    className="h-8 w-8 rounded-lg text-zinc-400 hover:text-red-600"
                    title="Delete article"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <section className="admin-surface w-full rounded-[28px] sm:rounded-4xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table w-full min-w-190 text-left text-sm">
              <thead className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/75 dark:bg-[#18181b]/60 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                <tr>
                  <th className="px-6 py-4.5">Article</th>
                  <th className="px-6 py-4.5">Author</th>
                  <th className="px-6 py-4.5">Status</th>
                  <th className="px-6 py-4.5">Views</th>
                  <th className="px-6 py-4.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                {filtered.map((article) => (
                  <tr
                    key={article._id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="px-6 py-4.5">
                      <Link
                        href={`/articles/edit/${article._id}`}
                        className="font-bold font-outfit text-zinc-950 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors line-clamp-1"
                      >
                        {article.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-zinc-400 truncate">
                        /{article.slug}
                      </p>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 text-[10px] font-black">
                          {article.author?.fullName?.charAt(0) || "A"}
                        </div>
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                          {article.author?.fullName || "Anonymous"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          article.status === "published"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                        {article.readCount || 0} reads
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex justify-end gap-1">
                        <Link href={`/articles/edit/${article._id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            title="Edit article"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(article)}
                          className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete article"
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
        </section>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        loading={deleting}
        variant="destructive"
        title="Delete article?"
        description={`This permanently removes “${deleteTarget?.title || "this article"}”.`}
        confirmText="Delete article"
      />
    </AdminFormShell>
  );
}
