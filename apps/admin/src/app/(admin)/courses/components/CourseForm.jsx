"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getModuleBackUrl } from "@/hooks/useModuleHistory";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Loader2,
  Save,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
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
import AdminFormShell, {
  AdminFormLoading,
  formSectionClass,
} from "@/components/forms/AdminFormShell";
import { CanonicalUrlInput } from "@/components/admin";

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
  interviewSeoTitle: "",
  interviewSeoDescription: "",
  interviewKeywords: "",
  interviewCanonicalUrl: "",
  interviewOgImage: "",
  order: 0,
  status: "draft",
  examEnabled: false,
  relatedCourses: [],
  popularChapterIds: [],
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
  const searchParams = useSearchParams();
  const requestedReturnTo = searchParams.get("returnTo");
  const returnTo = getModuleBackUrl("/courses", requestedReturnTo);
  const [form, setForm] = useState(initialForm);
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(Boolean(courseId));
  const [saving, setSaving] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [courseChapters, setCourseChapters] = useState([]);

  useEffect(() => {
    coursesApi.listAll({ limit: 100 }).then((res) => {
      if (res.success) {
        setAllCourses(res.data?.data || []);
      }
    });
  }, []);

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
      setCourseChapters(course?.chapters || []);
      setForm({
        ...initialForm,
        ...course,
        keywords: (course.keywords || []).join(", "),
        interviewKeywords: (course.interviewKeywords || []).join(", "),
        learningOutcomes: (course.learningOutcomes || []).join("\n"),
        examEnabled: Boolean(course.examEnabled),
        relatedCourses: (course.relatedCourses || []).map((c) =>
          typeof c === "object" ? c._id : c,
        ),
        popularChapterIds: (course.popularChapterIds || []).map((ch) =>
          typeof ch === "object" ? ch._id : ch,
        ),
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
    interviewKeywords: form.interviewKeywords
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    learningOutcomes: form.learningOutcomes
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    relatedCourses: Array.isArray(form.relatedCourses)
      ? form.relatedCourses
      : [],
    popularChapterIds: Array.isArray(form.popularChapterIds)
      ? form.popularChapterIds
      : [],
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
      window.location.assign(returnTo);
    }
    return savedCourse;
  };

  const publish = async () => {
    await persist("published");
    setPublishOpen(false);
  };

  if (loading) {
    return <AdminFormLoading />;
  }

  const publicUrl = form.slug ? `https://asif.to/courses/${form.slug}` : "";

  return (
    <AdminFormShell
      eyebrow="Learning / Courses"
      title={courseId ? "Edit course" : "Create course"}
      description="Course details, publishing controls, exam settings, and search metadata."
      back={
        <Link
          href={returnTo}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to courses
        </Link>
      }
      actions={
        <>
          {courseId && publicUrl && (
            <Button
              variant="outline"
              asChild
              className="flex-1 sm:flex-initial"
            >
              <a href={publicUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            disabled={saving}
            onClick={() => persist("draft")}
            className="flex-1 sm:flex-initial"
          >
            <Save className="mr-2 h-4 w-4" />
            Draft
          </Button>
          <Button
            disabled={saving}
            onClick={() => setPublishOpen(true)}
            className="w-full sm:w-auto"
          >
            <Send className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="space-y-6">
          <section className={formSectionClass}>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
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
                className="rounded-2xl border-0 bg-zinc-100 px-4 py-3 shadow-none dark:bg-zinc-900"
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
                className="rounded-2xl border-0 bg-zinc-100 px-4 py-3 shadow-none dark:bg-zinc-900"
              />
              <p className="text-xs text-muted-foreground">
                One outcome per line.
              </p>
            </div>
          </section>

          <section className="space-y-5 rounded-4xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-950">
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
                  {(form.seoTitle || "").length}/70
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
                  {(form.seoDescription || "").length}/170
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
                className="rounded-2xl border-0 bg-zinc-100 px-4 py-3 shadow-none dark:bg-zinc-900"
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
            <CanonicalUrlInput
              basePrefix="https://asif.to/courses"
              value={form.canonicalUrl}
              onChange={(value) => update("canonicalUrl", value)}
              placeholder={form.slug || slugify(form.title)}
            />
          </section>

          <section className="space-y-5 rounded-4xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-950">
            <div>
              <h2 className="text-base font-semibold">
                Interview guide metadata
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Controls the course interview-question landing page.
              </p>
            </div>
            <div className="space-y-2">
              <Label>SEO title ({form.interviewSeoTitle.length}/70)</Label>
              <Input
                maxLength={70}
                value={form.interviewSeoTitle}
                onChange={(e) => update("interviewSeoTitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>
                SEO description ({form.interviewSeoDescription.length}/170)
              </Label>
              <Textarea
                maxLength={170}
                rows={3}
                value={form.interviewSeoDescription}
                onChange={(e) =>
                  update("interviewSeoDescription", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Keywords</Label>
              <Input
                value={form.interviewKeywords}
                onChange={(e) => update("interviewKeywords", e.target.value)}
              />
            </div>
            <CanonicalUrlInput
              basePrefix={
                form.slug
                  ? `https://asif.to/${form.slug}/interview-questions`
                  : "https://asif.to/interview-questions"
              }
              value={form.interviewCanonicalUrl}
              onChange={(value) => update("interviewCanonicalUrl", value)}
              placeholder=""
              label="Interview Canonical URL"
            />
            <div className="space-y-2">
              <Label>Open Graph image URL</Label>
              <Input
                value={form.interviewOgImage}
                onChange={(e) => update("interviewOgImage", e.target.value)}
              />
            </div>
          </section>

          <section className="space-y-5 rounded-4xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-950">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                Related Content & Recommendations
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Explicitly select related courses and featured chapters. If
                unselected, smart defaults are used automatically.
              </p>
            </div>

            {/* Related Courses Multi-Select / Checkbox list */}
            <div className="space-y-2">
              <Label>
                Related Courses (shown on Course Overview & Sidebars)
              </Label>
              <div className="max-h-48 overflow-y-auto space-y-1 rounded-2xl border border-zinc-200/60 bg-zinc-50 p-3 dark:border-zinc-800/60 dark:bg-zinc-900/50">
                {allCourses
                  .filter((c) => c._id !== courseId)
                  .map((c) => {
                    const isSelected = (form.relatedCourses || []).includes(
                      c._id,
                    );
                    return (
                      <label
                        key={c._id}
                        className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...(form.relatedCourses || []), c._id]
                              : (form.relatedCourses || []).filter(
                                  (id) => id !== c._id,
                                );
                            update("relatedCourses", next);
                          }}
                          className="h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-400"
                        />
                        <span>{c.title}</span>
                      </label>
                    );
                  })}
                {allCourses.length <= 1 && (
                  <p className="text-xs text-muted-foreground">
                    No other courses available.
                  </p>
                )}
              </div>
            </div>

            {/* Featured Chapters */}
            {courseChapters.length > 0 && (
              <div className="space-y-2">
                <Label>
                  Popular / Featured Chapters (Highlighted in recommendations)
                </Label>
                <div className="max-h-48 overflow-y-auto space-y-1 rounded-2xl border border-zinc-200/60 bg-zinc-50 p-3 dark:border-zinc-800/60 dark:bg-zinc-900/50">
                  {courseChapters.map((ch, idx) => {
                    const isSelected = (form.popularChapterIds || []).includes(
                      ch._id,
                    );
                    return (
                      <label
                        key={ch._id}
                        className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...(form.popularChapterIds || []), ch._id]
                              : (form.popularChapterIds || []).filter(
                                  (id) => id !== ch._id,
                                );
                            update("popularChapterIds", next);
                          }}
                          className="h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-400"
                        />
                        <span>
                          {ch.order ?? idx + 1}. {ch.title}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </main>

        <aside className="space-y-6">
          <div className="space-y-4 rounded-4xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-950">
            <h2 className="font-semibold text-zinc-900 dark:text-white text-sm">
              Placement
            </h2>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => update("status", value)}
              >
                <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900">
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
                <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900">
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
          </div>

          <div className="space-y-4 rounded-4xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-950">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-zinc-900 dark:text-white text-sm">
                  Final exam
                </h2>
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
          </div>
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
    </AdminFormShell>
  );
}
