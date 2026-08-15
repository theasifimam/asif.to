"use client";

import { useEffect, useState } from "react";
import {
  Edit3,
  ExternalLink,
  Eye,
  FolderTree,
  Globe,
  Loader2,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { coursesApi, topicCategoriesApi } from "@/lib/api";
import Editor from "@/components/editor/Editor";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  content: "",
  course: "none",
  status: "published",
  order: 0,
  seoTitle: "",
  seoDescription: "",
  keywords: "",
  canonicalUrl: "",
  ogImage: "",
  noindex: false,
  nofollow: false,
};

export default function CategoriesPage() {
  const [courses, setCourses] = useState([]);
  const [filterCourse, setFilterCourse] = useState("all");
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general"); // "general" | "content" | "seo"

  useEffect(() => {
    coursesApi.listAll().then((response) => {
      const items = response.data?.data || [];
      setCourses(items);
      setLoading(false);
    });
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const response = await topicCategoriesApi.list(filterCourse);
    if (response.success) setCategories(response.data?.data || []);
    else toast.error(response.error || "Unable to load categories");
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, [filterCourse]);

  const save = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return toast.error("Category name is required");
    setSaving(true);
    const payload = {
      ...form,
      course: form.course === "none" ? null : form.course,
      keywords: typeof form.keywords === "string"
        ? form.keywords.split(",").map((item) => item.trim()).filter(Boolean)
        : form.keywords,
    };
    const response = editing
      ? await topicCategoriesApi.update(editing._id, payload)
      : await topicCategoriesApi.create(payload);
    if (response.success) {
      toast.success(editing ? "Category updated" : "Category created");
      setForm(emptyForm);
      setEditing(null);
      setActiveTab("general");
      loadCategories();
    } else toast.error(response.error || "Unable to save category");
    setSaving(false);
  };

  const startEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      content: category.content || "",
      course: category.course?._id || category.course || "none",
      status: category.status || "published",
      order: category.order || 0,
      seoTitle: category.seoTitle || "",
      seoDescription: category.seoDescription || "",
      keywords: Array.isArray(category.keywords) ? category.keywords.join(", ") : category.keywords || "",
      canonicalUrl: category.canonicalUrl || "",
      ogImage: category.ogImage || "",
      noindex: Boolean(category.noindex),
      nofollow: Boolean(category.nofollow),
    });
    setActiveTab("general");
  };

  const remove = async () => {
    const response = await topicCategoriesApi.delete(deleteTarget._id);
    if (response.success) {
      toast.success("Category deleted");
      setDeleteTarget(null);
      loadCategories();
    } else toast.error(response.error || "Unable to delete category");
  };

  const liveUrl = form.slug ? `https://asif.to/interview-questions/${form.slug}` : "";

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Taxonomy & Interview Landing Pages
          </p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-950 dark:text-white">
            Interview Categories
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage category taxonomies, customize rich text landing intro guides, and configure SEO fields.
          </p>
        </div>

        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger className="w-56 rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <SelectValue placeholder="Filter by Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories (Global & Course)</SelectItem>
            {courses.map((item) => (
              <SelectItem key={item._id} value={item._id}>
                {item.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <div className="grid gap-6 lg:grid-cols-[440px_1fr]">
        <form
          onSubmit={save}
          className="h-fit space-y-4 rounded-4xl border border-zinc-200/60 bg-white p-5 shadow-xs dark:border-zinc-800/60 dark:bg-zinc-950"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              {editing ? "Edit category" : "New category"}
            </h2>
            {editing && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditing(null);
                  setForm(emptyForm);
                  setActiveTab("general");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Sub-navigation tabs inside form */}
          <div className="flex rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-900 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`flex-1 rounded-xl py-1.5 transition-all cursor-pointer ${
                activeTab === "general"
                  ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              General
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`flex-1 rounded-xl py-1.5 transition-all cursor-pointer ${
                activeTab === "content"
                  ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Rich Intro
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("seo")}
              className={`flex-1 rounded-xl py-1.5 transition-all cursor-pointer ${
                activeTab === "seo"
                  ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              SEO & Indexing
            </button>
          </div>

          {activeTab === "general" && (
            <div className="space-y-4 pt-1">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="e.g. Next.js"
                />
              </div>

              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, slug: event.target.value }))
                  }
                  placeholder="e.g. nextjs"
                />
                {liveUrl && (
                  <p className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <Globe className="h-3.5 w-3.5 text-blue-500" />
                    Frontend URL: <code className="font-mono text-blue-600 dark:text-blue-400">{liveUrl}</code>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Associated Course (Optional)</Label>
                <Select
                  value={form.course}
                  onValueChange={(val) => setForm((curr) => ({ ...curr, course: val }))}
                >
                  <SelectTrigger className="h-10 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900">
                    <SelectValue placeholder="Standalone (No specific course)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Standalone (No specific course)</SelectItem>
                    {courses.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Short Description / Subtitle</Label>
                <Textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={2}
                  placeholder="Short description displayed on cards and category hero."
                  className="rounded-2xl border-0 bg-zinc-100 px-4 py-3 shadow-none dark:bg-zinc-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(val) => setForm((curr) => ({ ...curr, status: val }))}
                  >
                    <SelectTrigger className="h-10 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        order: Number(event.target.value),
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  <Sparkles className="h-4 w-4 text-amber-500" /> Custom Rich Text Intro
                </Label>
                <span className="text-[11px] text-zinc-400">Markdown supported</span>
              </div>
              <p className="text-xs text-zinc-500">
                Custom guide content rendered above the interview questions on the category landing page.
              </p>
              <div className="min-h-[260px]">
                <Editor
                  value={form.content}
                  onChange={(val) => setForm((curr) => ({ ...curr, content: val }))}
                  placeholder="Write rich category introduction, study roadmap, or core concept summary..."
                />
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="space-y-3.5 pt-1 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs">SEO Title</Label>
                <Input
                  value={form.seoTitle}
                  onChange={(e) => setForm((curr) => ({ ...curr, seoTitle: e.target.value }))}
                  placeholder={`${form.name || "Category"} Interview Questions and Answers`}
                  maxLength={70}
                />
                <p className="text-[10px] text-zinc-400 text-right">{form.seoTitle.length}/70</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Meta Description</Label>
                <Textarea
                  value={form.seoDescription}
                  onChange={(e) => setForm((curr) => ({ ...curr, seoDescription: e.target.value }))}
                  placeholder="Compelling description for search engines."
                  rows={2}
                  maxLength={170}
                  className="rounded-2xl border-0 bg-zinc-100 px-3 py-2 text-xs shadow-none dark:bg-zinc-900"
                />
                <p className="text-[10px] text-zinc-400 text-right">{form.seoDescription.length}/170</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Keywords (comma separated)</Label>
                <Input
                  value={form.keywords}
                  onChange={(e) => setForm((curr) => ({ ...curr, keywords: e.target.value }))}
                  placeholder="nextjs interview, react interview questions, ssr"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Canonical URL Override</Label>
                <Input
                  value={form.canonicalUrl}
                  onChange={(e) => setForm((curr) => ({ ...curr, canonicalUrl: e.target.value }))}
                  placeholder={`https://asif.to/interview-questions/${form.slug}`}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Open Graph Image URL</Label>
                <Input
                  value={form.ogImage}
                  onChange={(e) => setForm((curr) => ({ ...curr, ogImage: e.target.value }))}
                  placeholder="https://asif.to/images/og-nextjs.png"
                />
              </div>

              <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Robots: noindex</span>
                <Switch
                  checked={form.noindex}
                  onCheckedChange={(val) => setForm((curr) => ({ ...curr, noindex: val }))}
                />
              </div>

              <div className="flex items-center justify-between border-t border-zinc-100 pt-2 dark:border-zinc-800">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Robots: nofollow</span>
                <Switch
                  checked={form.nofollow}
                  onCheckedChange={(val) => setForm((curr) => ({ ...curr, nofollow: val }))}
                />
              </div>
            </div>
          )}

          <Button className="w-full mt-4" disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : editing ? (
              <Save className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {editing ? "Save changes" : "Create category"}
          </Button>
        </form>

        <section className="overflow-hidden rounded-4xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-950 shadow-xs">
          <div className="border-b border-zinc-200/60 px-5 py-4 dark:border-zinc-800/60 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              Category Library ({categories.length})
            </h2>
            <Badge variant="outline" className="text-xs">
              Primary Interview Taxonomy
            </Badge>
          </div>
          {loading ? (
            <Loader2 className="mx-auto my-16 h-5 w-5 animate-spin text-blue-600" />
          ) : categories.length === 0 ? (
            <div className="py-16 text-center text-sm text-zinc-500">
              <FolderTree className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
              No categories found.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100/80 dark:divide-zinc-800/70">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-zinc-900 dark:text-white text-base">
                        {category.name}
                      </span>
                      <Badge
                        variant={category.status === "published" ? "default" : "secondary"}
                        className="text-[10px] uppercase font-bold"
                      >
                        {category.status}
                      </Badge>
                      {category.course && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                          {category.course.title || "Course linked"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 font-mono">
                      /interview-questions/{category.slug}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">
                      {category.description || "No short description."}
                    </p>

                    {category.content && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                        <Sparkles className="h-3 w-3" /> Includes custom rich text intro
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`https://asif.to/interview-questions/${category.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-zinc-400 hover:text-blue-600"
                        title="View landing page"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      title="Edit category"
                      onClick={() => startEdit(category)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-xl text-zinc-400 hover:text-red-600"
                      title="Delete category"
                      onClick={() => setDeleteTarget(category)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        title="Delete category?"
        description="Categories containing topics or interview questions cannot be deleted. Reassign those items first."
        confirmText="Delete"
        variant="destructive"
      />
    </main>
  );
}
