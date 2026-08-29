"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Save } from "lucide-react";
import { toast } from "sonner";
import AdminFormShell, { formAsideClass, formSectionClass } from "@/components/forms/AdminFormShell";
import { Button, Input, Label, Textarea } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { coursesApi, quizApi } from "@/lib/api";
import { getModuleBackUrl } from "@/hooks/useModuleHistory";
import LearningMappingFields from "./LearningMappingFields";

const initialForm = {
  type: "quiz",
  question: "",
  courseIds: [],
  learningMappings: [],
  options: ["", "", "", ""],
  correctIndex: 0,
  explanation: "",
  quizEnabled: true,
  flashcardEnabled: true,
  flashcardAnswer: "",
  tag: "",
  difficulty: "medium",
  status: "published",
};

export default function QuestionForm({ questionId }) {
  const searchParams = useSearchParams();
  const requestedReturnTo = searchParams.get("returnTo");
  const returnTo = getModuleBackUrl("/quiz", requestedReturnTo);
  const [form, setForm] = useState(initialForm);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(Boolean(questionId));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      coursesApi.listAll(),
      questionId ? quizApi.get(questionId) : null,
    ]).then(([courseResponse, questionResponse]) => {
      setCourses(courseResponse.data?.data?.data || courseResponse.data?.data || []);
      if (questionResponse?.success) {
        const item = questionResponse.data?.data;
        setForm({
          ...initialForm,
          ...item,
          type: "quiz",
          courseIds: (item.courses || []).map((course) => course._id || course),
          learningMappings: (item.learningMappings || []).map((m) => ({
            course: m.course?._id || m.course || "",
            category: m.category?._id || m.category || "",
            chapter: m.chapter?._id || m.chapter || "",
            source: m.source || "manual",
            confidence: m.confidence ?? 100,
          })),
          options: item.options?.length === 4 ? item.options : initialForm.options,
        });
      }
      setLoading(false);
    });
  }, [questionId]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateQuestion = (value) => setForm((current) => ({ ...current, question: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = { ...form, type: "quiz" };
    const response = questionId ? await quizApi.update(questionId, payload) : await quizApi.create(payload);
    if (response.success) {
      toast.success(questionId ? "Question saved" : "Question created");
      window.location.assign(returnTo);
    } else {
      toast.error(response.error || "Unable to save question");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LogoLoader className="h-6 w-6  text-blue-600"  />
      </div>
    );
  }

  return (
    <AdminFormShell
      eyebrow="Learning / Question Bank"
      title={questionId ? "Edit question" : "Create question"}
      description="Create a concise quiz or practice question with one correct answer."
      back={
        <Link href={returnTo} className="inline-flex items-center gap-2 text-sm text-zinc-500">
          <ArrowLeft className="h-4 w-4" /> Back to question bank
        </Link>
      }
      actions={
        <Button form="question-form" type="submit" loading={saving}>
          <Save className="mr-2 h-4 w-4" /> Save question
        </Button>
      }
    >
      <form id="question-form" onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-6">
          <div className={formSectionClass}>
            <div className="space-y-2">
              <Label>Question</Label>
              <Textarea
                required
                rows={4}
                value={form.question}
                onChange={(event) => updateQuestion(event.target.value)}
                placeholder="Write a clear multiple-choice question…"
              />
            </div>
            <div className="space-y-3">
              <Label>Answer options</Label>
              {form.options.map((option, index) => (
                <div key={index} className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => update("correctIndex", index)}
                    className={`h-10 w-10 shrink-0 rounded-full border-2 text-sm font-bold ${
                      form.correctIndex === index
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-zinc-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                  <Input
                    required
                    value={option}
                    onChange={(event) =>
                      update(
                        "options",
                        form.options.map((item, itemIndex) =>
                          itemIndex === index ? event.target.value : item
                        )
                      )
                    }
                    placeholder={`Option ${index + 1}`}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Short explanation</Label>
              <Textarea
                rows={4}
                value={form.explanation}
                onChange={(event) => update("explanation", event.target.value)}
              />
            </div>
            {form.flashcardEnabled && (
              <>
                <div className="space-y-2">
                  <Label>
                    Flashcard answer <span className="font-normal text-zinc-400">(optional override)</span>
                  </Label>
                  <Textarea
                    rows={4}
                    value={form.flashcardAnswer}
                    onChange={(event) => update("flashcardAnswer", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Revision tag</Label>
                  <Input value={form.tag} onChange={(event) => update("tag", event.target.value)} />
                </div>
              </>
            )}
          </div>
        </section>

        <aside className={`${formAsideClass} self-start lg:sticky lg:top-24`}>
          <div className="space-y-2">
            <Label>Courses</Label>
            <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-2.5 dark:border-zinc-800/80 dark:bg-zinc-900/50">
              {courses.map((course) => {
                const selected = (form.courseIds || []).includes(course._id);
                return (
                  <button
                    key={course._id}
                    type="button"
                    onClick={() => {
                      const next = selected
                        ? form.courseIds.filter((id) => id !== course._id)
                        : [...(form.courseIds || []), course._id];
                      update("courseIds", next);
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                      selected
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <span className="truncate">{course.title}</span>
                    {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <LearningMappingFields
            courseIds={form.courseIds || []}
            courses={courses}
            value={form.learningMappings || []}
            onChange={(value) => update("learningMappings", value)}
          />

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={form.quizEnabled}
              onChange={(event) => update("quizEnabled", event.target.checked)}
            />
            Use in quizzes/exams
          </label>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={form.flashcardEnabled}
              onChange={(event) => update("flashcardEnabled", event.target.checked)}
            />
            Use as flashcard
          </label>

          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select
              value={form.difficulty}
              onValueChange={(value) => update("difficulty", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["easy", "medium", "hard"].map((value) => (
                  <SelectItem key={value} value={value} className="capitalize">
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </aside>
      </form>
    </AdminFormShell>
  );
}
