import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "../configs/db.js";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import Question from "../models/Question.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const args = new Set(process.argv.slice(2));

const DRY_RUN = args.has("--dry-run");
const CLEANUP = args.has("--cleanup");

const PREFIX = "course-flow-test";
const CHAPTER_LIMIT = 10;

const question = (text, answer, wrong1, wrong2, wrong3) => ({
  text,
  answer,
  wrong: [wrong1, wrong2, wrong3],
});

const TOPICS = [
  {
    match: /introduction|getting started|react basics/i,
    questions: [
      question(
        "What is React mainly used for?",
        "Building component-based user interfaces",
        "Managing SQL databases",
        "Compiling Java",
        "Hosting servers",
      ),
      question(
        "What is a React component?",
        "A reusable unit of UI",
        "A database table",
        "A CSS file",
        "A Node.js process",
      ),
      question(
        "Why split an interface into components?",
        "To improve reuse and maintainability",
        "To remove JavaScript",
        "To prevent all rendering",
        "To replace HTML",
      ),
    ],
    build: {
      title: "Build a React profile card",
      description:
        "Create a reusable React profile card to apply the basic component model.",
      requirements: [
        "Create a ProfileCard component",
        "Show name, role and bio",
        "Render the component from your app",
      ],
      estimatedMinutes: 15,
    },
  },

  {
    match: /\bjsx\b|javascript xml/i,
    questions: [
      question(
        "What is JSX?",
        "A syntax extension for describing UI inside JavaScript",
        "A database language",
        "A CSS preprocessor",
        "A package manager",
      ),
      question(
        "How do you insert a JavaScript expression inside JSX?",
        "Using curly braces {}",
        "Using SQL brackets",
        "Using PHP tags",
        "Using square brackets only",
      ),
      question(
        "Which JSX attribute is normally used for a CSS class?",
        "className",
        "classOnly",
        "cssClass",
        "styleName",
      ),
    ],
    build: {
      title: "Build a JSX product card",
      description:
        "Create a product card using JSX and JavaScript expressions.",
      requirements: [
        "Render product name from a variable",
        "Render a price expression",
        "Use className correctly",
      ],
      estimatedMinutes: 15,
    },
  },

  {
    match: /component.*prop|prop.*component|components\s*&\s*props/i,
    questions: [
      question(
        "What are props in React?",
        "Read-only inputs passed to a component",
        "Mutable global state",
        "Database records",
        "CSS selectors",
      ),
      question(
        "Can a child component directly mutate its props?",
        "No",
        "Yes, always",
        "Only inside JSX",
        "Only after useEffect",
      ),
      question(
        "Why are props useful?",
        "They make components configurable and reusable",
        "They stop rendering",
        "They remove JavaScript",
        "They completely replace state",
      ),
    ],
    build: {
      title: "Build reusable UserCard components",
      description:
        "Create one UserCard component and reuse it with different prop values.",
      requirements: [
        "Accept name, role and avatar props",
        "Render at least three users",
        "Do not duplicate the card markup",
      ],
      estimatedMinutes: 20,
    },
  },

  {
    match: /state|usestate/i,
    questions: [
      question(
        "What does useState return?",
        "A state value and a setter function",
        "Only a setter function",
        "A DOM element",
        "A Promise",
      ),
      question(
        "What normally happens after state changes?",
        "React schedules a re-render",
        "The browser reloads",
        "Props become mutable",
        "The database resets",
      ),
      question(
        "What should you use when new state depends on previous state?",
        "A functional state updater",
        "Direct DOM mutation",
        "Changing props",
        "Reloading the page",
      ),
    ],
    build: {
      title: "Build a counter with useState",
      description:
        "Create an interactive counter to practise React state updates.",
      requirements: [
        "Add increment",
        "Add decrement",
        "Add reset",
        "Use a functional state update",
      ],
      estimatedMinutes: 20,
    },
  },

  {
    match: /event|handling/i,
    questions: [
      question(
        "How should a React click handler normally be passed?",
        "onClick={handleClick}",
        "onClick={handleClick()}",
        "click={handleClick}",
        "onClick='SQL'",
      ),
      question(
        "Why is onClick={handleClick()} often incorrect?",
        "It executes the function during render",
        "It disables JSX",
        "It disables props",
        "It removes state",
      ),
      question(
        "How can you pass an argument to a click handler?",
        "Use a wrapper such as () => removeItem(id)",
        "Mutate the props",
        "Use CSS",
        "Reload the page",
      ),
    ],
    build: {
      title: "Build an event action panel",
      description:
        "Create several interactive buttons and a small form using React events.",
      requirements: [
        "Handle multiple click events",
        "Pass an argument to one handler",
        "Use preventDefault on form submission",
      ],
      estimatedMinutes: 20,
    },
  },

  {
    match: /list|conditional/i,
    questions: [
      question(
        "Which array method is commonly used to render lists in React?",
        "map()",
        "push()",
        "compile()",
        "query()",
      ),
      question(
        "Why does React need stable keys when rendering lists?",
        "To identify items across renders",
        "To encrypt list items",
        "To create CSS",
        "To make arrays global",
      ),
      question(
        "Which is a common conditional rendering pattern?",
        "condition && <Component />",
        "SELECT Component",
        "render:sql",
        "CSS if statements",
      ),
    ],
    build: {
      title: "Build a filterable task list",
      description:
        "Render tasks from an array and conditionally display different UI states.",
      requirements: [
        "Render tasks using map",
        "Use stable keys",
        "Show an empty state conditionally",
      ],
      estimatedMinutes: 25,
    },
  },

  {
    match: /useeffect|side effect/i,
    questions: [
      question(
        "What is useEffect mainly used for?",
        "Synchronizing with external systems and side effects",
        "Writing static JSX",
        "Creating CSS classes",
        "Replacing event handlers",
      ),
      question(
        "What does an empty dependency array usually mean?",
        "Run the effect after initial mount",
        "Never execute",
        "Execute before JavaScript",
        "Make state global",
      ),
      question(
        "Why return a cleanup function from useEffect?",
        "To remove subscriptions, timers or other effects",
        "To return JSX",
        "To mutate props",
        "To create routes",
      ),
    ],
    build: {
      title: "Build a document-title tracker",
      description:
        "Synchronize document.title with React state using useEffect.",
      requirements: [
        "Store a value with useState",
        "Update document.title",
        "Use the appropriate dependency array",
      ],
      estimatedMinutes: 20,
    },
  },

  {
    match: /composition|children|reusable/i,
    questions: [
      question(
        "What is component composition?",
        "Combining small components to build larger interfaces",
        "Merging databases",
        "Using one giant component",
        "Disabling props",
      ),
      question(
        "What does the children prop contain?",
        "JSX nested inside a component",
        "Database child records",
        "A state setter",
        "CSS inheritance",
      ),
      question(
        "Why is composition useful?",
        "It creates flexible reusable UI structures",
        "It prevents rendering",
        "It replaces JavaScript",
        "It forces global state",
      ),
    ],
    build: {
      title: "Build a reusable Card shell",
      description:
        "Create a Card component that accepts different content through children.",
      requirements: [
        "Accept children",
        "Render two different Card usages",
        "Keep shared structure inside Card",
      ],
      estimatedMinutes: 20,
    },
  },

  {
    match: /form|controlled|input/i,
    questions: [
      question(
        "What is a controlled input?",
        "An input whose value is controlled by React state",
        "An input controlled only by CSS",
        "A database-only field",
        "An input without events",
      ),
      question(
        "Which event commonly updates text input state?",
        "onChange",
        "onBuild",
        "onCompile",
        "onMountOnly",
      ),
      question(
        "Why use preventDefault when submitting a React form?",
        "To stop the browser's default submission",
        "To disable state",
        "To remove JSX",
        "To reset CSS",
      ),
    ],
    build: {
      title: "Build a controlled signup form",
      description:
        "Build a small form with controlled inputs and simple validation.",
      requirements: [
        "Control at least two inputs",
        "Prevent default form submission",
        "Show validation feedback",
      ],
      estimatedMinutes: 25,
    },
  },

  {
    match: /context|provider/i,
    questions: [
      question(
        "What problem can React Context help solve?",
        "Sharing broadly needed data through a component tree",
        "Compiling CSS",
        "Replacing every local state variable",
        "Creating database indexes",
      ),
      question(
        "What does a Context Provider do?",
        "Supplies a context value to its descendants",
        "Creates SQL tables",
        "Disables hooks",
        "Reloads the application",
      ),
      question(
        "Why should frequently changing Context values be used carefully?",
        "Consumers may re-render when the provider value changes",
        "Context cannot contain objects",
        "Providers only work once",
        "Context disables JSX",
      ),
    ],
    build: {
      title: "Build a theme context",
      description:
        "Create a theme provider and consume its value from nested components.",
      requirements: [
        "Create a context",
        "Provide a theme value",
        "Consume it from a nested component",
      ],
      estimatedMinutes: 25,
    },
  },
];

