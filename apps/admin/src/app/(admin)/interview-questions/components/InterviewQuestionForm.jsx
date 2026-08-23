"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, Save } from "lucide-react";
import { toast } from "sonner";
import { getModuleBackUrl } from "@/hooks/useModuleHistory";
import Editor from "@/components/editor/Editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  coursesApi,
  interviewQuestionsApi,
  topicCategoriesApi,
} from "@/lib/api";
import AdminFormShell, {
  AdminFormLoading,
  formSectionClass,
} from "@/components/forms/AdminFormShell";
import DiscussButton from "@/components/messaging/DiscussButton";
import FollowUpQuestionPicker from "@/components/editor/FollowUpQuestionPicker";
import { CanonicalUrlInput } from "@/components/admin";

const initialForm = {
  category: "",
  course: "",
  question: "",
  slug: "",
  answer: "",
  difficulty: "medium",
  questionType: "conceptual",
  tags: "",
  codeExample: "",
  expectedOutput: "",
  followUps: "",
  seoTitle: "",
  seoDescription: "",
  keywords: "",
  canonicalUrl: "",
  ogImage: "",
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function InterviewQuestionForm({
  questionId = null,
  initialCourse = "",
  initialCategory = "",
  lockTaxonomy = false,
}) {
  const searchParams = useSearchParams();
  const requestedReturnTo = searchParams.get("returnTo");
  const returnTo = getModuleBackUrl(
    "/interview-questions",
    requestedReturnTo,
  );
  const taxonomyLocked =
    lockTaxonomy ||
    /^\/courses\/[^/]+\/categories\/[^/]+\/interview-questions(?:\?|$)/.test(
      returnTo,
    );
  const [form, setForm] = useState({
    ...initialForm,
    course: initialCourse,
    category: initialCategory,
  });
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    Promise.all([
      coursesApi.listAll(),
      topicCategoriesApi.list("all"),
      questionId
        ? interviewQuestionsApi.get(questionId)
        : Promise.resolve(null),
    ]).then(([courseResponse, categoryResponse, questionResponse]) => {
      if (courseResponse.success) setCourses(courseResponse.data?.data || []);
      else toast.error(courseResponse.error || "Unable to load courses");

      if (categoryResponse?.success)
        setCategories(categoryResponse.data?.data || []);

      if (questionResponse?.success) {
        const item = questionResponse.data?.data;
        setForm({
          ...initialForm,
          ...item,
          category: item.category?._id || item.category || "",
          course: item.course?._id || item.course || "",
          tags: (item.tags || []).join(", "),
          followUps: (item.followUps || []).join("\n"),
          keywords: (item.keywords || []).join(", "),
        });
        setSlugEdited(true);
      } else if (questionId) {
        toast.error(questionResponse?.error || "Unable to load question");
      }
      setLoading(false);
    });
  }, [questionId, initialCourse, initialCategory]);

  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const updateQuestion = (question) =>
    setForm((current) => ({
      ...current,
      question,
      slug: slugEdited ? current.slug : slugify(question),
    }));

  const save = async () => {
    if (
      (!form.category && !form.course) ||
      !form.question.trim() ||
      !form.answer.trim()
    )
      return toast.error(
        "Category (or course), question, and answer are required",
      );
    setSaving(true);
    const payload = {
      ...form,
      course: form.course === "none" ? null : form.course,
      tags: form.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      followUps: form.followUps
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      keywords: form.keywords
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    const response = questionId
      ? await interviewQuestionsApi.update(questionId, payload)
      : await interviewQuestionsApi.create(payload);
    if (response.success) {
      toast.success(questionId ? "Question saved" : "Question created");
      if (!questionId) {
        const createdId = response.data?.data?._id;
        const editBase = `/interview-questions/${createdId}/edit`;
        const editUrl =
          returnTo !== "/interview-questions"
            ? `${editBase}?returnTo=${encodeURIComponent(returnTo)}`
            : editBase;
        window.location.assign(editUrl);
      }
    } else toast.error(response.error || "Unable to save question");
    setSaving(false);
  };

  if (loading) return <AdminFormLoading />;

  return (
    <AdminFormShell
      eyebrow="Content / Interview Questions"
      title={
        questionId ? "Edit interview question" : "Create interview question"
      }
      description="Maintain a reusable, interview-ready answer for this course."
      back={
        <Link
          href={returnTo}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to questions
        </Link>
      }
      actions={
        <div className="flex items-center gap-2 w-full md:w-auto">
          {questionId && (
            <DiscussButton
              entityType="interview_question"
              entityId={questionId}
            />
          )}
          <Button
            variant="outline"
            onClick={() => setPreview((value) => !value)}
            className="flex-1 sm:flex-initial"
          >
            <Eye className="h-4 w-4" />
            {preview ? "Edit" : "Preview"}
          </Button>
          <Button
            onClick={save}
            disabled={saving}
            className="flex-1 sm:flex-initial"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      }
    >
      {preview ? (
        <article className="space-y-5 rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white p-4 sm:p-6 dark:border-zinc-800/60 dark:bg-zinc-950">
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase text-zinc-500">
            <span>{form.difficulty}</span>
            <span>{form.questionType}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white">
            {form.question || "Untitled question"}
          </h2>
          <div className="whitespace-pre-wrap leading-7 text-zinc-700 dark:text-zinc-300 text-sm sm:text-base">
            {form.answer}
          </div>
          {form.codeExample && (
            <pre className="overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-xs sm:text-sm text-zinc-100">
              <code>{form.codeExample}</code>
            </pre>
          )}
          {form.expectedOutput && (
            <pre className="overflow-x-auto rounded-2xl bg-zinc-100 p-4 text-xs sm:text-sm dark:bg-zinc-900">
              <code>{form.expectedOutput}</code>
            </pre>
          )}
        </article>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-6">
            <div className={formSectionClass}>
              <div className="space-y-2">
                <Label>Question</Label>
                <Textarea
                  value={form.question}
                  onChange={(event) => updateQuestion(event.target.value)}
                  rows={3}
                  maxLength={500}
                  className="rounded-2xl border-0 bg-zinc-100 px-4 py-3 shadow-none dark:bg-zinc-900"
                />
              </div>
              <div className="space-y-2">
                <Label>Stable anchor slug</Label>
                <Input
                  value={form.slug}
                  onChange={(event) => {
                    setSlugEdited(true);
                    update("slug", slugify(event.target.value));
                  }}
                  placeholder="what-is-usememo"
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Editor
                  value={form.answer}
                  onChange={(value) => update("answer", value)}
                  placeholder="Write the canonical answer in Markdown..."
                />
              </div>
              <div className="space-y-2">
                <Label>Code example</Label>
                <Textarea
                  value={form.codeExample}
                  onChange={(event) =>
                    update("codeExample", event.target.value)
                  }
                  rows={8}
                  className="rounded-2xl border-0 bg-zinc-100 px-4 py-3 font-mono shadow-none dark:bg-zinc-900 text-xs sm:text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Expected output</Label>
                <Textarea
                  value={form.expectedOutput}
                  onChange={(event) =>
                    update("expectedOutput", event.target.value)
                  }
                  rows={4}
                  className="rounded-2xl border-0 bg-zinc-100 px-4 py-3 font-mono shadow-none dark:bg-zinc-900 text-xs sm:text-sm"
                />
              </div>
            </div>
          </section>
          <aside className="space-y-5 rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white p-4 sm:p-5 dark:border-zinc-800/60 dark:bg-zinc-950">
            <div className="space-y-2">
              <Label>Course (Optional)</Label>
              <Select
                value={form.course || "none"}
                disabled={taxonomyLocked}
                onValueChange={(value) => {
                  const selectedCourseId = value === "none" ? "" : value;
                  setForm((current) => {
                    const currentCat = categories.find(
                      (c) => c._id === current.category,
                    );
                    const catCourseId =
                      currentCat?.course?._id || currentCat?.course;
                    const keepCategory =
                      !selectedCourseId ||
                      !catCourseId ||
                      String(catCourseId) === String(selectedCourseId);
                    return {
                      ...current,
                      course: selectedCourseId,
                      category: keepCategory ? current.category : "",
                    };
                  });
                }}
              >
                <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900">
                  <SelectValue placeholder="Optional course link" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No associated course</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Interview Category (Primary)</Label>
              <Select
                value={form.category}
                disabled={taxonomyLocked}
                onValueChange={(categoryId) => {
                  const selectedCat = categories.find(
                    (c) => c._id === categoryId,
                  );
                  setForm((current) => ({
                    ...current,
                    category: categoryId,
                    course:
                      selectedCat?.course?._id ||
                      selectedCat?.course ||
                      current.course,
                  }));
                }}
              >
                <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900">
                  <SelectValue placeholder="Select category (e.g. Fundamentals)" />
                </SelectTrigger>
                <SelectContent>
                  {(form.course && form.course !== "none"
                    ? categories.filter((c) => {
                        const catCourseId = c.course?._id || c.course;
                        return (
                          !catCourseId ||
                          String(catCourseId) === String(form.course)
                        );
                      })
                    : categories
                  ).map((cat) => {
                    const courseTitle =
                      cat.course?.title ||
                      courses.find((c) => String(c._id) === String(cat.course))
                        ?.title;
                    return (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}{" "}
                        <span className="text-zinc-400">
                          ({courseTitle || cat.slug})
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-500">
                Primary interview category landing page taxonomy.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={form.difficulty}
                onValueChange={(value) => update("difficulty", value)}
              >
                <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Question type</Label>
              <Select
                value={form.questionType}
                onValueChange={(value) => update("questionType", value)}
              >
                <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conceptual">Conceptual</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="scenario">Scenario</SelectItem>
                  <SelectItem value="debugging">Debugging</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input
                value={form.tags}
                onChange={(event) => update("tags", event.target.value)}
                placeholder="react, hooks, performance"
              />
            </div>
            <FollowUpQuestionPicker
              course={form.course}
              value={form.followUps}
              onChange={(value) => update("followUps", value)}
              excludeId={questionId}
            />
            <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">
              <h3 className="text-sm font-black">Search metadata</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Empty fields automatically use the question and answer as
                fallbacks.
              </p>
            </div>
            <div className="space-y-2">
              <Label>SEO title ({form.seoTitle.length}/70)</Label>
              <Input
                maxLength={70}
                value={form.seoTitle}
                onChange={(event) => update("seoTitle", event.target.value)}
                placeholder="Custom title for search results"
              />
            </div>
            <div className="space-y-2">
              <Label>SEO description ({form.seoDescription.length}/170)</Label>
              <Textarea
                maxLength={170}
                rows={3}
                value={form.seoDescription}
                onChange={(event) =>
                  update("seoDescription", event.target.value)
                }
                placeholder="Brief summary for search engine snippets"
              />
            </div>
            <div className="space-y-2">
              <Label>SEO keywords</Label>
              <Input
                value={form.keywords}
                onChange={(event) => update("keywords", event.target.value)}
                placeholder="react, useEffect, interview"
              />
            </div>
            <CanonicalUrlInput
              basePrefix={(() => {
                const selectedCourse = courses.find(
                  (c) => String(c._id) === String(form.course),
                );
                const selectedCategory = categories.find(
                  (c) => String(c._id) === String(form.category),
                );
                const cSlug =
                  selectedCourse?.slug || selectedCategory?.course?.slug || "";
                const catSlug = selectedCategory?.slug || "";
                return cSlug && catSlug
                  ? `https://asif.to/${cSlug}/interview-questions/${catSlug}`
                  : catSlug
                    ? `https://asif.to/interview-questions/${catSlug}`
                    : cSlug
                      ? `https://asif.to/${cSlug}/interview-questions`
                      : "https://asif.to/interview-questions";
              })()}
              value={form.canonicalUrl}
              onChange={(value) => update("canonicalUrl", value)}
              placeholder={form.slug || slugify(form.question || "")}
            />
            <div className="space-y-2">
              <Label>Open Graph image URL</Label>
              <Input
                value={form.ogImage}
                onChange={(event) => update("ogImage", event.target.value)}
                placeholder="https://asif.to/og/..."
              />
            </div>
          </aside>
        </div>
      )}
    </AdminFormShell>
  );
}
