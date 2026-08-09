/**
 * Next.js Complete Course Seeder
 * Creates the full Next.js course with all chapters via API
 * Run: node seed-nextjs-course.js
 */

const API_BASE = "http://localhost:5000/api/v1";

async function login() {
  const res = await fetch(`${API_BASE}/auth/admin/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@mazlis.com", password: "admin123" }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("Login failed:", JSON.stringify(data));
    process.exit(1);
  }
  const token = data.token || data.data?.token || data.accessToken;
  if (!token) {
    console.error("No token in response:", JSON.stringify(data));
    process.exit(1);
  }
  console.log("✅ Logged in successfully");
  return token;
}

async function createCourse(token, courseData) {
  const res = await fetch(`${API_BASE}/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(courseData),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("Course creation failed:", JSON.stringify(data));
    process.exit(1);
  }
  return data.data || data;
}

async function deleteExistingCourses(token) {
  const res = await fetch(`${API_BASE}/courses?techId=nextjs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  const courses = data.data || [];
  
  for (const course of courses) {
    if (course.techId === "nextjs") {
      await fetch(`${API_BASE}/courses/${course._id || course.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`🗑️ Deleted old Next.js course: ${course._id || course.id}`);
    }
  }
}

async function createChapter(token, courseId, chapterData) {
  const res = await fetch(`${API_BASE}/courses/${courseId}/chapters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(chapterData),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Chapter creation failed for "${chapterData.title}":`, JSON.stringify(data));
    return null;
  }
  return data.data || data;
}

// ─── CHAPTER DATA ─────────────────────────────────────────────────────────────

