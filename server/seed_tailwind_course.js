import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Course from "./src/models/Course.js";
import Chapter from "./src/models/Chapter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, ".env") });

const MONGO_URI = process.env.MONGO_URI;

// Course Data
const courseData = {
  slug: "tailwind-css-mastery",
  title: "Tailwind CSS Mastery",
  subtitle: "The complete, in-depth guide to building modern, responsive UI with Tailwind CSS.",
  techId: "tailwindcss", // this ties it to the TailwindCSS topic/category if it exists
  level: "Beginner - Advanced",
  duration: "Self-paced (10+ hours)",
  thumbnail: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg",
  learningOutcomes: [
    "Master the utility-first CSS workflow",
    "Build complex, responsive layouts with Flexbox and Grid",
    "Implement dark mode and interactive states effortlessly",
    "Customize the Tailwind configuration to match your brand",
    "Optimize CSS for production with the JIT compiler"
  ],
  order: 5,
  status: "published"
};

// Chapters Data
const chaptersData = [
  {
    slug: "introduction-to-tailwind",
    title: "1. Introduction to Tailwind CSS",
    summary: "Understand what Tailwind is and why utility-first CSS is a game-changer.",
    content: [
      "## What is Tailwind CSS?",
      "Tailwind CSS is a utility-first CSS framework packed with classes like `flex`, `pt-4`, `text-center`, and `rotate-90` that can be composed to build any design, directly in your markup.",
      "Unlike traditional frameworks like Bootstrap or Foundation, Tailwind doesn't give you pre-styled components (like cards or buttons). Instead, it gives you low-level utility classes that let you build completely custom designs without ever leaving your HTML.",
      "## Why Utility-First?",
      "1. **You aren't inventing class names.** No more agonizing over naming a wrapper `sidebar-inner-wrapper`.\n2. **Your CSS stops growing.** Traditional CSS grows every time you add a new feature. With utilities, everything is reusable.\n3. **Making changes feels safer.** CSS is global. You never know what you're breaking when you change it. Utility classes in your HTML are local—changing them only affects that specific element."
    ],
    codeSnippets: [
      {
        title: "Traditional vs Tailwind",
        language: "html",
        code: `<!-- Traditional HTML + CSS -->
<div class="chat-notification">
  <div class="chat-notification-logo-wrapper">
    <img class="chat-notification-logo" src="/logo.svg" alt="ChitChat Logo">
  </div>
  <div class="chat-notification-content">
    <h4 class="chat-notification-title">ChitChat</h4>
    <p class="chat-notification-message">You have a new message!</p>
  </div>
</div>

<!-- Tailwind CSS -->
<div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
  <div class="shrink-0">
    <img class="h-12 w-12" src="/logo.svg" alt="ChitChat Logo">
  </div>
  <div>
    <div class="text-xl font-medium text-black">ChitChat</div>
    <p class="text-slate-500">You have a new message!</p>
  </div>
</div>`
      }
    ],
    language: "html",
    tryItChallenge: "Try converting a simple button with custom CSS into a Tailwind-styled button using utilities like `bg-blue-500`, `text-white`, `px-4`, `py-2`, and `rounded`.",
    order: 1
  },
  {
    slug: "core-concepts",
    title: "2. Core Concepts: Hover, Focus, and Responsive Design",
    summary: "Learn how to handle pseudo-classes and build responsive interfaces without writing media queries.",
    content: [
      "## Responsive Design",
      "Tailwind uses an intuitive screen-size modifier system. Every utility class can be applied conditionally at different breakpoints.",
      "The default breakpoints are:\n- `sm`: 640px\n- `md`: 768px\n- `lg`: 1024px\n- `xl`: 1280px\n- `2xl`: 1536px",
      "To add a utility but only have it take effect at a certain breakpoint, prefix the utility with the breakpoint name, followed by the `:` character: e.g., `md:w-32`.",
      "## Hover, Focus, and Active States",
      "Similar to responsive design, you can style elements on hover, focus, active, and other states using modifiers like `hover:`, `focus:`, and `active:`."
    ],
    codeSnippets: [
      {
        title: "Responsive Profile Card",
        language: "html",
        code: `<div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
  <div class="md:flex">
    <div class="md:shrink-0">
      <img class="h-48 w-full object-cover md:h-full md:w-48" src="/profile.jpg" alt="Profile">
    </div>
    <div class="p-8">
      <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Case study</div>
      <a href="#" class="block mt-1 text-lg leading-tight font-medium text-black hover:underline">Finding customers for your new business</a>
      <p class="mt-2 text-slate-500">Getting a new business off the ground is a lot of hard work. Here are five ideas you can use to find your first customers.</p>
    </div>
  </div>
</div>`
      },
      {
        title: "Interactive Button",
        language: "html",
        code: `<button class="bg-violet-500 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300 rounded text-white px-4 py-2">
  Save changes
</button>`
      }
    ],
    language: "html",
    tryItChallenge: "Create a box that is red on mobile, blue on tablets (`md`), and green on desktop (`lg`). Make it change to yellow when hovered.",
    order: 2
  },
  {
    slug: "flexbox-and-grid",
    title: "3. Layout: Flexbox and Grid",
    summary: "Master modern layouts using Tailwind's Flexbox and CSS Grid utilities.",
    content: [
      "## Flexbox",
      "Tailwind provides a comprehensive set of utilities for Flexbox. You start by applying `flex` to a container. Then, use utilities like `flex-row`, `flex-col`, `justify-between`, `items-center`, and `gap-4` to control the layout of its children.",
      "## CSS Grid",
      "For two-dimensional layouts, CSS Grid is incredibly powerful. Use `grid` to create a grid container, and `grid-cols-{n}` to specify the number of columns.",
      "You can also control the span of child elements using `col-span-{n}`."
    ],
    codeSnippets: [
      {
        title: "Flexbox Navigation",
        language: "html",
        code: `<nav class="flex items-center justify-between flex-wrap bg-teal-500 p-6">
  <div class="flex items-center shrink-0 text-white mr-6">
    <span class="font-semibold text-xl tracking-tight">Tailwind UI</span>
  </div>
  <div class="flex space-x-4">
    <a href="#" class="text-teal-200 hover:text-white">Docs</a>
    <a href="#" class="text-teal-200 hover:text-white">Examples</a>
    <a href="#" class="text-teal-200 hover:text-white">Blog</a>
  </div>
</nav>`
      },
      {
        title: "CSS Grid Dashboard",
        language: "html",
        code: `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div class="bg-white p-4 shadow rounded col-span-1 md:col-span-2">Main Chart</div>
  <div class="bg-white p-4 shadow rounded">Stats</div>
  <div class="bg-white p-4 shadow rounded">Recent Users</div>
  <div class="bg-white p-4 shadow rounded">Activity</div>
  <div class="bg-white p-4 shadow rounded">System Health</div>
</div>`
      }
    ],
    language: "html",
    tryItChallenge: "Build a photo gallery layout that has 1 column on mobile, 2 columns on tablet, and 4 columns on desktop using CSS Grid.",
    order: 3
  },
  {
    slug: "typography-and-colors",
    title: "4. Typography and Colors",
    summary: "Style text and manage color palettes like a pro.",
    content: [
      "## Typography Utilities",
      "Tailwind includes utilities for nearly every typographic property:\n- **Font Size:** `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, etc.\n- **Font Weight:** `font-light`, `font-normal`, `font-medium`, `font-bold`\n- **Text Alignment:** `text-left`, `text-center`, `text-right`\n- **Line Height (Leading):** `leading-tight`, `leading-snug`, `leading-relaxed`, `leading-loose`",
      "## Color Palette",
      "Tailwind comes with an expertly crafted default color palette. Colors are named consistently (e.g., `slate`, `red`, `blue`, `emerald`) and scaled from 50 (lightest) to 900/950 (darkest).",
      "You can apply colors to text (`text-blue-500`), backgrounds (`bg-red-100`), borders (`border-emerald-300`), and more."
    ],
    codeSnippets: [
      {
        title: "Typography Example",
        language: "html",
        code: `<div class="max-w-prose mx-auto text-slate-700">
  <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">The art of typography in Tailwind</h1>
  <p class="text-lg leading-relaxed mb-6">
    Tailwind makes it incredibly easy to create beautiful, readable text. By combining different sizes, weights, and colors, you can establish a clear visual hierarchy.
  </p>
  <blockquote class="border-l-4 border-indigo-500 pl-4 italic text-slate-600">
    "Good design is obvious. Great design is transparent." - Joe Sparano
  </blockquote>
</div>`
      }
    ],
    language: "html",
    tryItChallenge: "Create a blog post heading with a large, bold, dark-gray title, a smaller, lighter-gray subtitle, and a primary-colored author name.",
    order: 4
  },
  {
    slug: "customization-and-dark-mode",
    title: "5. Customization and Dark Mode",
    summary: "Extend Tailwind's default theme and implement first-class dark mode support.",
    content: [
      "## Dark Mode",
      "Tailwind includes a `dark` variant that lets you style your site differently when dark mode is enabled.",
      "To use it, just prefix your utilities with `dark:`. For example, `bg-white dark:bg-slate-900`.",
      "You can configure dark mode to trigger automatically based on the user's OS preference, or manually via a class on the `<html>` element.",
      "## Customizing the Theme",
      "You can customize your design system entirely from the `tailwind.config.js` file. You can add custom colors, fonts, breakpoints, and more.",
      "If you extend the theme, you keep the default utilities and add your own. If you overwrite it, you replace the defaults."
    ],
    codeSnippets: [
      {
        title: "Dark Mode Card",
        language: "html",
        code: `<div class="bg-white dark:bg-slate-800 rounded-lg px-6 py-8 ring-1 ring-slate-900/5 shadow-xl">
  <div>
    <span class="inline-flex items-center justify-center p-2 bg-indigo-500 rounded-md shadow-lg">
      <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><!-- ... --></svg>
    </span>
  </div>
  <h3 class="text-slate-900 dark:text-white mt-5 text-base font-medium tracking-tight">Writes Upside-Down</h3>
  <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm">
    The Zero Gravity Pen can be used to write in any orientation, including upside-down. It even works in outer space.
  </p>
</div>`
      },
      {
        title: "tailwind.config.js Example",
        language: "javascript",
        code: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js}'],
  darkMode: 'class', // Enable manual dark mode toggle
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#3fbaeb',
          DEFAULT: '#0fa9e6',
          dark: '#0c87b8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    }
  }
}`
      }
    ],
    language: "html",
    tryItChallenge: "Extend your `tailwind.config.js` with a custom color named 'midnight' and a custom font. Then create a component using `bg-midnight` and dark mode variants.",
    order: 5
  },
  {
    slug: "extracting-components-and-production",
    title: "6. Extracting Components & Production Prep",
    summary: "Learn when to extract components using @apply and how Tailwind optimizes for production.",
    content: [
      "## When to Extract Components?",
      "While utility-first is great, sometimes you have highly reusable elements (like buttons) where repeating 10 classes everywhere is annoying.",
      "You can use Tailwind's `@apply` directive to extract common utility patterns into custom CSS classes.",
      "**Warning:** Don't overuse `@apply`. It defeats the purpose of utility-first CSS. Only use it for highly reusable, small components.",
      "## Production Optimization",
      "Tailwind generates thousands of utility classes, which would result in a massive CSS file. However, in production, Tailwind's compiler scans your HTML/JS files, detects exactly which classes you actually used, and only includes those.",
      "This means your production CSS file is often incredibly small (usually under 10kb compressed)."
    ],
    codeSnippets: [
      {
        title: "Using @apply in CSS",
        language: "css",
        code: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75;
  }
}`
      },
      {
        title: "Using the Custom Class",
        language: "html",
        code: `<button class="btn-primary">
  Click Me
</button>

<button class="btn-primary flex items-center gap-2">
  <svg>...</svg>
  With Icon
</button>`
      }
    ],
    language: "css",
    tryItChallenge: "Create an `.input-field` component class using `@apply` that includes borders, padding, focus rings, and error state utilities.",
    order: 6
  }
];

async function seedCourse() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB at:", MONGO_URI);

    // Check if course already exists
    let course = await Course.findOne({ slug: courseData.slug });
    if (course) {
      console.log("Course already exists. Deleting it and its chapters to re-seed...");
      await Chapter.deleteMany({ course: course._id });
      await Course.deleteOne({ _id: course._id });
    }

    console.log("Creating new course...");
    course = await Course.create(courseData);
    console.log("Course created:", course.title, `(${course._id})`);

    console.log("Creating chapters...");
    for (const chapterData of chaptersData) {
      const chapter = await Chapter.create({
        ...chapterData,
        course: course._id,
      });
      console.log(`Created chapter ${chapter.order}: ${chapter.title}`);
    }

    console.log("Successfully seeded Tailwind CSS course!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedCourse();
