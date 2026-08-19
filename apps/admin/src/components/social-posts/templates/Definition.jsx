"use client";

import SlideFrame from "./shared/SlideFrame";
import AutoFitText from "./shared/AutoFitText";

export default function Definition({ slide, ...frame }) {
  const accent = frame.settings?.accentColor || "#2563eb";

  return (
    <SlideFrame {...frame}>
      {slide.eyebrow && (
        <div
          style={{
            fontSize: 15,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: ".14em",
            color: accent,
            marginBottom: 24,
          }}
        >
          {slide.eyebrow}
        </div>
      )}

      <AutoFitText
        as="h1"
        max={70}
        min={38}
        lines={3}
        style={{
          fontWeight: 950,
          lineHeight: 1.04,
          letterSpacing: "-.05em",
          margin: 0,
        }}
      >
        {slide.title || "Concept"}
      </AutoFitText>

      {slide.body && (
        <p
          style={{
            fontSize: 28,
            lineHeight: 1.52,
            color: "#b4b4bd",
            marginTop: 34,
          }}
        >
          {slide.body}
        </p>
      )}

      {slide.highlightedText && (
        <div
          style={{
            marginTop: 34,
            fontSize: 24,
            fontWeight: 850,
            color: "#fff",
            padding: "20px 24px",
            borderRadius: 18,
            background: `${accent}24`,
          }}
        >
          {slide.highlightedText}
        </div>
      )}
    </SlideFrame>
  );
}
