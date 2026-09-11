"use client";

import React from "react";
import { GripHorizontal, GripVertical } from "lucide-react";

export default function WorkspaceSplitResizer({
  direction = "horizontal",
  isDark,
  startResize,
  moveResize,
  stopResize,
  ariaLabel,
  title,
}) {
  if (direction === "horizontal") {
    return (
      <button
        type="button"
        onPointerDown={(event) => startResize("horizontal", event)}
        onPointerMove={moveResize}
        onPointerUp={stopResize}
        onPointerCancel={stopResize}
        onLostPointerCapture={stopResize}
        className={`group hidden touch-none cursor-col-resize items-center justify-center border-x transition hover:bg-blue-600 lg:flex ${
          isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-300 bg-zinc-200"
        }`}
        aria-label={ariaLabel || "Resize editor and output panels"}
        title={title || "Drag to resize panels"}
      >
        <GripVertical
          className={`h-5 w-5 group-hover:text-white ${
            isDark ? "text-zinc-500" : "text-zinc-400"
          }`}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onPointerDown={(event) => startResize("vertical", event)}
      onPointerMove={moveResize}
      onPointerUp={stopResize}
      onPointerCancel={stopResize}
      onLostPointerCapture={stopResize}
      className={`group hidden h-2 w-full touch-none cursor-row-resize items-center justify-center border-y transition hover:bg-blue-600 lg:flex ${
        isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-300 bg-zinc-200"
      }`}
      aria-label={ariaLabel || "Resize preview and console panels"}
      title={title || "Drag up or down to resize preview and console"}
    >
      <GripHorizontal
        className={`h-4 w-4 group-hover:text-white ${
          isDark ? "text-zinc-500" : "text-zinc-400"
        }`}
      />
    </button>
  );
}
