"use client";

import { useState } from "react";
import { Maximize2, Minus, Plus } from "lucide-react";
import TemplateRenderer from "./templates/TemplateRenderer";
import { getFormat } from "./formats";

export default function LivePreview({
  post,
  activeSlide,
  activeIndex,
  previewRef,
}) {
  const format = getFormat(post.format);
  // Default scale at 0.32 so 1080px canvas fits into ~345px width cleanly
  const [zoom, setZoom] = useState(0.32);

  const resetFit = () => setZoom(0.32);

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-950 text-white overflow-hidden shadow-inner">
      <div className="flex items-center justify-between border-b border-zinc-800 px-3.5 py-2.5 bg-zinc-900/80">
        <div>
          <div className="text-xs font-bold text-zinc-200">
            Canvas Live Preview
          </div>
          <div className="text-[10px] text-zinc-400 font-medium">
            {format.width} × {format.height} px ({format.label})
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="rounded-lg border border-zinc-700 p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            onClick={() =>
              setZoom((z) => Math.max(0.2, Number((z - 0.05).toFixed(2))))
            }
            title="Zoom out"
          >
            <Minus size={13} />
          </button>

          <span className="min-w-10 text-center text-[11px] font-mono font-bold text-zinc-300">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            className="rounded-lg border border-zinc-700 p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            onClick={() =>
              setZoom((z) => Math.min(0.8, Number((z + 0.05).toFixed(2))))
            }
            title="Zoom in"
          >
            <Plus size={13} />
          </button>

          <button
            type="button"
            className="ml-1 rounded-lg border border-zinc-700 px-2 py-1 text-[10px] font-bold text-blue-400 hover:bg-zinc-800 transition-colors flex items-center gap-1"
            onClick={resetFit}
            title="Fit to view"
          >
            <Maximize2 size={11} />
            <span>Fit</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-105 max-h-130 overflow-auto p-4 bg-zinc-900/50">
        <div
          style={{
            width: format.width * zoom,
            height: format.height * zoom,
            flexShrink: 0,
          }}
          className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-zinc-700/50 transition-all duration-150"
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
