"use client";

import SlideFrame from "./shared/SlideFrame";
import AutoFitText from "./shared/AutoFitText";

export default function InterviewQuestion({ slide, ...frame }) {
  const accent = frame.settings?.accentColor || "#2563eb";

  return (
    <SlideFrame {...frame}>
      <div
        style={{
          fontSize: 21,
          fontWeight: 900,
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: accent,
          marginBottom: 24,
        }}
      >
        {slide.eyebrow || "Interview Question"}
      </div>

      <AutoFitText
        as="h1"
        max={66}
        min={38}
        style={{
          fontWeight: 900,
          lineHeight: 1.06,
          letterSpacing: "-.045em",
          margin: 0,
        }}
      >
        {slide.title || "Your interview question"}
      </AutoFitText>

      {slide.body && (
        <div
          style={{
            marginTop: 38,
            padding: "28px 30px",
            background: "rgba(255,255,255,.05)",
            borderRadius: 22,
            fontSize: 31,
            lineHeight: 1.5,
            color: "#d4d4d8",
          }}
        >
          {slide.body}
        </div>
      )}

      {slide.highlightedText && (
        <p
          style={{
            marginTop: 28,
            fontSize: 28,
            fontWeight: 800,
            color: accent,
          }}
        >
          {slide.highlightedText}
        </p>
      )}
    </SlideFrame>
  );
}
