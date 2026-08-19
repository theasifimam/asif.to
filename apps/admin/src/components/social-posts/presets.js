/**
 * Content presets for Social Post Studio.
 * Each preset auto-creates a set of slides to speed up post creation.
 */

const uid = () => Math.random().toString(36).slice(2, 10);

export const PRESETS = [
  {
    id: "quick-tip",
    label: "Quick Tip",
    description: "Hook → Explanation → Code → Takeaway",
    icon: "💡",
    slides: [
      { id: uid(), order: 0, template: "developer-tip", eyebrow: "Dev Tip", title: "", body: "" },
      { id: uid(), order: 1, template: "definition", eyebrow: "Explanation", title: "", body: "" },
      { id: uid(), order: 2, template: "code-snippet", title: "Example", code: { language: "javascript", filename: "", content: "", highlightLines: [], showLineNumbers: true } },
      { id: uid(), order: 3, template: "summary", title: "Key Takeaway", cta: "" },
    ],
  },
  {
    id: "tutorial",
    label: "Tutorial",
    description: "Cover → Problem → Concept → Example → Code → Mistake → Summary",
    icon: "📘",
    slides: [
      { id: uid(), order: 0, template: "tutorial-cover", eyebrow: "Tutorial", title: "", subtitle: "" },
      { id: uid(), order: 1, template: "tutorial-step", stepNumber: 1, title: "The Problem", body: "" },
      { id: uid(), order: 2, template: "definition", eyebrow: "Concept", title: "", body: "" },
      { id: uid(), order: 3, template: "code-snippet", title: "Example", code: { language: "javascript", filename: "", content: "", highlightLines: [], showLineNumbers: true } },
      { id: uid(), order: 4, template: "tutorial-step", stepNumber: 2, title: "Common Mistake", body: "" },
      { id: uid(), order: 5, template: "code-snippet", title: "Correct Approach", code: { language: "javascript", filename: "", content: "", highlightLines: [], showLineNumbers: true } },
      { id: uid(), order: 6, template: "summary", title: "Summary", cta: "" },
    ],
  },
  {
    id: "interview",
    label: "Interview Question",
    description: "Question → Short Answer → Explanation → Code → Takeaway",
    icon: "🎯",
    slides: [
      { id: uid(), order: 0, template: "interview-question", eyebrow: "Interview Question", title: "", body: "" },
      { id: uid(), order: 1, template: "definition", eyebrow: "Short Answer", title: "", body: "" },
      { id: uid(), order: 2, template: "tutorial-step", stepNumber: 1, title: "Deep Dive", body: "" },
      { id: uid(), order: 3, template: "code-snippet", title: "Code Example", code: { language: "javascript", filename: "", content: "", highlightLines: [], showLineNumbers: true } },
      { id: uid(), order: 4, template: "summary", title: "Key Takeaway", cta: "" },
    ],
  },
  {
    id: "comparison",
    label: "Comparison",
    description: "Cover → Option A → Option B → Comparison → Recommendation → Summary",
    icon: "⚖️",
    slides: [
      { id: uid(), order: 0, template: "tutorial-cover", eyebrow: "Comparison", title: "", subtitle: "" },
      { id: uid(), order: 1, template: "definition", eyebrow: "Option A", title: "", body: "" },
      { id: uid(), order: 2, template: "definition", eyebrow: "Option B", title: "", body: "" },
      { id: uid(), order: 3, template: "comparison", title: "Side by Side", comparisonLeft: { label: "A", items: [] }, comparisonRight: { label: "B", items: [] } },
      { id: uid(), order: 4, template: "developer-tip", eyebrow: "Recommendation", title: "", body: "" },
      { id: uid(), order: 5, template: "summary", title: "Summary", cta: "" },
    ],
  },
];

/**
 * Generate fresh slides from a preset (with unique IDs).
 */
export function generatePresetSlides(presetId) {
  const preset = PRESETS.find((p) => p.id === presetId);
  if (!preset) return [];
  return preset.slides.map((slide, i) => ({
    ...slide,
    id: uid(),
    order: i,
    // Deep-clone code object if present
    code: slide.code ? { ...slide.code } : null,
    comparisonLeft: slide.comparisonLeft ? { ...slide.comparisonLeft, items: [...(slide.comparisonLeft.items || [])] } : null,
    comparisonRight: slide.comparisonRight ? { ...slide.comparisonRight, items: [...(slide.comparisonRight.items || [])] } : null,
  }));
}
