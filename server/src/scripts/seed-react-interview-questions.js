import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Course from "../models/Course.js";
import InterviewQuestion from "../models/Question.js";
import User from "../models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const QUESTIONS = [
  {
    slug: "what-is-react-and-why-use-it",
    question: "What is React, and what problem does it solve?",
    answer: "React is a JavaScript library for building user interfaces from reusable components. It helps teams manage complex, stateful interfaces by describing the UI as a function of state and efficiently updating only the parts of the DOM that change.",
    difficulty: "easy",
    questionType: "conceptual",
    tags: ["fundamentals", "components", "virtual-dom"],
    followUps: ["What is the difference between React and a framework?", "What is reconciliation?"],
  },
  {
    slug: "jsx-versus-html",
    question: "How does JSX differ from HTML?",
    answer: "JSX is JavaScript syntax that looks like HTML and is compiled into React element calls. It uses camelCase DOM properties such as className and onClick, accepts JavaScript expressions inside braces, and requires components to return a single parent element or fragment.",
    difficulty: "easy",
    questionType: "conceptual",
    tags: ["jsx", "fundamentals"],
  },
  {
    slug: "props-versus-state",
    question: "What is the difference between props and state in React?",
    answer: "Props are read-only inputs passed from a parent to a component. State is data owned and updated by a component; changing it schedules a re-render. A child should communicate requested state changes upward through callback props rather than mutating props.",
    difficulty: "easy",
    questionType: "conceptual",
    tags: ["props", "state", "components"],
  },
  {
    slug: "why-keys-are-needed-in-lists",
    question: "Why are keys needed when rendering lists, and why is an array index often a poor key?",
    answer: "Keys give React a stable identity for each sibling so it can preserve the correct component and DOM state during insertions, removals, and reordering. An index changes when the list changes, which can cause state and input values to move to the wrong item. Use a stable ID from the data whenever possible.",
    difficulty: "medium",
    questionType: "conceptual",
    tags: ["lists", "keys", "reconciliation"],
  },
  {
    slug: "when-to-use-effect",
    question: "When should you use useEffect, and what should not be placed in it?",
    answer: "Use useEffect to synchronize React with an external system, such as a network subscription, browser API, timer, or third-party widget. Do not use it for values that can be calculated during rendering, event-driven actions, or copying props into state without a real synchronization need.",
    difficulty: "medium",
    questionType: "scenario",
    tags: ["hooks", "useeffect", "side-effects"],
    followUps: ["How do dependencies affect when an effect runs?", "How do you clean up an effect?"],
  },
  {
    slug: "stale-state-update-fix",
    question: "How do you safely update state when the next value depends on the previous value?",
    answer: "Pass an updater function to the setter, for example setCount(current => current + 1). React queues updates, so reading a captured state value can be stale when several updates happen in the same event or asynchronous flow.",
    difficulty: "medium",
    questionType: "coding",
    tags: ["state", "usestate", "closures"],
    codeExample: "setCount((currentCount) => currentCount + 1);",
  },
  {
    slug: "controlled-versus-uncontrolled-components",
    question: "What is a controlled component, and when might you prefer an uncontrolled input?",
    answer: "A controlled input receives its value from React state and reports changes through an event handler, making validation and UI synchronization straightforward. An uncontrolled input stores its value in the DOM and is commonly accessed with a ref; it can be useful for simple forms, file inputs, or integration with non-React code.",
    difficulty: "medium",
    questionType: "conceptual",
    tags: ["forms", "state", "refs"],
  },
  {
    slug: "usememo-usecallback-reactmemo",
    question: "How do useMemo, useCallback, and React.memo differ?",
    answer: "useMemo caches a computed value between renders, useCallback caches a function reference, and React.memo skips rendering a component when its props are shallowly unchanged. They are performance tools, not correctness tools, and should be used only after identifying unnecessary work.",
    difficulty: "hard",
    questionType: "conceptual",
    tags: ["performance", "usememo", "usecallback", "react-memo"],
  },
  {
    slug: "state-immutability",
    question: "Why must React state be treated as immutable?",
    answer: "React relies on object identity to detect changes and optimize rendering. Mutating an existing array or object can leave React and memoized children with the same reference, causing missed updates and difficult bugs. Create a new object or array when applying an update.",
    difficulty: "medium",
    questionType: "debugging",
    tags: ["state", "immutability", "rendering"],
  },
  {
    slug: "lifting-state-up",
    question: "What does lifting state up mean?",
    answer: "Lifting state up means moving shared state to the nearest common parent of the components that need it. The parent becomes the source of truth and passes the current value plus callbacks to its children, keeping related UI in sync.",
    difficulty: "easy",
    questionType: "conceptual",
    tags: ["state", "components", "data-flow"],
  },
  {
    slug: "custom-hooks-purpose",
    question: "What makes a custom hook useful, and what rules must it follow?",
    answer: "A custom hook extracts reusable stateful logic, not reusable markup. Its name starts with use, and it must call hooks unconditionally at the top level of a React function so React can preserve hook call order on every render.",
    difficulty: "medium",
    questionType: "conceptual",
    tags: ["hooks", "custom-hooks", "reuse"],
  },
  {
    slug: "context-api-tradeoffs",
    question: "When is Context appropriate, and what performance concern should you consider?",
    answer: "Context is appropriate for broadly shared, relatively stable data such as theme, locale, or authenticated user information. When a provider value changes, consumers re-render, so frequently changing or large values should be split into smaller contexts or handled with a state-management approach that supports selectors.",
    difficulty: "hard",
    questionType: "scenario",
    tags: ["context", "performance", "state-management"],
  },
];

async function seedReactInterviewQuestions() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not defined in server/.env");

  await mongoose.connect(process.env.MONGO_URI);
  const [course, author] = await Promise.all([
    Course.findOne({ $or: [{ slug: "reactjs" }, { techId: "reactjs" }] }).select("_id title"),
    User.findOne({ role: { $in: ["admin", "editor", "author"] } }).select("_id"),
  ]);
  if (!course) throw new Error("ReactJS course was not found.");
  if (!author) throw new Error("An admin, editor, or author account is required to seed interview questions.");

  const result = await InterviewQuestion.bulkWrite(
    QUESTIONS.map((item) => ({
      updateOne: {
        filter: { type: "interview", course: course._id, slug: item.slug },
        update: {
          $set: { ...item, type: "interview" },
          $setOnInsert: { course: course._id, author: author._id },
        },
        upsert: true,
      },
    })),
  );

  console.log(`ReactJS interview questions processed: ${QUESTIONS.length}.`);
  console.log(`Inserted: ${result.upsertedCount}; updated: ${result.modifiedCount}.`);
}

seedReactInterviewQuestions()
  .catch((error) => {
    console.error("ReactJS interview-question seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
