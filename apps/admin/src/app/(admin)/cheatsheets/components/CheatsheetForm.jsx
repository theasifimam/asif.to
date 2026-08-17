"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, FileText, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import Editor from "@/components/editor/Editor";
import AdminFormShell, { formAsideClass, formSectionClass } from "@/components/forms/AdminFormShell";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { coursesApi, cheatsheetsApi } from "@/lib/api";
import { CanonicalUrlInput } from "@/components/admin";

export const TECH_IDS = ["reactjs", "nextjs", "nodejs", "expressjs", "mongodb", "tailwindcss", "javascript", "typescript", "html", "css"];

const initialForm = {
  techId: "", title: "", slug: "", content: "", order: 0,
  status: "draft", seoTitle: "", seoDescription: "", keywords: "", canonicalUrl: "",
  relatedCourses: [],
};

export default function CheatsheetForm({ cheatsheetId }) {
  const [form, setForm] = useState(initialForm);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(Boolean(cheatsheetId));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    coursesApi.listAll().then((res) => {
      setCourses(res.data?.data || []);
    });

    if (!cheatsheetId) return;
    cheatsheetsApi.list({ status: "all" }).then((response) => {
      const item = (response.data?.data || []).find((entry) => entry._id === cheatsheetId);
      if (item) {
        setForm({
          ...initialForm,
          ...item,
          keywords: (item.keywords || []).join(", "),
          relatedCourses: (item.relatedCourses || []).map((c) =>
            typeof c === "object" ? c._id : c,
          ),
        });
      } else toast.error("Cheatsheet not found");
      setLoading(false);
    });
  }, [cheatsheetId]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      type: "cheatsheet",
      keywords: form.keywords.split(",").map((item) => item.trim()).filter(Boolean),
    };
    const response = cheatsheetId
      ? await cheatsheetsApi.update(cheatsheetId, payload)
      : await cheatsheetsApi.create(payload);
    if (response.success) {
      toast.success(cheatsheetId ? "Cheatsheet saved" : "Cheatsheet created");
      window.location.assign("/cheatsheets");
    } else toast.error(response.error || "Unable to save cheatsheet");
    setSaving(false);
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>;

  return (
    <AdminFormShell
      eyebrow="Articles / Cheatsheets"
      title={cheatsheetId ? "Edit cheatsheet article" : "Create cheatsheet article"}
      description="Cheatsheets now use the Article content model. Write the complete reference in Markdown and use fenced code blocks for runnable examples."
      back={<Link href="/cheatsheets" className="inline-flex items-center gap-2 text-sm text-zinc-500"><ArrowLeft className="h-4 w-4" /> Back to cheatsheets</Link>}
      actions={<Button form="cheatsheet-form" type="submit" loading={saving}><Save className="mr-2 h-4 w-4" /> Save cheatsheet</Button>}
    >
      <form id="cheatsheet-form" onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-6">
          <div className={formSectionClass}>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input required value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="React Hooks Cheatsheet" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label>Article content</Label>
                <span className="text-xs font-medium text-zinc-400">Markdown</span>
              </div>
              <Editor required value={form.content} onChange={(value) => update("content", value || "")} placeholder={"## State hooks\n\nExplain the concept...\n\n```jsx\nconst [count, setCount] = useState(0);\n```"} />
              <p className="text-xs leading-5 text-zinc-500">Every fenced code block automatically receives Copy and Play controls on the public page.</p>
            </div>
          </div>
          <div className={formSectionClass}>
            <h2 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><FileText className="h-4 w-4 text-blue-500" /> Search metadata</h2>
            <div className="space-y-2"><Label>SEO title</Label><Input value={form.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} maxLength={70} /></div>
            <div className="space-y-2"><Label>SEO description</Label><Textarea rows={3} value={form.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} maxLength={170} /></div>
            <div className="space-y-2"><Label>Keywords</Label><Input value={form.keywords} onChange={(event) => update("keywords", event.target.value)} placeholder="react, hooks, state" /></div>
            <CanonicalUrlInput
              basePrefix="https://asif.to/cheatsheets"
              value={form.canonicalUrl}
              onChange={(value) => update("canonicalUrl", value)}
              placeholder={form.slug || (form.title ? form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : "")}
            />
          </div>

          {/* Related Courses Picker */}
          <div className={formSectionClass}>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Related Courses & Recommendations</h2>
            <p className="text-xs text-muted-foreground">Select courses to promote in the sidebar and bottom panel of this cheatsheet.</p>
            <div className="max-h-48 overflow-y-auto space-y-1 rounded-2xl border border-zinc-200/60 bg-zinc-50 p-3 dark:border-zinc-800/60 dark:bg-zinc-900/50">
              {courses.map((c) => {
                const isSelected = (form.relatedCourses || []).includes(c._id);
                return (
                  <label key={c._id} className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...(form.relatedCourses || []), c._id]
                          : (form.relatedCourses || []).filter((id) => id !== c._id);
                        update("relatedCourses", next);
                      }}
                      className="h-4 w-4 rounded border-zinc-300 text-blue-500 focus:ring-blue-400"
                    />
                    <span>{c.title}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </section>
        <aside className={`${formAsideClass} self-start lg:sticky lg:top-24`}>
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs leading-5 text-zinc-600 dark:text-zinc-300"><strong className="block text-blue-600 dark:text-blue-400">Unified content model</strong>This entry is stored in the articles collection with type set to cheatsheet.</div>
          <div className="space-y-2"><Label>Technology</Label><Select required value={form.techId} onValueChange={(value) => update("techId", value)}><SelectTrigger><SelectValue placeholder="Select technology" /></SelectTrigger><SelectContent>{TECH_IDS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Slug</Label><Input value={form.slug || "Generated on create"} disabled={!cheatsheetId} onChange={(event) => update("slug", event.target.value)} /></div>
          <div className="space-y-2"><Label>Display order</Label><Input type="number" value={form.order} onChange={(event) => update("order", Number(event.target.value))} /></div>
          <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(value) => update("status", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent></Select></div>
        </aside>
      </form>
    </AdminFormShell>
  );
}
