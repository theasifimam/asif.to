export const TECHNOLOGIES = {
  javascript: { name: "JavaScript", description: "Practice language fundamentals, asynchronous code, DOM work, and algorithms.", topics: ["Arrays", "Strings", "Objects", "Functions", "Promises", "Async/Await", "DOM", "Algorithms"] },
  html: { name: "HTML", description: "Build semantic, accessible page structures.", topics: ["Semantics", "Accessibility", "Forms"] },
  css: { name: "CSS", description: "Practice responsive layouts with Flexbox and Grid.", topics: ["Responsive Design", "Flexbox", "Grid"] },
  web: { name: "HTML + CSS + JavaScript", description: "Build complete browser interactions with three editable files.", topics: ["DOM", "Events", "Components"] },
  react: { name: "React", description: "Build editable React components using state, hooks, forms, and context.", topics: ["Components", "Props", "State", "Hooks", "Forms", "Context", "Performance"] },
  nextjs: { name: "Next.js", description: "Explore client-renderable Next.js concepts in a browser sandbox.", topics: ["Pages", "Components", "Routing"] },
};

export const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export function sandpackTemplateFor(language) {
  if (language === "react") return "react";
  if (language === "typescript") return "vanilla-ts";
  if (language === "react-typescript") return "react-ts";
  if (language === "nextjs") return "nextjs";
  return "vanilla";
}
