"use client";

import { useEffect, useRef, useState } from "react";
import {
  Redo2,
  Save,
  Undo2,
  Type,
  Layout,
  Settings,
  MessageSquareText,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Eye,
} from "lucide-react";
import { socialPostsApi } from "@/lib/api";
import useSocialPost, { EMPTY_POST } from "./hooks/useSocialPost";
import SlideEditor from "./SlideEditor";
import SlideNavigator from "./SlideNavigator";
import LivePreview from "./LivePreview";
import PostSettingsPanel from "./PostSettingsPanel";
import TemplateSelector from "./TemplateSelector";
import ExportControls from "./export/ExportControls";
import PublishPanel from "./PublishPanel";
import TemplateRenderer from "./templates/TemplateRenderer";
import { getFormat } from "./formats";
import { Button } from "../ui";

export default function SocialPostStudio({
  initialPost = EMPTY_POST,
  postId = null,
  onCreated,
}) {
  const editor = useSocialPost(initialPost);
  const [activeId, setActiveId] = useState(initialPost.slides?.[0]?.id);
  const [activeTab, setActiveTab] = useState("content"); // 'content' | 'templates' | 'settings' | 'caption'
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const previewRef = useRef(null);
  const exportRefs = useRef([]);

  const activeIndex = Math.max(
    0,
    editor.post.slides.findIndex((slide) => slide.id === activeId),
  );

  const activeSlide = editor.post.slides[activeIndex] || editor.post.slides[0];

  useEffect(() => {
    if (!editor.post.slides.some((slide) => slide.id === activeId)) {
      setActiveId(editor.post.slides[0]?.id);
    }
  }, [editor.post.slides, activeId]);

  const save = async () => {
    setSaving(true);

    try {
      const result = postId
        ? await socialPostsApi.update(postId, editor.post)
        : await socialPostsApi.create(editor.post);

      if (!result?.success) {
        throw new Error(result?.error || result?.message || "Save failed.");
      }

      setSavedAt(new Date());

      if (!postId) {
        const id = result.data?._id || result.data?.data?._id;
        if (id) onCreated?.(id);
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!postId) return;

    const timer = setTimeout(() => {
      socialPostsApi.update(postId, editor.post).then((result) => {
        if (result?.success) {
          setSavedAt(new Date());
        }
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [editor.post, postId]);

  const format = getFormat(editor.post.format);

  const prevSlide = () => {
    if (activeIndex > 0) {
      setActiveId(editor.post.slides[activeIndex - 1].id);
    }
  };

  const nextSlide = () => {
    if (activeIndex < editor.post.slides.length - 1) {
      setActiveId(editor.post.slides[activeIndex + 1].id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Action Header Bar */}
      <div className="admin-surface flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
        <div>
          <div className="font-bold text-base sm:text-lg flex items-center gap-2">
            <span>{editor.post.name || "Untitled Social Post"}</span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {editor.post.platform} · {format.label}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground font-medium">
            {savedAt
              ? `Saved at ${savedAt.toLocaleTimeString()}`
              : `${editor.post.slides.length} slide${
                  editor.post.slides.length === 1 ? "" : "s"
                } · Draft`}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex rounded-xl border border-zinc-200 p-1 dark:border-zinc-800 bg-background">
            <button
              type="button"
              onClick={editor.undo}
              disabled={!editor.canUndo}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted disabled:opacity-30 cursor-pointer"
              title="Undo"
            >
              <Undo2 size={15} />
            </button>

            <button
              type="button"
              onClick={editor.redo}
              disabled={!editor.canRedo}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted disabled:opacity-30 cursor-pointer"
              title="Redo"
            >
              <Redo2 size={15} />
            </button>
          </div>

          <ExportControls
            name={editor.post.name}
            activeIndex={activeIndex}
            previewRef={previewRef}
            exportRefs={exportRefs}
          />

          <Button
            variant="default"
            onClick={save}
            disabled={saving}
            className="rounded-xl font-bold"
          >
            <Save size={15} />
            {saving ? "Saving..." : postId ? "Save changes" : "Save post"}
          </Button>
        </div>
      </div>

      <PublishPanel
        postId={postId}
        post={editor.post}
        exportRefs={exportRefs}
      />

      {/* Slide Navigator */}
      <div className="admin-surface p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
        <div className="mb-2 px-1 flex items-center justify-between text-xs">
          <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Slide Sequence ({editor.post.slides.length} Slides)
          </span>
          <span className="text-muted-foreground font-medium">
            Click slide to select &amp; edit · Drag or use arrows to reorder
          </span>
        </div>

        <SlideNavigator
          slides={editor.post.slides}
          activeId={activeSlide?.id}
          onSelect={setActiveId}
          onAdd={() => editor.addSlide("developer-tip", activeSlide?.id)}
          onDuplicate={editor.duplicateSlide}
          onDelete={editor.deleteSlide}
          onMove={editor.reorderSlides}
        />
      </div>

      {/* Main Workspace Layout: Controls in Larger Left Window, Preview in Smaller Sticky Right Sidebar */}
      <div className="flex flex-col xl:flex-row items-start gap-6">
        {/* Left Column: Larger Primary Workspace for Controls */}
        <div className="w-full xl:flex-1 min-w-0 space-y-4">
          <div className="admin-surface rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 space-y-6">
            {/* Control Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("content")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === "content"
                    ? "bg-white dark:bg-zinc-800 text-primary shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <Type size={15} />
                <span>1. Slide Content</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("templates")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === "templates"
                    ? "bg-white dark:bg-zinc-800 text-primary shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <Layout size={15} />
                <span>2. Slide Layout</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === "settings"
                    ? "bg-white dark:bg-zinc-800 text-primary shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <Settings size={15} />
                <span>3. Theme &amp; Format</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("caption")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === "caption"
                    ? "bg-white dark:bg-zinc-800 text-primary shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <MessageSquareText size={15} />
                <span>4. Caption &amp; Tags</span>
              </button>
            </div>

            {/* Tab 1: Slide Content */}
            {activeTab === "content" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Slide {activeIndex + 1} Content
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Edit text, code snippet, bullet points, and CTAs for the
                      selected slide.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("templates")}
                    className="rounded-xl text-xs font-semibold"
                  >
                    Change Layout
                  </Button>
                </div>

                {activeSlide && (
                  <SlideEditor
                    slide={activeSlide}
                    onChange={(patch) =>
                      editor.updateSlide(activeSlide.id, patch)
                    }
                  />
                )}
              </div>
            )}

            {/* Tab 2: Slide Layout & Templates */}
            {activeTab === "templates" && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
                  <h3 className="text-base font-bold text-foreground">
                    Slide Layout Template
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Choose how Slide {activeIndex + 1} should present
                    information.
                  </p>
                </div>

                <TemplateSelector
                  value={activeSlide?.template}
                  onChange={(template) =>
                    editor.updateSlide(activeSlide.id, { template })
                  }
                />
              </div>
            )}

            {/* Tab 3: Post & Theme Settings */}
            {activeTab === "settings" && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
                  <h3 className="text-base font-bold text-foreground">
                    Post Theme &amp; Format Settings
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Set target platform, aspect ratio, accent colors, branding
                    elements, and preset styles.
                  </p>
                </div>

                <PostSettingsPanel
                  post={editor.post}
                  onPostChange={editor.updatePost}
                  onSettingsChange={editor.updateSettings}
                  onApplyPreset={(presetId) => {
                    editor.applyPreset(presetId);
                    setTimeout(() => setActiveId(editor.post.slides[0]?.id), 0);
                  }}
                />
              </div>
            )}

            {/* Tab 4: Caption & Hashtags */}
            {activeTab === "caption" && (
              <div className="space-y-5">
                <div className="pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
                  <h3 className="text-base font-bold text-foreground">
                    Social Media Caption &amp; Hashtags
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Write your post caption and relevant hashtags for Instagram,
                    LinkedIn, or Twitter.
                  </p>
                </div>

                <label className="block space-y-2">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Post Caption Text
                  </span>
                  <textarea
                    className="w-full rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-background p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/25 min-h-48 resize-y leading-relaxed"
                    placeholder="Write a compelling caption to publish alongside this carousel..."
                    value={editor.post.caption || ""}
                    onChange={(e) =>
                      editor.updatePost({ caption: e.target.value })
                    }
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Hashtags (Space or comma separated)
                  </span>
                  <input
                    className="w-full rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-background px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/25"
                    placeholder="#ReactJS #NextJS #WebDevelopment #JavaScript"
                    value={(editor.post.hashtags || []).join(" ")}
                    onChange={(e) =>
                      editor.updatePost({
                        hashtags: e.target.value
                          .split(/[\s,]+/)
                          .filter(Boolean),
                      })
                    }
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Smaller Sticky Preview Window */}
        <aside className="w-full xl:w-105 2xl:w-115 shrink-0 space-y-4 xl:sticky xl:top-4 self-start">
          <div className="admin-surface overflow-hidden p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-foreground">
                  Live Preview
                </span>
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                Slide {activeIndex + 1} of {editor.post.slides.length}
              </span>
            </div>

            <div className="bg-muted/10 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-2">
              <LivePreview
                post={editor.post}
                activeSlide={activeSlide}
                activeIndex={activeIndex}
                previewRef={previewRef}
              />
            </div>

            {/* Quick Slide Navigation Bar */}
            <div className="flex items-center justify-between pt-1 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevSlide}
                disabled={activeIndex === 0}
                className="rounded-xl text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>

              <div className="flex items-center gap-1">
                {editor.post.slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveId(slide.id)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === activeIndex
                        ? "w-6 bg-primary"
                        : "w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400"
                    }`}
                    title={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextSlide}
                disabled={activeIndex === editor.post.slides.length - 1}
                className="rounded-xl text-xs font-bold"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Hidden Export DOM Container */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: -99999,
          top: 0,
          pointerEvents: "none",
        }}
      >
        {editor.post.slides.map((slide, index) => (
          <div
            key={slide.id}
            ref={(node) => {
              exportRefs.current[index] = node;
            }}
            style={{
              width: format.width,
              height: format.height,
            }}
          >
            <TemplateRenderer
              slide={slide}
              format={editor.post.format}
              settings={{
                ...editor.post.settings,
                _category: typeof editor.post.category === 'object' && editor.post.category ? editor.post.category.name : editor.post.category,
              }}
              slideIndex={index}
              totalSlides={editor.post.slides.length}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
