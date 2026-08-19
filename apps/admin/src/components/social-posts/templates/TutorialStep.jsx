"use client";

import SlideFrame from "./shared/SlideFrame";
import AutoFitText from "./shared/AutoFitText";
import CodeBlock from "./shared/CodeBlock";

export default function TutorialStep({ slide, ...frame }) {
  const accent = frame.settings?.accentColor || "#2563eb";

  return (
    <SlideFrame {...frame}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          marginBottom: 25,
        }}
      >
        <span
          style={{
            width: 58,
            height: 58,
            borderRadius: 18,
            display: "grid",
            placeItems: "center",
            background: accent,
            fontSize: 22,
            fontWeight: 900,
          }}
        >
          {String(slide.stepNumber || frame.slideIndex + 1).padStart(2, "0")}
        </span>

        <span
          style={{
            fontSize: 15,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: ".14em",
            color: "#71717a",
          }}
        >
          Tutorial step
        </span>
      </div>

      <AutoFitText
        as="h1"
        max={58}
        min={34}
        lines={3}
        style={{
          fontWeight: 900,
          lineHeight: 1.08,
          letterSpacing: "-.04em",
          margin: 0,
        }}
      >
        {slide.title || "Step title"}
      </AutoFitText>

      {slide.body && (
        <p
          style={{
            fontSize: 25,
            lineHeight: 1.52,
            color: "#b4b4bd",
            margin: "28px 0 0",
          }}
        >
          {slide.body}
        </p>
      )}

      {slide.bulletPoints?.length > 0 && (
        <ul
          style={{
            fontSize: 23,
            lineHeight: 1.55,
            color: "#d4d4d8",
            paddingLeft: 28,
          }}
        >
          {slide.bulletPoints.map((item, index) => (
            <li key={index} style={{ marginBottom: 10 }}>
              {item}
            </li>
          ))}
        </ul>
      )}

      {slide.code?.content && (
        <div style={{ marginTop: 28 }}>
          <CodeBlock
            code={slide.code}
            settings={frame.settings}
            maxHeight={350}
          />
        </div>
      )}
    </SlideFrame>
  );
}
