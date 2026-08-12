"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Loader2,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Editor from "@/components/Editor";
import { ConfirmDialog } from "@/components/confirm-dialog";
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
  topicsApi,
} from "@/lib/api";

const initialForm = {
  type: "article",
  title: "",
  slug: "",
  course: "",
  category: "",
  excerpt: "",
  content: "",
  seoTitle: "",
  seoDescription: "",
  keywords: "",
  canonicalUrl: "",
  order: 0,
  relatedTopics: [],
  interviewQuestions: [],
  status: "draft",
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function TopicForm({ topicId = null }) {
  const [form, setForm] = useState(initialForm);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [relatedOptions, setRelatedOptions] = useState([]);
  const [relatedSearch, setRelatedSearch] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionOptions, setQuestionOptions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(Boolean(topicId));
  const [saving, setSaving] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      coursesApi.listAll(),
      topicId ? topicsApi.get(topicId) : Promise.resolve(null),
    ]).then(([courseResponse, topicResponse]) => {
      setCourses(courseResponse.data?.data || []);
      if (topicResponse?.success) {
        const topic = topicResponse.data?.data;
        setForm({
          ...initialForm,
          ...topic,
          course: topic.course?._id || topic.course,
          category: topic.category?._id || topic.category,
          keywords: (topic.keywords || []).join(", "),
          relatedTopics: (topic.relatedTopics || []).map(
            (item) => item._id || item,
          ),
          interviewQuestions: (topic.interviewQuestions || [])
            .filter((entry) => entry.question)
            .sort((a, b) => a.order - b.order)
            .map((entry) => entry.question),
        });
        setSlugEdited(true);
      }
      setLoading(false);
    });
  }, [topicId]);

  useEffect(() => {
    if (!form.course) {
      setCategories([]);
      setRelatedOptions([]);
      return;
    }
    Promise.all([
      topicCategoriesApi.list(form.course),
      topicsApi.list({ course: form.course, status: "all", limit: 100 }),
    ]).then(([categoryResponse, topicResponse]) => {
      setCategories(categoryResponse.data?.data || []);
      setRelatedOptions(
        (topicResponse.data?.data || []).filter((item) => item._id !== topicId),
      );
    });
  }, [form.course, topicId]);

  useEffect(() => {
    if (form.type !== "interview" || !form.course) {
      setQuestionOptions([]);
      return;
    }

    let active = true;
    const timer = setTimeout(
      async () => {
        setQuestionsLoading(true);
        const response = await interviewQuestionsApi.list({
          course: form.course,
          search: questionSearch,
          limit: 50,
        });
        if (active) {
          if (response.success) setQuestionOptions(response.data?.data || []);
          else
            toast.error(response.error || "Unable to load interview questions");
          setQuestionsLoading(false);
        }
      },
      questionSearch ? 250 : 0,
    );

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [form.course, form.type, questionSearch]);

  const filteredRelated = useMemo(
    () =>
      relatedOptions.filter((item) =>
        item.title.toLowerCase().includes(relatedSearch.toLowerCase()),
      ),
    [relatedOptions, relatedSearch],
  );

  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const updateTitle = (title) =>
    setForm((current) => ({
      ...current,
      title,
      slug: slugEdited ? current.slug : slugify(title),
      seoTitle: current.seoTitle || title,
    }));

  const payload = () => ({
    ...form,
    keywords: form.keywords
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    interviewQuestions:
      form.type === "interview"
        ? form.interviewQuestions.map((item, order) => ({
            question: item._id,
            order,
          }))
        : [],
  });

  const save = async () => {
    if (!form.title.trim() || !form.course || !form.category)
      return toast.error("Title, course, and category are required");
    setSaving(true);
    const response = topicId
      ? await topicsApi.update(topicId, payload())
      : await topicsApi.create(payload());
    if (response.success) {
      toast.success(topicId ? "Topic saved" : "Draft created");
      if (!topicId)
        window.location.assign(`/topics/${response.data?.data?._id}/edit`);
    } else toast.error(response.error || "Unable to save topic");
    setSaving(false);
    return response;
  };

  const publish = async () => {
    setSaving(true);
    const saveResponse = await (topicId
      ? topicsApi.update(topicId, payload())
      : topicsApi.create(payload()));
    const id = topicId || saveResponse.data?.data?._id;
    if (!saveResponse.success || !id) {
      toast.error(
        saveResponse.error || "Unable to save topic before publishing",
      );
      setSaving(false);
      return;
    }
    const response = await topicsApi.setStatus(id, "published");
    if (response.success) {
      toast.success("Topic published");
      setForm((current) => ({ ...current, status: "published" }));
      if (!topicId) window.location.assign(`/topics/${id}/edit`);
    } else toast.error(response.error || "Unable to publish topic");
    setSaving(false);
    setPublishOpen(false);
  };

  const toggleRelated = (id) =>
    update(
      "relatedTopics",
      form.relatedTopics.includes(id)
        ? form.relatedTopics.filter((item) => item !== id)
        : [...form.relatedTopics, id],
    );

  const addQuestion = (question) => {
    if (form.interviewQuestions.some((item) => item._id === question._id))
      return;
    update("interviewQuestions", [...form.interviewQuestions, question]);
  };

  const removeQuestion = (id) =>
    update(
      "interviewQuestions",
      form.interviewQuestions.filter((item) => item._id !== id),
    );

  const moveQuestion = (index, direction) => {
    const destination = index + direction;
    if (destination < 0 || destination >= form.interviewQuestions.length)
      return;
    const next = [...form.interviewQuestions];
    [next[index], next[destination]] = [next[destination], next[index]];
    update("interviewQuestions", next);
  };

  if (loading)
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link
            href="/topics"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to topics
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-zinc-950 dark:text-white">
            {topicId ? "Edit topic" : "Create topic"}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Status:{" "}
            <span className="font-semibold capitalize">{form.status}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={save} disabled={saving}>
            <Save className="mr-2 h-4 w-4" /> Save draft
          </Button>
          {form.status !== "published" && (
            <Button onClick={() => setPublishOpen(true)} disabled={saving}>
              <Send className="mr-2 h-4 w-4" /> Publish
            </Button>
          )}
          {form.status === "published" && topicId && (
            <Button
              variant="outline"
              onClick={async () => {
                const response = await topicsApi.setStatus(topicId, "draft");
                if (response.success) {
                  update("status", "draft");
                  toast.success("Topic unpublished");
                }
              }}
            >
              <Check className="mr-2 h-4 w-4" /> Published
            </Button>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-6">
          <div className="space-y-5 rounded-4xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-950">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(event) => updateTitle(event.target.value)}
                placeholder="Understanding React useState"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  update("slug", slugify(event.target.value));
                }}
                placeholder="understanding-react-usestate"
              />
              <p className="text-xs text-zinc-400">
                Editable and unique within the selected course.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Textarea
                value={form.excerpt}
                onChange={(event) => update("excerpt", event.target.value)}
                maxLength={320}
                rows={3}
                className="rounded-2xl border-0 bg-zinc-100 px-4 py-3 shadow-none dark:bg-zinc-900"
              />
              <p className="text-right text-xs text-zinc-400">
                {form.excerpt.length}/320
              </p>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Editor
                value={form.content}
                onChange={(value) => update("content", value || "")}
                placeholder="Write the topic in Markdown..."
              />
            </div>
          </div>
          {form.type === "interview" && (
            <div className="space-y-5 rounded-4xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-950">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="font-semibold text-zinc-900 dark:text-white">
                    Interview questions
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Assign reusable questions and set their display order.
                  </p>
                </div>
                <Link
                  href={
                    form.course
                      ? `/interview-questions/new?course=${form.course}`
                      : "/interview-questions/new"
                  }
                  target="_blank"
                >
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="h-4 w-4" /> Create question
                  </Button>
                </Link>
              </div>

              <div className="space-y-2">
                <Label>Find existing questions</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    value={questionSearch}
                    onChange={(event) => setQuestionSearch(event.target.value)}
                    placeholder="Search the question library"
                    className="rounded-2xl bg-zinc-100 pl-9 dark:bg-zinc-900"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto rounded-2xl bg-zinc-50 p-1 dark:bg-zinc-900/70">
                  {!form.course ? (
                    <p className="px-3 py-6 text-center text-sm text-zinc-500">
                      Select a course to browse its reusable question library.
                    </p>
                  ) : questionsLoading ? (
                    <Loader2 className="mx-auto my-6 h-5 w-5 animate-spin text-blue-600" />
                  ) : (
                    questionOptions.map((question) => {
                      const assigned = form.interviewQuestions.some(
                        (item) => item._id === question._id,
                      );
                      return (
                        <button
                          key={question._id}
                          type="button"
                          disabled={assigned}
                          onClick={() => addQuestion(question)}
                          className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm enabled:hover:bg-white disabled:opacity-50 dark:enabled:hover:bg-zinc-800"
                        >
                          <span className="line-clamp-2">
                            {question.question}
                          </span>
                          <span className="shrink-0 text-xs capitalize text-zinc-500">
                            {assigned ? "Assigned" : question.difficulty}
                          </span>
                        </button>
                      );
                    })
                  )}
                  {form.course &&
                    !questionsLoading &&
                    questionOptions.length === 0 && (
                      <p className="px-3 py-6 text-center text-sm text-zinc-500">
                        No matching questions.
                      </p>
                    )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assigned order ({form.interviewQuestions.length})</Label>
                {form.interviewQuestions.map((question, index) => (
                  <div
                    key={question._id}
                    className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-900/70"
                  >
                    <span className="w-6 shrink-0 text-center text-sm font-semibold text-zinc-500">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {question.question}
                      </p>
                      <p className="mt-1 text-xs capitalize text-zinc-500">
                        {question.difficulty} · {question.questionType}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Move question up"
                        disabled={index === 0}
                        onClick={() => moveQuestion(index, -1)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Move question down"
                        disabled={index === form.interviewQuestions.length - 1}
                        onClick={() => moveQuestion(index, 1)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Remove question"
                        onClick={() => removeQuestion(question._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                {form.interviewQuestions.length === 0 && (
                  <p className="rounded-2xl bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500 dark:bg-zinc-900/70">
                    Assign at least one question before publishing.
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="space-y-5 rounded-4xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-950">
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              Search metadata
            </h2>
            <div className="space-y-2">
              <Label>SEO title</Label>
              <Input
                value={form.seoTitle}
                onChange={(event) => update("seoTitle", event.target.value)}
                maxLength={70}
              />
              <p className="text-right text-xs text-zinc-400">
                {form.seoTitle.length}/70
              </p>
            </div>
            <div className="space-y-2">
              <Label>SEO description</Label>
              <Textarea
                value={form.seoDescription}
                onChange={(event) =>
                  update("seoDescription", event.target.value)
                }
                maxLength={170}
                rows={3}
                className="rounded-2xl border-0 bg-zinc-100 px-4 py-3 shadow-none dark:bg-zinc-900"
              />
              <p className="text-right text-xs text-zinc-400">
                {form.seoDescription.length}/170
              </p>
            </div>
            <div className="space-y-2">
              <Label>Keywords</Label>
              <Input
                value={form.keywords}
                onChange={(event) => update("keywords", event.target.value)}
                placeholder="react, hooks, state"
              />
            </div>
            <div className="space-y-2">
              <Label>Canonical URL</Label>
              <Input
                value={form.canonicalUrl}
                onChange={(event) => update("canonicalUrl", event.target.value)}
                placeholder="https://asif.to/react/use-state"
              />
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="space-y-4 rounded-4xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-950">
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              Placement
            </h2>
            <div className="space-y-2">
              <Label>Topic type</Label>
              <Select
                value={form.type}
                onValueChange={(type) => update("type", type)}
              >
                <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <Select
                value={form.course}
                onValueChange={(course) =>
                  setForm((current) => ({
                    ...current,
                    course,
                    category: "",
                    relatedTopics: [],
                    interviewQuestions: [],
                  }))
                }
              >
                <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(category) => update("category", category)}
                disabled={!form.course}
              >
                <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
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
                  update("order", Number(event.target.value))
                }
              />
            </div>
          </div>
          <div className="space-y-4 rounded-4xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-950">
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              Related topics
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={relatedSearch}
                onChange={(event) => setRelatedSearch(event.target.value)}
                placeholder="Search topics"
                className="rounded-2xl bg-zinc-100 pl-9 dark:bg-zinc-900"
              />
            </div>
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {filteredRelated.map((topic) => (
                <button
                  type="button"
                  key={topic._id}
                  onClick={() => toggleRelated(topic._id)}
                  className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <span>{topic.title}</span>
                  {form.relatedTopics.includes(topic._id) && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
              {form.course && filteredRelated.length === 0 && (
                <p className="py-4 text-center text-xs text-zinc-400">
                  No matching topics.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
      <ConfirmDialog
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        onConfirm={publish}
        loading={saving}
        title="Publish topic?"
        description="The topic will become publicly available and may be indexed by search engines."
        confirmText="Publish"
      />
    </main>
  );
}
