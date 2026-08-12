"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Loader2,
  Save,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import Editor from "@/components/Editor";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { chaptersApi, coursesApi } from "@/lib/api";

const initialForm = {
  title: "",
  slug: "",
  summary: "",
  contentBody: "",
  tryItChallenge: "",
  seoTitle: "",
  seoDescription: "",
  keywords: "",
  canonicalUrl: "",
  order: 0,
  status: "draft",
};

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function chapterContent(chapter) {
  let content = Array.isArray(chapter.content)
    ? chapter.content.join("\n\n")
    : chapter.content || "";

  if (Array.isArray(chapter.codeSnippets) && chapter.codeSnippets.length > 0) {
    const snippets = chapter.codeSnippets
      .filter((snippet) => snippet.code)
      .map(
        (snippet) =>
          `\`\`\`${snippet.language || "javascript"}\n// ${snippet.title || "Code Snippet"}\n${snippet.code}\n\`\`\``,
      )
      .join("\n\n");
    if (snippets && !content.includes(chapter.codeSnippets[0]?.code || "")) {
      content = `${content}\n\n${snippets}`.trim();
    }
  } else if (chapter.codeSnippet && !content.includes(chapter.codeSnippet)) {
    content =
      `${content}\n\n\`\`\`${chapter.language || "javascript"}\n${chapter.codeSnippet}\n\`\`\``.trim();
  }

  return content;
}

