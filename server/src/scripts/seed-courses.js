/**
 * Seeder script — seeds static tutorial content into MongoDB
 * Run: node src/scripts/seed-courses.js
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import Cheatsheet from "../models/Cheatsheet.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const COURSES_SEED = [
  {
    slug: "reactjs",
    title: "React.js Complete Course: Zero to Mastery",
    techId: "reactjs",
    subtitle:
      "Learn modern React with Hooks, JSX, Components, State, Context API and Performance Optimization.",
    level: "Beginner - Advanced",
    duration: "3.5 Hours",
    order: 1,
    learningOutcomes: [
      "Master JSX syntax rules and component composition",
      "Manage interactive state safely with useState",
      "Control side effects and async API calls with useEffect",
      "Architect global state without prop drilling using Context API",
      "Write high performance React applications with clean code patterns",
    ],
    chapters: [
      {
        slug: "ch-1-intro-jsx",
        title: "1. Introduction to ReactJS & JSX Mechanics",
        summary: "Understand React's component-driven architecture, the Virtual DOM, and JSX syntax rules.",
        content: [
          "# Understanding React Architecture & JSX\n\nReact is an open-source, component-driven JavaScript library built by Meta for crafting dynamic, responsive user interfaces. Unlike traditional imperative DOM manipulation where developers manually target and mutate HTML elements, React introduces a ==declarative model== where you describe what the UI should look like for a given state.",
          "## What is JSX?\n\nJSX (JavaScript XML) is a syntax extension for JavaScript that allows you to write HTML-like markup directly inside your JS code. Under the hood, Babel compiles JSX into regular `React.createElement()` function calls.",
          "### Key Rules of JSX:\n\n1. **Single Root Element**: Every component must return a single root element or Fragment `<>...</>`.\n2. **Close All Tags**: All tags must be explicitly closed, including self-closing tags like `<img />` and `<input />`.\n3. **camelCase Attributes**: Use `className` instead of `class`, `htmlFor` instead of `for`, and `onClick` instead of `onclick`.",
          "```jsx\n// React 18+ App Bootstrapping & Declarative Component\nimport { createRoot } from 'react-dom/client';\n\nfunction WelcomeHeader({ username, role }) {\n  const isOnline = true;\n  return (\n    <header className=\"p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl shadow-lg\">\n      <h1 className=\"text-2xl font-black\">Welcome back, {username}!</h1>\n      <p className=\"text-sm opacity-90 mt-1\">Role: <mark>{role}</mark></p>\n    </header>\n  );\n}\n\nconst root = createRoot(document.getElementById('root'));\nroot.render(<WelcomeHeader username=\"Asif\" role=\"Senior Developer\" />);\n```",
        ],
        codeSnippet: `import { createRoot } from "react-dom/client";

function WelcomeHeader({ username, role }) {
  return (
    <header className="p-6 bg-blue-600 text-white rounded-3xl">
      <h1 className="text-2xl font-black">Welcome back, {username}!</h1>
      <p className="text-sm mt-1">Role: {role}</p>
    </header>
  );
}`,
        language: "jsx",
        tryItChallenge: "Create a functional component that accepts a `title` and `badgeText` prop and renders a styled banner.",
        order: 0,
      },
      {
        slug: "ch-2-components-props",
        title: "2. Reusable Components & Prop Composition",
        summary: "Build modular UI hierarchies with read-only props, default props, and children composition.",
        content: [
          "# Building Modular UIs with Components & Props\n\nComponents are the fundamental building blocks of a React application. They split the UI into independent, reusable pieces that accept inputs called ==props== (short for properties).",
          "## Props are Immutable\n\nProps are **read-only**. A component must never modify its own props. If data needs to change over time in response to user interaction, that data must live in ==State==.",
          "### The Children Prop\n\nReact provides a special prop called `children` that allows components to accept nested JSX elements, creating flexible container components.",
          "```jsx\n// Reusable Card Component with Composition & Children Props\nfunction StatCard({ title, badge, children }) {\n  return (\n    <div className=\"p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 space-y-3\">\n      <div className=\"flex items-center justify-between\">\n        <h3 className=\"font-extrabold text-base text-zinc-900 dark:text-white\">{title}</h3>\n        {badge && (\n          <span className=\"px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold\">\n            {badge}\n          </span>\n        )}\n      </div>\n      <div className=\"text-xs text-zinc-600 dark:text-zinc-300 font-medium\">\n        {children}\n      </div>\n    </div>\n  );\n}\n\nexport default function DashboardMetrics() {\n  return (\n    <div className=\"grid grid-cols-1 sm:grid-cols-2 gap-4\">\n      <StatCard title=\"Active Users\" badge=\"Live\">\n        <p className=\"text-lg font-black text-blue-600\">1,420 Users</p>\n        <p className=\"text-zinc-400 mt-1\">==+12% increase== from last week</p>\n      </StatCard>\n    </div>\n  );\n}\n```",
        ],
        codeSnippet: `function StatCard({ title, children }) {
  return (
    <div className="p-5 bg-white rounded-2xl shadow-sm">
      <h3 className="font-bold">{title}</h3>
      <div>{children}</div>
    </div>
  );
}`,
        language: "jsx",
        tryItChallenge: "Build a `Button` component that accepts `variant` ('primary' or 'secondary') and `children` props.",
        order: 1,
      },
      {
        slug: "ch-3-usestate-forms",
        title: "3. Interactive State & Form Handling with useState",
        summary: "Master component local state, functional updates, controlled inputs, and state immutability.",
        content: [
          "# Managing Interactive State with useState\n\nState allows React components to remember information between renders. The `useState` hook provides a reactive state variable and an updater function.",
          "## Immutability Rule\n\nNever mutate state directly (e.g. `user.name = 'John'`). Always pass a ==new object or array== to the setter function so React detects the change and triggers a re-render.",
          "### Functional State Updaters\n\nWhen updating state based on previous state, always use the functional syntax: `setCount(prev => prev + 1)`.",
          "```jsx\n// Interactive Controlled Form with Immutability\nimport { useState } from 'react';\n\nexport default function DeveloperRegistrationForm() {\n  const [formData, setFormData] = useState({\n    username: '',\n    email: '',\n    preferredTech: 'reactjs',\n  });\n\n  const handleChange = (e) => {\n    const { name, value } = e.target;\n    setFormData((prev) => ({ ...prev, [name]: value }));\n  };\n\n  return (\n    <form className=\"p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl space-y-4 max-w-md\">\n      <h2 className=\"text-lg font-black\">Developer Registration</h2>\n      <input\n        name=\"username\"\n        value={formData.username}\n        onChange={handleChange}\n        placeholder=\"Username\"\n        className=\"w-full px-4 py-2.5 bg-white dark:bg-zinc-800 rounded-2xl text-xs font-medium border-0 outline-none\"\n      />\n      <div className=\"p-3 bg-blue-500/10 rounded-2xl text-xs text-blue-600 font-bold\">\n        Preview: <mark>{formData.username || 'Guest'}</mark>\n      </div>\n    </form>\n  );\n}\n```",
        ],
        codeSnippet: `import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(prev => prev + 1)}>
      Count: {count}
    </button>
  );
}`,
        language: "jsx",
        tryItChallenge: "Build a multi-input form for adding items to a TODO array state using immutability.",
        order: 2,
      },
      {
        slug: "ch-4-useeffect-fetching",
        title: "4. Side Effects & Data Fetching with useEffect",
        summary: "Control side-effects, async data fetching, dependency arrays, and cleanup functions.",
        content: [
          "# Side Effects & Data Fetching with useEffect\n\nSide effects include data fetching, manual DOM manipulations, subscriptions, and timers. The `useEffect` hook lets you execute code after rendering.",
          "## Dependency Array Rules\n\n1. **No array**: Runs after *every* render.\n2. **Empty array `[]`**: Runs *once* after initial mount.\n3. **Dependencies `[foo, bar]`**: Runs on mount and whenever `foo` or `bar` changes.",
          "## AbortController Cleanup\n\nAlways return a cleanup function to prevent memory leaks or state updates on unmounted components when fetching data asynchronously.",
          "```jsx\n// Safe Data Fetching with useEffect & AbortController Cleanup\nimport { useState, useEffect } from 'react';\n\nexport default function RemoteUserList() {\n  const [users, setUsers] = useState([]);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    const controller = new AbortController();\n\n    async function loadUsers() {\n      try {\n        const res = await fetch('https://jsonplaceholder.typicode.com/users', {\n          signal: controller.signal,\n        });\n        const data = await res.json();\n        setUsers(data);\n      } catch (err) {\n        if (err.name !== 'AbortError') console.error('Fetch error:', err);\n      } finally {\n        setLoading(false);\n      }\n    }\n\n    loadUsers();\n    return () => controller.abort(); // Cleanup on unmount\n  }, []);\n\n  if (loading) return <p className=\"text-xs font-bold text-blue-500\">Loading data...</p>;\n\n  return (\n    <ul className=\"space-y-2\">\n      {users.slice(0, 4).map((u) => (\n        <li key={u.id} className=\"p-3 bg-white dark:bg-zinc-900 rounded-2xl text-xs font-bold\">\n          {u.name} — <mark>{u.email}</mark>\n        </li>\n      ))}\n    </ul>\n  );\n}\n```",
        ],
        codeSnippet: `useEffect(() => {
  const timer = setTimeout(() => console.log('Tick'), 1000);
  return () => clearTimeout(timer);
}, []);`,
        language: "jsx",
        tryItChallenge: "Build a live clock component that updates state every second using `setInterval` and cleans up on unmount.",
        order: 3,
      },
      {
        slug: "ch-5-context-api",
        title: "5. Global State Architecture with Context API",
        summary: "Avoid prop drilling by sharing global state (Theme, Auth, Cart) using createContext and useContext.",
        content: [
          "# Global State Management with Context API\n\nWhen data needs to be accessed by many components at different nesting levels, passing props through every intermediate component (==prop drilling==) becomes unwieldy. React Context provides a way to share values globally across the component tree.",
          "## How Context Works\n\n1. **`createContext()`**: Creates a Context object.\n2. **`<Context.Provider value={...}>`**: Wraps parent tree and supplies data.\n3. **`useContext(Context)`**: Consumes the data anywhere down the tree.",
          "```jsx\n// Global Theme Context Provider & Consumer\nimport { createContext, useContext, useState } from 'react';\n\nconst ThemeContext = createContext();\n\nexport function ThemeProvider({ children }) {\n  const [theme, setTheme] = useState('dark');\n  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));\n\n  return (\n    <ThemeContext.Provider value={{ theme, toggleTheme }}>\n      <div className={theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900'}>\n        {children}\n      </div>\n    </ThemeContext.Provider>\n  );\n}\n\nexport function ThemeToggleButton() {\n  const { theme, toggleTheme } = useContext(ThemeContext);\n  return (\n    <button\n      onClick={toggleTheme}\n      className=\"px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95 transition-all\"\n    >\n      Active Theme: <mark className=\"bg-white/20 px-1.5 py-0.5 rounded text-white\">{theme.toUpperCase()}</mark>\n    </button>\n  );\n}\n```",
        ],
        codeSnippet: `const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}`,
        language: "jsx",
        tryItChallenge: "Create an AuthContext that provides `user` state and `login()` / `logout()` methods.",
        order: 4,
      },
    ],
  },
];

async function seed() {
  const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI environment variable not found. Check your .env file.");
    process.exit(1);
  }

  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // ── Seed Courses & Chapters ───────────────────────────────────────────────
  console.log("\n📚 Seeding Courses & Chapters...");
  for (const courseData of COURSES_SEED) {
    const { chapters, ...courseFields } = courseData;

    const course = await Course.findOneAndUpdate(
      { slug: courseFields.slug },
      courseFields,
      { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true }
    );
    console.log(`  ✅ Course upserted: ${course.title}`);

    // Delete existing React.js chapters as requested
    if (course.techId === "reactjs") {
      console.log("  🧹 Clearing existing React.js chapters...");
      await Chapter.deleteMany({ course: course._id });
    }

    for (const chapterData of chapters) {
      await Chapter.create({
        ...chapterData,
        course: course._id,
      });
      console.log(`     📖 Chapter created: ${chapterData.title}`);
    }
  }

  console.log("\n🎉 React.js course seeded with 5 detailed chapters successfully!\n");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeder error:", err);
  mongoose.disconnect();
  process.exit(1);
});
