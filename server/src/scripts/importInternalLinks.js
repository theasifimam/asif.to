import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import InternalLinkRule from "../models/InternalLinkRule.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const rules = [
  { keyword: "React Hooks", aliases: ["React hook", "React's hooks"], url: "/courses/reactjs", priority: 10, maxPerPage: 1, enabled: true },
  { keyword: "React.js", aliases: ["Reactjs", "React", "react", "reactjs", "react.js", "jsx", "JSX"], url: "/courses/reactjs", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "Next.js App Router", aliases: ["App Router"], url: "/courses/nextjs", priority: 10, maxPerPage: 1, enabled: true },
  { keyword: "Next.js", aliases: ["Nextjs"], url: "/courses/nextjs", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "Node.js", aliases: ["Nodejs", "Node"], url: "/courses/nodejs", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "Express.js", aliases: ["Express", "Expressjs", "Express.js"], url: "/courses/expressjs", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "MongoDB", aliases: ["Mongo"], url: "/courses/mongodb", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "Tailwind CSS", aliases: ["Tailwind", "TailwindCSS"], url: "/courses/tailwindcss", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "JavaScript", aliases: ["JS"], url: "/courses/javascript", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "HTML", aliases: ["html", "html5", "HTML5"], url: "/courses/html", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "CSS", aliases: ["css", "css3", "CSS3"], url: "/courses/css", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "Redux Toolkit", aliases: ["Redux", "Reduxjs", "redux", "reduxjs", "redux-toolkit"], url: "/reactjs/chapter-22-redux-toolkit", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "Hooks", aliases: ["hooks", "useMemo", "useCallback", "useRef", "useReducer"], url: "/courses/reactjs/chapter-11-advanced-hooks-useref-usereducer-usememo-usecallback", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "useState", aliases: ["usestate", "UseState"], url: "/reactjs/chapter-4-state-usestate-hook", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "useEffect", aliases: ["useeffect", "UseEffect", "side effect"], url: "/reactjs/chapter-7-useeffect-hook", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "React Router", aliases: ["React Router DOM", "react-router-dom", "react-router"], url: "/courses/reactjs", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "React Server Components", aliases: ["Server Components", "RSC"], url: "/courses/nextjs", priority: 8, maxPerPage: 2, enabled: true },
  { keyword: "Mongoose", aliases: ["mongoose"], url: "/courses/mongodb", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "REST API", aliases: ["REST APIs", "RESTful API", "REST"], url: "/courses/expressjs", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "Flexbox", aliases: ["flexbox", "CSS Flexbox"], url: "/courses/css", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "CSS Grid", aliases: ["css grid", "Grid", "CSS Grid Layout"], url: "/courses/css", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "TypeScript", aliases: ["TS", "Typescript", "typescript"], url: "/courses/typescript", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "function", aliases: ["functions"], url: "/javascript/functions-in-javascript", priority: 5, maxPerPage: 2, enabled: true },
  { keyword: "asynchronous", aliases: ["async", "await", "asynchronous javascript"], url: "/javascript/promises-asynchronous-javascript", priority: 5, maxPerPage: 2, enabled: true },
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");
    
    let inserted = 0;
    for (const rule of rules) {
      const exists = await InternalLinkRule.findOne({ keyword: rule.keyword });
      if (!exists) {
        await InternalLinkRule.create(rule);
        inserted++;
      }
    }
    console.log(`Inserted ${inserted} internal link rules.`);
    process.exit(0);
  } catch (error) {
    console.error("Error importing links:", error);
    process.exit(1);
  }
}

run();
