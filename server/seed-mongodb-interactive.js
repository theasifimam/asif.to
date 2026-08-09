/**
 * MongoDB & Mongoose Interactive Seeder
 * Creates Cheatsheets, Quizzes, and Flashcards for the MongoDB Course
 * Run: node seed-mongodb-interactive.js
 */

import "dotenv/config";
import mongoose from "mongoose";

// Define minimal schemas for seeding
const Cheatsheet = mongoose.model(
  "Cheatsheet",
  new mongoose.Schema({
    techId: { type: String, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    snippets: [
      {
        name: String,
        code: String,
      },
    ],
  })
);

const QuizQuestion = mongoose.model(
  "QuizQuestion",
  new mongoose.Schema({
    techId: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true },
    explanation: String,
  })
);

const Flashcard = mongoose.model(
  "Flashcard",
  new mongoose.Schema({
    techId: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    topic: { type: String, required: true },
    title: { type: String, required: true },
    frontText: { type: String, required: true },
    backText: { type: String, required: true },
    code: String,
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
  })
);

const Course = mongoose.model(
  "Course",
  new mongoose.Schema({
    techId: String,
    title: String,
  })
);

const CHEATSHEET = {
  techId: "mongodb",
  title: "MongoDB & Mongoose Ultimate Reference",
  slug: "mongodb-mongoose",
  description: "Queries, updates, schemas, middleware, and aggregation pipelines.",
  snippets: [
    {
      name: "Connect to MongoDB",
      code: `const mongoose = require('mongoose');nmongoose.connect('mongodb://localhost:27017/dbName');`,
    },
    {
      name: "Define a Schema",
      code: `const userSchema = new mongoose.Schema({n  email: { type: String, required: true, unique: true },n  age: { type: Number, default: 18 }n}, { timestamps: true });`,
    },
    {
      name: "Insert Documents",
      code: `// Insert Onenawait User.create({ email: 'test@test.com' });nn// Insert Manynawait User.insertMany([{ email: 'a@a.com' }, { email: 'b@b.com' }]);`,
    },
    {
      name: "Querying (Find)",
      code: `// Find all matchingnawait User.find({ age: { $gte: 18 } });nn// Find onenawait User.findOne({ email: 'test@test.com' });nn// Find by IDnawait User.findById('60c...123');`,
    },
    {
      name: "Updating",
      code: `// Update one documentnawait User.updateOne(n  { _id: '60c...' }, n  { $set: { status: 'active' }, $inc: { logins: 1 } }n);nn// Find and return updatednawait User.findByIdAndUpdate(id, { name: 'Bob' }, { new: true });`,
    },
    {
      name: "Deleting",
      code: `await User.deleteOne({ email: 'test@test.com' });nawait User.findByIdAndDelete('60c...');`,
    },
    {
      name: "Population (JOIN)",
      code: `await Post.find().populate('author', 'name email -_id');`,
    },
    {
      name: "Aggregation Pipeline",
      code: `await Order.aggregate([n  { $match: { status: 'COMPLETED' } },n  { $group: { _id: '$userId', totalSpent: { $sum: '$amount' } } },n  { $sort: { totalSpent: -1 } }n]);`,
    },
  ],
};

