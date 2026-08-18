"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  Clock,
  ExternalLink,
  Globe2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import Editor from "@/components/editor/Editor";
import AdminFormShell, {
  AdminFormLoading,
  formAsideClass,
  formSectionClass,
} from "@/components/forms/AdminFormShell";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { pagesApi } from "@/lib/api";

export default function LegalPageEditor() {
  const params = useParams();
  const slug = String(params.slug || "");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    status: "published",
    seoTitle: "",
    seoDescription: "",
    keywords: "",
    canonicalUrl: "",
  });

  useEffect(() => {
    let active = true;
    const fetchPage = async () => {
      setLoading(true);
      try {
        const response = await pagesApi.get(slug);
        if (!active) return;
        const data = response?.data?.data || response?.data || response;
        if (response?.success && data) {
          setForm({
            title: data.title || "",
            summary: data.summary || "",
            content: data.content || "",
            status: data.status || "published",
            seoTitle: data.seoTitle || "",
            seoDescription: data.seoDescription || "",
            keywords: Array.isArray(data.keywords)
              ? data.keywords.join(", ")
              : data.keywords || "",
            canonicalUrl:
              data.canonicalUrl ||
              (slug === "faq"
                ? `https://asif.to/faq`
                : `https://asif.to/legal/${slug}`),
          });
          setLastUpdated(data.lastUpdated || data.updatedAt || null);
        } else {
          // Initialize with friendly defaults
          const defaultTitle = slug === "faq" ? "Help & FAQ" : slug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          setForm({
            title: defaultTitle,
            summary: "",
            content: "<p>Write page content here...</p>",
            status: "published",
            seoTitle: `${defaultTitle} | asif.to`,
            seoDescription: slug === "faq"
              ? "Frequently asked questions and support for asif.to."
              : `Official ${defaultTitle.toLowerCase()} document and policies for asif.to.`,
            keywords: slug === "faq"
              ? "asif.to, faq, help, support, questions"
              : `asif.to, ${slug.replace(/-/g, ", ")}, policy, legal`,
            canonicalUrl: slug === "faq"
              ? "https://asif.to/faq"
              : `https://asif.to/legal/${slug}`,
          });
        }
      } catch (error) {
        console.error("Failed to load page:", error);
        toast.error("Failed to load legal page");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPage();
    return () => {
      active = false;
    };
  }, [slug]);

  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSave = async (statusOverride) => {
    if (!form.title.trim()) {
      return toast.error("Title is required");
    }
    if (!form.content.replace(/<[^>]*>/g, "").trim()) {
      return toast.error("Page content is required");
    }

    setSaving(true);
    const targetStatus = statusOverride || form.status;

    try {
      const response = await pagesApi.update(slug, {
        title: form.title,
        summary: form.summary,
        content: form.content,
        status: targetStatus,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        keywords: form.keywords,
        canonicalUrl: form.canonicalUrl,
      });

      if (response?.success) {
        toast.success("Legal page updated successfully");
        setForm((prev) => ({ ...prev, status: targetStatus }));
        setLastUpdated(new Date().toISOString());
      } else {
        toast.error(response?.error || "Failed to update page");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error saving page");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminFormLoading />;

  const pageDisplayName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <AdminFormShell
      eyebrow="Site / Legal & Help"
      title={`Edit ${pageDisplayName}`}
      description="Manage policy content, publishing status, and complete SEO & OpenGraph meta tags."
      back={
        <Link
          href="/legal"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to legal pages</span>
        </Link>
      }
      actions={
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant={isPreview ? "default" : "outline"}
            onClick={() => setIsPreview(!isPreview)}
            className="flex-1 sm:flex-initial"
          >
            <Eye className="h-4 w-4 mr-1.5" />
            <span>{isPreview ? "Edit Mode" : "Preview"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => handleSave("draft")}
            className="flex-1 sm:flex-initial"
          >
            <Save className="h-4 w-4 mr-1.5" />
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            disabled={saving}
            onClick={() => handleSave("published")}
            className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25"
          >
            <ShieldCheck className="h-4 w-4 mr-1.5" />
            <span>{saving ? "Saving..." : "Publish"}</span>
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main Content Column */}
        <section className="space-y-6 min-w-0">
          {isPreview ? (
            <div className={formSectionClass}>
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                    Live Document Preview
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black font-outfit text-zinc-950 dark:text-white mt-1">
                    {form.title}
                  </h1>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreview(false)}
                >
                  Return to editor
                </Button>
              </div>

              {form.summary && (
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 italic bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60">
                  {form.summary}
                </p>
              )}

              <div
                className="prose prose-zinc dark:prose-invert max-w-none pt-2 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: form.content }}
              />
            </div>
          ) : (
            <>
              {/* Primary Content Editor Box */}
              <div className={formSectionClass}>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Page Title
                  </Label>
                  <Input
                    value={form.title}
                    onChange={(event) => update("title", event.target.value)}
                    placeholder="e.g. Terms & Conditions, Privacy Policy"
                    maxLength={180}
                    className="rounded-2xl border-0 bg-zinc-100 shadow-none dark:bg-zinc-900 font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Summary / Introduction (Optional)
                  </Label>
                  <Textarea
                    value={form.summary}
                    onChange={(event) => update("summary", event.target.value)}
                    placeholder="Brief intro overview for this legal page..."
                    rows={2}
                    maxLength={300}
                    className="rounded-2xl border-0 bg-zinc-100 shadow-none dark:bg-zinc-900"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Page Content
                    </Label>
                    <span className="text-[11px] text-zinc-400">
                      Supports Markdown & Rich Text
                    </span>
                  </div>
                  <Editor
                    value={form.content}
                    onChange={(value) => update("content", value || "")}
                    placeholder="Write the full policy or terms content here..."
                  />
                </div>
              </div>
            </>
          )}
        </section>

        {/* Sidebar Controls */}
        <aside className="space-y-6 min-w-0">
          {/* Publishing Status Card */}
          <div className={formAsideClass}>
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h2 className="font-bold text-sm text-zinc-900 dark:text-white">
                Publishing
              </h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                  form.status === "published"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200/80 dark:border-amber-500/30"
                }`}
              >
                {form.status}
              </span>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Status
              </Label>
              <select
                value={form.status}
                onChange={(event) => update("status", event.target.value)}
                className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 text-sm font-semibold outline-none dark:bg-zinc-900 cursor-pointer"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {lastUpdated && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Updated {new Date(lastUpdated).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <a
                href={slug === "faq" ? `https://asif.to/faq` : `https://asif.to/legal/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>View live legal page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Search & Meta Tags SEO Card */}
          <div className={formAsideClass}>
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-blue-500" />
                <h2 className="font-bold text-sm text-zinc-900 dark:text-white">
                  SEO & Meta Tags
                </h2>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  SEO Meta Title
                </Label>
                <span className="text-[10px] text-zinc-400">
                  {form.seoTitle.length}/70
                </span>
              </div>
              <Input
                value={form.seoTitle}
                onChange={(event) => update("seoTitle", event.target.value)}
                placeholder="e.g. Terms of Service | asif.to"
                maxLength={70}
                className="rounded-2xl border-0 bg-zinc-100 shadow-none dark:bg-zinc-900 text-xs font-medium"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  SEO Meta Description
                </Label>
                <span className="text-[10px] text-zinc-400">
                  {form.seoDescription.length}/170
                </span>
              </div>
              <Textarea
                value={form.seoDescription}
                onChange={(event) =>
                  update("seoDescription", event.target.value)
                }
                placeholder="Meta description shown in search engine results..."
                rows={3}
                maxLength={170}
                className="rounded-2xl border-0 bg-zinc-100 shadow-none dark:bg-zinc-900 text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Meta Keywords
              </Label>
              <Input
                value={form.keywords}
                onChange={(event) => update("keywords", event.target.value)}
                placeholder="legal, privacy, terms, asif.to"
                className="rounded-2xl border-0 bg-zinc-100 shadow-none dark:bg-zinc-900 text-xs font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Canonical URL
              </Label>
              <Input
                value={form.canonicalUrl}
                onChange={(event) => update("canonicalUrl", event.target.value)}
                placeholder="https://asif.to/legal/terms-conditions"
                className="rounded-2xl border-0 bg-zinc-100 shadow-none dark:bg-zinc-900 text-xs font-medium"
              />
            </div>
          </div>
        </aside>
      </div>
    </AdminFormShell>
  );
}
