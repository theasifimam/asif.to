/**
 * CSS Mastery Course — Full Seed Script
 * Seeds: Course → Chapters (topic-wise, SEO-friendly question headings)
 *
 * Run:  node src/scripts/seed-css-course.js
 *
 * Covers ALL major CSS properties grouped by topic.
 * Chapter titles use question format (what devs google) for maximum SEO impact.
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌  MONGO_URI not found in .env file");
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// COURSE METADATA
// ─────────────────────────────────────────────────────────────────────────────
const COURSE = {
  slug: "css-mastery",
  title: "CSS Mastery: Complete In-Depth Guide",
  subtitle:
    "Master every CSS property — from selectors to animations, flexbox to grid, variables to filters — with real-world examples and browser-ready code.",
  seoTitle: "CSS Complete Course: Master All CSS Properties",
  seoDescription:
    "Learn CSS in depth — every property, every layout technique, animations, variables, and more. The most complete free CSS course online.",
  keywords: [
    "css course",
    "learn css",
    "css tutorial",
    "css properties",
    "css flexbox",
    "css grid",
    "css animations",
    "css for beginners",
    "css in depth",
    "complete css guide",
  ],
  techId: "css",
  level: "Beginner – Advanced",
  duration: "Self-paced (15+ hours)",
  thumbnail:
    "https://upload.wikimedia.org/wikipedia/commons/d/d5/CSS3_logo_and_wordmark.svg",
  learningOutcomes: [
    "Understand every CSS selector, specificity, and the cascade",
    "Build responsive layouts with Flexbox and CSS Grid",
    "Master the Box Model, positioning, and stacking contexts",
    "Use CSS Variables (custom properties) for maintainable design systems",
    "Create smooth animations and transitions without JavaScript",
    "Apply CSS Filters, Transforms, and advanced visual effects",
    "Write production-grade, accessible, and performant CSS",
  ],
  order: 6,
  status: "published",
};

// ─────────────────────────────────────────────────────────────────────────────
// ALL CHAPTERS — organised by topic
// ─────────────────────────────────────────────────────────────────────────────
const CHAPTERS = [
  // ═══════════════════════════ TOPIC 1 — FOUNDATIONS ═══════════════════════
  {
    topicGroup: "CSS Foundations",
    slug: "what-is-css-and-how-does-it-work",
    title: "What is CSS and how does it work?",
    summary:
      "Understand what CSS is, how browsers parse it, and the fundamental rendering pipeline from HTML to pixels.",
    seoTitle: "What is CSS? How CSS Works in the Browser",
    seoDescription:
      "A beginner-friendly explanation of what CSS is, how the browser parses stylesheets, and how styles are applied to HTML elements.",
    keywords: [
      "what is css",
      "how css works",
      "css basics",
      "css introduction",
      "css parsing",
    ],
    content: [
      `## What is CSS?\n\nCSS (Cascading Style Sheets) is the language that controls **how HTML elements look** in a browser. While HTML defines the structure and content of a page, CSS defines its presentation — colors, fonts, spacing, layout, animations, and much more.\n\nCSS works by targeting HTML elements with **selectors** and applying **declarations** (property–value pairs) to them.`,
      `## How Does the Browser Apply CSS?\n\nThe browser follows these steps every time it renders a page:\n\n1. **Parse HTML** → Build the DOM (Document Object Model) tree\n2. **Parse CSS** → Build the CSSOM (CSS Object Model)\n3. **Combine** → Merge DOM + CSSOM into the **Render Tree**\n4. **Layout** → Calculate exact positions and sizes of every element\n5. **Paint** → Draw pixels to the screen\n6. **Compositing** → Layer GPU-accelerated elements on top\n\nUnderstanding this pipeline helps you write CSS that performs well and avoids layout thrashing.`,
      `## Three Ways to Add CSS\n\nYou can add CSS to an HTML page in three ways:\n- **External stylesheet** (recommended): \`<link rel="stylesheet" href="styles.css" />\`\n- **Internal \`<style>\` tag**: Useful for single-page prototypes.\n- **Inline \`style\` attribute**: Highest specificity — avoid for maintainability.`,
    ],
    codeSnippets: [
      {
        title: "Your First CSS Rule",
        language: "css",
        code: `/* selector { property: value; } */
body {
  background-color: #f8f9fa;
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
}

h1 {
  color: #1a202c;
  font-size: 2.5rem;
  line-height: 1.2;
}

p {
  color: #4a5568;
  line-height: 1.7;
}`,
      },
    ],
    tryItChallenge:
      "Create a stylesheet that changes the page background to dark navy (#0f172a), sets the body font to system-ui, and makes all h1 elements display in white with a font-size of 3rem.",
    order: 1,
  },

  {
    topicGroup: "CSS Foundations",
    slug: "how-do-css-selectors-work",
    title: "How do CSS selectors work?",
    summary:
      "A deep dive into every type of CSS selector — universal, element, class, ID, attribute, pseudo-class, pseudo-element, and combinators.",
    seoTitle: "CSS Selectors Explained: Every Selector Type with Examples",
    seoDescription:
      "Learn every CSS selector type — class, ID, attribute, pseudo-class, pseudo-element, and combinators — with clear examples for each.",
    keywords: [
      "css selectors",
      "css class selector",
      "css id selector",
      "css pseudo-class",
      "css pseudo-element",
      "css attribute selector",
      "css combinators",
    ],
    content: [
      `## Basic Selectors\n\nCSS provides several fundamental ways to target elements:\n\n- **Universal (\`*\`)** — selects every element on the page\n- **Type (\`h1\`)** — selects all elements of that HTML tag\n- **Class (\`.card\`)** — selects all elements with that class\n- **ID (\`#header\`)** — selects the one element with that id`,
      `## Attribute Selectors\n\nAttribute selectors let you match elements based on their HTML attributes:\n\n- \`a[href]\` — has the attribute\n- \`input[type="email"]\` — exact match\n- \`a[href^="https"]\` — starts with\n- \`a[href$=".pdf"]\` — ends with\n- \`img[src*="cdn"]\` — contains substring\n- \`[class~="btn"]\` — contains word (space-separated)`,
      `## Pseudo-Classes (Selecting by State)\n\nPseudo-classes style elements based on their **state** or **position**:\n\n- \`:hover\`, \`:focus\`, \`:active\`, \`:visited\`, \`:disabled\`\n- \`:first-child\`, \`:last-child\`, \`:nth-child(2n)\`\n- \`:not(.special)\` — negation\n- \`:focus-visible\` — only on keyboard focus (not mouse)`,
      `## Pseudo-Elements (Inserting Virtual Elements)\n\nPseudo-elements style **parts** of an element or insert generated content:\n\n- \`::before\`, \`::after\` — insert content before/after\n- \`::first-line\`, \`::first-letter\` — style first line or letter\n- \`::selection\` — user-highlighted text\n- \`::placeholder\` — input placeholder text`,
      `## Combinators (Combining Selectors)\n\n- **Descendant** \`header nav\` — any nav inside header\n- **Child** \`ul > li\` — only direct children\n- **Adjacent sibling** \`h2 + p\` — p immediately after h2\n- **General sibling** \`h2 ~ p\` — all p after h2 in same parent`,
    ],
    codeSnippets: [
      {
        title: "Real-World Selector Examples",
        language: "css",
        code: `/* Style every other table row */
tbody tr:nth-child(even) {
  background-color: #f8fafc;
}

/* Style external links with an icon */
a[href^="http"]::after {
  content: " ↗";
  font-size: 0.75em;
  color: #6b7280;
}

/* Focus-visible ring for keyboard navigation */
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Remove default list style from nav */
nav > ul > li {
  list-style: none;
}

/* Style required invalid fields */
input:required:not(:placeholder-shown):invalid {
  border-color: #ef4444;
}`,
      },
    ],
    tryItChallenge:
      "Write selectors to: (1) style only links inside a .sidebar that start with https, (2) make every 3rd list item bold, (3) add a star before every h3 using ::before.",
    order: 2,
  },

  {
    topicGroup: "CSS Foundations",
    slug: "what-is-css-specificity-and-the-cascade",
    title: "What is CSS specificity and how does the cascade work?",
    summary:
      "Learn how browsers decide which CSS rule wins when multiple rules target the same element — specificity, inheritance, and the cascade.",
    seoTitle: "CSS Specificity & Cascade Explained with Examples",
    seoDescription:
      "Understand CSS specificity, the cascade, and inheritance — why some rules override others and how to avoid specificity wars in your stylesheets.",
    keywords: [
      "css specificity",
      "css cascade",
      "css inheritance",
      "css rule priority",
      "!important css",
      "css specificity calculator",
    ],
    content: [
      `## The CSS Cascade\n\nThe "Cascading" in CSS refers to the algorithm browsers use to determine which rule applies when multiple rules target the same element. The cascade considers:\n\n1. **Origin** — browser defaults < user stylesheets < author stylesheets\n2. **Specificity** — how precisely the selector targets the element\n3. **Order of appearance** — later rules override earlier ones (when specificity is equal)`,
      `## How Specificity is Calculated\n\nSpecificity is a four-part score: [Inline, ID, Class/Pseudo-class/Attribute, Element]\n\n- \`*\` (universal): 0-0-0-0\n- \`p\` (element): 0-0-0-1\n- \`.btn\` (class): 0-0-1-0\n- \`#header\` (ID): 0-1-0-0\n- \`style=""\` (inline): 1-0-0-0\n- \`!important\`: overrides all\n\n**Higher number wins. When equal, last rule in code wins.**`,
      `## CSS Inheritance\n\nSome CSS properties are **inherited** by child elements (mostly text-related):\n\n✅ **Inherited by default:** \`color\`, \`font-family\`, \`font-size\`, \`line-height\`, \`text-align\`, \`cursor\`\n\n❌ **Not inherited:** \`margin\`, \`padding\`, \`border\`, \`background\`, \`width\`, \`height\`, \`display\`\n\nYou can explicitly control inheritance with \`inherit\`, \`initial\`, \`unset\`, and \`revert\`.`,
    ],
    codeSnippets: [
      {
        title: "Specificity Wars — Pitfalls and Solutions",
        language: "css",
        code: `/* ❌ BAD: Deep selector creates high-specificity lock-in */
#sidebar .nav ul li a.active { color: blue; }

/* ✅ GOOD: Low-specificity flat class */
.nav-link--active { color: blue; }

/* ❌ BAD: !important cascade mess */
.btn { color: white !important; }
.btn-danger { color: red !important; } /* Won't always work as expected */

/* ✅ GOOD: Intentional higher specificity */
.btn { color: white; }
.btn.btn-danger { color: red; }

/* Control inheritance explicitly */
.child {
  color: inherit;      /* Force inheritance */
  font-size: initial;  /* Reset to browser default */
  margin: unset;       /* Inherits if property is inherited, else initial */
}`,
      },
    ],
    tryItChallenge:
      "Given this HTML: <p id='intro' class='highlight'>Hello</p>, predict the color for each rule and explain why: (a) p { color: red; }, (b) .highlight { color: blue; }, (c) #intro { color: green; }, (d) p.highlight#intro { color: purple; }",
    order: 3,
  },

  // ═══════════════════════════ TOPIC 2 — BOX MODEL ═════════════════════════
  {
    topicGroup: "The Box Model",
    slug: "what-is-the-css-box-model",
    title: "What is the CSS Box Model?",
    summary:
      "Master the CSS Box Model — margin, border, padding, and content — and understand box-sizing: border-box.",
    seoTitle: "CSS Box Model Explained: margin, border, padding, content",
    seoDescription:
      "Understand the CSS Box Model fully — how margin, border, padding and content combine to define an element's total size, and why border-box changes everything.",
    keywords: [
      "css box model",
      "css margin",
      "css padding",
      "css border",
      "box-sizing border-box",
      "css width height",
      "css margin collapse",
    ],
    content: [
      `## The Four Layers of the Box Model\n\nEvery HTML element is a rectangular box made of four layers (from inside out):\n\n1. **Content** — where text and child elements live (\`width\` / \`height\`)\n2. **Padding** — transparent space *inside* the border\n3. **Border** — the visible boundary around padding\n4. **Margin** — transparent space *outside* the border (separates elements from each other)`,
      `## content-box vs border-box\n\nBy default (\`box-sizing: content-box\`), \`width\` only sets the **content** area. Padding and border are **added on top**, making elements wider than expected.\n\nWith \`box-sizing: border-box\`, \`width\` includes content + padding + border — far more predictable for layout.\n\n**Always apply globally:**\n\`\`\`css\n*, *::before, *::after { box-sizing: border-box; }\n\`\`\``,
      `## Margin Collapse\n\nAdjacent **vertical margins collapse** into a single margin equal to the largest one. A \`32px\` bottom margin + \`16px\` top margin = \`32px\` gap, NOT \`48px\`.\n\nCollapse does **not** happen between flex/grid children, or when a parent has \`overflow: hidden\`, \`padding\`, or \`border\`.`,
      `## Shorthand Reference\n\n\`\`\`css\nmargin: 16px;               /* All four sides */\nmargin: 16px 24px;          /* Top/Bottom, Left/Right */\nmargin: 8px 16px 24px 32px; /* Top Right Bottom Left (clockwise) */\nborder: 2px solid #e2e8f0;  /* width style color */\nborder-radius: 8px;          /* All corners */\nborder-radius: 8px 0 8px 0; /* TL TR BR BL */\npadding-inline: 24px;        /* Modern: left + right */\nmargin-block: 16px;          /* Modern: top + bottom */\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Box Model Global Reset & Card",
        language: "css",
        code: `/* Global border-box reset */
*, *::before, *::after { box-sizing: border-box; }

.card {
  width: 320px;
  padding: 24px 32px;    /* 24px top/bottom, 32px left/right */
  margin: 24px auto;     /* Centre horizontally */
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.04);
}

/* Negative margin — pull image to card edges */
.card-image {
  margin: -24px -32px 24px;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}

/* Fluid centred container */
.container {
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: 16px;
}`,
      },
    ],
    tryItChallenge:
      "Without using Flexbox or Grid, centre a div horizontally using only margin: auto, width, and max-width. Then add padding and a border without changing the outer width — use box-sizing: border-box.",
    order: 4,
  },

  // ═══════════════════════════ TOPIC 3 — TYPOGRAPHY ═════════════════════════
  {
    topicGroup: "Typography & Colors",
    slug: "how-to-style-fonts-in-css",
    title: "How do you style fonts in CSS? Complete typography guide",
    summary:
      "Everything about CSS typography — font-family, font-size, font-weight, line-height, letter-spacing, text-transform, and Google Fonts integration.",
    seoTitle: "CSS Typography: Font Properties Complete Guide",
    seoDescription:
      "Master CSS typography — font-family, font-size, font-weight, line-height, letter-spacing, and more. Includes Google Fonts and @font-face examples.",
    keywords: [
      "css font",
      "css typography",
      "css font-family",
      "css font-size",
      "css font-weight",
      "css line-height",
      "google fonts css",
      "css text styling",
    ],
    content: [
      `## Core Font Properties\n\n\`\`\`css\np {\n  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;\n  font-size: 1rem;       /* 1rem = 16px browser default */\n  font-weight: 400;      /* 100 thin → 900 black */\n  font-style: normal;    /* normal | italic | oblique */\n  line-height: 1.6;      /* Unitless = relative to font-size */\n  letter-spacing: 0.01em;\n  word-spacing: 0.05em;\n}\n\`\`\``,
      `## Text Properties\n\n\`\`\`css\nh1 {\n  text-align: center;                   /* left | center | right | justify */\n  text-transform: uppercase;            /* uppercase | lowercase | capitalize */\n  text-decoration: underline wavy blue;\n  text-underline-offset: 4px;\n  text-indent: 2em;\n  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;             /* \"...\" when text overflows */\n}\n\`\`\``,
      `## Loading Google Fonts\n\nAdd to your HTML \`<head>\`:\n\n\`\`\`html\n<link rel="preconnect" href="https://fonts.googleapis.com" />\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />\n\`\`\`\n\nThen use in CSS: \`font-family: 'Inter', sans-serif;\``,
      `## Fluid Typography with clamp()\n\n\`\`\`css\n/* Scales between 1.5rem and 3rem based on viewport */\nh1 { font-size: clamp(1.5rem, 4vw, 3rem); }\n\n/* Optimal reading line length */\np { max-width: 65ch; }\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Typography Design System",
        language: "css",
        code: `/* Typography scale using CSS variables */
:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'Fira Code', 'Cascadia Code', monospace;

  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.875rem;
  --text-4xl:  2.25rem;
  --text-5xl:  3rem;

  --leading-tight:   1.25;
  --leading-normal:  1.5;
  --leading-relaxed: 1.7;

  --tracking-tight:  -0.025em;
  --tracking-normal: 0em;
  --tracking-wide:   0.05em;
}

