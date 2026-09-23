"use client";
import useSubscriberNotification from "@/components/communications/useSubscriberNotification";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ImagePlus,
  RefreshCw,
  Save,
  Send,
  UserPen,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { getModuleBackUrl } from "@/hooks/useModuleHistory";
import Editor from "@/components/editor/Editor";
import AdminFormShell, {
  AdminFormLoading,
  formAsideClass,
  formSectionClass,
} from "@/components/forms/AdminFormShell";
import DiscussButton from "@/components/messaging/DiscussButton";
import { CanonicalUrlInput } from "@/components/admin";
import { articlesApi, articleTopicsApi, coursesApi, chaptersApi, usersApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { getImageUrl } from "@/lib/utils";
import { getAssetUrl } from "@/lib/assets";
import AssetPicker from "@/components/assets/AssetPicker";
import { Button, Input, Label, Textarea } from "@/components/ui";
import LogoLoader from "@/components/ui/LogoLoader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ArticleForm({ articleId = null }) {
  const subscriberNotification = useSubscriberNotification("article");
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedReturnTo = searchParams.get("returnTo");
  const returnTo = getModuleBackUrl("/articles", requestedReturnTo);
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(Boolean(articleId));
  const [saving, setSaving] = useState(false);
  const [topics, setTopics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [chaptersByCourse, setChaptersByCourse] = useState({});
  const [adminUsers, setAdminUsers] = useState([]);
  const [overrideAuthorId, setOverrideAuthorId] = useState("");
  const { user: currentAdminUser } = useAuth();
  const isSuperAdmin = currentAdminUser?.role?.toLowerCase() === "super_admin";
  const [form, setForm] = useState({
    title: "",
    content: "",
    topics: [],
    image: "",
    imageAsset: "",
    status: "draft",
    seoTitle: "",
    seoDescription: "",
    keywords: "",
    canonicalUrl: "",
    relatedCourses: [],
    relatedChapters: [],
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedImageAsset, setSelectedImageAsset] = useState(null);

  useEffect(() => {
    let active = true;
    const queries = [
      articleTopicsApi.list(),
      coursesApi.listAll(),
      articleId ? articlesApi.get(articleId) : Promise.resolve(null),
    ];
    if (isSuperAdmin) {
      queries.push(usersApi.list({ limit: 100 }));
    }
    Promise.all(queries).then(
      ([topicResponse, courseResponse, articleResponse, usersResponse]) => {
        if (!active) return;
        const topicData =
          topicResponse?.data?.data ?? topicResponse?.data ?? [];
        setTopics(Array.isArray(topicData) ? topicData : []);
        setCourses(courseResponse?.data?.data || []);
        if (usersResponse?.success) {
          const usersData =
            usersResponse?.data?.data?.users ||
            usersResponse?.data?.users ||
            usersResponse?.data?.data ||
            (Array.isArray(usersResponse?.data) ? usersResponse.data : []);
          const ALLOWED_ROLES = [
            "author",
            "admin",
            "super_admin",
            "superadmin",
          ];
          const staffUsers = (Array.isArray(usersData) ? usersData : []).filter(
            (u) => ALLOWED_ROLES.includes((u.role || "").toLowerCase()),
          );
          setAdminUsers(staffUsers);
        }
        if (articleResponse?.success) {
          const article = articleResponse.data?.data || articleResponse.data;
          setForm({
            title: article.title || "",
            content: article.content || "",
            topics: (article.topic || []).map((item) => item._id || item),
            image: article.image || "",
            imageAsset: article.imageAsset?._id || article.imageAsset || "",
            status: article.status || "draft",
            seoTitle: article.seoTitle || "",
            seoDescription: article.seoDescription || "",
            keywords: (article.keywords || []).join(", "),
            canonicalUrl: article.canonicalUrl || "",
            relatedCourses: (article.relatedCourses || []).map((c) =>
              typeof c === "object" ? c._id : c,
            ),
            relatedChapters: (article.relatedChapters || []).map((c) =>
              typeof c === "object" ? c._id : c,
            ),
          });
          // Pre-select the article's current author
          const currentAuthorId = article.author?._id || article.author || "";
          setOverrideAuthorId(String(currentAuthorId));
          setImagePreview(getImageUrl(article.image));
          if (article.imageAsset)
            setSelectedImageAsset({
              _id: article.imageAsset?._id || article.imageAsset,
            });
        } else if (articleId)
          toast.error(articleResponse?.error || "Unable to load article");
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [articleId, isSuperAdmin]);

  useEffect(() => {
    (form.relatedCourses || []).forEach((courseId) => {
      if (!chaptersByCourse[courseId]) {
        chaptersApi.list(courseId).then((res) => {
          if (res.success) {
            setChaptersByCourse((prev) => ({
              ...prev,
              [courseId]: res.data?.data || res.data || [],
            }));
          }
        });
      }
    });
  }, [form.relatedCourses]);

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
    setSelectedImageAsset(null);
    update("imageAsset", "");
    setImagePreview(URL.createObjectURL(file));
  };

  const persist = async (status) => {
    if (!subscriberNotification.validate(status || form.status)) return;
    if (!form.title.trim() || !form.content.replace(/<[^>]*>/g, "").trim())
      return toast.error("Title and content are required");
    if (!form.topics.length) return toast.error("Select at least one topic");
    if (!articleId && !imageFile && !form.imageAsset)
      return toast.error("Hero image is required for a new article");
    setSaving(true);
    const data = new FormData();
    data.append("title", form.title);
    data.append("content", form.content);
    data.append("status", status || form.status || "draft");
    data.append("seoTitle", form.seoTitle);
    data.append("seoDescription", form.seoDescription);
    data.append("keywords", form.keywords);
    data.append("canonicalUrl", form.canonicalUrl);
    form.topics.forEach((topic) => data.append("topic", topic));
    (form.relatedCourses || []).forEach((c) =>
      data.append("relatedCourses", c),
    );
    (form.relatedChapters || []).forEach((c) =>
      data.append("relatedChapters", c),
    );
    if (imageFile) data.append("image", imageFile);
    if (form.imageAsset) data.append("imageAsset", form.imageAsset);
    // Super-admin author override
    if (isSuperAdmin && overrideAuthorId)
      data.append("authorId", overrideAuthorId);
    const response = articleId
      ? await articlesApi.update(articleId, data)
      : await articlesApi.create(data);
    if (response.success) {
      toast.success(articleId ? "Article updated" : "Article created");
      const emailFollowUp = await subscriberNotification.notify(
        response.data?.data?._id || articleId,
        status || form.status,
      );
      router.push(emailFollowUp || returnTo);
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
          href={returnTo}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to articles
        </Link>
      }
      actions={
        <>
          {articleId && (
            <DiscussButton entityType="article" entityId={articleId} />
          )}
          <Button
            variant="outline"
            disabled={saving}
            onClick={() => persist("draft")}
            className="shrink-0"
          >
            <Save className="mr-2 h-4 w-4" /> Save Draft
          </Button>
          {articleId && (
            <Button
              disabled={saving}
              onClick={() => persist(form.status)}
              className="shrink-0"
            >
              {saving ? (
                <LogoLoader className="mr-2 h-4 w-4" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}{" "}
              Update
            </Button>
          )}
          <Button
            variant={articleId ? "outline" : "default"}
            disabled={saving}
            onClick={() => persist("published")}
            className="shrink-0"
          >
            <Send className="mr-2 h-4 w-4" /> Publish
          </Button>
        </>
      }
    >
      <div className="grid gap-1 lg:grid-cols-[minmax(0,1fr)_320px] min-w-0 w-full">
        <section className="space-y-1 min-w-0 w-full">
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

          {/* Related Courses Picker */}
          <div className={formSectionClass}>
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              Related Courses & Cross-Promotion
            </h2>
            <p className="text-xs text-muted-foreground">
              Select courses related to this article to display recommendations
              on the public page.
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1 rounded-2xl border border-zinc-200/60 bg-zinc-50 p-3 dark:border-zinc-800/60 dark:bg-zinc-900/50">
              {courses.map((c) => {
                const isSelected = (form.relatedCourses || []).includes(c._id);
                const courseChapters = chaptersByCourse[c._id] || [];
                return (
                  <div key={c._id}>
                    <label className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-xs font-bold text-zinc-800 hover:bg-zinc-200/60 dark:text-zinc-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
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
                        className="h-4 w-4 rounded border-zinc-300 text-blue-500 focus:ring-blue-400"
                      />
                      <span>{c.title}</span>
                    </label>
                    {isSelected && courseChapters.length > 0 && (
                      <div className="ml-6 mt-1 flex flex-col gap-1 border-l-2 border-zinc-200 dark:border-zinc-800 pl-2">
                        {courseChapters.map((chapter) => {
                          const isChapterSelected = (form.relatedChapters || []).includes(chapter._id);
                          return (
                            <label key={chapter._id} className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChapterSelected}
                                onChange={(e) => {
                                  const next = e.target.checked
                                    ? [...(form.relatedChapters || []), chapter._id]
                                    : (form.relatedChapters || []).filter((id) => id !== chapter._id);
                                  update("relatedChapters", next);
                                }}
                                className="h-3 w-3 rounded border-zinc-300 text-orange-500 focus:ring-orange-400"
                              />
                              <span className="truncate">{chapter.title}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        <aside className="space-y-1 min-w-0">
          {subscriberNotification.controls}
          <div className={formAsideClass}>
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              Publishing
            </h2>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => update("status", value)}
              >
                <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 text-sm dark:bg-zinc-900">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
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
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 px-4 py-3.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <ImagePlus className="h-4 w-4" /> Choose image
                </button>
                <AssetPicker
                  value={selectedImageAsset}
                  accept="image/*"
                  label="Select from library"
                  className="flex-1"
                  buttonClassName="flex w-full h-full items-center justify-center gap-2 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 px-4 py-3.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onChange={(asset) => {
                    setSelectedImageAsset(asset);
                    setImageFile(null);
                    update("imageAsset", asset._id);
                    setImagePreview(getAssetUrl(asset, { preview: true }));
                  }}
                />
              </div>
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
                      setSelectedImageAsset(null);
                      update("imageAsset", "");
                    }}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Super-admin author override */}
          {isSuperAdmin && (
            <div
              className={`${formAsideClass} border-2 border-dashed border-amber-300 dark:border-amber-700/50 bg-amber-50/40 dark:bg-amber-900/10`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <UserPen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="font-bold text-xs text-zinc-900 dark:text-white">
                    Author Override
                  </h2>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                    Super Admin only
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Assign Author</Label>
                <Select
                  value={overrideAuthorId}
                  onValueChange={setOverrideAuthorId}
                >
                  <SelectTrigger className="h-10 w-full rounded-xl border-0 bg-white dark:bg-zinc-900 px-3 text-xs shadow-sm">
                    <SelectValue placeholder="Select author..." />
                  </SelectTrigger>
                  <SelectContent>
                    {adminUsers.map((u) => (
                      <SelectItem key={u._id} value={u._id}>
                        <div className="flex flex-col py-0.5 min-w-0">
                          <span className="font-medium text-xs leading-tight truncate">
                            {u.fullName || u.name || u.username}
                          </span>
                          {u.email && (
                            <span className="text-[10px] text-zinc-400 font-normal leading-tight truncate">
                              {u.email}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {adminUsers.length === 0 && (
                  <p className="text-[10px] text-zinc-400 italic">
                    Loading users...
                  </p>
                )}
              </div>
            </div>
          )}
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
            <CanonicalUrlInput
              basePrefix={
                form.type === "cheatsheet"
                  ? "https://asif.to/cheatsheets"
                  : "https://asif.to/articles"
              }
              value={form.canonicalUrl}
              onChange={(value) => update("canonicalUrl", value)}
              placeholder={
                form.slug ||
                (form.title
                  ? form.title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "")
                  : "")
              }
            />
          </div>
        </aside>
      </div>
    </AdminFormShell>
  );
}
