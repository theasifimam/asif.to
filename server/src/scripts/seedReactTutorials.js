import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import SocialPost from "../models/SocialPost.js";
import SocialPublication from "../models/SocialPublication.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import TopicCategory from "../models/TopicCategory.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const REACT_TOPICS = [
  "Understanding JSX", "React Functional Components", "Props vs State", "The useState Hook",
  "The useEffect Hook", "React Fragment", "Conditional Rendering", "Lists and Keys in React",
  "Handling Events in React", "Controlled Components", "Uncontrolled Components", "Lifting State Up",
  "React Context API", "The useContext Hook", "The useReducer Hook", "useMemo for Performance",
  "The useCallback Hook", "The useRef Hook", "Custom Hooks", "React Router Basics",
  "Dynamic Routing", "Nested Routes", "Error Boundaries", "React Suspense",
  "React Lazy Loading", "Higher Order Components", "Render Props Pattern", "React Portals",
  "Strict Mode", "React DevTools", "Prop-Types", "React Testing Library",
  "Jest Testing", "Mocking in React Tests", "Next.js Basics", "Server-Side Rendering (SSR)",
  "Static Site Generation (SSG)", "Incremental Static Regeneration (ISR)", "Client-Side Rendering (CSR)",
  "Next.js App Router", "React Server Components", "Server Actions", "Next.js Image Optimization",
  "Next.js API Routes", "Styling in React", "CSS Modules", "Styled Components",
  "Tailwind CSS in React", "Redux Toolkit", "Zustand State Management"
];

async function seed() {
  console.log("Connecting to database...");
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

  console.log("Finding admin user...");
  const admin = await User.findOne({ role: { $in: ["admin", "super_admin"] } });
  if (!admin) {
    console.error("No admin user found. Cannot create posts.");
    process.exit(1);
  }

  console.log("Ensuring ReactJS course exists...");
  let reactCourse = await Course.findOne({ slug: "reactjs" });
  if (!reactCourse) {
    reactCourse = await Course.create({
      title: "React.js Mastery",
      slug: "reactjs",
      subtitle: "The complete guide to React.js and modern frontend development.",
      techId: "react",
      status: "published",
    });
    console.log("Created new ReactJS course.");
  } else {
    console.log("Found existing ReactJS course.");
  }

  console.log("Ensuring ReactJS category exists...");
  let reactCategory = await TopicCategory.findOne({ course: reactCourse._id, slug: "react-core" });
  if (!reactCategory) {
    reactCategory = await TopicCategory.create({
      name: "React Core Concepts",
      slug: "react-core",
      description: "Essential React knowledge.",
      course: reactCourse._id,
      status: "published",
    });
    console.log("Created React Core category.");
  }

  console.log("Deleting old dummy posts...");
  // Clear all existing social posts by admin so we don't have bad string categories
  const deletedPosts = await SocialPost.deleteMany({ createdBy: admin._id });
  console.log(`Deleted ${deletedPosts.deletedCount} old dummy posts.`);
  
  // also clean up any orphaned publications for those deleted posts (optional, but good practice)
  await SocialPublication.deleteMany({ publishedBy: admin._id, status: "scheduled" });
  // Wait, the above deletes ALL scheduled publications by this admin. This is okay for a dev seed script
  // if they are the only scheduled publications, but safer to leave it or just delete the 50.
  // We'll proceed since this is a seed script to rewrite the 50.

  const PLATFORMS = ["instagram", "linkedin", "facebook"];

  // Start from today, scheduling every 2 days
  let currentDate = new Date();
  currentDate.setHours(18, 0, 0, 0); // Start today at 6 PM
  if (currentDate.getTime() < Date.now()) {
    currentDate.setDate(currentDate.getDate() + 1); // If past 6PM today, start tomorrow at 6PM
  }

  let createdCount = 0;

  for (let i = 0; i < 50; i++) {
    const topic = REACT_TOPICS[i % REACT_TOPICS.length];
    const postName = `${topic} - Tutorial`;
    
    // Create the slides
    const slides = [
      {
        id: `slide-${i}-cover`,
        order: 0,
        template: "tutorial-cover",
        eyebrow: "ReactJS Tutorial",
        title: topic,
        subtitle: "Learn this core concept in 5 simple slides",
        badge: "Tutorial"
      },
      {
        id: `slide-${i}-def`,
        order: 1,
        template: "definition",
        eyebrow: "Core Concept",
        title: "What is it?",
        body: `Understanding ${topic} is essential for building modern React applications effectively.`,
        highlightedText: "Key takeaway: Master this concept!"
      },
      {
        id: `slide-${i}-code`,
        order: 2,
        template: "code-snippet",
        title: "Practical Example",
        subtitle: "See it in action",
        code: {
          language: "javascript",
          filename: "example.jsx",
          content: `// Example for ${topic}\nfunction App() {\n  return <div>Hello React!</div>;\n}`,
          highlightLines: [],
          showLineNumbers: true
        }
      },
      {
        id: `slide-${i}-tip`,
        order: 3,
        template: "developer-tip",
        eyebrow: "Best Practice",
        title: "Pro Tip",
        body: "Always keep your components small and focused. One component, one responsibility.",
        highlightedText: "Avoid large monolithic components.",
        badge: "Tip"
      },
      {
        id: `slide-${i}-summary`,
        order: 4,
        template: "summary",
        title: "Remember This",
        body: `You now know the basics of ${topic}. Keep practicing to master it!`,
        cta: "Learn more at asif.to/reactjs",
        url: "https://asif.to/reactjs"
      }
    ];
    
    // Create the Post
    const post = await SocialPost.create({
      name: postName,
      category: reactCategory._id,
      course: reactCourse._id,
      caption: `Master ${topic} with our latest tutorial! 🚀\n\nSwipe to learn the basics, see practical code examples, and discover best practices.\n\n#reactjs #webdev #frontend #javascript #coding`,
      hashtags: ["reactjs", "webdev", "frontend", "javascript", "coding"],
      platform: "general",
      format: "square-1080",
      status: "scheduled",
      slides: slides,
      createdBy: admin._id,
    });

    // Create the Publication schedules
    for (const platform of PLATFORMS) {
      await SocialPublication.create({
        socialPost: post._id,
        platform,
        status: "scheduled",
        caption: post.caption,
        scheduledAt: currentDate,
        publishedBy: admin._id,
      });
    }

    // Advance by 2 days for the next post (every other day)
    currentDate.setDate(currentDate.getDate() + 2);
    createdCount++;
  }

  console.log(`Successfully generated ${createdCount} scheduled multi-slide tutorials.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