h1, h2, h3 {
  font-family: var(--font-sans);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}

code, pre { font-family: var(--font-mono); }`,
      },
    ],
    tryItChallenge:
      "Build a blog post header with: a large h1 using a Google Font at clamp(2rem, 5vw, 4rem), a muted subtitle, author name in uppercase tracked letters, and a read time that truncates with ellipsis if too long.",
    order: 5,
  },

  {
    topicGroup: "Typography & Colors",
    slug: "how-to-use-color-in-css",
    title: "How to use color in CSS — all color formats explained",
    summary:
      "Master every CSS color format — hex, rgb, hsl, oklch, named colors, opacity, and the new relative color syntax.",
    seoTitle: "CSS Colors: hex, rgb, hsl, oklch — Every Format Explained",
    seoDescription:
      "Learn every CSS color format — hex, rgb, rgba, hsl, hsla, oklch, and named colors — with practical examples and a guide to color contrast for accessibility.",
    keywords: [
      "css color",
      "css hex color",
      "css rgb color",
      "css hsl color",
      "css oklch",
      "css opacity",
      "css color formats",
      "css named colors",
    ],
    content: [
      `## All Color Formats\n\n\`\`\`css\n.el {\n  /* Named (140 built-in) */\n  color: tomato;\n  color: transparent;    /* Fully transparent */\n  color: currentColor;   /* Inherits own color property */\n\n  /* Hex */\n  color: #3b82f6;        /* #RRGGBB */\n  color: #3b82f6aa;      /* #RRGGBBAA with alpha */\n  color: #36f;           /* Shorthand #RGB */\n\n  /* RGB */\n  color: rgb(59, 130, 246);\n  color: rgb(59 130 246 / 0.5);  /* Modern syntax */\n\n  /* HSL — most designer-friendly */\n  color: hsl(217, 91%, 60%);\n  color: hsl(217 91% 60% / 50%);\n\n  /* oklch — perceptually uniform */\n  color: oklch(60% 0.2 250);\n\n  opacity: 0.8; /* Makes the WHOLE element transparent */\n}\n\`\`\``,
      `## Why Use HSL?\n\nHSL is the most designer-friendly format:\n- **H**ue: 0–360 (the color wheel angle)\n- **S**aturation: 0% (gray) – 100% (vivid)\n- **L**ightness: 0% (black) – 100% (white)\n\nCreate a palette by only changing lightness:\n\`\`\`css\n:root {\n  --blue-100: hsl(217, 91%, 95%);\n  --blue-300: hsl(217, 91%, 75%);\n  --blue-500: hsl(217, 91%, 60%);  /* Base */\n  --blue-700: hsl(217, 91%, 40%);\n  --blue-900: hsl(217, 91%, 20%);\n}\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Color System with CSS Variables",
        language: "css",
        code: `/* Professional color system */
