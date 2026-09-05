export const CARD_TYPES = [
  "Course",
  "Chapter",
  "Article",
  "Tutorial",
  "SEO",
  "Feature",
  "Bug",
  "Improvement",
  "Idea",
  "Task",
];
export const PRIORITIES = ["Urgent", "High", "Medium", "Low", "None"];
export const CONTENT_TYPES = new Set([
  "Course",
  "Chapter",
  "Article",
  "Tutorial",
  "SEO",
]);
export const PRIORITY_WEIGHT = {
  Urgent: 0,
  High: 1,
  Medium: 2,
  Low: 3,
  None: 4,
};
export const PRIORITY_STYLE = {
  Urgent:
    "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25",
  High: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20",
  Medium:
    "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20",
  Low: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20",
  None: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60",
};
export const PRIORITY_DOT = {
  Urgent: "bg-rose-500",
  High: "bg-rose-500",
  Medium: "bg-amber-500",
  Low: "bg-emerald-500",
  None: "bg-zinc-400",
};
export const TEMPLATES = {
  Article: {
    type: "Article",
    priority: "Medium",
    checklist: [
      { text: "Outline", completed: false },
      { text: "First draft", completed: false },
      { text: "SEO review", completed: false },
      { text: "Publish", completed: false },
    ],
  },
  Chapter: {
    type: "Chapter",
    priority: "Medium",
    checklist: [
      { text: "Learning objectives", completed: false },
      { text: "Draft content", completed: false },
      { text: "Code examples", completed: false },
      { text: "Review", completed: false },
    ],
  },
  Course: {
    type: "Course",
    priority: "High",
    checklist: [
      { text: "Curriculum", completed: false },
      { text: "Chapters", completed: false },
      { text: "Final review", completed: false },
    ],
  },
  Feature: {
    type: "Feature",
    priority: "Medium",
    checklist: [
      { text: "Define scope", completed: false },
      { text: "Implement", completed: false },
      { text: "Test", completed: false },
    ],
  },
  Bug: {
    type: "Bug",
    priority: "High",
    checklist: [
      { text: "Reproduce", completed: false },
      { text: "Fix", completed: false },
      { text: "Regression test", completed: false },
    ],
  },
  "SEO Task": {
    type: "SEO",
    priority: "Medium",
    checklist: [
      { text: "Keyword research", completed: false },
      { text: "Optimize", completed: false },
      { text: "Measure", completed: false },
    ],
  },
};