export default function ChapterFormPage() {
  const { courseId, chapterId } = useParams();
  const isNew = chapterId === "new";
  const [course, setCourse] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await coursesApi.getById(courseId);
    if (!response.success) {
      toast.error(response.error || "Unable to load course");
      setLoading(false);
      return;
    }

    const courseData = response.data?.data;
    setCourse(courseData);
    if (isNew) {
      setForm((current) => ({
        ...current,
        order: courseData.chapters?.length || 0,
      }));
    } else {
      const chapter = (courseData.chapters || []).find(
        (item) => item._id === chapterId,
      );
      if (!chapter) {
        toast.error("Chapter not found");
        setLoading(false);
        return;
      }
      setForm({
        ...initialForm,
        ...chapter,
        contentBody: chapterContent(chapter),
        keywords: (chapter.keywords || []).join(", "),
      });
      setSlugEdited(true);
    }
    setLoading(false);
  }, [chapterId, courseId, isNew]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const updateTitle = (title) =>
    setForm((current) => ({
      ...current,
      title,
      slug: slugEdited ? current.slug : slugify(title),
      seoTitle: current.seoTitle || title,
    }));

  const payload = (status = form.status) => ({
    title: form.title,
    slug: form.slug,
    summary: form.summary,
    content: [form.contentBody],
    tryItChallenge: form.tryItChallenge,
    seoTitle: form.seoTitle,
    seoDescription: form.seoDescription,
    keywords: form.keywords
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    canonicalUrl: form.canonicalUrl,
    order: Number(form.order) || 0,
    status,
  });

  const persist = async (status) => {
    if (!form.title.trim() || !form.summary.trim()) {
      toast.error("Title and summary are required");
      return null;
    }
    if (!form.slug.trim()) {
      toast.error("A URL slug is required");
      return null;
    }

    setSaving(true);
    const response = isNew
      ? await chaptersApi.create(courseId, payload(status))
      : await chaptersApi.update(chapterId, payload(status));

    if (!response.success) {
      toast.error(response.error || "Unable to save chapter");
      setSaving(false);
      return null;
    }

    const chapter = response.data?.data;
    toast.success(
      status === "published" ? "Chapter published" : "Chapter saved",
    );
    setForm((current) => ({ ...current, status }));
    setSaving(false);
    if (isNew && chapter?._id) {
      window.location.assign(`/courses/${courseId}/chapters/${chapter._id}`);
    }
    return chapter;
  };

  const publish = async () => {
    await persist("published");
    setPublishOpen(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    );
  }

  const publicUrl =
    course?.slug && form.slug
      ? `https://asif.to/${course.slug}/${form.slug}`
      : "";

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="outline"
            size="icon"
            asChild
            title="Back to chapters"
          >
            <Link href={`/courses/${courseId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isNew ? "Create chapter" : "Edit chapter"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {course?.title}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isNew && form.status === "published" && publicUrl && (
            <Button variant="outline" asChild>
              <a href={publicUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                View
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            disabled={saving}
            onClick={() => persist("draft")}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save draft
          </Button>
          <Button disabled={saving} onClick={() => setPublishOpen(true)}>
            <Send className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="space-y-6">
          <section className="space-y-5 border-b border-zinc-200 pb-6 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-semibold">Chapter content</h2>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapter-title">Title</Label>
              <Input
                id="chapter-title"
                value={form.title}
                maxLength={180}
                onChange={(event) => updateTitle(event.target.value)}
                placeholder="Introduction to React Hooks"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="chapter-slug">URL slug</Label>
                <span className="truncate text-xs text-muted-foreground">
                  /{course?.slug}/{form.slug || "chapter-slug"}
                </span>
              </div>
              <Input
                id="chapter-slug"
                value={form.slug}
                maxLength={200}
                onChange={(event) => {
                  setSlugEdited(true);
                  update("slug", slugify(event.target.value));
                }}
                placeholder="introduction-to-react-hooks"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapter-summary">Summary</Label>
              <Textarea
                id="chapter-summary"
                value={form.summary}
                maxLength={320}
                rows={3}
                onChange={(event) => update("summary", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Editor
                value={form.contentBody}
                onChange={(value) => update("contentBody", value)}
                placeholder="Write the chapter tutorial and code examples."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapter-challenge">Try it challenge</Label>
              <Textarea
                id="chapter-challenge"
                value={form.tryItChallenge}
                rows={4}
                onChange={(event) =>
                  update("tryItChallenge", event.target.value)
                }
              />
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <h2 className="text-base font-semibold">Search metadata</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Empty fields fall back to the chapter title and summary.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="chapter-seo-title">SEO title</Label>
                <span className="text-xs text-muted-foreground">
                  {form.seoTitle.length}/70
                </span>
              </div>
              <Input
                id="chapter-seo-title"
                value={form.seoTitle}
                maxLength={70}
                onChange={(event) => update("seoTitle", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="chapter-seo-description">SEO description</Label>
                <span className="text-xs text-muted-foreground">
                  {form.seoDescription.length}/170
                </span>
              </div>
              <Textarea
                id="chapter-seo-description"
                value={form.seoDescription}
                maxLength={170}
                rows={4}
                onChange={(event) =>
                  update("seoDescription", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapter-keywords">Keywords</Label>
              <Input
                id="chapter-keywords"
                value={form.keywords}
                onChange={(event) => update("keywords", event.target.value)}
                placeholder="react hooks, useState, frontend"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapter-canonical">Canonical URL</Label>
              <Input
                id="chapter-canonical"
                type="url"
                value={form.canonicalUrl}
                maxLength={500}
                onChange={(event) => update("canonicalUrl", event.target.value)}
                placeholder={publicUrl || "https://asif.to/course/chapter"}
              />
            </div>
          </section>
        </main>

        <aside className="space-y-5 lg:border-l lg:border-zinc-200 lg:pl-6 dark:lg:border-zinc-800">
          <h2 className="text-sm font-semibold">Placement</h2>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(value) => update("status", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="chapter-order">Display order</Label>
            <Input
              id="chapter-order"
              type="number"
              value={form.order}
              onChange={(event) => update("order", event.target.value)}
            />
          </div>
        </aside>
      </div>

      <ConfirmDialog
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        onConfirm={publish}
        title="Publish chapter"
        description="Save these changes and make this chapter available on the public site."
        confirmText="Publish"
        variant="default"
        loading={saving}
      />
    </div>
  );
}
