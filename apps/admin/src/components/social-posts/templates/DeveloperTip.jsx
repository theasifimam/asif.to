"use client";

import SlideFrame from "./shared/SlideFrame";
import AutoFitText from "./shared/AutoFitText";
import CodeBlock from "./shared/CodeBlock";

export default function DeveloperTip({ slide, ...frame }) {
  const accent = frame.settings?.accentColor || "#2563eb";

  return (
    <SlideFrame {...frame}>
      {slide.eyebrow && (
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: ".12em",
            color: accent,
            marginBottom: 20,
          }}
        >
          {slide.eyebrow}
        </div>
      )}

      <AutoFitText
        as="h1"
        max={68}
        min={38}
        style={{
          fontWeight: 900,
          lineHeight: 1.06,
          letterSpacing: "-.045em",
          margin: 0,
        }}
      >
        {slide.title || "Developer tip"}
      </AutoFitText>

      {slide.body && (
        <p
          style={{
            fontSize: 33,
            lineHeight: 1.5,
            color: "#b4b4bd",
            margin: "30px 0 0",
          }}
        >
          {slide.body}
        </p>
      )}

      {slide.highlightedText && (
        <div
          style={{
            marginTop: 30,
            padding: "18px 22px",
            borderLeft: `4px solid ${accent}`,
            background: "rgba(255,255,255,.04)",
            fontSize: 29,
            fontWeight: 700,
          }}
        >
          {slide.highlightedText}
        </div>
      )}

      {slide.code?.content && (
        <div style={{ marginTop: 30 }}>
          <CodeBlock
            code={slide.code}
            settings={frame.settings}
            maxHeight={330}
          />
        </div>
      )}
    </SlideFrame>
  );
}
