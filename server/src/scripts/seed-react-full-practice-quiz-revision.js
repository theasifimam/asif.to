import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "../configs/db.js";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import Question from "../models/Question.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const PREFIX = "react-full-learning-v1";

/**
 * 22 Chapters data mapping for React.js Course
 */
const CHAPTER_DATA = [
  // Chapter 1
  {
    slugMatch: /chapter-1|introduction-to-react/i,
    codingProblems: [
      {
        title: "Build a React Welcome Card Component",
        description: "Create a functional React component called `WelcomeCard` that displays a greeting header, a short intro paragraph, and a version badge.",
        language: "javascript",
        starterCode: `export default function WelcomeCard() {\n  // Write your React component JSX here\n  return (\n    <div>\n      {/* Add your elements here */}\n    </div>\n  );\n}`,
        solutionCode: `export default function WelcomeCard() {\n  const appName = "React.js Mastery";\n  const version = "v18.3";\n\n  return (\n    <div style={{ padding: "20px", border: "1px solid #3b82f6", borderRadius: "12px", fontFamily: "sans-serif" }}>\n      <h1 style={{ color: "#1d4ed8" }}>Welcome to {appName}!</h1>\n      <p>React is a powerful library for building user interfaces with components.</p>\n      <span style={{ background: "#dbeafe", color: "#1e40af", padding: "4px 8px", borderRadius: "6px", fontSize: "12px" }}>\n        Version: {version}\n      </span>\n    </div>\n  );\n}`,
        hints: [
          "Use standard JSX elements like <h1>, <p>, and <span>.",
          "You can embed JavaScript variables inside JSX using curly braces `{}`.",
          "Remember that JSX style attributes take a JavaScript object."
        ],
        expectedOutput: "A styled card displaying 'Welcome to React.js Mastery!', a short paragraph, and a version badge."
      }
    ],
    revision: [
      {
        question: "What is React and who created it?",
        answer: "React is an open-source JavaScript library for building user interfaces based on components, created by Meta (Facebook) in 2013."
      },
      {
        question: "What is the Virtual DOM in React?",
        answer: "The Virtual DOM is a lightweight in-memory representation of the real DOM. React uses it to calculate minimal DOM diffs and batch updates efficiently."
      },
      {
        question: "What is the core philosophy of React component architecture?",
        answer: "Encapsulation, reusability, and declarative UI rendering where UI is a function of state: `UI = f(state)`."
      }
    ],
    quiz: [
      {
        question: "Which of the following best describes React?",
        options: [
          "A declarative, component-based frontend JavaScript library",
          "A full-stack MVC framework like Ruby on Rails",
          "A relational database management system",
          "A CSS preprocessor and compiler"
        ],
        correctIndex: 0,
        explanation: "React is an open-source JavaScript library focused exclusively on building user interfaces using declarative components."
      },
      {
        question: "How does React update the browser UI efficiently?",
        options: [
          "By reloading the web page on every state change",
          "By comparing Virtual DOM snapshots and patching only changed real DOM nodes",
          "By directly modifying browser memory addresses",
          "By converting JavaScript into WebAssembly binaries"
        ],
        correctIndex: 1,
        explanation: "React creates a Virtual DOM tree, performs diffing (reconciliation) when state changes, and updates only the necessary nodes in the real DOM."
      },
      {
        question: "What does 'declarative UI' mean in React?",
        options: [
          "Writing step-by-step imperative DOM manipulation code like document.createElement",
          "Describing what the UI should look like for any given state",
          "Declaring global CSS variables in HTML headers",
          "Declaring SQL schemas inside JavaScript controllers"
        ],
        correctIndex: 1,
        explanation: "Declarative programming means you describe what the UI should look like based on state, and React handles updating the DOM to match."
      }
    ],
    build: {
      enabled: true,
      title: "Build a React Developer Profile Card",
      description: "Design and implement a structured developer profile card using pure React component composition.",
      requirements: [
        "Create a functional React component",
        "Render developer name, title, and bio",
        "Display a list of top tech skills using JSX"
      ],
      estimatedMinutes: 15
    }
  },

  // Chapter 2
  {
    slugMatch: /chapter-2|jsx-javascript-xml/i,
    codingProblems: [
      {
        title: "Dynamic Product Badge using JSX Expressions",
        description: "Create a `ProductBadge` component that calculates a discounted price and dynamically changes text color based on stock status.",
        language: "javascript",
        starterCode: `export default function ProductBadge() {\n  const name = "Wireless Headphones";\n  const originalPrice = 100;\n  const discountPercent = 20;\n  const inStock = true;\n\n  // Calculate final price and render JSX\n  return (\n    <div>\n      {/* Write your JSX here */}\n    </div>\n  );\n}`,
        solutionCode: `export default function ProductBadge() {\n  const name = "Wireless Headphones";\n  const originalPrice = 100;\n  const discountPercent = 20;\n  const inStock = true;\n  const finalPrice = originalPrice - (originalPrice * discountPercent) / 100;\n\n  return (\n    <div className="product-card">\n      <h2>{name}</h2>\n      <p>Original: \${originalPrice}</p>\n      <p>Discounted ({discountPercent}% OFF): <strong>\${finalPrice.toFixed(2)}</strong></p>\n      <span className={inStock ? "badge-green" : "badge-red"}>\n        {inStock ? "In Stock" : "Out of Stock"}\n      </span>\n    </div>\n  );\n}`,
        hints: [
          "Use `{}` to embed calculations like `originalPrice - discount` directly in JSX.",
          "Use HTML `className` attribute instead of standard `class` in JSX.",
          "Use ternary operator `{inStock ? 'In Stock' : 'Out of Stock'}` for inline condition."
        ],
        expectedOutput: "Product card displaying 'Wireless Headphones', discounted price '$80.00', and green 'In Stock' badge."
      }
    ],
    revision: [
      {
        question: "What is JSX in React?",
        answer: "JSX (JavaScript XML) is a syntax extension for JavaScript that allows developers to write HTML-like markup directly inside JavaScript files."
      },
      {
        question: "Why must JSX elements have a single parent wrapper?",
        answer: "Because JSX transpiles to `React.createElement()` function calls, which must return a single JavaScript object representation."
      },
      {
        question: "Why do we use `className` instead of `class` in JSX?",
        answer: "`class` is a reserved keyword in JavaScript, so React uses `className` to specify DOM element CSS classes."
      }
    ],
    quiz: [
      {
        question: "What does JSX transpile to under the hood?",
        options: [
          "React.createElement() function calls",
          "Raw HTML string concatenation",
          "WebAssembly bytecode",
          "DOM document.write() statements"
        ],
        correctIndex: 0,
        explanation: "Compilers like Babel or SWC transpile JSX elements into React.createElement(...) calls."
      },
      {
        question: "How do you evaluate JavaScript expressions inside JSX markup?",
        options: [
          "By wrapping expressions inside single curly braces {}",
          "By wrapping expressions in double quotes \"\"",
          "By wrapping expressions inside PHP tags <?php ?>",
          "By using HTML comment tags <!-- -->"
        ],
        correctIndex: 0,
        explanation: "Curly braces `{}` tell JSX to evaluate the enclosed text as a JavaScript expression."
      },
      {
        question: "Which tag can be used to group multiple JSX children without adding extra DOM nodes?",
        options: [
          "React.Fragment or empty tags <></>",
          "<div> elements only",
          "<section> tags",
          "<span hidden>"
        ],
        correctIndex: 0,
        explanation: "React.Fragment (or shorthand `<></>`) allows grouping children without rendering an extra DOM container element."
      }
    ],
    build: {
      enabled: true,
      title: "Build a JSX Invoice Summary",
      description: "Create an interactive invoice display using dynamic JSX formatting, inline calculations, and Fragment grouping.",
      requirements: [
        "Calculate tax and total dynamically",
        "Use React Fragment <></> to wrap elements",
        "Apply conditional CSS classes for payment status"
      ],
      estimatedMinutes: 15
    }
  },

  // Chapter 3
  {
    slugMatch: /chapter-3|components-props/i,
    codingProblems: [
      {
        title: "Reusable User Card with Props & Defaults",
        description: "Build a reusable `UserCard` component that accepts `name`, `role`, `avatar`, and optional `isOnline` props with default values.",
        language: "javascript",
        starterCode: `function UserCard(props) {\n  // Destructure props with default values\n  return (\n    <div>\n      {/* Render user details */}\n    </div>\n  );\n}\n\nexport default function App() {\n  return (\n    <div>\n      {/* Render at least 2 UserCards with different props */}\n    </div>\n  );\n}`,
        solutionCode: `function UserCard({ name = "Anonymous", role = "Member", avatar = "https://via.placeholder.com/50", isOnline = false }) {\n  return (\n    <div className="user-card" style={{ border: "1px solid #ccc", padding: "12px", borderRadius: "8px", margin: "8px 0" }}>\n      <img src={avatar} alt={name} width="50" height="50" style={{ borderRadius: "50%" }} />\n      <h3>{name}</h3>\n      <p>Role: {role}</p>\n      <span style={{ color: isOnline ? "green" : "gray" }}>\n        {isOnline ? "● Online" : "○ Offline"}\n      </span>\n    </div>\n  );\n}\n\nexport default function App() {\n  return (\n    <div>\n      <UserCard name="Asif Imam" role="Full Stack Lead" isOnline={true} />\n      <UserCard name="Sarah Connor" role="Security Engineer" isOnline={false} />\n    </div>\n  );\n}`,
        hints: [
          "Use object destructuring in function parameter: `({ name, role, avatar })`.",
          "Provide default values like `{ role = 'Member' }` to handle missing props.",
          "Pass non-string props like numbers or booleans using curly braces: `isOnline={true}`."
        ],
        expectedOutput: "Two styled UserCards rendered with distinct names, roles, avatars, and online status indicators."
      }
    ],
    revision: [
      {
        question: "What are props in React?",
        answer: "Props (short for properties) are read-only inputs passed from a parent component to a child component to customize its render."
      },
      {
        question: "Are props mutable inside the receiving component?",
        answer: "No! Props are strictly read-only and immutable. A component must never modify its own props."
      },
      {
        question: "What is the `children` prop in React?",
        answer: "The `children` prop is a special prop passed automatically to components that contain elements placed between opening and closing JSX tags."
      }
    ],
    quiz: [
      {
        question: "How are props passed down in React component trees?",
        options: [
          "Unidirectionally (Top-down) from parent to child components",
          "Bidirectionally between any components automatically",
          "Bottom-up from child to parent components via SQL streams",
          "Globally injected into browser localStorage"
        ],
        correctIndex: 0,
        explanation: "React enforces a uni-directional data flow where props travel down from parent components to child components."
      },
      {
        question: "What happens if a child component attempts to reassign `props.name = 'New'`?",
        options: [
          "React throws an error or enforces immutability; props cannot be mutated",
          "The parent component's state automatically updates",
          "The browser DOM reloads completely",
          "The prop value changes in all sibling components"
        ],
        correctIndex: 0,
        explanation: "Props are read-only. Modifying props violates React's core pure component contract."
      },
      {
        question: "How do you pass a boolean prop named `isActive` with value `true` to a component?",
        options: [
          "<MyComponent isActive={true} /> or shorthand <MyComponent isActive />",
          "<MyComponent isActive=\"true\" />",
          "<MyComponent isActive=(true) />",
          "<MyComponent props.isActive=true />"
        ],
        correctIndex: 0,
        explanation: "Booleans can be passed via JSX expression `<Comp isActive={true} />` or simply `<Comp isActive />`."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Modular Alert Banner Component",
      description: "Create a flexible `AlertBanner` component using props for type ('success', 'warning', 'error') and children for message content.",
      requirements: [
        "Accept variant prop for color styling",
        "Use props.children for dynamic banner text",
        "Render multiple alerts in an app page"
      ],
      estimatedMinutes: 20
    }
  },

  // Chapter 4
  {
    slugMatch: /chapter-4|state-usestate-hook/i,
    codingProblems: [
      {
        title: "Interactive Counter with Step & Limits",
        description: "Build a counter component using `useState` that allows incrementing, decrementing, resetting, and setting dynamic step values.",
        language: "javascript",
        starterCode: `import { useState } from "react";\n\nexport default function Counter() {\n  // Initialize state here\n\n  return (\n    <div>\n      {/* Render count and buttons */}\n    </div>\n  );\n}`,
        solutionCode: `import { useState } from "react";\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  const [step, setStep] = useState(1);\n\n  const handleIncrement = () => setCount((prev) => prev + step);\n  const handleDecrement = () => setCount((prev) => Math.max(0, prev - step));\n  const handleReset = () => setCount(0);\n\n  return (\n    <div className="counter-box" style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px" }}>\n      <h2>Current Count: {count}</h2>\n      <div style={{ gap: "8px", display: "flex", marginBottom: "12px" }}>\n        <button onClick={handleIncrement}>+ Step ({step})</button>\n        <button onClick={handleDecrement}>- Step ({step})</button>\n        <button onClick={handleReset}>Reset</button>\n      </div>\n      <label>\n        Step Size: \n        <input \n          type="number" \n          value={step} \n          onChange={(e) => setStep(Number(e.target.value) || 1)} \n        />\n      </label>\n    </div>\n  );\n}`,
        hints: [
          "`useState` returns an array with two elements: `[currentState, setterFunction]`.",
          "Always use functional state updates `setCount(prev => prev + step)` when new state depends on previous state.",
          "Remember to convert input values from string to number using `Number(e.target.value)`."
        ],
        expectedOutput: "An interactive counter interface with increment, decrement, reset buttons, and dynamic step size input."
      }
    ],
    revision: [
      {
        question: "What is component state in React?",
        answer: "State is an internal data store managed inside a React component that can change over time and triggers a component re-render upon update."
      },
      {
        question: "What does `useState(initialValue)` return?",
        answer: "It returns a tuple: `[currentStateValue, updateStateFunction]`."
      },
      {
        question: "Why should you use functional state updates `setCount(prev => prev + 1)`?",
        answer: "Because state updates are batched and asynchronous. Functional updates ensure you always operate on the most recent state snapshot."
      }
    ],
    quiz: [
      {
        question: "What happens when you call a state updater function returned by `useState`?",
        options: [
          "React updates the state value and schedules a re-render of the component",
          "The browser executes a full hard reload of the application",
          "React mutates the DOM directly without re-rendering",
          "The initial state value is destroyed permanently across sessions"
        ],
        correctIndex: 0,
        explanation: "Calling state setters tells React that the component data has changed, prompting React to re-render the component with the new state."
      },
      {
        question: "What is wrong with writing `count = count + 1` directly in a component?",
        options: [
          "Direct state mutation does not trigger a re-render, so the UI will not update",
          "It causes a syntax error in JavaScript",
          "It deletes the React component from memory",
          "It forces all props to turn null"
        ],
        correctIndex: 0,
        explanation: "React relies on setter functions (e.g. `setCount`) to trigger its reconciliation process and update the DOM."
      },
      {
        question: "If you call `setCount(count + 1)` three times sequentially in one handler, what happens?",
        options: [
          "Count increments by 1 because all three calls read the same snapshot value of count",
          "Count increments by 3",
          "Count resets to 0",
          "An infinite loop error is thrown"
        ],
        correctIndex: 0,
        explanation: "In a single event loop batch, `count` holds the same snapshot. To increment by 3, use functional updates: `setCount(c => c + 1)`."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Toggleable Accordion Panel",
      description: "Create an expandable FAQ section where tapping a item toggles its open/closed state using useState.",
      requirements: [
        "Manage open state with useState hook",
        "Toggle visibility on button click",
        "Add smooth expand indicator"
      ],
      estimatedMinutes: 20
    }
  },

  // Chapter 5
  {
    slugMatch: /chapter-5|event-handling/i,
    codingProblems: [
      {
        title: "Controlled Search Bar with Event Handling",
        description: "Implement a search bar with `onChange` input tracking, form submit handling with `e.preventDefault()`, and clear button.",
        language: "javascript",
        starterCode: `import { useState } from "react";\n\nexport default function SearchForm() {\n  const [query, setQuery] = useState("");\n\n  // Handle input change and form submission\n\n  return (\n    <form>\n      {/* Build your form here */}\n    </form>\n  );\n}`,
        solutionCode: `import { useState } from "react";\n\nexport default function SearchForm() {\n  const [query, setQuery] = useState("");\n  const [submittedQuery, setSubmittedQuery] = useState("");\n\n  const handleSubmit = (e) => {\n    e.preventDefault(); // Stop page reload\n    setSubmittedQuery(query);\n  };\n\n  const handleClear = () => {\n    setQuery("");\n    setSubmittedQuery("");\n  };\n\n  return (\n    <div className="search-box" style={{ padding: "16px", maxWidth: "400px" }}>\n      <form onSubmit={handleSubmit}>\n        <input\n          type="text"\n          value={query}\n          onChange={(e) => setQuery(e.target.value)}\n          placeholder="Search topics..."\n          style={{ padding: "8px", width: "70%" }}\n        />\n        <button type="submit" style={{ padding: "8px" }}>Search</button>\n        <button type="button" onClick={handleClear} style={{ padding: "8px", marginLeft: "4px" }}>Clear</button>\n      </form>\n      {submittedQuery && (\n        <p style={{ marginTop: "12px", color: "#2563eb" }}>\n          Searching for: <strong>"{submittedQuery}"</strong>\n        </p>\n      )}\n    </div>\n  );\n}`,
        hints: [
          "Pass event handlers as functions `onSubmit={handleSubmit}`, not function invocations `onSubmit={handleSubmit()}`.",
          "Call `e.preventDefault()` inside form submit handlers to prevent default browser page submission.",
          "Access input text using `e.target.value` inside `onChange`."
        ],
        expectedOutput: "A controlled search form that displays submitted queries without page reloads and offers a clear button."
      }
    ],
    revision: [
      {
        question: "How are event names written in React JSX?",
        answer: "React events are named using camelCase, such as `onClick`, `onChange`, `onSubmit`, `onKeyDown`."
      },
      {
        question: "What is SyntheticEvent in React?",
        answer: "A SyntheticEvent is React's cross-browser wrapper around native browser DOM events, providing identical behavior across all browsers."
      },
      {
        question: "Why should you pass `onClick={handleClick}` instead of `onClick={handleClick()}`?",
        answer: "`handleClick()` executes immediately during rendering, whereas `handleClick` passes the function reference to be called when the event fires."
      }
    ],
    quiz: [
      {
        question: "How do you prevent default browser behavior (such as page reload on form submit) in React?",
        options: [
          "Call e.preventDefault() inside the event handler function",
          "Return false from the event handler function",
          "Use the HTML attribute action=\"javascript:void(0)\"",
          "Delete the <form> tag"
        ],
        correctIndex: 0,
        explanation: "In React, returning false does not stop default behavior. You must explicitly call `e.preventDefault()` on the event object."
      },
      {
        question: "How do you pass a custom argument (like item `id`) to an event handler in JSX?",
        options: [
          "Use an inline arrow function: onClick={() => handleDelete(item.id)}",
          "onClick=handleDelete(item.id)",
          "onClick={handleDelete, item.id}",
          "onClick=item.id.handleDelete()"
        ],
        correctIndex: 0,
        explanation: "An inline arrow function `() => handleDelete(id)` wraps the function invocation so it only runs when clicked."
      },
      {
        question: "Which property on the event object `e` contains the current input element value?",
        options: [
          "e.target.value",
          "e.element.text",
          "e.input.val",
          "e.current.data"
        ],
        correctIndex: 0,
        explanation: "`e.target` references the DOM element that dispatched the event, and `.value` extracts its form value."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Keypress Event Tracker",
      description: "Create an interactive key log component that detects user keystrokes in an input box and displays recent key history.",
      requirements: [
        "Listen to onKeyDown event",
        "Prevent spacebar default scrolling when active",
        "Maintain last 5 keystrokes in component state"
      ],
      estimatedMinutes: 20
    }
  },

  // Chapter 6
  {
    slugMatch: /chapter-6|lists-conditional-rendering/i,
    codingProblems: [
      {
        title: "Filterable Task List with Keys & Empty State",
        description: "Build a dynamic task manager where users can filter between All, Active, and Completed tasks, with proper list `key` usage.",
        language: "javascript",
        starterCode: `import { useState } from "react";\n\nconst INITIAL_TASKS = [\n  { id: 1, title: "Learn JSX", completed: true },\n  { id: 2, title: "Master Props & State", completed: true },\n  { id: 3, title: "Build Task List Component", completed: false },\n];\n\nexport default function TaskList() {\n  const [tasks, setTasks] = useState(INITIAL_TASKS);\n  const [filter, setFilter] = useState("all");\n\n  return (\n    <div>\n      {/* Render filter buttons and mapped task list */}\n    </div>\n  );\n}`,
        solutionCode: `import { useState } from "react";\n\nconst INITIAL_TASKS = [\n  { id: 1, title: "Learn JSX", completed: true },\n  { id: 2, title: "Master Props & State", completed: true },\n  { id: 3, title: "Build Task List Component", completed: false },\n];\n\nexport default function TaskList() {\n  const [tasks, setTasks] = useState(INITIAL_TASKS);\n  const [filter, setFilter] = useState("all");\n\n  const filteredTasks = tasks.filter((task) => {\n    if (filter === "active") return !task.completed;\n    if (filter === "completed") return task.completed;\n    return true;\n  });\n\n  const toggleTask = (id) => {\n    setTasks((prev) =>\n      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))\n    );\n  };\n\n  return (\n    <div className="task-container" style={{ padding: "16px" }}>\n      <h2>Task Manager</h2>\n      <div style={{ marginBottom: "12px" }}>\n        {["all", "active", "completed"].map((f) => (\n          <button\n            key={f}\n            onClick={() => setFilter(f)}\n            style={{ fontWeight: filter === f ? "bold" : "normal", marginRight: "6px" }}\n          >\n            {f.toUpperCase()}\n          </button>\n        ))}\n      </div>\n      {filteredTasks.length === 0 ? (\n        <p>No tasks found for this filter.</p>\n      ) : (\n        <ul style={{ listStyle: "none", padding: 0 }}>\n          {filteredTasks.map((task) => (\n            <li\n              key={task.id}\n              onClick={() => toggleTask(task.id)}\n              style={{\n                cursor: "pointer",\n                textDecoration: task.completed ? "line-through" : "none",\n                padding: "6px 0",\n              }}\n            >\n              {task.completed ? "☑" : "☐"} {task.title}\n            </li>\n          ))}\n        </ul>\n      )}\n    </div>\n  );\n}`,
        hints: [
          "Always provide a unique `key` prop (like `task.id`) when mapping over array items in JSX.",
          "Use ternary operator `{condition ? <List /> : <EmptyState />}` for clear empty state conditional rendering.",
          "Keep state immutable by creating new array copies with `.map()` or `.filter()`."
        ],
        expectedOutput: "A filterable task list displaying tasks with strikethrough toggle and an empty state when no tasks match."
      }
    ],
    revision: [
      {
        question: "Why are `key` props required when rendering lists in React?",
        answer: "Keys give elements a stable identity so React can identify which items changed, were added, or removed during DOM reconciliation."
      },
      {
        question: "Why should array index be avoided as a `key` prop?",
        answer: "If list item order changes or items are inserted/deleted, array index keys can cause incorrect component state bugs and degraded rendering performance."
      },
      {
        question: "What are the common patterns for conditional rendering in JSX?",
        answer: "Ternary operators (`condition ? <A/> : <B/>`), short-circuit logical AND (`condition && <A/>`), and early returns."
      }
    ],
    quiz: [
      {
        question: "Which JavaScript array method is standard for transforming data arrays into JSX elements?",
        options: [
          ".map()",
          ".forEach()",
          ".push()",
          ".reduce()"
        ],
        correctIndex: 0,
        explanation: "`.map()` creates a new array of JSX elements from data items, making it ideal for inline JSX list rendering."
      },
      {
        question: "What is the result of `{false && <h1>Title</h1>}` in JSX?",
        options: [
          "Nothing is rendered (evaluates to false/null in React)",
          "An error is thrown",
          "<h1>false</h1> is printed to the DOM",
          "The component unmounts completely"
        ],
        correctIndex: 0,
        explanation: "React ignores boolean `false`, `true`, `null`, and `undefined` values during JSX rendering."
      },
      {
        question: "What issue can occur if `0 && <Component />` is evaluated in JSX?",
        options: [
          "It renders the number 0 onto the screen",
          "It renders <Component />",
          "It throws a syntax crash",
          "It hides the entire page"
        ],
        correctIndex: 0,
        explanation: "Numbers like `0` are rendered literally by React. Ensure conditions are booleans: `items.length > 0 && <Component />`."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Product Inventory Grid",
      description: "Render a dynamic product grid using map() with category filter tabs and stock indicator badges.",
      requirements: [
        "Render items with map and unique keys",
        "Filter by category string",
        "Render 'Out of Stock' banner conditionally"
      ],
      estimatedMinutes: 25
    }
  },

  // Chapter 7
  {
    slugMatch: /chapter-7|useeffect-hook/i,
    codingProblems: [
      {
        title: "Digital Clock with useEffect & Cleanup",
        description: "Create a `DigitalClock` component using `useEffect` that updates current time every second and cleans up its interval timer on unmount.",
        language: "javascript",
        starterCode: `import { useState, useEffect } from "react";\n\nexport default function DigitalClock() {\n  const [time, setTime] = useState(new Date());\n\n  // Set up interval inside useEffect with proper cleanup\n\n  return (\n    <div>\n      <h2>Current Time: {time.toLocaleTimeString()}</h2>\n    </div>\n  );\n}`,
        solutionCode: `import { useState, useEffect } from "react";\n\nexport default function DigitalClock() {\n  const [time, setTime] = useState(new Date());\n\n  useEffect(() => {\n    const timerId = setInterval(() => {\n      setTime(new Date());\n    }, 1000);\n\n    // Cleanup function executed on unmount\n    return () => {\n      clearInterval(timerId);\n    };\n  }, []); // Empty dependency array = run once on mount\n\n  return (\n    <div className="clock-card" style={{ padding: "20px", background: "#1e293b", color: "#38bdf8", borderRadius: "12px", width: "260px" }}>\n      <p style={{ margin: 0, fontSize: "12px", textTransform: "uppercase" }}>Live Digital Clock</p>\n      <h1 style={{ margin: "8px 0", fontSize: "28px" }}>{time.toLocaleTimeString()}</h1>\n    </div>\n  );\n}`,
        hints: [
          "Pass an empty dependency array `[]` so the effect only runs once when the component mounts.",
          "Return a cleanup function `() => clearInterval(timerId)` from `useEffect` to prevent memory leaks.",
          "Update state inside `setInterval` callback."
        ],
        expectedOutput: "A live digital clock component that updates every second and safely cleans up timers on unmount."
      }
    ],
    revision: [
      {
        question: "What is the purpose of the `useEffect` hook?",
        answer: "useEffect lets you perform side effects in functional components, such as data fetching, manual DOM mutations, subscriptions, and timers."
      },
      {
        question: "What does an empty dependency array `[]` mean in `useEffect`?",
        answer: "It means the effect runs exactly once after the initial component mount, and the cleanup runs when the component unmounts."
      },
      {
        question: "When is the cleanup function returned by `useEffect` executed?",
        answer: "The cleanup function executes right before the component unmounts AND before re-running the effect on subsequent dependency changes."
      }
    ],
    quiz: [
      {
        question: "What happens if you omit the dependency array in `useEffect(() => { ... })`?",
        options: [
          "The effect function executes after EVERY single render of the component",
          "The effect function never executes",
          "The effect executes only once on mount",
          "React throws a runtime syntax exception"
        ],
        correctIndex: 0,
        explanation: "Without a dependency array, useEffect runs after every render, which can easily trigger infinite loops if state is updated inside."
      },
      {
        question: "Why should you return a cleanup function when subscribing to window event listeners in useEffect?",
        options: [
          "To remove event listeners when component unmounts and prevent memory leaks",
          "To force the component to re-render twice",
          "To disable all CSS animations",
          "To clear browser cookies"
        ],
        correctIndex: 0,
        explanation: "Failing to remove event listeners on unmount leaves dangling references, leading to memory leaks and unwanted callbacks."
      },
      {
        question: "If a state variable `searchQuery` is used inside `useEffect`, where must it be declared?",
        options: [
          "Inside the dependency array: useEffect(() => { ... }, [searchQuery])",
          "Inside the cleanup return function",
          "Inside window.localStorage",
          "Inside global CSS file"
        ],
        correctIndex: 0,
        explanation: "All reactive values (props, state) referenced inside `useEffect` must be included in its dependency array."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Document Title Counter Tracker",
      description: "Build a counter component that synchronizes the browser tab document.title with the current count value using useEffect.",
      requirements: [
        "Update document.title in useEffect",
        "Add count variable to dependency array",
        "Reset title on component unmount"
      ],
      estimatedMinutes: 20
    }
  },

  // Chapter 8
  {
    slugMatch: /chapter-8|component-communication-lifting-state-up/i,
    codingProblems: [
      {
        title: "Lifting State Up — Shared Temperature Converter",
        description: "Lift state up to a parent component `Calculator` so two child inputs (`CelsiusInput` & `FahrenheitInput`) stay synchronized.",
        language: "javascript",
        starterCode: `import { useState } from "react";\n\nfunction TemperatureInput({ scale, temperature, onTemperatureChange }) {\n  return (\n    <fieldset>\n      <legend>Enter temperature in {scale}:</legend>\n      <input\n        value={temperature}\n        onChange={(e) => onTemperatureChange(e.target.value)}\n      />\n    </fieldset>\n  );\n}\n\nexport default function Calculator() {\n  // Lift state up here\n  return (\n    <div>\n      {/* Render both temperature inputs connected to parent state */}\n    </div>\n  );\n}`,
        solutionCode: `import { useState } from "react";\n\nfunction TemperatureInput({ scale, temperature, onTemperatureChange }) {\n  return (\n    <fieldset style={{ margin: "10px 0", padding: "12px", borderRadius: "8px" }}>\n      <legend>Temperature in {scale === "c" ? "Celsius" : "Fahrenheit"}:</legend>\n      <input\n        type="number"\n        value={temperature}\n        onChange={(e) => onTemperatureChange(e.target.value)}\n        style={{ padding: "6px" }}\n      />\n    </fieldset>\n  );\n}\n\nexport default function Calculator() {\n  const [temperature, setTemperature] = useState("");\n  const [scale, setScale] = useState("c");\n\n  const handleCelsiusChange = (val) => {\n    setScale("c");\n    setTemperature(val);\n  };\n\n  const handleFahrenheitChange = (val) => {\n    setScale("f");\n    setTemperature(val);\n  };\n\n  const celsius = scale === "f" && temperature !== "" \n    ? (((Number(temperature) - 32) * 5) / 9).toFixed(1)\n    : temperature;\n\n  const fahrenheit = scale === "c" && temperature !== ""\n    ? ((Number(temperature) * 9) / 5 + 32).toFixed(1)\n    : temperature;\n\n  return (\n    <div style={{ maxWidth: "350px", padding: "16px" }}>\n      <h2>Synchronized Temperature Calculator</h2>\n      <TemperatureInput scale="c" temperature={celsius} onTemperatureChange={handleCelsiusChange} />\n      <TemperatureInput scale="f" temperature={fahrenheit} onTemperatureChange={handleFahrenheitChange} />\n    </div>\n  );\n}`,
        hints: [
          "Remove local state from child components and pass value & callback via props.",
          "Store the single source of truth in the closest common parent component (`Calculator`).",
          "Convert values dynamically based on active scale."
        ],
        expectedOutput: "Two synchronized temperature inputs (Celsius & Fahrenheit) updated in real-time via lifted parent state."
      }
    ],
    revision: [
      {
        question: "What does 'lifting state up' mean in React?",
        answer: "Lifting state up means moving shared state to the closest common ancestor component so multiple child components can share the same source of truth."
      },
      {
        question: "How does a child component send data back up to a parent component?",
        answer: "The parent passes a callback function down to the child via props, and the child invokes that function with data arguments."
      },
      {
        question: "What is a 'single source of truth' in React architecture?",
        answer: "It means having a single piece of state driving shared UI components, preventing out-of-sync state duplications."
      }
    ],
    quiz: [
      {
        question: "When two sibling components need to reflect the same changing data, where should state live?",
        options: [
          "In their closest common ancestor parent component",
          "Duplicated in both sibling components independently",
          "Inside browser document.cookie",
          "Inside HTML head meta tags"
        ],
        correctIndex: 0,
        explanation: "Moving state to their common parent allows passing shared data down as props and handling updates consistently."
      },
      {
        question: "What is the recommended way for a child component to request a state change in a parent?",
        options: [
          "Call a setter callback function received as a prop from the parent",
          "Directly mutate parent.state",
          "Dispatch a global window reload event",
          "Modify the parent component file source code"
        ],
        correctIndex: 0,
        explanation: "Child components invoke callback functions passed down from parents to pass data up and request state updates."
      },
      {
        question: "What is a main benefit of controlled components driven by lifted state?",
        options: [
          "Predictable UI synchronization and easier debugging",
          "Faster internet download speed",
          "Elimination of all CSS stylesheets",
          "Automatic database backup creation"
        ],
        correctIndex: 0,
        explanation: "Lifted state ensures all components remain synchronized around a clear, single source of truth."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Sync Tabbed Navigation Panel",
      description: "Build a master-detail viewer where selecting an item in a sidebar child updates the active detail child component.",
      requirements: [
        "Store activeId in common parent state",
        "Pass onSelect callback to Sidebar child",
        "Render selected item details in Content child"
      ],
      estimatedMinutes: 20
    }
  },

  // Chapter 9
  {
    slugMatch: /chapter-9|react-router-v6/i,
    codingProblems: [
      {
        title: "Navigation Bar with NavLink & Route Params",
        description: "Create a header navigation component with `NavLink` active class styling and dynamic route parameter extraction.",
        language: "javascript",
        starterCode: `// Assume React Router v6 components are imported\n// import { NavLink, useParams, useNavigate } from "react-router-dom";\n\nexport function Navbar() {\n  return (\n    <nav>\n      {/* Create active-aware NavLinks for Home, Products, Profile */}\n    </nav>\n  );\n}\n\nexport function UserProfilePage() {\n  // Extract route parameter 'userId'\n  return <div>User Profile ID: {/* id */}</div>;\n}`,
        solutionCode: `import { NavLink, useParams, useNavigate } from "react-router-dom";\n\nexport function Navbar() {\n  const activeStyle = ({ isActive }) => ({\n    fontWeight: isActive ? "bold" : "normal",\n    color: isActive ? "#2563eb" : "#475569",\n    textDecoration: "none",\n    marginRight: "16px",\n  });\n\n  return (\n    <nav style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>\n      <NavLink to="/" style={activeStyle}>Home</NavLink>\n      <NavLink to="/products" style={activeStyle}>Products</NavLink>\n      <NavLink to="/users/42" style={activeStyle}>Profile (ID: 42)</NavLink>\n    </nav>\n  );\n}\n\nexport function UserProfilePage() {\n  const { userId } = useParams();\n  const navigate = useNavigate();\n\n  return (\n    <div style={{ padding: "16px" }}>\n      <h2>User Profile Details</h2>\n      <p>Viewing user ID: <strong>{userId || "Guest"}</strong></p>\n      <button onClick={() => navigate("/")}>Go Back Home</button>\n    </div>\n  );\n}`,
        hints: [
          "`NavLink` accepts a style callback function receiving `({ isActive })`.",
          "Use `useParams()` hook to get dynamic URL parameters defined like `/users/:userId`.",
          "Use `useNavigate()` hook for programmatic navigation like `navigate('/home')`."
        ],
        expectedOutput: "A navigation bar with active link highlighting, URL param extraction, and programmatic navigate button."
      }
    ],
    revision: [
      {
        question: "What is React Router?",
        answer: "React Router is the standard client-side routing library for React applications, allowing single-page apps to navigate between views without full browser reloads."
      },
      {
        question: "Difference between `<Link>` and standard HTML `<a>` tag?",
        answer: "`<Link>` intercepts click events and updates URL via HTML5 History API without reloading the page, whereas `<a>` causes full browser reloads."
      },
      {
        question: "What is the purpose of `<Outlet />` in React Router v6?",
        answer: "`<Outlet />` is rendered in parent route components to display their nested child route components."
      }
    ],
    quiz: [
      {
        question: "Which hook in React Router v6 extracts dynamic route path parameters (e.g. `:id`)?",
        options: [
          "useParams()",
          "useRoute()",
          "useQuery()",
          "useURL()"
        ],
        correctIndex: 0,
        explanation: "`useParams()` returns an object of key/value pairs of dynamic path params from the current URL."
      },
      {
        question: "Which hook is used to trigger programmatic navigation (e.g. after form submission)?",
        options: [
          "useNavigate()",
          "useRedirect()",
          "useHistory()",
          "usePush()"
        ],
        correctIndex: 0,
        explanation: "`useNavigate()` returns a navigate function to programmatically redirect users in React Router v6."
      },
      {
        question: "How do you specify a wildcard 404 Not Found route in React Router v6?",
        options: [
          "<Route path=\"*\" element={<NotFound />} />",
          "<Route path=\"404\" element={<NotFound />} />",
          "<Route path=\"error\" element={<NotFound />} />",
          "<Route fallback={<NotFound />} />"
        ],
        correctIndex: 0,
        explanation: "`path=\"*\"` acts as a catch-all route matching any unmatched URLs."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Multi-Page Product Catalog Shell",
      description: "Setup a multi-route app structure with Home, Products List, Product Detail (:id), and 404 pages.",
      requirements: [
        "Define Routes with BrowserRouter & Route tags",
        "Use useParams in Product Detail view",
        "Include active NavLink navigation bar"
      ],
      estimatedMinutes: 25
    }
  },

  // Chapter 10
  {
    slugMatch: /chapter-10|context-api-global-state/i,
    codingProblems: [
      {
        title: "Theme Context Provider & Custom Hook",
        description: "Create a complete Theme Context (`light`/`dark` mode) with a `ThemeProvider` and custom `useTheme` hook with safety check.",
        language: "javascript",
        starterCode: `import { createContext, useContext, useState } from "react";\n\n// Create ThemeContext\n\nexport function ThemeProvider({ children }) {\n  // Implement state and provider\n}\n\nexport function useTheme() {\n  // Custom hook with safety error check\n}`,
        solutionCode: `import { createContext, useContext, useState } from "react";\n\nconst ThemeContext = createContext(null);\n\nexport function ThemeProvider({ children }) {\n  const [theme, setTheme] = useState("light");\n\n  const toggleTheme = () => {\n    setTheme((prev) => (prev === "light" ? "dark" : "light"));\n  };\n\n  return (\n    <ThemeContext.Provider value={{ theme, toggleTheme }}>\n      <div style={{\n        background: theme === "dark" ? "#0f172a" : "#ffffff",\n        color: theme === "dark" ? "#f8fafc" : "#0f172a",\n        minHeight: "150px",\n        padding: "16px",\n        borderRadius: "8px",\n        transition: "all 0.3s ease"\n      }}>\n        {children}\n      </div>\n    </ThemeContext.Provider>\n  );\n}\n\nexport function useTheme() {\n  const context = useContext(ThemeContext);\n  if (!context) {\n    throw new Error("useTheme must be used within a ThemeProvider");\n  }\n  return context;\n}\n\nexport function ThemeToggleButton() {\n  const { theme, toggleTheme } = useTheme();\n  return (\n    <button onClick={toggleTheme}>\n      Switch to {theme === "light" ? "Dark 🌙" : "Light ☀️"} Mode\n    </button>\n  );\n}`,
        hints: [
          "Use `createContext(null)` to create a new context instance.",
          "Wrap children inside `ThemeContext.Provider` and supply `value={{ theme, toggleTheme }}`.",
          "In custom hook, check if `useContext(ThemeContext)` is null to catch missing Provider errors."
        ],
        expectedOutput: "A functional ThemeProvider allowing descendant components to toggle theme state via custom `useTheme` hook."
      }
    ],
    revision: [
      {
        question: "What problem does React Context solve?",
        answer: "React Context provides a way to pass data through the component tree without having to pass props down manually at every level (solving prop drilling)."
      },
      {
        question: "What are the two main parts of Context API?",
        answer: "1. Provider (`Context.Provider`), which supplies data values to its subtree.\n2. Consumer (`useContext(Context)`), which accesses context values."
      },
      {
        question: "When should Context be used versus local state?",
        answer: "Use Context for global or broadly shared data (current user auth, theme, locale). Use local state for component-specific data."
      }
    ],
    quiz: [
      {
        question: "Which hook is used to consume values from a React Context in functional components?",
        options: [
          "useContext()",
          "useProvider()",
          "useGlobal()",
          "useStore()"
        ],
        correctIndex: 0,
        explanation: "`useContext(MyContext)` accepts a context object and returns the current context value provided by the nearest ancestor Provider."
      },
      {
        question: "What happens to context consumer components when the Provider value object changes?",
        options: [
          "All components calling useContext for that context re-render with the new value",
          "Only parent components re-render",
          "The browser page reloads",
          "Context values are ignored until app restart"
        ],
        correctIndex: 0,
        explanation: "When Provider value updates, all descendant consumers re-render automatically."
      },
      {
        question: "What is 'prop drilling' in React?",
        options: [
          "Passing props through multiple intermediate components that don't need them just to reach a deeply nested child",
          "Mutating props inside a loop",
          "Creating dynamic prop keys using string concatenation",
          "Deleting props from component parameters"
        ],
        correctIndex: 0,
        explanation: "Prop drilling is passing props through components that act merely as pass-through handlers."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Global Auth Context & User Profile Header",
      description: "Create an AuthContext storing user session data, login(), and logout() methods, consumed by a UserHeader component.",
      requirements: [
        "Create AuthContext & AuthProvider",
        "Implement login and logout state handlers",
        "Consume context via custom useAuth hook"
      ],
      estimatedMinutes: 25
    }
  },

  // Chapter 11
  {
    slugMatch: /chapter-11|advanced-hooks/i,
    codingProblems: [
      {
        title: "Complex State with useReducer & Auto-Focus useRef",
        description: "Implement a shopping list using `useReducer` to handle ADD, TOGGLE, and DELETE actions, and `useRef` to auto-focus input.",
        language: "javascript",
        starterCode: `import { useReducer, useRef } from "react";\n\nconst initialState = [];\n\nfunction cartReducer(state, action) {\n  // Handle ADD_ITEM, TOGGLE_ITEM, DELETE_ITEM\n}\n\nexport default function ShoppingList() {\n  // Initialize useReducer and useRef\n}`,
        solutionCode: `import { useReducer, useRef } from "react";\n\nfunction cartReducer(state, action) {\n  switch (action.type) {\n    case "ADD_ITEM":\n      return [...state, { id: Date.now(), text: action.payload, bought: false }];\n    case "TOGGLE_ITEM":\n      return state.map((item) =>\n        item.id === action.payload ? { ...item, bought: !item.bought } : item\n      );\n    case "DELETE_ITEM":\n      return state.filter((item) => item.id !== action.payload);\n    default:\n      return state;\n  }\n}\n\nexport default function ShoppingList() {\n  const [items, dispatch] = useReducer(cartReducer, []);\n  const inputRef = useRef(null);\n\n  const handleAdd = (e) => {\n    e.preventDefault();\n    const val = inputRef.current.value.trim();\n    if (!val) return;\n    dispatch({ type: "ADD_ITEM", payload: val });\n    inputRef.current.value = "";\n    inputRef.current.focus(); // Focus input after adding\n  };\n\n  return (\n    <div style={{ padding: "16px", maxWidth: "350px" }}>\n      <form onSubmit={handleAdd}>\n        <input ref={inputRef} placeholder="Add item..." style={{ padding: "6px" }} />\n        <button type="submit">Add</button>\n      </form>\n      <ul>\n        {items.map((item) => (\n          <li key={item.id} style={{ margin: "6px 0" }}>\n            <span\n              onClick={() => dispatch({ type: "TOGGLE_ITEM", payload: item.id })}\n              style={{ textDecoration: item.bought ? "line-through" : "none", cursor: "pointer" }}\n            >\n              {item.text}\n            </span>\n            <button onClick={() => dispatch({ type: "DELETE_ITEM", payload: item.id })} style={{ marginLeft: "8px" }}>\n              ✕\n            </button>\n          </li>\n        ))}\n      </ul>\n    </div>\n  );\n}`,
        hints: [
          "`useReducer(reducer, initialState)` returns `[state, dispatch]`.",
          "Attach `ref={inputRef}` to `<input>` and access DOM element via `inputRef.current`.",
          "Return new immutable state arrays from reducer switch cases."
        ],
        expectedOutput: "A shopping list component driven by useReducer state transitions with input DOM auto-focusing via useRef."
      }
    ],
    revision: [
      {
        question: "Difference between `useState` and `useReducer`?",
        answer: "`useState` is best for simple, independent state primitives. `useReducer` is preferred for complex state logic involving multiple sub-values or complex next-state calculations."
      },
      {
        question: "What is `useRef` used for?",
        answer: "1. Accessing underlying DOM elements directly.\n2. Storing mutable values that persist across renders without triggering a re-render when modified."
      },
      {
        question: "What are `useMemo` and `useCallback` used for?",
        answer: "`useMemo` memoizes expensive calculated values. `useCallback` memoizes function references to prevent unnecessary child component re-renders."
      }
    ],
    quiz: [
      {
        question: "Does updating `ref.current = newValue` trigger a component re-render in React?",
        options: [
          "No, mutating a ref value does not cause a re-render",
          "Yes, it triggers an immediate synchronous re-render",
          "Yes, but only in production builds",
          "It causes an error unless used in useEffect"
        ],
        correctIndex: 0,
        explanation: "`useRef` holds a mutable `.current` property that persists across renders without triggering re-renders when changed."
      },
      {
        question: "What arguments does a reducer function passed to `useReducer` receive?",
        options: [
          "(currentState, action)",
          "(previousState, newState)",
          "(dispatch, payload)",
          "(event, target)"
        ],
        correctIndex: 0,
        explanation: "A reducer function receives `(state, action)` and returns the new computed state."
      },
      {
        question: "When should `useCallback` be used?",
        options: [
          "When passing callback functions to memoized child components that rely on reference equality",
          "For every single inline function in a React application",
          "To fetch remote API data",
          "To set document cookies"
        ],
        correctIndex: 0,
        explanation: "Use `useCallback` selectively when passing callbacks to optimized children wrapped in `React.memo`."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Filterable Heavy List with useMemo",
      description: "Build a list filter component that uses useMemo to prevent re-filtering 1,000 items on unrelated state renders.",
      requirements: [
        "Generate 1,000 items list",
        "Wrap filtering calculation in useMemo",
        "Add input ref focusing on reset"
      ],
      estimatedMinutes: 25
    }
  },

  // Chapter 12
  {
    slugMatch: /chapter-12|fetching-data-from-apis/i,
    codingProblems: [
      {
        title: "API Data Fetcher with Loading, Error & Retry",
        description: "Build a user list component fetching data from a public API with state handling for `loading`, `error`, `data`, and a manual retry button.",
        language: "javascript",
        starterCode: `import { useState, useEffect } from "react";\n\nexport default function UserFetcher() {\n  const [users, setUsers] = useState([]);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  // Fetch users from https://jsonplaceholder.typicode.com/users\n\n  return (\n    <div>\n      {/* Render Loading, Error with Retry, or Users list */}\n    </div>\n  );\n}`,
        solutionCode: `import { useState, useEffect } from "react";\n\nexport default function UserFetcher() {\n  const [users, setUsers] = useState([]);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  const fetchUsers = async () => {\n    setLoading(true);\n    setError(null);\n    try {\n      const res = await fetch("https://jsonplaceholder.typicode.com/users");\n      if (!res.ok) throw new Error(\`HTTP error! status: \${res.status}\`);\n      const data = await res.json();\n      setUsers(data);\n    } catch (err) {\n      setError(err.message || "Failed to fetch users.");\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  useEffect(() => {\n    fetchUsers();\n  }, []);\n\n  if (loading) return <div style={{ padding: "16px" }}>⏳ Loading users...</div>;\n  if (error) return (\n    <div style={{ padding: "16px", color: "red" }}>\n      <p>❌ Error: {error}</p>\n      <button onClick={fetchUsers}>Retry Fetching</button>\n    </div>\n  );\n\n  return (\n    <div style={{ padding: "16px" }}>\n      <h2>Fetched Users ({users.length})</h2>\n      <ul>\n        {users.slice(0, 5).map((user) => (\n          <li key={user.id}><strong>{user.name}</strong> - {user.email}</li>\n        ))}\n      </ul>\n      <button onClick={fetchUsers}>Refresh</button>\n    </div>\n  );\n}`,
        hints: [
          "Always handle `loading`, `error`, and `success` state explicitly when fetching data.",
          "Check `if (!res.ok)` because `fetch()` does not reject HTTP error statuses like 404 or 500 automatically.",
          "Do not make the `useEffect` callback function itself `async`. Declare an async function inside or call a helper."
        ],
        expectedOutput: "A robust user list fetching component with loading indicators, error boundary handling, and a retry mechanism."
      }
    ],
    revision: [
      {
        question: "Why should you not make the `useEffect` callback function directly `async`?",
        answer: "An `async` function returns a Promise, but `useEffect` expects either nothing or a synchronous cleanup function."
      },
      {
        question: "Why does `fetch()` require `if (!res.ok)` checking?",
        answer: "`fetch()` only rejects on network failures, not on HTTP error responses like 404 or 500. `res.ok` checks if status is in 200–299 range."
      },
      {
        question: "How can you cancel an ongoing HTTP fetch request when a component unmounts?",
        answer: "Use an `AbortController` instance, pass `controller.signal` to `fetch()`, and call `controller.abort()` in the `useEffect` cleanup return."
      }
    ],
    quiz: [
      {
        question: "What is the correct way to handle async data fetching inside `useEffect`?",
        options: [
          "Declare an internal async function inside useEffect or outside, and call it synchronously",
          "Pass async () => {} directly as the useEffect callback parameter",
          "Use document.write()",
          "Call fetch() inside JSX render return body directly"
        ],
        correctIndex: 0,
        explanation: "Define an internal `async function fetchData()` inside `useEffect` and invoke it immediately."
      },
      {
        question: "Which object allows cancelling pending fetch HTTP requests during component unmounting?",
        options: [
          "AbortController",
          "CancelToken",
          "ClearTimeout",
          "StopProcess"
        ],
        correctIndex: 0,
        explanation: "Native `AbortController` provides a signal to cancel ongoing HTTP requests safely."
      },
      {
        question: "What happens if you fetch data and call `setState` inside JSX render return body directly?",
        options: [
          "It triggers an infinite re-render loop",
          "Data is cached automatically",
          "The component compiles faster",
          "No state is updated"
        ],
        correctIndex: 0,
        explanation: "Updating state directly during render triggers another render, causing an infinite loop crash."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Searchable API Data Cards Grid",
      description: "Fetch posts data from a public REST API, filter by search keyword input, and render formatted cards.",
      requirements: [
        "Fetch API data on mount",
        "Handle loading and error states",
        "Filter results with search input"
      ],
      estimatedMinutes: 25
    }
  },

  // Chapter 13
  {
    slugMatch: /chapter-13|forms-validation/i,
    codingProblems: [
      {
        title: "Controlled Form with Validation & Touch Tracking",
        description: "Build a registration form with email and password inputs, touch tracking (`onBlur`), error state messages, and submit validation.",
        language: "javascript",
        starterCode: `import { useState } from "react";\n\nexport default function RegistrationForm() {\n  // Form state, touched state, and errors\n\n  return (\n    <form>\n      {/* Inputs for Email & Password with validation error messages */}\n    </form>\n  );\n}`,
        solutionCode: `import { useState } from "react";\n\nexport default function RegistrationForm() {\n  const [values, setValues] = useState({ email: "", password: "" });\n  const [touched, setTouched] = useState({ email: false, password: false });\n\n  const errors = {\n    email: !values.email.includes("@") ? "Valid email containing @ is required." : "",\n    password: values.password.length < 6 ? "Password must be at least 6 characters." : "",\n  };\n\n  const isValid = !errors.email && !errors.password;\n\n  const handleChange = (e) => {\n    const { name, value } = e.target;\n    setValues((prev) => ({ ...prev, [name]: value }));\n  };\n\n  const handleBlur = (e) => {\n    const { name } = e.target;\n    setTouched((prev) => ({ ...prev, [name]: true }));\n  };\n\n  const handleSubmit = (e) => {\n    e.preventDefault();\n    if (!isValid) return;\n    alert(\`Account created for \${values.email}!\`);\n  };\n\n  return (\n    <form onSubmit={handleSubmit} style={{ padding: "16px", maxWidth: "320px" }}>\n      <h2>Create Account</h2>\n      <div style={{ marginBottom: "12px" }}>\n        <label>Email:</label>\n        <input\n          name="email"\n          type="email"\n          value={values.email}\n          onChange={handleChange}\n          onBlur={handleBlur}\n          style={{ width: "100%", padding: "6px", display: "block" }}\n        />\n        {touched.email && errors.email && (\n          <span style={{ color: "red", fontSize: "12px" }}>{errors.email}</span>\n        )}\n      </div>\n      <div style={{ marginBottom: "12px" }}>\n        <label>Password:</label>\n        <input\n          name="password"\n          type="password"\n          value={values.password}\n          onChange={handleChange}\n          onBlur={handleBlur}\n          style={{ width: "100%", padding: "6px", display: "block" }}\n        />\n        {touched.password && errors.password && (\n          <span style={{ color: "red", fontSize: "12px" }}>{errors.password}</span>\n        )}\n      </div>\n      <button type="submit" disabled={!isValid} style={{ padding: "8px 16px" }}>\n        Register\n      </button>\n    </form>\n  );\n}`,
        hints: [
          "Use a single state object `values` and dynamic field keys `[e.target.name]: e.target.value`.",
          "Track touched fields using `onBlur` so validation errors only appear after user interacts with input.",
          "Disable the submit button when `isValid` is false."
        ],
        expectedOutput: "A registration form validating email format and password length with live touch tracking feedback."
      }
    ],
    revision: [
      {
        question: "Difference between Controlled and Uncontrolled form components?",
        answer: "Controlled components have input values bound to React state (`value` & `onChange`). Uncontrolled components store values in the DOM accessed via `useRef`."
      },
      {
        question: "What is touch tracking (`onBlur`) in form validation?",
        answer: "Touch tracking marks fields as interacted with on blur, ensuring validation errors are shown only after the user leaves the input field."
      },
      {
        question: "How do you extract checkbox values in controlled inputs?",
        answer: "Use `e.target.checked` instead of `e.target.value` for input types like `checkbox`."
      }
    ],
    quiz: [
      {
        question: "Which attribute makes an input element a controlled component in React?",
        options: [
          "Binding its value prop to React state and providing an onChange handler",
          "Adding data-controlled=\"true\"",
          "Wrapping it in a <fieldset>",
          "Using inputRef.current"
        ],
        correctIndex: 0,
        explanation: "A controlled component derives its `value` from React state and updates state via `onChange`."
      },
      {
        question: "Which event fires when an input element loses focus?",
        options: [
          "onBlur",
          "onFocus",
          "onChange",
          "onDeselect"
        ],
        correctIndex: 0,
        explanation: "`onBlur` fires when an element loses focus, ideal for trigger-on-leave form validation."
      },
      {
        question: "For a controlled checkbox input, which event property provides its boolean state?",
        options: [
          "e.target.checked",
          "e.target.value",
          "e.target.selected",
          "e.target.active"
        ],
        correctIndex: 0,
        explanation: "Checkboxes store their checked status in `e.target.checked`."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Multi-Step Checkout Form",
      description: "Build a 2-step checkout wizard (Shipping Info -> Payment Info) with step validation and summary review.",
      requirements: [
        "Manage step state (step 1 vs step 2)",
        "Validate step 1 before allowing Next",
        "Display summary review on submit"
      ],
      estimatedMinutes: 25
    }
  },

  // Chapter 14
  {
    slugMatch: /chapter-14|custom-hooks/i,
    codingProblems: [
      {
        title: "Custom `useLocalStorage` State Synchronization Hook",
        description: "Implement a reusable custom hook `useLocalStorage(key, initialValue)` that reads and persists state to browser `localStorage`.",
        language: "javascript",
        starterCode: `import { useState, useEffect } from "react";\n\nexport function useLocalStorage(key, initialValue) {\n  // Implement local storage read & sync state\n}\n\nexport default function App() {\n  // Test useLocalStorage hook\n}`,
        solutionCode: `import { useState, useEffect } from "react";\n\nexport function useLocalStorage(key, initialValue) {\n  const [value, setValue] = useState(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch (error) {\n      console.error(error);\n      return initialValue;\n    }\n  });\n\n  useEffect(() => {\n    try {\n      window.localStorage.setItem(key, JSON.stringify(value));\n    } catch (error) {\n      console.error(error);\n    }\n  }, [key, value]);\n\n  return [value, setValue];\n}\n\nexport default function App() {\n  const [name, setName] = useLocalStorage("username", "Asif");\n\n  return (\n    <div style={{ padding: "16px" }}>\n      <h2>Stored Username: {name}</h2>\n      <input\n        value={name}\n        onChange={(e) => setName(e.target.value)}\n        placeholder="Enter name..."\n        style={{ padding: "6px" }}\n      />\n      <p style={{ fontSize: "12px", color: "gray" }}>Refresh the page — your input persists in localStorage!</p>\n    </div>\n  );\n}`,
        hints: [
          "Use lazy initial state initializer function `useState(() => { ... })` to read localStorage once on initial render.",
          "Use `JSON.stringify` when writing to localStorage and `JSON.parse` when reading.",
          "Wrap storage operations in `try/catch` to handle browser privacy restriction exceptions."
        ],
        expectedOutput: "A custom hook persisting user input to window.localStorage seamlessly across page refreshes."
      }
    ],
    revision: [
      {
        question: "What is a custom hook in React?",
        answer: "A custom hook is a JavaScript function whose name starts with `use` that can call other React hooks to extract and reuse stateful logic between components."
      },
      {
        question: "Do two components using the same custom hook share state?",
        answer: "No! Custom hooks share stateful *logic*, not state itself. Each component calling a custom hook receives an independent isolated copy of state."
      },
      {
        question: "What are the Rules of Hooks?",
        answer: "1. Only call hooks at the top level of React functions (not inside loops, conditions, or nested functions).\n2. Only call hooks from React function components or custom hooks."
      }
    ],
    quiz: [
      {
        question: "What naming convention must all custom hooks follow in React?",
        options: [
          "Must begin with 'use' in camelCase (e.g., useFetch, useLocalStorage)",
          "Must begin with 'get'",
          "Must end with 'Hook'",
          "Must be capitalized (e.g., UseData)"
        ],
        correctIndex: 0,
        explanation: "React relies on the `use` prefix convention to automatically enforce the Rules of Hooks via linter plugins."
      },
      {
        question: "If ComponentA and ComponentB both invoke `useCounter()`, do they share the same count state?",
        options: [
          "No, each component call creates completely independent state variables",
          "Yes, all custom hooks create global shared singletons",
          "Yes, but only if they are rendered inside the same parent",
          "Only in production mode"
        ],
        correctIndex: 0,
        explanation: "Custom hooks extract reusable stateful logic, but every invocation initializes distinct state instances."
      },
      {
        question: "Where can React hooks be called inside a codebase?",
        options: [
          "Top level of functional React components or other custom hooks",
          "Inside standard JavaScript utility classes",
          "Inside if condition branches",
          "Inside array .map() callbacks"
        ],
        correctIndex: 0,
        explanation: "Hooks must only be called at the top level of function components or custom hooks to preserve hook call order."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Custom `useFetch` Data Hook",
      description: "Create a custom useFetch(url) hook returning { data, loading, error } and test it in a component.",
      requirements: [
        "Encapsulate fetch logic in useFetch hook",
        "Return data, loading, and error tuple/object",
        "Handle URL parameter changes safely"
      ],
      estimatedMinutes: 20
    }
  },

  // Chapter 15
  {
    slugMatch: /chapter-15|performance-optimization/i,
    codingProblems: [
      {
        title: "Optimizing List Render with `React.memo` & `useCallback` font",
        description: "Prevent unnecessary re-renders of child list items when parent state changes by using `React.memo` and `useCallback`.",
        language: "javascript",
        starterCode: `import { useState, useCallback, memo } from "react";\n\n// Wrap ChildItem with React.memo\nfunction ChildItem({ item, onDelete }) {\n  console.log("Rendering Child:", item.title);\n  return (\n    <li>\n      {item.title} <button onClick={() => onDelete(item.id)}>Delete</button>\n    </li>\n  );\n}\n\nexport default function ParentList() {\n  // Memoize onDelete callback using useCallback\n}`,
        solutionCode: `import { useState, useCallback, memo } from "react";\n\nconst ChildItem = memo(function ChildItem({ item, onDelete }) {\n  return (\n    <li style={{ padding: "4px 0" }}>\n      {item.title}{" "}\n      <button onClick={() => onDelete(item.id)} style={{ marginLeft: "8px" }}>Delete</button>\n    </li>\n  );\n});\n\nexport default function ParentList() {\n  const [count, setCount] = useState(0);\n  const [items, setItems] = useState([\n    { id: 1, title: "Item 1" },\n    { id: 2, title: "Item 2" },\n  ]);\n\n  const handleDelete = useCallback((id) => {\n    setItems((prev) => prev.filter((item) => item.id !== id));\n  }, []);\n\n  return (\n    <div style={{ padding: "16px" }}>\n      <h2>Performance Optimization Demo</h2>\n      <button onClick={() => setCount((c) => c + 1)}>\n        Unrelated Parent Counter: {count}\n      </button>\n      <ul style={{ marginTop: "12px" }}>\n        {items.map((item) => (\n          <ChildItem key={item.id} item={item} onDelete={handleDelete} />\n        ))}\n      </ul>\n    </div>\n  );\n}`,
        hints: [
          "Wrap the child component in `memo(function ChildItem(...) { ... })`.",
          "Wrap the callback passed to the child inside `useCallback((id) => { ... }, [])`.",
          "Verify that clicking the parent counter button does not re-render the child items."
        ],
        expectedOutput: "A parent list component where counter updates do not trigger unnecessary child item re-renders."
      }
    ],
    revision: [
      {
        question: "What is `React.memo`?",
        answer: "`React.memo` is a higher-order component that skips re-rendering a component if its incoming props have not changed (shallow comparison)."
      },
      {
        question: "Why can passing inline function props break `React.memo`?",
        answer: "Inline functions create a new function object reference on every render, causing shallow prop comparisons to fail."
      },
      {
        question: "What is code splitting with `React.lazy()` and `<Suspense>`?",
        answer: "Code splitting defers loading component code until it is needed, reducing initial JavaScript bundle payload size."
      }
    ],
    quiz: [
      {
        question: "What type of comparison does `React.memo` perform on component props by default?",
        options: [
          "Shallow comparison",
          "Deep recursive object comparison",
          "JSON string comparison",
          "Pointer comparison only"
        ],
        correctIndex: 0,
        explanation: "`React.memo` performs a shallow comparison of current and previous props."
      },
      {
        question: "Which pair is used to lazy-load dynamic route components in React?",
        options: [
          "React.lazy() and <Suspense>",
          "useMemo() and useEffect()",
          "useCallback() and <Fragment>",
          "createContext() and Provider"
        ],
        correctIndex: 0,
        explanation: "`React.lazy()` dynamically imports components, and `<Suspense>` handles fallback loading UI."
      },
      {
        question: "Should every single component in a React app be wrapped in `React.memo`?",
        options: [
          "No, memoization has memory/comparison overhead and should only be applied to heavy or frequently re-rendered components",
          "Yes, it is required for React apps to build",
          "Yes, it removes all state bugs",
          "Only class components need it"
        ],
        correctIndex: 0,
        explanation: "Indiscriminate memoization adds overhead without benefit; apply it strategically to heavy UI components."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Virtualized Performance List Shell",
      description: "Implement a memoized table row component with useCallback action handlers for rendering large lists efficiently.",
      requirements: [
        "Wrap Row component in React.memo",
        "Memoize row action callbacks",
        "Add render count tracker debug badge"
      ],
      estimatedMinutes: 20
    }
  },

  // Chapter 16
  {
    slugMatch: /chapter-16|typescript-with-react/i,
    codingProblems: [
      {
        title: "Strongly Typed React Modal Component",
        description: "Create a strongly typed modal dialog component in TypeScript defining explicit interfaces for props, variants, and event handlers.",
        language: "javascript",
        starterCode: `// Convert this component to TypeScript interface definitions\n// interface ModalProps { ... }\n\nexport default function Modal({ isOpen, title, onClose, children }) {\n  if (!isOpen) return null;\n  return (\n    <div className="modal-overlay">\n      <div className="modal-content">\n        <h3>{title}</h3>\n        {children}\n        <button onClick={onClose}>Close</button>\n      </div>\n    </div>\n  );\n}`,
        solutionCode: `import React from "react";\n\ninterface ModalProps {\n  isOpen: boolean;\n  title: string;\n  onClose: () => void;\n  variant?: "info" | "warning" | "danger";\n  children: React.ReactNode;\n}\n\nexport default function Modal({\n  isOpen,\n  title,\n  onClose,\n  variant = "info",\n  children,\n}: ModalProps) {\n  if (!isOpen) return null;\n\n  const variantColors = {\n    info: "#2563eb",\n    warning: "#d97706",\n    danger: "#dc2626",\n  };\n\n  return (\n    <div style={{\n      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",\n      display: "grid", placeItems: "center"\n    }}>\n      <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", width: "300px" }}>\n        <h3 style={{ color: variantColors[variant] }}>{title}</h3>\n        <div>{children}</div>\n        <button onClick={onClose} style={{ marginTop: "12px" }}>Close</button>\n      </div>\n    </div>\n  );\n}`,
        hints: [
          "Define `interface ModalProps` with explicit types: `isOpen: boolean`, `title: string`, `onClose: () => void`.",
          "Use `children: React.ReactNode` for elements passed inside JSX tags.",
          "Use union string types for optional variants: `variant?: 'info' | 'warning' | 'danger'`."
        ],
        expectedOutput: "A TypeScript React Modal component with type-checked props, union variants, and event callbacks."
      }
    ],
    revision: [
      {
        question: "Why use TypeScript with React?",
        answer: "TypeScript provides compile-time type safety, autocompletion in IDEs, easier refactoring, and clear interface documentation for component props and state."
      },
      {
        question: "What type should be used for the `children` prop in React TypeScript interfaces?",
        answer: "`React.ReactNode` is the standard type for anything that can be rendered in React (JSX, strings, numbers, fragments, portals, array of nodes)."
      },
      {
        question: "How do you type HTML button click events in TypeScript?",
        answer: "Use `React.MouseEvent<HTMLButtonElement>`."
      }
    ],
    quiz: [
      {
        question: "Which type is recommended for typing the `children` prop in React TypeScript components?",
        options: [
          "React.ReactNode",
          "string only",
          "HTMLElement",
          "any[]"
        ],
        correctIndex: 0,
        explanation: "`React.ReactNode` represents all possible renderable React elements, strings, numbers, or fragments."
      },
      {
        question: "How do you define a generic type parameter for state in `useState` with TypeScript?",
        options: [
          "const [user, setUser] = useState<User | null>(null)",
          "const [user, setUser] = useState(User)",
          "const user = useState(type: User)",
          "const [user, setUser] = useState.User()"
        ],
        correctIndex: 0,
        explanation: "Generics syntax `useState<User | null>(null)` explicitly types state that starts as null."
      },
      {
        question: "What is the proper TypeScript event type for input `onChange` handlers?",
        options: [
          "React.ChangeEvent<HTMLInputElement>",
          "React.InputEvent",
          "Event.Target.Value",
          "HTMLInputChangeEvent"
        ],
        correctIndex: 0,
        explanation: "`React.ChangeEvent<HTMLInputElement>` accurately types input change events."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Typed Form Field Container",
      description: "Define TS interfaces for FormField props (label, error, type, onChange) and implement a typed input component.",
      requirements: [
        "Define FormFieldProps interface",
        "Use React.ChangeEvent<HTMLInputElement>",
        "Enforce optional error string handling"
      ],
      estimatedMinutes: 20
    }
  },

  // Chapter 17
  {
    slugMatch: /chapter-17|testing-react-apps/i,
    codingProblems: [
      {
        title: "Counter Component Unit Test Simulation",
        description: "Write a React Testing Library test script for a `Counter` component verifying initial count render and click event updates.",
        language: "javascript",
        starterCode: `// Write test suite using React Testing Library\n// import { render, screen, fireEvent } from "@testing-library/react";\n// import Counter from "./Counter";\n\ndescribe("Counter Component", () => {\n  test("increments count on button click", () => {\n    // 1. Render component\n    // 2. Assert initial text\n    // 3. Fire click event\n    // 4. Assert updated text\n  });\n});`,
        solutionCode: `import { render, screen, fireEvent } from "@testing-library/react";\nimport Counter from "./Counter";\n\ndescribe("Counter Component", () => {\n  test("renders initial count of 0 and increments on click", () => {\n    render(<Counter />);\n    \n    // Verify initial render\n    const countElement = screen.getByText(/Current Count: 0/i);\n    expect(countElement).toBeInTheDocument();\n    \n    // Simulate button click\n    const incrementButton = screen.getByRole("button", { name: /increment/i });\n    fireEvent.click(incrementButton);\n    \n    // Verify updated count\n    expect(screen.getByText(/Current Count: 1/i)).toBeInTheDocument();\n  });\n});`,
        hints: [
          "Use `render(<Counter />)` to mount component into virtual test DOM.",
          "Query elements using user-visible text or roles: `screen.getByRole('button', { name: /increment/i })`.",
          "Simulate clicks with `fireEvent.click(buttonElement)` and assert with `expect().toBeInTheDocument()`."
        ],
        expectedOutput: "A complete unit test suite verifying component render, button clicks, and DOM assertions."
      }
    ],
    revision: [
      {
        question: "What is the primary philosophy of React Testing Library (RTL)?",
        answer: "\"The more your tests resemble the way your software is used, the more confidence they can give you.\" Tests interact with DOM nodes rather than internal component instances."
      },
      {
        question: "Difference between `getByText`, `queryByText`, and `findByText`?",
        answer: "- `getByText`: Returns node or throws synchronous error if not found.\n- `queryByText`: Returns node or `null` (used for asserting absence).\n- `findByText`: Returns a Promise resolving when element appears (used for async elements)."
      },
      {
        question: "Why prefer `screen.getByRole` over `container.querySelector`?",
        answer: "Querying by accessible roles (e.g. `button`, `heading`) enforces accessibility best practices and makes tests resilient to refactoring."
      }
    ],
    quiz: [
      {
        question: "Which query method in React Testing Library should be used to assert that an element is NOT present in the DOM?",
        options: [
          "queryByText / queryByRole (returns null when not found)",
          "getByText",
          "findByText",
          "selectByText"
        ],
        correctIndex: 0,
        explanation: "`queryBy` queries return `null` instead of throwing an error when an element is absent, allowing `expect(queryByText(...)).toBeNull()`."
      },
      {
        question: "Which query method returns a Promise and should be used when waiting for async elements to appear?",
        options: [
          "findByText / findByRole",
          "getByText",
          "queryByText",
          "matchByText"
        ],
        correctIndex: 0,
        explanation: "`findBy` queries automatically retry until the element appears or times out, returning a Promise."
      },
      {
        question: "What is the recommended tool for user interactions in modern RTL tests?",
        options: [
          "@testing-library/user-event",
          "window.dispatchNativeEvent()",
          "document.click()",
          "jQuery.trigger()"
        ],
        correctIndex: 0,
        explanation: "`user-event` simulates realistic full browser event firing sequence (hover, focus, keydown, keypress, click)."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Test Suite for User Form Validation",
      description: "Write RTL test cases asserting error message visibility when submitting invalid email inputs.",
      requirements: [
        "Render form with RTL",
        "Fire change and submit events",
        "Assert error text in document"
      ],
      estimatedMinutes: 20
    }
  },

  // Chapter 18
  {
    slugMatch: /chapter-18|state-management-with-zustand/i,
    codingProblems: [
      {
        title: "Global Shopping Cart Store with Zustand",
        description: "Create a Zustand global store `useCartStore` with `cart` array state, `addToCart`, `removeFromCart`, `clearCart` actions, and computed total count.",
        language: "javascript",
        starterCode: `import { create } from "zustand";\n\n// Create useCartStore here\n// export const useCartStore = create(...)`,
        solutionCode: `import { create } from "zustand";\n\nexport const useCartStore = create((set, get) => ({\n  cart: [],\n  addToCart: (product) =>\n    set((state) => {\n      const exists = state.cart.find((item) => item.id === product.id);\n      if (exists) {\n        return {\n          cart: state.cart.map((item) =>\n            item.id === product.id ? { ...item, qty: item.qty + 1 } : item\n          ),\n        };\n      }\n      return { cart: [...state.cart, { ...product, qty: 1 }] };\n    }),\n  removeFromCart: (id) =>\n    set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),\n  clearCart: () => set({ cart: [] }),\n  getTotalCount: () => get().cart.reduce((total, item) => total + item.qty, 0),\n}));\n\nexport function ShoppingCartHeader() {\n  const cart = useCartStore((state) => state.cart);\n  const getTotalCount = useCartStore((state) => state.getTotalCount);\n  const clearCart = useCartStore((state) => state.clearCart);\n\n  return (\n    <div style={{ padding: "12px", borderBottom: "1px solid #ccc" }}>\n      <span>🛒 Cart Total Items: <strong>{getTotalCount()}</strong></span>\n      <button onClick={clearCart} style={{ marginLeft: "12px" }}>Clear Cart</button>\n    </div>\n  );\n}`,
        hints: [
          "Import `create` from 'zustand' and call `create((set, get) => ({ ... }))`.",
          "Use `set((state) => ({ ... }))` to update store state immutably.",
          "In components, select specific slice of state: `useCartStore(state => state.cart)` for optimal re-render performance."
        ],
        expectedOutput: "A Zustand global store managing cart state across independent header and product list components."
      }
    ],
    revision: [
      {
        question: "What is Zustand and why is it popular in React?",
        answer: "Zustand is a small, fast, un-opinionated state management library based on hooks. It eliminates boilerplate, requires no Context Providers, and optimizes re-renders via atomic selectors."
      },
      {
        question: "Do you need a `<Provider>` wrapper when using Zustand?",
        answer: "No! Zustand stores do not require wrapping your component tree in Context Providers."
      },
      {
        question: "How do components subscribe to specific state slices in Zustand?",
        answer: "By passing a selector function: `const count = useStore(state => state.count)`. The component will only re-render when `count` changes."
      }
    ],
    quiz: [
      {
        question: "Which function from 'zustand' creates a global hook store?",
        options: [
          "create()",
          "createStore()",
          "configureStore()",
          "initZustand()"
        ],
        correctIndex: 0,
        explanation: "`create()` defines a custom hook store that can be called directly inside any React component."
      },
      {
        question: "What is a main performance advantage of selector functions in Zustand?",
        options: [
          "Components only re-render when the selected slice of state changes",
          "It automatically encrypts state in memory",
          "It turns React into a multi-threaded process",
          "It eliminates all backend API calls"
        ],
        correctIndex: 0,
        explanation: "Selectors pick specific state fields, preventing re-renders when unrelated store fields update."
      },
      {
        question: "Can Zustand store actions be called directly outside React components (e.g. in plain JS files)?",
        options: [
          "Yes, via store.getState() and store.setState()",
          "No, stores can only run inside JSX",
          "Only in Next.js server components",
          "Only when using Webpack"
        ],
        correctIndex: 0,
        explanation: "Zustand store instances provide `getState()` and `setState()` for access outside React lifecycle."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Persistent Settings Store with Zustand",
      description: "Create a Zustand settings store with theme & fontSize state using persist middleware.",
      requirements: [
        "Define Zustand store with set()",
        "Add theme & font size state handlers",
        "Subscribe with atomic slice selector"
      ],
      estimatedMinutes: 20
    }
  },

  // Chapter 19
  {
    slugMatch: /chapter-19|introduction-to-next-js/i,
    codingProblems: [
      {
        title: "Next.js App Router Page & Client Component Separation",
        description: "Build a Next.js App Router server page `app/users/page.js` fetching user data on the server and embedding a `'use client'` interactive like button.",
        language: "javascript",
        starterCode: `// Client Component (LikeButton.jsx)\n// 'use client';\n\n// Server Component Page (page.jsx)\nexport default async function UsersPage() {\n  // Fetch users on server and render client button\n}`,
        solutionCode: `// --- LikeButton.jsx ---\n'use client';\n\nimport { useState } from "react";\n\nexport function LikeButton({ initialLikes = 0 }) {\n  const [likes, setLikes] = useState(initialLikes);\n  return (\n    <button onClick={() => setLikes((l) => l + 1)} style={{ padding: "6px 12px" }}>\n      ❤️ {likes} Likes\n    </button>\n  );\n}\n\n// --- page.jsx (Server Component) ---\nexport default async function UsersPage() {\n  // Server-side data fetching directly in component body\n  const res = await fetch("https://jsonplaceholder.typicode.com/users", { cache: "no-store" });\n  const users = await res.json();\n\n  return (\n    <main style={{ padding: "20px", fontFamily: "sans-serif" }}>\n      <h1>Next.js App Router — Users List</h1>\n      <p>Fetched on server at request time.</p>\n      <ul>\n        {users.slice(0, 3).map((user) => (\n          <li key={user.id} style={{ margin: "12px 0" }}>\n            <strong>{user.name}</strong> ({user.company?.name})\n            <div style={{ marginTop: "4px" }}>\n              <LikeButton initialLikes={0} />\n            </div>\n          </li>\n        ))}\n      </ul>\n    </main>\n  );\n}`,
        hints: [
          "By default, all components inside Next.js App Router (`app/` directory) are React Server Components.",
          "Add `'use client'` at the very top of files that use hooks like `useState`, `useEffect`, or event handlers (`onClick`).",
          "Server components can directly `await fetch()` data without `useEffect`."
        ],
        expectedOutput: "A Next.js App Router page combining server-side data fetching with interactive client-side components."
      }
    ],
    revision: [
      {
        question: "What is Next.js?",
        answer: "Next.js is a full-stack React framework built by Vercel providing server-side rendering (SSR), static site generation (SSG), file-system routing, and built-in optimizations."
      },
      {
        question: "Difference between Server Components and Client Components in Next.js App Router?",
        answer: "- **Server Components**: Render exclusively on the server, zero client JavaScript bundle size, direct access to backend resources.\n- **Client Components** (`'use client'`): Render on server and hydrate on client, support interactivity, hooks, and DOM event listeners."
      },
      {
        question: "What is the purpose of `'use client'` directive?",
        answer: "It marks the boundary where Next.js switches from Server Component rendering to Client Component hydration."
      }
    ],
    quiz: [
      {
        question: "What is the default component type in Next.js App Router (`app/` directory)?",
        options: [
          "React Server Component",
          "Client Component",
          "Class Component",
          "Web Worker Component"
        ],
        correctIndex: 0,
        explanation: "In Next.js App Router, all components are React Server Components by default unless marked with `'use client'`."
      },
      {
        question: "Which file convention defines the layout wrapper shared across routes in Next.js App Router?",
        options: [
          "layout.js / layout.tsx",
          "page.js",
          "template.js",
          "App.js"
        ],
        correctIndex: 0,
        explanation: "`layout.js` defines UI shared across sub-routes (headers, sidebars, footers)."
      },
      {
        question: "Why should you use the Next.js `<Image />` component over standard HTML `<img>`?",
        options: [
          "Automatic image optimization, resizing, webp conversion, and lazy loading",
          "It converts images to CSS code",
          "It disables image downloads",
          "It stores images in MongoDB"
        ],
        correctIndex: 0,
        explanation: "Next.js `<Image />` optimizes images on-the-fly for modern formats and device viewports."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Next.js Static & Server Route Shell",
      description: "Create a Next.js App Router folder structure with shared layout.js, page.js, and client interactivity button.",
      requirements: [
        "Create App Router folder layout",
        "Mark interactive buttons with 'use client'",
        "Fetch data asynchronously in server page"
      ],
      estimatedMinutes: 25
    }
  },

  // Chapter 20
  {
    slugMatch: /chapter-20|react-project-structure-best-practices/i,
    codingProblems: [
      {
        title: "Modular Feature Folder Architecture Refactoring",
        description: "Refactor a messy single-file component into clean feature folders: `components/`, `hooks/`, `services/`, and `utils/`.",
        language: "javascript",
        starterCode: `// Refactor monolithic code into clean modular exports:\n// 1. services/userService.js (API call)\n// 2. hooks/useUsers.js (Custom Hook)\n// 3. components/UserList.jsx (UI component)\n\nexport default function MonolithicApp() {\n  // 100 lines of mixed API, state, and markup\n}`,
        solutionCode: `// --- services/userService.js ---\nexport async function getCleanUsers() {\n  const res = await fetch("https://jsonplaceholder.typicode.com/users");\n  if (!res.ok) throw new Error("Failed to fetch users");\n  return res.json();\n}\n\n// --- hooks/useUsers.js ---\nimport { useState, useEffect } from "react";\nimport { getCleanUsers } from "../services/userService";\n\nexport function useUsers() {\n  const [users, setUsers] = useState([]);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    getCleanUsers()\n      .then(setUsers)\n      .catch(console.error)\n      .finally(() => setLoading(false));\n  }, []);\n\n  return { users, loading };\n}\n\n// --- components/UserList.jsx ---\nimport { useUsers } from "../hooks/useUsers";\n\nexport default function UserList() {\n  const { users, loading } = useUsers();\n  if (loading) return <p>Loading users...</p>;\n\n  return (\n    <div>\n      <h3>Modular User List</h3>\n      <ul>\n        {users.slice(0, 3).map((u) => (\n          <li key={u.id}>{u.name}</li>\n        ))}\n      </ul>\n    </div>\n  );\n}`,
        hints: [
          "Separate data fetching API logic into service files.",
          "Keep state management and side effects inside custom hooks.",
          "Keep UI components presentational and clean under 100 lines."
        ],
        expectedOutput: "A clean feature-folder codebase separating API services, state custom hooks, and presentational UI components."
      }
    ],
    revision: [
      {
        question: "What is Feature-based folder structure in React?",
        answer: "Grouping files by feature module (e.g. `features/auth/`, `features/cart/`) containing their components, hooks, tests, and API services co-located together."
      },
      {
        question: "What is the Single Responsibility Principle (SRP) for React components?",
        answer: "A component should do one thing well. Separate container/data logic from UI presentation."
      },
      {
        question: "What are barrel exports (`index.js`)?",
        answer: "An `index.js` file inside a directory that re-exports components to clean up import statements: `import { Button } from '@/components'`."
      }
    ],
    quiz: [
      {
        question: "Why is feature-based folder organization preferred for scalable React projects?",
        options: [
          "Co-locating components, hooks, and tests by feature makes codebase easier to navigate and maintain",
          "It reduces JavaScript bundle file size",
          "It removes the need for Git version control",
          "It automatically compiles TypeScript"
        ],
        correctIndex: 0,
        explanation: "Feature organization scales cleanly as apps grow because related code lives together."
      },
      {
        question: "What is the purpose of barrel exports (`index.js` files)?",
        options: [
          "To provide clean centralized export points for directories",
          "To store environment secrets",
          "To execute database migrations",
          "To compress CSS files"
        ],
        correctIndex: 0,
        explanation: "Barrel files re-export directory contents so consumers can import multiple symbols cleanly."
      },
      {
        question: "Which practice helps keep React components readable and maintainable?",
        options: [
          "Keeping component files small (< 150 lines) and extracting hooks for logic",
          "Putting all app components into a single index.jsx file",
          "Using global window variables for component state",
          "Avoiding comments and typescript types"
        ],
        correctIndex: 0,
        explanation: "Focused, small components with extracted custom hooks are far easier to test and maintain."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Feature Folder Module Shell",
      description: "Create a feature module structure (services/, hooks/, components/) for a Product Catalog module.",
      requirements: [
        "Export service API call function",
        "Create custom useProducts hook",
        "Render presentational ProductGrid component"
      ],
      estimatedMinutes: 20
    }
  },

  // Chapter 21
  {
    slugMatch: /chapter-21|building-a-full-react-project-notes-app/i,
    codingProblems: [
      {
        title: "Full CRUD Notes Application",
        description: "Build a complete Notes application supporting Create, Read search filter, Category tag selection, and Delete operations with localStorage persistence.",
        language: "javascript",
        starterCode: `import { useState } from "react";\n\nexport default function NotesApp() {\n  const [notes, setNotes] = useState([]);\n  const [title, setTitle] = useState("");\n  const [search, setSearch] = useState("");\n\n  // Implement Add Note, Delete Note, Search Filter\n\n  return (\n    <div>\n      {/* Notes Application UI */}\n    </div>\n  );\n}`,
        solutionCode: `import { useState, useEffect } from "react";\n\nexport default function NotesApp() {\n  const [notes, setNotes] = useState(() => {\n    const saved = localStorage.getItem("app_notes");\n    return saved ? JSON.parse(saved) : [\n      { id: 1, title: "Learn React Hooks", category: "Work" },\n      { id: 2, title: "Buy Groceries", category: "Personal" },\n    ];\n  });\n  const [title, setTitle] = useState("");\n  const [category, setCategory] = useState("Work");\n  const [search, setSearch] = useState("");\n\n  useEffect(() => {\n    localStorage.setItem("app_notes", JSON.stringify(notes));\n  }, [notes]);\n\n  const handleAddNote = (e) => {\n    e.preventDefault();\n    if (!title.trim()) return;\n    const newNote = { id: Date.now(), title, category };\n    setNotes([newNote, ...notes]);\n    setTitle("");\n  };\n\n  const handleDeleteNote = (id) => {\n    setNotes(notes.filter((n) => n.id !== id));\n  };\n\n  const filteredNotes = notes.filter((n) =>\n    n.title.toLowerCase().includes(search.toLowerCase())\n  );\n\n  return (\n    <div style={{ padding: "20px", maxWidth: "450px", fontFamily: "sans-serif" }}>\n      <h2>📝 React Notes Manager</h2>\n      <form onSubmit={handleAddNote} style={{ marginBottom: "16px" }}>\n        <input\n          value={title}\n          onChange={(e) => setTitle(e.target.value)}\n          placeholder="Note title..."\n          style={{ padding: "8px", width: "60%" }}\n        />\n        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: "8px" }}>\n          <option value="Work">Work</option>\n          <option value="Personal">Personal</option>\n        </select>\n        <button type="submit" style={{ padding: "8px 12px" }}>Add</button>\n      </form>\n\n      <input\n        value={search}\n        onChange={(e) => setSearch(e.target.value)}\n        placeholder="Search notes..."\n        style={{ padding: "6px", width: "100%", marginBottom: "12px" }}\n      />\n\n      <ul style={{ listStyle: "none", padding: 0 }}>\n        {filteredNotes.map((n) => (\n          <li key={n.id} style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "6px", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>\n            <span><strong>[{n.category}]</strong> {n.title}</span>\n            <button onClick={() => handleDeleteNote(n.id)}>Delete</button>\n          </li>\n        ))}\n      </ul>\n    </div>\n  );\n}`,
        hints: [
          "Initialize state from `localStorage` using lazy initializer function `useState(() => { ... })`.",
          "Use `.filter()` for search filtering dynamically without mutating original state.",
          "Sync notes state to `localStorage` in `useEffect([notes])`."
        ],
        expectedOutput: "A complete CRUD Notes application with search filtering, category tagging, and local persistence."
      }
    ],
    revision: [
      {
        question: "What are key steps when building a full React project from scratch?",
        answer: "1. Break UI into component hierarchy.\n2. Build static version in React.\n3. Identify minimal representation of UI state.\n4. Determine where state should live.\n5. Add inverse data flow (events & state updaters)."
      },
      {
        question: "How do you manage persistent state in full React web apps?",
        answer: "Use local browser storage for client preferences, or sync with backend databases via REST / GraphQL APIs."
      },
      {
        question: "What is an Optimistic UI update?",
        answer: "Updating client UI state immediately before server API confirmation, reverting only if server request fails."
      }
    ],
    quiz: [
      {
        question: "When building a full React application, what should you design first?",
        options: [
          "Component hierarchy and component wireframe breakdown",
          "Webpack config files",
          "Production server deployment scripts",
          "CSS animations"
        ],
        correctIndex: 0,
        explanation: "Breaking down UI into a clean hierarchy of components is the fundamental first step in React design."
      },
      {
        question: "What pattern allows instant UI feedback before backend API response completes?",
        options: [
          "Optimistic UI updates",
          "Pessimistic DOM locking",
          "Synchronous page blocking",
          "Server-side compilation"
        ],
        correctIndex: 0,
        explanation: "Optimistic UI immediately updates local state to deliver snappy user experience."
      },
      {
        question: "Which array method creates a new array with an added element without mutating the original state?",
        options: [
          "Spread syntax [...prevArray, newItem]",
          "prevArray.push(newItem)",
          "prevArray.splice()",
          "prevArray.sort()"
        ],
        correctIndex: 0,
        explanation: "Spread syntax `[...prev, newItem]` creates a brand new array copy preserving immutability."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Full Task Dashboard with Categories",
      description: "Build a complete task dashboard with task creation, category filter tags, completion counters, and search.",
      requirements: [
        "Implement Add & Delete task actions",
        "Add category filter selection",
        "Persist task list in localStorage"
      ],
      estimatedMinutes: 30
    }
  },

  // Chapter 22
  {
    slugMatch: /chapter-22|deployment-going-to-production/i,
    codingProblems: [
      {
        title: "Production Environment Configuration Utility",
        description: "Create an environment configuration helper `config.js` that resolves API base URLs, feature flags, and debug modes depending on `process.env.NODE_ENV`.",
        language: "javascript",
        starterCode: `// Create production environment config utility\n// export const config = { ... }\n\nexport default function AppConfigViewer() {\n  // Render current environment API URL and settings\n}`,
        solutionCode: `export const config = {\n  env: process.env.NODE_ENV || "development",\n  isProduction: process.env.NODE_ENV === "production",\n  apiUrl: process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || "http://localhost:5000",\n  enableAnalytics: process.env.NODE_ENV === "production",\n};\n\nexport default function AppConfigViewer() {\n  return (\n    <div style={{ padding: "16px", border: "1px solid #0284c7", borderRadius: "10px", background: "#f0f9ff" }}>\n      <h3 style={{ color: "#0369a1" }}>Environment Configuration</h3>\n      <ul style={{ fontSize: "14px", lineHeight: "1.8" }}>\n        <li><strong>Environment Mode:</strong> {config.env}</li>\n        <li><strong>Is Production:</strong> {config.isProduction ? "Yes ✅" : "No (Dev) 🛠️"}</li>\n        <li><strong>API Public URL:</strong> {config.apiUrl}</li>\n        <li><strong>Analytics Enabled:</strong> {config.enableAnalytics ? "Enabled 📊" : "Disabled"}</li>\n      </ul>\n    </div>\n  );\n}`,
        hints: [
          "Check `process.env.NODE_ENV === 'production'` to detect production builds.",
          "In Next.js, client-accessible environment variables must start with `NEXT_PUBLIC_`.",
          "In Create React App, client variables must start with `REACT_APP_`."
        ],
        expectedOutput: "An environment configuration manager resolving production vs development API URLs and analytics toggles."
      }
    ],
    revision: [
      {
        question: "What happens during `npm run build` in React applications?",
        answer: "The build step compiles, minifies, bundles JavaScript/CSS assets, strips dead code, and optimizes assets into a static `dist/` or `.next/` directory for deployment."
      },
      {
        question: "Why must environment variables exposed to client bundle start with `NEXT_PUBLIC_` or `REACT_APP_`?",
        answer: "Because server-side secrets must never leak to client browser code. Build tools only inline variables explicitly prefixed for public client exposure."
      },
      {
        question: "Where can static React production builds be hosted?",
        answer: "Static builds can be hosted on Vercel, Netlify, AWS S3 / CloudFront, Cloudflare Pages, Firebase Hosting, or Nginx servers."
      }
    ],
    quiz: [
      {
        question: "In Next.js, which prefix is required for environment variables to be accessible in client-side browser code?",
        options: [
          "NEXT_PUBLIC_",
          "REACT_APP_",
          "PUBLIC_VAR_",
          "CLIENT_SECRET_"
        ],
        correctIndex: 0,
        explanation: "Next.js inlines only variables starting with `NEXT_PUBLIC_` into the client browser bundle."
      },
      {
        question: "What is the primary output of a production build command like `npm run build`?",
        options: [
          "Minified, bundled static JavaScript, CSS, and HTML files optimized for production deployment",
          "Raw uncompiled source code files",
          "A MongoDB database dump file",
          "A Docker container image automatically"
        ],
        correctIndex: 0,
        explanation: "Production builds bundle and minify code for fast network delivery to users."
      },
      {
        question: "What is CORS (Cross-Origin Resource Sharing) in React web app deployments?",
        answer: "A browser security mechanism that restricts web pages from requesting API resources hosted on a different domain unless allowed by backend headers",
        options: [
          "A browser security mechanism restricting cross-domain API requests unless permitted by API headers",
          "A CSS styling engine",
          "A React hook for routing",
          "A database query engine"
        ],
        correctIndex: 0,
        explanation: "CORS HTTP headers sent by APIs allow deployed frontend domains (e.g. `https://asif.to`) to fetch API resources."
      }
    ],
    build: {
      enabled: true,
      title: "Build a Production Deployment Readiness Checker",
      description: "Build a checklist component verifying API URL configuration, error logging, and SEO title setup before production build.",
      requirements: [
        "Parse env config settings",
        "Verify NEXT_PUBLIC_API_URL existence",
        "Render production readiness checklist"
      ],
      estimatedMinutes: 20
    }
  }
];

function uniqueIds(values = []) {
  const seen = new Set();
  return values
    .map((item) => item?._id || item)
    .filter(Boolean)
    .filter((item) => {
      const id = String(item);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
}

async function upsertQuestion({ course, chapter, stage, index, data }) {
  const tag = `${PREFIX}:${chapter.slug}:${stage}:${index + 1}`;
  const isRevision = stage === "revise";

  const payload = {
    type: "quiz",
    category: chapter.category || null,
    course: course._id,
    courses: [course._id],
    question: isRevision ? data.question : `[Practice Quiz] ${data.question}`,
    options: isRevision
      ? [data.answer, "Option B", "Option C", "Option D"]
      : data.options,
    correctIndex: isRevision ? 0 : data.correctIndex,
    explanation: data.explanation || data.answer,
    quizEnabled: !isRevision,
    flashcardEnabled: true,
    flashcardAnswer: isRevision ? data.answer : (data.options ? data.options[data.correctIndex] : data.explanation),
    tag,
    difficulty: index === 0 ? "easy" : index === 1 ? "medium" : "hard",
    status: "published",
    order: index,
  };

  let existing = await Question.findOne({
    type: "quiz",
    courses: course._id,
    tag,
  });

  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
  } else {
    existing = await Question.create(payload);
  }

  // Update question learningMappings for this chapter
  const mapping = {
    course: course._id,
    category: chapter.category || null,
    chapter: chapter._id,
    source: "manual",
    confidence: 100,
    mappedAt: new Date(),
  };

  const otherMappings = (existing.learningMappings || []).filter(
    (m) => String(m.chapter?._id || m.chapter) !== String(chapter._id)
  );
  otherMappings.push(mapping);
  existing.learningMappings = otherMappings;
  await existing.save();

  return existing._id;
}

async function seed() {
  console.log("======================================================================");
  console.log("Seeding ReactJS Course Practice, Revision, Quiz & Code Problems");
  console.log("======================================================================\n");

  await connectDB();

  const course = await Course.findOne({
    $or: [
      { slug: "reactjs" },
      { slug: "react-js" },
      { slug: "react" },
      { techId: "reactjs" },
      { title: /react/i },
    ],
  }).sort({ createdAt: 1 });

  if (!course) {
    console.error("ReactJS course not found!");
    process.exit(1);
  }

  console.log(`Course Found: ${course.title} [ID: ${course._id}]\n`);

  const chapters = await Chapter.find({ course: course._id }).sort({ order: 1 });
  console.log(`Found ${chapters.length} chapters to populate.\n`);

  let populatedCount = 0;

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const data = CHAPTER_DATA.find((c) => c.slugMatch.test(chapter.slug)) || CHAPTER_DATA[i % CHAPTER_DATA.length];

    console.log(`[${i + 1}/${chapters.length}] Populating Chapter: ${chapter.title} (${chapter.slug})`);

    // 1. Upsert Revision Questions
    const revisionIds = [];
    if (data.revision && data.revision.length) {
      for (let rIdx = 0; rIdx < data.revision.length; rIdx++) {
        const qId = await upsertQuestion({
          course,
          chapter,
          stage: "revise",
          index: rIdx,
          data: data.revision[rIdx],
        });
        revisionIds.push(qId);
      }
    }

    // 2. Upsert Quiz Practice Questions
    const practiceIds = [];
    if (data.quiz && data.quiz.length) {
      for (let qIdx = 0; qIdx < data.quiz.length; qIdx++) {
        const qId = await upsertQuestion({
          course,
          chapter,
          stage: "practice",
          index: qIdx,
          data: data.quiz[qIdx],
        });
        practiceIds.push(qId);
      }
    }

    // 3. Update Chapter object
    const currentLearning = chapter.learningActivities || {};

    chapter.codingProblems = data.codingProblems || [];
    chapter.learningActivities = {
      ...currentLearning,
      revisionQuestions: uniqueIds([...(currentLearning.revisionQuestions || []), ...revisionIds]),
      practiceQuestions: uniqueIds([...(currentLearning.practiceQuestions || []), ...practiceIds]),
      build: {
        enabled: data.build?.enabled ?? true,
        title: data.build?.title || `Build ${chapter.title} Project`,
        description: data.build?.description || `Apply concepts learned in ${chapter.title}.`,
        requirements: data.build?.requirements || ["Create a clean React component", "Verify functionality"],
        estimatedMinutes: data.build?.estimatedMinutes || 20,
      },
    };

    chapter.relatedQuestions = uniqueIds([
      ...(chapter.relatedQuestions || []),
      ...revisionIds,
      ...practiceIds,
    ]);

    await chapter.save();
    populatedCount++;

    console.log(`   ✓ ${data.codingProblems?.length || 0} Coding Problem(s) with Solution Code & Hints`);
    console.log(`   ✓ ${revisionIds.length} Revision Flashcards mapped`);
    console.log(`   ✓ ${practiceIds.length} Quiz Questions mapped`);
    console.log(`   ✓ Build challenge: "${chapter.learningActivities.build.title}"\n`);
  }

  console.log("======================================================================");
  console.log(`Successfully populated practice, revision, quiz & solutions for ALL ${populatedCount} React chapters!`);
  console.log("======================================================================\n");

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error("Seeder failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