:root {
  --hue-primary: 221;
  --primary:     hsl(var(--hue-primary) 83% 53%);
  --primary-50:  hsl(var(--hue-primary) 83% 97%);
  --primary-600: hsl(var(--hue-primary) 83% 44%);

  /* Semantic tokens */
  --color-text:        hsl(222 47% 11%);
  --color-text-muted:  hsl(215 16% 47%);
  --color-bg:          hsl(0 0% 100%);
  --color-border:      hsl(220 13% 91%);
  --color-success:     hsl(142 71% 45%);
  --color-warning:     hsl(38 92% 50%);
  --color-error:       hsl(0 84% 60%);
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text:       hsl(210 40% 98%);
    --color-text-muted: hsl(215 20% 65%);
    --color-bg:         hsl(222 47% 8%);
    --color-border:     hsl(217 33% 17%);
  }
}`,
      },
    ],
    tryItChallenge:
      "Create a dark-mode card using CSS variables: define --card-bg and --card-text that automatically change when prefers-color-scheme: dark is active. Use HSL for all colors.",
    order: 6,
  },

  // ═══════════════════════════ TOPIC 4 — LAYOUT ═════════════════════════════
  {
    topicGroup: "Layout & Positioning",
    slug: "how-does-css-display-property-work",
    title: "How does the CSS display property work?",
    summary:
      "Understand every value of the CSS display property — block, inline, inline-block, none, flex, grid, and the newer multi-keyword syntax.",
    seoTitle: "CSS display Property: block, inline, flex, grid Explained",
    seoDescription:
      "Master the CSS display property — understand the difference between block, inline, inline-block, flex, grid, and none with clear examples.",
    keywords: [
      "css display",
      "css display block",
      "css display inline",
      "css display none",
      "css display flex",
      "css display grid",
      "css inline-block",
      "css visibility hidden",
    ],
    content: [
      `## Block vs Inline vs Inline-Block\n\n- **block**: Full width, stacks vertically. (\`div\`, \`p\`, \`h1\`, \`section\`)\n- **inline**: Only as wide as content, sits in text flow. (\`span\`, \`a\`, \`strong\`) — cannot set \`width\`/\`height\`\n- **inline-block**: Inline positioning but respects \`width\` and \`height\`\n- **none**: Completely removes from layout (no space reserved)\n- **visibility: hidden**: Hides visually but space is preserved`,
      `## Table Display Values\n\n\`\`\`css\n.grid        { display: table; width: 100%; }\n.grid-row    { display: table-row; }\n.grid-cell   { display: table-cell; vertical-align: middle; }\n\`\`\``,
      `## Useful Modern Values\n\n- **\`display: contents\`** — removes the element's box from layout but keeps children visible as if they were direct parent children\n- **\`display: flow-root\`** — creates a block formatting context, modern replacement for clearfix hacks`,
    ],
    codeSnippets: [
      {
        title: "Display Property Reference",
        language: "css",
        code: `.element {
  display: block;         /* Full width, vertical stacking */
  display: inline;        /* Content width, horizontal flow */
  display: inline-block;  /* Inline + accepts width/height */
  display: flex;          /* Flexbox container */
  display: inline-flex;   /* Inline flexbox */
  display: grid;          /* Grid container */
  display: inline-grid;   /* Inline grid */
  display: none;          /* Remove from layout entirely */
  display: table;         /* Acts like <table> */
  display: table-cell;    /* Acts like <td> */
  display: table-row;     /* Acts like <tr> */
  display: list-item;     /* Renders list bullet */
  display: contents;      /* Removes own box, keeps children */
  display: flow-root;     /* Creates block formatting context */
}`,
      },
    ],
    tryItChallenge:
      "Create a horizontal navigation bar using display: inline-block for each nav item. Then create the same layout using display: flex. Compare the two approaches and explain the difference.",
    order: 7,
  },

  {
    topicGroup: "Layout & Positioning",
    slug: "how-does-css-position-work",
    title: "How does CSS position work? (static, relative, absolute, fixed, sticky)",
    summary:
      "Master all five CSS position values — static, relative, absolute, fixed, and sticky — and understand stacking contexts and z-index.",
    seoTitle: "CSS position: static, relative, absolute, fixed, sticky Guide",
    seoDescription:
      "Learn every CSS position value — static, relative, absolute, fixed, and sticky — with practical use cases, z-index explained, and stacking context gotchas.",
    keywords: [
      "css position",
      "css absolute",
      "css relative",
      "css fixed",
      "css sticky",
      "css z-index",
      "css stacking context",
      "css position absolute center",
    ],
    content: [
      `## The Five Position Values\n\n| Value | Removed from flow? | Positioned relative to |\n|---|---|---|\n| \`static\` | No (default) | N/A |\n| \`relative\` | No | Its own original position |\n| \`absolute\` | Yes | Nearest positioned ancestor |\n| \`fixed\` | Yes | The viewport |\n| \`sticky\` | No (until threshold) | Scroll container |`,
      `## relative and absolute\n\n\`\`\`css\n/* relative: offsets from own position, space is preserved */\n/* Key use: creates positioning context for absolute children */\n.card {\n  position: relative; /* Now .badge is absolute relative to .card */\n}\n.badge {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n}\n\n/* Centre an absolute element */\n.modal {\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n}\n\n/* Modern — use inset shorthand */\n.overlay {\n  position: fixed;\n  inset: 0; /* top:0 right:0 bottom:0 left:0 */\n}\n\`\`\``,
      `## sticky — Best of Both Worlds\n\n\`\`\`css\n/* Scrolls normally until it hits the threshold, then sticks */\n.toc {\n  position: sticky;\n  top: 80px;\n}\n\n/* Sticky table headers */\nthead th {\n  position: sticky;\n  top: 0;\n  background: white;\n  z-index: 1;\n}\n\n/* Gotchas: parent must be taller than sticky element,\n   parent must NOT have overflow: hidden */\n\`\`\``,
      `## z-index and Stacking Contexts\n\n\`z-index\` only works on **positioned** elements (not static).\n\nA new stacking context is created by:\n- \`position\` + \`z-index\` (other than auto)\n- \`opacity\` < 1\n- \`transform\`, \`filter\`, \`will-change\`\n- \`isolation: isolate\` — use this to contain a component's z-index`,
    ],
    codeSnippets: [
      {
        title: "Sticky Header + Absolute Badge",
        language: "css",
        code: `/* Sticky header with glassmorphism */
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e2e8f0;
}

/* Card with absolutely positioned badge */
.product-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}
.product-card__badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  background: #ef4444;
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Centred modal overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: grid;
  place-items: center;
  z-index: 100;
}`,
      },
    ],
    tryItChallenge:
      "Build a card with a NEW badge in the top-right corner using position: relative on the card and position: absolute on the badge. Then create a sticky navbar that stays at the top when scrolling.",
    order: 8,
  },

  // ═══════════════════════════ TOPIC 5 — FLEXBOX ════════════════════════════
  {
    topicGroup: "Flexbox",
    slug: "what-is-flexbox-and-how-to-use-it",
    title: "What is Flexbox and how do you use it?",
    summary:
      "A complete guide to CSS Flexbox — flex-direction, justify-content, align-items, flex-wrap, flex-grow, flex-shrink, flex-basis, and the flex shorthand.",
    seoTitle: "CSS Flexbox Complete Guide: Every Property Explained",
    seoDescription:
      "Master CSS Flexbox — flex-direction, justify-content, align-items, flex-wrap, flex-grow, flex-shrink, gap, and the flex shorthand with real-world examples.",
    keywords: [
      "css flexbox",
      "what is flexbox",
      "flexbox tutorial",
      "justify-content",
      "align-items",
      "flex-direction",
      "flex-wrap",
      "flex-grow",
      "css flex",
      "flexbox guide",
    ],
    content: [
      `## Flexbox Container Properties\n\n\`\`\`css\n.container {\n  display: flex;\n\n  /* Direction of main axis */\n  flex-direction: row;            /* → default */\n  flex-direction: column;         /* ↓ */\n  flex-direction: row-reverse;    /* ← */\n  flex-direction: column-reverse; /* ↑ */\n\n  /* MAIN axis alignment (justify) */\n  justify-content: flex-start;    /* Pack to start */\n  justify-content: flex-end;      /* Pack to end */\n  justify-content: center;        /* Centre items */\n  justify-content: space-between; /* Edges + equal gaps */\n  justify-content: space-around;  /* Equal space around each */\n  justify-content: space-evenly;  /* Equal space everywhere */\n\n  /* CROSS axis alignment (align) */\n  align-items: stretch;    /* Fill cross-axis (default) */\n  align-items: flex-start;\n  align-items: flex-end;\n  align-items: center;\n  align-items: baseline;   /* Align text baselines */\n\n  /* Wrapping */\n  flex-wrap: nowrap;  /* Single line (default) */\n  flex-wrap: wrap;    /* Wrap to multiple lines */\n\n  /* Wrapped lines alignment */\n  align-content: center;\n  align-content: space-between;\n\n  /* Gap between items */\n  gap: 16px;\n  gap: 16px 24px; /* row-gap column-gap */\n}\n\`\`\``,
      `## Flex Item Properties\n\n\`\`\`css\n.item {\n  flex-grow: 0;     /* Don't grow (default) */\n  flex-grow: 1;     /* Take remaining space */\n\n  flex-shrink: 1;   /* Shrink proportionally (default) */\n  flex-shrink: 0;   /* Never shrink */\n\n  flex-basis: auto; /* Initial size (default — use width/height) */\n  flex-basis: 200px;\n\n  /* Shorthand: grow shrink basis */\n  flex: 1;          /* 1 1 0 */\n  flex: auto;       /* 1 1 auto */\n  flex: none;       /* 0 0 auto — fixed size */\n\n  align-self: center; /* Override container's align-items */\n  order: -1;          /* Reorder visually (not DOM order) */\n}\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Essential Flexbox Recipes",
        language: "css",
        code: `/* 1. Perfect centering */
.center-me {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

/* 2. Navigation bar */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
}

/* 3. Push last item to far end */
.toolbar { display: flex; align-items: center; gap: 12px; }
.toolbar__spacer { flex: 1; }

/* 4. Equal-width columns */
.columns { display: flex; gap: 24px; }
.columns > * { flex: 1; }

/* 5. Responsive wrapping cards */
.card-row { display: flex; flex-wrap: wrap; gap: 16px; }
.card-row .card { flex: 1 1 280px; max-width: 400px; }

/* 6. Sidebar + main */
.layout { display: flex; min-height: 100vh; }
.sidebar { flex: 0 0 240px; }
.main    { flex: 1; }`,
      },
    ],
    tryItChallenge:
      "Build a responsive card row: cards should be at least 260px wide, grow equally to fill the row, and wrap to the next line when the container is too narrow. Use only Flexbox (no Grid). Add a gap between cards.",
    order: 9,
  },

  // ═══════════════════════════ TOPIC 6 — CSS GRID ═══════════════════════════
  {
    topicGroup: "CSS Grid",
    slug: "what-is-css-grid-and-how-to-use-it",
    title: "What is CSS Grid and how do you use it?",
    summary:
      "The complete CSS Grid guide — grid-template-columns, grid-template-rows, grid-area, repeat, minmax, auto-fill, auto-fit, and named areas.",
    seoTitle: "CSS Grid Complete Guide: grid-template, areas, repeat, minmax",
    seoDescription:
      "Master CSS Grid layout — grid-template-columns, grid-template-rows, grid-area, repeat(), minmax(), auto-fill, auto-fit, and named template areas with examples.",
    keywords: [
      "css grid",
      "what is css grid",
      "css grid tutorial",
      "grid-template-columns",
      "css grid area",
      "css grid repeat",
      "css minmax",
      "auto-fill auto-fit",
      "css grid layout",
    ],
    content: [
      `## Defining the Grid\n\n\`\`\`css\n.container {\n  display: grid;\n\n  /* Columns */\n  grid-template-columns: 200px 1fr 200px;              /* Fixed | Flex | Fixed */\n  grid-template-columns: repeat(3, 1fr);               /* 3 equal columns */\n  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); /* Responsive */\n\n  /* Rows */\n  grid-template-rows: auto 1fr auto;                   /* Header | Content | Footer */\n\n  /* Gap */\n  gap: 24px;\n  gap: 16px 24px;    /* row-gap column-gap */\n\n  /* Implicit rows for overflow content */\n  grid-auto-rows: minmax(100px, auto);\n\n  /* Flow direction */\n  grid-auto-flow: row dense; /* Fill gaps with smaller items */\n}\n\`\`\``,
      `## Placing Grid Items\n\n\`\`\`css\n.item {\n  grid-column: 1 / 3;     /* Start at line 1, end at line 3 */\n  grid-column: 1 / -1;    /* Full width */\n  grid-column: span 2;    /* Span 2 columns */\n  grid-row: 1 / span 3;   /* Span 3 rows */\n}\n\`\`\``,
      `## Named Grid Areas\n\n\`\`\`css\n.layout {\n  display: grid;\n  grid-template-columns: 240px 1fr;\n  grid-template-rows: 64px 1fr 48px;\n  grid-template-areas:\n    "header  header"\n    "sidebar main"\n    "footer  footer";\n  min-height: 100vh;\n}\n.site-header  { grid-area: header; }\n.site-sidebar { grid-area: sidebar; }\n.site-main    { grid-area: main; }\n.site-footer  { grid-area: footer; }\n\`\`\``,
      `## repeat(), minmax(), auto-fill, auto-fit\n\n\`\`\`css\n/* auto-fill — create as many columns as fit, even empty ones */\ngrid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n\n/* auto-fit — like auto-fill, but collapse empty columns */\ngrid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n/* auto-fit stretches items to fill row; auto-fill leaves gaps */\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Real-World Grid Patterns",
        language: "css",
        code: `/* Dashboard layout with named areas */
.dashboard {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: 64px 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar content";
  height: 100vh;
}
.dash-sidebar  { grid-area: sidebar; overflow-y: auto; }
.dash-header   { grid-area: header; position: sticky; top: 0; }
.dash-content  { grid-area: content; overflow-y: auto; padding: 24px; }

/* Auto-responsive card grid — no media queries needed! */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* Magazine layout */
.magazine {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}
.hero-article { grid-column: 1 / 9; grid-row: 1 / 3; }
.side-story   { grid-column: 9 / 13; }`,
      },
    ],
    tryItChallenge:
      "Build a responsive photo gallery grid: cards should be at least 200px wide, use auto-fill to fill the row, and have a featured card that spans 2 rows and 2 columns. The layout should adapt without media queries.",
    order: 10,
  },

  // ═══════════════════════════ TOPIC 7 — RESPONSIVE DESIGN ═════════════════
  {
    topicGroup: "Responsive Design",
    slug: "how-to-make-a-website-responsive-with-css",
    title: "How do you make a website responsive with CSS?",
    summary:
      "Master responsive web design — media queries, viewport units, fluid typography with clamp(), container queries, and the mobile-first approach.",
    seoTitle: "CSS Responsive Design: Media Queries, Viewport Units, clamp()",
    seoDescription:
      "Learn how to build responsive websites with CSS — media queries, mobile-first approach, viewport units (vw, vh, svh), clamp(), and CSS container queries.",
    keywords: [
      "css responsive design",
      "css media queries",
      "responsive web design",
      "mobile first css",
      "css viewport units",
      "css clamp",
      "container queries css",
      "css breakpoints",
    ],
    content: [
      `## Mobile-First Approach\n\nWrite CSS for the smallest screen first, then use \`min-width\` media queries to add complexity for larger screens. This produces leaner CSS and performs better on mobile.\n\n\`\`\`css\n/* Base — mobile */\n.card { padding: 16px; }\n\n/* Tablet + */\n@media (min-width: 768px) { .card { padding: 24px; } }\n\n/* Desktop + */\n@media (min-width: 1024px) { .card { padding: 32px; } }\n\`\`\``,
      `## Media Query Syntax\n\n\`\`\`css\n/* Width breakpoints */\n@media (min-width: 640px)  { /* sm */ }\n@media (min-width: 768px)  { /* md */ }\n@media (min-width: 1024px) { /* lg */ }\n@media (min-width: 1280px) { /* xl */ }\n\n/* Range (CSS Level 4) */\n@media (768px <= width < 1024px) { /* Tablet only */ }\n\n/* Capability queries */\n@media (hover: hover)                  { /* Has hover */ }\n@media (pointer: coarse)               { /* Touch screen */ }\n@media (prefers-color-scheme: dark)    { /* Dark mode */ }\n@media (prefers-reduced-motion: reduce){ /* Reduce animation */ }\n@media print                           { /* Print styles */ }\n\`\`\``,
      `## Viewport Units\n\n\`\`\`css\n/* Legacy */\n.hero { height: 100vh; }   /* May jump on mobile due to browser bar */\n\n/* Modern (Safari 15.4+) */\n.hero { height: 100svh; }  /* Small viewport — most reliable on mobile */\n.hero { height: 100dvh; }  /* Dynamic — follows collapsing browser chrome */\n\`\`\``,
      `## Fluid Sizing with clamp()\n\n\`clamp(min, preferred, max)\` smoothly scales between a minimum and maximum:\n\n\`\`\`css\nh1 { font-size: clamp(1.5rem, 5vw, 3rem); }\n.section { padding: clamp(32px, 8vw, 96px); }\n.content { width: clamp(280px, 90%, 1200px); margin-inline: auto; }\n\`\`\``,
      `## CSS Container Queries (2023+)\n\nContainer queries let components respond to their **container's** size, not the viewport:\n\n\`\`\`css\n.card-wrapper {\n  container-type: inline-size;\n  container-name: card;\n}\n\n@container card (min-width: 400px) {\n  .card { flex-direction: row; }\n}\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Complete Responsive Layout Pattern",
        language: "css",
        code: `:root {
  --spacing: clamp(1rem, 3vw, 2rem);
  --heading: clamp(1.75rem, 5vw, 3.5rem);
  --max-width: 1200px;
}

/* Fluid container */
.container {
  width: min(var(--max-width), 100% - 2 * var(--spacing));
  margin-inline: auto;
}

/* Stack on mobile, side-by-side on tablet+ */
.content-area { display: grid; gap: var(--spacing); }

@media (min-width: 768px) {
  .content-area { grid-template-columns: 1fr 280px; }
}

/* Responsive typography */
h1 { font-size: var(--heading); }

/* Responsive images */
img { max-width: 100%; height: auto; }

/* Hide/Show at breakpoints */
.mobile-only  { display: block; }
.desktop-only { display: none; }

@media (min-width: 1024px) {
  .mobile-only  { display: none; }
  .desktop-only { display: block; }
}`,
      },
    ],
    tryItChallenge:
      "Build a blog layout that stacks on mobile, shows 2-column cards on tablets, and 3 columns on desktop — using mobile-first media queries and clamp() for fluid font sizes. No JavaScript allowed.",
    order: 11,
  },

  // ═══════════════════════════ TOPIC 8 — CSS VARIABLES ═════════════════════
  {
    topicGroup: "CSS Variables & Custom Properties",
    slug: "how-to-use-css-variables-custom-properties",
    title: "How to use CSS Variables (Custom Properties)?",
    summary:
      "Learn CSS custom properties — defining, reading, overriding variables, using them in calculations, and building a full design token system.",
    seoTitle: "CSS Variables (Custom Properties): Complete Guide with Examples",
    seoDescription:
      "Master CSS custom properties — define variables with --, use var(), override in media queries, use in calc(), and build a complete design token system.",
    keywords: [
      "css variables",
      "css custom properties",
      "css var",
      "css design tokens",
      "css --variable",
      "css variables dark mode",
      "css variables in javascript",
    ],
    content: [
      `## Defining and Using CSS Variables\n\n\`\`\`css\n:root {\n  --color-primary: #3b82f6;\n  --spacing-sm: 8px;\n  --spacing-md: 16px;\n  --radius: 8px;\n  --font-sans: 'Inter', system-ui, sans-serif;\n}\n\n.button {\n  background: var(--color-primary);\n  padding: var(--spacing-sm) var(--spacing-md);\n  border-radius: var(--radius);\n}\n\n/* var() with a fallback value */\ncolor: var(--color-brand, #3b82f6);\n\`\`\``,
      `## Scoping and Inheritance\n\n\`\`\`css\n/* Component-level variable scope */\n.card {\n  --card-bg: white;\n  --card-border: #e2e8f0;\n  background: var(--card-bg);\n  border: 1px solid var(--card-border);\n}\n\n/* Theme overrides on parent */\n.dark-theme .card {\n  --card-bg: #1e293b;\n  --card-border: #334155;\n  /* card auto-updates! */\n}\n\n/* Per-instance override */\n.card.card--warning {\n  --card-border: #f59e0b;\n}\n\`\`\``,
      `## Variables in Calculations\n\n\`\`\`css\n:root {\n  --spacing-unit: 8px;\n  --columns: 3;\n  --gap: 24px;\n}\n\n.grid-item {\n  width: calc((100% - (var(--columns) - 1) * var(--gap)) / var(--columns));\n  padding: calc(var(--spacing-unit) * 2);\n}\n\`\`\``,
      `## Variables + Dark Mode\n\n\`\`\`css\n:root {\n  --bg: hsl(0 0% 100%);\n  --text: hsl(222 47% 11%);\n}\n\n@media (prefers-color-scheme: dark) {\n  :root { --bg: hsl(222 47% 8%); --text: hsl(210 40% 98%); }\n}\n\n/* Or toggle with a class for manual override */\n[data-theme="dark"] {\n  --bg: hsl(222 47% 8%);\n  --text: hsl(210 40% 98%);\n}\n\`\`\``,
      `## Reading/Setting Variables from JavaScript\n\n\`\`\`javascript\nconst root = document.documentElement;\n// Read\nconst primary = getComputedStyle(root).getPropertyValue('--color-primary').trim();\n// Write\nroot.style.setProperty('--color-primary', '#8b5cf6');\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Complete Design Token System",
        language: "css",
        code: `/* ===== DESIGN TOKEN SYSTEM ===== */
:root {
  /* Color Palette */
  --primary-500: hsl(221 83% 53%);
  --primary-600: hsl(221 83% 44%);

  /* Semantic Tokens */
  --color-bg:          white;
  --color-surface:     hsl(220 14% 96%);
  --color-text:        hsl(222 47% 11%);
  --color-text-muted:  hsl(215 16% 47%);
  --color-border:      hsl(220 13% 91%);
  --color-accent:      var(--primary-500);

  /* Spacing */
  --space-1: 4px;   --space-2: 8px;
  --space-4: 16px;  --space-6: 24px;
  --space-8: 32px;  --space-12: 48px;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --text-sm: 0.875rem; --text-base: 1rem; --text-lg: 1.125rem;

  /* Shape & Shadow */
  --radius-md: 8px;   --radius-lg: 12px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,.08);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,.08);

  /* Transition */
  --transition-base: 200ms ease;
}

