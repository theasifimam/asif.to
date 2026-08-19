"use client";

import { useLayoutEffect, useRef, useState } from "react";

export default function AutoFitText({
  children,
  min = 28,
  max = 72,
  lines = 3,
  as: Tag = "div",
  style = {},
}) {
  const ref = useRef(null);
  const [fontSize, setFontSize] = useState(max);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let next = max;
    const lineHeight = Number(style.lineHeight) || 1.08;
    const maxHeight = max * lineHeight * lines;

    el.style.fontSize = `${next}px`;

    while (
      next > min &&
      (el.scrollHeight > maxHeight || el.scrollWidth > el.clientWidth)
    ) {
      next -= 2;
      el.style.fontSize = `${next}px`;
    }

    setFontSize(next);
  }, [children, min, max, lines, style.lineHeight]);

  return (
    <Tag
      ref={ref}
      style={{
        ...style,
        fontSize,
        overflow: "hidden",
      }}
    >
      {children}
    </Tag>
  );
}
