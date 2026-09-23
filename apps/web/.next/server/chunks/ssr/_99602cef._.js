module.exports=[132245,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"BailoutToCSR",{enumerable:!0,get:function(){return e}});let d=a.r(441997);function e({reason:a,children:b}){throw Object.defineProperty(new d.BailoutToCSRError(a),"__NEXT_ERROR_CODE",{value:"E394",enumerable:!1,configurable:!0})}},307773,(a,b,c)=>{"use strict";function d(a){return a.split("/").map(a=>encodeURIComponent(a)).join("/")}Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"encodeURIPath",{enumerable:!0,get:function(){return d}})},297458,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"PreloadChunks",{enumerable:!0,get:function(){return i}});let d=a.r(187924),e=a.r(935112),f=a.r(556704),g=a.r(307773),h=a.r(68063);function i({moduleIds:a}){let b=f.workAsyncStorage.getStore();if(void 0===b)return null;let c=[];if(b.reactLoadableManifest&&a){let d=b.reactLoadableManifest;for(let b of a){if(!d[b])continue;let a=d[b].files;c.push(...a)}}if(0===c.length)return null;let i=(0,h.getDeploymentIdQueryOrEmptyString)();return(0,d.jsx)(d.Fragment,{children:c.map(a=>{let c=`${b.assetPrefix}/_next/${(0,g.encodeURIPath)(a)}${i}`;return a.endsWith(".css")?(0,d.jsx)("link",{precedence:"dynamic",href:c,rel:"stylesheet",as:"style",nonce:b.nonce},a):((0,e.preload)(c,{as:"script",fetchPriority:"low",nonce:b.nonce}),null)})})}},969853,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"default",{enumerable:!0,get:function(){return j}});let d=a.r(187924),e=a.r(572131),f=a.r(132245),g=a.r(297458);function h(a){return{default:a&&"default"in a?a.default:a}}let i={loader:()=>Promise.resolve(h(()=>null)),loading:null,ssr:!0},j=function(a){let b={...i,...a},c=(0,e.lazy)(()=>b.loader().then(h)),j=b.loading;function k(a){let h=j?(0,d.jsx)(j,{isLoading:!0,pastDelay:!0,error:null}):null,i=!b.ssr||!!b.loading,k=i?e.Suspense:e.Fragment,l=b.ssr?(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(g.PreloadChunks,{moduleIds:b.modules}),(0,d.jsx)(c,{...a})]}):(0,d.jsx)(f.BailoutToCSR,{reason:"next/dynamic",children:(0,d.jsx)(c,{...a})});return(0,d.jsx)(k,{...i?{fallback:h}:{},children:l})}return k.displayName="LoadableComponent",k}},819721,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"default",{enumerable:!0,get:function(){return e}});let d=a.r(833354)._(a.r(969853));function e(a,b){let c={};"function"==typeof a&&(c.loader=a);let e={...c,...b};return(0,d.default)({...e,modules:e.loadableGenerated?.modules})}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},73570,a=>{"use strict";let b=(0,a.i(170106).default)("triangle-alert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);a.s(["AlertTriangle",()=>b],73570)},585911,a=>{"use strict";let b=(0,a.i(170106).default)("linkedin",[["path",{d:"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",key:"c2jq9f"}],["rect",{width:"4",height:"12",x:"2",y:"9",key:"mk3on5"}],["circle",{cx:"4",cy:"4",r:"2",key:"bt5ra8"}]]);a.s(["Linkedin",()=>b],585911)},439858,a=>{"use strict";let b=[{id:"rc-1",techId:"reactjs",topic:"React Hooks",title:"useState Hook Syntax",frontText:"How do you correctly update state based on previous state in React?",backText:"Use a functional updater: `setCount(prev => prev + 1)`. This guarantees stale closure prevention during batch updates.",code:`const [count, setCount] = useState(0);
// Correct way:
setCount(prev => prev + 1);`,difficulty:"Beginner"},{id:"rc-2",techId:"nextjs",topic:"Next.js Route Handler",title:"Next.js App Router GET/POST API",frontText:"Where do you define REST API endpoints in Next.js App Router?",backText:"Inside `app/api/[route]/route.js` by exporting named async functions `export async function GET(request) {}`",code:`// app/api/hello/route.js
import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ message: 'Hello!' });
}`,difficulty:"Beginner"},{id:"rc-3",techId:"mongodb",topic:"Mongoose Querying",title:"Select specific fields (Projection)",frontText:"How to fetch only `title` and `author` while excluding `_id` in Mongoose?",backText:"Use `.select('title author -_id')` or `.select({ title: 1, author: 1, _id: 0 })`",code:"const result = await Article.find().select('title author -_id');",difficulty:"Intermediate"}],c=[{id:"reactjs",title:"React.js Complete Course: Zero to Mastery",techId:"reactjs",subtitle:"Learn modern React with Hooks, JSX, Components, State, Context API and Performance Optimization.",level:"Beginner - Advanced",duration:"2.5 Hours",chapters:[{id:"ch-1-intro",title:"1. Introduction to React & JSX",summary:"What is React, Virtual DOM, and how JSX transforms HTML inside JavaScript.",codeSnippet:`import React from "react";

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
</div>`,content:["Tailwind CSS provides low-level utility classes for padding, margins, flexbox, grid, and typography.","Responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`) follow mobile-first design principles.","Dark mode is enabled by prefixing classes with `dark:` (e.g. `bg-white dark:bg-zinc-900`)."],tryItChallenge:"Create a 3-column responsive card layout that collapses to 1 column on mobile."}]}].flatMap(a=>a.chapters.map(b=>({id:b.id,techId:a.techId,title:b.title,summary:b.summary,level:a.level,readTime:"4 min read",updatedAt:"2026-08-09",author:"DevBytes Team",views:4200,likes:310,codeSnippet:b.codeSnippet,explanation:b.content,keyTakeaways:[`Master ${a.title} concepts.`,`Practice challenge: ${b.tryItChallenge}`]})));a.s(["REVISION_CARDS",0,b,"TECH_STACKS",0,[{id:"reactjs",name:"React.js",icon:"Code2",color:"from-cyan-500 to-blue-600",textColor:"text-cyan-500",badgeBg:"bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold",description:"JSX, Components, Hooks (useState, useEffect, useMemo), Context API & Performance",category:"Frontend Framework",totalLessons:7},{id:"nextjs",name:"Next.js",icon:"Zap",color:"from-zinc-900 to-black dark:from-zinc-100 dark:to-zinc-300",textColor:"text-zinc-900 dark:text-zinc-100",badgeBg:"bg-black text-white dark:bg-white dark:text-black font-bold",description:"App Router, Server Components, Routing, Server Actions & ISR/SSG Data Fetching",category:"Fullstack Framework",totalLessons:6},{id:"nodejs",name:"Node.js",icon:"Server",color:"from-emerald-600 to-green-700",textColor:"text-emerald-500",badgeBg:"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold",description:"Event Loop, Async I/O, Modules, FS Module & HTTP Server Setup",category:"Backend Runtime",totalLessons:5},{id:"expressjs",name:"Express.js",icon:"Layers",color:"from-gray-700 to-zinc-900",textColor:"text-zinc-700 dark:text-zinc-300",badgeBg:"bg-zinc-800 text-white font-bold",description:"Routing, Custom Middleware, REST API Architecture, Error Handlers & Auth",category:"Backend Framework",totalLessons:5},{id:"mongodb",name:"MongoDB",icon:"Database",color:"from-emerald-500 to-teal-700",textColor:"text-emerald-600 dark:text-emerald-400",badgeBg:"bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold",description:"Documents, Collections, BSON, Aggregation Pipelines, Indexes & Mongoose ODM",category:"NoSQL Database",totalLessons:5},{id:"tailwindcss",name:"Tailwind CSS",icon:"Sparkles",color:"from-sky-400 to-cyan-500",textColor:"text-sky-500",badgeBg:"bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold",description:"Utility-First CSS, Flexbox & Grid, Responsive Breakpoints, Dark Mode & Animations",category:"CSS Framework",totalLessons:5},{id:"javascript",name:"JavaScript",icon:"FileCode",color:"from-amber-400 to-yellow-500",textColor:"text-amber-500",badgeBg:"bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-bold",description:"ES6+ Syntax, Async/Await, Promises, Closures, Array Methods & DOM",category:"Programming Language",totalLessons:6},{id:"csharp",name:"C# & .NET",icon:"Code2",color:"from-violet-600 to-indigo-700",textColor:"text-violet-600 dark:text-violet-400",badgeBg:"bg-violet-500/10 text-violet-700 dark:text-violet-300 font-bold",description:"C# Fundamentals, OOP, LINQ, Async, EF Core, ASP.NET Core APIs, Testing & Docker",category:"Language & Backend Platform",totalLessons:24}],"TUTORIALS",0,c])},183205,a=>{"use strict";let b=(0,a.i(170106).default)("bell-ring",[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M22 8c0-2.3-.8-4.3-2-6",key:"5bb3ad"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}],["path",{d:"M4 2C2.8 3.7 2 5.7 2 8",key:"tap9e0"}]]);a.s(["BellRing",()=>b],183205)},80386,a=>{"use strict";let b=(0,a.i(170106).default)("terminal",[["path",{d:"M12 19h8",key:"baeox8"}],["path",{d:"m4 17 6-6-6-6",key:"1yngyt"}]]);a.s(["Terminal",()=>b],80386)},104720,a=>{"use strict";let b=(0,a.i(170106).default)("file-text",[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);a.s(["FileText",()=>b],104720)},325015,a=>{"use strict";let b=(0,a.i(170106).default)("play",[["path",{d:"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",key:"10ikf1"}]]);a.s(["Play",()=>b],325015)},881440,257394,a=>{"use strict";var b=a.i(187924),c=a.i(761210),d=a.i(572131),e=a.i(438617);let f=(0,a.i(170106).default)("bookmark-check",[["path",{d:"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z",key:"oz39mx"}],["path",{d:"m9 10 2 2 4-4",key:"1gnqz4"}]]);a.s(["BookmarkCheck",()=>f],257394);var g=a.i(665437),h=a.i(520356),i=a.i(823292),j=a.i(566215);function k({itemId:a,itemType:k,label:l,size:m="md",className:n=""}){let{isAuthenticated:o}=(0,g.useAppSelector)(a=>a.auth),{requireAuth:p}=(0,j.useAuthPrompt)(),q=d.default.useRef(!1),[r,{isLoading:s}]=(0,h.useToggleSavedItemMutation)(),{data:t}=(0,h.useGetMySavedItemsQuery)(void 0,{skip:!o}),u=d.default.useMemo(()=>!!t?.data?.savedItems&&t.data.savedItems.some(b=>b._id?.toString()===a?.toString()&&b.itemType===k),[t,a,k]),v=async b=>{if(b.preventDefault(),b.stopPropagation(),!o){q.current=!0,p();return}if(!a)return void i.toast.error("Cannot save this item");try{(await r({itemId:a,itemType:k}).unwrap()).data.isSaved?i.toast.success("Saved to your library"):i.toast.success("Removed from your library")}catch{i.toast.error("Failed to update save status")}};d.default.useEffect(()=>{o&&q.current&&a&&(q.current=!1,r({itemId:a,itemType:k}).unwrap().then(()=>i.toast.success("Saved to your library")).catch(()=>i.toast.error("Failed to save item")))},[o,a,k,r]);let w="sm"===m?"w-3.5 h-3.5":"w-4 h-4";return(0,b.jsxs)("button",{onClick:v,disabled:s,title:u?"Remove from saved":"Save to library",className:`group inline-flex items-center gap-2 rounded-full font-bold transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
        ${u?"bg-blue-600 text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 hover:-translate-y-0.5":"bg-zinc-100/90 dark:bg-zinc-800/70 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-700/70 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/80 dark:hover:bg-zinc-700/90 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:-translate-y-0.5 shadow-xs"}
        ${"sm"===m?"px-2.5 py-1.5 text-[10px]":"px-3.5 py-2 text-xs"} ${n}`,children:[(0,b.jsx)("div",{className:`rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${u?"bg-white/20 text-white":"bg-blue-500/10 text-blue-600 dark:text-blue-400 p-1"}`,children:s?(0,b.jsx)(c.default,{className:`${w} `}):u?(0,b.jsx)(f,{className:`${w}`}):(0,b.jsx)(e.Bookmark,{className:`${w}`})}),void 0!==l&&(0,b.jsx)("span",{children:u?"Saved":l||"Save"})]})}a.s(["default",()=>k],881440)},162305,a=>{"use strict";let b=(0,a.i(170106).default)("message-square-text",[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}],["path",{d:"M7 11h10",key:"1twpyw"}],["path",{d:"M7 15h6",key:"d9of3u"}],["path",{d:"M7 7h8",key:"af5zfr"}]]);a.s(["MessageSquareText",()=>b],162305)},111563,941815,a=>{"use strict";var b=a.i(187924),c=a.i(761210),d=a.i(572131),e=a.i(147123),f=a.i(439858);let g=(0,a.i(170106).default)("rotate-cw",[["path",{d:"M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8",key:"1p45f6"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}]]);a.s(["RotateCw",()=>g],941815);var h=a.i(613749),i=a.i(50522),j=a.i(438617),k=a.i(167453),l=a.i(717545);function m({selectedTech:a,selectedChapterId:m,onDeckComplete:n,embedded:o=!1}){let[p,q]=(0,d.useState)(a||""),{data:r}=(0,e.useGetCoursesQuery)(),s=r?.data||[],t=p||a||"",u=(0,d.useMemo)(()=>({...t?{courseId:t}:{},...m?{chapterId:m}:{},limit:100}),[t,m]),{data:v,isLoading:w}=(0,e.useGetFlashcardsQuery)(u),x=v?.data||[],[y,z]=(0,d.useState)(0),[A,B]=(0,d.useState)(!1),[C,D]=(0,d.useState)([]),E=a=>{q(a),z(0),B(!1)},F=()=>{y+1>=x.length&&n?.(),B(!1),z(a=>(a+1)%x.length)},G=()=>{B(!1),z(a=>(a-1+x.length)%x.length)},H=a=>{a.stopPropagation();let b=x[y%x.length];if(!b)return;let c=b._id||b.id;D(a=>a.includes(c)?a.filter(a=>a!==c):[...a,c])},I=(0,d.useMemo)(()=>s.length>0?s.map(a=>({key:a.techId||a.slug||a._id,label:a.title?a.title.split(":")[0]:a.name})):f.TECH_STACKS.map(a=>({key:a.id,label:a.name})),[s]),J=()=>(0,b.jsxs)("div",{className:"mb-3.5 flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none",children:[(0,b.jsxs)("span",{className:"flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 shrink-0 mr-1",children:[(0,b.jsx)(l.Layers,{className:"w-3.5 h-3.5 text-blue-500"}),"Choose Course:"]}),(0,b.jsx)("button",{type:"button",onClick:()=>E(""),className:`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${!t?"bg-blue-600 text-white shadow-xs":"bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-foreground border border-zinc-200 dark:border-zinc-700"}`,children:"All Courses"}),I.map(a=>{let c=t.toLowerCase()===a.key.toLowerCase();return(0,b.jsx)("button",{type:"button",onClick:()=>E(a.key),className:`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${c?"bg-blue-600 text-white shadow-xs":"bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-foreground border border-zinc-200 dark:border-zinc-700"}`,children:a.label},a.key)})]});if(w)return(0,b.jsxs)("div",{className:"w-full my-3 flex flex-col items-center justify-center min-h-36 gap-2",children:[(0,b.jsx)(c.default,{className:"w-6 h-6 text-blue-500"}),(0,b.jsx)("span",{className:"text-xs text-zinc-400 font-medium",children:"Loading flashcards…"})]});if(0===x.length)return(0,b.jsxs)("div",{className:"w-full my-4 p-5 sm:p-7 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs",children:[J(),(0,b.jsxs)("div",{className:"py-8 text-center space-y-3",children:[(0,b.jsx)("p",{className:"text-sm font-bold text-zinc-600 dark:text-zinc-400",children:"No flashcards found for this course selection."}),(0,b.jsx)("button",{type:"button",onClick:()=>E(""),className:"px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-xs cursor-pointer",children:"Practice All Courses Flashcards"})]})]});let K=x[y%x.length],L=f.TECH_STACKS.find(a=>a.id===K.techId),M=K._id||K.id,N=C.includes(M),O=()=>(0,b.jsxs)("div",{className:"w-full min-w-0 space-y-3",children:[J(),!o&&(0,b.jsxs)("div",{className:"flex items-center justify-between mb-3 gap-2",children:[(0,b.jsxs)("div",{className:"min-w-0",children:[(0,b.jsxs)("div",{className:"flex items-center gap-2",children:[(0,b.jsx)("span",{className:"flex h-2 w-2 rounded-full bg-blue-600 animate-pulse shrink-0"}),(0,b.jsx)("h2",{className:"text-base sm:text-lg font-black tracking-tight text-foreground truncate",children:"Mobile Revision Deck"})]}),(0,b.jsx)("p",{className:"text-xs text-zinc-500 dark:text-zinc-400 truncate",children:"Tap card to reveal answer"})]}),(0,b.jsxs)("span",{className:"text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-sm shrink-0",children:[y+1," / ",x.length]})]}),o&&(0,b.jsxs)("div",{className:"flex items-center justify-between gap-2 px-1",children:[(0,b.jsx)("span",{className:"text-xs font-semibold text-zinc-500 dark:text-zinc-400",children:"Tap card to flip answer"}),(0,b.jsxs)("span",{className:"text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-sm shrink-0",children:[y+1," / ",x.length]})]}),(0,b.jsxs)("div",{onClick:()=>B(!A),className:`relative min-h-40 sm:min-h-52 p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300 select-none min-w-0 overflow-hidden border ${A?"bg-zinc-950 text-zinc-100 border-zinc-900 shadow-sm":o?"bg-zinc-50 dark:bg-zinc-950 text-foreground border-zinc-200/80 dark:border-zinc-800/80 hover:border-blue-500/50":"bg-white dark:bg-zinc-900 text-foreground border-zinc-200 dark:border-zinc-800 hover:shadow-md"}`,children:[(0,b.jsxs)("div",{className:"flex items-center justify-between mb-2.5 text-xs gap-2",children:[(0,b.jsxs)("div",{className:"flex items-center gap-1.5 min-w-0 flex-wrap",children:[(0,b.jsx)("span",{className:"font-bold text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400",children:L?.name||K.tag||K.techId}),(0,b.jsxs)("span",{className:"text-zinc-400 font-medium text-[11px]",children:["• ",K.difficulty]})]}),(0,b.jsx)("button",{onClick:H,className:`p-1.5 rounded-full transition-colors shrink-0 ${N?"text-amber-500 bg-amber-500/10":"text-zinc-400 hover:text-foreground"}`,children:(0,b.jsx)(j.Bookmark,{className:`w-4 h-4 ${N?"fill-amber-500":""}`})})]}),A?(0,b.jsxs)("div",{className:"flex flex-col justify-between h-full pt-1 animate-fadeIn",children:[(0,b.jsxs)("div",{children:[(0,b.jsxs)("div",{className:"flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1.5",children:[(0,b.jsx)(k.CheckCircle2,{className:"w-4 h-4"}),(0,b.jsx)("span",{children:"Answer"})]}),(0,b.jsx)("p",{className:"text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium",children:K.back})]}),(0,b.jsxs)("div",{className:"flex items-center gap-1 text-xs text-zinc-400 font-bold mt-4",children:[(0,b.jsx)(g,{className:"w-3.5 h-3.5"}),(0,b.jsx)("span",{children:"Tap to flip back"})]})]}):(0,b.jsxs)("div",{className:"flex flex-col justify-between h-full pt-1",children:[(0,b.jsxs)("div",{children:[K.tag&&(0,b.jsx)("h3",{className:"text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 truncate",children:K.tag}),(0,b.jsx)("p",{className:"text-sm sm:text-lg font-bold text-foreground leading-snug",children:K.front})]}),(0,b.jsxs)("div",{className:"flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold mt-4",children:[(0,b.jsx)(g,{className:"w-3.5 h-3.5"}),(0,b.jsx)("span",{children:"Tap card to flip answer"})]})]})]}),(0,b.jsxs)("div",{className:"flex items-center justify-between mt-3.5 gap-2",children:[(0,b.jsxs)("button",{onClick:G,className:"h-10 inline-flex items-center gap-1 px-3.5 rounded-full bg-white dark:bg-zinc-900 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer",children:[(0,b.jsx)(h.ChevronLeft,{className:"w-4 h-4"}),(0,b.jsx)("span",{children:"Prev"})]}),(0,b.jsx)("button",{onClick:()=>B(!A),className:"text-xs text-zinc-500 dark:text-zinc-400 hover:text-foreground font-semibold truncate cursor-pointer",children:A?"Show Question":"Reveal Answer"}),(0,b.jsxs)("button",{onClick:F,className:"h-10 inline-flex items-center gap-1 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold active:scale-95 transition-all shadow-md shadow-blue-500/25 shrink-0 cursor-pointer",children:[(0,b.jsx)("span",{children:"Next"}),(0,b.jsx)(i.ChevronRight,{className:"w-4 h-4"})]})]})]});return o?O():(0,b.jsx)("section",{className:"w-full my-4 sm:my-6 bg-blue-50/60 dark:bg-zinc-900/60 p-4 sm:p-7 rounded-3xl sm:rounded-[2.5rem] shadow-xs border border-blue-500/10 min-w-0 overflow-hidden",children:O()})}a.s(["default",()=>m],111563)},506444,a=>{"use strict";var b=a.i(176537);a.s(["Layers3",()=>b.default])}];

//# sourceMappingURL=_99602cef._.js.map