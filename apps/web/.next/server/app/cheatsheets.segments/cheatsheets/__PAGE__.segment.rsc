1:"$Sreact.fragment"
2:I[157055,["/_next/static/chunks/c52cab6af67149c0.js","/_next/static/chunks/76bb494497c38c9d.js","/_next/static/chunks/40d4b3614d251687.js","/_next/static/chunks/6bce6decda6efd99.js","/_next/static/chunks/584c75e32d53fe63.js","/_next/static/chunks/0f56e7a8a2bda9d0.js","/_next/static/chunks/d13394179fccb2f4.js","/_next/static/chunks/8fe4610e47ad0dc0.js","/_next/static/chunks/ad00a6f6a722481c.js","/_next/static/chunks/a4e58bce18a960b0.js","/_next/static/chunks/f5dc118ecf18bb8c.js"],"default"]
3:I[686245,["/_next/static/chunks/c52cab6af67149c0.js","/_next/static/chunks/76bb494497c38c9d.js","/_next/static/chunks/40d4b3614d251687.js","/_next/static/chunks/6bce6decda6efd99.js","/_next/static/chunks/584c75e32d53fe63.js","/_next/static/chunks/0f56e7a8a2bda9d0.js","/_next/static/chunks/d13394179fccb2f4.js","/_next/static/chunks/8fe4610e47ad0dc0.js","/_next/static/chunks/ad00a6f6a722481c.js","/_next/static/chunks/a4e58bce18a960b0.js","/_next/static/chunks/f5dc118ecf18bb8c.js"],"default"]
b:I[305083,["/_next/static/chunks/c52cab6af67149c0.js","/_next/static/chunks/76bb494497c38c9d.js","/_next/static/chunks/40d4b3614d251687.js","/_next/static/chunks/6bce6decda6efd99.js","/_next/static/chunks/584c75e32d53fe63.js","/_next/static/chunks/0f56e7a8a2bda9d0.js","/_next/static/chunks/d13394179fccb2f4.js","/_next/static/chunks/8fe4610e47ad0dc0.js","/_next/static/chunks/ad00a6f6a722481c.js","/_next/static/chunks/a4e58bce18a960b0.js","/_next/static/chunks/f5dc118ecf18bb8c.js"],"default"]
c:I[897367,["/_next/static/chunks/d96012bcfc98706a.js","/_next/static/chunks/73e3194f06db260e.js"],"OutletBoundary"]
d:"$Sreact.suspense"
4:T254a,> Quick reference guide for coding and interview prep. Keep it handy for rapid syntax recall.

## Document Boilerplate

The essential structure of an HTML5 document.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document Title</title>
</head>
<body>
  <!-- Content goes here -->
</body>
</html>

```

## Text Elements

* `<h1>` to `<h6>`: Headings (1 is largest, 6 is smallest)
* `<p>`: Paragraph
* `<span>`: Inline container for styling
* `<div>`: Block-level container
* `<br>`: Line break
* `<hr>`: Thematic break (horizontal line)

### Formatting

* `<strong>`: **Bold** (semantic importance)
* `<b>`: **Bold** (visual only)
* `<em>`: *Italic* (semantic emphasis)
* `<i>`: *Italic* (visual only)
* `<mark>`: Highlighted text
* `<del>`: Strikethrough (deleted text)

## Links & Images

### Links

```html
<a href="[https://example.com](https://example.com)" target="_blank">External Link</a>
<a href="#section">Jump to Section</a>
<a href="mailto:email@example.com">Send Email</a>

```

* `target="_blank"`: Opens link in a new tab.

### Images

```html
<img src="image.jpg" alt="Description for screen readers" loading="lazy">

```

* `alt`: Mandatory for accessibility.
* `loading="lazy"`: Defers loading until the image is in the viewport.

## Lists

### Unordered List

```html
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

```

### Ordered List

```html
<ol type="1">
  <li>First item</li>
  <li>Second item</li>
</ol>

```

### Description List

```html
<dl>
  <dt>Term</dt>
  <dd>Definition of the term</dd>
</dl>

```

## Tables

Basic table structure with a header and body.

```html
<table>
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Row 1, Cell 1</td>
      <td>Row 1, Cell 2</td>
    </tr>
  </tbody>
</table>

```



## Forms & Inputs

```html
<form action="/submit" method="POST">
  <label for="username">Username:</label>
  <input type="text" id="username" name="username" required>
  
  <button type="submit">Submit</button>
</form>

```

### Common Input Types

* `<input type="text">`: Standard text field
* `<input type="password">`: Obscured text
* `<input type="email">`: Validates email format
* `<input type="number">`: Numeric input
* `<input type="checkbox">`: Multiple selection
* `<input type="radio">`: Single selection (same `name` attribute groups them)

### Select Dropdown

```html
<select name="options" id="options">
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>

```

## Semantic HTML5

Improves SEO and accessibility by describing the meaning of the content.

* `<header>`: Introductory content or navigation links
* `<nav>`: Navigation menu
* `<main>`: Primary content of the document
* `<article>`: Independent, self-contained content (e.g., blog post)
* `<section>`: Thematic grouping of content
* `<aside>`: Sidebar or secondary content
* `<footer>`: Footer for a section or document

## Media

### Audio

```html
<audio controls>
  <source src="audio.mp3" type="audio/mpeg">
</audio>

```

### Video

```html
<video width="320" height="240" controls>
  <source src="video.mp4" type="video/mp4">
</video>

```

## Head Element & Metadata

Important tags placed inside the `<head>`.

```html
<!-- Link to external CSS -->
<link rel="stylesheet" href="styles.css">

<!-- Link to favicon -->
<link rel="icon" href="favicon.ico" type="image/x-icon">

<!-- Embed internal script -->
<script src="script.js" defer></script>

```

## Part two: the Advanced & Interview-Prep HTML5 Cheatsheet

## Global Attributes

Attributes that can be added to almost any HTML element.

- `id="my-id"`: Unique identifier for an element (highest CSS specificity).
- `class="my-class"`: Reusable identifier for multiple elements.
- `style="color: red;"`: Inline CSS styling.
- `title="tooltip text"`: Extra information shown on hover.
- `data-*="value"`: Custom data attributes used to store data for JavaScript.
- `hidden`: Hides the element from the page.
- `tabindex="0"`: Controls keyboard navigation/focus order.
- `contenteditable="true"`: Makes the element text editable by the user.

## Advanced Form Elements

### Datalist (Autocomplete)
Provides an autocomplete dropdown for a text input.

```html
<label for="browser">Choose a browser:</label>
<input list="browsers" id="browser" name="browser">

<datalist id="browsers">
  <option value="Chrome">
  <option value="Firefox">
  <option value="Safari">
</datalist>

```

### Key Input Attributes

* `placeholder="text"`: Hint text inside an empty input.
* `disabled`: Disables the input (value not sent on submit).
* `readonly`: Makes input uneditable (value *is* sent on submit).
* `min="1" max="10"`: Number ranges.
* `pattern="[A-Za-z]+"`: Regex validation.

## Interactive Elements (No JS Required)

### Details & Summary (Accordion)

Creates a native, expandable widget.

```html
<details>
  <summary>Click to expand</summary>
  <p>This content is hidden by default.</p>
</details>

```

### Dialog (Modal)

Creates a native popup/modal dialog. (Needs JS to open/close via `.showModal()`).

```html
<dialog id="myModal">
  <h2>Modal Title</h2>
  <p>Modal content goes here.</p>
  <form method="dialog">
    <button>Close</button>
  </form>
</dialog>

```

## Responsive Images & Embedding

### Picture Element (Art Direction)

Serves different images based on screen size.

```html
<picture>
  <source media="(min-width: 800px)" srcset="large.jpg">
  <source media="(min-width: 400px)" srcset="medium.jpg">
  <img src="small.jpg" alt="Responsive image fallback">
</picture>

```

### Iframe

Embeds another HTML page (like YouTube videos or maps) into the current page.

```html
<iframe src="[https://example.com](https://example.com)" width="500" height="400" title="Example site"></iframe>

```

## Graphics (Canvas & SVG)

### Canvas

A container for rendering 2D/3D graphics via JavaScript.

```html
<canvas id="myCanvas" width="200" height="100"></canvas>

```

### SVG (Scalable Vector Graphics)

XML-based vector images directly in HTML. Scales without losing quality.

```html
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
</svg>

```

## Advanced Tables

Using `thead`, `tbody`, and `tfoot` properly, plus column grouping.

```html
<table>
  <caption>Monthly Savings</caption>
  <colgroup>
    <col span="2" style="background-color: lightgrey">
  </colgroup>
  <thead>
    <tr>
      <th>Month</th>
      <th>Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>January</td>
      <td>$100</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td>Total</td>
      <td>$100</td>
    </tr>
  </tfoot>
</table>

```
Here is the final, essential section. It covers **Security, Performance, and Accessibility (A11y)**—topics that separate junior developers from mid/senior developers in interviews.

```markdown
## Web Security & Best Practices

### Secure External Links
When using `target="_blank"`, always add `rel="noopener noreferrer"`. This prevents the new tab from maliciously accessing the original page via the `window.opener` object (a classic interview gotcha).

```html
<a href="[https://example.com](https://example.com)" target="_blank" rel="noopener noreferrer">Secure Link</a>

```

## Script Loading Strategies

A very common interview question: understanding how JavaScript blocks HTML parsing.

