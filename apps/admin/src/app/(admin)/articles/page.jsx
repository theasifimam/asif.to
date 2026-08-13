"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, FileText, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { articlesApi } from "@/lib/api";
import AdminFormShell from "@/components/AdminFormShell";
import { Button, Input } from "@/components/ui";
import { ConfirmDialog } from "@/components/confirm-dialog";

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await articlesApi.list({ status, limit: 100 });
    if (response.success) setArticles(response.data?.data || response.data || []);
    else toast.error(response.error || "Unable to load articles");
    setLoading(false);
  }, [status]);
  useEffect(() => { const timer = setTimeout(load, 0); return () => clearTimeout(timer); }, [load]);
  const filtered = useMemo(() => articles.filter((article) => article.title?.toLowerCase().includes(search.toLowerCase()) || article.author?.fullName?.toLowerCase().includes(search.toLowerCase())), [articles, search]);
  const remove = async () => { if (!deleteTarget) return; setDeleting(true); const response = await articlesApi.delete(deleteTarget._id); if (response.success) { toast.success("Article deleted"); setDeleteTarget(null); load(); } else toast.error(response.error || "Unable to delete article"); setDeleting(false); };

  return <AdminFormShell eyebrow="Content / Articles" title="Article library" description="Manage published articles and drafts with the same structured workflow as course topics." actions={<Link href="/articles/new"><Button><Plus className="mr-2 h-4 w-4" /> New article</Button></Link>}>
    <section className="flex flex-col gap-3 rounded-4xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-950 md:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title or author" className="rounded-2xl bg-zinc-100 pl-9 dark:bg-zinc-900" /></div><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-12 rounded-2xl border-0 bg-zinc-100 px-4 text-sm outline-none dark:bg-zinc-900 md:w-48"><option value="all">All status</option><option value="published">Published</option><option value="draft">Drafts</option></select></section>
    <section className="overflow-hidden rounded-4xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-950"><div className="overflow-x-auto"><table className="w-full min-w-190 text-left text-sm"><thead className="border-b border-zinc-200/60 bg-zinc-50/80 text-xs uppercase text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-900/60"><tr><th className="px-5 py-3">Article</th><th className="px-5 py-3">Author</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Views</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">{loading ? <tr><td colSpan="5" className="px-5 py-16 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-600" /></td></tr> : filtered.length === 0 ? <tr><td colSpan="5" className="px-5 py-16 text-center text-zinc-500"><FileText className="mx-auto mb-3 h-8 w-8 text-zinc-300" />No articles match these filters.</td></tr> : filtered.map((article) => <tr key={article._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40"><td className="px-5 py-4"><p className="font-semibold text-zinc-900 dark:text-white">{article.title}</p><p className="mt-1 text-xs text-zinc-400">/{article.slug}</p></td><td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">{article.author?.fullName || "Anonymous"}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${article.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{article.status}</span></td><td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">{article.readCount || 0}</td><td className="px-5 py-4"><div className="flex justify-end gap-1"><Link href={`/articles/edit/${article._id}`}><Button variant="ghost" size="icon"><Edit3 className="h-4 w-4" /></Button></Link><Button variant="ghost" size="icon" onClick={() => setDeleteTarget(article)} className="hover:text-red-600"><Trash2 className="h-4 w-4" /></Button></div></td></tr>)}</tbody></table></div></section>
    <ConfirmDialog isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={remove} loading={deleting} variant="destructive" title="Delete article?" description={`This permanently removes “${deleteTarget?.title || "this article"}”.`} confirmText="Delete article" />
  </AdminFormShell>;
}
