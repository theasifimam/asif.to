"use client";

import { useEffect, useRef, useState } from "react";
import { Redo2, Save, Undo2 } from "lucide-react";
import { socialPostsApi } from "@/lib/api";
import useSocialPost, { EMPTY_POST } from "./hooks/useSocialPost";
import SlideEditor from "./SlideEditor";
import SlideNavigator from "./SlideNavigator";
import LivePreview from "./LivePreview";
import PostSettingsPanel from "./PostSettingsPanel";
import TemplateSelector from "./TemplateSelector";
import ExportControls from "./export/ExportControls";
import TemplateRenderer from "./templates/TemplateRenderer";
import { getFormat } from "./formats";
import { Button } from "../ui";

function SectionTitle({ number, title, description }) {
  return (
    <div className="mb-3 flex items-start gap-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {number}
      </span>

      <div>
        <div className="text-sm font-semibold">{title}</div>
        {description && (
          <div className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SocialPostStudio({
  initialPost = EMPTY_POST,
  postId = null,
  onCreated,
}) {
  const editor = useSocialPost(initialPost);
  const [activeId, setActiveId] = useState(initialPost.slides?.[0]?.id);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const previewRef = useRef(null);
  const exportRefs = useRef([]);

  const activeIndex = Math.max(
    0,
    editor.post.slides.findIndex((slide) => slide.id === activeId),
  );

  const activeSlide =
    editor.post.slides[activeIndex] || editor.post.slides[0];

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
        throw new Error(
          result?.error || result?.message || "Save failed.",
        );
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

  return (
    <div className="space-y-4">
      <div className="admin-surface flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <div className="font-bold">Post Editor</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {savedAt
              ? `Saved at ${savedAt.toLocaleTimeString()}`
              : `${editor.post.slides.length} slide${
                  editor.post.slides.length === 1 ? "" : "s"
                } · Draft`}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-zinc-200 p-1 dark:border-zinc-800">
            <button
              type="button"
              onClick={editor.undo}
              disabled={!editor.canUndo}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted disabled:opacity-30"
              title="Undo"
            >
              <Undo2 size={15} />
            </button>

            <button
              type="button"
              onClick={editor.redo}
              disabled={!editor.canRedo}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted disabled:opacity-30"
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

          <Button variant="default" onClick={save} disabled={saving}>
            <Save size={15} />
            {saving
              ? "Saving..."
              : postId
                ? "Save changes"
                : "Save post"}
          </Button>
        </div>
      </div>

      <div className="admin-surface p-3">
        <div className="mb-2 px-1 text-xs font-semibold text-muted-foreground">
          Slides · select a slide to edit
        </div>

        <SlideNavigator
          slides={editor.post.slides}
          activeId={activeSlide?.id}
          onSelect={setActiveId}
          onAdd={() =>
            editor.addSlide("developer-tip", activeSlide?.id)
          }
          onDuplicate={editor.duplicateSlide}
          onDelete={editor.deleteSlide}
          onMove={editor.reorderSlides}
        />
      </div>

      <div className="grid min-h-180 grid-cols-1 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="admin-surface overflow-y-auto p-5 xl:max-h-[calc(100vh-190px)]">
          <div className="space-y-6">
            <section>
              <SectionTitle
                number="1"
                title="Post details"
                description="Name, platform, format and visual settings."
              />

              <PostSettingsPanel
                post={editor.post}
                onPostChange={editor.updatePost}
                onSettingsChange={editor.updateSettings}
                onApplyPreset={(presetId) => {
                  editor.applyPreset(presetId);
                  setTimeout(
                    () => setActiveId(editor.post.slides[0]?.id),
                    0,
                  );
                }}
              />
            </section>

            <section className="border-t border-zinc-200/80 pt-5 dark:border-zinc-800">
              <SectionTitle
                number="2"
                title="Slide layout"
                description="Choose how the selected slide should look."
              />

              <TemplateSelector
                value={activeSlide?.template}
                onChange={(template) =>
                  editor.updateSlide(activeSlide.id, { template })
                }
              />
            </section>

            <section className="border-t border-zinc-200/80 pt-5 dark:border-zinc-800">
              <SectionTitle
                number="3"
                title="Slide content"
                description="Edit only the currently selected slide."
              />

              {activeSlide && (
                <SlideEditor
                  slide={activeSlide}
                  onChange={(patch) =>
                    editor.updateSlide(activeSlide.id, patch)
                  }
                />
              )}
            </section>
          </div>
        </aside>

        <div className="admin-surface overflow-hidden p-3">
          <div className="mb-2 px-1">
            <div className="text-sm font-semibold">Live preview</div>
            <div className="text-xs text-muted-foreground">
              Changes appear here immediately.
            </div>
          </div>

          <LivePreview
            post={editor.post}
            activeSlide={activeSlide}
            activeIndex={activeIndex}
            previewRef={previewRef}
          />
        </div>
      </div>

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
                _category: editor.post.category,
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