* **Standard (`<script>`)**: HTML parsing pauses while the script downloads and executes.
* **Async (`<script async>`)**: Downloads in the background, but pauses HTML parsing to execute as soon as it's ready. Execution order is *not* guaranteed. (Best for analytics/tracking).
* **Defer (`<script defer>`)**: Downloads in the background and executes only *after* HTML parsing is complete. Execution order *is* guaranteed. (Best for DOM manipulation).

```html
<!-- Usually placed in the <head> -->
<script src="analytics.js" async></script>
<script src="main.js" defer></script>

```

## SEO & Open Graph Meta Tags

Essential tags placed in the `<head>` for search engine ranking and social media link previews (Facebook, LinkedIn, Twitter/X).

```html
<!-- SEO Description -->
<meta name="description" content="A brief, 150-character summary for search engines.">

<!-- Open Graph (Social Media Previews) -->
<meta property="og:title" content="My Page Title">
<meta property="og:description" content="Description for the preview card.">
<meta property="og:image" content="[https://example.com/thumbnail.jpg](https://example.com/thumbnail.jpg)">
<meta property="og:url" content="[https://example.com](https://example.com)">

```

## Basic Accessibility (ARIA)

Semantic HTML should be your first choice, but ARIA (Accessible Rich Internet Applications) attributes are necessary for custom widgets to aid screen readers.

* `aria-label="text"`: Gives a label to elements that lack visible text (like an icon-only button).
* `aria-hidden="true"`: Hides decorative elements (like background SVG icons) from screen readers.
* `aria-expanded="true/false"`: Tells screen readers if a dropdown or accordion is open or closed.
* `role="button"`: Informs assistive tech that a non-semantic element (like a `<div>`) functions as a button.

```html
<!-- Example of a button containing only an icon -->
<button aria-label="Close menu">
  <!-- The SVG is decorative, so we hide it from screen readers -->
  <svg aria-hidden="true">...</svg>
</button>

```5:T4515,## Node.js

**Node.js** = JavaScript runtime built on V8 that lets JavaScript run outside the browser.

Best for:

* APIs
* Real-time apps
* I/O-heavy applications
* Backend services
* CLI tools

Key idea:

**JavaScript → V8 → Node.js APIs → OS**

Node.js is primarily **single-threaded for JavaScript execution**, but handles I/O asynchronously through the event loop and underlying system/libuv.

---
## Event Loop

Allows Node.js to handle many operations without blocking the main JavaScript thread.

```javascript
console.log("1");

setTimeout(() => console.log("2"), 0);

console.log("3");

// 1
// 3
// 2
```

### Blocking

```javascript
const data = fs.readFileSync("file.txt");
```

Execution waits.

### Non-blocking

```js
fs.readFile("file.txt", (err, data) => {
  console.log(data);
});
```

Execution continues while I/O runs.

---

## CommonJS vs ES Modules

### CommonJS

```js
const express = require("express");

module.exports = something;
```

### ES Modules

```js
import express from "express";

export default something;
```

ES Modules usually require:

```json
{
  "type": "module"
}
```

---

## npm

**npm** = Node package manager.

```bash
npm init -y
npm install express
npm install -D nodemon
npm uninstall express
```

### package.json

Stores:

* dependencies
* scripts
* project metadata
* module configuration

```json
{
  "scripts": {
    "dev": "nodemon app.js",
    "start": "node app.js"
  }
}
```

---

# Express.js

**Express** = Minimal Node.js web framework for building HTTP servers and APIs.

Main concepts:

**Request → Middleware → Route Handler → Response**

---

## Basic Express Server

```js
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(3000);
```

---

## Middleware

**Middleware** = Function executed between receiving a request and sending a response.

```js
(req, res, next) => {}
```

`next()` passes control to the next middleware.

```js
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});
```

Flow:

**Request → Middleware 1 → Middleware 2 → Route → Response**

---

## Built-in Middleware

### JSON Body

```js
app.use(express.json());
```

Parses:

```json
{
  "name": "Asif"
}
```

into:

```js
req.body
```

### Form Data

```js
app.use(express.urlencoded({ extended: true }));
```

### Static Files

```js
app.use(express.static("public"));
```

---

# Routing

A route combines:

**HTTP Method + Path + Handler**

```js
app.get("/users", handler);
app.post("/users", handler);
app.put("/users/:id", handler);
app.patch("/users/:id", handler);
app.delete("/users/:id", handler);
```

---

## Route Parameters

URL:

```text
/users/10
```

Route:

```js
app.get("/users/:id", (req, res) => {
  console.log(req.params.id);
});
```

```js
req.params.id // "10"
```

---

## Query Parameters

URL:

```text
/users?page=2&limit=10
```

```js
req.query.page
req.query.limit
```

---

## Request Body

```js
app.post("/users", (req, res) => {
  console.log(req.body);
});
```

Requires:

```js
app.use(express.json());
```

---

# req — Request Object

Most useful properties:

```js
req.params
req.query
req.body
req.headers
req.method
req.path
req.ip
req.cookies
```

Read header:

```js
req.get("Authorization");
```

Remember:

```text
/users/:id    → req.params
/users?page=2 → req.query
POST JSON     → req.body
```

---

# res — Response Object

Most useful methods:

```js
res.send()
res.json()
res.status()
res.redirect()
res.sendFile()
res.download()
res.cookie()
res.clearCookie()
```

Typical API response:

```js
res.status(200).json({
  success: true,
  data
});
```

Created:

```js
res.status(201).json(user);
```

Not found:

```js
res.status(404).json({
  error: "Not found"
});
```

---

# Express Router

Used to split routes into modules.

### users.routes.js

```js
const router = require("express").Router();

router.get("/", getUsers);
router.post("/", createUser);

module.exports = router;
```

### app.js

```js
app.use("/users", require("./users.routes"));
```

Now:

```text
GET  /users
POST /users
```

---

# Controllers

Controllers contain route logic.

```js
const getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};
```

Typical architecture:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Database
```

---

# REST API

Typical resource:

```text
GET    /users       Get all
GET    /users/:id   Get one
POST   /users       Create
PUT    /users/:id   Replace/update
PATCH  /users/:id   Partial update
DELETE /users/:id   Delete
```

---

# HTTP Status Codes

## Success

```text
200 OK
201 Created
204 No Content
```

## Client Errors

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
429 Too Many Requests
```

## Server Errors

```text
500 Internal Server Error
503 Service Unavailable
```

---

# Error Handling

Pass errors to Express:

```js
next(err);
```

Global error middleware has **4 parameters**:

```js
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message
  });
});
```

Place it **after routes**.

---

## 404 Handler

```js
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});
```

---

## Async Error Pattern

```js
const asyncHandler = fn =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
```

Usage:

```js
app.get("/users", asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));
```

---

# Environment Variables

Store configuration/secrets outside source code.

```bash
npm install dotenv
```

`.env`

```text
PORT=3000
DB_URL=mongodb://localhost/app
JWT_SECRET=secret
```

Load:

```js
require("dotenv").config();

const port = process.env.PORT;
```

Never commit real `.env` secrets.

---

# Authentication vs Authorization

**Authentication** = Who are you?

**Authorization** = What are you allowed to do?

Example:

```text
Login → Authentication
Admin-only route → Authorization
```

---

# Password Hashing

Never store plain passwords.

```js
const bcrypt = require("bcrypt");

const hash = await bcrypt.hash(password, 10);

const valid = await bcrypt.compare(password, hash);
```

---

# JWT

**JWT** = Signed token commonly used for stateless authentication.

Create:

```js
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);
```

Verify:

```js
const decoded = jwt.verify(
  token,
  process.env.JWT_SECRET
);
```

Typical header:

```text
Authorization: Bearer TOKEN
```

Middleware:

```js
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ error: "Unauthorized" });

  req.user = jwt.verify(token, process.env.JWT_SECRET);

  next();
};
```

---

# Cookies

Set:

```js
res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "strict"
});
```

Read:

```js
req.cookies.token
```

Delete:

```js
res.clearCookie("token");
```

`httpOnly` prevents browser JavaScript from reading the cookie.

---

# Sessions

**Session** = Server-side user state identified by a session ID.

```js
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
```

Store:

```js
req.session.userId = user.id;
```

---

# CORS

**CORS** controls which origins can access your server from browsers.

```js
const cors = require("cors");

app.use(cors({
  origin: "https://example.com",
  credentials: true
}));
```

CORS is a **browser security policy**, not authentication.

---

# MongoDB + Mongoose

**MongoDB** = Document database.

**Mongoose** = ODM for MongoDB.

Connect:

```js
await mongoose.connect(process.env.DB_URL);
```

Schema:

```js
const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  }
});
```

Model:

```js
const User = mongoose.model("User", userSchema);
```

---

## Mongoose CRUD

### Create

```js
const user = await User.create(req.body);
```

### Read All

```js
const users = await User.find();
```

### Read One

```js
const user = await User.findById(id);
```

### Update

```js
const user = await User.findByIdAndUpdate(
  id,
  req.body,
  { new: true, runValidators: true }
);
```

### Delete

```js
await User.findByIdAndDelete(id);
```

---

# SQL ORM Idea

ORM maps database tables to JavaScript objects.

Example with Sequelize:

```js
const User = sequelize.define("User", {
  name: DataTypes.STRING,
  email: DataTypes.STRING
});
```

CRUD:

```js
User.create()
User.findAll()
User.findByPk(id)
user.update()
user.destroy()
```

---

# Validation

Never trust client input.

```js
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const { error, value } = schema.validate(req.body);
```

If invalid:

```js
return res.status(400).json({
  error: error.message
});
```

---

# File Uploads — Multer

```js
const multer = require("multer");

const upload = multer({
  dest: "uploads/"
});
```

Single file:

