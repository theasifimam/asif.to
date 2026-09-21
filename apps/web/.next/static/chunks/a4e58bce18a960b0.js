(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,631171,e=>{"use strict";let t=(0,e.i(475254).default)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);e.s(["default",()=>t])},664659,e=>{"use strict";var t=e.i(631171);e.s(["ChevronDown",()=>t.default])},878894,e=>{"use strict";let t=(0,e.i(475254).default)("triangle-alert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);e.s(["AlertTriangle",()=>t],878894)},778917,e=>{"use strict";let t=(0,e.i(475254).default)("external-link",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);e.s(["ExternalLink",()=>t],778917)},662031,e=>{"use strict";let t=(0,e.i(475254).default)("share-2",[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]]);e.s(["Share2",()=>t],662031)},678745,e=>{"use strict";let t=(0,e.i(475254).default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);e.s(["default",()=>t])},643531,e=>{"use strict";var t=e.i(678745);e.s(["Check",()=>t.default])},555436,e=>{"use strict";let t=(0,e.i(475254).default)("search",[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]]);e.s(["Search",()=>t],555436)},667585,(e,t,a)=>{"use strict";Object.defineProperty(a,"__esModule",{value:!0}),Object.defineProperty(a,"BailoutToCSR",{enumerable:!0,get:function(){return r}});let s=e.r(132061);function r({reason:e,children:t}){if("u"<typeof window)throw Object.defineProperty(new s.BailoutToCSRError(e),"__NEXT_ERROR_CODE",{value:"E394",enumerable:!1,configurable:!0});return t}},309885,(e,t,a)=>{"use strict";function s(e){return e.split("/").map(e=>encodeURIComponent(e)).join("/")}Object.defineProperty(a,"__esModule",{value:!0}),Object.defineProperty(a,"encodeURIPath",{enumerable:!0,get:function(){return s}})},652157,(e,t,a)=>{"use strict";Object.defineProperty(a,"__esModule",{value:!0}),Object.defineProperty(a,"PreloadChunks",{enumerable:!0,get:function(){return l}});let s=e.r(843476),r=e.r(174080),n=e.r(563599),o=e.r(309885),i=e.r(543369);function l({moduleIds:e}){if("u">typeof window)return null;let t=n.workAsyncStorage.getStore();if(void 0===t)return null;let a=[];if(t.reactLoadableManifest&&e){let s=t.reactLoadableManifest;for(let t of e){if(!s[t])continue;let e=s[t].files;a.push(...e)}}if(0===a.length)return null;let l=(0,i.getDeploymentIdQueryOrEmptyString)();return(0,s.jsx)(s.Fragment,{children:a.map(e=>{let a=`${t.assetPrefix}/_next/${(0,o.encodeURIPath)(e)}${l}`;return e.endsWith(".css")?(0,s.jsx)("link",{precedence:"dynamic",href:a,rel:"stylesheet",as:"style",nonce:t.nonce},e):((0,r.preload)(a,{as:"script",fetchPriority:"low",nonce:t.nonce}),null)})})}},869093,(e,t,a)=>{"use strict";Object.defineProperty(a,"__esModule",{value:!0}),Object.defineProperty(a,"default",{enumerable:!0,get:function(){return c}});let s=e.r(843476),r=e.r(271645),n=e.r(667585),o=e.r(652157);function i(e){return{default:e&&"default"in e?e.default:e}}let l={loader:()=>Promise.resolve(i(()=>null)),loading:null,ssr:!0},c=function(e){let t={...l,...e},a=(0,r.lazy)(()=>t.loader().then(i)),c=t.loading;function d(e){let i=c?(0,s.jsx)(c,{isLoading:!0,pastDelay:!0,error:null}):null,l=!t.ssr||!!t.loading,d=l?r.Suspense:r.Fragment,u=t.ssr?(0,s.jsxs)(s.Fragment,{children:["u"<typeof window?(0,s.jsx)(o.PreloadChunks,{moduleIds:t.modules}):null,(0,s.jsx)(a,{...e})]}):(0,s.jsx)(n.BailoutToCSR,{reason:"next/dynamic",children:(0,s.jsx)(a,{...e})});return(0,s.jsx)(d,{...l?{fallback:i}:{},children:u})}return d.displayName="LoadableComponent",d}},770703,(e,t,a)=>{"use strict";Object.defineProperty(a,"__esModule",{value:!0}),Object.defineProperty(a,"default",{enumerable:!0,get:function(){return r}});let s=e.r(555682)._(e.r(869093));function r(e,t){let a={};"function"==typeof e&&(a.loader=e);let r={...a,...t};return(0,s.default)({...r,modules:r.loadableGenerated?.modules})}("function"==typeof a.default||"object"==typeof a.default&&null!==a.default)&&void 0===a.default.__esModule&&(Object.defineProperty(a.default,"__esModule",{value:!0}),Object.assign(a.default,a),t.exports=a.default)},571930,e=>{"use strict";let t=(0,e.i(475254).default)("bookmark",[["path",{d:"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z",key:"oz39mx"}]]);e.s(["Bookmark",()=>t],571930)},551348,e=>{"use strict";let t=(0,e.i(475254).default)("linkedin",[["path",{d:"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",key:"c2jq9f"}],["rect",{width:"4",height:"12",x:"2",y:"9",key:"mk3on5"}],["circle",{cx:"4",cy:"4",r:"2",key:"bt5ra8"}]]);e.s(["Linkedin",()=>t],551348)},690660,e=>{"use strict";let t=[{id:"rc-1",techId:"reactjs",topic:"React Hooks",title:"useState Hook Syntax",frontText:"How do you correctly update state based on previous state in React?",backText:"Use a functional updater: `setCount(prev => prev + 1)`. This guarantees stale closure prevention during batch updates.",code:`const [count, setCount] = useState(0);
// Correct way:
setCount(prev => prev + 1);`,difficulty:"Beginner"},{id:"rc-2",techId:"nextjs",topic:"Next.js Route Handler",title:"Next.js App Router GET/POST API",frontText:"Where do you define REST API endpoints in Next.js App Router?",backText:"Inside `app/api/[route]/route.js` by exporting named async functions `export async function GET(request) {}`",code:`// app/api/hello/route.js
import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ message: 'Hello!' });
}`,difficulty:"Beginner"},{id:"rc-3",techId:"mongodb",topic:"Mongoose Querying",title:"Select specific fields (Projection)",frontText:"How to fetch only `title` and `author` while excluding `_id` in Mongoose?",backText:"Use `.select('title author -_id')` or `.select({ title: 1, author: 1, _id: 0 })`",code:"const result = await Article.find().select('title author -_id');",difficulty:"Intermediate"}],a=[{id:"reactjs",title:"React.js Complete Course: Zero to Mastery",techId:"reactjs",subtitle:"Learn modern React with Hooks, JSX, Components, State, Context API and Performance Optimization.",level:"Beginner - Advanced",duration:"2.5 Hours",chapters:[{id:"ch-1-intro",title:"1. Introduction to React & JSX",summary:"What is React, Virtual DOM, and how JSX transforms HTML inside JavaScript.",codeSnippet:`import React from "react";

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
</div>`,content:["Tailwind CSS provides low-level utility classes for padding, margins, flexbox, grid, and typography.","Responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`) follow mobile-first design principles.","Dark mode is enabled by prefixing classes with `dark:` (e.g. `bg-white dark:bg-zinc-900`)."],tryItChallenge:"Create a 3-column responsive card layout that collapses to 1 column on mobile."}]}].flatMap(e=>e.chapters.map(t=>({id:t.id,techId:e.techId,title:t.title,summary:t.summary,level:e.level,readTime:"4 min read",updatedAt:"2026-08-09",author:"DevBytes Team",views:4200,likes:310,codeSnippet:t.codeSnippet,explanation:t.content,keyTakeaways:[`Master ${e.title} concepts.`,`Practice challenge: ${t.tryItChallenge}`]})));e.s(["REVISION_CARDS",0,t,"TECH_STACKS",0,[{id:"reactjs",name:"React.js",icon:"Code2",color:"from-cyan-500 to-blue-600",textColor:"text-cyan-500",badgeBg:"bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold",description:"JSX, Components, Hooks (useState, useEffect, useMemo), Context API & Performance",category:"Frontend Framework",totalLessons:7},{id:"nextjs",name:"Next.js",icon:"Zap",color:"from-zinc-900 to-black dark:from-zinc-100 dark:to-zinc-300",textColor:"text-zinc-900 dark:text-zinc-100",badgeBg:"bg-black text-white dark:bg-white dark:text-black font-bold",description:"App Router, Server Components, Routing, Server Actions & ISR/SSG Data Fetching",category:"Fullstack Framework",totalLessons:6},{id:"nodejs",name:"Node.js",icon:"Server",color:"from-emerald-600 to-green-700",textColor:"text-emerald-500",badgeBg:"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold",description:"Event Loop, Async I/O, Modules, FS Module & HTTP Server Setup",category:"Backend Runtime",totalLessons:5},{id:"expressjs",name:"Express.js",icon:"Layers",color:"from-gray-700 to-zinc-900",textColor:"text-zinc-700 dark:text-zinc-300",badgeBg:"bg-zinc-800 text-white font-bold",description:"Routing, Custom Middleware, REST API Architecture, Error Handlers & Auth",category:"Backend Framework",totalLessons:5},{id:"mongodb",name:"MongoDB",icon:"Database",color:"from-emerald-500 to-teal-700",textColor:"text-emerald-600 dark:text-emerald-400",badgeBg:"bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold",description:"Documents, Collections, BSON, Aggregation Pipelines, Indexes & Mongoose ODM",category:"NoSQL Database",totalLessons:5},{id:"tailwindcss",name:"Tailwind CSS",icon:"Sparkles",color:"from-sky-400 to-cyan-500",textColor:"text-sky-500",badgeBg:"bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold",description:"Utility-First CSS, Flexbox & Grid, Responsive Breakpoints, Dark Mode & Animations",category:"CSS Framework",totalLessons:5},{id:"javascript",name:"JavaScript",icon:"FileCode",color:"from-amber-400 to-yellow-500",textColor:"text-amber-500",badgeBg:"bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-bold",description:"ES6+ Syntax, Async/Await, Promises, Closures, Array Methods & DOM",category:"Programming Language",totalLessons:6},{id:"csharp",name:"C# & .NET",icon:"Code2",color:"from-violet-600 to-indigo-700",textColor:"text-violet-600 dark:text-violet-400",badgeBg:"bg-violet-500/10 text-violet-700 dark:text-violet-300 font-bold",description:"C# Fundamentals, OOP, LINQ, Async, EF Core, ASP.NET Core APIs, Testing & Docker",category:"Language & Backend Platform",totalLessons:24}],"TUTORIALS",0,a])},129116,726714,e=>{"use strict";var t=e.i(843476),a=e.i(72102),s=e.i(271645),r=e.i(571930);let n=(0,e.i(475254).default)("bookmark-check",[["path",{d:"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z",key:"oz39mx"}],["path",{d:"m9 10 2 2 4-4",key:"1gnqz4"}]]);e.s(["BookmarkCheck",()=>n],726714);var o=e.i(425831),i=e.i(348498),l=e.i(846696),c=e.i(715826);function d({itemId:e,itemType:d,label:u,size:p="md",className:m=""}){let{isAuthenticated:h}=(0,o.useAppSelector)(e=>e.auth),{requireAuth:f}=(0,c.useAuthPrompt)(),g=s.default.useRef(!1),[x,{isLoading:b}]=(0,i.useToggleSavedItemMutation)(),{data:y}=(0,i.useGetMySavedItemsQuery)(void 0,{skip:!h}),v=s.default.useMemo(()=>!!y?.data?.savedItems&&y.data.savedItems.some(t=>t._id?.toString()===e?.toString()&&t.itemType===d),[y,e,d]),k=async t=>{if(t.preventDefault(),t.stopPropagation(),!h){g.current=!0,f();return}if(!e)return void l.toast.error("Cannot save this item");try{(await x({itemId:e,itemType:d}).unwrap()).data.isSaved?l.toast.success("Saved to your library"):l.toast.success("Removed from your library")}catch{l.toast.error("Failed to update save status")}};s.default.useEffect(()=>{h&&g.current&&e&&(g.current=!1,x({itemId:e,itemType:d}).unwrap().then(()=>l.toast.success("Saved to your library")).catch(()=>l.toast.error("Failed to save item")))},[h,e,d,x]);let w="sm"===p?"w-3.5 h-3.5":"w-4 h-4";return(0,t.jsxs)("button",{onClick:k,disabled:b,title:v?"Remove from saved":"Save to library",className:`group inline-flex items-center gap-2 rounded-full font-bold transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
        ${v?"bg-blue-600 text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 hover:-translate-y-0.5":"bg-zinc-100/90 dark:bg-zinc-800/70 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-700/70 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/80 dark:hover:bg-zinc-700/90 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:-translate-y-0.5 shadow-xs"}
        ${"sm"===p?"px-2.5 py-1.5 text-[10px]":"px-3.5 py-2 text-xs"} ${m}`,children:[(0,t.jsx)("div",{className:`rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${v?"bg-white/20 text-white":"bg-blue-500/10 text-blue-600 dark:text-blue-400 p-1"}`,children:b?(0,t.jsx)(a.default,{className:`${w} `}):v?(0,t.jsx)(n,{className:`${w}`}):(0,t.jsx)(r.Bookmark,{className:`${w}`})}),void 0!==u&&(0,t.jsx)("span",{children:v?"Saved":u||"Save"})]})}e.s(["default",()=>d],129116)},178583,e=>{"use strict";let t=(0,e.i(475254).default)("file-text",[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);e.s(["FileText",()=>t],178583)},686245,e=>{"use strict";var t=e.i(843476),a=e.i(271645),s=e.i(522016),r=e.i(972520),n=e.i(810980),o=e.i(178583),i=e.i(555436),l=e.i(283086),c=e.i(129116),d=e.i(690660);function u({initialCourses:e=[],initialCheatsheets:u=[]}){let[p,m]=(0,a.useState)(""),[h,f]=(0,a.useState)(""),g=(0,a.useMemo)(()=>{let t=h.trim().toLowerCase(),a=e.map(e=>{let t=u.find(t=>t.techId===e.techId);return t?{type:"present",id:t._id,techId:t.techId,title:t.title,slug:t.slug,content:t.content,seoDescription:t.seoDescription,keywords:t.keywords}:{type:"coming_soon",id:`cs-coming-${e._id||e.slug}`,techId:e.techId,title:`${e.title.replace(/\b(Course|Tutorial)\b/gi,"").trim()} Cheatsheet`,slug:null,content:"",seoDescription:`A comprehensive syntax reference for ${e.title}. Coming soon!`,keywords:[]}});u.forEach(e=>{a.some(t=>t.techId===e.techId)||a.push({type:"present",id:e._id,techId:e.techId,title:e.title,slug:e.slug,content:e.content,seoDescription:e.seoDescription,keywords:e.keywords})});let s=a;return p&&(s=s.filter(e=>e.techId===p)),t&&(s=s.filter(e=>`${e.title} ${e.content} ${(e.keywords||[]).join(" ")}`.toLowerCase().includes(t))),s},[e,u,p,h]);return(0,t.jsxs)("main",{className:"mx-auto w-full max-w-6xl px-4 pb-24 pt-20 sm:px-6 sm:pt-24",children:[(0,t.jsxs)("nav",{className:"mb-5 flex items-center gap-2 text-xs font-bold text-zinc-400 sm:mb-7",children:[(0,t.jsx)(s.default,{href:"/",className:"hover:text-blue-600 transition-colors",children:"Home"}),(0,t.jsx)("span",{children:"/"}),(0,t.jsx)("span",{className:"text-zinc-700 dark:text-zinc-200",children:"Cheatsheets"})]}),(0,t.jsxs)("section",{className:"overflow-hidden rounded-4xl border border-blue-500/15 bg-linear-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-xl shadow-blue-600/15 sm:p-12 sm:shadow-2xl",children:[(0,t.jsxs)("span",{className:"inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-black uppercase tracking-wider",children:[(0,t.jsx)(l.Sparkles,{className:"h-4 w-4"})," Reference guides"]}),(0,t.jsx)("h1",{className:"mt-4 max-w-3xl text-2xl font-black tracking-tight xs:text-3xl sm:mt-5 sm:text-5xl",children:"Coding cheatsheets built for fast reading and live practice."}),(0,t.jsx)("p",{className:"mt-4 max-w-2xl text-sm font-medium leading-6 text-blue-100 sm:text-base",children:"Each cheatsheet is a focused article with searchable explanations and code blocks you can open directly in the interactive editor."})]}),(0,t.jsxs)("section",{className:"mt-6 space-y-3 sm:mt-8 sm:space-y-4",children:[(0,t.jsxs)("div",{className:"relative",children:[(0,t.jsx)(i.Search,{className:"absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"}),(0,t.jsx)("input",{value:h,onChange:e=>f(e.target.value),placeholder:"Search titles, concepts, or code...",className:"h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm font-semibold shadow-sm outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900"})]}),(0,t.jsxs)("div",{className:"scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-2",children:[(0,t.jsx)("button",{onClick:()=>m(""),className:`min-h-11 shrink-0 rounded-full px-4 text-xs font-bold ${!p?"bg-blue-600 text-white":"bg-white text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"}`,children:"All"}),d.TECH_STACKS.map(e=>(0,t.jsx)("button",{onClick:()=>m(e.id),className:`min-h-11 shrink-0 rounded-full px-4 text-xs font-bold whitespace-nowrap ${p===e.id?"bg-blue-600 text-white":"bg-white text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"}`,children:e.name},e.id))]})]}),g.length?(0,t.jsx)("section",{className:"mt-5 grid gap-4 sm:mt-6 sm:gap-5 md:grid-cols-2 lg:grid-cols-3",children:g.map(e=>{let a=d.TECH_STACKS.find(t=>t.id===e.techId),i="coming_soon"===e.type;return(0,t.jsxs)("article",{className:`group flex min-h-0 flex-col rounded-3xl border p-5 shadow-sm transition sm:min-h-72 sm:p-6 ${i?"border-dashed border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30 opacity-75":"border-zinc-200 bg-white hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"}`,children:[(0,t.jsxs)("div",{className:"flex items-start justify-between gap-3",children:[(0,t.jsx)("span",{className:"rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-blue-600 dark:text-blue-400",children:a?.name||e.techId}),i?(0,t.jsx)("span",{className:"rounded-full bg-zinc-200/60 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider",children:"Coming Soon"}):(0,t.jsx)(c.default,{itemId:e.id,itemType:"cheatsheet",label:"Save",size:"sm"})]}),i?(0,t.jsx)(o.FileText,{className:"mt-6 h-7 w-7 text-zinc-400"}):(0,t.jsx)(n.BookOpen,{className:"mt-6 h-7 w-7 text-blue-500"}),(0,t.jsx)("h2",{className:"mt-4 text-xl font-black leading-tight",children:e.title}),(0,t.jsx)("p",{className:"mt-3 line-clamp-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400",children:e.seoDescription||function(e=""){return e.replace(/```[\s\S]*?```/g," ").replace(/[#>*_`\[\]()!-]/g," ").replace(/\s+/g," ").trim().slice(0,170)}(e.content)||(i?"Syntax cheatsheet and reference guide coming soon.":"Open this cheatsheet to read the complete reference.")}),i?(0,t.jsx)("span",{className:"mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black text-zinc-400",children:"Coming soon"}):(0,t.jsxs)(s.default,{href:`/cheatsheets/${e.slug}`,className:"mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black text-blue-600",children:["Read cheatsheet"," ",(0,t.jsx)(r.ArrowRight,{className:"h-4 w-4 transition group-hover:translate-x-1"})]})]},e.id)})}):(0,t.jsxs)("div",{className:"mt-6 rounded-3xl border border-zinc-200 bg-white py-20 text-center dark:border-zinc-800 dark:bg-zinc-900",children:[(0,t.jsx)(o.FileText,{className:"mx-auto h-10 w-10 text-zinc-300"}),(0,t.jsx)("p",{className:"mt-3 text-sm font-bold text-zinc-500",children:"No cheatsheets match your search."})]})]})}e.s(["default",()=>u])},322716,e=>{e.v(t=>Promise.all(["static/chunks/5c9fe4a60570bef4.js"].map(t=>e.l(t))).then(()=>t(377023)))},216654,e=>{e.v(t=>Promise.all(["static/chunks/002a086ef08efd5f.js"].map(t=>e.l(t))).then(()=>t(548760)))}]);