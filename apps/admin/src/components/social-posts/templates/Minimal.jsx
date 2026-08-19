"use client";

import SlideFrame from "./shared/SlideFrame";
import AutoFitText from "./shared/AutoFitText";

export default function Minimal({ slide, ...frame }) {
  return (
    <SlideFrame {...frame}>
      <AutoFitText
        as="h1"
        max={82}
        min={42}
        lines={5}
        style={{
          fontWeight: 950,
          lineHeight: 1.02,
          letterSpacing: "-.06em",
          margin: 0,
        }}
      >
        {slide.title || "Say one thing clearly."}
      </AutoFitText>

      {slide.subtitle && (
        <p
          style={{
            fontSize: 28,
            lineHeight: 1.5,
            color: "#a1a1aa",
            marginTop: 34,
            maxWidth: 820,
          }}
        >
          {slide.subtitle}
        </p>
      )}
    </SlideFrame>
  );
}
