module.exports=[649016,e=>{"use strict";function t(e){return"react"===e?"vite-react":"typescript"===e?"vanilla-ts":"react-typescript"===e?"vite-react-ts":"nextjs"===e?"nextjs":"vanilla"}e.s(["DIFFICULTIES",0,["Easy","Medium","Hard"],"TECHNOLOGIES",0,{javascript:{name:"JavaScript",description:"Practice language fundamentals, asynchronous code, DOM work, and algorithms.",topics:["Arrays","Strings","Objects","Functions","Promises","Async/Await","DOM","Algorithms"]},html:{name:"HTML",description:"Build semantic, accessible page structures.",topics:["Semantics","Accessibility","Forms"]},css:{name:"CSS",description:"Practice responsive layouts with Flexbox and Grid.",topics:["Responsive Design","Flexbox","Grid"]},web:{name:"HTML + CSS + JavaScript",description:"Build complete browser interactions with three editable files.",topics:["DOM","Events","Components"]},react:{name:"React",description:"Build editable React components using state, hooks, forms, and context.",topics:["Components","Props","State","Hooks","Forms","Context","Performance"]},nextjs:{name:"Next.js",description:"Explore client-renderable Next.js concepts in a browser sandbox.",topics:["Pages","Components","Routing"]},python:{name:"Python",description:"Run Python privately in a lazy browser WebAssembly worker.",topics:["Fundamentals","Algorithms"]},c:{name:"C",description:"Compile and run C in the browser with an on-demand WebAssembly toolchain.",topics:["Fundamentals","Algorithms"]},cpp:{name:"C++",description:"Compile and run C++ in the browser with an on-demand WebAssembly toolchain.",topics:["Fundamentals","Algorithms"]},java:{name:"Java",description:"Compile and run Java using an isolated on-demand browser OpenJDK runtime.",topics:["Fundamentals","OOP","Algorithms"]}},"sandpackTemplateFor",()=>t])},888273,e=>{"use strict";var t=e.i(649016);let n=(e,t,n,o,a,r,s=[],i=[])=>({slug:e,title:t,technology:"javascript",difficulty:n,topics:o,description:a,hints:s,examples:[{input:"Use the sample call in the starter file",output:"Compare the console value with the expected comment"}],starterFiles:{"/index.js":r},testCases:i}),o=(e,t,n,o,a,r,s,i="",c="")=>({slug:t,title:n,technology:e,difficulty:o,topics:a,description:r,examples:[{input:"Edit the supplied HTML, CSS, and JavaScript",output:"Inspect the rendered preview and browser console"}],starterFiles:{"/index.html":s,"/style.css":i,"/index.js":c}}),a=(e,t,n,o,a,r)=>({slug:e,title:t,technology:"react",difficulty:n,topics:o,description:a,examples:[{input:"Interact with the rendered component",output:"The UI should update without a page reload"}],starterFiles:{"/App.js":r}}),r=(e,t,n,o,a,r)=>({slug:e,title:t,technology:"nextjs",difficulty:n,topics:o,description:a,examples:[{input:"Edit the client-renderable page",output:"Inspect the Next.js browser preview"}],starterFiles:{"/pages/index.js":r}}),s=[n("reverse-a-string","Reverse a String","Easy",["Strings","Algorithms"],"Write a function that returns the supplied string in reverse order. Preserve spaces and punctuation.",`function reverseString(value) {
  // Write your solution here
  return value;
}

console.log(reverseString("hello")); // expected: olleh`,["Strings can be converted to arrays."],[{functionName:"reverseString",args:["hello"],expected:"olleh"},{functionName:"reverseString",args:["Asif to"],expected:"ot fisA"},{functionName:"reverseString",args:[""],expected:""}]),n("remove-duplicates","Remove Duplicates From Array","Easy",["Arrays","Algorithms"],"Return a new array containing each value only once, without changing the input array.",`function unique(values) {
  return values;
}

console.log(unique([1, 2, 2, 3, 3])); // expected: [1, 2, 3]`,[],[{functionName:"unique",args:[[1,2,2,3,3]],expected:[1,2,3]},{functionName:"unique",args:[[]],expected:[]}]),n("character-frequency","Character Frequency","Medium",["Strings","Objects"],"Count how often every character occurs and return an object of character-to-count pairs.",`function frequency(text) {
  const counts = {};
  // Build the frequency map
  return counts;
}

console.log(frequency("banana"));`),n("flatten-an-array","Flatten an Array","Medium",["Arrays","Algorithms"],"Flatten a nested array of arbitrary depth without mutating it.",`function flatten(values) {
  // Return one flat array
  return values;
}

console.log(flatten([1, [2, [3, 4]]]));`),n("debounce-function","Debounce Function","Hard",["Functions","Async/Await"],"Implement debounce so a function runs only after calls have stopped for the given delay.",`function debounce(fn, delay) {
  // Return a debounced function
}

const say = debounce((value) => console.log(value), 200);
say("first");
say("latest");`),o("html","accessible-contact-form","Accessible Contact Form","Easy",["Accessibility","Forms"],"Create a labelled contact form with appropriate input types, autocomplete values, and accessible validation hints.",`<main>
  <h1>Contact us</h1>
  <!-- Add an accessible form -->
</main>`),o("css","responsive-card","Responsive Card","Easy",["Responsive Design"],"Style a card that remains readable and balanced from a narrow phone to a desktop.",'<article class="card"><h1>Responsive card</h1><p>Make me adapt to the viewport.</p></article>',`.card {
  /* Add responsive card styles */
}`),o("css","flexbox-navbar","Flexbox Navbar","Easy",["Flexbox","Responsive Design"],"Use Flexbox to align a brand and navigation links, then adapt the layout on small screens.",'<nav><strong>asif.to</strong><div><a href="#">Learn</a> <a href="#">Practice</a></div></nav>',`nav {
  /* Build the flex layout */
}`),o("css","css-grid-layout","CSS Grid Layout","Medium",["Grid","Responsive Design"],"Build a responsive grid whose cards automatically wrap without fixed breakpoint columns.",`<main class="grid">${"<article>Card</article>".repeat(6)}</main>`,`.grid {
  /* Use CSS Grid here */
}`),o("web","accordion","Accordion","Easy",["DOM","Events"],"Create an accessible accordion whose button controls a collapsible answer.",`<button aria-expanded="false" aria-controls="answer">What is JavaScript?</button>
<p id="answer" hidden>A language for the web.</p>`,"body { font-family: sans-serif; padding: 2rem; }",`const button = document.querySelector("button");
// Toggle the answer and aria-expanded`),o("web","modal","Modal","Medium",["DOM","Events"],"Open and close a modal with buttons and the Escape key while keeping its semantics accessible.",`<button id="open">Open modal</button>
<dialog><p>Hello!</p><button id="close">Close</button></dialog>`,"body { font-family: sans-serif; padding: 2rem; }",`const dialog = document.querySelector("dialog");
// Wire up the controls`),o("web","tabs","Tabs","Medium",["DOM","Components"],"Build keyboard-friendly tabs that reveal one associated panel at a time.",`<div role="tablist"><button role="tab">HTML</button><button role="tab">CSS</button></div>
<section role="tabpanel">Choose a tab.</section>`,"body { font-family: sans-serif; padding: 2rem; }","// Add tab selection behavior"),o("web","todo-list","Todo List","Hard",["DOM","Events"],"Build a todo list that adds, completes, and removes items without reloading the page.",'<form><input aria-label="New task"><button>Add</button></form><ul></ul>',"body { font-family: sans-serif; padding: 2rem; }",`const form = document.querySelector("form");
// Add todo behavior`),a("counter","Counter","Easy",["State","Hooks"],"Build a counter with increment, decrement, and reset controls.",`import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}`),a("accordion","Accordion","Easy",["Components","State"],"Create a reusable controlled accordion section with an accessible toggle.",`import { useState } from "react";
export default function App() {
  const [open, setOpen] = useState(false);
  return <main>{/* Build the accordion */}</main>;
}`),a("todo-list","Todo List","Medium",["State","Forms"],"Create a todo list with immutable state updates and stable item keys.",`import { useState } from "react";
export default function App() {
  const [items, setItems] = useState([]);
  return <main>{/* Add form and list */}</main>;
}`),a("controlled-form","Controlled Form","Medium",["Forms","State"],"Build a controlled profile form and render a submitted summary.",`import { useState } from "react";
export default function App() {
  const [name, setName] = useState("");
  return <form>{/* Add controlled fields */}</form>;
}`),a("search-filter","Search Filter","Medium",["State","Performance"],"Filter a list as the user types and show a useful empty state.",`import { useState } from "react";
const items = ["React", "Next.js", "JavaScript", "CSS"];
export default function App() {
  const [query, setQuery] = useState("");
  return <main>{/* Build search UI */}</main>;
}`),a("use-debounce-hook","useDebounce Hook","Hard",["Hooks","Performance"],"Implement a reusable useDebounce hook that cleans up its timeout when dependencies change.",`import { useEffect, useState } from "react";
function useDebounce(value, delay) {
  // Implement the hook
}
export default function App() {
  const [value, setValue] = useState("");
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}`),r("client-counter","Next.js Client Counter","Easy",["Components"],"Use a client-side React component in a Next.js page. The browser sandbox demonstrates client behavior only.",`import { useState } from "react";
export default function Home() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}`),{...r("dynamic-route-links","Dynamic Route Links","Medium",["Routing"],"Render product links using Next.js Link. Use the preview navigator to go Back, Forward, Refresh, or enter a route.",'import Link from "next/link";\nconst products = [{ id: 1, name: "Keyboard" }, { id: 2, name: "Mouse" }];\nexport default function Home() {\n  return <ul>{products.map((p) => <li key={p.id}><Link href={`/products/${p.id}`}>{p.name}</Link></li>)}</ul>;\n}'),starterFiles:{"/pages/index.js":'import Link from "next/link";\nconst products = [{ id: 1, name: "Keyboard" }, { id: 2, name: "Mouse" }];\nexport default function Home() {\n  return <ul>{products.map((p) => <li key={p.id}><Link href={`/products/${p.id}`}>{p.name}</Link></li>)}</ul>;\n}',"/pages/products/[id].js":`import { useRouter } from "next/router";
import Link from "next/link";
export default function Product() {
  const { query } = useRouter();
  return <main><h1>Product {query.id}</h1><Link href="/">Home</Link></main>;
}`}},r("optimized-navigation","Client Navigation","Easy",["Pages","Routing"],"Create a small navigation header with Next.js Link and active-looking styles.",`import Link from "next/link";
export default function Home() {
  return <nav><Link href="/">Home</Link> \xb7 <Link href="/about">About</Link></nav>;
}`)];function i(e){return s.filter(t=>t.technology===e)}function c(e,t){return s.find(n=>n.technology===e&&n.slug===t)}function u(e){return!!t.TECHNOLOGIES[e]}e.s(["PRACTICE_PROBLEMS",0,s,"getProblem",()=>c,"getProblems",()=>i,"isTechnology",()=>u])}];

//# sourceMappingURL=lib_playground_ae9115b3._.js.map