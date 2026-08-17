"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPage, AdminPageHeader, CanonicalUrlInput } from "@/components/admin";
import { formSectionClass } from "@/components/forms/AdminFormShell";
import Editor from "@/components/editor/Editor";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { coursesApi, topicCategoriesApi } from "@/lib/api";

const initialForm = {
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

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CategoryForm({ categoryId = null, initialCourse = "" }) {
  const router = useRouter();
  const [form, setForm] = useState({
    ...initialForm,
    course: initialCourse || "none",
  });
  const [courses, setCourses] = useState([]);
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(Boolean(categoryId));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general"); // "general" | "content" | "seo"

  useEffect(() => {
    Promise.all([
      coursesApi.listAll(),
      categoryId ? topicCategoriesApi.get(categoryId) : Promise.resolve(null),
    ]).then(([courseResponse, catResponse]) => {
      setCourses(courseResponse.data?.data || []);
      if (catResponse?.success) {
        const cat = catResponse.data?.data;
        setForm({
          ...initialForm,
          ...cat,
          course: cat.course?._id || cat.course || "none",
          keywords: Array.isArray(cat.keywords)
            ? cat.keywords.join(", ")
            : cat.keywords || "",
          noindex: Boolean(cat.noindex),
          nofollow: Boolean(cat.nofollow),
        });
        setSlugEdited(true);
      }
      setLoading(false);
    });
  }, [categoryId]);

  const handleNameChange = (event) => {
    const name = event.target.value;
    setForm((current) => ({
      ...current,
      name,
      slug: slugEdited ? current.slug : slugify(name),
    }));
  };

  const handleSlugChange = (event) => {
    setSlugEdited(true);
    setForm((current) => ({
      ...current,
      slug: slugify(event.target.value),
    }));
  };

  const save = async (event) => {
    if (event) event.preventDefault();
    if (!form.name.trim()) return toast.error("Category name is required");

    setSaving(true);
    const payload = {
      ...form,
      course: form.course === "none" ? null : form.course,
      keywords: typeof form.keywords === "string"
        ? form.keywords
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : form.keywords,
    };

    const response = categoryId
      ? await topicCategoriesApi.update(categoryId, payload)
      : await topicCategoriesApi.create(payload);

    if (response.success) {
      toast.success(
        categoryId ? "Category updated successfully" : "Category created successfully",
      );
      router.push("/categories");
      router.refresh();
    } else {
      toast.error(response.error || "Unable to save category");
    }
    setSaving(false);
  };

  const remove = async () => {
    if (!categoryId) return;
    setDeleting(true);
    const response = await topicCategoriesApi.delete(categoryId);
    if (response.success) {
      toast.success("Category deleted");
      router.push("/categories");
      router.refresh();
    } else {
      toast.error(response.error || "Unable to delete category");
      setDeleting(false);
    }
  };

  const selectedCourse = courses.find(
    (c) => String(c._id) === String(form.course),
  );
  const selectedCourseSlug = selectedCourse?.slug;
  const liveUrl = form.slug
    ? selectedCourseSlug
      ? `https://asif.to/${selectedCourseSlug}/interview-questions/${form.slug}`
      : `https://asif.to/interview-questions/${form.slug}`
    : "";

  if (loading) {
    return (
      <AdminPage size="lg">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminPage>
    );
  }

  return (
    <AdminPage size="lg">
      <AdminPageHeader
        eyebrow="Taxonomy Manager"
        title={categoryId ? `Edit "${form.name || "Category"}"` : "Create New Category"}
        description="Configure category taxonomy, rich landing intro guides, and search engine metadata."
        back={
          <Link
            href="/categories"
            className="inline-flex items-center text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Categories
          </Link>
        }
        actions={
          <div className="flex items-center gap-2.5">
            {liveUrl && (
              <Button variant="outline" asChild className="hidden sm:inline-flex">
                <a href={liveUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> View Landing
                </a>
              </Button>
            )}
            {categoryId && (
              <Button
                variant="outline"
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:text-rose-400"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            )}
            <Button onClick={save} disabled={saving} className="shadow-lg shadow-blue-500/20">
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {categoryId ? "Update Category" : "Publish Category"}
            </Button>
          </div>
        }
      />

      {/* Form Navigation Tabs */}
      <div className="flex max-w-md rounded-2xl border border-zinc-200/80 bg-zinc-100 p-1 dark:border-zinc-800/80 dark:bg-zinc-900 text-xs font-bold shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex-1 rounded-xl py-2 transition-all cursor-pointer ${
            activeTab === "general"
              ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          General Information
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`flex-1 rounded-xl py-2 transition-all cursor-pointer ${
            activeTab === "content"
              ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          Rich Intro Guide
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`flex-1 rounded-xl py-2 transition-all cursor-pointer ${
            activeTab === "seo"
              ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          SEO & Social
        </button>
      </div>

      <form onSubmit={save} className="space-y-6">
        {/* Tab 1: General Info */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <section className={formSectionClass}>
              <div className="border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <h2 className="font-outfit text-base font-bold text-zinc-950 dark:text-white">
                  Basic Information
                </h2>
                <p className="text-xs text-zinc-500">
                  Primary title, URL slug, and course taxonomy assignment.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Category Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={form.name}
                    onChange={handleNameChange}
                    placeholder="e.g. React & Next.js"
                    className="h-11 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/60 font-medium"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    URL Slug <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={form.slug}
                    onChange={handleSlugChange}
                    placeholder="e.g. react-nextjs"
                    className="h-11 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/60 font-mono text-xs"
                  />
                  {liveUrl && (
                    <p className="flex items-center gap-1.5 text-xs text-zinc-500 pt-1">
                      <Globe className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      Frontend landing URL:{" "}
                      <code className="font-mono text-blue-600 dark:text-blue-400">
                        {liveUrl}
                      </code>
                    </p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Associated Course (Optional)
                  </Label>
                  <Select
                    value={form.course}
                    onValueChange={(val) =>
                      setForm((curr) => ({ ...curr, course: val }))
                    }
                  >
                    <SelectTrigger className="h-11 w-full rounded-2xl border-zinc-200/80 bg-zinc-50/60 dark:border-zinc-800/80 dark:bg-zinc-900/60">
                      <SelectValue placeholder="Standalone (No specific course)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        Standalone (Global Taxonomy)
                      </SelectItem>
                      {courses.map((item) => (
                        <SelectItem key={item._id} value={item._id}>
                          {item.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Short Description / Subtitle
                  </Label>
                  <Textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Brief overview displayed on category cards and the landing page hero."
                    className="rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/60 text-xs leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Status
                  </Label>
                  <Select
                    value={form.status}
                    onValueChange={(status) =>
                      setForm((current) => ({ ...current, status }))
                    }
                  >
                    <SelectTrigger className="h-11 rounded-2xl border-zinc-200/80 bg-zinc-50/60 dark:border-zinc-800/80 dark:bg-zinc-900/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Display Sort Order
                  </Label>
                  <Input
                    type="number"
                    value={form.order}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        order: Number(event.target.value) || 0,
                      }))
                    }
                    className="h-11 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/60 font-mono text-xs"
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tab 2: Rich Intro Content */}
        {activeTab === "content" && (
          <section className={formSectionClass}>
            <div className="border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <h2 className="font-outfit text-base font-bold text-zinc-950 dark:text-white">
                Landing Page Rich Guide
              </h2>
              <p className="text-xs text-zinc-500">
                Write comprehensive introduction notes, cheat-sheets, or study guide content displayed on this category's landing page.
              </p>
            </div>

            <div className="min-h-96 pt-2">
              <Editor
                value={form.content}
                onChange={(content) =>
                  setForm((current) => ({ ...current, content }))
                }
                placeholder="Start writing the landing guide for this category..."
              />
            </div>
          </section>
        )}

        {/* Tab 3: SEO & Social */}
        {activeTab === "seo" && (
          <section className={formSectionClass}>
            <div className="border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <h2 className="font-outfit text-base font-bold text-zinc-950 dark:text-white">
                Search Engine Optimization & Social Sharing
              </h2>
              <p className="text-xs text-zinc-500">
                Custom meta tags, OpenGraph previews, and indexing directives.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Custom SEO Title
                </Label>
                <Input
                  value={form.seoTitle}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      seoTitle: event.target.value,
                    }))
                  }
                  placeholder="Defaults to category name if left blank"
                  className="h-11 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/60"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Meta Description
                </Label>
                <Textarea
                  value={form.seoDescription}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      seoDescription: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Concise summary for search engine snippet (recommended 150-160 characters)"
                  className="rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/60 text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Keywords (comma separated)
                </Label>
                <Input
                  value={form.keywords}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      keywords: event.target.value,
                    }))
                  }
                  placeholder="e.g. react, nextjs, frontend, javascript"
                  className="h-11 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/60"
                />
              </div>

              <div className="sm:col-span-2">
                <CanonicalUrlInput
                  basePrefix={(() => {
                    const selectedCourse = courses.find((c) => String(c._id) === String(form.course));
                    return selectedCourse?.slug
                      ? `https://asif.to/${selectedCourse.slug}/interview-questions`
                      : "https://asif.to/interview-questions";
                  })()}
                  value={form.canonicalUrl}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      canonicalUrl: value,
                    }))
                  }
                  placeholder={form.slug || slugify(form.name)}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  OG Social Image URL
                </Label>
                <Input
                  value={form.ogImage}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      ogImage: event.target.value,
                    }))
                  }
                  placeholder="https://asif.to/images/og/..."
                  className="h-11 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/60 font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40">
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">
                    No-Index (Hide from Google)
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Instruct search engines not to index this category page.
                  </p>
                </div>
                <Switch
                  checked={form.noindex}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({ ...current, noindex: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40">
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">
                    No-Follow Links
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Instruct search engines not to follow outbound links.
                  </p>
                </div>
                <Switch
                  checked={form.nofollow}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({ ...current, nofollow: checked }))
                  }
                />
              </div>
            </div>
          </section>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/categories")}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={saving} className="shadow-lg shadow-blue-500/20">
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {categoryId ? "Update Category" : "Publish Category"}
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Category?"
        description={`Are you sure you want to delete "${form.name}"? Questions categorized under this category may become unassigned.`}
        confirmLabel="Delete Category"
        tone="destructive"
        loading={deleting}
        onConfirm={remove}
      />
    </AdminPage>
  );
}