/* Dark mode — just override semantic tokens */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg:         hsl(222 47% 8%);
    --color-surface:    hsl(217 33% 13%);
    --color-text:       hsl(210 40% 98%);
    --color-text-muted: hsl(215 20% 65%);
    --color-border:     hsl(217 33% 20%);
  }
}`,
      },
    ],
    tryItChallenge:
      "Build a button component using only CSS variables — --btn-bg, --btn-text, --btn-radius, --btn-padding. Create three variants (primary, secondary, danger) by only overriding the relevant variables on each variant class.",
    order: 12,
  },

  // ═══════════════════════════ TOPIC 9 — BACKGROUNDS ═══════════════════════
  {
    topicGroup: "Backgrounds & Borders",
    slug: "how-to-use-css-backgrounds-and-gradients",
    title: "How to use CSS backgrounds and gradients?",
    summary:
      "Complete guide to CSS background properties — background-color, background-image, background-size, background-position, linear-gradient, radial-gradient, and conic-gradient.",
    seoTitle: "CSS Backgrounds & Gradients: Complete Guide with Examples",
    seoDescription:
      "Master CSS backgrounds — background-color, background-image, background-size cover/contain, background-position, and all gradient types: linear, radial, conic.",
    keywords: [
      "css background",
      "css gradient",
      "css linear-gradient",
      "css radial-gradient",
      "css background-size cover",
      "css background-image",
      "css background-position",
      "css conic-gradient",
    ],
    content: [
      `## All Background Properties\n\n\`\`\`css\n.el {\n  background-color: #f0f4ff;\n  background-image: url('/hero.jpg');\n  /* Multiple — front to back */\n  background-image: url('/bg.png'), url('/overlay.png');\n\n  background-size: auto;    /* Original size */\n  background-size: cover;   /* Scale to cover container (may crop) */\n  background-size: contain; /* Fit inside container (may leave gaps) */\n  background-size: 50% auto;\n\n  background-position: center;\n  background-position: top right;\n  background-position: 50% 25%;\n\n  background-repeat: no-repeat;\n  background-repeat: repeat-x; /* Only horizontal tiling */\n\n  background-attachment: fixed;  /* Parallax effect */\n  background-attachment: local;  /* Moves with element's scroll */\n\n  background-clip: text;         /* Clips to text shape */\n  background-origin: content-box;\n}\n\`\`\``,
      `## Gradients\n\n\`\`\`css\n/* Linear */\nbackground: linear-gradient(to right, #667eea, #764ba2);\nbackground: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);\n\n/* Multi-stop */\nbackground: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f5576c 100%);\n\n/* Radial */\nbackground: radial-gradient(circle, #667eea, #764ba2);\nbackground: radial-gradient(ellipse at top, #f093fb, #f5576c);\n\n/* Conic */\nbackground: conic-gradient(from 0deg, red, yellow, green, blue, red);\n\n/* Pie chart */\n.pie {\n  background: conic-gradient(\n    #3b82f6 0% 40%,\n    #10b981 40% 70%,\n    #f59e0b 70% 100%\n  );\n  border-radius: 50%;\n}\n\`\`\``,
      `## Text Gradient Effect\n\n\`\`\`css\n.gradient-text {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  background-clip: text;\n  color: transparent; /* Fallback */\n}\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Background Patterns & Effects",
        language: "css",
        code: `/* Hero with image + gradient overlay */
.hero {
  background-image:
    linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)),
    url('/hero.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed; /* Parallax */
  min-height: 100vh;
}

/* Subtle dot pattern */
.dotted-bg {
  background-color: #f8fafc;
  background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
  background-size: 24px 24px;
}

/* Grid pattern */
.grid-bg {
  background-image:
    linear-gradient(rgba(0,0,0,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,.05) 1px, transparent 1px);
  background-size: 32px 32px;
}