const chapters = [
  {
    order: 1,
    title: "What is Next.js? Why Next.js?",
    summary: "Understand why Next.js exists, what problems it solves over plain React, and the key features that make it the gold standard for production React apps.",
    content: `## What is Next.js?

Next.js is a **full-stack React framework** built by Vercel that adds powerful server-side capabilities, robust routing, and production-level optimizations to React. While React itself is merely a UI library that excels at managing state and rendering components in the browser, Next.js takes React and wraps it into a complete, opinionated architecture.

When we say "framework" instead of "library", we mean that Next.js gives you a specific set of rules and folder structures to follow. In return, it handles all the complex plumbing—like routing, bundling, compiling, and server-side rendering—automatically.

---

## Why NOT Plain React? The Problems Next.js Solves

If you have built apps with Create React App (CRA) or Vite + React, you were building **Client-Side Rendered (CSR)** applications. In a CSR app, the server sends a nearly empty HTML file (often just \`<div id="root"></div>\`) along with a massive JavaScript bundle.

This approach creates several significant problems for production applications:

### 1. Poor Search Engine Optimization (SEO)
Search engine crawlers (like Googlebot) traditionally struggle to index client-side rendered apps. When they request a plain React page, they see an empty \`div\`. While Google's crawler has gotten better at executing JavaScript, it's still slower, less reliable, and many social media link preview bots (like Twitter/X or iMessage) will simply show a blank preview. Next.js solves this by pre-rendering HTML on the server.

### 2. Slow Initial Page Load
In plain React, the user sees a blank white screen until the entire React bundle is downloaded, parsed, and executed. This harms user experience, especially on slow mobile networks.

### 3. Routing Boilerplate
In a standard React app, you must install and configure third-party libraries (like \`react-router-dom\`) and manually wire up your navigation logic. Next.js provides a robust **File-System Based Router** out of the box.

### 4. Need for a Separate Backend
If your React app needs to talk to a database, you usually have to spin up a completely separate Express or NestJS server. Next.js allows you to write backend API endpoints and server-side logic directly in the same codebase.

---

## The Ultimate Comparison

Here is a quick breakdown of how Next.js outshines a traditional Client-Side React setup:

| Feature/Problem | Plain React (Vite / CRA) | Next.js (App Router) |
|---|---|---|
| **SEO & Crawlers** | Poor (Client-side rendering only) | Excellent (HTML is pre-rendered on the server) |
| **Initial Load Speed** | Slower (Waits for JS bundle) | Faster (User sees HTML immediately) |
| **Routing** | Manual setup (react-router) | Automatic File-System Routing |
| **Data Fetching** | Fetch on mount (waterfall issues) | Native Server Components & Server Actions |
| **Backend / APIs** | Requires separate Node.js server | Built-in Route Handlers and Server Actions |
| **Image Optimization** | Manual handling required | Automatic WebP/AVIF via \`<Image>\` |
| **Code Splitting** | Requires manual \`React.lazy()\` | Automatic per-page code splitting |

---

## The Two Eras of Next.js: Pages vs App Router

As you learn Next.js, you will encounter two different routing paradigms. It is critical to understand the difference:

### 1. The Pages Router (Legacy, Next.js 12 and below)
Historically, Next.js used the \`pages/\` directory. You would fetch data using specialized functions like \`getServerSideProps\` (for SSR) and \`getStaticProps\` (for SSG). While still fully supported, this is now considered the older way of building apps.

### 2. The App Router (Modern, Next.js 13+)
Introduced recently, the \`app/\` directory represents a massive paradigm shift. It is built entirely around **React Server Components (RSC)**. By default, every component you write runs *only on the server*. This eliminates the need for \`getServerSideProps\` and drastically reduces the amount of JavaScript sent to the browser. 

> **Important Note:** This course focuses entirely on the modern **App Router**, as it is the future of React development.

---

## The Core Capabilities of Next.js

1. **Server-Side Rendering (SSR):** Generates HTML on the server for *every single request*. Perfect for highly dynamic data that changes constantly (like a user dashboard).
2. **Static Site Generation (SSG):** Generates HTML once at *build time*. Perfect for marketing pages and blogs, resulting in lightning-fast, CDN-cacheable pages.
3. **Incremental Static Regeneration (ISR):** A hybrid approach where static pages are rebuilt in the background on a timer, without needing a full site redeploy.
4. **React Server Components:** Components that fetch data and render securely on the server, never exposing their code or sensitive API keys to the browser.

---

## When Should You Use Next.js?

Next.js is incredibly versatile, but it shines the brightest in these scenarios:
- **E-Commerce Platforms:** Where SEO, initial load times, and dynamic pricing are critical.
- **Content Heavy Sites:** Blogs, news outlets, and documentation sites.
- **SaaS Applications:** Dashboards that require secure data fetching and complex authentication flows.
- **Full-Stack MVPs:** When you want to move fast without managing separate frontend and backend repositories.

## Summary

Next.js takes the UI power of React and adds the missing pieces required for serious, production-grade applications. It shifts the heavy lifting from the user's browser back to the server, resulting in faster, more secure, and highly discoverable applications.`,
    tryItChallenge: "Explore nextjs.org/showcase and find three major companies using Next.js. Notice how fast their pages load and right-click to 'View Page Source' to see the pre-rendered HTML that a plain React app wouldn't have.",
  },
  {
    order: 2,
    title: "Setting Up Your First Next.js Project",
    summary: "Scaffold a new Next.js 14+ project using create-next-app, understand the project structure, and run your first dev server.",
    content: `## Creating a New Next.js Project

The fastest and most reliable way to start a Next.js project is with the official CLI tool called \`create-next-app\`.

\`\`\`bash
npx create-next-app@latest my-app
\`\`\`

When you run this command, Next.js will prompt you with several architectural choices:

\`\`\`
Would you like to use TypeScript? Yes
Would you like to use ESLint? Yes
Would you like to use Tailwind CSS? Yes
Would you like to use src/ directory? Yes
Would you like to use App Router? Yes
Would you like to customize the default import alias? No
\`\`\`

> **Interview Highlight**  
> **Q: What is the \`src/\` directory used for in Next.js?**  
> A: The \`src/\` directory is an optional but highly recommended convention to separate your application's source code from configuration files (like \`.env\`, \`next.config.mjs\`, \`package.json\`) that live in the project root. It prevents accidental exposure of config files and keeps the root clean.

---

## Project Structure Explained

After creation, your folder structure looks like this:

\`\`\`
my-app/
├── public/               ← Static assets (images, fonts, icons)
├── src/
│   └── app/
│       ├── layout.jsx    ← Root layout (wraps all pages)
│       ├── page.jsx      ← Home page (route: /)
│       └── globals.css   ← Global CSS
├── next.config.mjs       ← Next.js configuration
├── package.json
└── jsconfig.json         ← Path aliases (@/ -> src/)
\`\`\`

> **Definition: The \`public/\` Directory**  
> Any file placed in the \`public\` folder is served directly at the root URL path. For example, \`public/logo.png\` is accessible via \`http://localhost:3000/logo.png\`. This is where you store static files like favicons, robots.txt, and raw images.

---

## Key Files Explained

### src/app/layout.jsx — The Root Layout

The root layout is a **required** file in the App Router. It defines the global HTML structure.

\`\`\`jsx
export const metadata = {
  title: 'My App',
  description: 'My Next.js app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>Global Navigation</nav>
        {children}
      </body>
    </html>
  )
}
\`\`\`

> **Interview Highlight**  
> **Q: Can a Next.js App Router application exist without a root \`layout.jsx\`?**  
> A: No. The App Router requires at least one root layout to define the \`<html>\` and \`<body>\` tags. If you delete it, Next.js will automatically generate a basic one for you on the next development server run.

### src/app/page.jsx — Home Page

This file corresponds to your root URL (\`/\`). 

\`\`\`jsx
export default function HomePage() {
  return <h1>Hello, Next.js!</h1>
}
\`\`\`

---

## Running the Dev Server

To start your application locally with Hot Module Replacement (HMR):

\`\`\`bash
cd my-app
npm run dev
\`\`\`

Visit **http://localhost:3000** — your app is live. When you save a file, the browser updates instantly without a full page refresh.

---

## Available Scripts (package.json)

| Command | Purpose | When to use |
|---|---|---|
| \`next dev\` | Starts the development server with Hot Module Replacement (HMR) | When writing code locally |
| \`next build\` | Compiles your app, optimizes assets, and creates an optimized production bundle | Before deploying to production |
| \`next start\` | Starts a production Node.js server using the built bundle | To test the production build locally or run in Docker |
| \`next lint\` | Runs ESLint to catch syntax and architectural errors | Before committing code |

> **Definition: Next.js Compiler**  
> Next.js uses **SWC** (Speedy Web Compiler), a Rust-based compiler that replaces Babel and Terser. It is exponentially faster at compiling JavaScript/TypeScript and minifying code during \`next build\`.

---

## Path Aliases

By default, Next.js configures the \`@/\` path alias in \`jsconfig.json\` or \`tsconfig.json\`. This maps to the root of your code (usually \`src/\`).

**Why is this useful?**
It prevents ugly relative import paths in deeply nested files.

\`\`\`jsx
// ❌ Bad (Brittle and hard to read)
import Button from '../../../components/Button'

// ✅ Good (Absolute alias)
import Button from '@/components/Button'
\`\`\`

## Summary
Setting up Next.js is zero-configuration. The framework establishes strong conventions out of the box—like the \`public\` folder for static assets and \`@/\` aliases—allowing developers to focus on writing application code rather than configuring Webpack or Babel.`,
    tryItChallenge: "Create a new Next.js project, change the home page to display your name and a welcome message, then run it locally.",
  },
  {
    order: 3,
    title: "File-Based Routing in the App Router",
    summary: "Master how Next.js creates routes from your file system — pages, nested routes, dynamic routes, route groups, and more.",
    content: `## How File-Based Routing Works

In the Next.js App Router, **the folder structure IS the routing structure**. Instead of declaring routes in a centralized \`App.jsx\` file (like in React Router), you define routes by creating folders inside the \`src/app/\` directory.

> **Definition: File-Based Routing**  
> A routing mechanism where the framework automatically maps the file system hierarchy (folders and specific filenames) to URL paths. Every folder under \`app/\` that contains a \`page.jsx\` file becomes a publicly accessible URL route.

---

## Basic Routes & Nested Routes

\`\`\`
src/app/
├── page.jsx           → /
├── about/
│   └── page.jsx       → /about
└── dashboard/
    ├── page.jsx       → /dashboard
    └── settings/
        └── page.jsx   → /dashboard/settings
\`\`\`

If a folder does not contain a \`page.jsx\` file, it is **not routable**. This allows you to safely store components, styles, or utility functions alongside your routes without them accidentally becoming public URLs.

---

## Dynamic Routes — [param]

When you don't know the exact segment name ahead of time (e.g., blog post slugs or user IDs), use square brackets to create dynamic routes.

\`\`\`
src/app/
└── blog/
    ├── page.jsx          → /blog
    └── [slug]/
        └── page.jsx      → /blog/hello-world, /blog/any-post
\`\`\`

### Accessing the Dynamic Param

Dynamic segments are passed as the \`params\` prop to your \`page.jsx\` component.

\`\`\`jsx
// src/app/blog/[slug]/page.jsx
export default function BlogPost({ params }) {
  // If URL is /blog/nextjs-routing, params.slug is 'nextjs-routing'
  return <h1>Post: {params.slug}</h1>
}
\`\`\`

> **Interview Highlight**  
> **Q: What is the difference between Catch-All \`[...slug]\` and Optional Catch-All \`[[...slug]]\` routes?**  
> A: A Catch-All route (\`app/docs/[...slug]/page.jsx\`) will match \`/docs/a\`, \`/docs/a/b\`, etc., but **will 404 on \`/docs\`**. An Optional Catch-All route (\`[[...slug]]\`) will match all those nested paths **AND** the root \`/docs\` path.

---

## Route Groups — (groupName)

You can group routes logically without affecting the URL path by wrapping a folder name in parentheses.

\`\`\`
src/app/
├── (marketing)/
│   ├── about/page.jsx     → /about (URL is NOT /marketing/about)
│   └── contact/page.jsx   → /contact
└── (app)/
    ├── layout.jsx         ← Layout applied only to /dashboard
    └── dashboard/
        └── page.jsx       → /dashboard
\`\`\`

> **Definition: Route Groups**  
> A feature used to organize route segments into logical groups without adding them to the URL path. They are incredibly useful for applying different layouts to different sections of the app (e.g., a marketing layout vs. an authenticated dashboard layout) while keeping the URLs clean.

---

## Special Files in the App Router

Next.js provides a set of special files to create UI for specific routing behaviors:

| File | Purpose |
|---|---|
| \`page.jsx\` | Creates the unique UI for a route and makes the path publicly accessible. |
| \`layout.jsx\` | Wraps the route and its children in shared UI. **Preserves state** on navigation. |
| \`template.jsx\` | Similar to layout, but creates a **new instance** on navigation (good for enter animations). |
| \`loading.jsx\` | Defines an automatic React Suspense fallback UI (e.g., a skeleton loader). |
| \`error.jsx\` | Defines an Error Boundary UI. Must be a Client Component (\`'use client'\`). |
| \`not-found.jsx\` | UI to show when a route is not found or when \`notFound()\` is thrown. |
| \`route.js\` | Creates a backend API endpoint (HTTP handler). |

---

## Navigation: The \`<Link>\` Component

Always use the Next.js \`<Link>\` component for navigation rather than standard HTML \`<a>\` tags.

\`\`\`jsx
import Link from 'next/link'

export default function Nav() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
    </nav>
  )
}
\`\`\`

> **Interview Highlight**  
> **Q: Why should you use \`<Link>\` instead of \`<a>\` in Next.js?**  
> A: \`<Link>\` enables client-side navigation between routes without a full page reload, maintaining application state. Furthermore, it automatically **prefetches** the linked page's code in the background when the link enters the viewport, making transitions near-instantaneous.

---

## Programmatic Navigation

When you need to navigate after an action (like submitting a form), use the \`useRouter\` hook.

\`\`\`jsx
'use client'
import { useRouter } from 'next/navigation'

export default function LoginButton() {
  const router = useRouter()
  
  return (
    <button onClick={() => router.push('/dashboard')}>
      Log In
    </button>
  )
}
\`\`\``,
    tryItChallenge: "Create a mini blog with routes: /blog (list page), /blog/[slug] (individual post page). Pass the slug as a prop and display it on the post page.",
  },
  {
    order: 4,
    title: "Layouts and Nested Layouts",
    summary: "Learn how layout.jsx files create persistent UI shells that wrap your pages — headers, sidebars, footers that don't re-render on navigation.",
    content: `## What is a Layout?

A \`layout.jsx\` file creates a UI shell that wraps its sibling \`page.jsx\` and all nested child routes. Unlike pages, **layouts do not re-render on navigation**. This means any state inside a layout (like a search input or an open sidebar) is preserved when users click between pages.

> **Definition: Layout Component**  
> A React component that shares UI across multiple routes. On navigation, layouts preserve state, remain interactive, and do not re-render, enabling true Single Page Application (SPA) feel within a multi-page framework.

---

## The Root Layout (Required)

Every Next.js App Router application must have a top-level root layout at \`src/app/layout.jsx\`.

\`\`\`jsx
// src/app/layout.jsx
import './globals.css'

export const metadata = {
  title: 'My App',
  description: 'My awesome Next.js app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>My Global Header</header>
        <main>{children}</main>
        <footer>My Global Footer</footer>
      </body>
    </html>
  )
}
\`\`\`

The \`{children}\` prop is a placeholder where the specific page content (or nested layout content) gets injected.

---

## Nested Layouts

Layouts can be deeply nested. When you put a \`layout.jsx\` inside a folder, it wraps all pages inside that folder and deeper, stacking inside the layouts above it.

\`\`\`
src/app/
├── layout.jsx          ← Root layout (Outer shell: html, body, Header)
├── page.jsx            ← Home: wrapped by Root layout
└── dashboard/
    ├── layout.jsx      ← Dashboard layout (Inner shell: Sidebar)
    ├── page.jsx        ← /dashboard: Sidebar + Root layout
    └── settings/
        └── page.jsx    ← /dashboard/settings: Sidebar + Root layout
\`\`\`

> **Interview Highlight**  
> **Q: What happens to the DOM when you navigate from \`/dashboard\` to \`/dashboard/settings\`?**  
> A: The Root Layout and the Dashboard Layout do not re-render. Only the specific page component (\`settings/page.jsx\`) is fetched and swapped into the DOM. This prevents unnecessary network requests and preserves layout state (like scroll position).

### Example of a Nested Dashboard Layout

\`\`\`jsx
// src/app/dashboard/layout.jsx
export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 text-white">
        <nav>
          <a href="/dashboard">Overview</a>
          <a href="/dashboard/settings">Settings</a>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
\`\`\`

---

## Layouts vs Templates

Next.js also provides a \`template.jsx\` file. It looks identical to a layout, but it behaves differently.

| Feature | \`layout.jsx\` | \`template.jsx\` |
|---|---|---|
| **Re-renders on navigation?** | No | Yes (A new instance is mounted) |
| **Preserves state?** | Yes | No (State is reset) |
| **Primary Use Case** | Sidebars, Navigation, Footers | Enter/Exit CSS animations, resetting forms, tracking page views |

> **Definition: Template File (\`template.jsx\`)**  
> A file that wraps a route segment similar to a layout, but creates a new DOM instance on navigation. Use it when you specifically *want* to trigger a re-render or reset state across route changes.

---

## Metadata in Layouts

Layouts are an excellent place to define metadata templates. This avoids repeating the same site name on every page.

\`\`\`jsx
// src/app/dashboard/layout.jsx
export const metadata = {
  title: {
    template: '%s | Dashboard',
    default: 'Dashboard Overview',
  }
}
\`\`\`

When a child page defines its own title:

\`\`\`jsx
// src/app/dashboard/settings/page.jsx
export const metadata = {
  title: 'Settings',  // The final title becomes: "Settings | Dashboard"
}
\`\`\`

---

## Summary
Layouts allow you to build complex, nested application shells. By preventing re-renders on navigation, layouts dramatically improve performance and user experience by preserving scroll position and UI state.`,
    tryItChallenge: "Add a sidebar layout to your /dashboard route that shows navigation links to 3 sub-pages, but shares a common header from the root layout.",
  },
  {
    order: 5,
    title: "Server Components vs Client Components",
    summary: "Understand the fundamental difference between React Server Components (RSC) and Client Components, when to use each, and how to think about the server-client boundary.",
    content: `## The Big Shift: Server vs Client

In the Next.js App Router, **all components are Server Components by default**. This is a massive paradigm shift from traditional React, where everything runs in the user's browser (the client). 

By defaulting to the server, Next.js allows you to keep large dependencies out of the browser bundle and write secure data-fetching logic directly in your components.

> **Definition: React Server Component (RSC)**  
> A component that executes exclusively on the server. Its code is never sent to the browser. The server evaluates the component into a special JSON-like format and sends only the resulting UI (HTML) to the client.

---

## Server Components

Server Components run entirely on the server. 
- **Can:** Connect directly to databases, read local files, use \`async/await\`, keep secret API keys safe.
- **Cannot:** Use React hooks (\`useState\`, \`useEffect\`), browser APIs (\`window\`, \`document\`), or attach event listeners (\`onClick\`).

\`\`\`jsx
// src/app/users/page.jsx (Server Component)

async function getUsers() {
  // Safe to put secret API keys here, they never leak to the browser!
  const res = await fetch('https://api.example.com/users', {
    headers: { Authorization: \`Bearer \${process.env.SECRET_API_KEY}\` }
  })
  return res.json()
}

export default async function UsersPage() {
  const users = await getUsers()  // Direct await inside the component!
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
\`\`\`

---

## Client Components

To opt into client-side interactivity, you must add the \`'use client'\` directive at the very top of the file.

\`\`\`jsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}
\`\`\`

> **Interview Highlight**  
> **Q: What does the \`'use client'\` directive actually do?**  
> A: It defines a **boundary** between the server and the client module graph. When the bundler sees \`'use client'\`, it treats that file and all of its imported dependencies as part of the client bundle. **It does not mean the component only renders on the client.** Client Components are actually pre-rendered on the server (for SEO/initial load) and then hydrated on the client.

---

## The Golden Rule: The Composition Pattern

A common mistake beginners make is putting \`'use client'\` at the very top of their \`page.jsx\`. This turns the entire route into a Client Component, destroying the performance benefits of Next.js.

Instead, push interactivity down to the smallest possible leaf components.

\`\`\`
✅ GOOD:
Page (Server) -> Layout (Server) -> ProductList (Server) -> AddToCartButton (Client)

❌ BAD:
Page (Client) -> ProductList (Client) -> AddToCartButton (Client)
\`\`\`

### Example of Good Composition

\`\`\`jsx
// src/app/products/page.jsx (Server Component)
import AddToCartButton from '@/components/AddToCartButton'

async function getProducts() {
  const res = await fetch('/api/products')
  return res.json()
}

export default async function ProductsPage() {
  const products = await getProducts()
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          {/* We only ship the JavaScript for the button, not the whole page! */}
          <AddToCartButton productId={product.id} />
        </div>
      ))}
    </div>
  )
}
\`\`\`

---

## Passing Data from Server to Client

Server Components can pass props to Client Components, but there is a strict rule: **the props must be serializable**.

\`\`\`jsx
// Server Component
async function UserProfile({ userId }) {
  const user = await db.users.findById(userId)
  
  // ✅ OK: passing primitive data like strings, numbers, booleans, flat objects
  // ❌ BAD: passing functions, Promises, or classes (they cannot be serialized over the network)
  return <UserCard user={user} />
}
\`\`\`

---

## Quick Reference

| Feature | Server Component (Default) | Client Component (\`'use client'\`) |
|---|---|---|
| async/await | Yes | No |
| Database access | Yes | No (Insecure) |
| useState / useEffect | No | Yes |
| onClick / onChange | No | Yes |
| Browser APIs (window) | No | Yes |
| Environmental secrets | Yes (Safe) | No (Will leak if exposed) |
| Bundle size impact | 0kb (None) | Yes (Adds to JS payload) |

'use client'
function UserCard({ user }) {
  const [liked, setLiked] = useState(false)
  return (
    <div>
      <h2>{user.name}</h2>
      <button onClick={() => setLiked(!liked)}>
        {liked ? 'Liked!' : 'Like'}
      </button>
    </div>
  )
\`\`\`

---

## Quick Reference

| Feature | Server Component | Client Component |
|---|---|---|
| async/await | Yes | No |
| Database access | Yes | No |
| useState / useEffect | No | Yes |
| Event handlers | No | Yes |
| Browser APIs | No | Yes |
| Env secrets | Yes | No |
| Bundle size impact | None | Yes |`,
    tryItChallenge: "Create a product list page where the product data is fetched in a Server Component, but each product has a 'Like' button that's a separate Client Component with useState.",
  },
  {
    order: 6,
    title: "Data Fetching in Next.js",
    summary: "Learn all the ways to fetch data in Next.js: async Server Components, fetch with caching, revalidation, and parallel data fetching patterns.",
    content: `## Data Fetching in the App Router

The App Router shifts the data fetching paradigm from client-side \`useEffect\` hooks to server-side \`async\` components. Next.js extends the native Web \`fetch()\` API with powerful caching and revalidation superpowers.

> **Definition: Data Fetching Waterfall**  
> An anti-pattern where a component must finish fetching its data before a child component can begin fetching its own data. Server Components largely mitigate this, as database queries occur right next to the database without round-trip latency to the browser.

---

## 1. Async Server Components (Preferred)

The most robust way to fetch data is directly inside a Server Component.

\`\`\`jsx
// src/app/posts/page.jsx
async function getPosts() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts')
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}

export default async function PostsPage() {
  // Execution pauses here on the server until data is ready.
  // The client only ever receives the fully rendered HTML.
  const posts = await getPosts()
  
  return (
    <ul>
      {posts.slice(0, 10).map(post => (
        <li key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.body}</p>
        </li>
      ))}
    </ul>
  )
}
\`\`\`

---

## 2. Caching with the Extended \`fetch()\`

Next.js aggressively caches data. By default in Next.js 14, if you use \`fetch\`, the result is cached indefinitely unless you tell it otherwise.

\`\`\`jsx
// 1. Cached forever (SSG behavior) — great for blog posts
const res = await fetch('https://api.example.com/data')

// 2. Revalidate periodically (ISR behavior) — updates every 60 seconds
const res = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 }
})

// 3. Never cache (SSR behavior) — fetches fresh on every single request
const res = await fetch('https://api.example.com/data', {
  cache: 'no-store'
})
\`\`\`

> **Interview Highlight**  
> **Q: What is Incremental Static Regeneration (ISR)?**  
> A: ISR allows you to update static pages in the background without needing to rebuild the entire site. By setting a \`revalidate\` time (e.g., 60 seconds), the page serves from the edge cache instantly. If a user requests the page after 60 seconds, they receive the stale cached page, but Next.js silently builds a fresh page in the background to serve to the *next* user.

---

## 3. Route Segment Config

If you are using a database client (like Prisma or Mongoose) instead of \`fetch()\`, you can't use the \`fetch\` cache options. Instead, you use Route Segment configs at the top of your \`page.jsx\`.

\`\`\`jsx
// src/app/dashboard/page.jsx

// Force this page to always be dynamic (acts like getServerSideProps)
export const dynamic = 'force-dynamic'

// Or set an ISR revalidation time for the entire route
export const revalidate = 3600 // 1 hour

export default async function DashboardPage() {
  const data = await db.users.findMany() // Not using fetch
  // ...
}
\`\`\`

---

## 4. Parallel Data Fetching

To prevent waterfalls, fetch independent data in parallel using \`Promise.all\`.

\`\`\`jsx
// ❌ SLOW: Sequential (Total time = A + B + C)
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()

// ✅ FAST: Parallel (Total time = longest of A, B, or C)
const userPromise = fetchUser()
const postsPromise = fetchPosts()
const commentsPromise = fetchComments()

const [user, posts, comments] = await Promise.all([
  userPromise, postsPromise, commentsPromise
])
\`\`\`

---

## 5. UI States: Loading & Error

Next.js automatically maps specific files to React Suspense and Error Boundaries.

### \`loading.jsx\`
Place this next to a \`page.jsx\`. While your async Server Component is waiting for data, Next.js instantly serves this file.

\`\`\`jsx
// src/app/posts/loading.jsx
export default function Loading() {
  return <div className="skeleton-loader h-40 w-full animate-pulse bg-gray-200" />
}
\`\`\`

### \`error.jsx\`
If an error is thrown in your component or data fetch, Next.js catches it here. **It must be a Client Component.**

\`\`\`jsx
// src/app/posts/error.jsx
'use client'

export default function Error({ error, reset }) {
  return (
    <div className="error-box">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
\`\`\`

---

## 6. Client-Side Fetching

Sometimes you must fetch data on the client (e.g., search results based on user typing). You can use \`useEffect\` or highly recommended libraries like **SWR** or **React Query**.

\`\`\`jsx
'use client'
import useSWR from 'swr'

const fetcher = url => fetch(url).then(r => r.json())

export default function SearchResults({ query }) {
  const { data, error, isLoading } = useSWR(\`/api/search?q=\${query}\`, fetcher)
  
  if (isLoading) return <p>Searching...</p>
  if (error) return <p>Search failed</p>
  
  return (
    <ul>
      {data.map(item => <li key={item.id}>{item.title}</li>)}
    </ul>
  )
}
\`\`\`

## Summary Table

| Strategy | Syntax | When to use |
|---|---|---|
| **Static / SSG** | \`fetch(url)\` | Content that rarely changes (blogs, docs). Cached forever. |
| **ISR** | \`fetch(url, { next: { revalidate: 60 } })\` | Content that changes occasionally. Periodic cache updates. |
| **Dynamic / SSR** | \`fetch(url, { cache: 'no-store' })\` | Real-time data (dashboards, carts). Never cached. |
| **Client-Side** | \`useEffect\` or \`useSWR\` | Data dependent on browser state (search inputs). |`,
    tryItChallenge: "Build a page that fetches posts from https://jsonplaceholder.typicode.com/posts with a loading.jsx skeleton and an error.jsx boundary.",
  },
  {
    order: 7,
    title: "API Routes with Route Handlers",
    summary: "Build backend API endpoints directly inside your Next.js app using Route Handlers (route.js files), handling GET, POST, PUT, DELETE with the Web Request/Response API.",
    content: `## What are Route Handlers?

Route Handlers allow you to create custom backend API endpoints natively inside the Next.js App Router using the standard Web Request and Response APIs. They completely eliminate the need to spin up a separate Express.js or NestJS backend for many applications.

> **Definition: Route Handler (\`route.js\`)**  
> A special file in the App Router that exports async HTTP method functions (GET, POST, PUT, DELETE). It handles incoming API requests and returns HTTP responses.

---

## Basic Folder Structure

Route Handlers must be named \`route.js\` or \`route.ts\`. They can sit anywhere in the \`app\` directory, as long as they don't conflict with a \`page.jsx\` at the exact same route segment.

\`\`\`
src/app/
└── api/
    ├── users/
    │   └── route.js         → GET/POST /api/users
    └── users/[id]/
            └── route.js     → GET/PUT/DELETE /api/users/:id
\`\`\`

---

## The Request and Response Objects

Next.js uses the native Web \`Request\` and \`Response\` interfaces, extended via \`NextRequest\` and \`NextResponse\`. 

> **Interview Highlight**  
> **Q: Why does Next.js use Web Request/Response instead of Node.js \`req/res\` streams like Express?**  
> A: Next.js is designed to run seamlessly on the **Edge Runtime** (like Cloudflare Workers or Vercel Edge). The native Web APIs are the standard across all modern JS runtimes, whereas Node.js streams are specific to Node. 

### GET Handler (Reading URL Params)

\`\`\`js
// src/app/api/posts/route.js
import { NextResponse } from 'next/server'

// GET /api/posts?page=1&limit=10
export async function GET(request) {
  // Extract search parameters natively from the URL
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') || '1'
  
  // Connect to database
  const posts = await db.posts.findMany({ skip: (page - 1) * 10, take: 10 })
  
  return NextResponse.json({ success: true, data: posts }, { status: 200 })
}
\`\`\`

---

## Handling Mutations (POST, PUT, DELETE)

### POST Handler (Reading JSON body)

\`\`\`js
// src/app/api/users/route.js
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // Await the JSON parsing of the request body
    const body = await request.json()
    
    if (!body.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    const newUser = await db.users.create({ data: body })
    
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
\`\`\`

---

## Dynamic Route Handlers

Just like pages, Route Handlers can access dynamic segments via the \`params\` argument.

\`\`\`js
// src/app/api/users/[id]/route.js
import { NextResponse } from 'next/server'

export async function DELETE(request, { params }) {
  const userId = params.id
  
  await db.users.delete({ where: { id: userId } })
  
  return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 })
}
\`\`\`

---

## Advanced: Reading Headers and Setting Cookies

### Headers
Next.js provides a helper \`headers()\` function to read request headers cleanly.

\`\`\`js
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const headersList = headers()
  const authorization = headersList.get('Authorization')
  
  if (!authorization) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  return NextResponse.json({ message: 'Authorized!' })
}
\`\`\`

### Cookies
You can use the \`cookies()\` helper to read, or the \`NextResponse.cookies\` object to set.

\`\`\`js
import { NextResponse } from 'next/server'

export async function POST(request) {
  const response = NextResponse.json({ success: true })
  
  // Set a secure, HTTP-only cookie
  response.cookies.set('session_token', 'abc123xyz', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  
  return response
}
\`\`\`

## Summary Reference

| HTTP Method | Export name | Typical Restful Use Case |
|---|---|---|
| **GET** | \`export async function GET\` | Read/Fetch data |
| **POST** | \`export async function POST\` | Create new data |
| **PUT** | \`export async function PUT\` | Completely replace a data record |
| **PATCH** | \`export async function PATCH\` | Partially update a data record |
| **DELETE** | \`export async function DELETE\` | Delete a data record |`,
    tryItChallenge: "Build a /api/todos route handler with in-memory state that supports: GET (list all todos), POST (create new), DELETE by ID (via /api/todos/[id]).",
  },
  {
    order: 8,
    title: "Static Generation, SSR, and ISR",
    summary: "Deep-dive into Next.js rendering strategies: Static Generation, Server-Side Rendering, Incremental Static Regeneration, and generateStaticParams for dynamic static routes.",
    content: `## Understanding Rendering Strategies

Next.js is famous for giving you the power to choose *when* and *where* your HTML is generated. Choosing the right rendering strategy dictates the performance, SEO, and data freshness of your application.

> **Definition: Rendering**  
> The process of transforming React components (JSX) into HTML that the browser can understand and paint to the screen.

---

## 1. Static Site Generation (SSG)

SSG renders the HTML for your page exactly **once, at build time** (when you run \`npm run build\`). This HTML is then pushed to a CDN (Content Delivery Network).

When a user visits the site, the edge node instantly serves the pre-built HTML. It is the absolute fastest rendering strategy possible.

\`\`\`jsx
// src/app/about/page.jsx
// No dynamic functions or uncached fetch calls are present.
// Next.js automatically treats this as SSG.
export default function AboutPage() {
  return <h1>About Us</h1>
}
\`\`\`

**Best for:** Marketing pages, documentation, blog posts, portfolios.

---

## 2. Server-Side Rendering (SSR) — Dynamic Rendering

SSR renders the HTML for your page **on every single user request**. 

When a user requests the page, the Next.js Node server wakes up, fetches the freshest data from the database, builds the HTML, and sends it down.

\`\`\`jsx
// src/app/dashboard/page.jsx

// This explicitly forces Next.js to run SSR on every request
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const data = await fetch('https://api.example.com/live-data', { cache: 'no-store' }).then(r => r.json())
  
  return <div>Live Stock Price: {data.price}</div>
}
\`\`\`

> **Interview Highlight**  
> **Q: What implicitly opts a page into Server-Side Rendering (Dynamic Rendering)?**  
> A: If your Server Component uses a dynamic function like \`cookies()\`, \`headers()\`, or the \`searchParams\` prop, Next.js knows the page *must* be generated on demand at request time, because it's impossible to know a user's cookies at build time.

**Best for:** Dashboards, shopping carts, authenticated pages, personalized feeds.

---

## 3. Incremental Static Regeneration (ISR)

ISR is a hybrid magic trick. It allows you to build a static page (like SSG) but tells Next.js to automatically **rebuild it in the background** after a specific time interval.

This gives you the blinding speed of SSG with the data freshness of SSR.

\`\`\`jsx
// src/app/blog/[slug]/page.jsx

// Regenerate this page at most every 60 seconds
export const revalidate = 60 

export default async function BlogPost({ params }) {
  const post = await db.posts.findBySlug(params.slug)
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  )
}
\`\`\`

**Best for:** E-commerce product pages, news articles, leaderboards.

---

## 4. On-Demand Revalidation

Sometimes waiting 60 seconds for an ISR rebuild is too long. If a CMS editor updates a blog post, they want it live immediately. You can trigger an instant background rebuild via an API Route.

\`\`\`js
// src/app/api/revalidate/route.js
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const { path } = await request.json()
  
  // Instantly invalidates the cache and regenerates the page
  revalidatePath(path)
  
  return NextResponse.json({ revalidated: true })
}
\`\`\`

---

## 5. generateStaticParams — Pre-building Dynamic Routes

If you have a dynamic route like \`/blog/[slug]\`, how does Next.js know which slugs to build at build time? You must tell it using \`generateStaticParams\`.

\`\`\`jsx
// src/app/blog/[slug]/page.jsx

// 1. Tell Next.js which URLs to generate at build time
export async function generateStaticParams() {
  const posts = await db.posts.findMany() // fetches 100 posts
  
  // Returns an array of params: [{ slug: 'post-1' }, { slug: 'post-2' }]
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

// 2. The page component (executed 100 times during the build process)
export default async function BlogPost({ params }) {
  const post = await db.posts.findBySlug(params.slug)
  return <h1>{post.title}</h1>
}
\`\`\`

> **Definition: \`generateStaticParams\`**  
> An async function exported from a dynamic route that returns a list of parameters to statically generate routes at build time instead of on-demand at request time.

---

## Decision Tree: Which Strategy?

\`\`\`text
Does the content change?
├── No → Static Generation (SSG)
└── Yes
    ├── How often?
    │   ├── Very rarely → ISR with long revalidate (e.g., 24 hours)
    │   ├── Frequently  → ISR with short revalidate (e.g., 60 seconds)
    │   └── Every request → SSR / Dynamic (no-store)
    └── Is it user-specific (requires auth)?
        └── Yes → Always SSR (force-dynamic)
\`\`\`

## Comparison Table

| Strategy | When rendered | Data Freshness | Performance (TTFB) |
|---|---|---|---|
| **SSG** | Build time | Stale | 🔥 Extremely Fast (CDN) |
| **ISR** | Build + Background | Briefly Stale | 🔥 Extremely Fast (CDN) |
| **SSR** | Every request | Always Fresh | 🐢 Slower (Server execution) |`,
    tryItChallenge: "Create a blog route that pre-renders 5 posts with generateStaticParams using https://jsonplaceholder.typicode.com/posts. Set revalidate to 60 seconds.",
  },
  {
    order: 9,
    title: "Next.js Image Optimization",
    summary: "Use the powerful next/image component for automatic image optimization, lazy loading, responsive images, and preventing layout shift.",
    content: `## The Core Problem with Regular HTML \`<img>\` Tags

Images account for over 50% of the bytes downloaded on a typical website. Using a standard HTML \`<img>\` tag causes massive performance issues:
- **No Lazy Loading:** Browsers load off-screen images immediately, wasting bandwidth.
- **Over-fetching:** Serving a massive 4K desktop image to a tiny mobile screen.
- **Layout Shift:** Before an image loads, it takes up 0px. When it suddenly loads, it pushes all text down, violating Core Web Vitals (Cumulative Layout Shift).
- **Outdated Formats:** Serving bulky PNG/JPEG instead of next-generation formats like WebP or AVIF.

> **Definition: Cumulative Layout Shift (CLS)**  
> A Google Core Web Vitals metric that measures how much elements move around the screen while the page is loading. A high CLS ruins user experience and hurts SEO. Next.js eliminates this automatically.

---

## The Next.js \`<Image>\` Solution

The \`next/image\` component solves all these problems automatically out of the box.

\`\`\`jsx
import Image from 'next/image'
import localPic from '@/public/hero-banner.jpg' // Importing local file

export default function HeroSection() {
  return (
    // Width and height are detected automatically from the local file!
    <Image
      src={localPic}
      alt="A beautiful landscape"
      priority // Optional: preloads the image if it's above the fold
    />
  )
}
\`\`\`

What Next.js does for you behind the scenes:
- Automatically converts the image to **WebP** or **AVIF** (drastically reducing file size).
- Injects a blurred placeholder (if configured) while the image loads.
- Strictly enforces \`width\` and \`height\` constraints to ensure exactly **zero layout shift**.
- Automatically delays loading (lazy loading) until the image is near the viewport viewport.

---

## Handling Remote Images

If your images come from an external URL (like an S3 bucket or Unsplash), Next.js cannot auto-detect the dimensions, nor does it trust the source by default to prevent malicious bandwidth exhaustion.

**Step 1: Configure allowed domains in \`next.config.mjs\`**

\`\`\`js
// next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com', // Wildcards supported
      },
    ],
  },
}
export default nextConfig
\`\`\`

**Step 2: Explicitly provide \`width\` and \`height\`**

\`\`\`jsx
import Image from 'next/image'

export default function Avatar({ user }) {
  return (
    <Image
      src={user.avatarUrl} // External URL
      alt={user.name}
      width={64}  // REQUIRED for remote images
      height={64} // REQUIRED for remote images
    />
  )
}
\`\`\`

> **Interview Highlight**  
> **Q: Why does the Next.js Image component require \`width\` and \`height\` for remote images?**  
> A: To prevent Cumulative Layout Shift (CLS). By providing exact pixel dimensions, Next.js can render a placeholder box of the exact correct size on the server before the image even begins downloading.

---

## Fill Mode: When you don't know the exact size

Sometimes you want an image to completely fill a fluid container (like a full-width background hero section). Instead of providing \`width\` and \`height\`, you use the \`fill\` prop.

\`\`\`jsx
<div style={{ position: 'relative', width: '100%', height: '400px' }}>
  <Image
    src="/background.jpg"
    alt="Hero Background"
    fill
    style={{ objectFit: 'cover' }} // Acts like background-size: cover
  />
</div>
\`\`\`

**CRITICAL RULE:** When using \`fill\`, the immediate parent element MUST have \`position: relative\`, \`absolute\`, or \`fixed\` applied via CSS.

---

## Priority Loading (LCP Optimization)

Search engines judge your site heavily on **Largest Contentful Paint (LCP)** — the time it takes to render the largest visible element above the fold. 

By default, Next.js lazy-loads every image. If the user's viewport opens on a giant hero image, lazy loading it actually *hurts* performance.

\`\`\`jsx
<Image
  src="/hero.jpg"
  alt="Hero"
  fill
  priority // Disables lazy loading, injects a preload link in the <head>
/>
\`\`\`

Always add the \`priority\` prop to any image that is immediately visible to the user without scrolling.

---

## Summary of Critical Props

| Prop | Required? | Purpose |
|---|---|---|
| \`src\` | Yes | Image source (local import or URL string). |
| \`alt\` | Yes | Accessibility description for screen readers and SEO. |
| \`width\`/\`height\` | Yes (unless \`fill\`) | Intrinsic dimensions to prevent layout shift. |
| \`fill\` | No | Tells the image to absolutely position itself to its parent container. |
| \`priority\` | No | Preloads the image for immediate rendering. Crucial for LCP elements. |
| \`sizes\` | No | Defines responsive breakpoints so the browser requests the right size file. |`,
    tryItChallenge: "Replace all img tags in your project with next/image, add priority to the hero image, and configure remote image domains in next.config.mjs.",
  },
  {
    order: 10,
    title: "Metadata and SEO in Next.js",
    summary: "Configure static and dynamic metadata (title, description, Open Graph, Twitter cards, favicon, sitemap) in Next.js for maximum SEO impact.",
    content: `## Why Metadata Matters

Metadata (Title, Description, Open Graph tags) is the first thing users and search engines see. It dictates how your page looks in Google search results and when shared on Twitter or iMessage.

Next.js provides a built-in Metadata API that makes handling dynamic SEO incredibly simple. It automatically deduplicates meta tags and generates the correct <head> HTML.

> **Definition: Open Graph (OG) Tags**  
> A protocol originally created by Facebook that allows web pages to become rich objects in a social graph. When you share a link on Slack and a beautiful card appears with an image and description, that is powered by Open Graph tags.

---

## Static Metadata

For static pages like an \`About\` or \`Contact\` page, export a \`metadata\` object directly from your \`page.jsx\` or \`layout.jsx\`.

\`\`\`jsx
// src/app/about/page.jsx
export const metadata = {
  title: 'About Us',
  description: 'Learn about our mission and our team of expert developers.',
  openGraph: {
    title: 'About Us',
    description: 'Learn about our mission.',
    url: 'https://myapp.com/about',
    siteName: 'My App',
    images: [
      {
        url: 'https://myapp.com/og/about-banner.jpg',
        width: 1200,
        height: 630,
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us',
  },
}

export default function AboutPage() {
  return <h1>About Us</h1>
}
\`\`\`

---

## Dynamic Metadata

For dynamic routes (like blog posts or product pages), the metadata depends on data fetched from the database. Next.js provides the \`generateMetadata\` async function.

\`\`\`jsx
// src/app/blog/[slug]/page.jsx

export async function generateMetadata({ params }) {
  // Fetch data
  const post = await db.posts.findBySlug(params.slug)
  
  if (!post) return { title: 'Post Not Found' }
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImageUrl }],
    },
  }
}

export default async function BlogPost({ params }) {
  // The fetch here will be automatically deduplicated if it matches 
  // the fetch inside generateMetadata! Next.js caches it instantly.
  const post = await db.posts.findBySlug(params.slug)
  
  return <h1>{post.title}</h1>
}
\`\`\`

> **Interview Highlight**  
> **Q: If I fetch a blog post in \`generateMetadata\`, and then fetch it again inside the page component, won't I hit the database twice and ruin performance?**  
> A: No. Next.js uses **Request Memoization**. The native \`fetch\` API is automatically patched so that if you make the exact same GET request twice during the same server render pass, the second call returns instantly from an in-memory cache without hitting the database.

---

## Metadata Inheritance and Templates

Metadata cascades down from parent Layouts to child Pages. You can define a title template in your root layout so you don't have to repeat your site name everywhere.

\`\`\`jsx
// src/app/layout.jsx
export const metadata = {
  title: {
    template: '%s | My Startup',
    default: 'My Startup - The Best SaaS Platform',
  },
  description: 'Building the future of the web.',
}
\`\`\`

\`\`\`jsx
// src/app/pricing/page.jsx
export const metadata = {
  title: 'Pricing', // Output in browser: "Pricing | My Startup"
}
\`\`\`

---

## File-Based Metadata (Icons and Sitemaps)

Instead of writing code for favicons and OG images, you can simply drop specific files into your App Router directories, and Next.js will automatically inject the correct meta tags!

\`\`\`text
src/app/
// src/app/sitemap.js
export default function sitemap() {
  return [
    {
      url: 'https://myapp.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://myapp.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
\`\`\`

---

## Viewport Configuration

\`\`\`jsx
// src/app/layout.jsx
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
}
\`\`\``,
    tryItChallenge: "Add complete metadata (title template, OG tags, Twitter cards) to your Next.js app's root layout, and dynamic metadata to a blog post page using generateMetadata.",
  },
  {
    order: 11,
    title: "Authentication with NextAuth.js",
    summary: "Implement authentication with Auth.js v5 (NextAuth) — setup, credentials provider, Google OAuth, protected routes, and session management.",
    content: `## The Next.js Authentication Landscape

Authentication in Next.js is complex because your app spans both the Server (Node.js Edge) and the Client (Browser). 

Common authentication solutions for Next.js:
1. **Auth.js (formerly NextAuth.js)** — The industry standard. Open source, handles OAuth (Google/GitHub), JWTs, database sessions, and credentials.
2. **Clerk** — A massive SaaS solution providing complete drop-in UI components (\`<SignIn />\`, \`<UserProfile />\`).
3. **Supabase Auth** — Excellent if you are using Supabase as your backend.

This chapter focuses on the industry standard: **Auth.js (NextAuth v5)**.

> **Definition: JSON Web Token (JWT)**  
> A compact, URL-safe means of representing claims to be transferred between two parties. NextAuth heavily relies on JWTs stored in HTTP-only cookies to securely identify users across server and client components without constantly hitting the database.

---

## 1. Setup and Installation

\`\`\`bash
npm install next-auth@beta
\`\`\`

You must generate an \`AUTH_SECRET\` (a random 32-character string used to encrypt JWTs) and place it in your \`.env\` file.
\`\`\`bash
npx auth secret
\`\`\`

---

## 2. Core Configuration (\`auth.js\`)

You define your providers (how users log in) and callbacks at the root of your project.

\`\`\`js
// src/auth.js
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Find user in database
        const user = await db.users.findUnique({ email: credentials.email })
        
        // Verify hashed password (e.g. using bcrypt)
        if (!user || !verifyPassword(credentials.password, user.passwordHash)) {
          return null // Return null to reject sign in
        }
        
        // Any object returned here is encoded into the JWT
        return { id: user.id, name: user.name, role: user.role }
      },
    }),
  ],
  // Inject custom data from the authorize object into the JWT and Session
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role
      return session
    },
  },
})
\`\`\`

---

## 3. The Catch-All Route Handler

NextAuth requires a special Catch-All Route to handle the various OAuth redirects, callbacks, and login endpoints automatically.

\`\`\`js
// src/app/api/auth/[...nextauth]/route.js
import { handlers } from '@/auth'

// This automatically handles GET /api/auth/signin, POST /api/auth/callback/github, etc.
export const { GET, POST } = handlers
\`\`\`

---

## 4. Reading the Session (Server vs Client)

> **Interview Highlight**  
> **Q: How do you read a user's session in a Server Component vs a Client Component?**  
> A: In a Server Component, you call the asynchronous \`auth()\` function, which decrypts the HTTP-only cookie directly on the server without a network request. In a Client Component, you use the \`useSession()\` hook, which relies on a React Context Provider wrapper (\`SessionProvider\`) and occasionally makes a network call to \`/api/auth/session\` to sync state.

### In a Server Component (Preferred)

\`\`\`jsx
// src/app/dashboard/page.jsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/api/auth/signin') // Protect the route
  }
  
  return <h1>Welcome to your dashboard, {session.user.name}</h1>
}
\`\`\`

### In a Client Component

\`\`\`jsx
'use client'
import { useSession } from 'next-auth/react'

export default function UserWidget() {
  // \`status\` can be "loading", "authenticated", or "unauthenticated"
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <Spinner />
  if (status === 'unauthenticated') return <p>Please log in</p>
  
  return <p>Logged in as: {session.user.email}</p>
}
\`\`\``,
    tryItChallenge: "Add credentials-based authentication to your app. Create a login page that redirects to /dashboard on success, and protect /dashboard with middleware.",
  },
  {
    order: 12,
    title: "Middleware in Next.js",
    summary: "Use middleware.js to run code before every request — implementing auth guards, redirects, rewriting URLs for A/B testing, adding security headers, and rate limiting.",
    content: `## What is Next.js Middleware?

Middleware in Next.js is a powerful piece of code that executes **before a request is completed** and before any page or API route begins rendering. 

It acts as a global interceptor.

> **Definition: Middleware**  
> A function that sits between a client's request and the server's final response, allowing you to intercept, modify, or reject the request entirely.

**Common use cases for Middleware:**
- **Authentication Guards:** Redirecting unauthenticated users away from \`/dashboard\` before the page even begins generating.
- **A/B Testing / URL Rewrites:** Showing users different versions of a page based on a cookie, without changing the URL in their browser.
- **Localization:** Detecting the \`Accept-Language\` header and redirecting a user to \`/fr/docs\` or \`/en/docs\`.
- **Security Headers & Rate Limiting:** Adding global \`X-Frame-Options\` to prevent clickjacking.

---

## Creating Middleware

You create exactly one \`middleware.js\` or \`middleware.ts\` file. It must sit at the root of your \`src\` directory (on the same level as the \`app\` directory, **not inside it**).

\`\`\`js
// src/middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  // Extract path
  const path = request.nextUrl.pathname
  console.log('Incoming request to:', path)
  
  // Continue to the requested route
  return NextResponse.next()
}
\`\`\`

---

## The \`config.matcher\` Array

By default, Middleware runs on *every single request*—including requests for images, CSS files, and Next.js internals. This causes massive performance degradation. 

You must export a \`config\` object to tell Next.js exactly which routes should trigger the middleware.

\`\`\`js
// src/middleware.js
export function middleware(request) {
  // This will now only execute on dashboard and profile routes
}

export const config = {
  // Use Regex-like matchers. :path* catches nested routes (e.g. /dashboard/settings)
  matcher: ['/dashboard/:path*', '/profile/:path*'],
}
\`\`\`

---

## Common Pattern: Authentication Guard

Using middleware to protect routes prevents unauthorized users from ever hitting your Server Components, saving you from writing repetitive \`if (!session) redirect()\` logic in every file.

\`\`\`js
// src/middleware.js
import { NextResponse } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/settings']

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  // Check for session cookie
  const hasSessionCookie = request.cookies.has('session_token')
  
  const isTryingToAccessProtectedRoute = PROTECTED_ROUTES.some((route) => 
    pathname.startsWith(route)
  )
  
  if (isTryingToAccessProtectedRoute && !hasSessionCookie) {
    // Construct the absolute URL to redirect to
    const loginUrl = new URL('/login', request.url)
    
    // Save where they were trying to go so you can redirect back later
    loginUrl.searchParams.set('callbackUrl', pathname)
    
    // Force a 307 redirect
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], // Match all except static assets
}
\`\`\`

---

## URL Rewrites (Invisible Redirection)

A \`Redirect\` changes the URL in the user's browser. A \`Rewrite\` acts as an invisible proxy—it fetches data from a different URL but keeps the user's browser URL the same. This is perfect for A/B testing.

\`\`\`js
export function middleware(request) {
  // Read a cookie to determine which A/B bucket the user is in
  const bucket = request.cookies.get('ab-test-bucket')?.value
  
  if (bucket === 'variant-b' && request.nextUrl.pathname === '/pricing') {
    // The user still sees "myapp.com/pricing" in the browser URL, 
    // but the server actually renders the code for "myapp.com/pricing-variant-b"
    return NextResponse.rewrite(new URL('/pricing-variant-b', request.url))
  }
  
  return NextResponse.next()
}
\`\`\`

---

## Crucial Edge Runtime Limitations

> **Interview Highlight**  
> **Q: Can I use \`mongoose\` or \`pg\` inside my Next.js middleware to check if a user exists in the database?**  
> A: No. Next.js Middleware executes strictly on the **Edge Runtime** (Vercel Edge, Cloudflare Workers), *not* on Node.js. 
> 
> The Edge Runtime is extremely lightweight to achieve sub-millisecond boot times globally. Therefore, it lacks full Node.js APIs like \`fs\`, \`crypto\`, and native Node modules. Database drivers like Mongoose require full Node.js support. If you need database access in middleware, you must \`fetch\` an external API endpoint instead.`,
    tryItChallenge: "Create middleware that: 1) Protects /dashboard from unauthenticated users (check a token cookie), 2) Adds a custom X-Powered-By header to all responses.",
  },
  {
    order: 13,
    title: "Server Actions — Forms Without API Routes",
    summary: "Use Server Actions to mutate data directly from components — form submissions, button clicks that hit the server without writing API routes.",
    content: `## The Problem with API Routes

In a traditional React app, if you want to submit a form to create a new Todo, you have to:
1. Create a state variable for the input.
2. Write an \`onSubmit\` handler.
3. Call \`fetch('/api/todos', { method: 'POST', body: ... })\`.
4. Create an API Route handler at \`/api/todos/route.js\`.
5. Connect to the DB in that API route.
6. Return a JSON response.
7. Manage loading and error states on the client.

This is a massive amount of boilerplate just to insert one row into a database.

## Enter Server Actions

Server Actions are asynchronous functions that run **exclusively on the server** but can be called directly from your Client or Server Components. They eliminate the need to write manual API routes for mutations.

> **Definition: Server Action**  
> An async function marked with the \`'use server'\` directive that can be passed as an action to a \`<form>\` or called directly from an event handler (like \`onClick\`). Under the hood, Next.js automatically creates a hidden \`POST\` endpoint for you.

---

## 1. Basic Server Action (Inside a Server Component)

\`\`\`jsx
// src/app/todos/page.jsx
import { revalidatePath } from 'next/cache'

// This function ONLY runs on the server!
async function createTodo(formData) {
  'use server' // <-- The magic directive
  
  const title = formData.get('title')
  
  await db.todos.create({ title })
  
  // Instantly purge the cache for the /todos page so the new item shows up
  revalidatePath('/todos')
}

export default async function TodoPage() {
  const todos = await db.todos.findMany()
  
  return (
    <div>
      {/* We pass the server function directly to the form's action prop! */}
      <form action={createTodo}>
        <input type="text" name="title" placeholder="New todo..." required />
        <button type="submit">Add Todo</button>
      </form>
      
      <ul>
        {todos.map(todo => <li key={todo.id}>{todo.title}</li>)}
      </ul>
    </div>
  )
}
\`\`\`

---

## 2. Server Actions in Separate Files (For Client Components)

If you want to use a Server Action inside a Client Component (e.g. attached to an \`onClick\` handler), you **must** extract the action into a separate file that has \`'use server'\` at the very top.

\`\`\`js
// src/actions/todoActions.js
'use server'

import { revalidatePath } from 'next/cache'

export async function deleteTodo(id) {
  await db.todos.delete({ where: { id } })
  revalidatePath('/todos')
}
\`\`\`

Now, import and use it in your Client Component:

\`\`\`jsx
// src/components/DeleteButton.jsx
'use client'
import { deleteTodo } from '@/actions/todoActions'
import { useTransition } from 'react'

export default function DeleteButton({ id }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button 
      onClick={() => startTransition(() => deleteTodo(id))}
      disabled={isPending}
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  )
}
\`\`\`

---

## 3. Pending States with \`useFormStatus\`

React provides a special hook called \`useFormStatus\` to detect if the parent \`<form>\` is currently submitting a Server Action.

**CRITICAL RULE:** This hook must be used in a child component *inside* the \`<form>\`. It will not work if placed in the same component that renders the \`<form>\`.

\`\`\`jsx
'use client'
import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button disabled={pending} type="submit" className="bg-blue-500 text-white">
      {pending ? 'Saving to Database...' : 'Save Todo'}
    </button>
  )
}
\`\`\`

\`\`\`jsx
// Inside your page.jsx
<form action={createTodo}>
  <input name="title" />
  <SubmitButton /> {/* Works perfectly! */}
</form>
\`\`\`

---

## 4. Error Handling with \`useActionState\`

If your Server Action fails (e.g., validation error), you need a way to send that error back to the client form. \`useActionState\` is the standard React hook for this.

\`\`\`js
// src/actions/authActions.js
'use server'

export async function registerUser(prevState, formData) {
  const email = formData.get('email')
  
  if (!email.includes('@')) {
    return { error: 'Invalid email address' } // Return the error state
  }
  
  await db.users.create({ email })
  return { success: true }
}
\`\`\`

\`\`\`jsx
// src/components/RegisterForm.jsx
'use client'
import { useActionState } from 'react'
import { registerUser } from '@/actions/authActions'

const initialState = { error: null, success: false }

export default function RegisterForm() {
  // state will update automatically when the action returns a value
  const [state, formAction, isPending] = useActionState(registerUser, initialState)
  
  return (
    <form action={formAction}>
      {state.error && <p className="text-red-500">{state.error}</p>}
      {state.success && <p className="text-green-500">Registered!</p>}
      
      <input type="email" name="email" required />
      <button disabled={isPending}>Submit</button>
    </form>
  )
}
\`\`\`

> **Interview Highlight**  
> **Q: Are Server Actions secure? Can't a malicious user just call them with fake data?**  
> A: Server Actions are exactly like API endpoints. Just because they look like local function calls in your code doesn't mean they are secure by default. You **must** validate the user's session and authorize the action (e.g., checking if the user owns the post they are trying to delete) inside the Server Action itself, just like you would in a traditional REST API.`,
    tryItChallenge: "Build a full todo app with Server Actions: create (form with useFormStatus), delete (button), and toggle done. All mutations should use Server Actions.",
  },
  {
    order: 14,
    title: "Environment Variables and next.config.mjs",
    summary: "Manage environment variables in Next.js — server-only secrets, public variables, .env files, and configuring Next.js via next.config.mjs.",
    content: `## The Strict Environment Variable Boundary

Security is paramount in a full-stack framework like Next.js. You will have API keys for Stripe, database URLs, and AWS access keys. **If these leak to the browser, your entire system is compromised.**

Next.js enforce a strict naming convention to prevent accidental leaks.

> **Definition: \`NEXT_PUBLIC_\` Prefix**  
> Any environment variable prefixed with \`NEXT_PUBLIC_\` will be embedded into the JavaScript bundle sent to the browser. Any variable *without* this prefix is stripped out and only accessible on the Node.js server.

---

## .env File Hierarchy

Next.js automatically loads environment variables from \`.env\` files in a specific order of priority:

\`\`\`text
1. .env                  ← Loaded in all environments (defaults)
2. .env.development      ← Loaded ONLY when running \`npm run dev\`
3. .env.production       ← Loaded ONLY when running \`npm run build / start\`
4. .env.local            ← Loaded locally, OVERRIDES all others. NEVER commit this.
\`\`\`

**CRITICAL RULE:** You must add \`.env.local\` to your \`.gitignore\` file. This is where your actual secret keys go on your local machine. 

---

## Example Usage

\`\`\`env
# .env.local
DATABASE_URL=mongodb://localhost:27017/mydb
STRIPE_SECRET_KEY=sk_test_12345

# Safe for browser
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_12345
NEXT_PUBLIC_API_URL=https://api.myapp.com
\`\`\`

### Server Component (Can access everything)

\`\`\`jsx
// src/app/page.jsx (Server Component)
export default async function Page() {
  // ✅ Works perfectly on the server
  console.log(process.env.DATABASE_URL) 
  
  // ✅ Works perfectly
  console.log(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) 
}
\`\`\`

### Client Component (Strict access)

\`\`\`jsx
'use client'
export default function Checkout() {
  // ❌ UNDEFINED! Next.js strips this out for security.
  console.log(process.env.STRIPE_SECRET_KEY) 
  
  // ✅ Works perfectly, it is embedded in the JS bundle
  console.log(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) 
}
\`\`\`

---

## Configuring Next.js with \`next.config.mjs\`

The \`next.config.mjs\` file at the root of your project allows you to configure webpack, redirects, proxies, and experimental features.

### 1. External Image Domains
As discussed in the Images chapter, you must whitelist external domains to prevent bandwidth hijacking.

\`\`\`js
// next.config.mjs
export default {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}
\`\`\`

### 2. URL Redirects (Permanent & Temporary)
Redirect old broken links to new pages to preserve SEO juice.

\`\`\`js
// next.config.mjs
export default {
  async redirects() {
    return [
      {
        source: '/old-blog/:slug',
        destination: '/new-blog/:slug',
        permanent: true, // Sends HTTP 308
      },
    ]
  },
}
\`\`\`

### 3. URL Rewrites (Proxying APIs)
If you have a separate backend (e.g. a Python API at \`api.mybackend.com\`), you can proxy requests through Next.js to bypass CORS issues on the client.

\`\`\`js
// next.config.mjs
export default {
  async rewrites() {
    return [
      {
        source: '/api/python/:path*',
        destination: 'https://api.mybackend.com/:path*',
      },
    ]
  },
}
\`\`\`

> **Interview Highlight**  
> **Q: What is the difference between a Redirect and a Rewrite in \`next.config.mjs\`?**  
> A: A **Redirect** changes the URL in the user's browser (e.g., from \`/about-us\` to \`/about\`) and issues a 307 or 308 HTTP status. A **Rewrite** acts as an invisible proxy. The URL in the user's browser stays exactly the same, but the server fetches the content from the destination URL and serves it.`,
    tryItChallenge: "Refactor your app to use .env.local for all secrets and NEXT_PUBLIC_ for client-accessible values. Add validation to ensure required env vars are present at startup.",
  },
  {
    order: 15,
    title: "Deploying Next.js to Production",
    summary: "Deploy your Next.js app to Vercel, understand build output, Docker deployment, production optimizations, and the production readiness checklist.",
    content: `## Hosting Platforms

Next.js is a full-stack framework requiring a Node.js server to run Server Components, SSR, and API Routes.

| Platform | Difficulty | Pros | Cons |
|---|---|---|---|
| **Vercel** | ⭐ Extremely Easy | Zero-config, Edge network, Built by Next.js creators. | Can get expensive at massive scale. |
| **Railway / Render** | ⭐⭐ Easy | Cheaper scaling, great for full-stack with attached databases. | No Edge network by default. |
| **AWS / GCP / Docker** | ⭐⭐⭐⭐ Hard | Maximum control, cheapest at scale. | You manage CI/CD, SSL, and load balancing manually. |

---

## Deploying to Vercel (The Happy Path)

Vercel provides the smoothest deployment experience. It automatically detects your Next.js project and sets up the CI/CD pipeline.

**Steps to Deploy:**
1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Log in to [Vercel.com](https://vercel.com).
3. Click **Add New Project** and import your repository.
4. Add your **Environment Variables** (e.g., \`DATABASE_URL\`, \`AUTH_SECRET\`) in the Vercel dashboard.
5. Click **Deploy**. 

Every time you push to the \`main\` branch, Vercel will automatically build and deploy your application. Pushes to other branches create instant "Preview Deployments" you can share with your team.

---

## Building Locally for Production

Before pushing to production, you should ALWAYS build the project locally to catch compilation errors.

\`\`\`bash
npm run build
\`\`\`

When the build finishes, Next.js outputs an incredibly important table. **You must learn how to read it.**

\`\`\`text
Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB   87.3 kB
├ ℇ /dashboard                           2.1 kB   84.3 kB
├ ● /blog/[slug]                         3.8 kB   86.0 kB
└ ℇ /api/users                           0 B      0 B

○  (Static)   prerendered as static HTML (SSG)
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ℇ  (Dynamic)  server-rendered on demand (SSR)
\`\`\`

> **Interview Highlight**  
> **Q: What does the \`○ (Static)\` vs \`ℇ (Dynamic)\` symbol mean in the Next.js build output?**  
> A: \`○ (Static)\` means the page was fully rendered at build time into an HTML file (SSG) and can be served instantly from a CDN. \`ℇ (Dynamic)\` means the page uses dynamic functions (like reading cookies or URL parameters) and must be Server-Side Rendered (SSR) on every single request.

---

## Deploying via Docker (Self-Hosting)

If you need to deploy Next.js to your own servers (e.g. AWS EC2, DigitalOcean), you should use Docker and enable **Standalone Output**.

Normally, Next.js relies on your massive \`node_modules\` folder to run. Standalone mode traces your code and copies *only the exact files and dependencies needed* into a minimal folder, drastically reducing Docker image sizes.

**Step 1:** Enable standalone mode in \`next.config.mjs\`
\`\`\`js
// next.config.mjs
export default {
  output: 'standalone',
}
\`\`\`

**Step 2:** Use a multi-stage Dockerfile to build and run the app. (Next.js provides an official, highly optimized Dockerfile template on their GitHub repository).

---

## Production Readiness Checklist

Before launching your app to real users, verify the following:

- [ ] **Are Secrets Safe?** Ensure \`NEXT_PUBLIC_\` is NOT used on database strings or API secrets.
- [ ] **Are Images Optimized?** Ensure you are using \`next/image\` instead of \`<img>\` for large assets.
- [ ] **Is LCP Optimized?** Add the \`priority\` prop to the main hero image on your landing page.
- [ ] **Are Links Prefetching?** Ensure you are using the \`<Link>\` component instead of \`<a>\` tags so Next.js can prefetch pages in the background.
- [ ] **Are Layout Shifts Fixed?** Ensure all fonts and images have fallback dimensions to prevent layout shifting.
- [ ] **Is Metadata Complete?** Ensure \`title\`, \`description\`, and \`openGraph\` tags are set in your root \`layout.jsx\`.`,
    tryItChallenge: "Run `npm run build` locally on your project and analyze the terminal output. Identify which of your pages are Static (○) and which are Dynamic (ℇ).",
  },
  {
    order: 16,
    title: "React Suspense and Streaming Architecture",
    summary: "Master Streaming Server-Side Rendering (SSR) with React Suspense and loading.jsx to dramatically improve perceived performance and Time To First Byte (TTFB).",
    content: `## The Problem with Traditional SSR

In traditional Server-Side Rendering (like Next.js Pages router or old Express apps), rendering is blocking. The server must:
1. Fetch ALL data for a page.
2. Render ALL HTML for the page.
3. Send ALL HTML to the client.

If a page has a fast header, but a very slow database query for a data table, the user sees a blank white screen until the slow table query finishes.

## Enter Streaming and Suspense

The Next.js App Router integrates deeply with React Suspense to enable **Streaming HTML**.

Instead of waiting for all data, the server instantly streams the fast parts (the Header, the Sidebar) to the browser, and streams a placeholder (a skeleton loader) for the slow parts. When the slow database query finally finishes, the server streams the remaining HTML into the existing page.

> **Definition: Streaming SSR**  
> Breaking down the HTML response into chunks and progressively sending them to the browser as soon as they are ready, rather than waiting for the entire page to finish rendering on the server.

---

## Using \`loading.jsx\` (Automatic Suspense)

Next.js makes streaming incredibly easy. Simply create a \`loading.jsx\` file next to your \`page.jsx\`.

Next.js will automatically wrap your \`page.jsx\` in a \`<Suspense>\` boundary using your \`loading.jsx\` as the fallback.

\`\`\`jsx
// src/app/dashboard/loading.jsx
export default function DashboardLoading() {
  // This renders INSTANTLY while the page fetches data
  return <div className="animate-pulse bg-gray-200 h-64 w-full rounded-md" />
}
\`\`\`

\`\`\`jsx
// src/app/dashboard/page.jsx
export default async function DashboardPage() {
  // Simulating a slow database query (3 seconds)
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  return <h1>Dashboard Data Loaded!</h1>
}
\`\`\`

Because of \`loading.jsx\`, the user sees the sidebar, navigation, and the skeleton loader instantly. Three seconds later, the skeleton loader is swapped out for the actual data.

---

## Granular Suspense (Manual Streaming)

\`loading.jsx\` applies to the entire route. But what if your page has multiple independent slow components? You can manually wrap them in \`<Suspense>\` to stream them individually!

\`\`\`jsx
// src/app/analytics/page.jsx
import { Suspense } from 'react'
import RevenueChart from './RevenueChart'
import UserTable from './UserTable'
import Skeleton from '@/components/Skeleton'

export default function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics Dashboard</h1>
      
      {/* The Revenue chart might take 2 seconds */}
      <Suspense fallback={<Skeleton height={400} />}>
        <RevenueChart />
      </Suspense>
      
      {/* The User table might take 5 seconds */}
      <Suspense fallback={<Skeleton height={600} />}>
        <UserTable />
      </Suspense>
    </div>
  )
}
\`\`\`

In the example above, the page shell loads instantly. The \`RevenueChart\` pops in after 2 seconds, and the \`UserTable\` pops in after 5 seconds. **No waterfall, and no blocked rendering.**

> **Interview Highlight**  
> **Q: Explain how React Suspense improves Time To First Byte (TTFB).**  
> A: Without Suspense, the server holds the connection open and sends 0 bytes until the slowest data query finishes. With Suspense, the server immediately flushes the HTML for the static parts of the layout to the browser (drastically lowering TTFB), while suspending the slow components. It then streams the resolved HTML for the suspended components over the same connection when they finish.`,
    tryItChallenge: "Create a page with two slow Server Components (using `await new Promise(r => setTimeout(r, 2000))`). Wrap them in `<Suspense>` boundaries with different fallback UI and watch them pop in independently.",
  },
  {
    order: 17,
    title: "In-Depth Caching in Next.js (The 4 Caches)",
    summary: "Demystify Next.js aggressive caching mechanisms. Learn how Request Memoization, the Data Cache, the Full Route Cache, and the Router Cache work together.",
    content: `## The Next.js Caching Architecture

Next.js 14+ is famously aggressive with caching. By default, it tries to cache as much as possible to improve performance and lower database costs.

To truly master Next.js, you must understand its **4 Caching Mechanisms**.

---

## 1. Request Memoization (Server-Side)

If you call \`fetch()\` with the exact same URL and options multiple times during the render of a single page, Next.js only executes the network request once.

\`\`\`jsx
// src/app/layout.jsx
async function Layout() {
  const user = await fetch('https://api.myapp.com/me').then(r => r.json())
  return <nav>{user.name}</nav>
}

// src/app/page.jsx
async function Page() {
  // This does NOT hit the network again! It returns instantly from memory.
  const user = await fetch('https://api.myapp.com/me').then(r => r.json())
  return <h1>Welcome, {user.name}</h1>
}
\`\`\`

**Lifespan:** Lasts only for the duration of a single server request.
**Purpose:** Prevents prop-drilling. You can safely fetch data wherever you need it.

---

## 2. Data Cache (Server-Side)

This caches the actual JSON data returned from external APIs across multiple user requests and deployments.

\`\`\`jsx
// Cached persistently across all users
const res = await fetch('https://api.example.com/data') 

// Cached for 60 seconds (ISR)
const res = await fetch('https://api.example.com/data', { next: { revalidate: 60 } })

// Bypasses the Data Cache entirely
const res = await fetch('https://api.example.com/data', { cache: 'no-store' })
\`\`\`

**Lifespan:** Persistent across deployments until manually revalidated or cache-busted.
**Purpose:** Speeds up external API calls and reduces load on third-party services.

---

## 3. Full Route Cache (Server-Side)

This caches the fully rendered HTML and React Server Component (RSC) payload for a specific route. This is what makes Static Site Generation (SSG) work.

If your route has no dynamic functions (like \`cookies()\`) and no uncached fetches, Next.js builds the HTML at compile time and stores it in the Full Route Cache.

**Lifespan:** Persistent until you rebuild the app or manually trigger a revalidation (e.g., via \`revalidatePath\`).
**Purpose:** Serves pages instantly from the edge CDN.

---

## 4. Router Cache (Client-Side)

This is the only cache that lives in the user's browser. When a user navigates around your app using the \`<Link>\` component, Next.js caches the visited routes in the browser's memory.

If they click "Back" or revisit a page they just saw, it loads instantly from the client's memory without hitting the server.

\`\`\`jsx
import Link from 'next/link'

// Next.js prefetches this route in the background and stores it in the Router Cache
<Link href="/about">About Us</Link>
\`\`\`

**Lifespan:** Lasts for the duration of the user's session (until they hard refresh the browser window).
**Purpose:** Makes client-side navigation feel instantaneous (SPA-like).

---

> **Interview Highlight**  
> **Q: A user complains that after updating their profile, the dashboard still shows their old name, even though the database updated. Which caches could be responsible, and how do you fix it?**  
> A: This is likely an issue with the **Full Route Cache** or **Data Cache**. To fix it, you should call \`revalidatePath('/dashboard')\` inside the Server Action that updates the profile. This instantly purges the stale cache on the server, forcing Next.js to fetch the fresh data and rebuild the route.`,
    tryItChallenge: "Build a Server Action that updates a database record, and specifically use `revalidatePath` to purge the Full Route Cache so the UI updates instantly.",
  }
];

