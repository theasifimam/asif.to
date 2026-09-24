"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Link as LinkIcon,
  X,
  Search,
} from "lucide-react";
import { internalLinksApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import LogoLoader from "@/components/ui/LogoLoader";

export default function InternalLinksManager() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    keyword: "",
    aliases: "",
    url: "",
    priority: 5,
    maxPerPage: 1,
    enabled: true,
  });

  const fetchLinks = async () => {
    setLoading(true);
    const res = await internalLinksApi.list();
    if (res.success) {
      setLinks(res.data?.data || []);
    } else {
      toast.error(res.error || "Failed to load links");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      keyword: "",
      aliases: "",
      url: "",
      priority: 5,
      maxPerPage: 1,
      enabled: true,
    });
  };

  const handleEdit = (link) => {
    setEditingId(link._id);
    setForm({
      keyword: link.keyword,
      aliases: (link.aliases || []).join(", "),
      url: link.url,
      priority: link.priority || 5,
      maxPerPage: link.maxPerPage || 1,
      enabled: link.enabled ?? true,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this internal link rule?"))
      return;
    const res = await internalLinksApi.delete(id);
    if (res.success) {
      toast.success("Rule deleted");
      fetchLinks();
    } else {
      toast.error(res.error || "Failed to delete");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.keyword.trim() || !form.url.trim()) {
      return toast.error("Keyword and URL are required");
    }

    const payload = {
      ...form,
      aliases: form.aliases
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      priority: Number(form.priority) || 5,
      maxPerPage: Number(form.maxPerPage) || 1,
    };

    let res;
    if (editingId && editingId !== "new") {
      res = await internalLinksApi.update(editingId, payload);
    } else {
      res = await internalLinksApi.create(payload);
    }

    if (res.success) {
      toast.success(editingId ? "Rule updated" : "Rule created");
      resetForm();
      fetchLinks();
    } else {
      toast.error(res.error || "Failed to save rule");
    }
  };

  const filteredLinks = links.filter((link) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      link.keyword?.toLowerCase().includes(q) ||
      link.url?.toLowerCase().includes(q) ||
      link.aliases?.some((a) => a.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="admin-surface rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <LinkIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-outfit text-xl font-black text-zinc-950 dark:text-white">
                Internal Links Dictionary
              </h2>
              <p className="text-xs text-zinc-500">
                Automatically link keywords to specific pages across the site.
              </p>
            </div>
          </div>
          {!editingId && (
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rules..."
                  className="pl-9 rounded-full border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-[#18181b] h-10 text-xs w-48 lg:w-64"
                />
              </div>
              <Button
                onClick={() => setEditingId("new")}
                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Add Rule
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Search - shown only on small screens when not editing */}
        {!editingId && (
          <div className="relative mb-6 sm:hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rules..."
              className="pl-9 rounded-full border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-[#18181b] h-10 text-xs w-full"
            />
          </div>
        )}

        {editingId && (
          <form
            onSubmit={handleSave}
            className="mb-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 p-5 space-y-4"
          >
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
              {editingId === "new" ? "New Link Rule" : "Edit Link Rule"}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Target Keyword
                </Label>
                <Input
                  value={form.keyword}
                  onChange={(e) =>
                    setForm({ ...form, keyword: e.target.value })
                  }
                  placeholder="e.g. React Hooks"
                  required
                  className="rounded-full border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-[#18181b] h-10 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Target URL
                </Label>
                <Input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="/courses/reactjs"
                  required
                  className="rounded-full border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-[#18181b] h-10 text-xs"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Aliases (comma separated)
                </Label>
                <Input
                  value={form.aliases}
                  onChange={(e) =>
                    setForm({ ...form, aliases: e.target.value })
                  }
                  placeholder="react hook, react's hooks"
                  className="rounded-full border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-[#18181b] h-10 text-xs"
                />
                <p className="text-[10px] text-zinc-500 font-medium">
                  Other variations of this word that should also trigger the
                  link.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Max Per Page
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={form.maxPerPage}
                  onChange={(e) =>
                    setForm({ ...form, maxPerPage: e.target.value })
                  }
                  className="rounded-full border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-[#18181b] h-10 text-xs"
                />
                <p className="text-[10px] text-zinc-500 font-medium">
                  How many times this keyword can be linked on a single page.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Priority
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                  className="rounded-full border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-[#18181b] h-10 text-xs"
                />
                <p className="text-[10px] text-zinc-500 font-medium">
                  Higher priority rules are matched first (default 5).
                </p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={(e) =>
                      setForm({ ...form, enabled: e.target.checked })
                    }
                    className="rounded h-4 w-4 accent-blue-600"
                  />
                  Enable this rule
                </label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full px-5 shadow-xs"
              >
                Save Rule
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="rounded-full border-zinc-200 dark:border-zinc-800 text-xs font-bold"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {loading && !editingId ? (
          <div className="py-12 flex justify-center">
            <LogoLoader className="h-6 w-6 text-blue-600" />
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {filteredLinks.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs font-medium">
                {searchQuery
                  ? "No matching rules found."
                  : "No internal link rules found. Add one to get started."}
              </div>
            ) : (
              filteredLinks.map((link) => (
                <div
                  key={link._id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 ${!link.enabled ? "opacity-50" : ""}`}
                >
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      {!link.enabled && (
                        <X className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      )}
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate">
                        {link.keyword}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs">
                      <code className="font-mono text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full">
                        {link.url}
                      </code>
                      {link.aliases?.length > 0 && (
                        <span
                          className="text-zinc-500 font-medium truncate max-w-[200px]"
                          title={link.aliases.join(", ")}
                        >
                          Aliases: {link.aliases.join(", ")}
                        </span>
                      )}
                      <span className="text-zinc-400 dark:text-zinc-600 hidden sm:inline">
                        •
                      </span>
                      <span className="text-zinc-500 font-medium">
                        Max {link.maxPerPage} / Pri {link.priority}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(link)}
                      className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(link._id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