```js
app.post(
  "/upload",
  upload.single("avatar"),
  (req, res) => {
    console.log(req.file);
  }
);
```

Multiple:

```js
upload.array("photos", 10);
```

---

# Static Files

```js
app.use(express.static("public"));
```

File:

```text
public/logo.png
```

Available as:

```text
/logo.png
```

---

# Security

## Helmet

Adds useful HTTP security headers.

```js
const helmet = require("helmet");

app.use(helmet());
```

## Rate Limiting

```js
const rateLimit = require("express-rate-limit");

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100
}));
```

Useful against brute force and request abuse.

---

# Important Security Recall

Always consider:

* Validate input
* Sanitize where appropriate
* Hash passwords
* Protect secrets
* Use HTTPS
* Set secure cookies
* Configure CORS correctly
* Rate limit sensitive routes
* Use security headers
* Avoid leaking stack traces
* Keep dependencies updated

---

# Logging

Simple:

```js
console.log(req.method, req.url);
```

Morgan:

```js
const morgan = require("morgan");

app.use(morgan("dev"));
```

Production often uses structured loggers such as Pino or Winston.

---

# Node.js Core Modules

## fs

File system operations.

```js
const fs = require("fs");

fs.readFile("file.txt", "utf8", callback);
fs.writeFile("file.txt", "hello", callback);
```

Promise version:

```js
const fs = require("fs/promises");

const data = await fs.readFile("file.txt", "utf8");
```

---

## path

Safely manipulate paths.

```js
const path = require("path");

path.join("users", "images", "a.png");
path.extname("a.png");
path.basename("/x/a.png");
path.dirname("/x/a.png");
```

---

## crypto

Cryptographic operations.

```js
const crypto = require("crypto");

crypto.randomBytes(16).toString("hex");
```

Hash:

```js
crypto
  .createHash("sha256")
  .update("data")
  .digest("hex");
```

---

## http

Create HTTP server without Express:

```js
const http = require("http");

http.createServer((req, res) => {
  res.end("Hello");
}).listen(3000);
```

Express provides a higher-level abstraction over Node HTTP APIs.

---

# Streams

**Stream** = Process data piece-by-piece instead of loading everything into memory.

Types:

```text
Readable
Writable
Duplex
Transform
```

Example:

```js
fs.createReadStream("big.mp4")
  .pipe(fs.createWriteStream("copy.mp4"));
```

Useful for large files.

---

# Buffers

**Buffer** = Raw binary data in Node.js.

```js
const buffer = Buffer.from("hello");

console.log(buffer);
```

Common with:

* files
* images
* network data
* streams

---

# Events

Node heavily uses the event-driven pattern.

```js
const EventEmitter = require("events");

const emitter = new EventEmitter();

emitter.on("login", user => {
  console.log(user);
});

emitter.emit("login", { id: 1 });
```

---

# Promise / async-await

Promise:

```js
fetchData()
  .then(data => console.log(data))
  .catch(console.error);
```

async/await:

```js
try {
  const data = await fetchData();
} catch (err) {
  console.error(err);
}
```

`async` functions always return a Promise.

---

# process

Current Node.js process.

```js
process.env
process.argv
process.pid
process.cwd()
process.exit()
```

Environment:

```js
process.env.NODE_ENV
```

---

# WebSockets

HTTP:

```text
Request → Response → Connection usually ends
```

WebSocket:

```text
Persistent bidirectional connection
```

Socket.IO:

```js
io.on("connection", socket => {
  socket.on("message", data => {
    io.emit("message", data);
  });
});
```

Useful for:

* Chat
* Notifications
* Multiplayer
* Live dashboards

---

# API Architecture Recall

Common project structure:

```text
src/
├── routes/
├── controllers/
├── services/
├── models/
├── middleware/
├── utils/
├── config/
└── app.js
```

Responsibilities:

```text
Routes      → URL mapping
Controllers → HTTP logic
Services    → Business logic
Models      → Database
Middleware  → Request pipeline
Utils       → Shared helpers
```

---

# MVC

**Model** = Data/database

**View** = Presentation

**Controller** = Request/business coordination

For REST APIs:

```text
Request
  ↓
Route
  ↓
Controller
  ↓
Service
  ↓
Model/DB
  ↓
Response
```

---

# Testing

Supertest tests HTTP APIs.

```js
const request = require("supertest");

const res = await request(app)
  .get("/users")
  .expect(200);
```

Typical tests:

```text
Unit        → One function
Integration → Multiple components
E2E         → Whole application flow
```

---

# PM2

Production process manager for Node.js.

```bash
pm2 start app.js
pm2 list
pm2 logs
pm2 restart app
pm2 stop app
```

Can provide:

* Restart on crash
* Multiple processes
* Logs
* Monitoring

---

# Graceful Shutdown

Finish active requests before terminating.

```js
process.on("SIGTERM", () => {
  server.close(() => {
    process.exit(0);
  });
});
```

Important during deployments and container shutdowns.

---

# Caching

**Caching** = Store expensive/frequently requested data temporarily.

Typical flow:

```text
Request
↓
Check cache
↓
Hit → Return cached data
Miss → DB/API → Cache → Return
```

Common cache:

**Redis**

---

# Useful Express Middleware

```text
express.json()       JSON body
cors                 CORS
helmet               Security headers
morgan               HTTP logs
multer               Uploads
express-rate-limit   Rate limiting
cookie-parser        Cookies
express-session      Sessions
compression          Compression
jsonwebtoken         JWT
bcrypt               Password hashing
Joi / Zod            Validation
```

---

# Most Important Express Pattern

```js
app.use(express.json());

app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message
  });
});

app.listen(process.env.PORT || 3000);
```

Remember order:

```text
Global middleware
↓
Routes
↓
404 handler
↓
Error handler
```

---

# Interview Recall

### What is Node.js?

JavaScript runtime for executing JavaScript outside the browser, commonly used for backend development.

### What is Express?

Minimal web framework built on Node.js for routing, middleware, HTTP APIs, and server applications.

### Why is Node.js good for I/O?

Its event-driven, non-blocking architecture allows it to handle many concurrent I/O operations efficiently.

### What is middleware?

A function that receives `req`, `res`, and `next` and participates in the HTTP request-response pipeline.

### `req.params` vs `req.query` vs `req.body`

```text
req.params → URL path
req.query  → ?key=value
req.body   → Request payload
```

### Authentication vs authorization

```text
Authentication → Who are you?
Authorization  → What can you access?
```

### JWT vs Session

```text
JWT     → State mostly stored in signed token
Session → State stored server-side
```

### PUT vs PATCH

```text
PUT   → Replace/update entire resource
PATCH → Partial update
```

### 401 vs 403

```text
401 → Not authenticated
403 → Authenticated but not allowed
```

### Why use environment variables?

To separate configuration/secrets from source code.

### Why hash passwords?

So the original password is not stored and cannot simply be recovered from the database.

### Why use streams?

To process large data incrementally without loading everything into memory.

### Why use a connection pool?

Reuse database connections instead of creating a new connection for every request.

### Why use rate limiting?

To reduce brute-force attacks, abuse, and excessive traffic.

### What is CORS?

Browser mechanism controlling whether frontend code from one origin can access another origin.

### What is the event loop?

Mechanism that coordinates asynchronous operations and callbacks while JavaScript execution remains largely single-threaded.

---

# Final Mental Model

```text
Client
  ↓
HTTP Request
  ↓
Express
  ↓
Middleware
  ↓
Router
  ↓
Controller
  ↓
Service
  ↓
Database / External API
  ↓
Controller
  ↓
HTTP Response
  ↓
Client
```

For quick recall, remember:

**Node.js = Runtime**

**Express = HTTP framework**

**Router = Where**

**Middleware = Before/Between**

**Controller = Request handling**

**Service = Business logic**

**Model = Data**

**JWT/Session = Authentication state**

**Validation = Trust nothing**

**Error middleware = Centralized failures**

**Event loop = Non-blocking concurrency**6:T42aa,markdown
# Next.js Cheatsheet

Next.js is a React framework for building full‑stack web applications. It provides server‑side rendering, static site generation, file‑based routing, API routes, and many optimizations out of the box. This cheatsheet covers the most important concepts, patterns, and code snippets you’ll use daily.

## 1. Setup & Project Structure

Create a new project with `create-next-app`. The App Router (introduced in Next.js 13) uses the `app/` directory.

```bash
npx create-next-app@latest my-app
cd my-app
npm run dev
Key folders and files:

text
my-app/
├── app/                    # App Router – main directory
│   ├── layout.js           # Root layout (required)
│   ├── page.js             # Home page
│   ├── globals.css         # Global styles
│   ├── api/                # API routes
│   │   └── route.js
│   ├── dashboard/
│   │   ├── layout.js       # Nested layout
│   │   ├── page.js
│   │   └── loading.js      # Loading UI
│   ├── blog/
│   │   ├── [slug]/         # Dynamic route
│   │   │   └── page.js
│   │   └── page.js
│   └── not-found.js        # Custom 404
├── public/                 # Static assets
├── next.config.js          # Next.js configuration
├── package.json
└── .env.local              # Environment variables
```


## 2. Routing (App Router)
File‑based routing automatically maps files inside app/ to URL paths. A page.js file defines a route.

```javascript
// app/page.js
export default function Home() {
  return <h1>Hello, Next.js!</h1>;
}
```
`app/about/page.js` would serve `/about`.

## 3. Pages & Layouts
Layouts wrap pages and persist across navigation. A root layout is required.

```javascript
// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>Site Header</header>
        {children}
        <footer>Site Footer</footer>
      </body>
    </html>
  );
}
```