/* Animated gradient */
.animated-bg {
  background: linear-gradient(270deg, #667eea, #764ba2, #f5576c);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
}
@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}`,
      },
    ],
    tryItChallenge:
      "Create a hero section with: (1) a background image that covers the container, (2) a dark gradient overlay for text contrast, (3) a gradient heading using background-clip: text, and (4) an animated shimmer effect using linear-gradient + animation.",
    order: 13,
  },

  // ═══════════════════════════ TOPIC 10 — TRANSITIONS ════════════════════════
  {
    topicGroup: "Transitions & Animations",
    slug: "how-to-use-css-transitions",
    title: "How do CSS transitions work?",
    summary:
      "Master CSS transitions — transition-property, transition-duration, transition-timing-function, transition-delay, and building smooth hover effects.",
    seoTitle: "CSS Transitions: Complete Guide to transition Property",
    seoDescription:
      "Learn CSS transitions — transition-property, duration, timing functions (ease, linear, cubic-bezier), delay, and how to create smooth hover and state animations.",
    keywords: [
      "css transition",
      "css hover effect",
      "css transition timing",
      "css transition duration",
      "css cubic-bezier",
      "css smooth animation",
      "css transition all",
    ],
    content: [
      `## CSS Transition Properties\n\n\`\`\`css\n.button {\n  /* What to animate */\n  transition-property: background-color;\n  transition-property: transform, opacity;\n\n  /* Duration */\n  transition-duration: 200ms;\n\n  /* Easing */\n  transition-timing-function: ease;           /* Slow-fast-slow (default) */\n  transition-timing-function: linear;          /* Constant speed */\n  transition-timing-function: ease-in;         /* Slow start */\n  transition-timing-function: ease-out;        /* Slow end */\n  transition-timing-function: ease-in-out;     /* Slow both ends */\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n\n  /* Delay */\n  transition-delay: 100ms;\n\n  /* Shorthand: property duration timing delay */\n  transition: background-color 200ms ease-in-out;\n  transition:\n    transform 200ms cubic-bezier(0.4, 0, 0.2, 1),\n    opacity 150ms ease;\n}\n\`\`\``,
      `## What Can Be Transitioned?\n\n**Transitionable:** \`opacity\`, \`transform\`, \`color\`, \`background-color\`, \`border-color\`, \`box-shadow\`, \`filter\`, \`clip-path\`, \`max-height\`, \`padding\`, \`margin\`, \`width\`, \`height\`\n\n**NOT transitionable:** \`display\`, \`background-image\`\n\n**Performance tip:** Animate only \`transform\` and \`opacity\` when possible — they are GPU-accelerated and don't cause layout or paint.`,
    ],
    codeSnippets: [
      {
        title: "Smooth Interaction Patterns",
        language: "css",
        code: `/* Interactive card lift */
.card {
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
  transition:
    transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}
.card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 20px 40px rgba(0,0,0,.12);
}

/* Animated underline on hover */
.nav-link {
  position: relative;
  text-decoration: none;
}
.nav-link::after {
  content: '';
  position: absolute;
  left: 0; bottom: -2px;
  width: 100%; height: 2px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 250ms ease;
}
.nav-link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

/* CSS toggle switch */
.toggle {
  --w: 48px; --h: 28px;
  width: var(--w); height: var(--h);
  background: #e2e8f0;
  border-radius: var(--h);
  position: relative;
  cursor: pointer;
  transition: background 200ms ease;
}
.toggle.active { background: var(--color-primary); }
.toggle::after {
  content: '';
  position: absolute;
  width: calc(var(--h) - 6px);
  aspect-ratio: 1;
  background: white;
  border-radius: 50%;
  top: 3px; left: 3px;
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.toggle.active::after {
  transform: translateX(calc(var(--w) - var(--h)));
}`,
      },
    ],
    tryItChallenge:
      "Create a nav menu where each link has an animated underline that grows from left-to-right on hover and shrinks right-to-left on mouse-out. Use transform: scaleX() on a ::after pseudo-element for GPU-accelerated animation.",
    order: 14,
  },

  {
    topicGroup: "Transitions & Animations",
    slug: "how-to-use-css-animations-keyframes",
    title: "How do CSS animations and @keyframes work?",
    summary:
      "Master CSS @keyframes animations — animation-name, animation-duration, animation-iteration-count, animation-fill-mode, animation-direction, and animation shorthand.",
    seoTitle: "CSS @keyframes Animations: Complete Guide with Examples",
    seoDescription:
      "Learn CSS animations — @keyframes, animation-name, animation-duration, animation-fill-mode, animation-delay, animation-iteration-count, and animation-direction.",
    keywords: [
      "css animation",
      "css keyframes",
      "@keyframes",
      "css animation-fill-mode",
      "css animation loop",
      "css loading animation",
      "css pulse animation",
      "css spin animation",
    ],
    content: [
      `## Defining @keyframes\n\n\`\`\`css\n/* From/To — 2-state animations */\n@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(8px); }\n  to   { opacity: 1; transform: translateY(0); }\n}\n\n/* Percentage-based — multi-step */\n@keyframes pulse {\n  0%, 100% { transform: scale(1); }\n  50%       { transform: scale(1.08); }\n}\n\`\`\``,
      `## Animation Properties\n\n\`\`\`css\n.el {\n  animation-name: fadeIn;\n  animation-duration: 400ms;\n  animation-delay: 100ms;\n  animation-iteration-count: 1;        /* or infinite */\n  animation-direction: normal;         /* or reverse | alternate */\n  animation-timing-function: ease;\n\n  /* fill-mode — where does element rest when done? */\n  animation-fill-mode: none;           /* Resets to start */\n  animation-fill-mode: forwards;       /* Stays at 100% keyframe */\n  animation-fill-mode: backwards;      /* Applies 0% during delay */\n  animation-fill-mode: both;           /* Backwards + forwards */\n\n  animation-play-state: running;       /* or paused */\n\n  /* Shorthand */\n  animation: fadeIn 400ms ease 100ms both;\n  animation: spin 1s linear infinite;\n\n  /* Multiple animations */\n  animation: fadeIn 400ms ease both, float 3s ease-in-out infinite;\n}\n\`\`\``,
      `## Respecting User Motion Preferences\n\n\`\`\`css\n@media (prefers-reduced-motion: no-preference) {\n  .card { animation: float 3s ease-in-out infinite; }\n}\n\n/* Global override for reduced motion users */\n@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.01ms !important;\n  }\n}\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Essential CSS Animation Patterns",
        language: "css",
        code: `/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-in { animation: fadeIn 400ms ease both; }

/* Stagger children */
.list-item:nth-child(1) { animation-delay: 0ms; }
.list-item:nth-child(2) { animation-delay: 80ms; }
.list-item:nth-child(3) { animation-delay: 160ms; }

/* Spinner */
@keyframes spin { to { transform: rotate(360deg); } }
.spinner {
  width: 24px; aspect-ratio: 1;
  border: 3px solid #e2e8f0;
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

/* Skeleton shimmer */
@keyframes shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

/* Shake (error) */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%      { transform: translateX(-8px); }
  40%      { transform: translateX(8px); }
  60%      { transform: translateX(-5px); }
  80%      { transform: translateX(5px); }
}
.input--error { animation: shake 400ms ease; }`,
      },
    ],
    tryItChallenge:
      "Build a loading skeleton component using @keyframes shimmer with a moving linear-gradient. Then create a staggered list animation where each item fades in 80ms after the previous one. Wrap everything in a prefers-reduced-motion: no-preference media query.",
    order: 15,
  },

  // ═══════════════════════════ TOPIC 11 — TRANSFORMS ════════════════════════
  {
    topicGroup: "Transforms & Filters",
    slug: "how-to-use-css-transform",
    title: "How do CSS transforms work? (translate, scale, rotate, skew)",
    summary:
      "Master all CSS 2D and 3D transform functions — translate, scale, rotate, skew, matrix, perspective, and the new individual transform properties.",
    seoTitle: "CSS Transform: translate, scale, rotate, skew — Full Guide",
    seoDescription:
      "Learn every CSS transform function — translate, scale, rotate, skew, matrix, and 3D transforms. Includes perspective, backface-visibility, and GPU acceleration tips.",
    keywords: [
      "css transform",
      "css translate",
      "css scale",
      "css rotate",
      "css skew",
      "css 3d transform",
      "css perspective",
      "css transform-origin",
    ],
    content: [
      `## 2D Transform Functions\n\n\`\`\`css\n.el {\n  /* Move */\n  transform: translate(50px, -20px);\n  transform: translate(50%, 50%); /* % relative to element's own size */\n\n  /* Scale — 1 is original, 2 is double, 0.5 is half */\n  transform: scale(1.5);\n  transform: scale(1.2, 0.8); /* X, Y independently */\n\n  /* Rotate */\n  transform: rotate(45deg);\n  transform: rotate(0.5turn); /* 180 degrees */\n\n  /* Skew */\n  transform: skewX(15deg);\n  transform: skew(15deg, -10deg);\n\n  /* Chain multiple (applied right to left!) */\n  transform: translateY(-4px) scale(1.05) rotate(1deg);\n}\n\`\`\``,
      `## Transform Origin\n\n\`\`\`css\n.el {\n  transform-origin: center;     /* Default */\n  transform-origin: top left;\n  transform-origin: 0 0;\n  transform-origin: right bottom;\n  transform: rotate(45deg);     /* Rotates around transform-origin */\n}\n\`\`\``,
      `## 3D Transforms\n\n\`\`\`css\n.scene {\n  perspective: 800px;             /* Distance from viewer */\n}\n.card-3d {\n  transform-style: preserve-3d;  /* Children keep 3D positions */\n  transform: rotateX(20deg) rotateY(15deg);\n  backface-visibility: hidden;    /* Hide back of element when rotated */\n}\n\`\`\``,
      `## Individual Transform Properties (Modern CSS)\n\n\`\`\`css\n/* Animate each independently! */\n.el {\n  translate: 0 -4px;\n  scale: 1.1;\n  rotate: 45deg;\n  transition: translate 200ms ease, scale 300ms ease;\n}\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "CSS 3D Card Flip",
        language: "css",
        code: `.card-flip {
  perspective: 1000px;
  width: 280px;
  height: 200px;
}

.card-flip__inner {
  width: 100%; height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
}
.card-flip:hover .card-flip__inner { transform: rotateY(180deg); }

.card-flip__front,
.card-flip__back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 16px;
  display: grid;
  place-items: center;
}
.card-flip__front {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}
.card-flip__back {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
  transform: rotateY(180deg);
}`,
      },
    ],
    tryItChallenge:
      "Create a 3D card flip: front shows an icon and title, back shows description and button. Use transform-style: preserve-3d, backface-visibility: hidden, and rotateY(180deg). Add a smooth 600ms transition.",
    order: 16,
  },

  {
    topicGroup: "Transforms & Filters",
    slug: "how-to-use-css-filter-and-backdrop-filter",
    title: "How do CSS filter and backdrop-filter work?",
    summary:
      "Master CSS filter functions — blur, brightness, contrast, grayscale, saturate, hue-rotate, sepia, drop-shadow — plus backdrop-filter for glassmorphism effects.",
    seoTitle: "CSS filter & backdrop-filter: blur, grayscale, glassmorphism Guide",
    seoDescription:
      "Learn CSS filter functions — blur, brightness, contrast, grayscale, saturate, hue-rotate, drop-shadow — and backdrop-filter for glassmorphism and frosted glass effects.",
    keywords: [
      "css filter",
      "css blur",
      "css grayscale",
      "css backdrop-filter",
      "css glassmorphism",
      "css filter brightness",
      "css drop-shadow",
      "css saturate",
    ],
    content: [
      `## CSS filter Functions\n\n\`\`\`css\n.image {\n  filter: blur(4px);\n  filter: brightness(1.5);      /* >1 brighter, <1 darker */\n  filter: contrast(200%);\n  filter: grayscale(100%);\n  filter: saturate(200%);\n  filter: hue-rotate(90deg);\n  filter: invert(100%);\n  filter: sepia(80%);\n  filter: opacity(50%);\n  filter: drop-shadow(4px 4px 8px rgba(0,0,0,0.3));\n\n  /* Chain multiple */\n  filter: brightness(1.1) saturate(130%) contrast(110%);\n}\n\`\`\``,
      `## drop-shadow vs box-shadow\n\n\`drop-shadow\` (in filter) follows the **actual shape** of the element, including transparency — perfect for PNGs with transparent backgrounds.\n\n\`\`\`css\n.icon-box    { box-shadow: 4px 4px 12px rgba(0,0,0,0.3); } /* Rectangular */\n.icon-shaped { filter: drop-shadow(4px 4px 12px rgba(0,0,0,0.3)); } /* Shape-hugging */\n\`\`\``,
      `## backdrop-filter — Frosted Glass / Glassmorphism\n\n\`\`\`css\n.glass-card {\n  background: rgba(255, 255, 255, 0.2);\n  backdrop-filter: blur(12px) saturate(150%);\n  -webkit-backdrop-filter: blur(12px) saturate(150%); /* Safari */\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  border-radius: 16px;\n  /* Parent must NOT have overflow:hidden */\n}\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Glassmorphism & Hover Effects",
        language: "css",
        code: `/* Glassmorphism card */
.glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Image colour on hover */
.team-member img {
  filter: grayscale(100%);
  transition: filter 400ms ease;
}
.team-member:hover img { filter: grayscale(0%); }

/* Sticky header with blur */
.sticky-header {
  position: sticky;
  top: 0;
  background: rgba(255,255,255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0,0,0,0.08);
  z-index: 50;
}`,
      },
    ],
    tryItChallenge:
      "Create a glassmorphism hero section: blurred background image, and a floating glass card on top using backdrop-filter: blur(). Make images in the card switch from grayscale to full color on hover with a smooth transition.",
    order: 17,
  },

  // ═══════════════════════════ TOPIC 12 — OVERFLOW ══════════════════════════
  {
    topicGroup: "Overflow, Scrolling & Clipping",
    slug: "how-does-css-overflow-work",
    title: "How does CSS overflow work? (overflow, scroll, clip, hidden)",
    summary:
      "Master CSS overflow — overflow-x/y, scroll-behavior, overscroll-behavior, scrollbar-width, clip-path, and modern scroll-snap.",
    seoTitle: "CSS overflow: scroll, hidden, clip, auto — Complete Guide",
    seoDescription:
      "Learn every CSS overflow value — visible, hidden, scroll, auto, clip — plus scrollbar styling, scroll-behavior, scroll-snap, and clip-path for advanced masking.",
    keywords: [
      "css overflow",
      "css overflow hidden",
      "css overflow scroll",
      "css clip-path",
      "css scroll snap",
      "css scrollbar",
      "css text overflow ellipsis",
      "css overscroll-behavior",
    ],
    content: [
      `## overflow Property\n\n\`\`\`css\n.container {\n  overflow: visible;   /* Default — shows outside box */\n  overflow: hidden;    /* Clip content; also clears floats */\n  overflow: scroll;    /* Always show scrollbars */\n  overflow: auto;      /* Show scrollbars only when needed (RECOMMENDED) */\n  overflow: clip;      /* Like hidden but doesn't create scroll container */\n\n  overflow-x: hidden;\n  overflow-y: auto;\n}\n\`\`\``,
      `## Text Truncation\n\n\`\`\`css\n/* Single-line ellipsis */\n.truncate {\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n/* Multi-line clamp (no JS needed!) */\n.line-clamp-3 {\n  display: -webkit-box;\n  -webkit-line-clamp: 3;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}\n\`\`\``,
      `## Scroll Behaviour\n\n\`\`\`css\nhtml { scroll-behavior: smooth; }\n\n.container {\n  overscroll-behavior: contain; /* Don't propagate scroll to parent */\n  overscroll-behavior-y: none;  /* Disable pull-to-refresh on mobile */\n}\n\n/* Custom scrollbar — Webkit */\n.custom-scroll::-webkit-scrollbar { width: 6px; }\n.custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }\n\n/* Firefox */\n.custom-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }\n\`\`\``,
      `## CSS Scroll Snap\n\n\`\`\`css\n/* Horizontal carousel */\n.carousel {\n  display: flex;\n  overflow-x: auto;\n  scroll-snap-type: x mandatory;\n  gap: 16px;\n}\n.slide {\n  flex: 0 0 80%;\n  scroll-snap-align: start;\n}\n\n/* Vertical full-page scroll snap */\n.pages { height: 100svh; overflow-y: scroll; scroll-snap-type: y mandatory; }\n.page  { height: 100svh; scroll-snap-align: start; }\n\`\`\``,
      `## clip-path — Custom Shapes\n\n\`\`\`css\n.el {\n  clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%); /* Slanted bottom */\n  clip-path: polygon(50% 0%, 100% 100%, 0% 100%);     /* Triangle */\n  clip-path: circle(50% at 50% 50%);\n  clip-path: ellipse(50% 30% at 50% 50%);\n  clip-path: inset(10px 20px round 8px);\n\n  /* Animate clip-path! */\n  transition: clip-path 400ms ease;\n}\n.el:hover { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Scroll Snap Carousel",
        language: "css",
        code: `.carousel {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 16px;
  padding: 16px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
}
.carousel::-webkit-scrollbar { display: none; } /* Webkit */

.slide {
  flex: 0 0 320px;
  scroll-snap-align: start;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,.08);
}`,
      },
    ],
    tryItChallenge:
      "Build a horizontal scroll snap carousel of product cards. Each card should snap into view. Hide the scrollbar. Truncate the card description to 2 lines with -webkit-line-clamp.",
    order: 18,
  },

  // ═══════════════════════════ TOPIC 13 — CSS FUNCTIONS ════════════════════
  {
    topicGroup: "CSS Functions & Math",
    slug: "how-to-use-css-calc-min-max-clamp",
    title: "How to use CSS calc(), min(), max(), and clamp()?",
    summary:
      "Master CSS math functions — calc(), min(), max(), clamp() — for fluid layouts, dynamic sizing, and responsive design without JavaScript.",
    seoTitle: "CSS calc(), min(), max(), clamp() — Complete Math Functions Guide",
    seoDescription:
      "Learn CSS math functions — calc() for dynamic sizing, min() and max() for bounds, and clamp() for fluid responsive values. Includes real-world examples.",
    keywords: [
      "css calc",
      "css clamp",
      "css min max",
      "css math functions",
      "css fluid typography",
      "css responsive without media queries",
      "css dynamic width",
    ],
    content: [
      `## calc() — Dynamic Calculations\n\n\`\`\`css\n.sidebar { width: calc(100% - 280px); }\n.content  { height: calc(100vh - 64px); }\n.text     { font-size: calc(1rem + 0.5vw); }\n\n/* Mix with CSS variables */\n:root { --gap: 24px; --columns: 3; }\n.col { width: calc((100% - (var(--columns) - 1) * var(--gap)) / var(--columns)); }\n\n/* Spaces REQUIRED around + and - */\n/* ✅ */ calc(100% - 80px)\n/* ❌ */ calc(100%-80px) /* Invalid */\n\`\`\``,
      `## min() and max()\n\n\`\`\`css\n/* min() — returns the SMALLEST value */\n.container { width: min(90%, 1200px); }   /* Never > 1200px */\n.icon       { font-size: min(5vw, 3rem); } /* Never > 3rem */\n\n/* max() — returns the LARGEST value */\n.card { min-height: max(200px, 30vh); }   /* At least 200px */\n\n/* Combine! */\n.hero { padding: max(2rem, min(8vw, 6rem)); }\n\`\`\``,
      `## clamp() — Most Useful for Responsive Design\n\n\`clamp(min, preferred, max)\` smoothly scales between bounds:\n\n\`\`\`css\nh1 { font-size: clamp(1.75rem, 5vw, 3.5rem); }\np  { font-size: clamp(1rem, 2.5vw, 1.25rem); }\n\n.wrapper {\n  width: clamp(320px, 90%, 1200px);\n  margin-inline: auto;\n}\n\n.section { padding: clamp(2rem, 8vw, 6rem) clamp(1rem, 4vw, 3rem); }\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Fluid Design Without Media Queries",
        language: "css",
        code: `:root {
  --page-padding: clamp(1rem, 5vw, 3rem);
  --font-h1: clamp(1.75rem, 5vw + 1rem, 4rem);
  --font-h2: clamp(1.25rem, 3vw + 0.5rem, 2.5rem);
  --font-body: clamp(1rem, 1.5vw, 1.125rem);
  --max-width: 1280px;
}