function fallback(title) {
  return {
    questions: [
      question(
        `What should you be able to do after learning "${title}"?`,
        "Explain the concept and apply it in a small React example",
        "Memorize only the title",
        "Avoid writing code",
        "Replace React with SQL",
      ),
      question(
        `What is a useful way to revise "${title}"?`,
        "Recall the idea without notes and then verify it",
        "Read only the URL",
        "Change browser zoom",
        "Skip the concept",
      ),
      question(
        `What best tests your understanding of "${title}"?`,
        "Implement a focused example from scratch",
        "Copy code without reading it",
        "Rename a CSS class",
        "Reload the browser",
      ),
    ],

    build: {
      title: `Build a small ${title} example`,
      description: `Create a focused example demonstrating the main idea from "${title}".`,
      requirements: [
        `Use the main concept from "${title}"`,
        "Keep the implementation focused",
        "Verify the result in the browser",
      ],
      estimatedMinutes: 20,
    },
  };
}

function contentFor(title) {
  return TOPICS.find((item) => item.match.test(title)) || fallback(title);
}

function uniqueIds(values = []) {
  const seen = new Set();

  return values
    .map((item) => item?._id || item)
    .filter(Boolean)
    .filter((item) => {
      const id = String(item);

      if (seen.has(id)) return false;

      seen.add(id);
      return true;
    });
}

