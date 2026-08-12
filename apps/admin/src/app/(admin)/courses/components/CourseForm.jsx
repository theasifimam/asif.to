"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Loader2,
  Save,
  Send,
} from "lucide-react";
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { coursesApi } from "@/lib/api";

const initialForm = {
  title: "",
  slug: "",
  subtitle: "",
  techId: "",
  level: "Beginner - Advanced",
  duration: "Self-paced",
  thumbnail: "",
  learningOutcomes: "",
  seoTitle: "",
  seoDescription: "",
  keywords: "",
  canonicalUrl: "",
  order: 0,
  status: "draft",
  examEnabled: false,
  examSettings: {
    questionCount: 20,
    durationMinutes: 30,
    passingPercentage: 70,
    cooldownHours: 24,
  },
};

const examFields = [
  ["questionCount", "Questions", 1, 100],
  ["durationMinutes", "Duration (minutes)", 1, 300],
  ["passingPercentage", "Passing score (%)", 1, 100],
  ["cooldownHours", "Retry cooldown (hours)", 0, 720],
];

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CourseForm({ courseId = null }) {
  const [form, setForm] = useState(initialForm);
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(Boolean(courseId));
  const [saving, setSaving] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    let active = true;
    coursesApi.getById(courseId).then((response) => {
      if (!active) return;
      if (!response.success) {
        toast.error(response.error || "Unable to load course");
        setLoading(false);
        return;
      }

      const course = response.data?.data;
      setForm({
        ...initialForm,
        ...course,
        keywords: (course.keywords || []).join(", "),
        learningOutcomes: (course.learningOutcomes || []).join("\n"),
        examEnabled: Boolean(course.examEnabled),
        examSettings: {
          ...initialForm.examSettings,
          ...(course.examSettings || {}),
        },
      });
      setSlugEdited(true);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [courseId]);

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
    ...form,
    status,
    order: Number(form.order) || 0,
    keywords: form.keywords
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    learningOutcomes: form.learningOutcomes
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    examSettings: Object.fromEntries(
      Object.entries(form.examSettings).map(([key, value]) => [
        key,
        Number(value),
      ]),
    ),
  });

  const persist = async (status) => {
    if (!form.title.trim() || !form.subtitle.trim() || !form.techId.trim()) {
      toast.error("Title, subtitle, and technology ID are required");
      return null;
    }
    if (!form.slug.trim()) {
      toast.error("A URL slug is required");
      return null;
    }

    setSaving(true);
    const response = courseId
      ? await coursesApi.update(courseId, payload(status))
      : await coursesApi.create(payload(status));

    if (!response.success) {
      toast.error(response.error || "Unable to save course");
      setSaving(false);
      return null;
    }

    const savedCourse = response.data?.data;
    setForm((current) => ({ ...current, status }));
    toast.success(status === "published" ? "Course published" : "Course saved");
    setSaving(false);

    if (!courseId && savedCourse?._id) {
      window.location.assign(`/courses/${savedCourse._id}/edit`);
    }
    return savedCourse;
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

  const publicUrl = form.slug ? `https://asif.to/courses/${form.slug}` : "";

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" asChild title="Back to courses">
            <Link href="/courses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {courseId ? "Edit course" : "Create course"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Course details, publishing controls, exam settings, and search
              metadata.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {courseId && publicUrl && (
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
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-semibold">Course content</h2>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-title">Title</Label>
              <Input
                id="course-title"
                value={form.title}
                maxLength={180}
                onChange={(event) => updateTitle(event.target.value)}
                placeholder="Complete JavaScript Course"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="course-slug">URL slug</Label>
                <span className="text-xs text-muted-foreground">
                  /courses/{form.slug || "course-slug"}
                </span>
              </div>
              <Input
                id="course-slug"
                value={form.slug}
                maxLength={200}
                onChange={(event) => {
                  setSlugEdited(true);
                  update("slug", slugify(event.target.value));
                }}
                placeholder="complete-javascript-course"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-subtitle">Subtitle</Label>
              <Textarea
                id="course-subtitle"
                value={form.subtitle}
                maxLength={320}
                rows={3}
                onChange={(event) => update("subtitle", event.target.value)}
                placeholder="A concise description of the course and its audience."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="course-tech">Technology ID</Label>
                <Input
                  id="course-tech"
                  value={form.techId}
                  onChange={(event) =>
                    update("techId", slugify(event.target.value))
                  }
                  placeholder="javascript"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-duration">Duration</Label>
                <Input
                  id="course-duration"
                  value={form.duration}
                  onChange={(event) => update("duration", event.target.value)}
                  placeholder="Self-paced"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-thumbnail">Thumbnail URL</Label>
              <Input
                id="course-thumbnail"
                type="url"
                value={form.thumbnail}
                onChange={(event) => update("thumbnail", event.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-outcomes">Learning outcomes</Label>
              <Textarea
                id="course-outcomes"
                value={form.learningOutcomes}
                rows={7}
                onChange={(event) =>
                  update("learningOutcomes", event.target.value)
                }
                placeholder={
                  "Build reusable components\nManage application state\nShip a production project"
                }
              />
              <p className="text-xs text-muted-foreground">
                One outcome per line.
              </p>
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <h2 className="text-base font-semibold">Search metadata</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Empty fields fall back to the course title and subtitle on the
                public page.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="course-seo-title">SEO title</Label>
                <span className="text-xs text-muted-foreground">
                  {form.seoTitle.length}/70
                </span>
              </div>
              <Input
                id="course-seo-title"
                value={form.seoTitle}
                maxLength={70}
                onChange={(event) => update("seoTitle", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="course-seo-description">SEO description</Label>
                <span className="text-xs text-muted-foreground">
                  {form.seoDescription.length}/170
                </span>
              </div>
              <Textarea
                id="course-seo-description"
                value={form.seoDescription}
                maxLength={170}
                rows={4}
                onChange={(event) =>
                  update("seoDescription", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-keywords">Keywords</Label>
              <Input
                id="course-keywords"
                value={form.keywords}
                onChange={(event) => update("keywords", event.target.value)}
                placeholder="javascript, web development, programming"
              />
              <p className="text-xs text-muted-foreground">Comma-separated.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-canonical">Canonical URL</Label>
              <Input
                id="course-canonical"
                type="url"
                value={form.canonicalUrl}
                maxLength={500}
                onChange={(event) => update("canonicalUrl", event.target.value)}
                placeholder={publicUrl || "https://asif.to/courses/course-slug"}
              />
            </div>
          </section>
        </main>

        <aside className="space-y-6 lg:border-l lg:border-zinc-200 lg:pl-6 dark:lg:border-zinc-800">
          <section className="space-y-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
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
              <Label>Level</Label>
              <Select
                value={form.level}
                onValueChange={(value) => update("level", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Beginner - Advanced">
                    Beginner - Advanced
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-order">Display order</Label>
              <Input
                id="course-order"
                type="number"
                value={form.order}
                onChange={(event) => update("order", event.target.value)}
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold">Final exam</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Enable assessment after the course.
                </p>
              </div>
              <Switch
                checked={form.examEnabled}
                onCheckedChange={(checked) => update("examEnabled", checked)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {examFields.map(([key, label, min, max]) => (
                <div className="space-y-2" key={key}>
                  <Label htmlFor={`exam-${key}`}>{label}</Label>
                  <Input
                    id={`exam-${key}`}
                    type="number"
                    min={min}
                    max={max}
                    disabled={!form.examEnabled}
                    value={form.examSettings[key]}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        examSettings: {
                          ...current.examSettings,
                          [key]: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        onConfirm={publish}
        title="Publish course"
        description="Save these changes and make this course available on the public site."
        confirmText="Publish"
        variant="default"
        loading={saving}
      />
    </div>
  );
}