const QUIZ_QUESTIONS = [
  {
    question: "Which of the following is NOT a valid Mongoose Schema Type?",
    options: ["String", "Number", "Float", "ObjectId"],
    correctIndex: 2,
    explanation: "Mongoose uses 'Number' for both integers and floating point numbers. There is no explicit 'Float' type in standard Mongoose schemas.",
  },
  {
    question: "What is the primary difference between `updateOne()` and `findByIdAndUpdate()`?",
    options: [
      "`updateOne()` validates schema automatically",
      "`findByIdAndUpdate()` can return the document as it looks *after* the update",
      "`updateOne()` can only modify strings",
      "There is no difference"
    ],
    correctIndex: 1,
    explanation: "`findByIdAndUpdate()` returns the document itself (with `{ new: true }` returning the modified version), whereas `updateOne()` only returns a status object like `{ acknowledged: true, modifiedCount: 1 }`.",
  },
  {
    question: "If you want a Mongoose hook to run *before* a document is saved to the DB, what do you use?",
    options: ["schema.before('save')", "schema.pre('save')", "schema.on('save')", "schema.hook('save')"],
    correctIndex: 1,
    explanation: "Mongoose uses `schema.pre('save', function(next) {})` to define pre-save hooks.",
  },
  {
    question: "Which aggregation stage acts identically to a standard Mongoose `.find()` query?",
    options: ["$group", "$lookup", "$project", "$match"],
    correctIndex: 3,
    explanation: "The `$match` stage filters documents using standard MongoDB query operators, just like `find()`.",
  },
  {
    question: "Why should you be careful when embedding an array of subdocuments?",
    options: [
      "Subdocuments cannot be updated",
      "MongoDB enforces a strict 16MB document size limit",
      "Subdocuments cannot have their own Schemas",
      "Embedding slows down read queries"
    ],
    correctIndex: 1,
    explanation: "If an array grows infinitely (unbounded growth), it will eventually exceed MongoDB's 16MB per-document limit and crash the database.",
  },
  {
    question: "How do you define a Virtual property in Mongoose?",
    options: [
      "schema.virtual('name').get(function() { ... })",
      "schema.computed('name', function() { ... })",
      "new mongoose.Virtual('name', function() { ... })",
      "It is defined in the Schema configuration object directly"
    ],
    correctIndex: 0,
    explanation: "Virtuals are defined using `schema.virtual('propertyName').get(getterFunction)`. You also need `{ toJSON: { virtuals: true } }` in the schema options for them to appear in JSON responses.",
  },
  {
    question: "What is a Capped Collection?",
    options: [
      "A collection that requires a password to access",
      "A collection with a fixed max size that overwrites old data",
      "A collection used strictly for indexing",
      "A collection that cannot be queried"
    ],
    correctIndex: 1,
    explanation: "Capped collections have a fixed size (in bytes or document count) and behave like a circular queue, automatically overwriting the oldest documents.",
  },
  {
    question: "In a compound index, what does the ESR rule stand for?",
    options: [
      "Equality, Sort, Range",
      "Evaluate, Search, Return",
      "Errors, Successes, Retries",
      "Embedded, Single, Referenced"
    ],
    correctIndex: 0,
    explanation: "The ESR rule states the optimal order for fields in a compound index: Equality fields first, followed by Sort fields, followed by Range query fields.",
  },
  {
    question: "What Mongoose feature simulates SQL JOINs?",
    options: ["$lookup", "populate()", "aggregate()", "embed()"],
    correctIndex: 1,
    explanation: "While MongoDB natively uses `$lookup`, Mongoose provides the much simpler `.populate()` method to resolve ObjectId references into complete documents.",
  },
  {
    question: "By default, do Mongoose validators run when you use `updateOne()`?",
    options: [
      "Yes, always",
      "No, validators only run on `save()` or `create()` unless explicitly enabled",
      "Only if the updated field is a String",
      "Only if `upsert: true` is provided"
    ],
    correctIndex: 1,
    explanation: "Mongoose bypasses validation on update operations by default for performance. You must pass `{ runValidators: true }` in the update options to enforce validation.",
  },
];

