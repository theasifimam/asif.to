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
  Urgent: "bg-red-500 text-white",
  High: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  Medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Low: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  None: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
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
