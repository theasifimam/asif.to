"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Save, Send, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Editor from "@/components/Editor";
import AdminFormShell, {
  AdminFormLoading,
  formAsideClass,
  formSectionClass,
} from "@/components/AdminFormShell";
import { articlesApi, articleTopicsApi } from "@/lib/api";
import { Button, Input, Label, Textarea } from "@/components/ui";

export default function ArticleForm({ articleId = null }) {
  const router = useRouter();
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(Boolean(articleId));
  const [saving, setSaving] = useState(false);
  const [topics, setTopics] = useState([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    topics: [],
    image: "",
    status: "draft",
    seoTitle: "",
    seoDescription: "",
    keywords: "",
    canonicalUrl: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      articleTopicsApi.list(),
      articleId ? articlesApi.get(articleId) : Promise.resolve(null),
    ]).then(([topicResponse, articleResponse]) => {
      if (!active) return;
      const topicData = topicResponse?.data?.data ?? topicResponse?.data ?? [];
      setTopics(Array.isArray(topicData) ? topicData : []);
      if (articleResponse?.success) {
        const article = articleResponse.data?.data || articleResponse.data;
        setForm({
          title: article.title || "",
          content: article.content || "",
          topics: (article.topic || []).map((item) => item._id || item),
          image: article.image || "",
          status: article.status || "draft",
          seoTitle: article.seoTitle || "",
          seoDescription: article.seoDescription || "",
          keywords: (article.keywords || []).join(", "),
          canonicalUrl: article.canonicalUrl || "",
        });
        setImagePreview(
          article.image?.startsWith("http")
            ? article.image
            : article.image
              ? `http://localhost:5000${article.image}`
              : "",
        );
      } else if (articleId)
        toast.error(articleResponse?.error || "Unable to load article");
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [articleId]);

  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const toggleTopic = (id) =>
    update(
      "topics",
      form.topics.includes(id)
        ? form.topics.filter((item) => item !== id)
        : [...form.topics, id],
    );
  const chooseImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const persist = async (status) => {
    if (!form.title.trim() || !form.content.replace(/<[^>]*>/g, "").trim())
      return toast.error("Title and content are required");
    if (!form.topics.length) return toast.error("Select at least one topic");
    if (!articleId && !imageFile)
      return toast.error("Hero image is required for a new article");
    setSaving(true);
    const data = new FormData();
    data.append("title", form.title);
    data.append("content", form.content);
    data.append("status", status);
    data.append("seoTitle", form.seoTitle);
    data.append("seoDescription", form.seoDescription);
    data.append("keywords", form.keywords);
    data.append("canonicalUrl", form.canonicalUrl);
    form.topics.forEach((topic) => data.append("topic", topic));
    if (imageFile) data.append("image", imageFile);
    const response = articleId
      ? await articlesApi.update(articleId, data)
      : await articlesApi.create(data);
    if (response.success) {
      toast.success(articleId ? "Article updated" : "Article created");
      router.push("/articles");
    } else toast.error(response.error || "Unable to save article");
    setSaving(false);
  };

  if (loading) return <AdminFormLoading />;
  return (
    <AdminFormShell
      eyebrow="Content / Articles"
      title={articleId ? "Edit article" : "Create article"}
      description="Create a structured article with topics, publishing status, media, and complete SEO metadata."
      back={
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to articles
        </Link>
      }
      actions={
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            disabled={saving}
            onClick={() => persist("draft")}
            className="flex-2"
          >
            <Save className="h-4 w-4" /> Save draft
          </Button>
          <Button
            disabled={saving}
            onClick={() => persist("published")}
            className="flex-1"
          >
            <Send className="h-4 w-4" /> Publish
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-6">
          <div className={formSectionClass}>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="Write a clear article title"
                maxLength={180}
                className="rounded-2xl border-0 bg-zinc-100 shadow-none dark:bg-zinc-900"
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Editor
                value={form.content}
                onChange={(value) => update("content", value || "")}
                placeholder="Write the article in Markdown or rich text..."
              />
            </div>
          </div>
          <div className={formSectionClass}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-zinc-900 dark:text-white">
                  Topics
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Select one or more topics for discovery.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600">
                {form.topics.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <button
                  type="button"
                  key={topic._id}
                  onClick={() => toggleTopic(topic._id)}
                  className={`rounded-full border px-3 py-2 text-xs font-bold transition-colors ${form.topics.includes(topic._id) ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900"}`}
                >
                  {topic.name}
                </button>
              ))}
            </div>
          </div>
        </section>
        <aside className="space-y-6">
          <div className={formAsideClass}>
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              Publishing
            </h2>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={(event) => update("status", event.target.value)}
                className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 text-sm outline-none dark:bg-zinc-900"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>
                Hero image {articleId ? "(optional replacement)" : "*"}
              </Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={chooseImage}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 px-4 py-4 text-xs font-bold text-zinc-500 hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700"
              >
                <ImagePlus className="h-4 w-4" /> Choose image
              </button>
              {imagePreview && (
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={imagePreview}
                    alt="Article preview"
                    className="h-32 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("");
                      setImageFile(null);
                    }}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className={formAsideClass}>
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              Search metadata
            </h2>
            <div className="space-y-2">
              <Label>SEO title</Label>
              <Input
                value={form.seoTitle}
                onChange={(event) => update("seoTitle", event.target.value)}
                maxLength={70}
                className="rounded-2xl border-0 bg-zinc-100 shadow-none dark:bg-zinc-900"
              />
            </div>
            <div className="space-y-2">
              <Label>SEO description</Label>
              <Textarea
                value={form.seoDescription}
                onChange={(event) =>
                  update("seoDescription", event.target.value)
                }
                rows={3}
                maxLength={170}
                className="rounded-2xl border-0 bg-zinc-100 shadow-none dark:bg-zinc-900"
              />
            </div>
            <div className="space-y-2">
              <Label>Keywords</Label>
              <Input
                value={form.keywords}
                onChange={(event) => update("keywords", event.target.value)}
                placeholder="react, hooks, state"
                className="rounded-2xl border-0 bg-zinc-100 shadow-none dark:bg-zinc-900"
              />
            </div>
            <div className="space-y-2">
              <Label>Canonical URL</Label>
              <Input
                value={form.canonicalUrl}
                onChange={(event) => update("canonicalUrl", event.target.value)}
                placeholder="https://asif.to/articles/example"
                className="rounded-2xl border-0 bg-zinc-100 shadow-none dark:bg-zinc-900"
              />
            </div>
          </div>
        </aside>
      </div>
    </AdminFormShell>
  );
}