.page-container {
  width: min(var(--max-width), 100% - 2 * var(--page-padding));
  margin-inline: auto;
}

/* Self-adjusting card grid */
.auto-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(min(280px, 100%), 1fr)
  );
  gap: clamp(1rem, 3vw, 2rem);
}

h1 { font-size: var(--font-h1); }
h2 { font-size: var(--font-h2); }
body { font-size: var(--font-body); }`,
      },
    ],
    tryItChallenge:
      "Build a full responsive page layout using ZERO media queries — use only clamp(), min(), max(), and calc() for typography, spacing, and the grid. The layout should be fluid between 320px and 1440px.",
    order: 19,
  },

  // ═══════════════════════════ TOPIC 14 — PSEUDO-ELEMENTS ══════════════════
  {
    topicGroup: "Pseudo-Elements & Generated Content",
    slug: "how-to-use-css-before-and-after-pseudo-elements",
    title: "How to use CSS ::before and ::after pseudo-elements?",
    summary:
      "Master CSS ::before and ::after pseudo-elements — content property, decorative shapes, icons, tooltips, clearfix, and advanced CSS art.",
    seoTitle: "CSS ::before and ::after: Complete Guide to Pseudo-Elements",
    seoDescription:
      "Learn how to use CSS ::before and ::after pseudo-elements — content property, decorative effects, tooltip triangles, badges, and the clearfix pattern.",
    keywords: [
      "css before after",
      "css pseudo-elements",
      "css ::before",
      "css ::after",
      "css content property",
      "css clearfix",
      "css tooltip arrow",
      "css decorative shapes",
    ],
    content: [
      `## The content Property\n\n\`::before\` and \`::after\` require a \`content\` property — without it, they don't render:\n\n\`\`\`css\n.el::before {\n  content: "";              /* Empty (required for decoration) */\n  content: "→";            /* Text or emoji */\n  content: attr(data-tooltip); /* Value of an HTML attribute */\n  content: counter(item);   /* CSS counter value */\n  content: none;            /* Disable inherited content */\n\n  /* Always add display for width/height */\n  display: block;\n  width: 20px;\n  height: 20px;\n}\n\`\`\``,
      `## Decorative Shapes and Icons\n\n\`\`\`css\n/* Left border accent on headings */\nh2::before {\n  content: "";\n  display: inline-block;\n  width: 4px; height: 1em;\n  background: var(--color-primary);\n  margin-right: 12px;\n  vertical-align: middle;\n}\n\n/* Quote marks */\nblockquote::before {\n  content: open-quote;\n  font-size: 4rem;\n  color: var(--color-primary);\n  line-height: 0; vertical-align: -0.5em;\n}\n\n/* Required field asterisk */\nlabel.required::after { content: " *"; color: #ef4444; }\n\n/* External link indicator */\na[href^="http"]::after { content: " ↗"; font-size: 0.8em; opacity: 0.6; }\n\`\`\``,
      `## CSS Tooltip with ::before and ::after\n\n\`\`\`css\n.tooltip { position: relative; cursor: help; }\n\n/* Tooltip bubble */\n.tooltip::before {\n  content: attr(data-tooltip);\n  position: absolute;\n  bottom: calc(100% + 8px);\n  left: 50%; transform: translateX(-50%);\n  background: #1e293b; color: white;\n  padding: 6px 12px; border-radius: 6px;\n  font-size: 0.8rem; white-space: nowrap;\n  pointer-events: none;\n  opacity: 0; transition: opacity 200ms ease;\n}\n\n/* Arrow */\n.tooltip::after {\n  content: "";\n  position: absolute;\n  bottom: calc(100% + 2px);\n  left: 50%; transform: translateX(-50%);\n  border: 6px solid transparent;\n  border-top-color: #1e293b;\n  opacity: 0; transition: opacity 200ms ease;\n}\n\n.tooltip:hover::before, .tooltip:hover::after { opacity: 1; }\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Pseudo-Element Design Patterns",
        language: "css",
        code: `/* Diagonal section divider */
.section {
  position: relative;
  padding-bottom: 80px;
}
.section::after {
  content: "";
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 80px;
  background: white;
  clip-path: polygon(0 100%, 100% 0, 100% 100%);
}

/* Card hover overlay */
.card { position: relative; overflow: hidden; }
.card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(59, 130, 246, 0.9);
  opacity: 0;
  transition: opacity 300ms ease;
  z-index: 1;
}
.card:hover::before { opacity: 1; }

/* CSS counter numbered list */
ol.fancy { counter-reset: steps; list-style: none; }
ol.fancy li { counter-increment: steps; padding-left: 48px; position: relative; }
ol.fancy li::before {
  content: counter(steps);
  position: absolute; left: 0; top: 0;
  width: 32px; height: 32px;
  background: var(--color-primary); color: white;
  border-radius: 50%; display: grid; place-items: center;
  font-weight: 700; font-size: 0.875rem;
}`,
      },
    ],
    tryItChallenge:
      "Build three UI components using only ::before and ::after: (1) a tooltip with an arrow triangle, (2) a step counter using counter-increment, (3) a card hover overlay with opacity transition.",
    order: 20,
  },

  // ═══════════════════════════ TOPIC 15 — BOX SHADOW ═══════════════════════
  {
    topicGroup: "Advanced Visual Effects",
    slug: "how-to-use-css-box-shadow",
    title: "How to use CSS box-shadow and create beautiful shadows?",
    summary:
      "Everything about CSS box-shadow — inset shadows, layered shadows, spread radius, creating depth, and neumorphism effects.",
    seoTitle: "CSS box-shadow Guide: Layered Shadows, Inset, Neumorphism",
    seoDescription:
      "Master CSS box-shadow — inset shadows, multiple layered shadows, spread radius, colored shadows, and how to create beautiful depth with neumorphism effects.",
    keywords: [
      "css box-shadow",
      "css inset shadow",
      "css layered shadows",
      "css neumorphism",
      "css shadow effect",
      "css drop shadow",
      "css elevation",
    ],
    content: [
      `## box-shadow Syntax\n\n\`\`\`css\n/* box-shadow: offset-x offset-y blur-radius spread-radius color */\n.card { box-shadow: 2px 4px 8px rgba(0,0,0,0.15); }\n\n/* offset-x: positive = right, negative = left */\n/* offset-y: positive = down, negative = up */\n/* blur-radius: higher = softer edges */\n/* spread-radius: positive = larger, negative = smaller */\n\n.outline { box-shadow: 0 0 0 2px #3b82f6; }          /* Focus ring / outline */\n.inset    { box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); } /* Inner shadow */\n\`\`\``,
      `## Layered Shadows for Depth\n\n\`\`\`css\n.elevation-1 { box-shadow: 0 1px 2px rgba(0,0,0,.05); }\n.elevation-2 { box-shadow: 0 1px 3px rgba(0,0,0,.08), 0 4px 6px rgba(0,0,0,.05); }\n.elevation-3 { box-shadow: 0 4px 6px rgba(0,0,0,.07), 0 12px 16px rgba(0,0,0,.05); }\n\n/* Coloured glow */\n.btn-primary { box-shadow: 0 4px 14px rgba(59, 130, 246, 0.5); }\n\n/* Neumorphism */\n.neumorphic {\n  background: #e8ecf1;\n  border-radius: 16px;\n  box-shadow: 8px 8px 16px #c8cdd6, -8px -8px 16px #ffffff;\n}\n.neumorphic:active {\n  box-shadow: inset 4px 4px 8px #c8cdd6, inset -4px -4px 8px #ffffff;\n}\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Shadow Token Library",
        language: "css",
        code: `:root {
  --shadow-xs:  0 1px 2px rgba(0,0,0,.04);
  --shadow-sm:  0 1px 3px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.04);
  --shadow-md:  0 4px 6px rgba(0,0,0,.06), 0 2px 4px rgba(0,0,0,.04);
  --shadow-lg:  0 10px 15px rgba(0,0,0,.07), 0 4px 6px rgba(0,0,0,.04);
  --shadow-xl:  0 20px 25px rgba(0,0,0,.08), 0 10px 10px rgba(0,0,0,.03);
  --shadow-inner: inset 0 2px 4px rgba(0,0,0,.06);
  --shadow-brand: 0 4px 14px rgba(59,130,246,.4);
}

