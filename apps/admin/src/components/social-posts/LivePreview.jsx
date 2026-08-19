"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import TemplateRenderer from "./templates/TemplateRenderer";
import { getFormat } from "./formats";

export default function LivePreview({
  post,
  activeSlide,
  activeIndex,
  previewRef,
}) {
  const [zoom, setZoom] = useState(0.56);
  const format = getFormat(post.format);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-muted/20">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Live preview</div>
          <div className="text-xs text-muted-foreground">
            {format.width} × {format.height}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-zinc-200/90 dark:border-zinc-800 p-1.5"
            onClick={() => setZoom((z) => Math.max(0.25, z - 0.05))}
          >
            <Minus size={14} />
          </button>
          <span className="min-w-12 text-center text-xs">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            className="rounded-full border border-zinc-200/90 dark:border-zinc-800 p-1.5"
            onClick={() => setZoom((z) => Math.min(1, z + 0.05))}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-auto p-6">
        <div
          style={{
            width: format.width * zoom,
            height: format.height * zoom,
            flexShrink: 0,
          }}
          className="rounded-4xl overflow-hidden"
        >
          <div
            style={{
              width: format.width,
              height: format.height,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
          >
            <div ref={previewRef}>
              <TemplateRenderer
                slide={activeSlide}
                format={post.format}
                settings={{
                  ...post.settings,
                  _category: post.category,
                }}
                slideIndex={activeIndex}
                totalSlides={post.slides.length}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