const FLASHCARDS = [
  {
    topic: "MongoDB Operators",
    title: "Greater Than",
    frontText: "Which query operator finds documents where a field is greater than a specified value?",
    backText: "The `$gt` operator.",
    code: `db.users.find({ age: { $gt: 18 } });`,
    difficulty: "Beginner",
  },
  {
    topic: "MongoDB Operators",
    title: "In Array",
    frontText: "Which query operator matches any of the values specified in an array?",
    backText: "The `$in` operator.",
    code: `db.users.find({ role: { $in: ["admin", "moderator"] } });`,
    difficulty: "Beginner",
  },
  {
    topic: "Update Operators",
    title: "Increment",
    frontText: "How do you atomically increment a numerical field by 1?",
    backText: "Use the `$inc` update operator.",
    code: `db.posts.updateOne({ _id: id }, { $inc: { views: 1 } });`,
    difficulty: "Beginner",
  },
  {
    topic: "Update Operators",
    title: "Push to Array",
    frontText: "How do you append a value to an array inside a document?",
    backText: "Use the `$push` update operator.",
    code: `db.users.updateOne({ _id: id }, { $push: { skills: "React" } });`,
    difficulty: "Intermediate",
  },
  {
    topic: "Mongoose",
    title: "Timestamp Options",
    frontText: "How do you automatically add `createdAt` and `updatedAt` to a Schema?",
    backText: "Pass `{ timestamps: true }` as the second argument when defining the Schema.",
    code: `const userSchema = new mongoose.Schema({ name: String }, { timestamps: true });`,
    difficulty: "Beginner",
  },
  {
    topic: "Mongoose",
    title: "Exact Match Validation",
    frontText: "Which Schema constraint ensures a string matches a regular expression?",
    backText: "The `match` constraint.",
    code: `email: { type: String, match: /w+@w+.w+/ }`,
    difficulty: "Intermediate",
  },
  {
    topic: "Mongoose",
    title: "Pre-Save Hook",
    frontText: "Why is it important to use `function()` instead of `() => {}` in a Mongoose hook?",
    backText: "Arrow functions do not bind their own `this` context. You need a regular `function()` so that `this` refers to the document being saved.",
    code: `schema.pre('save', function(next) { n  console.log(this.name); n  next(); n});`,
    difficulty: "Intermediate",
  },
  {
    topic: "Mongoose",
    title: "Avoiding Hashing on Update",
    frontText: "Inside a pre-save hook for password hashing, how do you prevent re-hashing the password if only the user's email was changed?",
    backText: "Check `this.isModified('password')` and return early if it's false.",
    code: `if (!this.isModified('password')) return next();`,
    difficulty: "Advanced",
  },
  {
    topic: "Mongoose",
    title: "Sorting",
    frontText: "How do you sort results by `createdAt` in descending order?",
    backText: "Use `.sort('-createdAt')` or `.sort({ createdAt: -1 })`.",
    code: `await Post.find().sort('-createdAt');`,
    difficulty: "Beginner",
  },
  {
    topic: "Aggregation",
    title: "$group",
    frontText: "In the `$group` aggregation stage, what field is absolutely required?",
    backText: "The `_id` field. It defines what expression the documents are grouped by (e.g., `_id: '$category'`).",
    code: `{ $group: { _id: '$category', total: { $sum: 1 } } }`,
    difficulty: "Intermediate",
  },
  {
    topic: "Aggregation",
    title: "$match placement",
    frontText: "Where should the `$match` stage ideally be placed in an aggregation pipeline?",
    backText: "As early as possible (usually the first stage) to filter out documents before performing expensive groupings or lookups.",
    code: `[ { $match: { status: "ACTIVE" } }, { $group: { ... } } ]`,
    difficulty: "Intermediate",
  },
  {
    topic: "Mongoose",
    title: "Selecting Fields (Projection)",
    frontText: "How do you return ONLY the `title` and `author` fields, while specifically excluding the `_id`?",
    backText: "Pass a string to `.select()` with a minus sign before `_id`.",
    code: `await Post.find().select('title author -_id');`,
    difficulty: "Beginner",
  },
  {
    topic: "Mongoose Models",
    title: "ObjectId Type",
    frontText: "How do you define a field as a MongoDB ObjectId in a Mongoose Schema?",
    backText: "Use `mongoose.Schema.Types.ObjectId`.",
    code: `author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }`,
    difficulty: "Beginner",
  },
  {
    topic: "Mongoose Models",
    title: "Populate specific fields",
    frontText: "When populating a referenced document, how do you specify which fields of that document to return?",
    backText: "Pass a space-separated string of field names as the second argument to `.populate()`.",
    code: `await Post.find().populate('author', 'name email');`,
    difficulty: "Intermediate",
  },
  {
    topic: "MongoDB",
    title: "Upsert",
    frontText: "What does the `{ upsert: true }` option do in an update operation?",
    backText: "If a document matching the filter exists, it updates it. If no document matches, it creates a new document combining the filter and the update operators.",
    code: `await User.updateOne({ email }, { $set: { name } }, { upsert: true });`,
    difficulty: "Advanced",
  },
];

async function main() {
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/asifto");
  console.log("✅ Connected to MongoDB");

  // Find the dynamically created MongoDB course
  const course = await Course.findOne({ techId: "mongodb" });
  if (!course) {
    console.error("❌ MongoDB Course not found. Please run seed-mongodb-course.js first.");
    process.exit(1);
  }
  console.log(`📚 Found MongoDB Course ID: ${course._id}n`);

  // 1. Seed Cheatsheet
  console.log("📄 Seeding MongoDB Cheatsheet...");
  await Cheatsheet.findOneAndUpdate({ slug: CHEATSHEET.slug }, CHEATSHEET, {
    upsert: true,
    new: true,
  });
  console.log(`✅ Upserted MongoDB Cheatsheet! Slug: ${CHEATSHEET.slug}n`);

  // 2. Seed Quizzes
  console.log("❓ Seeding MongoDB Quiz Questions...");
  await QuizQuestion.deleteMany({ techId: "mongodb" });
  const quizzesWithCourseId = QUIZ_QUESTIONS.map((q) => ({
    ...q,
    techId: "mongodb",
    courseId: course._id,
  }));
  await QuizQuestion.insertMany(quizzesWithCourseId);
  console.log(`✅ Seeded ${QUIZ_QUESTIONS.length} MongoDB Quiz Questions!n`);

  // 3. Seed Flashcards
  console.log("🎴 Seeding MongoDB Flashcards...");
  await Flashcard.deleteMany({ techId: "mongodb" });
  const flashcardsWithCourseId = FLASHCARDS.map((f) => ({
    ...f,
    techId: "mongodb",
    courseId: course._id,
  }));
  await Flashcard.insertMany(flashcardsWithCourseId);
  console.log(`✅ Seeded ${FLASHCARDS.length} MongoDB Flashcards!n`);

  console.log("🎉 MongoDB Course Interactive Elements Seeded Successfully!");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Fatal Error during seeding:", error);
  process.exit(1);
});
