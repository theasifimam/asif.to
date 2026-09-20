"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getModuleBackUrl } from "@/hooks/useModuleHistory";
import { ArrowLeft, ExternalLink, Globe, Save, Send, Trash2, FolderTree, Layers } from "lucide-react";
import { toast } from "sonner";
import { CanonicalUrlInput } from "@/components/admin";
import AdminFormShell, {
  AdminFormLoading,
  formSectionClass,
} from "@/components/forms/AdminFormShell";
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
  featuredChapters: [],
  relatedCourses: [],
};

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CategoryForm({
  categoryId = null,
  initialCourse = "",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedReturnTo = searchParams.get("returnTo");
  const returnTo = getModuleBackUrl("/categories", requestedReturnTo);
  const [form, setForm] = useState({
    ...initialForm,
    course: initialCourse || "none",
  });
  const [courses, setCourses] = useState([]);
  const [courseChapters, setCourseChapters] = useState([]);
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(Boolean(categoryId));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      coursesApi.listAll(),
      categoryId ? topicCategoriesApi.get(categoryId) : Promise.resolve(null),
    ]).then(([courseResponse, catResponse]) => {
      const allCoursesList = courseResponse.data?.data || [];
      setCourses(allCoursesList);
      if (catResponse?.success) {
        const cat = catResponse.data?.data;
        const activeCourseId = cat.course?._id || cat.course || "none";
        setForm({
          ...initialForm,
          ...cat,
          course: activeCourseId,
          keywords: Array.isArray(cat.keywords)
            ? cat.keywords.join(", ")
            : cat.keywords || "",
          noindex: Boolean(cat.noindex),
          nofollow: Boolean(cat.nofollow),
          featuredChapters: (cat.featuredChapters || []).map((ch) =>
            typeof ch === "object" ? ch._id : ch,
          ),
          relatedCourses: (cat.relatedCourses || []).map((c) =>
            typeof c === "object" ? c._id : c,
          ),
        });
        setSlugEdited(true);

        if (activeCourseId && activeCourseId !== "none") {
          coursesApi.getById(activeCourseId).then((cRes) => {
            if (cRes.success) {
              setCourseChapters(cRes.data?.data?.chapters || []);
            }
          });
        }
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

  const persist = async (status = form.status) => {
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      status,
      course: form.course === "none" ? null : form.course,
      keywords:
        typeof form.keywords === "string"
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
        categoryId
          ? "Category updated successfully"
          : "Category created successfully",
      );
      router.push(returnTo);
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
      router.push(returnTo);
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
    return <AdminFormLoading />;
  }

  return (
    <AdminFormShell
      eyebrow={selectedCourse ? `Taxonomy / ${selectedCourse.title}` : "Taxonomy Manager"}
      title={categoryId ? `Edit category` : "Create new category"}
      description="Configure category taxonomy, rich landing intro guides, and search engine metadata."
      back={
        <Link
          href={returnTo}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to categories
        </Link>
      }
      actions={
        <div className="grid grid-cols-2 sm:flex sm:w-auto items-center gap-2 w-full">
          {liveUrl && (
            <Button
              variant="outline"
              asChild
              size="sm"
              className="col-span-1 h-9 text-xs font-semibold sm:h-10 sm:text-sm"
            >
              <a href={liveUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5 shrink-0 sm:mr-2 sm:h-4 sm:w-4" />
                <span className="truncate">View Landing</span>
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={() => persist("draft")}
            className="col-span-1 h-9 text-xs font-semibold sm:h-10 sm:text-sm"
          >
            <Save className="mr-1.5 h-3.5 w-3.5 shrink-0 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="truncate">Save Draft</span>
          </Button>
          <Button
            size="sm"
            disabled={saving}
            onClick={() => persist("published")}
            className="col-span-2 sm:col-span-1 h-9 text-xs font-semibold sm:h-10 sm:text-sm shadow-lg shadow-blue-500/20"
          >
            <Send className="mr-1.5 h-3.5 w-3.5 shrink-0 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="truncate">Publish</span>
          </Button>
        </div>
      }
    >
      <div className="grid min-w-0 w-full gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main Left Content Column */}
        <main className="min-w-0 w-full space-y-6">
          {/* General Details Section */}
          <section className={formSectionClass}>
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-primary shrink-0" />
              <h2 className="text-base font-semibold">Category Details &amp; Intro Guide</h2>
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="category-name">
                Category Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="category-name"
                value={form.name}
                onChange={handleNameChange}
                placeholder="e.g. React & Next.js"
                className="h-11 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/60 font-medium"
              />
            </div>

            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1.5 min-w-0">
                <Label htmlFor="category-slug">
                  URL Slug <span className="text-rose-500">*</span>
                </Label>
                {liveUrl && (
                  <span className="truncate text-xs font-mono text-muted-foreground max-w-full">
                    /{form.slug || "category-slug"}
                  </span>
                )}
              </div>
              <Input
                id="category-slug"
                value={form.slug}
                onChange={handleSlugChange}
                placeholder="e.g. react-nextjs"
                className="h-11 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/60 font-mono text-xs"
              />
              {liveUrl && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 pt-1 min-w-0 overflow-hidden">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Globe className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span className="font-semibold text-zinc-600 dark:text-zinc-400">Frontend URL:</span>
                  </div>
                  <code className="font-mono text-blue-600 dark:text-blue-400 break-all text-[11px] min-w-0 max-w-full">
                    {liveUrl}
                  </code>
                </div>
              )}
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="category-description">Short Description / Subtitle</Label>
              <Textarea
                id="category-description"
                value={form.description}
                onChange={(e) => setForm((curr) => ({ ...curr, description: e.target.value }))}
                rows={3}
                placeholder="Brief overview displayed on category cards and the landing page hero."
                className="rounded-2xl border-0 bg-zinc-100 px-4 py-3 shadow-none dark:bg-zinc-900 text-xs leading-relaxed"
              />
            </div>

            <div className="space-y-2 pt-2 min-w-0">
              <Label>Landing Page Rich Guide</Label>
              <p className="text-xs text-muted-foreground">
                Write comprehensive introduction notes, cheat-sheets, or study guide content displayed on this category landing page.
              </p>
              <Editor
                value={form.content}
                onChange={(content) => setForm((curr) => ({ ...curr, content }))}
                placeholder="Start writing the landing guide for this category..."
              />
            </div>
          </section>

          {/* Search Engine Optimization Section */}
          <section className={formSectionClass}>
            <div>
              <h2 className="text-base font-semibold">Search Engine Optimization &amp; Social</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Custom meta tags, OpenGraph previews, and search engine directives.
              </p>
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="category-seo-title">Custom SEO Title</Label>
              <Input
                id="category-seo-title"
                value={form.seoTitle}
                onChange={(e) => setForm((curr) => ({ ...curr, seoTitle: e.target.value }))}
                placeholder="Defaults to category name if left blank"
                className="h-11 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/60"
              />
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="category-seo-description">Meta Description</Label>
              <Textarea
                id="category-seo-description"
                value={form.seoDescription}
                onChange={(e) => setForm((curr) => ({ ...curr, seoDescription: e.target.value }))}
                rows={3}
                placeholder="Concise summary for search engine snippet (recommended 150-160 characters)"
                className="rounded-2xl border-0 bg-zinc-100 px-4 py-3 shadow-none dark:bg-zinc-900 text-xs leading-relaxed"
              />
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="category-keywords">Keywords (comma separated)</Label>
              <Input
                id="category-keywords"
                value={form.keywords}
                onChange={(e) => setForm((curr) => ({ ...curr, keywords: e.target.value }))}
                placeholder="e.g. react, nextjs, frontend, javascript"
                className="h-11 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/60"
              />
            </div>

            <div className="min-w-0 w-full">
              <CanonicalUrlInput
                basePrefix={selectedCourseSlug ? `https://asif.to/${selectedCourseSlug}/interview-questions` : "https://asif.to/interview-questions"}
                value={form.canonicalUrl}
                onChange={(val) => setForm((curr) => ({ ...curr, canonicalUrl: val }))}
                placeholder={form.slug || slugify(form.name)}
              />
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="category-og-image">OG Social Image URL</Label>
              <Input
                id="category-og-image"
                value={form.ogImage}
                onChange={(e) => setForm((curr) => ({ ...curr, ogImage: e.target.value }))}
                placeholder="https://asif.to/images/og/..."
                className="h-11 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/60 font-mono text-xs"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2 min-w-0">
              <div className="flex items-center justify-between rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40">
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">
                    No-Index (Hide from Search)
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Prevent search engines from indexing this category.
                  </p>
                </div>
                <Switch
                  checked={form.noindex}
                  onCheckedChange={(checked) => setForm((curr) => ({ ...curr, noindex: checked }))}
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40">
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">
                    No-Follow Links
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Instruct search engines not to follow links.
                  </p>
                </div>
                <Switch
                  checked={form.nofollow}
                  onCheckedChange={(checked) => setForm((curr) => ({ ...curr, nofollow: checked }))}
                />
              </div>
            </div>
          </section>

          {/* Related Content & Cross-Promotion */}
          <section className={formSectionClass}>
            <div>
              <h2 className="text-base font-semibold">Related Content &amp; Cross-Promotion</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose featured course lessons or related courses to display alongside this guide.
              </p>
            </div>

            {/* Featured Chapters */}
            <div className="space-y-2 min-w-0">
              <Label>Featured Chapters / Lessons</Label>
              {courseChapters.length > 0 ? (
                <div className="max-h-56 overflow-y-auto space-y-1 rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-800/80 dark:bg-zinc-900/40">
                  {courseChapters.map((ch, idx) => {
                    const isSelected = (form.featuredChapters || []).includes(ch._id);
                    return (
                      <label
                        key={ch._id}
                        className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...(form.featuredChapters || []), ch._id]
                              : (form.featuredChapters || []).filter((id) => id !== ch._id);
                            setForm((curr) => ({ ...curr, featuredChapters: next }));
                          }}
                          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="truncate">
                          {ch.order ?? idx + 1}. {ch.title}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-zinc-200 p-4 text-xs text-zinc-400 dark:border-zinc-800">
                  Select an Associated Course in the right sidebar to attach specific lessons from that course.
                </p>
              )}
            </div>

            {/* Related Courses */}
            <div className="space-y-2 min-w-0">
              <Label>Related Courses</Label>
              <div className="max-h-48 overflow-y-auto space-y-1 rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-800/80 dark:bg-zinc-900/40">
                {courses
                  .filter((c) => c._id !== form.course)
                  .map((c) => {
                    const isSelected = (form.relatedCourses || []).includes(c._id);
                    return (
                      <label
                        key={c._id}
                        className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...(form.relatedCourses || []), c._id]
                              : (form.relatedCourses || []).filter((id) => id !== c._id);
                            setForm((curr) => ({ ...curr, relatedCourses: next }));
                          }}
                          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="truncate">{c.title}</span>
                      </label>
                    );
                  })}
              </div>
            </div>
          </section>
        </main>

        {/* Right Sidebar */}
        <aside className="min-w-0 w-full space-y-6">
          {/* Status & Taxonomy Assignment */}
          <section className={formSectionClass}>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary shrink-0" />
              <h2 className="text-base font-semibold">Publishing &amp; Taxonomy</h2>
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="category-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(status) => setForm((curr) => ({ ...curr, status }))}
              >
                <SelectTrigger id="category-status" className="h-11 rounded-2xl border-zinc-200/80 bg-zinc-50/60 dark:border-zinc-800/80 dark:bg-zinc-900/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="category-course">Associated Course</Label>
              <Select
                value={form.course}
                onValueChange={(val) => {
                  setForm((curr) => ({ ...curr, course: val }));
                  if (val && val !== "none") {
                    coursesApi.getById(val).then((cRes) => {
                      if (cRes.success) setCourseChapters(cRes.data?.data?.chapters || []);
                    });
                  } else {
                    setCourseChapters([]);
                  }
                }}
              >
                <SelectTrigger id="category-course" className="h-11 w-full rounded-2xl border-zinc-200/80 bg-zinc-50/60 dark:border-zinc-800/80 dark:bg-zinc-900/60">
                  <SelectValue placeholder="Standalone (Global Taxonomy)" />
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

            <div className="space-y-2 min-w-0">
              <Label htmlFor="category-order">Display Sort Order</Label>
              <Input
                id="category-order"
                type="number"
                value={form.order}
                onChange={(e) => setForm((curr) => ({ ...curr, order: Number(e.target.value) || 0 }))}
                className="h-11 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/60 font-mono text-xs"
              />
            </div>
          </section>

          {/* Quick Actions Card */}
          <section className={formSectionClass}>
            <h2 className="text-base font-semibold">Actions</h2>
            <div className="space-y-2 min-w-0">
              <Button
                type="button"
                disabled={saving}
                onClick={() => persist(form.status)}
                className="w-full shadow-lg shadow-blue-500/20"
              >
                <Save className="mr-2 h-4 w-4" />
                {categoryId ? "Update Category" : "Save Category"}
              </Button>

              {categoryId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteOpen(true)}
                  className="w-full text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-900/50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Category
                </Button>
              )}
            </div>
          </section>
        </aside>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Category?"
        description={`Are you sure you want to delete "${form.name}"? Questions categorized under this category may become unassigned.`}
        confirmText="Delete Category"
        variant="destructive"
        loading={deleting}
        onConfirm={remove}
      />
    </AdminFormShell>
  );
}
