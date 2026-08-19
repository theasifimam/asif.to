"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
        if (result?.success) setSavedAt(new Date());
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [editor.post, postId]);

  const format = getFormat(editor.post.format);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-card p-3">
        <div>
          <div className="font-semibold">Social Post Studio</div>
          <div className="text-xs text-muted-foreground">
            {savedAt ? `Saved ${savedAt.toLocaleTimeString()}` : "Draft"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={editor.undo}
            disabled={!editor.canUndo}
            className="py-1"
          >
            <Undo2 size={16} />
          </Button>

          <Button
            variant="outline"
            onClick={editor.redo}
            disabled={!editor.canRedo}
          >
            <Redo2 size={16} />
          </Button>

          <ExportControls
            name={editor.post.name}
            activeIndex={activeIndex}
            previewRef={previewRef}
            exportRefs={exportRefs}
          />

          <Button variant="default" onClick={save} disabled={saving}>
            <Save size={15} />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
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

      <div className="grid min-h-180 grid-cols-1 gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-5 overflow-y-auto rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-black p-4 xl:max-h-[calc(100vh-190px)]">
          <PostSettingsPanel
            post={editor.post}
            onPostChange={editor.updatePost}
            onSettingsChange={editor.updateSettings}
            onApplyPreset={(presetId) => {
              editor.applyPreset(presetId);
              setTimeout(() => setActiveId(editor.post.slides[0]?.id), 0);
            }}
          />

          <div className="border-t pt-4">
            <div className="mb-3 text-sm font-semibold">Slide template</div>
            <TemplateSelector
              value={activeSlide?.template}
              onChange={(template) =>
                editor.updateSlide(activeSlide.id, { template })
              }
            />
          </div>

          <div className="border-t border-zinc-200/90 dark:border-zinc-800 pt-4">
            <div className="mb-3 text-sm font-semibold">Slide content</div>
            {activeSlide && (
              <SlideEditor
                slide={activeSlide}
                onChange={(patch) => editor.updateSlide(activeSlide.id, patch)}
              />
            )}
          </div>
        </aside>

        <LivePreview
          post={editor.post}
          activeSlide={activeSlide}
          activeIndex={activeIndex}
          previewRef={previewRef}
        />
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
            style={{ width: format.width, height: format.height }}
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