/* Interactive card */
.card {
  box-shadow: var(--shadow-md);
  transition: box-shadow 200ms ease, transform 200ms ease;
}
.card:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-2px);
}

/* Focus ring using box-shadow */
.button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px white, 0 0 0 5px var(--color-primary);
}`,
      },
    ],
    tryItChallenge:
      "Create an interactive card: flat by default (--shadow-sm), lifts on hover (--shadow-xl) with a slight translateY(-4px). When clicked (:active), add an inset shadow to simulate pressing.",
    order: 21,
  },

  // ═══════════════════════════ TOPIC 16 — ACCESSIBILITY ════════════════════
  {
    topicGroup: "CSS Accessibility & Best Practices",
    slug: "how-to-write-accessible-css",
    title: "How to write accessible CSS? (Focus styles, screen readers, motion)",
    summary:
      "Learn CSS accessibility best practices — visible focus styles, screen-reader-only classes, prefers-reduced-motion, color contrast, and skip links.",
    seoTitle: "CSS Accessibility: Focus Styles, Screen Readers, Motion Guide",
    seoDescription:
      "Write accessible CSS — visible focus indicators, screen-reader-only patterns, prefers-reduced-motion, WCAG color contrast requirements, and accessible skip links.",
    keywords: [
      "css accessibility",
      "css focus styles",
      "css screen reader",
      "css prefers-reduced-motion",
      "css color contrast",
      "accessible css",
      "css skip link",
      "wcag css",
    ],
    content: [
      `## Never Remove Focus Outlines — Style Them\n\nFocus indicators help keyboard and switch-device users navigate. Never do \`outline: none\` without a replacement:\n\n\`\`\`css\n/* ❌ WRONG — removes accessibility */\n*:focus { outline: none; }\n\n/* ✅ Custom beautiful focus ring */\n:focus-visible {\n  outline: 2px solid #3b82f6;\n  outline-offset: 3px;\n}\n\n/* For rounded elements, use box-shadow instead */\n.btn:focus-visible {\n  outline: none;\n  box-shadow: 0 0 0 2px white, 0 0 0 4px #3b82f6;\n}\n\`\`\`\n\n\`:focus-visible\` only activates on keyboard navigation, not mouse click.`,
      `## Screen-Reader Only Class\n\n\`\`\`css\n.sr-only {\n  position: absolute;\n  width: 1px; height: 1px;\n  padding: 0; margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border: 0;\n}\n\`\`\`\n\nUse for: icon button labels, skip links, decorative descriptions.`,
      `## prefers-reduced-motion\n\n\`\`\`css\n/* Animate normally */\n.card { transition: transform 200ms ease; }\n\n/* Disable for users who prefer reduced motion */\n@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.01ms !important;\n    scroll-behavior: auto !important;\n  }\n}\n\`\`\``,
      `## Color Contrast (WCAG)\n\nMinimum contrast ratios:\n- **AA**: 4.5:1 for normal text, 3:1 for large text (18px+ or 14px bold)\n- **AAA**: 7:1 for normal text\n\nDon't rely on color alone to convey information — also use icons, patterns, or text labels.`,
      `## Skip to Main Content\n\n\`\`\`css\n.skip-link {\n  position: absolute;\n  top: -100%;\n  left: 16px;\n  padding: 8px 16px;\n  background: #1e293b;\n  color: white;\n  border-radius: 0 0 8px 8px;\n  text-decoration: none;\n  z-index: 9999;\n  transition: top 200ms ease;\n}\n.skip-link:focus { top: 0; }\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Accessibility-First CSS Patterns",
        language: "css",
        code: `/* Focus management */
*:focus-visible {
  outline: 2px solid hsl(221 83% 53%);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Screen-reader utilities */
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

/* Motion-safe animations only */
@media (prefers-reduced-motion: no-preference) {
  .animate-in {
    animation: fadeIn 400ms ease both;
  }
}

/* High-contrast text (passes WCAG AA) */
.body-text  { color: hsl(222 47% 11%); background: white; } /* ~15:1 */
.muted-text { color: hsl(215 16% 40%); background: white; } /* ~5:1 */

/* Focus-within for card interactivity */
.link-card:focus-within {
  box-shadow: 0 0 0 2px var(--color-primary);
}`,
      },
    ],
    tryItChallenge:
      "Audit your CSS for accessibility: (1) replace any :focus { outline: none } with :focus-visible, (2) add an .sr-only class and use it on an icon button, (3) wrap all animations in prefers-reduced-motion: no-preference, (4) verify all text color contrast ratios pass WCAG AA (4.5:1).",
    order: 22,
  },

  // ═══════════════════════════ TOPIC 17 — PERFORMANCE ══════════════════════
  {
    topicGroup: "CSS Performance & Architecture",
    slug: "how-to-write-performant-css",
    title: "How to write performant CSS? Best practices and optimization tips",
    summary:
      "CSS performance best practices — GPU-accelerated properties, will-change, contain, critical CSS, selector performance, and architecture patterns.",
    seoTitle: "CSS Performance: will-change, contain, GPU Acceleration Guide",
    seoDescription:
      "Learn CSS performance optimization — which properties trigger layout/paint/composite, will-change, CSS contain, critical CSS inlining, and selector best practices.",
    keywords: [
      "css performance",
      "css optimization",
      "css will-change",
      "css contain",
      "gpu accelerated css",
      "critical css",
      "css selector performance",
      "css best practices",
    ],
    content: [
      `## The Rendering Pipeline\n\n| Layer | Properties | Cost |\n|---|---|---|\n| **Layout (Reflow)** | \`width\`, \`height\`, \`margin\`, \`padding\`, \`display\`, \`position\` | 🔴 Expensive |\n| **Paint** | \`color\`, \`background\`, \`border-color\`, \`box-shadow\` | 🟡 Moderate |\n| **Composite** | \`transform\`, \`opacity\` | 🟢 Cheap (GPU) |\n\n**Performance Rule: Animate only \`transform\` and \`opacity\` whenever possible.**`,
      `## will-change — Promote to GPU Layer\n\n\`\`\`css\n.animated-card {\n  will-change: transform; /* Creates a GPU layer */\n}\n\n/* Use sparingly — too many GPU layers = more memory */\n/* Valid values */\nwill-change: auto;           /* Default */\nwill-change: scroll-position;\nwill-change: transform;\nwill-change: opacity;\nwill-change: transform, opacity;\n\n/* ❌ NEVER do this — memory hog */\n* { will-change: transform; }\n\`\`\``,
      `## CSS contain — Limit Rendering Scope\n\n\`\`\`css\n.widget {\n  contain: strict;   /* All containments */\n  contain: content;  /* layout + paint + style */\n  contain: layout;   /* Internal layout doesn't affect outside */\n  contain: paint;    /* Children won't render outside this box */\n}\n\n/* Skip rendering off-screen content */\n.section-below-fold {\n  content-visibility: auto;\n  contain-intrinsic-size: 0 800px; /* Estimated size for scroll position */\n}\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Performance-Optimised Animation",
        language: "css",
        code: `/* ✅ GPU-accelerated — only uses transform + opacity */
@keyframes slideIn {
  from { transform: translateX(-100%); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
}

/* ❌ Performance-heavy — triggers layout on every frame */
@keyframes bad-slide {
  from { left: -100%; }
  to   { left: 0; }
}

/* Promote elements before animation */
.heavy-animation { will-change: transform, opacity; }

/* Skip off-screen blog post rendering */
.blog-post {
  content-visibility: auto;
  contain-intrinsic-size: 0 300px;
}

/* Force hardware acceleration for parallax */
.parallax {
  transform: translateZ(0);
  backface-visibility: hidden;
}`,
      },
    ],
    tryItChallenge:
      "Audit an animation in your CSS: find one that animates width/height/top/left. Replace it with an equivalent transform-based animation and measure the difference using browser DevTools Performance tab.",
    order: 23,
  },

  // ═══════════════════════════ TOPIC 18 — MODERN CSS ════════════════════════
  {
    topicGroup: "Modern CSS Features",
    slug: "what-is-css-nesting",
    title: "What is CSS Nesting and how do you use it?",
    summary:
      "Learn native CSS Nesting — the new browser-native feature that lets you nest selectors like Sass, without a preprocessor.",
    seoTitle: "CSS Nesting: Native Sass-like Nesting Without a Preprocessor",
    seoDescription:
      "Learn CSS native nesting — write nested selectors directly in CSS like Sass, without a preprocessor. Includes syntax, the & selector, and nested media queries.",
    keywords: [
      "css nesting",
      "css native nesting",
      "css & selector",
      "css sass nesting",
      "css nested selectors",
      "css without preprocessor",
    ],
    content: [
      `## Native CSS Nesting (Chrome 112+, Firefox 117+, Safari 16.5+)\n\n\`\`\`css\n/* OLD — without nesting */\n.card { padding: 24px; }\n.card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.1); }\n.card .title { font-size: 1.25rem; }\n\n/* ✅ NEW — with native CSS nesting */\n.card {\n  padding: 24px;\n\n  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,.1); }\n\n  .title {\n    font-size: 1.25rem;\n    span { color: blue; }\n  }\n\n  /* Nest media queries! */\n  @media (min-width: 768px) { padding: 32px; }\n}\n\`\`\``,
      `## The & Selector\n\n\`\`\`css\n.button {\n  background: blue;\n\n  &.is-large  { font-size: 1.25rem; }\n  &.is-danger { background: red; }\n  &.active    { background: darkblue; }\n\n  /* Parent selector: .dark-theme .button */\n  .dark-theme & { background: navy; }\n\n  &:is(a, button):hover { opacity: 0.8; }\n}\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Navigation Component with Nesting",
        language: "css",
        code: `.nav {
  display: flex;
  align-items: center;
  gap: 4px;

  &__logo {
    font-weight: 700;
    font-size: 1.25rem;
    margin-right: auto;
  }

  &__link {
    position: relative;
    padding: 8px 12px;
    border-radius: 8px;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 200ms ease, background-color 200ms ease;

    &:hover {
      color: var(--color-text);
      background: var(--color-surface);
    }

    &.active { color: var(--color-accent); }

    &::after {
      content: "";
      position: absolute;
      bottom: 0; left: 12px; right: 12px;
      height: 2px;
      background: currentColor;
      border-radius: 1px;
      transform: scaleX(0);
      transition: transform 200ms ease;
    }

    &.active::after { transform: scaleX(1); }
  }

  @media (max-width: 640px) {
    flex-direction: column;
    &__link { width: 100%; }
  }
}`,
      },
    ],
    tryItChallenge:
      "Refactor a BEM-style component stylesheet to use native CSS nesting. Convert all .block__element and .block--modifier selectors into nested form. Nest responsive media queries inside the component rule.",
    order: 24,
  },

  {
    topicGroup: "Modern CSS Features",
    slug: "how-to-use-css-has-selector",
    title: "How to use the CSS :has() selector — the parent selector?",
    summary:
      "The CSS :has() relational pseudo-class — the long-awaited parent selector. Practical use cases, browser support, and performance considerations.",
    seoTitle: "CSS :has() Selector: The Parent Selector Explained",
    seoDescription:
      "Learn the CSS :has() pseudo-class — the parent selector. Style parent elements based on their children, with practical examples and real-world use cases.",
    keywords: [
      "css :has()",
      "css parent selector",
      "css has selector",
      "css relational pseudo-class",
      "css :has() examples",
      "style parent in css",
    ],
    content: [
      `## What is :has()?\n\n\`:has()\` selects an element **if it contains** a matching descendant — the long-awaited CSS parent selector:\n\n\`\`\`css\n/* <figure> that contains an <img> */\nfigure:has(img) { border-radius: 12px; overflow: hidden; }\n\n/* <label> that contains a checked checkbox */\nlabel:has(input:checked) { font-weight: bold; color: blue; }\n\n/* <section> with a direct <h2> child */\nsection:has(> h2) { padding-top: 32px; }\n\n/* Card that contains a .badge */\n.card:has(.badge) { border-color: #f59e0b; }\n\`\`\``,
      `## Real-World :has() Patterns\n\n\`\`\`css\n/* Disable submit button when form has invalid fields */\nform:has(input:invalid) .submit-btn { opacity: 0.5; pointer-events: none; }\n\n/* Change grid when featured item exists */\n.grid:has(.card--featured) { grid-template-columns: 2fr 1fr; }\n\n/* Different padding based on image presence */\n.hero:has(img)      { padding: 40px; }\n.hero:not(:has(img)){ padding: 80px; }\n\n/* Floating label pattern */\n.input-group:has(input:focus) label,\n.input-group:has(input:not(:placeholder-shown)) label {\n  top: 0;\n  font-size: 0.75rem;\n  color: var(--color-accent);\n}\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Adaptive Layout with :has()",
        language: "css",
        code: `/* Auto-adapt grid column count based on number of posts */
.posts-grid { display: grid; gap: 24px; }

/* 1 column by default */
.posts-grid { grid-template-columns: 1fr; }

/* 2 columns when there are 2+ posts */
.posts-grid:has(.post:nth-child(2)) {
  grid-template-columns: 1fr 1fr;
}

/* 3 columns when there are 3+ posts */
.posts-grid:has(.post:nth-child(3)) {
  grid-template-columns: repeat(3, 1fr);
}

/* Floating label input */
.input-group {
  position: relative;
}
.input-group label {
  position: absolute;
  top: 50%; left: 12px;
  transform: translateY(-50%);
  transition: all 200ms ease;
  pointer-events: none;
  color: var(--color-text-muted);
}
.input-group:has(input:focus),
.input-group:has(input:not(:placeholder-shown)) {
  & label {
    top: 0;
    font-size: 0.75rem;
    color: var(--color-accent);
    background: white;
    padding: 0 4px;
  }
}`,
      },
    ],
    tryItChallenge:
      "Create a form that uses :has() to: (1) add a green border around a .form-group when its input is valid, (2) show error messages when input is invalid AND has content (:not(:placeholder-shown):invalid), (3) disable the submit button styling when any input is invalid.",
    order: 25,
  },

  {
    topicGroup: "Modern CSS Features",
    slug: "how-to-use-css-layers-and-cascade",
    title: "How do CSS @layer and cascade layers work?",
    summary:
      "Master CSS @layer — cascade layers for managing specificity, ordering third-party CSS, and building maintainable large-scale stylesheets.",
    seoTitle: "CSS @layer Cascade Layers: Specificity Management Guide",
    seoDescription:
      "Learn CSS cascade layers with @layer — manage specificity without !important, control third-party CSS order, and build scalable maintainable stylesheets.",
    keywords: [
      "css @layer",
      "css cascade layers",
      "css specificity management",
      "css layers",
      "css scalable architecture",
    ],
    content: [
      `## What are CSS Cascade Layers?\n\n\`@layer\` groups styles into **named layers**. Layers declared later win over earlier ones, **regardless of specificity**:\n\n\`\`\`css\n/* Define layer order — later layers win */\n@layer reset, base, tokens, components, utilities, overrides;\n\n@layer reset {\n  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\n}\n\n@layer components {\n  /* Low specificity class still beats reset+base because layers are ordered */\n  .card { background: white; border-radius: 12px; }\n}\n\n@layer utilities {\n  /* Utilities ALWAYS win over component rules */\n  .hidden { display: none; }\n}\n\`\`\``,
      `## Managing Third-Party CSS\n\n\`\`\`css\n/* Wrap third-party library in its own layer — easy to override */\n@import url('third-party.css') layer(vendor);\n@import url('my-styles.css')   layer(app);\n\n/* Declare order: app always wins over vendor */\n@layer vendor, app;\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Scalable CSS Layer Architecture",
        language: "css",
        code: `/* ── Layer Declaration ─────────────── */
@layer
  reset,       /* Browser overrides */
  base,        /* HTML element defaults */
  tokens,      /* CSS variables / design tokens */
  layout,      /* Page structure */
  components,  /* Reusable UI */
  utilities,   /* Single-purpose helpers */
  overrides;   /* One-off fixes */

/* ── Reset ──────────────────────────── */
@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }
  img, video, svg { max-width: 100%; display: block; }
}

