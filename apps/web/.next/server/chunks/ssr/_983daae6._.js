module.exports=[292318,a=>{"use strict";let b=[{id:"reactjs",title:"React.js Complete Course: Zero to Mastery",techId:"reactjs",subtitle:"Learn modern React with Hooks, JSX, Components, State, Context API and Performance Optimization.",level:"Beginner - Advanced",duration:"2.5 Hours",chapters:[{id:"ch-1-intro",title:"1. Introduction to React & JSX",summary:"What is React, Virtual DOM, and how JSX transforms HTML inside JavaScript.",codeSnippet:`import React from "react";

export default function WelcomeCard({ username }) {
  return (
    <div className="p-4 bg-blue-500 text-white rounded-2xl">
      <h1 className="text-xl font-bold">Hello, {username}!</h1>
      <p className="text-xs mt-1">Welcome to modern React development.</p>
    </div>
  );
}`,content:["React is a component-based JavaScript library for building interactive user interfaces created by Facebook.","JSX is a syntax extension for JavaScript that looks similar to HTML, allowing you to write markup directly inside JS files.","React uses a Virtual DOM to compute minimal DOM updates, ensuring fast rendering performance."],tryItChallenge:"Create a functional component that accepts a `title` prop and displays it inside an `<h1>` tag."},{id:"ch-2-components-props",title:"2. Components & Props",summary:"Building modular UI components and passing read-only data via props.",codeSnippet:`// Child Component
function UserBadge({ name, role = "Member" }) {
  return (
    <div className="px-3 py-1 bg-zinc-100 rounded-full text-xs">
      <span className="font-bold">{name}</span> ({role})
    </div>
  );
}

// Parent Component
export default function TeamList() {
  return (
    <div className="flex gap-2">
      <UserBadge name="Alice" role="Lead Dev" />
      <UserBadge name="Bob" />
    </div>
  );
}`,content:["Components are independent, reusable pieces of UI that act like JavaScript functions.","Props (short for properties) are read-only inputs passed from parent components to child components.","Always treat props as immutable. If data needs to change over time, use State instead."],tryItChallenge:"Add a default prop for `avatar` inside `UserBadge`."},{id:"ch-3-usestate-hook",title:"3. Managing State with useState",summary:"Adding interactive local component state and functional updates.",codeSnippet:`import React, { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  // Functional update prevents stale closures
  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => Math.max(0, prev - 1));

  return (
    <div className="flex items-center gap-3">
      <button onClick={decrement} className="px-3 py-1 bg-red-500 text-white rounded-lg">-</button>
      <span className="font-bold text-lg">{count}</span>
      <button onClick={increment} className="px-3 py-1 bg-green-500 text-white rounded-lg">+</button>
    </div>
  );
}`,content:["State allows React components to remember information between user interactions and re-renders.","The `useState` hook returns an array containing the current state value and a state updater function.","Always use functional state updaters (`setCount(prev => prev + 1)`) when new state depends on previous state."],tryItChallenge:"Build a toggle button that switches between Dark and Light mode state."},{id:"ch-4-useeffect-side-effects",title:"4. Handling Side Effects with useEffect",summary:"Data fetching, subscriptions, timer cleanup, and dependency arrays.",codeSnippet:`import React, { useState, useEffect } from "react";

export function UserFetcher({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(\`https://jsonplaceholder.typicode.com/users/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setUser(data);
          setLoading(false);
        }
      });

    // Cleanup function
    return () => { isMounted = false; };
  }, [userId]); // Runs whenever userId changes

  if (loading) return <div>Loading user...</div>;
  return <div className="font-bold">{user?.name}</div>;
}`,content:["`useEffect` lets you synchronize a component with an external system (API calls, DOM manipulation, timers).","The dependency array controls when the effect executes. Empty array `[]` means run once on mount.","Return a cleanup function from your effect to unsubscribe or cancel pending network requests."],tryItChallenge:"Add a timer with `setInterval` inside `useEffect` and ensure `clearInterval` runs in cleanup."},{id:"ch-5-usememo-usecallback",title:"5. Performance: useMemo & useCallback",summary:"Preventing unnecessary re-calculations and expensive re-renders.",codeSnippet:`import React, { useState, useMemo, useCallback } from "react";

export function FilterableList({ items }) {
  const [query, setQuery] = useState("");

  // Memoize heavy calculations
  const filtered = useMemo(() => {
    return items.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
  }, [items, query]);

  // Memoize callback functions
  const handleSelect = useCallback((id) => {
    console.log("Selected:", id);
  }, []);

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {filtered.map(i => (
        <button key={i.id} onClick={() => handleSelect(i.id)}>{i.name}</button>
      ))}
    </div>
  );
}`,content:["`useMemo` caches the calculated result of a calculation between re-renders.","`useCallback` caches a function definition between renders to maintain referential equality.","Only use memoization when dealing with heavy computations or passing callbacks to memoized child components."],tryItChallenge:"Profile a component with and without `useMemo` using React DevTools."}]},{id:"nextjs",title:"Next.js App Router Masterclass",techId:"nextjs",subtitle:"Master React Server Components, Server Actions, Dynamic Routing, Data Fetching & Middleware.",level:"Intermediate - Advanced",duration:"3 Hours",chapters:[{id:"ch-1-app-structure",title:"1. App Router Architecture & File Routing",summary:"Understanding page.jsx, layout.jsx, loading.jsx, error.jsx and nested routes.",codeSnippet:`// app/dashboard/layout.jsx
import React from "react";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-zinc-900 text-white p-4">Dashboard Navigation</aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}`,content:["Next.js uses a file-system based router where folders define routes and `page.jsx` makes a route publicly accessible.","`layout.jsx` wraps nested pages and preserves component state across route navigations.","`loading.jsx` automatically creates an instant React Suspense boundary for seamless navigation."],tryItChallenge:"Create a dynamic route folder `app/products/[id]/page.jsx`."},{id:"ch-2-server-components",title:"2. Server Components vs Client Components",summary:"Zero client-side JS bundle, direct database access, and using 'use client'.",codeSnippet:`// app/users/page.jsx - React Server Component
import React from "react";

async function fetchUsers() {
  const res = await fetch("https://api.example.com/users", { next: { revalidate: 3600 } });
  return res.json();
}

export default async function UsersPage() {
  const users = await fetchUsers();
  return (
    <div className="space-y-2">
      {users.map(u => <div key={u.id} className="p-3 bg-zinc-100 rounded-xl">{u.name}</div>)}
    </div>
  );
}`,content:["In Next.js App Router, components are Server Components by default.","Server Components render strictly on the server, resulting in zero client JavaScript bundle for static elements.","Add `'use client'` at the top of a file only when needing state, effects, or browser event listeners."],tryItChallenge:"Refactor a page so data fetching happens on the server and only a search input uses `'use client'`."},{id:"ch-3-server-actions",title:"3. Server Actions & Form Mutations",summary:"Mutate database records directly from forms without writing REST API routes.",codeSnippet:`// app/actions.js
"use server";

import { revalidatePath } from "next/cache";

export async function createPost(formData) {
  const title = formData.get("title");
  // Save directly to MongoDB / Database
  console.log("Saving post:", title);
  
  revalidatePath("/posts"); // Purge Next.js data cache
}`,content:["Server Actions allow client forms to invoke async functions that execute securely on the server.","Use `revalidatePath('/route')` or `revalidateTag('tag')` to purge cached data after mutations.","Server Actions work progressive-enhancement style even if JavaScript is disabled on the client browser."],tryItChallenge:"Write a Server Action to handle user feedback submission."}]},{id:"expressjs",title:"Express.js REST API & Backend Architecture",techId:"expressjs",subtitle:"Build production REST APIs with Node.js, Express routing, custom middleware, and error handlers.",level:"Beginner - Intermediate",duration:"2 Hours",chapters:[{id:"ch-1-server-setup",title:"1. Express Server Setup & Basic Routing",summary:"Initializing Express app, handling GET/POST requests and JSON middleware.",codeSnippet:`const express = require("express");
const app = express();

// Parse incoming JSON body
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

app.listen(5000, () => console.log("Server running on port 5000"));`,content:["Express.js is a minimal and flexible Node.js web application framework providing robust API features.","`app.use(express.json())` parses incoming request bodies with JSON payloads.","Routes are declared using HTTP verb methods: `app.get()`, `app.post()`, `app.put()`, `app.delete()`."],tryItChallenge:"Create a POST endpoint `/api/echo` that returns the request body back to the user."},{id:"ch-2-middleware",title:"2. Custom Middleware & JWT Auth",summary:"Request interceptors, authentication headers, and next() flow control.",codeSnippet:`const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next(); // Pass control to next handler
  } catch (err) {
    return res.status(403).json({ message: "Forbidden - Invalid token" });
  }
};`,content:["Middleware functions have access to the request object (`req`), response object (`res`), and `next` callback.","If middleware does not call `next()`, the request will be left hanging without a response.","Chain middleware before final route handlers to enforce authentication or input validation."],tryItChallenge:"Write a logging middleware that prints request method and URL to stdout."}]},{id:"mongodb",title:"MongoDB & Mongoose Database Masterclass",techId:"mongodb",subtitle:"Master NoSQL document storage, schemas, population, indexing, and aggregation pipelines.",level:"Beginner - Advanced",duration:"2.5 Hours",chapters:[{id:"ch-1-mongoose-schemas",title:"1. Mongoose Schemas & Models",summary:"Defining structured data models with validation and timestamps.",codeSnippet:`const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;`,content:["Mongoose provides a straight-forward schema-based solution to model MongoDB application data.","Schemas define document structure, default values, validators, and custom instance methods.","`{ timestamps: true }` automatically adds `createdAt` and `updatedAt` Date fields."],tryItChallenge:"Add a `products` array schema with custom validation rules."},{id:"ch-2-crud-population",title:"2. CRUD Operations & Document Population",summary:"Creating, querying, updating, and populating referenced ObjectId relationships.",codeSnippet:`// Querying and Populating Referenced Documents
async function getUserPosts(userId) {
  return await Post.find({ author: userId })
    .populate("author", "email role") // Fetch referenced author fields
    .sort({ createdAt: -1 })
    .limit(10);
}`,content:["CRUD operations map to `.create()`, `.find()`, `.findByIdAndUpdate()`, and `.deleteOne()`.","`.populate('fieldName')` executes additional queries to resolve ObjectId reference joins.","Use `.select('field1 field2')` to limit returned document fields for performance."],tryItChallenge:"Write a Mongoose query to update a user's role while returning the updated document."}]},{id:"tailwindcss",title:"Tailwind CSS Modern Styling & Design Systems",techId:"tailwindcss",subtitle:"Build modern, responsive, dark-mode ready user interfaces rapidly with utility-first CSS.",level:"Beginner - Intermediate",duration:"1.5 Hours",chapters:[{id:"ch-1-flexbox-grid",title:"1. Utility-First Layouts: Flexbox & Grid",summary:"Building complex responsive layouts without custom CSS stylesheets.",codeSnippet:`<!-- Responsive Card Grid with Tailwind -->
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
  <div className="flex flex-col justify-between p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-lg">
    <h3 className="font-black text-lg text-zinc-900 dark:text-white">Card Title</h3>
    <p className="text-xs text-zinc-500 mt-2">Flexbox column pushing content apart effortlessly.</p>
  </div>
</div>`,content:["Tailwind CSS provides low-level utility classes for padding, margins, flexbox, grid, and typography.","Responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`) follow mobile-first design principles.","Dark mode is enabled by prefixing classes with `dark:` (e.g. `bg-white dark:bg-zinc-900`)."],tryItChallenge:"Create a 3-column responsive card layout that collapses to 1 column on mobile."}]}],c=b.flatMap(a=>a.chapters.map(b=>({id:b.id,techId:a.techId,title:b.title,summary:b.summary,level:a.level,readTime:"4 min read",updatedAt:"2026-08-09",author:"DevBytes Team",views:4200,likes:310,codeSnippet:b.codeSnippet,explanation:b.content,keyTakeaways:[`Master ${a.title} concepts.`,`Practice challenge: ${b.tryItChallenge}`]})));a.s(["COURSES",0,b,"TECH_STACKS",0,[{id:"reactjs",name:"React.js",icon:"Code2",color:"from-cyan-500 to-blue-600",textColor:"text-cyan-500",badgeBg:"bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold",description:"JSX, Components, Hooks (useState, useEffect, useMemo), Context API & Performance",category:"Frontend Framework",totalLessons:7},{id:"nextjs",name:"Next.js",icon:"Zap",color:"from-zinc-900 to-black dark:from-zinc-100 dark:to-zinc-300",textColor:"text-zinc-900 dark:text-zinc-100",badgeBg:"bg-black text-white dark:bg-white dark:text-black font-bold",description:"App Router, Server Components, Routing, Server Actions & ISR/SSG Data Fetching",category:"Fullstack Framework",totalLessons:6},{id:"nodejs",name:"Node.js",icon:"Server",color:"from-emerald-600 to-green-700",textColor:"text-emerald-500",badgeBg:"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold",description:"Event Loop, Async I/O, Modules, FS Module & HTTP Server Setup",category:"Backend Runtime",totalLessons:5},{id:"expressjs",name:"Express.js",icon:"Layers",color:"from-gray-700 to-zinc-900",textColor:"text-zinc-700 dark:text-zinc-300",badgeBg:"bg-zinc-800 text-white font-bold",description:"Routing, Custom Middleware, REST API Architecture, Error Handlers & Auth",category:"Backend Framework",totalLessons:5},{id:"mongodb",name:"MongoDB",icon:"Database",color:"from-emerald-500 to-teal-700",textColor:"text-emerald-600 dark:text-emerald-400",badgeBg:"bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold",description:"Documents, Collections, BSON, Aggregation Pipelines, Indexes & Mongoose ODM",category:"NoSQL Database",totalLessons:5},{id:"tailwindcss",name:"Tailwind CSS",icon:"Sparkles",color:"from-sky-400 to-cyan-500",textColor:"text-sky-500",badgeBg:"bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold",description:"Utility-First CSS, Flexbox & Grid, Responsive Breakpoints, Dark Mode & Animations",category:"CSS Framework",totalLessons:5},{id:"javascript",name:"JavaScript",icon:"FileCode",color:"from-amber-400 to-yellow-500",textColor:"text-amber-500",badgeBg:"bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-bold",description:"ES6+ Syntax, Async/Await, Promises, Closures, Array Methods & DOM",category:"Programming Language",totalLessons:6},{id:"csharp",name:"C# & .NET",icon:"Code2",color:"from-violet-600 to-indigo-700",textColor:"text-violet-600 dark:text-violet-400",badgeBg:"bg-violet-500/10 text-violet-700 dark:text-violet-300 font-bold",description:"C# Fundamentals, OOP, LINQ, Async, EF Core, ASP.NET Core APIs, Testing & Docker",category:"Language & Backend Platform",totalLessons:24}],"TUTORIALS",0,c])},427190,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(211857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/components/authors/UserProfileClient.jsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/components/authors/UserProfileClient.jsx <module evaluation>","default")},828453,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(211857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/components/authors/UserProfileClient.jsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/components/authors/UserProfileClient.jsx","default")},904622,a=>{"use strict";a.i(427190);var b=a.i(828453);a.n(b)},41963,a=>{"use strict";var b=a.i(907997);a.i(570396);var c=a.i(673727),d=a.i(886792),e=a.i(292318),f=a.i(904622);async function g({params:a}){let{username:b}=await a,c=decodeURIComponent(b||"").trim(),f=c.replace(/^@+/,"");if("robot.txt"===c.toLowerCase()||"robots.txt"===c.toLowerCase()||"sitemap.xml"===c.toLowerCase()||c.startsWith("@"))return{title:"Redirecting...",robots:{index:!1,follow:!1}};let g=e.TECH_STACKS.some(a=>a.id?.toLowerCase()===c.toLowerCase())||e.COURSES.some(a=>a.id?.toLowerCase()===c.toLowerCase()||a.slug?.toLowerCase()===c.toLowerCase()||a.techId?.toLowerCase()===c.toLowerCase()),h=g?null:await (0,d.getCourse)(c);if(g||h){let a=h?.slug||c;return{title:"Redirecting...",alternates:{canonical:`/courses/${encodeURIComponent(a)}`}}}return{title:`${f} - Profile | asif.to`,description:`View ${f}'s learning progress and profile on asif.to.`,robots:{index:!1,follow:!1}}}async function h({params:a}){let{username:g}=await a,h=decodeURIComponent(g||"").trim();if(console.log("HITTING USERNAME",h),("robot.txt"===h.toLowerCase()||"robots.txt"===h.toLowerCase())&&(0,c.redirect)("/robots.txt"),"sitemap.xml"===h.toLowerCase()&&(0,c.redirect)("/sitemap.xml"),/\.(txt|xml|json|js|mjs|cjs|css|ico|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2|ttf|eot|map|gz|br|pdf|zip)$/i.test(h)&&(0,c.notFound)(),h.startsWith("@")){let a=h.replace(/^@+/,"");(0,c.redirect)(`/${encodeURIComponent(a)}`)}(e.TECH_STACKS.some(a=>a.id?.toLowerCase()===h.toLowerCase())||e.COURSES.some(a=>a.id?.toLowerCase()===h.toLowerCase()||a.slug?.toLowerCase()===h.toLowerCase()||a.techId?.toLowerCase()===h.toLowerCase()))&&(0,c.redirect)(`/courses/${encodeURIComponent(h)}`);let i=await (0,d.getCourse)(h);i&&(0,c.redirect)(`/courses/${encodeURIComponent(i.slug||h)}`);let j=await (0,d.getPublicUserProfile)(h);if(j?.user)return(0,b.jsx)(f.default,{username:h});(0,c.notFound)()}a.s(["default",()=>h,"dynamic",0,"force-dynamic","generateMetadata",()=>g])}];

//# sourceMappingURL=_983daae6._.js.map