// ─── MAIN SEEDER ─────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Starting Next.js Course Seeder...\n");

  const token = await login();

  console.log("🧹 Cleaning up existing Next.js courses...");
  await deleteExistingCourses(token);

  console.log("📚 Creating Next.js course...");
  const course = await createCourse(token, {
    title: "Next.js Complete Course: Zero to Production",
    subtitle:
      "Master Next.js 14+ with the App Router — covering file-based routing, Server Components, data fetching, API routes, authentication, middleware, Server Actions, SEO, and deploying to production.",
    techId: "nextjs",
    level: "Beginner - Advanced",
    duration: "Self-paced",
    order: 2,
    status: "published",
    learningOutcomes: [
      "Build full-stack apps with Next.js App Router and React Server Components",
      "Implement file-based routing with nested layouts, dynamic routes, and route groups",
      "Fetch and cache data efficiently with Server Components and the extended fetch API",
      "Create REST API endpoints using Route Handlers without a separate backend",
      "Implement authentication with NextAuth.js including OAuth and credentials providers",
      "Use Server Actions to mutate data directly without writing API route boilerplate",
      "Optimize images, fonts, and SEO metadata for production-grade performance",
      "Deploy your app to Vercel and configure CI/CD with GitHub Actions",
      "Protect routes with Next.js Middleware running on the Edge Runtime",
      "Apply Static Generation, SSR, and ISR strategies for the right rendering approach",
    ],
  });

  const courseId = course._id || course.id;
  console.log(`✅ Course created! ID: ${courseId}\n`);

  console.log(`📖 Creating ${chapters.length} chapters...\n`);

  for (const chapter of chapters) {
    process.stdout.write(`  Chapter ${chapter.order}: ${chapter.title}... `);
    const result = await createChapter(token, courseId, {
      title: chapter.title,
      summary: chapter.summary,
      content: [chapter.content],
      tryItChallenge: chapter.tryItChallenge,
      order: chapter.order,
      status: "published",
      language: "javascript",
    });

    if (result) {
      console.log("✅");
    } else {
      console.log("❌ FAILED");
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log(`\n🎉 Next.js course seeded successfully with ${chapters.length} chapters!`);
  console.log(`📊 Course: "Next.js Complete Course: Zero to Production"`);
  console.log(`🔗 Course ID: ${courseId}`);
  console.log(`\n✅ Login to admin panel at http://localhost:3001 to manage the course.`);
}

main().catch((err) => {
  console.error("❌ Seeder failed:", err.message);
  process.exit(1);
});