/* ── Tokens ─────────────────────────── */
@layer tokens {
  :root {
    --color-primary: hsl(221 83% 53%);
    --space-4: 1rem;
    --radius-md: 8px;
  }
}

/* ── Components ─────────────────────── */
@layer components {
  .card { background: white; padding: var(--space-4); border-radius: var(--radius-md); }
  .btn  { padding: 8px 16px; border-radius: var(--radius-md); cursor: pointer; }
}

/* ── Utilities ──────────────────────── */
@layer utilities {
  .mt-4 { margin-top: var(--space-4); }
  .text-center { text-align: center; }
  .hidden { display: none; }
}`,
      },
    ],
    tryItChallenge:
      "Set up a CSS architecture with 4 @layer declarations: reset, base, components, and utilities. Inside components, add a .card style. Inside utilities, add .bg-red that overrides the card background — prove it works without !important.",
    order: 26,
  },

  // ═══════════════════════════ TOPIC 19 — BLEND MODES ═══════════════════════
  {
    topicGroup: "Advanced Visual Effects",
    slug: "how-to-use-css-blend-modes",
    title: "How do CSS mix-blend-mode and background-blend-mode work?",
    summary:
      "Master CSS blend modes — mix-blend-mode and background-blend-mode — with all blend mode values and practical creative effects.",
    seoTitle: "CSS mix-blend-mode & background-blend-mode: Complete Guide",
    seoDescription:
      "Learn CSS blend modes — mix-blend-mode and background-blend-mode — all values explained (multiply, screen, overlay, etc.) with practical design effects.",
    keywords: [
      "css mix-blend-mode",
      "css blend modes",
      "css background-blend-mode",
      "css multiply",
      "css screen blend",
      "css overlay blend",
      "css creative effects",
      "css duotone",
    ],
    content: [
      `## mix-blend-mode\n\nControls how an element blends with what's below it in the stacking context:\n\n\`\`\`css\n.el {\n  mix-blend-mode: normal;      /* No blending (default) */\n  mix-blend-mode: multiply;    /* Darken — white becomes transparent */\n  mix-blend-mode: screen;      /* Brighten — black becomes transparent */\n  mix-blend-mode: overlay;     /* Contrast — multiply dark, screen light */\n  mix-blend-mode: darken;      /* Keep darkest channel */\n  mix-blend-mode: lighten;     /* Keep lightest channel */\n  mix-blend-mode: color-dodge; /* Brighten based on blend color */\n  mix-blend-mode: color-burn;  /* Darken based on blend color */\n  mix-blend-mode: hard-light;\n  mix-blend-mode: soft-light;  /* Gentle contrast */\n  mix-blend-mode: difference;  /* Inverts based on difference */\n  mix-blend-mode: exclusion;\n  mix-blend-mode: hue;         /* Hue of blend layer */\n  mix-blend-mode: saturation;  /* Saturation of blend layer */\n  mix-blend-mode: color;       /* Hue + saturation */\n  mix-blend-mode: luminosity;  /* Brightness */\n}\n\`\`\``,
      `## background-blend-mode\n\nControls how multiple backgrounds on the **same element** blend with each other:\n\n\`\`\`css\n.el {\n  background:\n    linear-gradient(to bottom, rgba(59,130,246,0.8), rgba(59,130,246,0.3)),\n    url('/photo.jpg');\n  background-blend-mode: multiply;\n}\n\`\`\``,
    ],
    codeSnippets: [
      {
        title: "Blend Mode Creative Effects",
        language: "css",
        code: `/* Duotone photo effect */
.duotone { position: relative; }
.duotone img { filter: grayscale(100%); }
.duotone::after {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  mix-blend-mode: color;
}

/* Knockout text on image */
.knockout {
  background: url('/hero.jpg') center/cover;
  display: grid;
  place-items: center;
}
.knockout h1 {
  color: white;
  font-size: 8rem;
  font-weight: 900;
  mix-blend-mode: multiply;
  background: white;
  padding: 0 0.25em;
}

/* Colour overlay on photo hover */
.photo-card { position: relative; overflow: hidden; }
.photo-card::after {
  content: "";
  position: absolute; inset: 0;
  background: hsl(221 83% 53%);
  mix-blend-mode: multiply;
  opacity: 0;
  transition: opacity 300ms ease;
}
.photo-card:hover::after { opacity: 0.7; }`,
      },
    ],
    tryItChallenge:
      "Create a duotone image effect using filter: grayscale() on an image and a ::after pseudo-element with mix-blend-mode: color. Then try multiply, overlay, and screen blend modes and observe the differences.",
    order: 27,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
async function seedCSSCourse() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(
      "✅ Connected to MongoDB:",
      MONGO_URI.replace(/:[^:@]+@/, ":****@")
    );

    // ── 1. Delete existing CSS course ─────────────────────────────────────
    const existing = await Course.findOne({ slug: COURSE.slug });
    if (existing) {
      console.log(
        `🗑  Found existing CSS course — deleting chapters and course…`
      );
      await Chapter.deleteMany({ course: existing._id });
      await Course.deleteOne({ _id: existing._id });
      console.log("   Done deleting.");
    }

    // ── 2. Create course ──────────────────────────────────────────────────
    console.log("📚 Creating CSS Mastery course…");
    const course = await Course.create(COURSE);
    console.log(`   Course created: "${course.title}" (${course._id})`);

    // ── 3. Create chapters in batches ─────────────────────────────────────
    const BATCH_SIZE = 5;
    let created = 0;

    for (let i = 0; i < CHAPTERS.length; i += BATCH_SIZE) {
      const batch = CHAPTERS.slice(i, i + BATCH_SIZE);
      const docs = batch.map(({ topicGroup, ...rest }) => ({
        ...rest,
        course: course._id,
      }));

      await Chapter.insertMany(docs);
      created += docs.length;
      const pct = Math.round((created / CHAPTERS.length) * 100);
      console.log(
        `   Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${docs.length} chapters` +
          ` (${created}/${CHAPTERS.length} — ${pct}%)`
      );
    }

    console.log(`\n✅ CSS Mastery course seeded successfully!`);
    console.log(`   Total chapters: ${created}`);
    console.log(`   Topics covered:`);

    const groups = [...new Set(CHAPTERS.map((c) => c.topicGroup))];
    groups.forEach((g) => {
      const count = CHAPTERS.filter((c) => c.topicGroup === g).length;
      console.log(
        `     • ${g} (${count} chapter${count > 1 ? "s" : ""})`
      );
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding CSS course:", err.message || err);
    process.exit(1);
  }
}

seedCSSCourse();
