"use client";

import SlideFrame from "./shared/SlideFrame";
import AutoFitText from "./shared/AutoFitText";

export default function Quote({ slide, ...frame }) {
  const accent = frame.settings?.accentColor || "#2563eb";

  return (
    <SlideFrame {...frame}>
      <div
        style={{
          fontSize: 90,
          lineHeight: 0.7,
          color: accent,
          fontFamily: "Georgia, serif",
          marginBottom: 28,
        }}
      >
        “
      </div>

      <AutoFitText
        as="blockquote"
        max={58}
        min={34}
        lines={6}
        style={{
          fontWeight: 800,
          lineHeight: 1.18,
          letterSpacing: "-.035em",
          margin: 0,
        }}
      >
        {slide.quote || slide.title || "Important takeaway"}
      </AutoFitText>

      {slide.author && (
        <div
          style={{
            marginTop: 36,
            fontSize: 26,
            color: "#a1a1aa",
            fontWeight: 700,
          }}
        >
          — {slide.author}
        </div>
      )}
    </SlideFrame>
  );
}
