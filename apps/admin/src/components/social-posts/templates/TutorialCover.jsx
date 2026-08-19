"use client";

import SlideFrame from "./shared/SlideFrame";
import AutoFitText from "./shared/AutoFitText";

export default function TutorialCover({ slide, ...frame }) {
  const accent = frame.settings?.accentColor || "#2563eb";

  return (
    <SlideFrame {...frame}>
      <div
        style={{
          display: "inline-flex",
          alignSelf: "flex-start",
          padding: "9px 14px",
          borderRadius: 999,
          background: `${accent}20`,
          color: accent,
          fontSize: 20,
          fontWeight: 900,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          marginBottom: 30,
        }}
      >
        {slide.eyebrow || "Tutorial"}
      </div>

      <AutoFitText
        as="h1"
        max={78}
        min={42}
        lines={4}
        style={{
          fontWeight: 950,
          lineHeight: 1.02,
          letterSpacing: "-.055em",
          margin: 0,
        }}
      >
        {slide.title || "Tutorial title"}
      </AutoFitText>

      {slide.subtitle && (
        <p
          style={{
            fontSize: 34,
            lineHeight: 1.45,
            color: "#a1a1aa",
            marginTop: 32,
            maxWidth: 820,
          }}
        >
          {slide.subtitle}
        </p>
      )}

      <div
        style={{
          width: 110,
          height: 8,
          borderRadius: 20,
          background: accent,
          marginTop: 46,
        }}
      />
    </SlideFrame>
  );
}
