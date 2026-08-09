/**
 * Next.js Interactive Materials Seeder
 * Seeds Next.js Cheatsheet, Quiz Questions, and Flashcards
 * Run: node seed-nextjs-interactive.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import Course from "./src/models/Course.js";
import Cheatsheet from "./src/models/Cheatsheet.js";
import QuizQuestion from "./src/models/QuizQuestion.js";
import Flashcard from "./src/models/Flashcard.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://0.0.0.0:27017/asif";

async function main() {
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Find the Next.js course to link materials to
  const course = await Course.findOne({ techId: "nextjs" });
  if (!course) {
    console.error("❌ Next.js Course not found! Please run seed-nextjs-course.js first.");
    process.exit(1);
  }
  const courseId = course._id;
  console.log(`📚 Found Next.js Course ID: ${courseId}`);

  // 1. Seed Next.js Cheatsheet
  console.log("\n📄 Seeding Next.js Cheatsheet...");
  await Cheatsheet.deleteMany({ techId: "nextjs" });
  const cheatsheet = await Cheatsheet.create({
    techId: "nextjs",
    slug: "nextjs-app-router",
    title: "Next.js App Router Cheat Sheet",
    status: "published",
    order: 0,
    snippets: [
      {
        name: "Special Route Files",
        language: "javascript",
        code: `// Special page-related file names in Next.js App Router
page.jsx       // Target UI route (e.g. /dashboard)
layout.jsx     // Wraps sibling and nested pages; preserves state
template.jsx   // Same as layout but creates a new instance on nav
loading.jsx    // Suspense loading UI; rendered automatically
error.jsx      // Error boundary wrapper (must be 'use client')
not-found.jsx  // 404 Page fallback UI
route.js       // Backend API endpoint handler`,
      },
      {
        name: "Data Fetching Caching Options",
        language: "javascript",
        code: `// 1. Static fetch (cached forever by default)
const res = await fetch('https://api.example.com/data')

// 2. Dynamic fetch (skip cache, render on demand)
const res = await fetch('https://api.example.com/data', { cache: 'no-store' })

// 3. Revalidated fetch (ISR: caches for specified seconds)
const res = await fetch('https://api.example.com/data', {
  next: { revalidate: 3600 } // revalidate hourly
})`,
      },
      {
        name: "Server Action Definition",
        language: "javascript",
        code: `// app/actions.js
'use server' // Marks all exports in this file as Server Actions

import { revalidatePath } from 'next/cache'

export async function createTodo(formData) {
  const text = formData.get('text')
  
  // Directly insert into database
  await db.todo.create({ data: { text } })
  
  // Purge the cache on the page to reflect new item
  revalidatePath('/todos')
}`,
      },
      {
        name: "API Route Handlers",
        language: "javascript",
        code: `// app/api/items/route.js
import { NextResponse } from 'next/server'

// Handles GET /api/items
export async function GET(request) {
  const data = await db.items.findMany()
  return NextResponse.json({ success: true, data })
}

// Handles POST /api/items
export async function POST(request) {
  const body = await request.json()
  const item = await db.items.create({ data: body })
  return NextResponse.json({ success: true, item }, { status: 201 })
}`,
      },
      {
        name: "Metadata & SEO",
        language: "javascript",
        code: `// App Router Metadata (page.jsx or layout.jsx)
export const metadata = {
  title: 'My Custom Page Title',
  description: 'SEO optimized description',
  openGraph: {
    title: 'Open Graph Title',
    description: 'Social preview description',
    images: [{ url: '/og-image.jpg' }],
  },
}

// For Dynamic Routes (e.g. /blog/[id]/page.jsx)
export async function generateMetadata({ params }) {
  const post = await getPost(params.id)
  return {
    title: \`\${post.title} | Blog\`,
    description: post.summary
  }
}`,
      },
    ],
  });
  console.log(`✅ Upserted Next.js Cheatsheet! Slug: ${cheatsheet.slug}`);

  // 2. Seed Next.js Quiz Questions
  console.log("\n❓ Seeding Next.js Quiz Questions...");
  await QuizQuestion.deleteMany({ techId: "nextjs" });

  const quizzes = [
    {
      techId: "nextjs",
      course: courseId,
      question: "Which file is used to define an API endpoint in the Next.js App Router?",
      options: ["api.js", "handler.js", "route.js", "endpoint.js"],
      correctIndex: 2,
      explanation: "In the Next.js App Router, Route Handlers are defined using route.js or route.ts files inside the app directory.",
      difficulty: "easy",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      question: "What is the default rendering behavior of components in the App Router?",
      options: ["Client Components", "Server Components", "Static Site Generation", "Incremental Static Regeneration"],
      correctIndex: 1,
      explanation: "By default, all components inside the app directory of Next.js are React Server Components (RSC) unless marked with the 'use client' directive.",
      difficulty: "easy",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      question: "How can you mark a component to execute and render on the client side?",
      options: [
        "By using the directive 'use client' at the top of the file",
        "By using the useEffect hook",
        "By naming the file component.client.js",
        "By passing client=true as a prop",
      ],
      correctIndex: 0,
      explanation: "To define a Client Component, add the string directive 'use client' at the very top of the file, before any imports.",
      difficulty: "easy",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      question: "Which component should be used in Next.js for automatically optimized images?",
      options: ["<img>", "<NextImage>", "<Image> from 'next/image'", "<OptimizedImage>"],
      correctIndex: 2,
      explanation: "The <Image> component from 'next/image' handles lazy loading, responsive scaling, WebP conversion, and prevents Cumulative Layout Shift automatically.",
      difficulty: "easy",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      question: "How do you achieve Incremental Static Regeneration (ISR) at the fetch level in the App Router?",
      options: [
        "Using getStaticProps with revalidate",
        "Passing next: { revalidate: seconds } to fetch options",
        "Setting export const revalidate = seconds at the top of the page",
        "Both B and C",
      ],
      correctIndex: 3,
      explanation: "You can achieve ISR by passing { next: { revalidate: SECONDS } } to the individual fetch call, or by exporting revalidate = SECONDS configuration from the page/layout file.",
      difficulty: "medium",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      question: "Which function is used to pre-render dynamic routes (like [id]) statically at build time in the App Router?",
      options: ["getStaticPaths", "generateStaticParams", "getStaticProps", "generateMetadata"],
      correctIndex: 1,
      explanation: "In the App Router, generateStaticParams replaces getStaticPaths to statically generate dynamic routes at build time.",
      difficulty: "medium",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      question: "Where must Next.js Middleware be placed in the project structure?",
      options: [
        "src/app/middleware.js",
        "src/middleware.js (or project root folder)",
        "src/app/api/middleware.js",
        "In a special config/ folder",
      ],
      correctIndex: 1,
      explanation: "Middleware must be defined in middleware.js or middleware.ts located at the root of the src directory (or the project root folder if not using src).",
      difficulty: "medium",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      question: "Which directive must be placed at the top of a file or function to declare a Server Action?",
      options: ["'use server'", "'server action'", "'run server'", "'use server action'"],
      correctIndex: 0,
      explanation: "Server Actions are declared using the 'use server' directive at the top of the file or at the beginning of an async function.",
      difficulty: "easy",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      question: "How do you prevent a page from caching and force it to render dynamically on each request in the App Router?",
      options: [
        "Using export const dynamic = 'force-dynamic'",
        "Using fetch with { cache: 'no-store' }",
        "Calling cookies() or headers() inside the component",
        "All of the above",
      ],
      correctIndex: 3,
      explanation: "All of these choices turn a route into dynamic rendering: exporting dynamic = 'force-dynamic', using a no-store fetch cache, or consuming dynamic functions like cookies() or headers().",
      difficulty: "hard",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      question: "What runtime does Next.js Middleware execute on?",
      options: ["Node.js Runtime", "Edge Runtime", "V8 Engine directly in the browser", "Service Worker Runtime"],
      correctIndex: 1,
      explanation: "Next.js Middleware runs on Vercel's lightweight Edge Runtime, which supports a subset of Web APIs and is optimized for low latency.",
      difficulty: "hard",
      status: "published",
    },
  ];

  await QuizQuestion.create(quizzes);
  console.log(`✅ Seeded ${quizzes.length} Next.js Quiz Questions!`);

  // 3. Seed Next.js Flashcards
  console.log("\n🎴 Seeding Next.js Flashcards...");
  await Flashcard.deleteMany({ techId: "nextjs" });

  const flashcards = [
    {
      techId: "nextjs",
      course: courseId,
      front: "How is a route directory excluded from the URL path?",
      back: "Wrap the directory name in parentheses, e.g., (marketing). This is called a Route Group.",
      tag: "Routing",
      difficulty: "easy",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      front: "What is the difference between Catch-All [...slug] and Optional Catch-All [[...slug]] routes?",
      back: "Catch-All requires at least one parameter in the URL (e.g., /docs/a), whereas Optional Catch-All also matches the base URL without parameters (e.g., /docs).",
      tag: "Routing",
      difficulty: "medium",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      front: "What are React Server Components (RSC)?",
      back: "A paradigm where React components render on the server, allowing direct backend data access and reducing client-side bundle size since their JavaScript is never sent to the browser.",
      tag: "Rendering",
      difficulty: "easy",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      front: "When must you use a Client Component ('use client')?",
      back: "When using React state (useState), life-cycle effects (useEffect), context consumers (useContext), browser APIs (e.g., window), or attaching interactive event handlers (e.g., onClick).",
      tag: "Rendering",
      difficulty: "easy",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      front: "How do you set the page title and description dynamically in the App Router?",
      back: "Export an async function named generateMetadata from your page.js or layout.js file that returns the metadata object.",
      tag: "SEO",
      difficulty: "medium",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      front: "How do you implement parallel data fetching in Next.js?",
      back: "Start all fetch promises without awaiting them immediately, then await them concurrently using Promise.all([fetch1, fetch2]).",
      tag: "Data Fetching",
      difficulty: "medium",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      front: "What is the Cumulative Layout Shift (CLS) prevention feature in next/image?",
      back: "Next.js requires dynamic/static width and height dimensions (or the fill property) to pre-allocate correct spacing on the page before the image renders, preventing elements from shifting.",
      tag: "Image Optimization",
      difficulty: "medium",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      front: "When is the priority prop recommended on the <Image> component?",
      back: "On the Largest Contentful Paint (LCP) images that appear above-the-fold immediately during initial page loading.",
      tag: "Image Optimization",
      difficulty: "easy",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      front: "How do you display a pending state while a Server Action form is submitting?",
      back: "Use the useFormStatus hook inside a child component nested within the <form>.",
      tag: "Server Actions",
      difficulty: "easy",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      front: "What is the difference between revalidatePath and revalidateTag?",
      back: "revalidatePath clears the cache for a specific URL path, while revalidateTag clears the cache globally for any fetch requests that were tagged with that specific string tag.",
      tag: "Server Actions",
      difficulty: "medium",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      front: "How do you expose an environment variable to the browser/client side?",
      back: "Prefix the environment variable with NEXT_PUBLIC_, e.g., NEXT_PUBLIC_API_URL.",
      tag: "Configuration",
      difficulty: "easy",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      front: "What functions/components are used for programmatic redirecting on the server vs client?",
      back: "On the server (Server Components/Actions), use redirect('/path') from next/navigation. On the client, use router.push('/path') from useRouter().",
      tag: "Routing",
      difficulty: "easy",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      front: "Name three common use cases for Next.js Middleware.",
      back: "Authentication checks, URL redirecting/rewriting (e.g., A/B testing, localization), and adding security/request headers.",
      tag: "Middleware",
      difficulty: "medium",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      front: "Where should static assets (images, robots.txt, sitemaps) be placed to be served from the root URL?",
      back: "In the public directory at the root of the project (e.g., public/favicon.ico).",
      tag: "SEO",
      difficulty: "easy",
      status: "published",
    },
    {
      techId: "nextjs",
      course: courseId,
      front: "What Next.js configuration is used to build a standalone Docker container?",
      back: "Setting output: 'standalone' in the next.config.mjs configuration file.",
      tag: "Deployment",
      difficulty: "hard",
      status: "published",
    },
  ];

  await Flashcard.create(flashcards);
  console.log(`✅ Seeded ${flashcards.length} Next.js Flashcards!`);

  console.log("\n🎉 Next.js Course Interactive Elements Seeded Successfully!");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeder failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