Nested layouts can be created for specific sections.

```javascript
// app/dashboard/layout.js
export default function DashboardLayout({ children }) {
  return (
    <div>
      <nav>Dashboard Sidebar</nav>
      {children}
    </div>
  );
}
```
## 4. Dynamic Routes
Use square brackets to create dynamic segments. For example `app/blog/[slug]/page.js` matches` /blog/my-post.`

```javascript
// app/blog/[slug]/page.js
export default function BlogPost({ params }) {
  return <h1>Post: {params.slug}</h1>;
}
```
Catch‑all routes use [...slug] to match multiple path segments.

```javascript
// app/docs/[...slug]/page.js
export default function Docs({ params }) {
  return <p>Path: {params.slug.join(' / ')}</p>;
}
```
## 5. Loading & Error UI
A loading.js file automatically shows a loading state while the page content is being prepared.

```javascript
// app/dashboard/loading.js
export default function Loading() {
  return <div>Loading dashboard…</div>;
}
```
An error.js file handles runtime errors. It must be a Client Component.

```javascript
// app/dashboard/error.js
'use client';
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```
A custom 404 page can be created with not-found.js.

```javascript
// app/not-found.js
export default function NotFound() {
  return <h1>404 – Page Not Found</h1>;
}
```
## 6. Data Fetching: SSG, SSR, ISR
Server Components (the default) can use fetch with cache options to control how data is fetched and cached.

Static Site Generation (SSG) – the default behaviour: fetch results are cached at build time.

```javascript
// app/posts/page.js
export default async function Posts() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}
```
Server‑Side Rendering (SSR) – fetch with cache: 'no-store' to always fetch fresh data on every request.

```javascript
// app/page.js
export default async function Page() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'no-store'
  });
  const data = await res.json();
  return <div>{data.value}</div>;
}
```
Incremental Static Regeneration (ISR) – use next: { revalidate: seconds } to rebuild the page at most every X seconds.

```javascript
// app/page.js
export default async function Page() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 }
  });
  const data = await res.json();
  return <div>{data.value}</div>;
}
```
For dynamic routes, use generateStaticParams to pre‑render static pages.

javascript
// app/blog/[slug]/page.js
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());
  return posts.map(post => ({ slug: post.slug }));
}
Client‑side data fetching is also possible in Client Components using useEffect.

```javascript
'use client';
import { useEffect, useState } from 'react';

export default function ClientData() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);
  return <div>{data ? data.value : 'Loading…'}</div>;
}
```
## 7. Server Components vs Client Components
Server Components (default) can use async/await, fetch data, access backend resources, but cannot use React hooks or browser APIs.

Client Components are marked with 'use client' at the top. They can use state, effects, event handlers, and browser APIs, but cannot directly access server‑only resources.

```javascript
// Server Component
export default async function ServerComp() {
  const data = await fetchData();
  return <ClientComp data={data} />;
}
```
```javascript
// Client Component
'use client';
import { useState } from 'react';
export default function ClientComp({ data }) {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count} – {data}</button>;
}
```
## 8. Metadata & SEO
Export a metadata object or a generateMetadata function to set page metadata.

```javascript
// app/layout.js
export const metadata = {
  title: 'My Site',
  description: 'Welcome to my site',
};
```
For dynamic metadata based on route parameters.

```javascript
// app/blog/[slug]/page.js
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return { title: post.title, description: post.excerpt };
}
```
Open Graph and Twitter meta tags are supported.

```javascript
export const metadata = {
  openGraph: { title: '...', images: ['/og.png'] },
  twitter: { card: 'summary_large_image' },
};
```
## 9. API Routes
API routes live in app/api/ and export HTTP method handlers like GET, POST, etc.

```javascript
// app/api/hello/route.js
export async function GET(request) {
  return Response.json({ message: 'Hello' });
}


export async function POST(request) {
  const body = await request.json();
  return Response.json({ received: body }, { status: 201 });
}
```
Dynamic API routes use the same [param] syntax.

```javascript
// app/api/users/[id]/route.js
export async function GET(request, { params }) {
  const id = params.id;
  return Response.json({ userId: id });
}
```
## 10. Middleware
Create a middleware.js file (in the project root or src/) to run code before a request is completed. It can redirect, rewrite, or add headers.

```javascript
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const isLoggedIn = request.cookies.get('token');
  if (!isLoggedIn && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};
```
## 11. Styling
Global CSS can be imported in the root layout.

```javascript
// app/layout.js
import './globals.css';
```
CSS Modules are supported out of the box. Create a file like page.module.css and import it.

```javascript
// app/page.js
import styles from './page.module.css';
export default function Home() {
  return <div className={styles.container}>Styled</div>;
}
```
Tailwind CSS is pre‑configured when using create-next-app.

```javascript
export default function Home() {
  return <div className="text-2xl font-bold text-blue-500">Hello</div>;
}
```
## 12. Images & Fonts
Use next/image for automatic image optimisation.

```javascript
import Image from 'next/image';
export default function Page() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={800}
      height={400}
      priority
    />
  );
}
```
Use next/font to load web fonts with zero layout shift.

```javascript
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

export default function Layout({ children }) {
  return <html className={inter.className}>{children}</html>;
}
```
## 13. Navigation & Linking
Use the `<Link>` component for client‑side navigation.

```javascript
import Link from 'next/link';
export default function Nav() {
  return <Link href="/about">About</Link>;
}
```
Programmatic navigation in Client Components uses useRouter.

```javascript
'use client';
import { useRouter } from 'next/navigation';
export default function Button() {
  const router = useRouter();
  return <button onClick={() => router.push('/dashboard')}>Go</button>;
}
```
To redirect from a Server Component, use the redirect function.

```javascript
import { redirect } from 'next/navigation';
export default function Page() {
  redirect('/login');
}
```
## 14. Environment Variables
Store secrets in .env.local. Only variables prefixed with NEXT_PUBLIC_ are exposed to the browser.

```text
API_URL=https://api.example.com
NEXT_PUBLIC_API_URL=https://public.example.com
```
Access server‑side variables.

```javascript
const apiUrl = process.env.API_URL;
```
Access client‑side variables.

```javascript
const publicUrl = process.env.NEXT_PUBLIC_API_URL;
```
## 15. Authentication (NextAuth.js)
Install NextAuth and create a catch‑all API route.

```bash
npm install next-auth
```
```javascript
// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```
Retrieve the session in a Server Component with `getServerSession`.

```javascript
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';

export default async function Page() {
  const session = await getServerSession(authOptions);
  return <div>{session?.user?.name ?? 'Not signed in'}</div>;
}
```
## 16. Deployment & Tips
Deploy to Vercel with:

```bash
npm run build
vercel deploy
```
### Tips & Tricks:

- [ ] Use Server Components by default; switch to client only when needed (state, effects).
- [ ] Prefer fetch with caching for static, revalidate for ISR, no-store for real‑time.
- [ ] Use next/image for automatic image optimization.
- [ ] Implement loading.js and error.js for better user experience.
- [ ] Leverage API Routes for backend logic.
- [ ] Keep middleware lightweight – it runs on the edge.
- [ ] Use environment variables correctly: server‑only vs NEXT_PUBLIC_.
- [ ] For forms, consider Server Actions or API routes.
- [ ] Next.js caches aggressively; understand router.refresh() and revalidatePath.

```javascript
// Revalidate a path after data changes
import { revalidatePath } from 'next/cache';
export async function updateData() {
  // ... update data
  revalidatePath('/blog');
}
```


markdown
## 17. Server Actions (Mutations)

Server Actions allow you to run server‑side code directly from a Client Component without creating an API route. They are experimental in Next.js 14 and can be enabled in `next.config.js`.

```javascript
// next.config.js
module.exports = {
  experimental: {
    serverActions: true,
  },
};
```
A Server Action is defined in a Server Component file (or a separate file with 'use server' at the top).

```javascript
// app/actions.js
'use server';

export async function createPost(formData) {
  const title = formData.get('title');
  // ... save to database
  revalidatePath('/posts');
}
```
Then call it from a Client Component.

