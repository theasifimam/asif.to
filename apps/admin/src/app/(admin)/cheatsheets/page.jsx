"use client";

import { useState, useEffect, useCallback } from "react";
import { cheatsheetsApi } from "@/lib/api";
import Editor from "@/components/Editor";
import { Sparkles, Plus, Pencil, Trash2, Loader2, X, Save, FileCode, Hash } from "lucide-react";
import { toast } from "sonner";

const TECH_IDS = ["reactjs", "nextjs", "nodejs", "expressjs", "mongodb", "tailwindcss", "javascript"];

const DEFAULT_FORM = {
  techId: "",
  title: "",
  description: "",
  snippets: [{ name: "", code: "", language: "javascript" }],
  status: "published",
};

export default function CheatsheetsAdminPage() {
  const [cheatsheets, setCheatsheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await cheatsheetsApi.list();
    if (res.success) setCheatsheets(res.data?.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (cs) => {
    setEditTarget(cs);
    setForm({
      techId: cs.techId,
      title: cs.title,
      description: cs.description || "",
      snippets: cs.snippets?.length
        ? cs.snippets
        : [{ name: "", code: "", language: "javascript" }],
      status: cs.status,
    });
    setShowCreate(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = editTarget
      ? await cheatsheetsApi.update(editTarget._id, form)
      : await cheatsheetsApi.create(form);
    if (res.success) {
      toast.success(editTarget ? "Cheatsheet updated!" : "Cheatsheet created!");
      setShowCreate(false);
      setEditTarget(null);
      setForm(DEFAULT_FORM);
      load();
    } else {
      toast.error(res.error || "Failed to save cheatsheet");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this cheatsheet?")) return;
    setDeleting(id);
    const res = await cheatsheetsApi.delete(id);
    if (res.success) {
      toast.success("Deleted.");
      setCheatsheets((prev) => prev.filter((c) => c._id !== id));
    } else {
      toast.error(res.error || "Failed to delete");
    }
    setDeleting(null);
  };

  const updateSnippet = (i, field, value) => {
    const s = [...form.snippets];
    s[i] = { ...s[i], [field]: value };
    setForm({ ...form, snippets: s });
  };

  const addSnippet = () =>
    setForm({ ...form, snippets: [...form.snippets, { name: "", code: "", language: "javascript" }] });

  const removeSnippet = (i) =>
    setForm({ ...form, snippets: form.snippets.filter((_, j) => j !== i) });

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <FileCode className="w-6 h-6 text-blue-500" />
            Cheatsheet Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create and manage syntax reference cheatsheets for courses.
          </p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setEditTarget(null); setForm(DEFAULT_FORM); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Cheatsheet
        </button>
      </div>

      {/* Cheatsheet List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : cheatsheets.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800">
          <FileCode className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="font-bold text-sm text-muted-foreground">No cheatsheets yet.</p>
          <p className="text-xs text-zinc-400 mt-1">Click "New Cheatsheet" to create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cheatsheets.map((cs) => (
            <div
              key={cs._id}
              className="flex items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all border border-zinc-100 dark:border-zinc-800"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Hash className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5">
                    {cs.techId}
                  </p>
                  <h3 className="font-extrabold text-sm text-foreground truncate">{cs.title}</h3>
                  <p className="text-xs text-muted-foreground">{cs.snippets?.length ?? 0} Snippets</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(cs)}
                  className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-500 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cs._id)}
                  disabled={deleting === cs._id}
                  className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  {deleting === cs._id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-zinc-950 rounded-3xl p-6 shadow-2xl space-y-6 my-8 border border-zinc-200 dark:border-zinc-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-foreground">
                {editTarget ? "Edit Cheatsheet" : "New Cheatsheet"}
              </h2>
              <button
                onClick={() => { setShowCreate(false); setEditTarget(null); }}
                className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tech + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Tech Stack *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.techId}
                    onChange={(e) => setForm({ ...form, techId: e.target.value })}
                  >
                    <option value="">Select tech...</option>
                    {TECH_IDS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Title *
                </label>
                <input
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. React Hooks Cheatsheet"
                />
              </div>

              {/* Description using same rich MD Editor as courses */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Description / Overview (Markdown supported)
                </label>
                <Editor
                  value={form.description}
                  onChange={(val) => setForm({ ...form, description: val })}
                  placeholder="Write a brief description or overview for this cheatsheet..."
                />
              </div>

              {/* Code Snippets */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Code Snippets ({form.snippets.length})
                  </label>
                  <button
                    type="button"
                    onClick={addSnippet}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Snippet
                  </button>
                </div>

                <div className="space-y-4">
                  {form.snippets.map((sn, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <input
                          className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 text-xs font-medium border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Snippet name (e.g. useState Hook)"
                          value={sn.name}
                          onChange={(e) => updateSnippet(i, "name", e.target.value)}
                        />
                        <select
                          className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 text-xs font-medium border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                          value={sn.language}
                          onChange={(e) => updateSnippet(i, "language", e.target.value)}
                        >
                          {["javascript", "jsx", "typescript", "tsx", "html", "css", "bash", "json", "text"].map((l) => (
                            <option key={l}>{l}</option>
                          ))}
                        </select>
                        {form.snippets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSnippet(i)}
                            className="p-1.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={5}
                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 text-xs font-mono border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                        placeholder={`// Paste your ${sn.language || "code"} snippet here...`}
                        value={sn.code}
                        onChange={(e) => updateSnippet(i, "code", e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 flex-1 justify-center py-3 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editTarget ? "Save Changes" : "Create Cheatsheet"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setEditTarget(null); }}
                  className="flex-1 py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
