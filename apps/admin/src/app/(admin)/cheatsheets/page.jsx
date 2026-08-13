"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, FileCode, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cheatsheetsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminContent,
  AdminFilters,
  AdminPage,
  AdminPageHeader,
  AdminPagination,
  AdminSearch,
} from "@/components/admin";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TECH_IDS } from "./components/CheatsheetForm";

const PAGE_SIZE = 20;
export default function CheatsheetsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tech, setTech] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    const response = await cheatsheetsApi.list({ status: "all" });
    if (response.success) setItems(response.data?.data || []);
    else toast.error(response.error || "Unable to load cheatsheets");
    setLoading(false);
  }, []);
  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);
  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const query = search.trim().toLowerCase();
        return (
          (!query ||
            [item.title, item.description, item.slug].some((value) =>
              value?.toLowerCase().includes(query),
            )) &&
          (tech === "all" || item.techId === tech) &&
          (status === "all" || item.status === status)
        );
      }),
    [items, search, tech, status],
  );
  const pages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const updateFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };
  const remove = async () => {
    setDeleting(true);
    const response = await cheatsheetsApi.delete(deleteTarget._id);
    if (response.success) {
      toast.success("Cheatsheet deleted");
      setDeleteTarget(null);
      load();
    } else toast.error(response.error || "Unable to delete cheatsheet");
    setDeleting(false);
  };
  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Learning / Reference"
        title="Cheatsheets"
        description="Create and manage syntax reference cheatsheets for technology tracks."
        actions={
          <Link href="/cheatsheets/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New cheatsheet
            </Button>
          </Link>
        }
      />
      <AdminFilters>
        <AdminSearch
          value={search}
          onChange={updateFilter(setSearch)}
          placeholder="Search titles, descriptions, or slugs"
        />
        <Select value={tech} onValueChange={updateFilter(setTech)}>
          <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 dark:bg-zinc-900 md:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All technologies</SelectItem>
            {TECH_IDS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={updateFilter(setStatus)}>
          <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 dark:bg-zinc-900 md:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
          </SelectContent>
        </Select>
      </AdminFilters>
      <AdminContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left text-sm">
            <thead className="border-b border-zinc-200/60 bg-zinc-50/80 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-900/60">
              <tr>
                <th className="px-5 py-3">Cheatsheet</th>
                <th className="px-5 py-3">Technology</th>
                <th className="px-5 py-3">Snippets</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-600" />
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-zinc-500">
                    <FileCode className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
                    No cheatsheets match these filters.
                  </td>
                </tr>
              ) : (
                visible.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                  >
                    <td className="max-w-xl px-5 py-4">
                      <p className="font-semibold text-zinc-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">/{item.slug}</p>
                    </td>
                    <td className="px-5 py-4 font-medium">{item.techId}</td>
                    <td className="px-5 py-4 text-zinc-500">
                      {item.snippets?.length || 0}
                    </td>
                    <td className="px-5 py-4 capitalize">{item.status}</td>
                    <td className="px-5 py-4 tabular-nums text-zinc-500">
                      {item.order ?? 0}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Link href={`/cheatsheets/${item._id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit cheatsheet"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete cheatsheet"
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
        <AdminPagination
          page={page}
          pages={pages}
          total={filtered.length}
          itemLabel="cheatsheets"
          onPageChange={setPage}
        />
      </AdminContent>
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        loading={deleting}
        title="Delete cheatsheet?"
        description={`This permanently removes ${deleteTarget?.title || "this cheatsheet"}.`}
        confirmText="Delete"
        variant="destructive"
      />
    </AdminPage>
  );
}
