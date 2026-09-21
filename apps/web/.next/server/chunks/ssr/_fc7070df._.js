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
</div>`,content:["Tailwind CSS provides low-level utility classes for padding, margins, flexbox, grid, and typography.","Responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`) follow mobile-first design principles.","Dark mode is enabled by prefixing classes with `dark:` (e.g. `bg-white dark:bg-zinc-900`)."],tryItChallenge:"Create a 3-column responsive card layout that collapses to 1 column on mobile."}]}].flatMap(a=>a.chapters.map(b=>({id:b.id,techId:a.techId,title:b.title,summary:b.summary,level:a.level,readTime:"4 min read",updatedAt:"2026-08-09",author:"DevBytes Team",views:4200,likes:310,codeSnippet:b.codeSnippet,explanation:b.content,keyTakeaways:[`Master ${a.title} concepts.`,`Practice challenge: ${b.tryItChallenge}`]})));a.s(["REVISION_CARDS",0,b,"TECH_STACKS",0,[{id:"reactjs",name:"React.js",icon:"Code2",color:"from-cyan-500 to-blue-600",textColor:"text-cyan-500",badgeBg:"bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold",description:"JSX, Components, Hooks (useState, useEffect, useMemo), Context API & Performance",category:"Frontend Framework",totalLessons:7},{id:"nextjs",name:"Next.js",icon:"Zap",color:"from-zinc-900 to-black dark:from-zinc-100 dark:to-zinc-300",textColor:"text-zinc-900 dark:text-zinc-100",badgeBg:"bg-black text-white dark:bg-white dark:text-black font-bold",description:"App Router, Server Components, Routing, Server Actions & ISR/SSG Data Fetching",category:"Fullstack Framework",totalLessons:6},{id:"nodejs",name:"Node.js",icon:"Server",color:"from-emerald-600 to-green-700",textColor:"text-emerald-500",badgeBg:"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold",description:"Event Loop, Async I/O, Modules, FS Module & HTTP Server Setup",category:"Backend Runtime",totalLessons:5},{id:"expressjs",name:"Express.js",icon:"Layers",color:"from-gray-700 to-zinc-900",textColor:"text-zinc-700 dark:text-zinc-300",badgeBg:"bg-zinc-800 text-white font-bold",description:"Routing, Custom Middleware, REST API Architecture, Error Handlers & Auth",category:"Backend Framework",totalLessons:5},{id:"mongodb",name:"MongoDB",icon:"Database",color:"from-emerald-500 to-teal-700",textColor:"text-emerald-600 dark:text-emerald-400",badgeBg:"bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold",description:"Documents, Collections, BSON, Aggregation Pipelines, Indexes & Mongoose ODM",category:"NoSQL Database",totalLessons:5},{id:"tailwindcss",name:"Tailwind CSS",icon:"Sparkles",color:"from-sky-400 to-cyan-500",textColor:"text-sky-500",badgeBg:"bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold",description:"Utility-First CSS, Flexbox & Grid, Responsive Breakpoints, Dark Mode & Animations",category:"CSS Framework",totalLessons:5},{id:"javascript",name:"JavaScript",icon:"FileCode",color:"from-amber-400 to-yellow-500",textColor:"text-amber-500",badgeBg:"bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-bold",description:"ES6+ Syntax, Async/Await, Promises, Closures, Array Methods & DOM",category:"Programming Language",totalLessons:6},{id:"csharp",name:"C# & .NET",icon:"Code2",color:"from-violet-600 to-indigo-700",textColor:"text-violet-600 dark:text-violet-400",badgeBg:"bg-violet-500/10 text-violet-700 dark:text-violet-300 font-bold",description:"C# Fundamentals, OOP, LINQ, Async, EF Core, ASP.NET Core APIs, Testing & Docker",category:"Language & Backend Platform",totalLessons:24}],"TUTORIALS",0,c])},744792,a=>{"use strict";var b=a.i(187924),c=a.i(572131),d=a.i(238246),e=a.i(571987),f=a.i(732860),g=a.i(953722),h=a.i(469769),i=a.i(717545),j=a.i(587532),k=a.i(808406),l=a.i(167453),m=a.i(649447),n=a.i(439858),o=a.i(329242);let p={cardBg:"bg-blue-50/75 dark:bg-blue-950/25 hover:bg-blue-50 dark:hover:bg-blue-950/40",border:"border-blue-200/80 dark:border-blue-900/50 hover:border-blue-400 dark:hover:border-blue-500",badgeBg:"bg-blue-100/90 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/50",titleHover:"group-hover:text-blue-600 dark:group-hover:text-blue-400",btn:"bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",iconColor:"text-blue-600 dark:text-blue-400"},q={reactjs:p,nextjs:p,javascript:p,typescript:p,css:p,nodejs:p,mongodb:p,expressjs:p,tailwindcss:p,default:p};function r({initialCourses:a=[]}){let[p,r]=(0,c.useState)(""),[s,t]=(0,c.useState)(""),u=(0,c.useMemo)(()=>{let b=a;if(p&&(b=b.filter(a=>a.techId?.toLowerCase()===p.toLowerCase()||a.slug?.toLowerCase().includes(p.toLowerCase()))),s.trim()){let a=s.trim().toLowerCase();b=b.filter(b=>b.title?.toLowerCase().includes(a)||b.description?.toLowerCase().includes(a)||b.subtitle?.toLowerCase().includes(a)||b.techId?.toLowerCase().includes(a))}return b},[a,p,s]),v=(0,c.useMemo)(()=>a.reduce((a,b)=>a+(b.chapterCount||b.chapters?.length||0),0),[a]);return(0,b.jsxs)("main",{className:"mx-auto w-full max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pt-24 md:px-8",children:[(0,b.jsxs)("nav",{className:"mb-4 flex items-center gap-2 text-xs font-bold text-zinc-400",children:[(0,b.jsx)(d.default,{href:"/",className:"hover:text-blue-600 transition-colors",children:"Home"}),(0,b.jsx)("span",{children:"/"}),(0,b.jsx)("span",{className:"text-zinc-700 dark:text-zinc-200",children:"Courses"})]}),(0,b.jsxs)("div",{className:"scrollbar-none -mx-4 mb-5 flex items-center gap-1 overflow-x-auto px-4 py-1 sm:mx-0 sm:mb-7 sm:w-fit sm:rounded-full sm:border sm:border-zinc-200/80 sm:bg-white sm:p-1.5 sm:shadow-xs dark:sm:border-zinc-800 dark:sm:bg-zinc-900",children:[(0,b.jsxs)("div",{className:"flex min-h-11 shrink-0 items-center gap-2 px-4 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md shadow-blue-500/20",children:[(0,b.jsx)(g.BookOpen,{className:"w-4 h-4"}),(0,b.jsx)("span",{children:"Courses"})]}),(0,b.jsxs)(d.default,{href:"/revision",className:"flex min-h-11 shrink-0 items-center gap-2 px-4 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all",children:[(0,b.jsx)(i.Layers,{className:"w-4 h-4 text-purple-500"}),(0,b.jsx)("span",{children:"Flashcards Deck"})]}),(0,b.jsxs)(d.default,{href:"/quiz",className:"flex min-h-11 shrink-0 items-center gap-2 px-4 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all",children:[(0,b.jsx)(m.HelpCircle,{className:"w-4 h-4 text-emerald-500"}),(0,b.jsx)("span",{children:"Practice Quiz"})]})]}),(0,b.jsx)("section",{className:"rounded-3xl sm:rounded-[2.5rem] border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/90 p-5 sm:p-10 shadow-xs",children:(0,b.jsxs)("div",{className:"max-w-3xl",children:[(0,b.jsxs)("div",{className:"mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",children:[(0,b.jsx)(h.GraduationCap,{className:"h-3.5 w-3.5"}),(0,b.jsx)("span",{children:"Interactive Learning Tracks"})]}),(0,b.jsx)("h1",{className:"font-outfit text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-white leading-tight",children:"All Published Courses & Curriculum Roadmaps"}),(0,b.jsx)("p",{className:"mt-3 text-xs sm:text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-2xl",children:"Master full-stack web development with structured hands-on courses. Every course features interactive code playgrounds, syntax guides, and real-world projects."}),(0,b.jsxs)("div",{className:"mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 text-xs font-semibold text-zinc-500 dark:text-zinc-400",children:[(0,b.jsxs)("div",{className:"flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300",children:[(0,b.jsx)(g.BookOpen,{className:"w-3.5 h-3.5 text-blue-500"}),(0,b.jsxs)("span",{children:[a.length," Published Courses"]})]}),(0,b.jsxs)("div",{className:"flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300",children:[(0,b.jsx)(i.Layers,{className:"w-3.5 h-3.5 text-emerald-500"}),(0,b.jsxs)("span",{children:[v,"+ Interactive Lessons"]})]}),(0,b.jsxs)("div",{className:"flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300",children:[(0,b.jsx)(k.Sparkles,{className:"w-3.5 h-3.5 text-amber-500"}),(0,b.jsx)("span",{children:"100% Free & Open Access"})]})]})]})}),(0,b.jsxs)("section",{className:"mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:mt-8 sm:gap-4",children:[(0,b.jsxs)("div",{className:"relative flex-1 max-w-md",children:[(0,b.jsx)(j.Search,{className:"absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"}),(0,b.jsx)("input",{type:"text",placeholder:"Search courses by topic, framework, or title...",value:s,onChange:a=>t(a.target.value),className:"h-12 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full pl-11 pr-5 text-sm font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-xs"})]}),(0,b.jsxs)("div",{className:"scrollbar-none -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0",children:[(0,b.jsx)("button",{onClick:()=>r(""),className:`min-h-11 shrink-0 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${""===p?"bg-blue-600 text-white shadow-sm":"bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-blue-500"}`,children:"All Technologies"}),n.TECH_STACKS.map(a=>(0,b.jsx)("button",{onClick:()=>r(a.id),className:`flex min-h-11 shrink-0 items-center gap-1.5 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer ${p===a.id?"bg-blue-600 text-white shadow-sm":"bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-blue-500"}`,children:(0,b.jsx)("span",{children:a.name})},a.id))]})]}),(0,b.jsx)("section",{className:"mt-6 sm:mt-8",children:u.length>0?(0,b.jsx)("div",{className:"grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3",children:u.map((a,c)=>{let i=a.slug||a.id||a._id,j=a.chapterCount??a.chapters?.length??0,k=q[a.techId?.toLowerCase()]||q.default;return(0,b.jsxs)("article",{className:`group relative flex flex-col justify-between overflow-hidden rounded-4xl sm:rounded-[2.5rem] border bg-linear-to-br from-blue-500/10 via-indigo-500/5 to-white dark:to-zinc-900/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 ${k.border}`,children:[(0,b.jsxs)("div",{children:[a.thumbnail?(0,b.jsx)(d.default,{href:`/courses/${i}`,className:"relative mb-3.5 block w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 aspect-[2.1/1] border border-zinc-200/60 dark:border-zinc-800",children:(0,b.jsx)(e.default,{src:(0,o.getImageUrl)(a.thumbnail),alt:a.title,fill:!0,className:"object-cover transition-transform duration-500 group-hover:scale-103",unoptimized:!0})}):(0,b.jsx)(d.default,{href:`/courses/${i}`,className:"relative mb-3.5 flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-blue-500/10 via-cyan-500/5 to-white dark:to-zinc-900 aspect-[2.1/1] border border-blue-500/20 transition-all group-hover:border-blue-500/40",children:(0,b.jsxs)("div",{className:"relative z-10 flex flex-col items-center gap-1.5 p-3 text-center",children:[(0,b.jsx)("div",{className:"flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform",children:(0,b.jsx)(h.GraduationCap,{className:"h-5 w-5"})}),(0,b.jsx)("span",{className:"font-outfit text-xs font-black tracking-tight text-zinc-900 dark:text-white line-clamp-1",children:a.title}),(0,b.jsx)("span",{className:"text-[9px] font-bold uppercase tracking-wider text-zinc-400",children:a.techId?.toUpperCase()||"DEVELOPER TRACK"})]})}),(0,b.jsxs)("div",{className:"flex items-center justify-between gap-2 mb-2.5",children:[(0,b.jsx)("span",{className:`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider border ${k.badgeBg}`,children:a.techId?a.techId.toUpperCase():"DEVELOPER"}),(0,b.jsxs)("span",{className:"inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/20",children:[(0,b.jsx)(l.CheckCircle2,{className:"w-3 h-3 text-emerald-500"}),(0,b.jsx)("span",{children:"Online Track"})]})]}),(0,b.jsx)("h3",{className:`font-outfit text-base sm:text-lg font-black tracking-tight text-zinc-950 dark:text-white ${k.titleHover} transition-colors line-clamp-2 mt-2`,children:(0,b.jsx)(d.default,{href:`/courses/${i}`,children:a.title})}),(0,b.jsx)("p",{className:"mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed line-clamp-2",children:a.description||a.subtitle||`Master ${a.title} with step-by-step interactive lessons and syntax guides on asif.to.`})]}),(0,b.jsxs)("div",{className:"mt-5 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-3",children:[(0,b.jsxs)("div",{className:"flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400",children:[(0,b.jsx)(g.BookOpen,{className:`w-4 h-4 ${k.iconColor}`}),(0,b.jsxs)("span",{children:[j," Lessons"]})]}),(0,b.jsxs)(d.default,{href:`/courses/${i}`,className:`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer ${k.btn}`,children:[(0,b.jsx)("span",{children:"Start Track"}),(0,b.jsx)(f.ArrowRight,{className:"w-3.5 h-3.5"})]})]})]},a._id||a.id||i)})}):(0,b.jsxs)("div",{className:"flex flex-col items-center justify-center py-20 px-4 text-center rounded-4xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50",children:[(0,b.jsx)(g.BookOpen,{className:"w-12 h-12 text-zinc-400 mb-3"}),(0,b.jsx)("h3",{className:"text-lg font-bold font-outfit text-zinc-900 dark:text-white",children:"No Courses Found"}),(0,b.jsx)("p",{className:"text-xs text-zinc-500 max-w-sm mt-1",children:"No published courses matched your filter search criteria. Try clearing the search or selecting another technology."}),(0,b.jsx)("button",{onClick:()=>{t(""),r("")},className:"mt-5 px-5 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer",children:"Reset Filters"})]})})]})}a.s(["default",()=>r])}];

//# sourceMappingURL=_fc7070df._.js.map