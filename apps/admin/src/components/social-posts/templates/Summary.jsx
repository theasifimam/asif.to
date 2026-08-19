"use client";

import SlideFrame from "./shared/SlideFrame";
import AutoFitText from "./shared/AutoFitText";

export default function Summary({ slide, ...frame }) {
  const accent = frame.settings?.accentColor || "#2563eb";

  return (
    <SlideFrame {...frame}>
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
        Summary
      </div>

      <AutoFitText
        as="h1"
        max={72}
        min={40}
        lines={4}
        style={{
          fontWeight: 950,
          lineHeight: 1.04,
          letterSpacing: "-.05em",
          margin: 0,
        }}
      >
        {slide.title || "That's it."}
      </AutoFitText>

      {slide.body && (
        <p
          style={{
            fontSize: 27,
            lineHeight: 1.5,
            color: "#b4b4bd",
            marginTop: 32,
          }}
        >
          {slide.body}
        </p>
      )}

      {slide.cta && (
        <div
          style={{
            marginTop: 40,
            display: "inline-flex",
            alignSelf: "flex-start",
            padding: "18px 24px",
            borderRadius: 16,
            background: accent,
            color: "#fff",
            fontSize: 20,
            fontWeight: 900,
          }}
        >
          {slide.cta}
        </div>
      )}

      {slide.url && (
        <div style={{ marginTop: 18, fontSize: 18, color: "#71717a" }}>
          {slide.url}
        </div>
      )}
    </SlideFrame>
  );
}
