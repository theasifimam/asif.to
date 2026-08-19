"use client";

import { getTemplate } from "./registry";

export default function TemplateRenderer({
  slide,
  format,
  settings,
  slideIndex = 0,
  totalSlides = 1,
}) {
  const template = getTemplate(slide?.template);
  const Component = template.component;

  return (
    <Component
      slide={slide || {}}
      format={format}
      settings={settings}
      slideIndex={slideIndex}
      totalSlides={totalSlides}
    />
  );
}
