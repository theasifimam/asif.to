/**
 * Node.js & Express Complete Course Seeder
 * Creates the full Node.js course with all chapters via API
 * Run: node seed-nodejs-course.js
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
  const res = await fetch(`${API_BASE}/courses?techId=nodejs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  const courses = data.data || [];
  
  for (const course of courses) {
    if (course.techId === "nodejs") {
      await fetch(`${API_BASE}/courses/${course._id || course.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`🗑️ Deleted old Node.js course: ${course._id || course.id}`);
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
    title: "Introduction to Node.js & Architecture",
    summary: "Understand what Node.js actually is, the V8 JavaScript engine, libuv, and the architecture of a single-threaded non-blocking I/O model.",
    content: `## What is Node.js?

Node.js is an open-source, cross-platform **JavaScript runtime environment** that allows you to execute JavaScript code outside of a web browser. 

Historically, JavaScript was confined to the browser, used only to manipulate the DOM or add interactivity to web pages. In 2009, Ryan Dahl took the **V8 JavaScript Engine** (the extremely fast engine inside Google Chrome) and embedded it inside a C++ program. He added features to interact with the operating system (like the file system and network), creating Node.js.

> **Definition: Runtime Environment**  
> A runtime environment provides the necessary infrastructure to execute code. It includes the compiler/interpreter, memory management, and access to system resources. Node.js is NOT a programming language; it is an environment where the JavaScript language can run.

---

## The Node.js Architecture

Understanding the architecture of Node.js is critical for system design interviews and writing performant backend code.

Node.js is built on three main pillars:
1. **V8 Engine:** Compiles JavaScript directly to native machine code for maximum speed.
2. **Core Modules (Node APIs):** C++ bindings that give JavaScript access to the OS (file system, networking, cryptography).
3. **libuv:** A powerful C library that handles asynchronous I/O and provides the Event Loop and Thread Pool.

### Single-Threaded, Non-Blocking I/O

The defining characteristic of Node.js is that it operates on a **Single Thread**. 

In traditional server models (like PHP, Apache, or early Java Spring), every incoming request spawns a new thread or process. If you have 10,000 concurrent users, you need 10,000 threads. This consumes immense memory and CPU resources.

Node.js, however, handles 10,000 concurrent users using *just one main thread*.

> **Interview Highlight**  
> **Q: If Node.js only has one thread, how can it handle 10,000 concurrent requests without blocking?**  
> A: Node.js uses **Non-Blocking I/O** powered by **libuv**. When a request comes in that requires a slow operation (like reading a file or querying a database), the main thread offloads that task to the operating system or the libuv Thread Pool. The main thread immediately moves on to serve the next user. Once the slow database query finishes, a callback is pushed to the Event Loop, and the main thread picks it up to send the response.

---

## When to Use (and NOT Use) Node.js

**Perfect For:**
- I/O-bound applications (frequently reading/writing to databases or networks).
- Real-time applications (Chat apps, collaborative tools using WebSockets).
- Single Page Application (SPA) backends (REST/GraphQL APIs).
- Streaming applications (Netflix uses Node.js extensively).

**Terrible For:**
- CPU-intensive applications (Video encoding, heavy machine learning, complex mathematical simulations).
- *Why?* Because CPU-intensive tasks do not offload to the OS. They block the single main thread, causing all other user requests to freeze until the calculation is finished.`,
    tryItChallenge: "Install Node.js locally. Create a file called \`app.js\` with \`console.log(process.versions)\`. Run it using \`node app.js\` in your terminal to see the versions of V8, libuv, and Node itself.",
  },
  {
    order: 2,
    title: "The Event Loop & Asynchronous JS",
    summary: "Master the heart of Node.js: The Event Loop. Understand the call stack, microtask queues, macrotask queues, and the different phases of execution.",
    content: `## The Heart of Node: The Event Loop

The Event Loop is what allows Node.js to perform non-blocking I/O operations despite being single-threaded. It is a loop that continuously checks if there are pending tasks to execute and executes them.

> **Definition: The Event Loop**  
> A mechanism orchestrated by the libuv library that constantly cycles through specific phases, pulling completed asynchronous tasks from various queues and pushing them onto the JavaScript Call Stack for execution.

---

## Synchronous vs Asynchronous Code

### Synchronous (Blocking)
Code executes line-by-line. The next line cannot start until the current line finishes.

\`\`\`javascript
const fs = require('fs');

console.log('1. Starting');
// The entire server freezes here until the file is fully read!
const data = fs.readFileSync('massive-file.txt', 'utf8'); 
console.log('2. File read complete');
\`\`\`

### Asynchronous (Non-Blocking)
Code initiates a task, registers a callback/promise, and immediately moves to the next line.

\`\`\`javascript
const fs = require('fs');

console.log('1. Starting');
// Node hands this task to libuv and immediately moves on
fs.readFile('massive-file.txt', 'utf8', (err, data) => {
  console.log('3. File read complete (Callback executed!)');
});
console.log('2. Continuing other work');

// OUTPUT:
// 1. Starting
// 2. Continuing other work
// 3. File read complete (Callback executed!)
\`\`\`

---

## The Call Stack and Task Queues

When asynchronous tasks complete, they don't immediately jump back into your code. They are placed into queues. The Event Loop decides when to move them from the queue back to the Call Stack.

There are two primary types of queues in Node.js:

### 1. Microtask Queue
This queue has the absolute highest priority. The Event Loop checks this queue after *every single operation*.
- **Promises** (\`then\`, \`catch\`, \`finally\`)
- \`process.nextTick()\` (Even higher priority than Promises!)

### 2. Macrotask Queue (The Event Loop Phases)
Tasks here execute in specific phases.
- **Timers Phase:** \`setTimeout()\` and \`setInterval()\`
- **Poll Phase:** I/O callbacks (File system, networking)
- **Check Phase:** \`setImmediate()\`
- **Close Callbacks Phase:** \`socket.on('close')\`

> **Interview Highlight**  
> **Q: What is the output of the following code, and why?**
> \`\`\`javascript
> setTimeout(() => console.log('Timeout'), 0);
> Promise.resolve().then(() => console.log('Promise'));
> process.nextTick(() => console.log('NextTick'));
> console.log('Sync');
> \`\`\`
> A: 
> 1. \`Sync\` (Executes immediately on the Call Stack)
> 2. \`NextTick\` (Highest priority microtask)
> 3. \`Promise\` (Standard microtask)
> 4. \`Timeout\` (Macrotask, executes in the Timers phase)

---

## Avoiding Event Loop Blockage

Because there is only one thread, if you write a \`while(true)\` loop or a massive \`for\` loop that calculates prime numbers, the Event Loop stops spinning. 

If the Event Loop stops spinning, **no other users can connect to your server**, and pending database queries will never return. Always use asynchronous methods for I/O, and offload heavy CPU tasks to Worker Threads or external microservices.`,
    tryItChallenge: "Write a script that mixes \`setTimeout\`, \`setImmediate\`, \`process.nextTick\`, and Promises. Run it multiple times to observe the execution order and verify your understanding of the microtask vs macrotask queues.",
  },
  {
    order: 3,
    title: "Core Modules Deep Dive",
    summary: "Learn how to use Node's built-in core modules: fs for files, path for directories, http for servers, os for system info, and events for custom architectures.",
    content: `## What are Core Modules?

Unlike React, where you must \`npm install\` packages for basic functionality like routing, Node.js ships with dozens of powerful built-in modules. You can require them directly without installing anything.

---

## 1. The \`path\` Module

Different operating systems use different path separators (Windows uses \`\\\`, Mac/Linux use \`/\`). The \`path\` module normalizes this, preventing bugs when deploying across environments.

\`\`\`javascript
const path = require('path');

// Safely join paths across any OS
const filePath = path.join(__dirname, 'content', 'data.txt');
console.log(filePath); // /Users/user/project/content/data.txt

// Get specific parts of a path
console.log(path.basename(filePath)); // 'data.txt'
console.log(path.extname(filePath));  // '.txt'
\`\`\`

---

## 2. The \`fs\` (File System) Module

The \`fs\` module allows you to interact with the hard drive. **Always use the promise-based version** in modern applications to avoid Callback Hell.

\`\`\`javascript
// Modern approach using fs/promises
const fs = require('fs/promises');

async function manageFiles() {
  try {
    // Write to a file (creates or overwrites)
    await fs.writeFile('notes.txt', 'Hello Node.js!');
    
    // Append to a file
    await fs.appendFile('notes.txt', '\\nThis is a new line.');
    
    // Read a file
    const content = await fs.readFile('notes.txt', 'utf8');
    console.log(content);
  } catch (error) {
    console.error('File operation failed:', error);
  }
}

manageFiles();
\`\`\`

---

## 3. The \`os\` (Operating System) Module

Get critical information about the underlying server running your Node.js app.

\`\`\`javascript
const os = require('os');

console.log('CPU Architecture:', os.arch()); // 'x64' or 'arm64'
console.log('Total Memory (GB):', os.totalmem() / 1024 / 1024 / 1024);
console.log('Free Memory (GB):', os.freemem() / 1024 / 1024 / 1024);
console.log('CPU Cores:', os.cpus().length);
\`\`\`
*Useful when building clustering strategies or load-balancing logic.*

---

## 4. The \`events\` Module

Much of Node.js's core architecture (like the HTTP server and Streams) is built on the Observer Pattern using the \`EventEmitter\` class.

You can create your own custom event architectures.

\`\`\`javascript
const EventEmitter = require('events');

// Create a custom emitter class
class UserAuth extends EventEmitter {}
const auth = new UserAuth();

// 1. Register a listener (Subscriber)
auth.on('userLoggedIn', (user) => {
  console.log(\`Send welcome email to: \${user.email}\`);
});

auth.on('userLoggedIn', (user) => {
  console.log(\`Update database lastLogin timestamp for \${user.id}\`);
});

// 2. Emit the event (Publisher)
auth.emit('userLoggedIn', { id: 101, email: 'john@doe.com' });
\`\`\`

> **Interview Highlight**  
> **Q: Explain the Observer Pattern in Node.js.**  
> A: The Observer Pattern is implemented via the \`EventEmitter\` class. It allows one object (the Subject/Publisher) to broadcast events, while multiple other objects (Observers/Subscribers) listen and react to those events asynchronously. This decouples code, making it highly modular.`,
    tryItChallenge: "Create a custom Logger class that extends \`EventEmitter\`. Emit an 'error' event when a fake database connection fails, and write the error to an \`error.log\` file using \`fs/promises\` in the listener.",
  },
  {
    order: 4,
    title: "Streams and Buffers",
    summary: "Handle massive data efficiently without crashing your server. Learn about memory management, readable/writable streams, and piping.",
    content: `## The Problem with Traditional Data Handling

Imagine you are building a video streaming server like YouTube, or you need to process a 5GB CSV file.

If you use \`fs.readFile\`, Node.js attempts to load the **entire 5GB file** into RAM before doing anything. 
1. Your server will run out of memory (V8 has a default ~1.5GB memory limit per process).
2. The user will wait minutes before receiving the first byte of data.

## Buffers

> **Definition: Buffer**  
> A Buffer is a temporary storage spot for a chunk of raw binary data. When data moves between processes (like downloading a file or reading from a database), it arrives in raw binary form (0s and 1s). Node.js uses Buffers to hold this data until it is ready to be processed.

## Enter Streams

Streams fix the memory problem. Instead of loading the whole file into RAM, a Stream reads a small chunk of data (a Buffer, usually 64kb), processes it, and then instantly throws it away to read the next chunk.

This means you can process a 5GB file using only 64kb of RAM!

---

## The 4 Types of Streams

1. **Readable:** Streams you can read from (e.g., \`fs.createReadStream\`, \`http.IncomingMessage\`).
2. **Writable:** Streams you can write to (e.g., \`fs.createWriteStream\`, \`http.ServerResponse\`).
3. **Duplex:** Streams that are both readable and writable (e.g., TCP sockets).
4. **Transform:** Duplex streams that modify data as it passes through (e.g., zlib compression).

---

## Working with Readable Streams

Because Streams inherit from \`EventEmitter\`, we consume them by listening to events:

\`\`\`javascript
const fs = require('fs');

// Create a readable stream for a massive video file
const readStream = fs.createReadStream('./massive-video.mp4');

// Listen for chunks of data arriving
readStream.on('data', (chunk) => {
  console.log('Received a chunk of data:', chunk.length, 'bytes');
  // chunk is a Buffer containing raw binary data
});

readStream.on('end', () => {
  console.log('Finished reading the entire file.');
});

readStream.on('error', (err) => {
  console.error('An error occurred:', err);
});
\`\`\`

---

## Piping: Connecting Streams

The most powerful feature of Streams is \`pipe()\`. It allows you to connect the output of a Readable stream directly into the input of a Writable stream, automatically handling memory backpressure (preventing the readable stream from overwhelming the writable stream).

### Example: A Highly Efficient Web Server

\`\`\`javascript
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  if (req.url === '/video') {
    // ❌ TERRIBLE WAY: Loads whole file into RAM, crashes server
    // fs.readFile('./video.mp4', (err, data) => res.end(data));
    
    // ✅ PERFECT WAY: Streams the file to the user chunk-by-chunk
    res.writeHead(200, { 'Content-Type': 'video/mp4' });
    const readStream = fs.createReadStream('./video.mp4');
    
    // req is a Readable Stream. res is a Writable Stream!
    readStream.pipe(res); 
  }
});

server.listen(3000);
\`\`\`

> **Interview Highlight**  
> **Q: What is "Backpressure" in Node.js streams?**  
> A: Backpressure happens when a Readable stream reads data faster than the Writable stream can process or send it. If unhandled, this builds up in RAM, crashing the server. The \`.pipe()\` method automatically handles backpressure by pausing the Readable stream until the Writable stream is ready for more data.`,
    tryItChallenge: "Create a script that uses \`fs.createReadStream\`, pipes it through the \`zlib.createGzip()\` transform stream, and outputs it via \`fs.createWriteStream\` to highly compress a large text file using minimal RAM.",
  },
  {
    order: 5,
    title: "Express.js Fundamentals",
    summary: "Initialize an Express server, understand the request and response objects, and learn basic routing to create your first API endpoints.",
    content: `## What is Express.js?

While you can build a web server using the built-in Node.js \`http\` module, the syntax is extremely verbose, lacks routing capabilities, and requires manual parsing of URLs and request bodies.

**Express.js** is a fast, unopinionated, minimalist web framework for Node.js. It sits on top of the \`http\` module and provides robust routing, middleware support, and simplified request/response handling.

---

## 1. Initializing an Express App

First, initialize a new Node.js project and install Express.

\`\`\`bash
npm init -y
npm install express
\`\`\`

Create your \`server.js\` file:

\`\`\`javascript
const express = require('express');
const app = express();
const PORT = 3000;

// Basic GET Route
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

// Start the server
app.listen(PORT, () => {
  console.log(\`Server is running on http://localhost:\${PORT}\`);
});
\`\`\`

---

## 2. The Request (\`req\`) Object

The \`req\` object represents the incoming HTTP request. Express enhances it with powerful properties.

\`\`\`javascript
app.get('/users/:id', (req, res) => {
  // 1. Route Parameters (e.g., /users/42)
  console.log(req.params.id); // "42"
  
  // 2. Query Strings (e.g., /users/42?sort=asc&limit=10)
  console.log(req.query.sort); // "asc"
  console.log(req.query.limit); // "10"
  
  // 3. HTTP Headers
  console.log(req.headers['user-agent']);
  
  // 4. Client IP Address
  console.log(req.ip);
  
  res.send('Request details logged.');
});
\`\`\`

---

## 3. The Response (\`res\`) Object

The \`res\` object allows you to craft the HTTP response sent back to the client.

\`\`\`javascript
app.get('/api/data', (req, res) => {
  // 1. Send raw text or HTML
  // res.send('<h1>Hello</h1>');
  
  // 2. Send structured JSON (Automatically sets Content-Type header)
  res.json({
    status: 'success',
    data: { id: 1, name: 'Alice' }
  });
});

app.get('/unauthorized', (req, res) => {
  // 3. Chain status codes and responses
  res.status(401).json({ error: 'Please log in first' });
});

app.get('/download', (req, res) => {
  // 4. Force the browser to download a file
  res.download('./reports/annual-report.pdf');
});
\`\`\`

---

## 4. Handling POST Requests (Parsing JSON)

By default, Express does NOT know how to parse the body of incoming \`POST\` requests. If a client sends JSON data, \`req.body\` will be \`undefined\`.

You must include the built-in JSON parsing middleware before your routes:

\`\`\`javascript
const express = require('express');
const app = express();

// VERY IMPORTANT: This middleware parses incoming JSON payloads
app.use(express.json());

app.post('/api/users', (req, res) => {
  // Because of app.use(express.json()), req.body is now a populated object
  const { username, email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  // Simulate database creation...
  console.log(\`Creating user \${username} with email \${email}\`);
  
  res.status(201).json({ message: 'User created successfully' });
});

app.listen(3000);
\`\`\`

> **Interview Highlight**  
> **Q: What happens if you forget to include \`app.use(express.json())\` in a server that accepts POST requests from a React frontend?**  
> A: The React frontend will send a JSON payload in the request body, but Express will not parse it. The \`req.body\` property inside the route handler will be \`undefined\`, causing the server logic to fail or crash if it tries to destructure properties from it.`,
    tryItChallenge: "Build a small Express server with an array of movies. Create a GET route to return all movies, a GET route \`/movies/:id\` to return a specific movie, and a POST route to push a new movie into the array.",
  },
  {
    order: 6,
    title: "Middleware in Express",
    summary: "Understand the middleware pipeline. Learn how to intercept requests, validate data, and build custom middleware functions in Express.",
    content: `## The Middleware Pipeline

In Express, an application is essentially a series of middleware function calls. 

> **Definition: Middleware**  
> Middleware functions are functions that have access to the request object (\`req\`), the response object (\`res\`), and the \`next\` middleware function in the application's request-response cycle.

When a request arrives at your server, it enters the top of the middleware pipeline. It passes through each middleware function one by one. A middleware function can either:
1. End the request (by calling \`res.send()\`, \`res.json()\`, etc.)
2. Pass control to the next middleware in line by calling \`next()\`.

---

## Writing Custom Middleware

Middleware is incredibly useful for logging, authentication, and validation.

\`\`\`javascript
const express = require('express');
const app = express();

// 1. A Custom Logger Middleware
const logger = (req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);
  
  // CRITICAL: If you don't call next(), the request hangs forever!
  next(); 
};

// Apply logger globally to ALL routes
app.use(logger);

// 2. An Authentication Middleware
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (token === 'secret-token') {
    // Inject user data into the request object for downstream routes
    req.user = { id: 1, role: 'admin' };
    next(); 
  } else {
    // End the request early
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// 3. Applying Middleware to Specific Routes
app.get('/dashboard', requireAuth, (req, res) => {
  res.send(\`Welcome to the dashboard, User \${req.user.id}\`);
});
\`\`\`

---

## Types of Middleware

1. **Application-level middleware:** Bound to the \`app\` object using \`app.use()\` or \`app.get()\`.
2. **Router-level middleware:** Bound to an \`express.Router()\` instance.
3. **Error-handling middleware:** Always takes exactly 4 arguments \`(err, req, res, next)\`.
4. **Built-in middleware:** e.g., \`express.json()\`, \`express.static()\`.
5. **Third-party middleware:** e.g., \`cors\`, \`helmet\`, \`morgan\`.

---

## Third-Party Middleware Examples

\`\`\`bash
npm install cors morgan helmet
\`\`\`

\`\`\`javascript
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

// Secures HTTP headers
app.use(helmet()); 

// Allows cross-origin requests from frontends
app.use(cors({ origin: 'http://localhost:3000' })); 

// Beautiful HTTP request logging in the terminal
app.use(morgan('dev')); 
\`\`\`

> **Interview Highlight**  
> **Q: What happens if a middleware function does not call \`next()\` and does not send a response (like \`res.send()\`)?**  
> A: The request will be left hanging. The client (browser or frontend) will sit waiting for a response until it eventually times out. Middleware MUST either end the request or call \`next()\` to pass control.`,
    tryItChallenge: "Create an Express app with a global middleware that calculates how long a request takes to process. (Hint: Record `Date.now()` on `req` before calling `next()`, then calculate the difference in the final route handler).",
  },
  {
    order: 7,
    title: "Building REST APIs & MVC Architecture",
    summary: "Structure a production-ready Express application using the Model-View-Controller (MVC) pattern and Express Routers.",
    content: `## The Problem with a Single File

As your application grows, putting all your routes and logic into \`server.js\` becomes an unmaintainable nightmare. A production API requires a clear, scalable folder structure.

The industry standard for Express applications is the **MVC (Model-View-Controller)** pattern. (Since we are building a REST API, our "Views" are usually JSON payloads sent to a React frontend, rather than HTML).

---

## Production Folder Structure

\`\`\`text
project-root/
├── src/
│   ├── models/        (Database Schemas)
│   ├── controllers/   (Core Business Logic)
│   ├── routes/        (URL Definitions & Routers)
│   ├── middlewares/   (Auth, Error Handling)
│   ├── utils/         (Helper functions)
│   └── server.js      (App Initialization)
└── package.json
\`\`\`

---

## Step 1: The Controller

The Controller handles the core business logic. It receives the request, interacts with the database (Model), and sends the response.

\`\`\`javascript
// src/controllers/userController.js
const users = [{ id: 1, name: 'Alice' }]; // Mock Database

exports.getAllUsers = (req, res) => {
  res.status(200).json({ status: 'success', data: users });
};

exports.createUser = (req, res) => {
  const newUser = { id: Date.now(), name: req.body.name };
  users.push(newUser);
  res.status(201).json({ status: 'success', data: newUser });
};
\`\`\`

---

## Step 2: The Router

The Router binds URLs and HTTP methods to the specific Controller functions. We use \`express.Router()\` to create modular, mountable route handlers.

\`\`\`javascript
// src/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const requireAuth = require('../middlewares/auth');

const router = express.Router();

// Define routes
router.get('/', userController.getAllUsers);

// Protect specific routes with middleware
router.post('/', requireAuth, userController.createUser);

module.exports = router;
\`\`\`

---

## Step 3: Server Initialization

Finally, we import our modular routers into \`server.js\` and mount them to base URL paths.

\`\`\`javascript
// src/server.js
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

app.use(express.json());

// Mount Routers
// Any request to /api/users is handled by userRoutes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));
\`\`\`

> **Interview Highlight**  
> **Q: Why do we separate Routes and Controllers in an Express app?**  
> A: Separation of concerns. Routes should only care about *where* a request is going (the URL and method), and Controllers should only care about *what* to do with that request (the business logic). This makes the code modular, easier to test (you can test controller functions independently without spinning up a server), and easier to scale.`,
    tryItChallenge: "Refactor your single-file Express app into an MVC structure. Create a `/src` folder with `routes/` and `controllers/` directories, and use `express.Router()`.",
  },
  {
    order: 8,
    title: "Working with MongoDB & Mongoose",
    summary: "Connect your Express app to a real database. Learn Mongoose schemas, models, complex queries, and data validation.",
    content: `## Why MongoDB?

MongoDB is a NoSQL, document-oriented database. Unlike SQL databases (PostgreSQL, MySQL) which store data in rigid tables and rows, MongoDB stores data in flexible JSON-like documents. It pairs beautifully with Node.js because the data format is essentially native JavaScript objects.

---

## Introducing Mongoose

While you can use the native MongoDB driver, the industry standard is **Mongoose**. Mongoose is an Object Data Modeling (ODM) library that provides a rigorous modeling environment for your data, enforcing structure, validation, and complex querying.

\`\`\`bash
npm install mongoose
\`\`\`

### 1. Connecting to the Database

\`\`\`javascript
// src/server.js
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/my_database')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ Connection error:', err));
\`\`\`

---

## 2. Defining a Schema and Model

A Schema defines the structure of the document, default values, validators, etc. A Model is a compiled version of the Schema used to interact with the database.

\`\`\`javascript
// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Creates an index for fast lookups
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  age: {
    type: Number,
    min: [18, 'User must be at least 18'],
  }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt
});

const User = mongoose.model('User', userSchema);
module.exports = User;
\`\`\`

---

## 3. Performing CRUD Operations (In Controllers)

Now we can use our \`User\` model inside our Express controllers. Mongoose queries return Promises, so we heavily use \`async/await\`.

\`\`\`javascript
// src/controllers/userController.js
const User = require('../models/User');

// CREATE
exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json({ status: 'success', data: newUser });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// READ (With complex querying)
exports.getUsers = async (req, res) => {
  try {
    // Find users older than 21, sort by name, select only email and name
    const users = await User.find({ age: { $gt: 21 } })
      .sort('name')
      .select('name email');
      
    res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// UPDATE
exports.updateUser = async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Returns the updated document instead of the old one
    runValidators: true // Ensures the update respects the schema rules
  });
  res.status(200).json({ status: 'success', data: updatedUser });
};

// DELETE
exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send(); // 204 No Content
};
\`\`\`

> **Interview Highlight**  
> **Q: What is the purpose of \`runValidators: true\` in Mongoose updates?**  
> A: By default, Mongoose only runs schema validations (like \`required\`, \`min\`, \`max\`, \`enum\`) when saving a *new* document. When performing an update via \`findByIdAndUpdate\`, validations are bypassed unless you explicitly pass \`{ runValidators: true }\`. Failing to do this can allow invalid data into your database.`,
    tryItChallenge: "Create a `Product` model with Mongoose containing title, price, and category. Write a controller function to retrieve all products where price is less than $50.",
  },
  {
    order: 9,
    title: "Authentication & Authorization",
    summary: "Secure your API. Hash passwords securely with bcrypt and generate JSON Web Tokens (JWT) for stateless authentication.",
    content: `## Authentication vs Authorization

- **Authentication:** Verifying *who* a user is (e.g., Logging in with an email and password).
- **Authorization:** Verifying *what* a user is allowed to do (e.g., Only Admins can delete users).

---

## 1. Password Hashing with bcrypt

**NEVER store plaintext passwords in your database.** If your database is compromised, the attackers will have everyone's passwords. We must hash passwords. Hashing is a one-way mathematical function.

\`\`\`bash
npm install bcrypt
\`\`\`

We can use Mongoose "pre-save" middleware to automatically hash the password before it is saved to the database.

\`\`\`javascript
// src/models/User.js
const bcrypt = require('bcrypt');

userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Hash the password with a salt round of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// A method to compare incoming password against hashed password
userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
\`\`\`

---

## 2. JSON Web Tokens (JWT)

Because REST APIs are stateless, the server does not remember who you are between requests. To solve this, upon successful login, the server gives the client a JWT. The client sends this token back to the server in the \`Authorization\` header of every subsequent request.

\`\`\`bash
npm install jsonwebtoken
\`\`\`

### Login Controller

\`\`\`javascript
// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Check if user exists
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
  // 2. Check if password is correct
  const isCorrect = await user.comparePassword(password, user.password);
  if (!isCorrect) return res.status(401).json({ error: 'Invalid credentials' });
  
  // 3. Generate JWT
  // Sign the token with the user's ID and a secret string
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d' // Token expires in 7 days
  });
  
  res.status(200).json({ status: 'success', token });
};
\`\`\`

---

## 3. Protecting Routes (Authorization Middleware)

Now that the client has a token, they must send it to access protected routes. We build a middleware to intercept the request and verify the token.

\`\`\`javascript
// src/middlewares/protect.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    // 1. Get token from headers
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ error: 'You are not logged in!' });
    }
    
    // 2. Verify token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Find the user based on decoded ID
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ error: 'The user belonging to this token no longer exists.' });
    }
    
    // 4. Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token. Please log in again.' });
  }
};
\`\`\`

Apply it to a router:
\`\`\`javascript
router.get('/profile', protect, userController.getProfile);
\`\`\`

> **Interview Highlight**  
> **Q: What is the difference between Hashing and Encryption?**  
> A: Hashing is a *one-way* process. Once a password is hashed (like with bcrypt), it cannot be reversed back to the original text. You authenticate by hashing the incoming guess and comparing the hashes. Encryption is a *two-way* process (like AES). Data is scrambled using a key, and can be unscrambled back to the original text using the same key. Passwords must be hashed, never encrypted.`,
    tryItChallenge: "Implement a signup route that hashes the user's password using Mongoose pre-save hooks, and returns a signed JWT upon successful registration.",
  },
  {
    order: 10,
    title: "Error Handling & Validation",
    summary: "Stop your server from crashing. Learn to implement centralized error handling middleware and robust input validation.",
    content: `## The Node.js Unhandled Promise Rejection Crash

If a promise is rejected (or an error is thrown) in an asynchronous function and you do not \`catch\` it, Node.js will terminate the entire process, crashing your server.

Handling errors manually in every single controller using \`try...catch\` is repetitive and error-prone.

---

## 1. Global Error Handling Middleware

Express has a special type of middleware for handling errors globally. It is defined with exactly 4 parameters: \`(err, req, res, next)\`.

It MUST be the very last middleware you define in your \`server.js\` file, after all other routes.

\`\`\`javascript
// src/server.js

// ... all your routes (app.use('/api', routes))

// Global Error Handler
app.use((err, req, res, next) => {
  // Give the error a default status code and message
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  console.error('🔥 ERROR:', err.message);

  res.status(err.statusCode).json({
    status: 'error',
    message: err.message,
    // Only send the stack trace in development mode!
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});
\`\`\`

---

## 2. Catching Async Errors Automatically

To pass errors from an async controller to our global error handler, we normally have to wrap the code in a \`try...catch\` and call \`next(error)\`.

\`\`\`javascript
// The repetitive way
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new Error('User not found'));
    res.json({ data: user });
  } catch (error) {
    next(error); // Passes to global error handler
  }
};
\`\`\`

We can eliminate the \`try...catch\` completely by using an async wrapper utility function:

\`\`\`javascript
// src/utils/catchAsync.js
module.exports = (fn) => {
  return (req, res, next) => {
    // If the promise rejects, catch it and pass to the global error handler
    fn(req, res, next).catch(next); 
  };
};
\`\`\`

Now our controllers look incredibly clean:

\`\`\`javascript
// src/controllers/userController.js
const catchAsync = require('../utils/catchAsync');

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    return next(error);
  }
  
  res.json({ data: user });
});
\`\`\`

*(Note: Express 5.0 will handle async errors automatically without needing the wrapper, but most codebases still run Express 4.x).*

---

## 3. Input Validation

Never trust data from the client. While Mongoose provides validation at the database level, it's better to reject bad data at the route level *before* it even hits the controller.

We use a library like **Joi** or **Zod** for this.

\`\`\`bash
npm install joi
\`\`\`

\`\`\`javascript
// src/middlewares/validate.js
const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
  email: Joi.string().email().required()
});

exports.validateRegistration = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  
  if (error) {
    const errorMsg = error.details[0].message;
    // Send a 400 Bad Request
    return res.status(400).json({ status: 'error', message: errorMsg }); 
  }
  
  next(); // Data is valid, proceed to controller
};
\`\`\`

Apply it to your router:
\`\`\`javascript
router.post('/register', validateRegistration, authController.register);
\`\`\`

> **Interview Highlight**  
> **Q: Why shouldn't we just rely on Mongoose schema validation instead of using Joi/Zod?**  
> A: Mongoose validation happens at the very end of the request cycle, right before database insertion. By validating earlier in the middleware pipeline with Joi/Zod, you fail fast, saving server resources and preventing complex business logic from executing on bad data.`,
    tryItChallenge: "Create a global error handling middleware in your Express app. Then, create an async controller that intentionally throws an error, and use the `catchAsync` wrapper to ensure it reaches your global error handler without crashing the server.",
  },
  {
    order: 11,
    title: "Security Best Practices",
    summary: "Lock down your Node.js server against common web vulnerabilities like XSS, CSRF, SQL Injection, NoSQL Injection, and brute force attacks.",
    content: `## The Responsibility of the Backend

Frontend security (like preventing XSS in React) is important, but a malicious user can bypass the frontend entirely using Postman or cURL to hit your API directly. Therefore, **the backend is the absolute source of truth for security.**

---

## 1. Rate Limiting (Preventing Brute Force & DDoS)

If you have a \`/login\` route, a hacker could write a script to guess 10,000 passwords a second. You must restrict how often a single IP address can hit your API.

\`\`\`bash
npm install express-rate-limit
\`\`\`

\`\`\`javascript
const rateLimit = require('express-rate-limit');

// Allow a maximum of 100 requests per IP every 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again in 15 minutes.'
});

// Apply to all routes
app.use('/api', limiter);
\`\`\`

---

## 2. HTTP Security Headers with Helmet

Browsers respect certain HTTP headers (like \`Strict-Transport-Security\`, \`X-Frame-Options\`, etc.) that tell the browser how to behave securely. **Helmet** automatically sets 14 of these critical headers for you.

\`\`\`bash
npm install helmet
\`\`\`

\`\`\`javascript
const helmet = require('helmet');

// Put this at the very top of your middleware stack!
app.use(helmet()); 
\`\`\`

---

## 3. Data Sanitization (Preventing Injection)

Hackers will try to send malicious code in the request body or query string.

### NoSQL Injection
In MongoDB, a hacker could send an object instead of a string. Imagine this login query:
\`\`\`javascript
// req.body = { email: { "$gt": "" }, password: "password" }
User.findOne({ email: req.body.email, password: req.body.password })
\`\`\`
Because \`$gt: ""\` means "greater than an empty string", this will return the very first user in the database, allowing the hacker to log in without knowing an email!

**Solution:** Use \`express-mongo-sanitize\`. It removes all keys containing \`$\` or \`.\`.
\`\`\`bash
npm install express-mongo-sanitize
\`\`\`
\`\`\`javascript
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());
\`\`\`

### Cross-Site Scripting (XSS)
Hackers might send HTML with malicious \`<script>\` tags to your database. When another user views that data, the script executes in their browser.

**Solution:** Use \`xss-clean\` to strip HTML tags from user input.
\`\`\`bash
npm install xss-clean
\`\`\`
\`\`\`javascript
const xss = require('xss-clean');
app.use(xss());
\`\`\`

> **Interview Highlight**  
> **Q: What is CORS, and does it secure your backend?**  
> A: CORS (Cross-Origin Resource Sharing) is a security feature implemented by **browsers**, not servers. It prevents a malicious website (e.g., hacker.com) from making AJAX requests to your API (e.g., api.yoursite.com) on behalf of a logged-in user. However, CORS does **not** stop server-to-server requests or Postman requests, so it is not a replacement for proper backend authentication.`,
    tryItChallenge: "Install and configure `helmet`, `express-rate-limit`, and `express-mongo-sanitize` globally on your Express app.",
  },
  {
    order: 12,
    title: "File Uploads (Multer & Cloud Storage)",
    summary: "Handle multipart/form-data efficiently to accept user file uploads. Stream files directly to cloud storage like AWS S3 or Cloudinary.",
    content: `## The Problem with File Uploads

When a user submits a form with a file (like an avatar image), the browser encodes the payload as \`multipart/form-data\`. The standard \`express.json()\` middleware cannot parse this. We need a specific middleware for files.

---

## Using Multer

**Multer** is the standard middleware for handling \`multipart/form-data\` in Node.js.

\`\`\`bash
npm install multer
\`\`\`

### 1. Saving to the Local Disk

\`\`\`javascript
const multer = require('multer');
const path = require('path');

// Configure where and how to save the file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/avatars'); // Directory must exist!
  },
  filename: (req, file, cb) => {
    // Generate a unique filename: user-123-timestamp.jpg
    const ext = path.extname(file.originalname);
    cb(null, \`user-\${req.user.id}-\${Date.now()}\${ext}\`);
  }
});

// Filter to only allow images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Apply to route
// 'avatar' must match the 'name' attribute in the HTML form input
router.post('/updateAvatar', upload.single('avatar'), (req, res) => {
  // req.file contains information about the uploaded file
  res.json({ status: 'success', file: req.file });
});
\`\`\`

---

## 2. The Cloud Storage Architecture

Saving files to the local disk is fine for a side project, but terrible for production. 
If you deploy to a serverless platform (like Vercel) or a containerized environment (like Docker/Kubernetes), local files are wiped out every time the server restarts or scales horizontally.

**Production Architecture:**
1. The user uploads a file.
2. Multer stores the file in **Memory** (RAM) as a Buffer, *not* on the disk.
3. You immediately stream that Buffer to a cloud provider like Amazon S3, Cloudinary, or Google Cloud Storage.
4. The cloud provider returns a public URL.
5. You save that public URL in your MongoDB database.

\`\`\`javascript
// Storing in memory instead of disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('photo'), async (req, res) => {
  // req.file.buffer contains the raw binary data.
  // Send this buffer directly to AWS S3!
  const s3Url = await uploadToAWS(req.file.buffer, req.file.originalname);
  
  await User.findByIdAndUpdate(req.user.id, { photo: s3Url });
  res.json({ url: s3Url });
});
\`\`\`

> **Interview Highlight**  
> **Q: Why is saving uploaded files locally to the server's filesystem a bad practice in modern cloud deployments?**  
> A: Modern apps are usually deployed ephemerally (containers or serverless functions). If you spin up 5 server instances to handle traffic, an image saved to Server A's local disk will not be accessible to users hitting Server B. Files must be stored centrally in an object store like AWS S3.`,
    tryItChallenge: "Create a route that accepts a file upload using Multer's `memoryStorage`. Log `req.file.buffer.length` to see the exact byte size of the file held in RAM.",
  },
  {
    order: 13,
    title: "WebSockets Part 1: The Limitations of HTTP & Native WebSockets",
    summary: "Understand the stateless nature of HTTP, why polling is inefficient, and how WebSockets provide persistent, bidirectional communication.",
    content: `## The Limitation of HTTP

The HTTP protocol is unidirectional and stateless. The client must make a request, and the server sends a response. The server **cannot** initiate contact with the client.

If you are building a chat app, you need the server to instantly push a message to the client the millisecond it arrives.

---

## Polling vs WebSockets

Before WebSockets, developers used **Polling**. 
- **Short Polling:** The client sends an HTTP request every 3 seconds asking, "Do I have new messages?". This destroys server resources because 99% of requests return empty.
- **Long Polling:** The client asks for a message. The server holds the request open until a message arrives, then sends the response. The client immediately opens a new request. Better, but still incurs HTTP overhead (headers, cookies) on every message.

---

## What is a WebSocket?

WebSocket is a persistent, bidirectional communication protocol. 
1. The client sends a standard HTTP request with an \`Upgrade: websocket\` header.
2. The server responds with a \`101 Switching Protocols\` status.
3. The HTTP connection is replaced by a single TCP connection that is kept open indefinitely.
Both parties can push data to each other instantly with virtually no overhead.

### Native WebSockets in Node.js

Node.js does not have a built-in WebSocket module, but the \`ws\` package is the closest to the raw protocol.

\`\`\`bash
npm install ws
\`\`\`

\`\`\`javascript
const { WebSocketServer } = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
  res.end("This is the HTTP server");
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('New client connected!');

  ws.on('message', (message) => {
    console.log('Received: %s', message);
    ws.send(\`Server echoes: \${message}\`);
  });

  ws.on('close', () => console.log('Client disconnected'));
});

server.listen(8080, () => console.log('Listening on 8080'));
\`\`\`

> **Interview Highlight**  
> **Q: What is the difference between WebSockets and Server-Sent Events (SSE)?**  
> A: WebSockets are **bidirectional** (client and server can both send and receive data). Server-Sent Events are **unidirectional** over HTTP; the client connects, and the server continuously streams data *to* the client (like a live news ticker or stock price). SSE cannot be used for the client to send data back.`,
    tryItChallenge: "Build a raw WebSocket server using the `ws` package. Connect to it from a basic HTML file using the browser's native `const ws = new WebSocket('ws://localhost:8080')` API.",
  },
  {
    order: 14,
    title: "WebSockets Part 2: Socket.io Fundamentals",
    summary: "Move from raw WebSockets to Socket.io. Learn how to handle reconnects, namespaces, rooms, and easily broadcast messages.",
    content: `## Why use Socket.io?

While native WebSockets are fast, they lack essential features for production apps:
1. **No Fallback:** If a user is on an older corporate network that blocks the WebSocket port, the connection fails. Socket.io automatically falls back to HTTP Long-Polling.
2. **No Auto-Reconnect:** If the Wi-Fi drops, native WebSockets die. Socket.io will automatically try to reconnect exponentially.
3. **No Broadcasting/Rooms:** Native WebSockets require you to manually loop over all connected clients to send a message.

---

## Setting up Socket.io with Express

Socket.io attaches to the raw Node.js \`http\` server, not the Express app directly. You must manually create the HTTP server.

\`\`\`bash
npm install socket.io
\`\`\`

\`\`\`javascript
// server.js
const express = require('express');
const http = require('http'); // Node core module
const { Server } = require('socket.io');

const app = express();

// 1. Create the raw HTTP server using the Express app
const server = http.createServer(app);

// 2. Attach Socket.io to the server
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

// 3. Listen for connections
io.on('connection', (socket) => {
  console.log('A user connected! ID:', socket.id);

  // Listen for a custom event from the client
  socket.on('sendMessage', (data) => {
    
    // BROADCAST to EVERYONE EXCEPT the sender:
    socket.broadcast.emit('receiveMessage', data);
    
    // BROADCAST to EVERYONE INCLUDING the sender:
    // io.emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// CRITICAL: Call server.listen, NOT app.listen!
server.listen(4000, () => {
  console.log('WebSocket Server running on port 4000');
});
\`\`\`

---

## Namespaces and Rooms

Socket.io allows you to segment users so you aren't blasting every message to every single connected user.

- **Namespaces:** Like different API endpoints. (e.g., \`/chat\`, \`/notifications\`). Handled by different TCP connections.
- **Rooms:** Temporary channels within a namespace (e.g., \`room-123\`). Handled by the same TCP connection.

\`\`\`javascript
io.on('connection', (socket) => {
  
  // User wants to join a specific chat room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(\`User \${socket.id} joined room \${roomId}\`);
  });

  // Send a message ONLY to people in that room
  socket.on('chatToRoom', ({ roomId, message }) => {
    io.to(roomId).emit('newMessage', message);
  });
  
});
\`\`\`

> **Interview Highlight**  
> **Q: Does calling \`socket.join('room1')\` create the room in a database?**  
> A: No, Socket.io rooms exist purely in the RAM of the Node.js server. If the server restarts, all rooms and connections are immediately lost.`,
    tryItChallenge: "Build a simple backend that emits a 'ping' event to all connected clients every 5 seconds using `setInterval` inside the `io.on('connection')` block.",
  },
  {
    order: 15,
    title: "WebSockets Part 3: Scaling & Securing Socket.io",
    summary: "Prepare your WebSockets for production. Learn how to authenticate connections and use Redis Pub/Sub to scale horizontally.",
    content: `## Authenticating WebSockets

Unlike HTTP requests where you can pass a JWT in the \`Authorization\` header of every request, WebSockets are a single persistent connection. You should authenticate the user *during the initial handshake*.

Socket.io provides middlewares for this:

\`\`\`javascript
const jwt = require('jsonwebtoken');

io.use((socket, next) => {
  // Clients pass the token when connecting: 
  // const socket = io('url', { auth: { token: 'jwt-here' } });
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error'));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    
    // Attach user data to the socket for later use
    socket.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  console.log(\`Authenticated user \${socket.user.id} connected.\`);
});
\`\`\`

---

## The Horizontal Scaling Problem

Node.js is single-threaded. To handle 100,000 concurrent users, you will deploy your app to multiple server instances (e.g., Server A, Server B, Server C) behind a Load Balancer.

**The Problem:**
1. User 1 connects to **Server A**.
2. User 2 connects to **Server B**.
3. User 1 sends a chat message to User 2.
4. Server A receives the message and calls \`io.emit()\`.
5. Only users connected to Server A get the message. User 2 never sees it, because Server A does not know Server B exists!

---

## The Solution: Redis Pub/Sub Adapter

To fix this, we introduce **Redis**, an in-memory database that acts as a central message broker.

1. When Server A calls \`io.emit()\`, it publishes the message to Redis.
2. Redis broadcasts the message to Server B and Server C.
3. Servers B and C then push the message to their respective connected clients.

\`\`\`bash
npm install @socket.io/redis-adapter redis
\`\`\`

\`\`\`javascript
const { Server } = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

const io = new Server(server);

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  console.log("Redis Adapter Connected!");
});
\`\`\`

> **Interview Highlight**  
> **Q: What is "Sticky Sessions", and why does Socket.io need it?**  
> A: If Socket.io falls back to HTTP Long-Polling (because WebSockets are blocked), it makes multiple HTTP requests. If a Load Balancer sends Request 1 to Server A, and Request 2 to Server B, the handshake fails because Server B doesn't know about Request 1. "Sticky Sessions" configure the Load Balancer to ensure a specific user's IP always routes to the *same* server during their session.`,
    tryItChallenge: "Implement Socket.io middleware to verify a JWT during the handshake. Reject the connection if the token is missing or invalid.",
  },
  {
    order: 16,
    title: "Testing Node.js Applications",
    summary: "Ensure your API is unbreakable. Write unit tests with Jest and automated integration tests for your Express routes using Supertest.",
    content: `## Why Automated Testing?

In production, you cannot manually open Postman and test every single endpoint, error state, and validation rule after adding a new feature. Automated tests run your code and verify the outputs programmatically.

---

## 1. Unit Testing with Jest

**Unit tests** focus on testing isolated pieces of logic (like a utility function or a single controller) independently of the database or network.

\`\`\`bash
npm install --save-dev jest
\`\`\`

\`\`\`javascript
// src/utils/math.js
exports.add = (a, b) => a + b;

// __tests__/math.test.js
const { add } = require('../src/utils/math');

describe('Math Utility', () => {
  it('should correctly add two numbers', () => {
    const result = add(2, 3);
    expect(result).toBe(5);
  });
  
  it('should handle negative numbers', () => {
    expect(add(-1, -1)).toBe(-2);
  });
});
\`\`\`

Run \`npx jest\` to execute the tests.

---

## 2. Integration Testing with Supertest

**Integration tests** test how the entire system works together. Instead of testing a single function, we simulate an HTTP request to an Express route and verify the status code, JSON response, and database state.

**Supertest** allows us to test Express routes without actually opening a port or starting the server.

\`\`\`bash
npm install --save-dev supertest
\`\`\`

\`\`\`javascript
// __tests__/userRoutes.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app'); // Export app BEFORE calling app.listen()
const User = require('../src/models/User');

describe('User API Endpoints', () => {
  
  // Run before any tests execute
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/test_database');
  });
  
  // Clean up after tests finish
  afterAll(async () => {
    await User.deleteMany(); // Clear the test DB
    await mongoose.connection.close();
  });

  it('should create a new user successfully', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      
    // Assertions
    expect(res.statusCode).toEqual(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.name).toBe('Test User');
    
    // Verify it was actually saved in the DB
    const userInDb = await User.findOne({ email: 'test@example.com' });
    expect(userInDb).toBeTruthy();
  });

  it('should reject a user without an email (400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'No Email User' });
      
    expect(res.statusCode).toEqual(400);
  });
});
\`\`\`

> **Interview Highlight**  
> **Q: Why is it important to use a separate database (like \`test_database\`) when running integration tests?**  
> A: Integration tests often delete, modify, and insert data aggressively to ensure a clean state (\`User.deleteMany()\`). If you run tests against your development or production database, you will destroy real data. Furthermore, tests need a predictable, isolated environment to avoid flaky results.`,
    tryItChallenge: "Install Jest and Supertest. Write a test that sends a GET request to `/api/health` and expects a `200 OK` status and a `{ status: 'UP' }` JSON response.",
  },
  {
    order: 17,
    title: "Production Deployment & PM2",
    summary: "Take your API live. Learn how to manage environment variables, use PM2 for process management and clustering, and Dockerize your Node app.",
    content: `## The Production Mindset

Running \`node server.js\` is fine for development. But in production, if your app crashes (e.g., an unhandled exception), the server will go down and stay down. 

You need a **Process Manager** to automatically restart the app on failure, and to utilize all CPU cores.

---

## 1. Process Management with PM2

PM2 is a production process manager for Node.js. It runs your app in the background, monitors its health, and restarts it if it crashes.

\`\`\`bash
npm install -g pm2
\`\`\`

Start your app:
\`\`\`bash
pm2 start server.js --name "my-api"
\`\`\`

### Clustering with PM2
Node.js is single-threaded. If you deploy your app to a server with an 8-core CPU, Node.js will only use 1 core, wasting 87% of your server's computing power.

PM2 can automatically spawn multiple instances of your app (one for each CPU core) and load-balance incoming traffic between them.

\`\`\`bash
# Start an instance for every CPU core available (Clustering)
pm2 start server.js -i max
\`\`\`

Useful PM2 Commands:
\`\`\`bash
pm2 list       # View all running apps
pm2 logs       # View real-time logs
pm2 monit      # View a dashboard of CPU and Memory usage
pm2 restart 0  # Restart app ID 0
\`\`\`

---

## 2. Environment Variables

Never hardcode secrets (database passwords, API keys, JWT secrets) in your source code. Use environment variables.

In development, we use the \`dotenv\` package to load variables from a \`.env\` file.

\`\`\`bash
npm install dotenv
\`\`\`

\`\`\`javascript
// server.js - VERY TOP OF FILE
require('dotenv').config();

console.log(process.env.DATABASE_URL);
console.log(process.env.PORT);
\`\`\`

**CRITICAL:** Ensure \`.env\` is added to your \`.gitignore\` file so it is never pushed to GitHub!

---

## 3. Dockerizing a Node.js App

Docker allows you to package your app, its dependencies, and the Node.js runtime into a single "Container". This guarantees that if it works on your machine, it will work exactly the same way on any server in the world.

Create a \`Dockerfile\` in your project root:

\`\`\`dockerfile
# 1. Use the official Node.js Alpine image (Very small footprint)
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package.json and install dependencies FIRST (Caches this step)
COPY package*.json ./
RUN npm install --production

# 4. Copy the rest of the application code
COPY . .

# 5. Expose the port your app runs on
EXPOSE 3000

# 6. Define the command to start the app
CMD ["node", "src/server.js"]
\`\`\`

To build and run:
\`\`\`bash
docker build -t my-node-api .
docker run -p 3000:3000 my-node-api
\`\`\`

> **Interview Highlight**  
> **Q: In the Dockerfile, why do we copy \`package.json\` and run \`npm install\` BEFORE copying the rest of our source code?**  
> A: Docker builds images in layers and caches each layer. Your dependencies (\`node_modules\`) rarely change, but your source code changes constantly. By doing \`npm install\` first, Docker caches that layer. On subsequent builds, it instantly skips the install step, making builds take seconds instead of minutes.`,
    tryItChallenge: "Install PM2 globally. Start your Express app in cluster mode (`pm2 start server.js -i max`). Open `pm2 monit` and blast your API with requests to see the load balancer distribute traffic across CPU cores.",
  }
];

// ─── MAIN SEEDER ─────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Starting Node.js/Express Course Seeder Phase 1...\n");

  const token = await login();

  console.log("🧹 Cleaning up existing Node.js courses...");
  await deleteExistingCourses(token);

  console.log("📚 Creating Node.js course...");
  const course = await createCourse(token, {
    title: "Node.js & Express: Zero to Production",
    subtitle:
      "Master backend development. Learn the V8 engine, the Event Loop, asynchronous programming, Express.js architecture, MongoDB, authentication, security, and production deployment.",
    techId: "nodejs",
    level: "Beginner - Advanced",
    duration: "Self-paced",
    order: 3,
    status: "published",
    learningOutcomes: [
      "Understand the underlying architecture of Node.js, V8, and libuv",
      "Master the Event Loop and write truly non-blocking asynchronous code",
      "Handle massive files efficiently using Node.js Streams and Buffers",
      "Build robust RESTful APIs using Express.js and MVC architecture",
      "Perform CRUD operations and complex aggregations using MongoDB and Mongoose",
      "Implement secure JWT authentication and password hashing with bcrypt",
      "Protect servers from XSS, SQL Injection, and DDoS using Helmet and Rate Limiting",
      "Handle file uploads using Multer and cloud storage",
      "Integrate WebSockets via Socket.io for real-time bidirectional communication",
      "Deploy Node.js applications using PM2 and Docker",
    ],
  });

  const courseId = course._id || course.id;
  console.log(`✅ Course created! ID: ${courseId}\n`);

  console.log(`📖 Creating ${chapters.length} chapters...\n`);

  for (const chapter of chapters) {
    const created = await createChapter(token, courseId, chapter);
    if (created) {
      console.log(`  Chapter ${chapter.order}: ${chapter.title}... ✅`);
    } else {
      console.log(`  Chapter ${chapter.order}: ${chapter.title}... ❌ FAILED`);
    }
  }

  console.log("\n🎉 Phase 1 Seeded successfully!");
}

main().catch(console.error);