async function findReactCourse() {
  return Course.findOne({
    $or: [
      { slug: { $in: ["reactjs", "react-js", "react"] } },
      { techId: { $in: ["reactjs", "react-js", "react"] } },
      { title: /react/i },
    ],
  }).sort({ createdAt: 1 });
}

async function upsertQuestion({ course, chapter, stage, index, data }) {
  const tag = `${PREFIX}:${chapter.slug}:${stage}:${index + 1}`;

  const isRevision = stage === "revise";

  const payload = {
    type: "quiz",

    category: null,
    course: null,

    courses: [course._id],

    question: isRevision ? data.text : `Practice: ${data.text}`,

    options: [data.answer, ...data.wrong],

    correctIndex: 0,

    explanation: data.answer,

    quizEnabled: !isRevision,
    flashcardEnabled: isRevision,

    flashcardAnswer: data.answer,

    tag,

    difficulty: index === 0 ? "easy" : "medium",

    status: "published",

    order: index,
  };

  const existing = await Question.findOne({
    type: "quiz",
    courses: course._id,
    tag,
  });

  if (DRY_RUN) {
    console.log(
      `      ${existing ? "UPDATE" : "CREATE"} ${stage} question ${index + 1}`,
    );

    return existing?._id || new mongoose.Types.ObjectId();
  }

  if (existing) {
    Object.assign(existing, payload);

    await existing.save();

    return existing._id;
  }

  const created = await Question.create(payload);

  return created._id;
}

async function cleanup(course, chapters) {
  console.log("\nRemoving test learning data...\n");

  for (const chapter of chapters) {
    const seeded = await Question.find({
      courses: course._id,
      tag: new RegExp(`^${PREFIX}:${chapter.slug}:`),
    }).select("_id");

    const seededIds = new Set(seeded.map((item) => String(item._id)));

    console.log(
      `${chapter.title}: ${
        DRY_RUN ? "would remove" : "removing"
      } ${seeded.length} questions`,
    );

    if (DRY_RUN) continue;

    await Question.deleteMany({
      _id: {
        $in: seeded.map((item) => item._id),
      },
    });

    const learning = chapter.learningActivities || {};

    const revisionQuestions = uniqueIds(
      learning.revisionQuestions || [],
    ).filter((id) => !seededIds.has(String(id)));

    const practiceQuestions = uniqueIds(
      learning.practiceQuestions || [],
    ).filter((id) => !seededIds.has(String(id)));

    const relatedQuestions = uniqueIds(chapter.relatedQuestions || []).filter(
      (id) => !seededIds.has(String(id)),
    );

    let build = learning.build;

    if (String(build?.description || "").startsWith("[FLOW TEST]")) {
      build = {
        enabled: false,
        title: "",
        description: "",
        requirements: [],
        estimatedMinutes: 0,
      };
    }

    chapter.learningActivities = {
      ...learning,
      revisionQuestions,
      practiceQuestions,
      build,
    };

    chapter.relatedQuestions = relatedQuestions;

    await chapter.save();
  }
}