```javascript
// app/new-post.js
'use client';
import { createPost } from './actions';

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  );
}
```
## 18. Route Handlers vs Server Actions
Route Handlers (app/api/*/route.js) are best for external API endpoints, webhooks, or when you need fine‑grained control over HTTP methods and status codes.

Server Actions are best for internal mutations triggered by forms or buttons, as they reduce boilerplate and integrate tightly with the framework.

## 19. Caching & Revalidation
Next.js has a built‑in data cache for fetch requests in Server Components. You can control caching with the cache and next.revalidate options.

- fetch(url) – cached indefinitely (static)
- fetch(url, { cache: 'no-store' }) – dynamic, never cached
- fetch(url, { next: { revalidate: 60 } }) – ISR, revalidate every 60 seconds
- fetch(url, { next: { tags: ['posts'] } }) – tagged for on‑demand revalidation

On‑demand revalidation:

```javascript
import { revalidateTag } from 'next/cache';

// In a Server Action or Route Handler
revalidateTag('posts');
```
## 20. Error Handling Patterns
Use error.js to catch errors in nested routes. To handle errors in Server Actions or Route Handlers, throw or return appropriate responses.

```javascript
// app/api/data/route.js
export async function GET() {
  try {
    const data = await fetchData();
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
```
For unexpected errors in Server Components, you can throw an error and let the nearest error.js handle it.

## 21. Internationalization (i18n)
Next.js supports internationalized routing out of the box with the App Router.

```javascript
// next.config.js
module.exports = {
  i18n: {
    locales: ['en', 'fr', 'de'],
    defaultLocale: 'en',
  },
};
```
Then use next-intl or similar libraries for translations. The framework automatically prefixes routes with the locale (/fr/about).

## 22. Testing
Use Jest and React Testing Library for unit and component tests. For end‑to‑end tests, use Playwright or Cypress.

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```
Basic component test:

```javascript
// __tests__/Home.test.js
import { render, screen } from '@testing-library/react';
import Home from '../app/page';

test('renders heading', () => {
  render(<Home />);
  expect(screen.getByRole('heading', { name: /hello/i })).toBeInTheDocument();
});
```
## 23. Performance Optimizations

- Use Server Components – reduce client‑side JavaScript bundle.
- Lazy load components – use next/dynamic for non‑critical components.
- Image optimization – always use next/image.
- Font loading – use next/font to avoid layout shift.
- Code splitting – automatic via dynamic imports.
- Prefetching – Next.js automatically prefetches linked pages.
- 

Example of dynamic import:

```javascript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('../components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```
## 24. Common Pitfalls & Tips

- 'use client' must be at the very top – no comments or imports before it.
- Server Components cannot be imported into Client Components directly – pass them as children or use next/dynamic with ssr: false.
- Environment variables – only NEXT_PUBLIC_* are exposed to the client; never expose secrets.
- Middleware runs on the edge – avoid using Node.js APIs or heavy libraries there.
- Route Handlers vs API Routes – in App Router, use route.js inside app/api/; old pages/api still works but is legacy.
- Caching during development – Next.js dev mode may cache less aggressively; test in production mode.
- Use revalidatePath or revalidateTag after mutations to keep data fresh.
- Server Actions are experimental – check the current Next.js version before relying on them.

## 25. Additional Resources

1. Official Next.js documentation: https://nextjs.org/docs
2. Next.js GitHub repository: https://github.com/vercel/next.js
3. Vercel deployment guide: https://vercel.com/docs
4. This cheatsheet covers the essential Next.js features. Save it as a quick reference and expand as you learn new patterns.0:{"buildId":"uDrzv63FXSRl6rsLN5UpD","rsc":["$","$1","c",{"children":[["$","div",null,{"className":"min-h-screen bg-zinc-50 text-foreground dark:bg-zinc-950","children":[["$","script",null,{"type":"application/ld+json","dangerouslySetInnerHTML":{"__html":"{\"@context\":\"https://schema.org\",\"@type\":\"CollectionPage\",\"name\":\"Coding Cheatsheets & Syntax Reference\",\"url\":\"https://asif.to/cheatsheets\",\"mainEntity\":{\"@type\":\"ItemList\",\"itemListElement\":[{\"@type\":\"ListItem\",\"position\":1,\"name\":\"HTML Complete Cheatsheet 2026 | asif.to\",\"url\":\"https://asif.to/cheatsheets/html-complete-cheatsheet-2026-asifto\"},{\"@type\":\"ListItem\",\"position\":2,\"name\":\"Node.js & Express Ultimate Cheatsheet\",\"url\":\"https://asif.to/cheatsheets/nodejs-express\"},{\"@type\":\"ListItem\",\"position\":3,\"name\":\"Complete Next.js Cheat Sheet\",\"url\":\"https://asif.to/cheatsheets/complete-nextjs-cheatsheet\"}]}}"}}],["$","$L2",null,{}],["$","$L3",null,{"initialCourses":[{"_id":"6a78c13f2e3ba42262513f04","slug":"reactjs","title":"The Complete React.js Course: Zero to Production","subtitle":"Master React from the very basics to advanced patterns. Build real apps with hooks, routing, state management, and performance optimization — all with clear examples and beginner-friendly explanations.","techId":"reactjs","level":"Beginner - Advanced","duration":"Self-paced","thumbnail":"/uploads/articles/article-1787806373642-630115276-optimized.webp","learningOutcomes":["Build reusable components and understand JSX deeply","Manage state and side effects with useState and useEffect","Handle events, forms, and user input correctly","Navigate between pages using React Router v6","Share global state with Context API and useReducer","Fetch data from REST APIs with proper loading/error states","Write custom hooks and reuse logic across components","Optimize performance with useMemo, useCallback, and React.memo"],"order":1,"status":"published","createdAt":"2026-08-09T18:04:47.764Z","updatedAt":"2026-09-08T15:30:58.892Z","__v":0,"examEnabled":true,"examSettings":{"questionCount":20,"durationMinutes":30,"passingPercentage":70,"cooldownHours":24},"canonicalUrl":"https://asif.to/courses/reactjs","keywords":["ReactJS tutorial","ReactJS course","React tutorial for beginners","Learn ReactJS","ReactJS for beginners","React course for beginners","React.js tutorial","React.js course","Learn React step by step","React fundamentals React basics Introduction to ReactJS","ReactJS complete course","React frontend tutorial","React components tutorial","React hooks for beginners","ReactJS examples","ReactJS practice","ReactJS interview preparation","Free ReactJS course"],"seoDescription":"Enroll in the complete React JS course for 2026. Learn components, hooks, state management, Redux, and build real-world apps. Start coding today!","seoTitle":"React JS Course: Master Components, Hooks & Redux (2026) | asif.to","interviewCanonicalUrl":"https://asif.to/reactjs/interview-questions","interviewKeywords":[],"interviewOgImage":"","interviewSeoDescription":"","interviewSeoTitle":"","popularChapterIds":["6a78c2e42e3ba42262513f67","6a78c2e32e3ba42262513f58","6a9d28d28ab72771e63eeea3","6a78c4522e3ba42262513f9b","6a78c2e32e3ba42262513f5d"],"relatedCourses":["6a7daa7aeffda32e5acf71fa","6a796a8c09e092577f776138","6a78d8d9638ee052935b5b03","6a7a28e2409d8d71833a5efc","6a7ccf185f958cf7933073ad"],"chapterCount":23,"totalViews":4728,"rank":1},{"_id":"6a78d41159b41bd4fccb9f36","slug":"nextjs","title":"Next.js Complete Course: Zero to Production","subtitle":"Master Next.js 14+ with the App Router — covering file-based routing, Server Components, data fetching, API routes, authentication, middleware, Server Actions, SEO, and deploying to production.","techId":"nextjs","level":"Beginner - Advanced","duration":"Self-paced","thumbnail":"/uploads/articles/article-1787806502222-373114013-optimized.webp","learningOutcomes":["Build full-stack apps with Next.js App Router and React Server Components","Implement file-based routing with nested layouts, dynamic routes, and route groups","Fetch and cache data efficiently with Server Components and the extended fetch API","Create REST API endpoints using Route Handlers without a separate backend","Implement authentication with NextAuth.js including OAuth and credentials providers","Use Server Actions to mutate data directly without writing API route boilerplate","Optimize images, fonts, and SEO metadata for production-grade performance","Deploy your app to Vercel and configure CI/CD with GitHub Actions","Protect routes with Next.js Middleware running on the Edge Runtime","Apply Static Generation, SSR, and ISR strategies for the right rendering approach"],"order":2,"status":"published","createdAt":"2026-08-09T19:25:05.882Z","updatedAt":"2026-08-27T04:55:02.644Z","__v":0,"examEnabled":true,"examSettings":{"questionCount":20,"durationMinutes":30,"passingPercentage":70,"cooldownHours":24},"canonicalUrl":"https://asif.to/courses/nextjs","keywords":["Next.js course","learn Next.js","Next.js tutorial","React framework","SSR","SSG","Next.js App Router","API Routes","full-stack React","Next.js certification"],"seoDescription":"Master Next.js from basics to advanced. Learn SSR, SSG, API Routes, App Router, and build full-stack React applications. Start your Next.js journey today!","seoTitle":"Next.js Course: Master React Framework with SSR & API Routes (2026)","interviewCanonicalUrl":"https://asif.to/nextjs/interview-questions","interviewKeywords":[],"interviewOgImage":"","interviewSeoDescription":"","interviewSeoTitle":"","popularChapterIds":[],"relatedCourses":[],"chapterCount":17,"totalViews":3182,"rank":2},{"_id":"6a7959c209e092577f775f4c","slug":"javascript","title":"JavaScript: The Complete Guide","subtitle":"Master JavaScript from basics to advanced — Arrays, Objects, Sets, Maps, Promises, Fetch API, DOM, and more with real code examples.","techId":"javascript","level":"Beginner - Advanced","duration":"Self-paced","thumbnail":"/uploads/articles/article-1787806292610-808545719-optimized.webp","learningOutcomes":["Understand JavaScript fundamentals: variables, data types, operators","Master functions, closures, and higher-order functions","Work confidently with Arrays and all built-in array methods","Master Objects, prototypes, and object-oriented patterns","Use Sets, Maps, WeakSet, and WeakMap effectively","Write asynchronous code with Callbacks, Promises, and Async/Await","Fetch data from APIs using the Fetch API and handle errors","Understand the DOM and manipulate web pages dynamically","Work with ES6+ modern JavaScript features","Debug JavaScript code and understand the event loop"],"order":1,"status":"published","createdAt":"2026-08-10T04:55:30.578Z","updatedAt":"2026-09-08T15:32:14.506Z","__v":0,"examEnabled":true,"examSettings":{"questionCount":20,"durationMinutes":30,"passingPercentage":70,"cooldownHours":24},"canonicalUrl":"https://asif.to/courses/javascript","keywords":["JavaScript course","learn JavaScript","JS tutorial","web development course","ES6","async/await","JavaScript projects","coding bootcamp"],"seoDescription":"Join the complete JavaScript course for 2026. Master ES6+, DOM, APIs, async/await, and build real-world projects. Start coding today!","seoTitle":"Complete JavaScript Course: Zero to Expert (2026) | asif.to","interviewCanonicalUrl":"https://asif.to/javascript/interview-questions","interviewKeywords":["JavaScript course","learn JavaScript","JS tutorial","web development course","ES6","async/await","JavaScript projects","coding bootcamp"],"interviewOgImage":"","interviewSeoDescription":"Learn reactjs from beginning to advance, learn basics, hooks, state management, data fetching, performance optimization, redux toolkit, zustand, custom hooks, router dom","interviewSeoTitle":"Reactjs Complete Course from zero to hero","popularChapterIds":["6a795c9e09e092577f775fc2","6a795c9e09e092577f775fd0","6a795c9e09e092577f775fc9","6a795c9e09e092577f775fd8","6a795db609e092577f776028","6a795db609e092577f776036","6a795c9e09e092577f775fe8","6a795bb009e092577f775fa9","6a795baf09e092577f775f96"],"relatedCourses":["6a796a8c09e092577f776138","6a7ccf185f958cf7933073ad","6a7a28e2409d8d71833a5efc","6a78d8d9638ee052935b5b03"],"author":{"_id":"6a7a18755f27bc443e06cb2c","fullName":"Asif Imam","username":"asif","avatar":"/uploads/avatars/avatar-1786386621274-266808022.jpg","role":"super_admin","bio":"Software Engineer, Founder and Owner @asif.to","location":"Darbhanga, Bihar","socials":{"website":"https://dev.asif.to","twitter":"theasifimam","linkedin":"theasifimam","github":"theasifimam"}},"chapterCount":22,"totalViews":3090,"rank":3},{"_id":"6a7ccf185f958cf7933073ad","slug":"css","title":"CSS Mastery: Complete In-Depth Guide","subtitle":"Master every CSS property — from selectors to animations, flexbox to grid, variables to filters — with real-world examples and browser-ready code.","seoTitle":"CSS Complete Course: Master All CSS Properties","seoDescription":"Learn CSS in depth — every property, every layout technique, animations, variables, and more. The most complete free CSS course online.","keywords":["css course","learn css","css tutorial","css properties","css flexbox","css grid","css animations","css for beginners","css in depth","complete css guide"],"canonicalUrl":"https://asif.to/courses/css","techId":"css","level":"Beginner - Advanced","duration":"Self-paced (15+ hours)","thumbnail":"/uploads/articles/article-1787656608133-369207708-optimized.webp","learningOutcomes":["Understand every CSS selector, specificity, and the cascade","Build responsive layouts with Flexbox and CSS Grid","Master the Box Model, positioning, and stacking contexts","Use CSS Variables (custom properties) for maintainable design systems","Create smooth animations and transitions without JavaScript","Apply CSS Filters, Transforms, and advanced visual effects","Write production-grade, accessible, and performant CSS"],"order":6,"status":"published","examEnabled":true,"examSettings":{"questionCount":20,"durationMinutes":30,"passingPercentage":70,"cooldownHours":24},"createdAt":"2026-08-12T19:52:56.273Z","updatedAt":"2026-08-25T11:16:48.504Z","__v":0,"interviewCanonicalUrl":"https://asif.to/css/interview-questions","interviewKeywords":[],"interviewOgImage":"","interviewSeoDescription":"","interviewSeoTitle":"","popularChapterIds":[],"relatedCourses":[],"chapterCount":27,"totalViews":1857,"rank":4},{"_id":"6a7daa7aeffda32e5acf71fa","slug":"typescript","__v":0,"canonicalUrl":"https://asif.to/typescript","createdAt":"2026-08-13T11:28:56.262Z","duration":"4.5 Hours","examEnabled":false,"examSettings":{"questionCount":20,"durationMinutes":30,"passingPercentage":70,"cooldownHours":24},"keywords":["TypeScript tutorial","TypeScript course","TypeScript for beginners","learn TypeScript","TypeScript tutorial for beginners","TypeScript complete course","TypeScript basics","TypeScript fundamentals","TypeScript programming","introduction to TypeScript","TypeScript step by step","TypeScript with JavaScript","TypeScript types","TypeScript interfaces","TypeScript functions","TypeScript classes","TypeScript generics","TypeScript objects","TypeScript arrays","TypeScript enums","TypeScript advanced concepts","TypeScript examples","TypeScript practice","TypeScript interview preparation","free TypeScript course"],"learningOutcomes":["Understand the core differences between JavaScript and TypeScript architecture","Master primitive types, unions, intersections, and type narrowing","Design robust data contracts using Interfaces and Type Aliases","Write highly reusable and scalable code using Generics","Configure the TypeScript compiler (tsconfig.json) for optimal project strictness"],"level":"Beginner - Advanced","order":2,"seoDescription":"Learn TypeScript from scratch with this beginner-friendly course covering types, interfaces, functions, classes, generics, objects, arrays, and practical examples.","seoTitle":"TypeScript Tutorial for Beginners – Learn TypeScript Step by Step","status":"published","subtitle":"Master static typing in JavaScript. Learn types, interfaces, generics, and advanced compiler configurations to build bulletproof applications.","techId":"typescript","thumbnail":"/uploads/articles/article-1787731922674-60241251-optimized.webp","title":"TypeScript Complete Course: Zero to Mastery","updatedAt":"2026-09-12T10:29:24.265Z","interviewCanonicalUrl":"https://asif.to/typescript/interview-questions","interviewKeywords":[],"interviewOgImage":"","interviewSeoDescription":"","interviewSeoTitle":"","popularChapterIds":["6a7daa788c006f92a6c19e61","6a7daa788c006f92a6c19e5d","6a7daa788c006f92a6c19e65","6a7daa788c006f92a6c19e6a","6a7daa798c006f92a6c19e77","6a7daa798c006f92a6c19e7f","6a7daa798c006f92a6c19e89"],"relatedCourses":["6a7959c209e092577f775f4c","6a796a8c09e092577f776138","6a78d8d9638ee052935b5b03","6a7a28e2409d8d71833a5efc","6a7ccf185f958cf7933073ad","6a78c13f2e3ba42262513f04"],"author":{"_id":"6a7a18755f27bc443e06cb2c","fullName":"Asif Imam","username":"asif","avatar":"/uploads/avatars/avatar-1786386621274-266808022.jpg","role":"super_admin","bio":"Software Engineer, Founder and Owner @asif.to","location":"Darbhanga, Bihar","socials":{"website":"https://dev.asif.to","twitter":"theasifimam","linkedin":"theasifimam","github":"theasifimam"}},"chapterCount":30,"totalViews":1533,"rank":5},{"_id":"6a8ffdbd38b5a6e1a6eb01b7","slug":"python","title":"Python: The Complete Beginner to Advanced Guide","subtitle":"Learn Python from absolute basics to real-world programming with clear explanations, practical examples, object-oriented programming, files, APIs, databases, testing, automation, and projects.","seoTitle":"","seoDescription":"","keywords":[],"canonicalUrl":"https://asif.to/courses/python-complete-course","interviewSeoTitle":"","interviewSeoDescription":"","interviewKeywords":[],"interviewCanonicalUrl":"https://asif.to/python-complete-course/interview-questions","interviewOgImage":"","techId":"python","level":"Beginner - Advanced","duration":"Self-paced (45+ hours)","thumbnail":"/uploads/articles/article-1787823428398-504706234-optimized.webp","learningOutcomes":["Understand Python syntax, variables, data types, operators, and program flow from the ground up","Write clean Python programs using conditions, loops, functions, modules, and reusable code","Work confidently with strings, lists, tuples, sets, dictionaries, and nested data structures","Understand scope, recursion, lambda functions, comprehensions, iterators, generators, and decorators","Build object-oriented programs using classes, objects, inheritance, composition, and special methods","Read, write, and process text, CSV, and JSON files safely","Handle errors with exceptions and write programs that fail gracefully","Use Python standard-library modules for dates, paths, collections, regular expressions, and utilities","Create and manage virtual environments and project dependencies","Consume REST APIs and work with HTTP and JSON data","Store and query data using SQLite from Python","Write tests, debug programs, and structure maintainable Python projects","Understand concurrency fundamentals with threading, multiprocessing, and async programming","Automate repetitive tasks and build practical command-line applications","Complete realistic Python projects that combine multiple concepts"],"order":7,"status":"published","examEnabled":true,"examSettings":{"questionCount":25,"durationMinutes":35,"passingPercentage":70,"cooldownHours":24},"relatedCourses":["6a7959c209e092577f775f4c","6a7daa7aeffda32e5acf71fa","6a78c13f2e3ba42262513f04"],"relatedArticles":[],"popularChapterIds":[],"author":{"_id":"6a7a18755f27bc443e06cb2c","fullName":"Asif Imam","username":"asif","avatar":"/uploads/avatars/avatar-1786386621274-266808022.jpg","role":"super_admin","bio":"Software Engineer, Founder and Owner @asif.to","location":"Darbhanga, Bihar","socials":{"website":"https://dev.asif.to","twitter":"theasifimam","linkedin":"theasifimam","github":"theasifimam"}},"createdAt":"2026-08-27T09:05:01.782Z","updatedAt":"2026-09-10T16:10:28.225Z","__v":0,"chapterCount":23,"totalViews":776,"rank":6},{"_id":"6a78d8d9638ee052935b5b03","slug":"nodejs","title":"Node.js & Express: Zero to Production","subtitle":"Master backend development. Learn the V8 engine, the Event Loop, asynchronous programming, Express.js architecture, MongoDB, authentication, security, and production deployment.","techId":"nodejs","level":"Beginner - Advanced","duration":"Self-paced","thumbnail":"/uploads/articles/article-1787732029734-708422728-optimized.webp","learningOutcomes":["Understand the underlying architecture of Node.js, V8, and libuv","Master the Event Loop and write truly non-blocking asynchronous code","Handle massive files efficiently using Node.js Streams and Buffers","Build robust RESTful APIs using Express.js and MVC architecture","Perform CRUD operations and complex aggregations using MongoDB and Mongoose","Implement secure JWT authentication and password hashing with bcrypt","Protect servers from XSS, SQL Injection, and DDoS using Helmet and Rate Limiting","Handle file uploads using Multer and cloud storage","Integrate WebSockets via Socket.io for real-time bidirectional communication","Deploy Node.js applications using PM2 and Docker"],"order":3,"status":"published","createdAt":"2026-08-09T19:45:29.420Z","updatedAt":"2026-08-26T08:13:50.094Z","__v":0,"examEnabled":true,"examSettings":{"questionCount":20,"durationMinutes":30,"passingPercentage":70,"cooldownHours":24},"canonicalUrl":"https://asif.to/courses/nodejs","keywords":["advanced Node.js","Node.js microservices","Node.js performance","clustering","message queues","enterprise Node.js","scalable backend"],"seoDescription":"Master advanced Node.js techniques. Learn microservices, performance optimization, clustering, message queues, and build enterprise-grade scalable backend systems.","seoTitle":"Advanced Node.js: Microservices, Performance & Scalability (2026)","interviewCanonicalUrl":"https://asif.to/nodejs/interview-questions","interviewKeywords":[],"interviewOgImage":"","interviewSeoDescription":"","interviewSeoTitle":"","popularChapterIds":[],"relatedCourses":[],"chapterCount":17,"totalViews":685,"rank":7},{"_id":"6a796a8c09e092577f776138","slug":"html","title":"HTML5 Mastery: The Complete Guide to Web Structure & Semantics","subtitle":"Master HTML5 from basic tags to advanced semantic structure, forms, multimedia, and SEO best practices.","techId":"html","level":"beginner","duration":"Self-paced","thumbnail":"/uploads/articles/article-1787806399853-139928069-optimized.webp","learningOutcomes":[],"order":2,"status":"published","createdAt":"2026-08-10T06:07:08.197Z","updatedAt":"2026-09-08T15:37:13.634Z","__v":0,"examEnabled":true,"examSettings":{"questionCount":20,"durationMinutes":30,"passingPercentage":70,"cooldownHours":24},"canonicalUrl":"https://asif.to/courses/html","keywords":["HTML5 course","learn HTML5","HTML5 tutorial","HTML5 mastery","web development","semantic HTML","responsive design","HTML5 Canvas"],"seoDescription":"Master HTML5 from beginner to expert. Learn semantic tags, forms, multimedia, Canvas, SVG, and build responsive websites.","seoTitle":"HTML5 Mastery: Complete Guide to Modern Web Development (2026) | Asif","interviewCanonicalUrl":"https://asif.to/html/interview-questions","interviewKeywords":["HTML tutorial","HTML course","HTML for beginners","learn HTML","HTML tutorial for beginners","HTML complete course","HTML basics","HTML fundamentals","introduction to HTML","HTML tags","HTML elements","HTML forms","HTML tables","semantic HTML","HTML links","HTML images","HTML lists","HTML5 tutorial","HTML page structure","HTML examples","HTML practice","web development for beginners","frontend development","free HTML course"],"interviewOgImage":"","interviewSeoDescription":"Learn HTML from scratch with this beginner-friendly course covering elements, tags, forms, tables, semantic HTML, media, links, and page structure with practical examples","interviewSeoTitle":"HTML Tutorial for Beginners – Learn HTML Step by Step | asif.to","popularChapterIds":["6a796ad309e092577f776178","6a796ad209e092577f77616f","6a796a8c09e092577f776157","6a796ad309e092577f776188","6a796b1f09e092577f7761a3","6a796b1f09e092577f7761aa","6a796b1f09e092577f7761b3"],"relatedCourses":["6a7959c209e092577f775f4c","6a78c13f2e3ba42262513f04","6a78d8d9638ee052935b5b03","6a7a28e2409d8d71833a5efc","6a7ccf185f958cf7933073ad"],"chapterCount":12,"totalViews":626,"rank":8},{"_id":"6a78dbcac23e386c0c28f5c1","slug":"mongodb","title":"MongoDB & Mongoose: The Complete NoSQL Guide","subtitle":"Master modern database architecture. Learn NoSQL fundamentals, CRUD operations, advanced Mongoose modeling, and powerful Aggregation Pipelines.","techId":"mongodb","level":"Beginner - Advanced","duration":"Self-paced","thumbnail":"/uploads/articles/article-1787732328965-655812887-optimized.webp","learningOutcomes":[],"order":4,"status":"published","createdAt":"2026-08-09T19:58:02.455Z","updatedAt":"2026-08-26T08:18:49.314Z","__v":0,"canonicalUrl":"https://asif.to/courses/mongodb","examEnabled":true,"examSettings":{"questionCount":20,"durationMinutes":30,"passingPercentage":70,"cooldownHours":24},"keywords":["MongoDB course","learn MongoDB","MongoDB tutorial","NoSQL database","MongoDB CRUD","aggregation framework","MongoDB indexing","schema design","MongoDB Atlas","MongoDB certification"],"seoDescription":"Master MongoDB from basics to advanced. Learn CRUD operations, aggregation pipelines, indexing, schema design, and build scalable database applications. Start your NoSQL","seoTitle":"MongoDB Mastery: Complete NoSQL Database Course (2026)","interviewCanonicalUrl":"https://asif.to/mongodb/interview-questions","interviewKeywords":[],"interviewOgImage":"","interviewSeoDescription":"","interviewSeoTitle":"","popularChapterIds":[],"relatedCourses":[],"chapterCount":15,"totalViews":569,"rank":9},{"_id":"6a8ff74c46e2f860e8872664","slug":"dsa-in-javascript","title":"Data Structures & Algorithms in JavaScript","subtitle":"Master data structures, algorithmic thinking, problem-solving patterns, complexity analysis, and coding interview techniques with JavaScript.","seoTitle":"","seoDescription":"","keywords":[],"canonicalUrl":"https://asif.to/courses/dsa-in-javascript","interviewSeoTitle":"","interviewSeoDescription":"","interviewKeywords":[],"interviewCanonicalUrl":"https://asif.to/dsa-in-javascript/interview-questions","interviewOgImage":"","techId":"javascript","level":"Beginner - Advanced","duration":"Self-paced (35+ hours)","thumbnail":"/uploads/articles/article-1787822079217-622930678-optimized.webp","learningOutcomes":["Analyze time and space complexity using Big O, Big Omega, and Big Theta notation","Understand JavaScript-specific performance considerations when solving DSA problems","Master arrays, strings, hash maps, sets, linked lists, stacks, queues, trees, heaps, and graphs","Implement common data structures from scratch using modern JavaScript","Use two pointers, sliding window, prefix sums, frequency counters, fast/slow pointers, and monotonic structures","Master recursion, backtracking, divide and conquer, greedy algorithms, and dynamic programming","Implement and compare searching and sorting algorithms with their complexity trade-offs","Solve tree and graph problems using BFS, DFS, topological sorting, and shortest-path techniques","Recognize common coding interview patterns instead of memorizing isolated solutions","Write clean, testable, interview-ready JavaScript solutions and explain their complexity"],"order":6,"status":"published","examEnabled":true,"examSettings":{"questionCount":20,"durationMinutes":30,"passingPercentage":70,"cooldownHours":24},"relatedCourses":["6a7959c209e092577f775f4c","6a78c13f2e3ba42262513f04"],"relatedArticles":[],"popularChapterIds":["6a8ff74c46e2f860e887266e","6a8ff74d46e2f860e8872673","6a8ffb217965c204c4de2aae","6a8ff74d46e2f860e887267d"],"author":{"_id":"6a7a18755f27bc443e06cb2c","fullName":"Asif Imam","username":"asif","avatar":"/uploads/avatars/avatar-1786386621274-266808022.jpg","role":"super_admin","bio":"Software Engineer, Founder and Owner @asif.to","location":"Darbhanga, Bihar","socials":{"website":"https://dev.asif.to","twitter":"theasifimam","linkedin":"theasifimam","github":"theasifimam"}},"createdAt":"2026-08-27T08:37:32.680Z","updatedAt":"2026-08-27T09:14:40.149Z","__v":1,"chapterCount":15,"totalViews":483,"rank":10},{"_id":"6aa2f14013f13ee4ef37d5ab","slug":"csharp-and-dotnet","__v":0,"author":{"_id":"6a7a18755f27bc443e06cb2c","fullName":"Asif Imam","username":"asif","avatar":"/uploads/avatars/avatar-1786386621274-266808022.jpg","role":"super_admin","bio":"Software Engineer, Founder and Owner @asif.to","location":"Darbhanga, Bihar","socials":{"website":"https://dev.asif.to","twitter":"theasifimam","linkedin":"theasifimam","github":"theasifimam"}},"canonicalUrl":"https://asif.to/courses/csharp-dotnet-complete-course","createdAt":"2026-09-10T18:04:48.470Z","duration":"Self-paced (35+ hours)","examEnabled":false,"examSettings":{"questionCount":20,"durationMinutes":30,"passingPercentage":70,"cooldownHours":24},"interviewCanonicalUrl":"https://asif.to/csharp-dotnet-complete-course/interview-questions","interviewKeywords":[],"interviewOgImage":"","interviewSeoDescription":"","interviewSeoTitle":"","keywords":["C# course","C sharp tutorial",".NET course","ASP.NET Core","Entity Framework Core","LINQ","C# async await","backend development","asif.to"],"learningOutcomes":["Understand how C#, modern .NET, the CLR, SDKs, runtimes, and legacy .NET Framework fit together","Write confident C# with types, nullability, control flow, methods, collections, and pattern matching","Model domains with classes, records, structs, interfaces, composition, inheritance, and generics","Transform data cleanly with lambdas and LINQ","Build responsive applications with async/await, cancellation, and safe concurrency","Read files, serialize JSON, call HTTP APIs, and use configuration, logging, NuGet, and DI","Persist relational data with Entity Framework Core and migrations","Create secure, validated REST APIs with ASP.NET Core","Test applications and organize maintainable .NET solutions","Profile, containerize, and ship .NET applications with confidence","Complete portfolio-ready console and web API projects"],"level":"Beginner - Advanced","order":8,"popularChapterIds":["6aa2f14613f13ee4ef37d5bc","6aa2f14613f13ee4ef37d5be","6aa2f14713f13ee4ef37d5c0","6aa2f14813f13ee4ef37d5c1","6aa2f14913f13ee4ef37d5c3","6aa2f14a13f13ee4ef37d5c4"],"relatedArticles":[],"relatedCourses":["6a78c13f2e3ba42262513f04","6a78d41159b41bd4fccb9f36","6a78d8d9638ee052935b5b03"],"seoDescription":"Learn C# and .NET with fun lessons, examples, challenges, ASP.NET Core, EF Core, testing, security, Docker, and real projects.","seoTitle":"Free C# & .NET Course: Beginner to Advanced | asif.to","status":"published","subtitle":"A fun, practical C# journey from your first variable to OOP, LINQ, async code, databases, secure ASP.NET Core APIs, testing, Docker, and production-ready .NET apps.","techId":"csharp","thumbnail":"/uploads/articles/article-1789531760403-749677125-optimized.webp","thumbnailAsset":null,"title":"C# & .NET: Zero to Production Hero 🚀","updatedAt":"2026-09-16T04:09:21.005Z","chapterCount":24,"totalViews":410,"rank":11},{"_id":"6a7a28e2409d8d71833a5efc","slug":"tailwind-css","title":"Tailwind CSS Mastery","subtitle":"The complete, in-depth guide to building modern, responsive UI with Tailwind CSS.","techId":"tailwindcss","level":"Beginner - Advanced","duration":"Self-paced (10+ hours)","thumbnail":"/uploads/articles/article-1787806584396-957522796-optimized.webp","learningOutcomes":["Master the utility-first CSS workflow","Build complex, responsive layouts with Flexbox and Grid","Implement dark mode and interactive states effortlessly","Customize the Tailwind configuration to match your brand","Optimize CSS for production with the JIT compiler"],"order":5,"status":"published","createdAt":"2026-08-10T19:39:14.450Z","updatedAt":"2026-08-27T04:56:24.922Z","__v":0,"canonicalUrl":"https://asif.to/courses/tailwind-css","examEnabled":true,"examSettings":{"questionCount":20,"durationMinutes":30,"passingPercentage":70,"cooldownHours":24},"keywords":["Tailwind React","Tailwind Next.js","Tailwind components","utility-first React","modern CSS framework","Tailwind UI development"],"seoDescription":"Master Tailwind CSS integrated with React and Next.js. Build responsive, themeable, production-ready UIs with utility-first styling and component-based architecture.","seoTitle":"Tailwind CSS with React & Next.js: Modern UI Development (2026)","interviewCanonicalUrl":"https://asif.to/tailwind-css/interview-questions","interviewKeywords":[],"interviewOgImage":"","interviewSeoDescription":"","interviewSeoTitle":"","popularChapterIds":[],"relatedCourses":[],"chapterCount":6,"totalViews":274,"rank":12},{"_id":"6aaa74172253bf6ac46c3efe","slug":"react-native","title":"React Native: Ship Apps Without Losing Your Mind 📱","subtitle":"A practical React Native course for building iOS and Android apps with Expo, navigation, APIs, native features, and enough debugging to survive Monday.","seoTitle":"React Native Course: Build iOS & Android Apps | asif.to","seoDescription":"Learn React Native with Expo, components, navigation, APIs, storage, permissions, debugging, and a real cross-platform app project.","keywords":["React Native","Expo","mobile development","iOS","Android","JavaScript","TypeScript"],"canonicalUrl":"https://asif.to/courses/react-native","interviewSeoTitle":"","interviewSeoDescription":"","interviewKeywords":[],"interviewCanonicalUrl":"","interviewOgImage":"","techId":"react-native","level":"Beginner - Intermediate","duration":"Self-paced (12+ hours)","thumbnail":"","thumbnailAsset":null,"learningOutcomes":["Build cross-platform mobile interfaces with React Native and Expo","Use components, styling, lists, forms, gestures, and responsive layouts","Navigate between screens and manage real app state","Fetch API data, handle loading states, errors, caching, and offline moments","Use device capabilities such as storage, images, notifications, and permissions","Debug, test, build, and ship a polished mobile app"],"order":12,"status":"published","examEnabled":false,"examSettings":{"questionCount":20,"durationMinutes":30,"passingPercentage":70,"cooldownHours":24},"relatedCourses":[],"relatedArticles":[],"popularChapterIds":[],"author":null,"createdAt":"2026-09-16T10:48:55.646Z","updatedAt":"2026-09-16T10:48:55.646Z","__v":0,"chapterCount":17,"totalViews":105,"rank":13}],"initialCheatsheets":[{"_id":"6a7eead73c0b58d01672f7f2","type":"cheatsheet","title":"HTML Complete Cheatsheet 2026 | asif.to","slug":"html-complete-cheatsheet-2026-asifto","content":"$4","seoTitle":"Complete HTML5 Tags Cheatsheet – All Elements &amp; Examples (2026)","seoDescription":"Comprehensive HTML5 tags cheatsheet with all current elements, categorized by use: document structure, text, forms, tables, media, interactive, and deprecated tags. ","keywords":["HTML5 tags","HTML cheat sheet","all HTML elements","HTML reference","HTML5 cheat sheet","semantic HTML","HTML tags list","HTML5 elements","web development cheat sheet","developer reference"],"canonicalUrl":"","author":{"_id":"6a016911a3bb3c5ed2909e42","fullName":"asif.to","username":"asif.to","avatar":"/uploads/avatars/avatar-1787081162513-210956119-optimized.webp"},"readCount":0,"views":[],"image":"","topic":[],"status":"published","techId":"html","order":0,"createdAt":"2026-08-14T10:15:51.508Z","updatedAt":"2026-08-15T21:33:11.499Z","__v":0},{"_id":"6a78d6ced486bbb7931ec224","type":"cheatsheet","title":"Node.js & Express Ultimate Cheatsheet","slug":"nodejs-express","content":"$5","seoTitle":"Node.js &amp; Express Cheatsheet – Complete Developer Reference (2026)","seoDescription":"Node.js and Express cheatsheet with frequently used code snippets, middleware, routing, authentication, database integration, and more. Developer-friendly quick reference","keywords":["Node.js","Express","cheatsheet","Express middleware","Node.js routing","Express boilerplate","JWT","MongoDB","MySQL","developer reference","web development","REST API","Express server"],"canonicalUrl":"https://asif.to/cheatsheets/nodejs-express","author":{"_id":"6a016911a3bb3c5ed2909e42","fullName":"asif.to","username":"asif.to","avatar":"/uploads/avatars/avatar-1787081162513-210956119-optimized.webp"},"readCount":0,"views":[],"image":"","topic":[],"status":"published","techId":"nodejs","order":0,"createdAt":"2026-08-14T06:53:33.261Z","updatedAt":"2026-08-15T21:04:29.624Z","__v":0},{"_id":"6a78d4236552eee9602f2ff3","type":"cheatsheet","title":"Complete Next.js Cheat Sheet","slug":"complete-nextjs-cheatsheet","content":"$6","seoTitle":"Next.js Cheatsheet – Complete Developer Reference (2026)","seoDescription":"Next.js cheatsheet covering App Router, SSR vs SSG vs ISR, Server Components, API routes, authentication, deployment, and more. Developer-friendly quick reference.","keywords":["Next.js","React","cheatsheet","App Router","SSR","SSG","ISR","Server Components","Client Components","API routes","Next.js middleware","NextAuth","deployment","developer reference"],"canonicalUrl":"https://asif.to/cheatsheets/nextjs","author":{"_id":"6a016911a3bb3c5ed2909e42","fullName":"asif.to","username":"asif.to","avatar":"/uploads/avatars/avatar-1787081162513-210956119-optimized.webp"},"readCount":0,"views":[],"image":"","topic":[],"status":"published","techId":"nextjs","order":0,"createdAt":"2026-08-09T19:25:23.388Z","updatedAt":"2026-08-14T18:26:00.011Z","__v":0}]}],"$L7"]}],["$L8","$L9"],"$La"]}],"loading":null,"isPartial":false}
7:["$","$Lb",null,{}]
8:["$","script","script-0",{"src":"/_next/static/chunks/a4e58bce18a960b0.js","async":true}]
9:["$","script","script-1",{"src":"/_next/static/chunks/f5dc118ecf18bb8c.js","async":true}]
a:["$","$Lc",null,{"children":["$","$d",null,{"name":"Next.MetadataOutlet","children":"$@e"}]}]
e:null
