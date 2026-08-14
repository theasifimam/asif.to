import { TECHNOLOGIES } from "./config";

const js = (slug, title, difficulty, topics, description, code, hints = [], testCases = []) => ({
  slug, title, technology: "javascript", difficulty, topics, description, hints,
  examples: [{ input: "Use the sample call in the starter file", output: "Compare the console value with the expected comment" }],
  starterFiles: { "/index.js": code },
  testCases,
});
const web = (technology, slug, title, difficulty, topics, description, html, css = "", script = "") => ({
  slug, title, technology, difficulty, topics, description,
  examples: [{ input: "Edit the supplied HTML, CSS, and JavaScript", output: "Inspect the rendered preview and browser console" }],
  starterFiles: { "/index.html": html, "/style.css": css, "/index.js": script },
});
const react = (slug, title, difficulty, topics, description, code) => ({
  slug, title, technology: "react", difficulty, topics, description,
  examples: [{ input: "Interact with the rendered component", output: "The UI should update without a page reload" }],
  starterFiles: { "/App.js": code },
});
const next = (slug, title, difficulty, topics, description, code) => ({
  slug, title, technology: "nextjs", difficulty, topics, description,
  examples: [{ input: "Edit the client-renderable page", output: "Inspect the Next.js browser preview" }],
  starterFiles: { "/pages/index.js": code },
});

