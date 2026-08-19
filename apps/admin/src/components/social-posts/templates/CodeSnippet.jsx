"use client";

import SlideFrame from "./shared/SlideFrame";
import AutoFitText from "./shared/AutoFitText";
import CodeBlock from "./shared/CodeBlock";

export default function CodeSnippet({ slide, ...frame }) {
  return (
    <SlideFrame {...frame}>
      <AutoFitText
        as="h1"
        max={52}
        min={32}
        lines={2}
        style={{
          fontWeight: 900,
          lineHeight: 1.08,
          letterSpacing: "-.035em",
          margin: "0 0 28px",
        }}
      >
        {slide.title || "Code example"}
      </AutoFitText>

      {slide.subtitle && (
        <p
          style={{
            fontSize: 28,
            color: "#a1a1aa",
            margin: "-12px 0 26px",
          }}
        >
          {slide.subtitle}
        </p>
      )}

      <CodeBlock
        code={slide.code}
        settings={frame.settings}
        maxHeight={620}
      />
    </SlideFrame>
  );
}
