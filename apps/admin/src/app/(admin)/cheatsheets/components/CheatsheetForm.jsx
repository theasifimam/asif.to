"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Editor from "@/components/Editor";
import AdminFormShell, {
  formAsideClass,
  formSectionClass,
} from "@/components/AdminFormShell";
import { Button, Input, Label, Textarea } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cheatsheetsApi } from "@/lib/api";

export const TECH_IDS = [
  "reactjs",
  "nextjs",
  "nodejs",
  "expressjs",
  "mongodb",
  "tailwindcss",
  "javascript",
];
const blankSnippet = () => ({ name: "", code: "", language: "javascript" });
const initialForm = {
  techId: "",
  title: "",
  slug: "",
  description: "",
  snippets: [blankSnippet()],
  order: 0,
  status: "draft",
  seoTitle: "",
  seoDescription: "",
  keywords: "",
  canonicalUrl: "",
};
export default function CheatsheetForm({ cheatsheetId }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(Boolean(cheatsheetId));
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!cheatsheetId) return;
    cheatsheetsApi.list({ status: "all" }).then((response) => {
      const item = (response.data?.data || []).find(
        (entry) => entry._id === cheatsheetId,
      );
      if (item)
        setForm({
          ...initialForm,
          ...item,
          snippets: item.snippets?.length ? item.snippets : [blankSnippet()],
          keywords: (item.keywords || []).join(", "),
        });
      else toast.error("Cheatsheet not found");
      setLoading(false);
    });
  }, [cheatsheetId]);
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const updateSnippet = (index, key, value) =>
    update(
      "snippets",
      form.snippets.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      keywords: form.keywords
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
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
  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  return (
    <AdminFormShell
      eyebrow="Learning / Reference"
      title={cheatsheetId ? "Edit cheatsheet" : "Create cheatsheet"}
      description="Build a structured reference page with reusable code snippets."
      back={
        <Link
          href="/cheatsheets"
          className="inline-flex items-center gap-2 text-sm text-zinc-500"
        >
          <ArrowLeft className="h-4 w-4" /> Back to cheatsheets
        </Link>
      }
      actions={
        <Button form="cheatsheet-form" type="submit" loading={saving}>
          <Save className="mr-2 h-4 w-4" /> Save cheatsheet
        </Button>
      }
    >
      <form
        id="cheatsheet-form"
        onSubmit={submit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        <section className="space-y-6">
          <div className={formSectionClass}>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                required
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="React Hooks Cheatsheet"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Editor
                value={form.description}
                onChange={(value) => update("description", value || "")}
                placeholder="Write the cheatsheet overview in Markdown…"
              />
            </div>
          </div>
          <div className={formSectionClass}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-zinc-900 dark:text-white">
                  Code snippets
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Add named, language-aware examples.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  update("snippets", [...form.snippets, blankSnippet()])
                }
              >
                <Plus className="h-4 w-4" /> Add snippet
              </Button>
            </div>
            {form.snippets.map((snippet, index) => (
              <div
                key={index}
                className="space-y-3 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900/70"
              >
                <div className="flex gap-3">
                  <Input
                    value={snippet.name}
                    onChange={(e) =>
                      updateSnippet(index, "name", e.target.value)
                    }
                    placeholder="Snippet name"
                  />
                  <Select
                    value={snippet.language}
                    onValueChange={(value) =>
                      updateSnippet(index, "language", value)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "javascript",
                        "jsx",
                        "typescript",
                        "tsx",
                        "html",
                        "css",
                        "bash",
                        "json",
                        "text",
                      ].map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={form.snippets.length === 1}
                    onClick={() =>
                      update(
                        "snippets",
                        form.snippets.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <Textarea
                  rows={7}
                  className="font-mono"
                  value={snippet.code}
                  onChange={(e) => updateSnippet(index, "code", e.target.value)}
                  placeholder="Paste code here…"
                />
              </div>
            ))}
          </div>
          <div className={formSectionClass}>
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              Search metadata
            </h2>
            <div className="space-y-2">
              <Label>SEO title</Label>
              <Input
                value={form.seoTitle}
                onChange={(e) => update("seoTitle", e.target.value)}
                maxLength={70}
              />
            </div>
            <div className="space-y-2">
              <Label>SEO description</Label>
              <Textarea
                rows={3}
                value={form.seoDescription}
                onChange={(e) => update("seoDescription", e.target.value)}
                maxLength={170}
              />
            </div>
            <div className="space-y-2">
              <Label>Keywords</Label>
              <Input
                value={form.keywords}
                onChange={(e) => update("keywords", e.target.value)}
                placeholder="react, hooks, state"
              />
            </div>
            <div className="space-y-2">
              <Label>Canonical URL</Label>
              <Input
                value={form.canonicalUrl}
                onChange={(e) => update("canonicalUrl", e.target.value)}
                placeholder="https://asif.to/cheatsheets/react"
              />
            </div>
          </div>
        </section>
        <aside className={`${formAsideClass} self-start lg:sticky lg:top-24`}>
          <div className="space-y-2">
            <Label>Technology</Label>
            <Select
              value={form.techId}
              onValueChange={(value) => update("techId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select technology" />
              </SelectTrigger>
              <SelectContent>
                {TECH_IDS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={form.slug || "Generated on create"}
              disabled={!cheatsheetId}
              onChange={(e) => update("slug", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Order</Label>
            <Input
              type="number"
              value={form.order}
              onChange={(e) => update("order", Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(value) => update("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </aside>
      </form>
    </AdminFormShell>
  );
}
