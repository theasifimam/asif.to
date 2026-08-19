"use client";

import SlideFrame from "./shared/SlideFrame";
import AutoFitText from "./shared/AutoFitText";

function ComparisonSide({ data, accent }) {
  return (
    <div
      style={{
        flex: 1,
        padding: 28,
        border: "1px solid rgba(255,255,255,.1)",
        borderRadius: 24,
        background: "rgba(255,255,255,.035)",
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          color: accent,
          marginBottom: 20,
        }}
      >
        {data?.label || "Option"}
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {(data?.items || []).map((item, index) => (
          <div
            key={index}
            style={{
              fontSize: 26,
              lineHeight: 1.45,
              color: "#d4d4d8",
              display: "flex",
              gap: 10,
            }}
          >
            <span style={{ color: accent }}>✓</span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Comparison({ slide, ...frame }) {
  const accent = frame.settings?.accentColor || "#2563eb";

  return (
    <SlideFrame {...frame}>
      <AutoFitText
        as="h1"
        max={54}
        min={34}
        lines={2}
        style={{
          fontWeight: 900,
          lineHeight: 1.08,
          letterSpacing: "-.04em",
          margin: "0 0 34px",
        }}
      >
        {slide.title || "Comparison"}
      </AutoFitText>

      <div style={{ display: "flex", gap: 22, alignItems: "stretch" }}>
        <ComparisonSide data={slide.comparisonLeft} accent={accent} />
        <ComparisonSide data={slide.comparisonRight} accent={accent} />
      </div>
    </SlideFrame>
  );
}
