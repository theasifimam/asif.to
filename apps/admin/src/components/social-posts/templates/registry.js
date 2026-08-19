/**
 * Template Registry for Social Post Studio.
 *
 * Each template declares its metadata, the fields it supports,
 * and the React component that renders it. Adding a new template
 * requires only a new entry here and the corresponding component file.
 */

import DeveloperTip from "./DeveloperTip";
import CodeSnippet from "./CodeSnippet";
import InterviewQuestion from "./InterviewQuestion";
import TutorialCover from "./TutorialCover";
import TutorialStep from "./TutorialStep";
import Comparison from "./Comparison";
import Definition from "./Definition";
import Quote from "./Quote";
import Minimal from "./Minimal";
import Summary from "./Summary";

const TEMPLATES = [
  {
    id: "developer-tip",
    name: "Developer Tip",
    category: "coding",
    description: "Quick development tips & concepts",
    supportedFields: ["eyebrow", "title", "body", "highlightedText", "badge", "code"],
    component: DeveloperTip,
  },
  {
    id: "code-snippet",
    name: "Code Snippet",
    category: "coding",
    description: "Highlighted source code showcase",
    supportedFields: ["title", "subtitle", "code"],
    component: CodeSnippet,
  },
  {
    id: "interview-question",
    name: "Interview Question",
    category: "interview",
    description: "Question with concise answer",
    supportedFields: ["eyebrow", "title", "body", "highlightedText", "badge"],
    component: InterviewQuestion,
  },
  {
    id: "tutorial-cover",
    name: "Tutorial Cover",
    category: "tutorial",
    description: "Carousel opening slide",
    supportedFields: ["eyebrow", "title", "subtitle", "badge"],
    component: TutorialCover,
  },
  {
    id: "tutorial-step",
    name: "Tutorial Step",
    category: "tutorial",
    description: "Numbered tutorial slide",
    supportedFields: ["stepNumber", "title", "body", "code", "bulletPoints"],
    component: TutorialStep,
  },
  {
    id: "comparison",
    name: "Comparison",
    category: "comparison",
    description: "Side-by-side comparison",
    supportedFields: ["title", "comparisonLeft", "comparisonRight"],
    component: Comparison,
  },
  {
    id: "definition",
    name: "Definition / Concept",
    category: "text",
    description: "Strong heading + concise explanation",
    supportedFields: ["eyebrow", "title", "body", "highlightedText"],
    component: Definition,
  },
  {
    id: "quote",
    name: "Quote / Note",
    category: "text",
    description: "Key takeaway or statement",
    supportedFields: ["quote", "author", "eyebrow"],
    component: Quote,
  },
  {
    id: "minimal",
    name: "Minimal Text",
    category: "minimal",
    description: "Clean typography-heavy card",
    supportedFields: ["title", "subtitle"],
    component: Minimal,
  },
  {
    id: "summary",
    name: "Summary / CTA",
    category: "minimal",
    description: "Final carousel slide with CTA",
    supportedFields: ["title", "body", "cta", "url"],
    component: Summary,
  },
];

export const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));

export const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "coding", label: "Coding" },
  { id: "tutorial", label: "Tutorial" },
  { id: "text", label: "Text" },
  { id: "interview", label: "Interview" },
  { id: "comparison", label: "Comparison" },
  { id: "minimal", label: "Minimal" },
];

export function getTemplate(id) {
  return TEMPLATE_MAP[id] || TEMPLATES[0];
}

export function getTemplatesByCategory(category) {
  if (!category || category === "all") return TEMPLATES;
  return TEMPLATES.filter((t) => t.category === category);
}

export default TEMPLATES;
