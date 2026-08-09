/**
 * Node.js Interactive Seeder
 * Creates Cheatsheets, Quizzes, and Flashcards for the Node.js Course
 * Run: node seed-nodejs-interactive.js
 */

import "dotenv/config";
import mongoose from "mongoose";

// Define minimal schemas for seeding
const CheatsheetSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true },
  techId: String,
  content: String,
  sections: [{ title: String, content: String }],
});

const QuizQuestionSchema = new mongoose.Schema({
  techId: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  question: String,
  options: [String],
  correctIndex: Number,
  explanation: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  status: { type: String, enum: ['draft', 'published'] },
});

const FlashcardSchema = new mongoose.Schema({
  techId: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  front: String,
  back: String,
  category: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
});

const CourseSchema = new mongoose.Schema({
  techId: String,
});

const Cheatsheet = mongoose.models.Cheatsheet || mongoose.model('Cheatsheet', CheatsheetSchema);
const QuizQuestion = mongoose.models.QuizQuestion || mongoose.model('QuizQuestion', QuizQuestionSchema);
const Flashcard = mongoose.models.Flashcard || mongoose.model('Flashcard', FlashcardSchema);
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

async function seedInteractive() {
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/asifto");
  console.log("✅ Connected to MongoDB");

  // Get the seeded Node.js course ID
  const course = await Course.findOne({ techId: "nodejs" });
  if (!course) {
    console.error("❌ Node.js course not found. Run `node seed-nodejs-course.js` first.");
    process.exit(1);
  }
  const courseId = course._id;
  console.log(`📚 Found Node.js Course ID: ${courseId}`);

  // 1. Seed Next.js Cheatsheet
  console.log("\n📄 Seeding Node.js Cheatsheet...");
  const cheatsheet = await Cheatsheet.findOneAndUpdate(
    { slug: "nodejs-express" },
    {
      title: "Node.js & Express Ultimate Cheatsheet",
      slug: "nodejs-express",
      techId: "nodejs",
      content: "A quick reference guide for core Node.js modules, Express routing, and MongoDB.",
      sections: [
        {
          title: "Core Modules",
          content: `### File System (Promises)
\`\`\`javascript
const fs = require('fs/promises');
const data = await fs.readFile('file.txt', 'utf8');
await fs.writeFile('file.txt', 'Hello World');
\`\`\`

### Path Module
\`\`\`javascript
const path = require('path');
const fullPath = path.join(__dirname, 'public', 'index.html');
\`\`\``
        },
        {
          title: "Express Fundamentals",
          content: `### Initialization & Middleware
\`\`\`javascript
const express = require('express');
const app = express();

app.use(express.json()); // Parse JSON bodies
app.use(require('cors')()); // Enable CORS

app.listen(3000, () => console.log('Ready'));
\`\`\`

### Routing & Controllers
\`\`\`javascript
app.get('/users/:id', (req, res) => {
  const id = req.params.id;
  const { sort } = req.query;
  res.status(200).json({ id, sort });
});
\`\`\``
        },
        {
          title: "Mongoose & MongoDB",
          content: `### Connection & Schema
\`\`\`javascript
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/db');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  age: Number
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
\`\`\`

### Queries
\`\`\`javascript
// Find all users over 18, select only email
const adults = await User.find({ age: { $gte: 18 } }).select('email');

// Create user
const newUser = await User.create({ email: 'test@test.com', age: 20 });
\`\`\``
        }
      ],
    },
    { new: true, upsert: true }
  );
  console.log(`✅ Upserted Node.js Cheatsheet! Slug: ${cheatsheet.slug}`);

  // 2. Seed Node.js Quiz Questions
  console.log("\n❓ Seeding Node.js Quiz Questions...");
  await QuizQuestion.deleteMany({ techId: "nodejs" });

  const quizzes = [
    {
      techId: "nodejs",
      course: courseId,
      question: "Which C++ library provides the Event Loop and Thread Pool for Node.js?",
      options: ["V8 Engine", "libuv", "OpenSSL", "zlib"],
      correctIndex: 1,
      explanation: "libuv is the C library that implements the Node.js event loop, thread pool, and asynchronous I/O capabilities.",
      difficulty: "easy",
      status: "published",
    },
    {
      techId: "nodejs",
      course: courseId,
      question: "What is the primary purpose of the Buffer class in Node.js?",
      options: ["To slow down request processing", "To hold raw binary data in memory temporarily", "To stream videos directly to the client", "To encrypt passwords"],
      correctIndex: 1,
      explanation: "A Buffer is a temporary memory space used to store raw binary data before it is processed.",
      difficulty: "medium",
      status: "published",
    },
    {
      techId: "nodejs",
      course: courseId,
      question: "In Express.js, what happens if a middleware function neither calls next() nor sends a response (e.g. res.send)?",
      options: ["Express throws an error", "The request is automatically terminated", "The request is left hanging and the client will time out", "It automatically calls next() after 30 seconds"],
      correctIndex: 2,
      explanation: "If next() is not called and a response is not sent, the request hangs until the client's connection times out.",
      difficulty: "easy",
      status: "published",
    },
    {
      techId: "nodejs",
      course: courseId,
      question: "Which queue has the absolute highest priority in the Node.js Event Loop?",
      options: ["Timers Queue", "Poll Queue", "Check Queue", "Microtask Queue (process.nextTick)"],
      correctIndex: 3,
      explanation: "process.nextTick() is placed in the Microtask Queue, which is checked immediately after the current operation finishes, taking priority over everything else.",
      difficulty: "hard",
      status: "published",
    },
    {
      techId: "nodejs",
      course: courseId,
      question: "Why should we avoid CPU-intensive tasks on the main Node.js thread?",
      options: ["It drains the server battery", "It blocks the Event Loop, stopping all other users from being served", "V8 cannot execute heavy math", "It causes memory leaks"],
      correctIndex: 1,
      explanation: "Node.js is single-threaded. Blocking that thread with heavy CPU tasks means no other requests can be processed until the task completes.",
      difficulty: "medium",
      status: "published",
    },
    {
      techId: "nodejs",
      course: courseId,
      question: "What is the purpose of app.use(express.json())?",
      options: ["To convert all responses to JSON", "To format console.log output as JSON", "To parse incoming request bodies containing JSON payloads", "To enable MongoDB connections"],
      correctIndex: 2,
      explanation: "It parses the incoming HTTP request body if it contains JSON, and attaches it to req.body.",
      difficulty: "easy",
      status: "published",
    },
    {
      techId: "nodejs",
      course: courseId,
      question: "How many arguments must an Express Global Error Handling middleware accept?",
      options: ["2 (req, res)", "3 (req, res, next)", "4 (err, req, res, next)", "5 (err, req, res, next, val)"],
      correctIndex: 2,
      explanation: "Express recognizes a middleware as an error handler ONLY if it has exactly 4 arguments: (err, req, res, next).",
      difficulty: "medium",
      status: "published",
    },
    {
      techId: "nodejs",
      course: courseId,
      question: "In Mongoose, how do you enforce validation rules when updating a document using findByIdAndUpdate?",
      options: ["It happens automatically", "Pass { runValidators: true } in the options object", "Call doc.validate() manually", "Mongoose cannot validate updates"],
      correctIndex: 1,
      explanation: "By default, findByIdAndUpdate bypasses schema validations. You must explicitly pass { runValidators: true }.",
      difficulty: "hard",
      status: "published",
    },
    {
      techId: "nodejs",
      course: courseId,
      question: "What is the primary difference between Hashing and Encryption?",
      options: ["Hashing is one-way, Encryption is two-way", "Hashing is slower than Encryption", "Encryption is used for passwords, Hashing is for SSL", "There is no difference"],
      correctIndex: 0,
      explanation: "Hashing (like bcrypt) cannot be reversed. Encryption (like AES) can be decrypted back to the original text with a key.",
      difficulty: "medium",
      status: "published",
    },
    {
      techId: "nodejs",
      course: courseId,
      question: "Why should we avoid using fs.readFileSync in a production web server?",
      options: ["It is slower than readFile", "It blocks the single main thread until the file is fully read", "It can only read small files", "It throws errors randomly"],
      correctIndex: 1,
      explanation: "Synchronous functions block the Event Loop. The entire server freezes and cannot serve other users while the file is being read.",
      difficulty: "easy",
      status: "published",
    }
  ];

  await QuizQuestion.insertMany(quizzes);
  console.log(`✅ Seeded ${quizzes.length} Node.js Quiz Questions!`);

  // 3. Seed Node.js Flashcards
  console.log("\n🎴 Seeding Node.js Flashcards...");
  await Flashcard.deleteMany({ techId: "nodejs" });

  const flashcards = [
    { techId: "nodejs", course: courseId, category: "Architecture", difficulty: "easy", front: "What is Node.js?", back: "An open-source, cross-platform JavaScript runtime environment built on Chrome's V8 engine." },
    { techId: "nodejs", course: courseId, category: "Architecture", difficulty: "medium", front: "What is the V8 Engine?", back: "Google's open-source high-performance JavaScript and WebAssembly engine, written in C++. It compiles JS directly to native machine code." },
    { techId: "nodejs", course: courseId, category: "Architecture", difficulty: "hard", front: "What is libuv?", back: "A multi-platform C library that provides support for asynchronous I/O based on event loops. It implements the Node.js Thread Pool." },
    { techId: "nodejs", course: courseId, category: "Event Loop", difficulty: "medium", front: "What is the Microtask Queue?", back: "A high-priority queue checked by the Event Loop after every operation. It handles Promises and process.nextTick callbacks." },
    { techId: "nodejs", course: courseId, category: "Streams", difficulty: "hard", front: "What is Backpressure?", back: "Occurs when a Readable stream reads data faster than the Writable stream can process it, causing a buildup in memory. The .pipe() method handles this automatically." },
    { techId: "nodejs", course: courseId, category: "Express", difficulty: "easy", front: "What does req.params do?", back: "It captures URL route parameters. E.g., for route `/users/:id`, `/users/42` results in req.params.id === '42'." },
    { techId: "nodejs", course: courseId, category: "Express", difficulty: "easy", front: "What does req.query do?", back: "It captures URL query strings. E.g., for `/users?sort=asc`, req.query.sort === 'asc'." },
    { techId: "nodejs", course: courseId, category: "Security", difficulty: "medium", front: "What does bcrypt do?", back: "A library used to securely hash passwords using a salt, preventing attackers from reverse-engineering the password." },
    { techId: "nodejs", course: courseId, category: "Security", difficulty: "medium", front: "What is a JWT (JSON Web Token)?", back: "A compact, URL-safe means of representing claims to be transferred between two parties. Used for stateless authentication." },
    { techId: "nodejs", course: courseId, category: "Mongoose", difficulty: "hard", front: "What is the difference between a Schema and a Model?", back: "A Schema defines the structure and rules of the document. A Model is a compiled class based on the schema used to interact with the database." },
    { techId: "nodejs", course: courseId, category: "Testing", difficulty: "easy", front: "What is Supertest?", back: "A library for testing Node.js HTTP servers (like Express) without actually starting the server on a port." },
    { techId: "nodejs", course: courseId, category: "Deployment", difficulty: "medium", front: "What is PM2?", back: "A production process manager for Node.js. It automatically restarts apps if they crash and can cluster them across multiple CPU cores." },
    { techId: "nodejs", course: courseId, category: "Express", difficulty: "medium", front: "How do you handle multipart/form-data (File Uploads) in Express?", back: "Using a middleware like Multer, as express.json() cannot parse binary file data." },
    { techId: "nodejs", course: courseId, category: "Sockets", difficulty: "hard", front: "What is Socket.io?", back: "A library that enables real-time, bidirectional communication between web clients and servers using WebSockets (with HTTP long-polling fallback)." },
    { techId: "nodejs", course: courseId, category: "Security", difficulty: "medium", front: "What does the Helmet middleware do?", back: "It secures Express apps by setting various HTTP headers to protect against common vulnerabilities like XSS and clickjacking." },
  ];

  await Flashcard.insertMany(flashcards);
  console.log(`✅ Seeded ${flashcards.length} Node.js Flashcards!`);

  console.log("\n🎉 Node.js Course Interactive Elements Seeded Successfully!");
  process.exit(0);
}

seedInteractive().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
