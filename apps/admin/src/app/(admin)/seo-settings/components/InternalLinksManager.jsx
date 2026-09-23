import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Link as LinkIcon, Check, X, AlertCircle } from "lucide-react";
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
    setForm({ keyword: "", aliases: "", url: "", priority: 5, maxPerPage: 1, enabled: true });
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
    if (!confirm("Are you sure you want to delete this internal link rule?")) return;
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
      aliases: form.aliases.split(",").map(a => a.trim()).filter(Boolean),
      priority: Number(form.priority) || 5,
      maxPerPage: Number(form.maxPerPage) || 1,
    };

    let res;
    if (editingId) {
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
              <p className="text-xs text-zinc-500">Automatically link keywords to specific pages across the site.</p>
            </div>
          </div>
          {!editingId && (
            <Button onClick={() => setEditingId("new")} className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 shadow-xs cursor-pointer">
              <Plus className="h-4 w-4 mr-1.5" /> Add Rule
            </Button>
          )}
        </div>

        {editingId && (
          <form onSubmit={handleSave} className="mb-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">{editingId === "new" ? "New Link Rule" : "Edit Link Rule"}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Target Keyword</Label>
                <Input value={form.keyword} onChange={e => setForm({...form, keyword: e.target.value})} placeholder="e.g. React Hooks" required className="rounded-full border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-[#18181b] h-10 text-xs" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Target URL</Label>
                <Input value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="/courses/reactjs" required className="rounded-full border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-[#18181b] h-10 text-xs" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Aliases (comma separated)</Label>
                <Input value={form.aliases} onChange={e => setForm({...form, aliases: e.target.value})} placeholder="react hook, react's hooks" className="rounded-full border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-[#18181b] h-10 text-xs" />
                <p className="text-[10px] text-zinc-500 font-medium">Other variations of this word that should also trigger the link.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Max Per Page</Label>
                <Input type="number" min="1" max="10" value={form.maxPerPage} onChange={e => setForm({...form, maxPerPage: e.target.value})} className="rounded-full border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-[#18181b] h-10 text-xs" />
                <p className="text-[10px] text-zinc-500 font-medium">How many times this keyword can be linked on a single page.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Priority</Label>
                <Input type="number" min="1" max="100" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="rounded-full border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-[#18181b] h-10 text-xs" />
                <p className="text-[10px] text-zinc-500 font-medium">Higher priority rules are matched first (default 5).</p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input type="checkbox" checked={form.enabled} onChange={e => setForm({...form, enabled: e.target.checked})} className="rounded h-4 w-4 accent-blue-600" />
                  Enable this rule
                </label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full px-5 shadow-xs">Save Rule</Button>
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-full border-zinc-200 dark:border-zinc-800 text-xs font-bold">Cancel</Button>
            </div>
          </form>
        )}

        {loading && !editingId ? (
          <div className="py-12 flex justify-center"><LogoLoader className="h-6 w-6 text-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
            <table className="admin-table text-left text-sm">
              <thead>
                <tr>
                  <th>Keyword & Aliases</th>
                  <th>Target URL</th>
                  <th>Limits</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-zinc-500 text-xs font-medium">
                      No internal link rules found. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  links.map((link) => (
                    <tr key={link._id} className={`${!link.enabled ? 'opacity-50' : ''}`}>
                      <td>
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          {!link.enabled && <X className="h-3.5 w-3.5 text-red-500" />}
                          {link.keyword}
                        </div>
                        {link.aliases?.length > 0 && (
                          <div className="text-[10px] text-zinc-500 font-medium mt-0.5 line-clamp-1 max-w-[220px]">
                            {link.aliases.join(", ")}
                          </div>
                        )}
                      </td>
                      <td>
                        <code className="text-[11px] font-mono font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                          {link.url}
                        </code>
                      </td>
                      <td className="text-xs font-semibold text-zinc-500">
                        Max {link.maxPerPage} · Pri {link.priority}
                      </td>
                      <td className="text-right space-x-1">
                        <button onClick={() => handleEdit(link)} className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors cursor-pointer">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(link._id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