async function main() {
  console.log("======================================================");

  console.log("React Course Learning Flow Test");

  console.log("Learn -> Revise -> Practice -> Build");

  console.log(`Mode: ${CLEANUP ? "cleanup" : DRY_RUN ? "dry-run" : "write"}`);

  console.log("======================================================\n");

  await connectDB();

  const course = await findReactCourse();

  if (!course) {
    throw new Error("Could not find the React.js course.");
  }

  const chapters = await Chapter.find({
    course: course._id,
  })
    .sort({
      order: 1,
      createdAt: 1,
    })
    .limit(CHAPTER_LIMIT);

  if (!chapters.length) {
    throw new Error(`No chapters found for "${course.title}".`);
  }

  console.log(`Course: ${course.title} [${course.slug}]`);

  console.log(`\nUsing first ${chapters.length} chapters:\n`);

  chapters.forEach((chapter, index) => {
    console.log(`${index + 1}. ${chapter.title} [${chapter.slug}]`);
  });

  if (CLEANUP) {
    await cleanup(course, chapters);

    await mongoose.disconnect();

    console.log("\nCleanup finished.");

    return;
  }

  console.log("\nCreating learning activities...\n");

  for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
    const chapter = chapters[chapterIndex];

    const content = contentFor(chapter.title);

    console.log(`[${chapterIndex + 1}/${chapters.length}] ${chapter.title}`);

    const revisionIds = [];
    const practiceIds = [];

    for (let i = 0; i < content.questions.length; i++) {
      revisionIds.push(
        await upsertQuestion({
          course,
          chapter,
          stage: "revise",
          index: i,
          data: content.questions[i],
        }),
      );

      practiceIds.push(
        await upsertQuestion({
          course,
          chapter,
          stage: "practice",
          index: i,
          data: content.questions[i],
        }),
      );
    }

    if (!DRY_RUN) {
      const current = chapter.learningActivities || {};

      chapter.learningActivities = {
        ...current,

        revisionQuestions: uniqueIds([
          ...(current.revisionQuestions || []),
          ...revisionIds,
        ]),

        practiceQuestions: uniqueIds([
          ...(current.practiceQuestions || []),
          ...practiceIds,
        ]),

        build: {
          enabled: true,

          title: content.build.title,

          description: `[FLOW TEST] ${content.build.description}`,

          requirements: content.build.requirements,

          estimatedMinutes: content.build.estimatedMinutes,
        },
      };

      chapter.relatedQuestions = uniqueIds([
        ...(chapter.relatedQuestions || []),
        ...revisionIds,
        ...practiceIds,
      ]);

      await chapter.save();
    }

    console.log("      ✓ 3 Revision questions");

    console.log("      ✓ 3 Practice questions");

    console.log("      ✓ 1 Build challenge");
  }

  console.log("\n======================================================");

  console.log(
    DRY_RUN
      ? "Dry run finished. No database changes made."
      : "React learning-flow test content created.",
  );

  console.log("======================================================");

  console.log("\nNow test:");

  console.log(`
1. Open React.js course.

2. First 10 chapters should show:

   Learn
   Revise
   Practice
   Build

3. Open Chapter 1.

4. Mark Learn complete.

5. Click Revision.
   You should get only its 3 revision cards.

6. Finish the revision deck.

7. Start Practice.
   You should get only its 3 questions.

8. Score at least 70%.

9. Complete its Build challenge.

10. Continue Learning should move toward
    the next unfinished chapter/stage.
`);

  console.log("Remove this temporary test content later with:");

  console.log(
    "\nnode server/src/scripts/seed-react-learning-flow-test.js --cleanup",
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("\nSeeder failed:", error);

  try {
    await mongoose.disconnect();
  } catch {}

  process.exit(1);
});