export const PRACTICE_PROBLEMS = [
  js("reverse-a-string", "Reverse a String", "Easy", ["Strings", "Algorithms"], "Write a function that returns the supplied string in reverse order. Preserve spaces and punctuation.", `function reverseString(value) {\n  // Write your solution here\n  return value;\n}\n\nconsole.log(reverseString("hello")); // expected: olleh`, ["Strings can be converted to arrays."], [{ functionName: "reverseString", args: ["hello"], expected: "olleh" }, { functionName: "reverseString", args: ["Asif to"], expected: "ot fisA" }, { functionName: "reverseString", args: [""], expected: "" }]),
  js("remove-duplicates", "Remove Duplicates From Array", "Easy", ["Arrays", "Algorithms"], "Return a new array containing each value only once, without changing the input array.", `function unique(values) {\n  return values;\n}\n\nconsole.log(unique([1, 2, 2, 3, 3])); // expected: [1, 2, 3]`, [], [{ functionName: "unique", args: [[1, 2, 2, 3, 3]], expected: [1, 2, 3] }, { functionName: "unique", args: [[]], expected: [] }]),
  js("character-frequency", "Character Frequency", "Medium", ["Strings", "Objects"], "Count how often every character occurs and return an object of character-to-count pairs.", `function frequency(text) {\n  const counts = {};\n  // Build the frequency map\n  return counts;\n}\n\nconsole.log(frequency("banana"));`),
  js("flatten-an-array", "Flatten an Array", "Medium", ["Arrays", "Algorithms"], "Flatten a nested array of arbitrary depth without mutating it.", `function flatten(values) {\n  // Return one flat array\n  return values;\n}\n\nconsole.log(flatten([1, [2, [3, 4]]]));`),
  js("debounce-function", "Debounce Function", "Hard", ["Functions", "Async/Await"], "Implement debounce so a function runs only after calls have stopped for the given delay.", `function debounce(fn, delay) {\n  // Return a debounced function\n}\n\nconst say = debounce((value) => console.log(value), 200);\nsay("first");\nsay("latest");`),
  web("html", "accessible-contact-form", "Accessible Contact Form", "Easy", ["Accessibility", "Forms"], "Create a labelled contact form with appropriate input types, autocomplete values, and accessible validation hints.", `<main>\n  <h1>Contact us</h1>\n  <!-- Add an accessible form -->\n</main>`),
  web("css", "responsive-card", "Responsive Card", "Easy", ["Responsive Design"], "Style a card that remains readable and balanced from a narrow phone to a desktop.", `<article class="card"><h1>Responsive card</h1><p>Make me adapt to the viewport.</p></article>`, `.card {\n  /* Add responsive card styles */\n}`),
  web("css", "flexbox-navbar", "Flexbox Navbar", "Easy", ["Flexbox", "Responsive Design"], "Use Flexbox to align a brand and navigation links, then adapt the layout on small screens.", `<nav><strong>asif.to</strong><div><a href="#">Learn</a> <a href="#">Practice</a></div></nav>`, `nav {\n  /* Build the flex layout */\n}`),
  web("css", "css-grid-layout", "CSS Grid Layout", "Medium", ["Grid", "Responsive Design"], "Build a responsive grid whose cards automatically wrap without fixed breakpoint columns.", `<main class="grid">${"<article>Card</article>".repeat(6)}</main>`, `.grid {\n  /* Use CSS Grid here */\n}`),
  web("web", "accordion", "Accordion", "Easy", ["DOM", "Events"], "Create an accessible accordion whose button controls a collapsible answer.", `<button aria-expanded="false" aria-controls="answer">What is JavaScript?</button>\n<p id="answer" hidden>A language for the web.</p>`, `body { font-family: sans-serif; padding: 2rem; }`, `const button = document.querySelector("button");\n// Toggle the answer and aria-expanded`),
  web("web", "modal", "Modal", "Medium", ["DOM", "Events"], "Open and close a modal with buttons and the Escape key while keeping its semantics accessible.", `<button id="open">Open modal</button>\n<dialog><p>Hello!</p><button id="close">Close</button></dialog>`, `body { font-family: sans-serif; padding: 2rem; }`, `const dialog = document.querySelector("dialog");\n// Wire up the controls`),
  web("web", "tabs", "Tabs", "Medium", ["DOM", "Components"], "Build keyboard-friendly tabs that reveal one associated panel at a time.", `<div role="tablist"><button role="tab">HTML</button><button role="tab">CSS</button></div>\n<section role="tabpanel">Choose a tab.</section>`, `body { font-family: sans-serif; padding: 2rem; }`, `// Add tab selection behavior`),
  web("web", "todo-list", "Todo List", "Hard", ["DOM", "Events"], "Build a todo list that adds, completes, and removes items without reloading the page.", `<form><input aria-label="New task"><button>Add</button></form><ul></ul>`, `body { font-family: sans-serif; padding: 2rem; }`, `const form = document.querySelector("form");\n// Add todo behavior`),
  react("counter", "Counter", "Easy", ["State", "Hooks"], "Build a counter with increment, decrement, and reset controls.", `import { useState } from "react";\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;\n}`),
  react("accordion", "Accordion", "Easy", ["Components", "State"], "Create a reusable controlled accordion section with an accessible toggle.", `import { useState } from "react";\nexport default function App() {\n  const [open, setOpen] = useState(false);\n  return <main>{/* Build the accordion */}</main>;\n}`),
  react("todo-list", "Todo List", "Medium", ["State", "Forms"], "Create a todo list with immutable state updates and stable item keys.", `import { useState } from "react";\nexport default function App() {\n  const [items, setItems] = useState([]);\n  return <main>{/* Add form and list */}</main>;\n}`),
  react("controlled-form", "Controlled Form", "Medium", ["Forms", "State"], "Build a controlled profile form and render a submitted summary.", `import { useState } from "react";\nexport default function App() {\n  const [name, setName] = useState("");\n  return <form>{/* Add controlled fields */}</form>;\n}`),
  react("search-filter", "Search Filter", "Medium", ["State", "Performance"], "Filter a list as the user types and show a useful empty state.", `import { useState } from "react";\nconst items = ["React", "Next.js", "JavaScript", "CSS"];\nexport default function App() {\n  const [query, setQuery] = useState("");\n  return <main>{/* Build search UI */}</main>;\n}`),
  react("use-debounce-hook", "useDebounce Hook", "Hard", ["Hooks", "Performance"], "Implement a reusable useDebounce hook that cleans up its timeout when dependencies change.", `import { useEffect, useState } from "react";\nfunction useDebounce(value, delay) {\n  // Implement the hook\n}\nexport default function App() {\n  const [value, setValue] = useState("");\n  return <input value={value} onChange={(e) => setValue(e.target.value)} />;\n}`),
  next("client-counter", "Next.js Client Counter", "Easy", ["Components"], "Use a client-side React component in a Next.js page. The browser sandbox demonstrates client behavior only.", `import { useState } from "react";\nexport default function Home() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;\n}`),
  { ...next("dynamic-route-links", "Dynamic Route Links", "Medium", ["Routing"], "Render product links using Next.js Link. Use the preview navigator to go Back, Forward, Refresh, or enter a route.", `import Link from "next/link";\nconst products = [{ id: 1, name: "Keyboard" }, { id: 2, name: "Mouse" }];\nexport default function Home() {\n  return <ul>{products.map((p) => <li key={p.id}><Link href={\`/products/\${p.id}\`}>{p.name}</Link></li>)}</ul>;\n}`), starterFiles: { "/pages/index.js": `import Link from "next/link";\nconst products = [{ id: 1, name: "Keyboard" }, { id: 2, name: "Mouse" }];\nexport default function Home() {\n  return <ul>{products.map((p) => <li key={p.id}><Link href={\`/products/\${p.id}\`}>{p.name}</Link></li>)}</ul>;\n}`, "/pages/products/[id].js": `import { useRouter } from "next/router";\nimport Link from "next/link";\nexport default function Product() {\n  const { query } = useRouter();\n  return <main><h1>Product {query.id}</h1><Link href="/">Home</Link></main>;\n}` } },
  next("optimized-navigation", "Client Navigation", "Easy", ["Pages", "Routing"], "Create a small navigation header with Next.js Link and active-looking styles.", `import Link from "next/link";\nexport default function Home() {\n  return <nav><Link href="/">Home</Link> · <Link href="/about">About</Link></nav>;\n}`),
];

export function getProblems(technology) { return PRACTICE_PROBLEMS.filter((problem) => problem.technology === technology); }
export function getProblem(technology, slug) { return PRACTICE_PROBLEMS.find((problem) => problem.technology === technology && problem.slug === slug); }
export function isTechnology(value) { return Boolean(TECHNOLOGIES[value]); }
