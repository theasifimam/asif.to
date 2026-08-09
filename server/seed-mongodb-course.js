/**
 * MongoDB & Mongoose Course Seeder
 * Creates a highly detailed 15-chapter course using the local API.
 * Run: node seed-mongodb-course.js
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
  console.log("✅ Logged in successfully");
  return token;
}

async function deleteExistingCourses(token) {
  const res = await fetch(`${API_BASE}/courses`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const courses = data.data?.courses || data.data || data.courses || data || [];
  const mongoCourses = courses.filter(c => c.techId === "mongodb");
  for (const c of mongoCourses) {
    await fetch(`${API_BASE}/courses/${c._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`🗑️ Deleted old MongoDB course: ${c._id}`);
  }
}

async function createCourse(token, courseData) {
  const res = await fetch(`${API_BASE}/courses`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(courseData),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("Course creation failed:", JSON.stringify(data));
    process.exit(1);
  }
  return data.data?.course || data.data || data;
}

async function createChapter(token, courseId, chapterData) {
  const res = await fetch(`${API_BASE}/courses/${courseId}/chapters`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(chapterData),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`❌ Failed to create chapter "${chapterData.title}":`, text);
  }
}

// ─── COURSE CONTENT ──────────────────────────────────────────────────────────

const CHAPTERS = [
  {
    order: 1,
    title: "Introduction to NoSQL & MongoDB",
    summary: "Understand the core differences between Relational databases and NoSQL. Learn about BSON, Documents, and Collections.",
    content: `## The Relational vs NoSQL Paradigm

For decades, the standard way to store data was using Relational Database Management Systems (RDBMS) like MySQL or PostgreSQL. In a relational database, data is stored in rigid **Tables** made up of rows and columns, and relationships are formed using Foreign Keys.

**NoSQL (Not Only SQL)** databases were created to solve the limitations of relational databases—primarily horizontal scalability and schema flexibility. 

---

## Why MongoDB?

MongoDB is a **Document-Oriented** NoSQL database. It is incredibly popular in modern web development (specifically the MERN stack) because it stores data in a format almost identical to JSON.

If you are a JavaScript developer, querying MongoDB feels like querying native JavaScript objects.

---

## Terminology Mapping

If you are coming from SQL, here is how the terminology translates to MongoDB:

| SQL (Relational) | MongoDB (NoSQL) | Description |
|---|---|---|
| Database | **Database** | The physical container for data. |
| Table | **Collection** | A grouping of MongoDB documents. |
| Row | **Document** | A single record of data. |
| Column | **Field** | A key-value pair inside a document. |
| JOIN | **$lookup / populate** | Combining data from multiple collections. |

---

## Documents and BSON

MongoDB stores data records as **BSON** (Binary JSON) documents. 
BSON extends the standard JSON model to provide additional data types, strict encoding, and faster parsing.

### A Standard MongoDB Document:

\`\`\`json
{
  "_id": ObjectId("5099803df3f4948bd2f98391"),
  "name": "Asif",
  "age": 28,
  "isActive": true,
  "skills": ["JavaScript", "Node.js", "MongoDB"],
  "address": {
    "city": "Dhaka",
    "country": "Bangladesh"
  },
  "createdAt": ISODate("2026-08-09T10:00:00Z")
}
\`\`\`

Notice the special types that do not exist in standard JSON:
- \`ObjectId\`: A unique 12-byte identifier generated automatically for every document.
- \`ISODate\`: A native date object.

> **Interview Highlight**  
> **Q: Why does MongoDB use BSON instead of plain JSON?**  
> A: JSON is a text-based format. Parsing strings is slow, and JSON only supports basic types (strings, numbers, booleans, null, arrays, objects). BSON is binary-encoded, making it faster to traverse over the network, and it supports rich data types like Dates, ObjectIds, and binary data.`,
    tryItChallenge: "Write down a JSON object that represents a 'Blog Post' containing a title, a body, an array of tags, and a nested author object.",
  },
  {
    order: 2,
    title: "Setup & The MongoDB Shell (mongosh)",
    summary: "Connect to a MongoDB instance, navigate databases, and perform basic interactions using the MongoDB Shell.",
    content: `## Connecting to MongoDB

Whether you are running MongoDB locally via Docker, or using a managed cloud cluster like **MongoDB Atlas**, you interact with the database using a connection string URI.

A standard MongoDB connection string looks like this:
\`mongodb://username:password@localhost:27017/myDatabase\`

---

## The MongoDB Shell (mongosh)

\`mongosh\` is the official interactive JavaScript interface to MongoDB. You can use it to query and update data directly from your terminal, completely independently of Node.js or Express.

### Basic Shell Commands

Once you are connected to the shell, you can use these fundamental commands:

\`\`\`bash
# View all available databases
> show dbs

# Switch to a specific database (or create it if it doesn't exist)
> use asifto

# View all collections in the current database
> show collections
\`\`\`

---

## Inserting Data in the Shell

MongoDB collections do not need to be explicitly created. The moment you insert a document into a collection, both the database and the collection are automatically created.

### insertOne()
Inserts a single document.

\`\`\`javascript
db.users.insertOne({
  name: "John Doe",
  email: "john@example.com",
  age: 30
})
\`\`\`
*Output:*
\`{ acknowledged: true, insertedId: ObjectId("64b...") }\`

### insertMany()
Inserts an array of documents.

\`\`\`javascript
db.users.insertMany([
  { name: "Alice", role: "admin" },
  { name: "Bob", role: "user" }
])
\`\`\`

> **Interview Highlight**  
> **Q: What happens if you try to insert a document without providing an \`_id\` field?**  
> A: MongoDB will automatically generate a unique 12-byte \`ObjectId\` and assign it to the \`_id\` field before inserting the document into the database. You can manually provide an \`_id\` if you prefer, as long as it is guaranteed to be unique.`,
    tryItChallenge: "Install the MongoDB Shell (mongosh). Connect to a local instance, switch to a database named `shop`, and insert a product document into a `products` collection.",
  },
  {
    order: 3,
    title: "Querying Documents (The Find API)",
    summary: "Master the art of retrieving data from MongoDB using find, findOne, query operators, and projection.",
    content: `## Basic Retrieval

Retrieving data in MongoDB is done using the \`find()\` and \`findOne()\` methods.

### 1. Retrieve all documents
Passing an empty object \`{}\` as the query filter returns everything in the collection.
\`\`\`javascript
db.users.find({})
\`\`\`

### 2. Retrieve by Exact Match
\`\`\`javascript
db.users.find({ role: "admin" })
\`\`\`

### 3. Retrieve a Single Document
If you only need one result (like fetching a user profile), use \`findOne()\`. It returns the object itself, rather than an array/cursor.
\`\`\`javascript
db.users.findOne({ email: "asif@mazlis.com" })
\`\`\`

---

## Query Operators

MongoDB provides powerful operators to filter data without writing complex JavaScript. All operators begin with a \`$\` sign.

### Comparison Operators
- \`$eq\`: Equal to
- \`$ne\`: Not equal to
- \`$gt\` / \`$gte\`: Greater than / Greater than or equal to
- \`$lt\` / \`$lte\`: Less than / Less than or equal to
- \`$in\`: Matches any of the values specified in an array

**Example:** Find all users older than 25 who are either an admin or a moderator.
\`\`\`javascript
db.users.find({
  age: { $gt: 25 },
  role: { $in: ["admin", "moderator"] }
})
\`\`\`

### Logical Operators
- \`$and\`: Joins query clauses with a logical AND.
- \`$or\`: Joins query clauses with a logical OR.

**Example:** Find products that are either out of stock OR cost more than $500.
\`\`\`javascript
db.products.find({
  $or: [
    { stock: 0 },
    { price: { $gt: 500 } }
  ]
})
\`\`\`

---

## Projection (Selecting specific fields)

When a document has 50 fields, fetching all of them over the network uses unnecessary bandwidth. **Projection** allows you to specify exactly which fields you want to return.

The second argument to \`find()\` is the projection object. \`1\` means include, \`0\` means exclude.

\`\`\`javascript
// Fetch all users, but ONLY return their name and email
// (The _id is returned by default unless explicitly excluded)
db.users.find({}, { name: 1, email: 1, _id: 0 })
\`\`\`

> **Interview Highlight**  
> **Q: Can you mix inclusion (1) and exclusion (0) in a single projection?**  
> A: No. With the sole exception of the \`_id\` field, you cannot mix inclusions and exclusions. You must either whitelist the fields you want (\`1\`), or blacklist the fields you don't want (\`0\`).`,
    tryItChallenge: "Write a query to find all documents in the `movies` collection where the `rating` is greater than 8, and only return the `title` and `year` fields.",
  },
  {
    order: 4,
    title: "Updating Documents",
    summary: "Modify existing data using updateOne, updateMany, and atomic update operators like $set and $push.",
    content: `## The Update API

To modify existing documents, you use \`updateOne()\` or \`updateMany()\`.

Both methods take two primary arguments:
1. **The Filter:** Which document(s) to target.
2. **The Update Document:** The modifications to apply.

**CRITICAL RULE:** You almost *never* pass raw objects as the update document. If you do, it will completely overwrite and replace the entire document! You must use **Update Operators**.

---

## Update Operators

### 1. \`$set\` (Modifying specific fields)
Replaces the value of a field. If the field doesn't exist, it adds it.

\`\`\`javascript
db.users.updateOne(
  { email: "john@example.com" }, // Filter
  { $set: { status: "active", verifiedAt: new Date() } } // Update
)
\`\`\`

### 2. \`$unset\` (Removing fields)
Completely removes a field from a document.

\`\`\`javascript
db.users.updateOne(
  { email: "john@example.com" },
  { $unset: { temporaryPassword: "" } }
)
\`\`\`

### 3. \`$inc\` (Incrementing Numbers)
Atomically increments a number field by a specified value. Perfect for page views or shopping cart quantities.

\`\`\`javascript
// Increment the page views by 1
db.articles.updateOne(
  { _id: ObjectId("5f...") },
  { $inc: { views: 1 } }
)
\`\`\`

---

## Array Update Operators

MongoDB makes it incredibly easy to work with arrays inside your documents.

### \`$push\` (Adding to an array)
Appends a value to an array field.

\`\`\`javascript
db.users.updateOne(
  { email: "asif@mazlis.com" },
  { $push: { skills: "React" } }
)
\`\`\`

### \`$pull\` (Removing from an array)
Removes all array elements that match a specified query.

\`\`\`javascript
// Remove "Angular" from the skills array
db.users.updateOne(
  { email: "asif@mazlis.com" },
  { $pull: { skills: "Angular" } }
)
\`\`\`

> **Interview Highlight**  
> **Q: What is the third argument to an update function, and what does \`upsert: true\` do?**  
> A: The third argument is the options object. Passing \`{ upsert: true }\` tells MongoDB: "Try to find a document matching the filter and update it. If no document matches the filter, *create a brand new document* combining the filter criteria and the \`$set\` parameters."`,
    tryItChallenge: "Write an `updateOne` command that targets a user by their `_id`, increments their `loginCount` by 1, and pushes the current Date to their `loginHistory` array.",
  },
  {
    order: 5,
    title: "Deleting Documents & Capped Collections",
    summary: "Learn how to permanently remove data using deleteOne, deleteMany, and understand specialized Capped Collections for logging.",
    content: `## Deleting Data

Removing documents is straightforward. You provide a filter, and MongoDB removes matching records.

### \`deleteOne()\`
Deletes the **first** document that matches the filter.

\`\`\`javascript
db.users.deleteOne({ email: "spammer@bad.com" })
\`\`\`

### \`deleteMany()\`
Deletes **all** documents that match the filter. 

\`\`\`javascript
// Delete all users whose accounts are not verified and are older than 30 days
db.users.deleteMany({
  isVerified: false,
  createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
})
\`\`\`

> **Warning:** Running \`db.collection.deleteMany({})\` with an empty filter will instantly delete every single document in the collection!

---

## Soft Deletes vs Hard Deletes

In production applications, you rarely execute a hard delete (\`deleteOne\`). If a user accidentally deletes their account, or if a hacker maliciously deletes data, it is gone forever.

**Soft Deletion** is a best practice where you never actually delete the record from the database. Instead, you add a boolean flag or a timestamp indicating it is deleted.

\`\`\`javascript
// Instead of deleteOne(), we use updateOne()
db.users.updateOne(
  { _id: ObjectId("5f...") },
  { $set: { isDeleted: true, deletedAt: new Date() } }
)
\`\`\`
Then, in all your \`find()\` queries throughout your app, you append \`{ isDeleted: { $ne: true } }\`.

---

## Capped Collections

Sometimes you *want* data to be deleted automatically. 
A **Capped Collection** is a specialized MongoDB collection with a fixed maximum size (in bytes or document count). 

Once a capped collection reaches its limit, it behaves like a circular queue: the oldest documents are automatically overwritten by the newest documents.

**Use cases for Capped Collections:**
- Storing high-volume application logs.
- Caching recent sensor data from IoT devices.

\`\`\`javascript
// Create a collection capped at 100,000 bytes or 5000 documents
db.createCollection("system_logs", {
  capped: true,
  size: 100000,
  max: 5000
})
\`\`\`

> **Interview Highlight**  
> **Q: Can you use \`deleteOne\` or \`updateMany\` on a Capped Collection?**  
> A: No. Documents in a capped collection cannot be explicitly deleted. You also cannot perform updates that increase the document's size. Capped collections are designed purely for extreme-speed inserts and automatic FIFO (First-In, First-Out) purging.`,
    tryItChallenge: "Create a capped collection named `error_logs` with a maximum size of 50000 bytes. Insert 3 documents into it to verify it works.",
  },
  {
    order: 6,
    title: "Introduction to Mongoose & Connections",
    summary: "Discover why Object Document Mappers (ODMs) are crucial. Connect an Express.js server to MongoDB using Mongoose.",
    content: `## What is an ODM?

MongoDB is a *schema-less* database. You can insert a document with \`{ age: 25 }\` and immediately insert another with \`{ age: "twenty-five" }\` into the same collection. While this flexibility is great for prototyping, it is **disastrous** for large-scale production apps. 

**Mongoose** is an Object Document Mapper (ODM) for Node.js. It sits between your Node.js application and the MongoDB database. 

Mongoose provides:
1. **Schemas:** Enforces a rigid structure (e.g., \`age\` must be a Number).
2. **Validation:** Rejects invalid data before it hits the database.
3. **Middleware:** Hooks that run before or after saving data.
4. **Plugins & Helpers:** Built-in methods for complex queries.

---

## Connecting to MongoDB with Mongoose

To use Mongoose, install it via npm:
\`\`\`bash
npm install mongoose
\`\`\`

Connecting is usually done in your main \`server.js\` file, or abstracted into a separate \`config/db.js\` file.

\`\`\`javascript
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Mongoose connect returns a Promise
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are no longer required in Mongoose 6+, 
      // but you will see them in older codebases:
      useNewUrlParser: true, 
      useUnifiedTopology: true
    });
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`Error connecting to MongoDB: \${error.message}\`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
\`\`\`

---

## Connection Events

Mongoose emits events that you can listen to. This is incredibly useful for monitoring the health of your database connection.

\`\`\`javascript
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB Cluster');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});
\`\`\`

> **Interview Highlight**  
> **Q: Should you connect to MongoDB inside every single route handler?**  
> A: Absolutely not. You should establish the connection **once** when your Node.js server starts. Mongoose manages an internal "connection pool" (defaulting to 100 sockets). It keeps these connections open and reuses them for all incoming HTTP requests, making your API drastically faster.`,
    tryItChallenge: "Create a basic Express server that calls `connectDB()` before calling `app.listen()`. Verify that the console logs the successful connection.",
  },
  {
    order: 7,
    title: "Schemas & Data Types",
    summary: "Define the structure of your data. Master Mongoose Schema Types including nested objects and arrays.",
    content: `## Defining a Schema

A Mongoose schema defines the shape of the documents within a collection.

\`\`\`javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  inStock: Boolean
});
\`\`\`

While the short-hand syntax above is clean, you usually want to provide configuration objects for each field to add default values and constraints.

---

## Mongoose Schema Types

Mongoose supports several built-in types:

- **String:** Text data.
- **Number:** Integer or floating point.
- **Date:** Stores an ISODate.
- **Boolean:** \`true\` or \`false\`.
- **ObjectId:** Used to store \`_id\` references to other documents.
- **Array:** A list of items.

### Complex Schema Example

\`\`\`javascript
const userSchema = new mongoose.Schema({
  // String with constraints
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true // Removes whitespace from ends
  },
  
  // Number with defaults
  age: { 
    type: Number, 
    default: 18 
  },
  
  // Date, defaulting to the exact moment of creation
  joinedAt: { 
    type: Date, 
    default: Date.now 
  },
  
  // Array of Strings
  tags: [String],
  
  // Nested Object (Sub-document)
  address: {
    street: String,
    city: String,
    zipCode: Number
  }
}, {
  // Schema Options
  timestamps: true // Automatically adds createdAt and updatedAt
});
\`\`\`

---

## Timestamps

The \`timestamps: true\` option is one of the most powerful features of Mongoose. 
- When a document is created, Mongoose automatically injects a \`createdAt\` Date.
- When you use \`save()\`, \`updateOne()\`, or \`findOneAndUpdate()\`, Mongoose automatically updates the \`updatedAt\` Date.

You never have to manually manage these fields!

> **Interview Highlight**  
> **Q: What is the difference between \`default: Date.now\` and \`default: Date.now()\` in a Schema?**  
> A: If you use \`Date.now()\`, the function executes *exactly once* when the schema is compiled, meaning every single document will have the exact same date! You must pass the function reference \`Date.now\` (without parentheses) so Mongoose executes it dynamically every time a new document is created.`,
    tryItChallenge: "Define a `Course` schema with a title, a price that defaults to 0, an array of strings called `topics`, and enable automatic timestamps.",
  },
  {
    order: 8,
    title: "Schema Validation",
    summary: "Ensure data integrity by using built-in validators, enums, and writing custom regex and async validators.",
    content: `## Built-in Validators

Mongoose provides several built-in validators to reject bad data before it attempts to hit the MongoDB server.

- **All Types:** \`required\`
- **Numbers:** \`min\`, \`max\`
- **Strings:** \`enum\`, \`match\` (regex), \`minlength\`, \`maxlength\`

### Example Validation

\`\`\`javascript
const reviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the review'],
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating cannot be more than 10']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  }
});
\`\`\`
*(Notice how we pass an array where the second element is the custom error message).*

---

## Regex Validation (Match)

You can validate strings against a Regular Expression using the \`match\` property. This is incredibly common for validating emails and URLs.

\`\`\`javascript
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: [
      /^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$/,
      'Please add a valid email'
    ]
  }
});
\`\`\`

---

## Custom Validators

Sometimes built-in validators aren't enough. You can write your own custom validation logic.

\`\`\`javascript
const eventSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: {
    type: Date,
    required: true,
    validate: {
      // The validator function. 'value' is the endDate.
      validator: function(value) {
        // 'this' refers to the current document being validated
        return value > this.startDate; 
      },
      message: 'End date must be after the start date'
    }
  }
});
\`\`\`

> **Interview Highlight**  
> **Q: Do validators run on Update operations?**  
> A: By default, Mongoose validators only run when you create a new document using \`save()\` or \`create()\`. If you use \`findOneAndUpdate()\` or \`updateOne()\`, validators are bypassed! To force validation on updates, you must explicitly pass \`{ runValidators: true }\` in your update options.`,
    tryItChallenge: "Create a custom validator for a `password` field that ensures the string contains at least one number.",
  },
  {
    order: 9,
    title: "Mongoose Models & CRUD",
    summary: "Compile Schemas into Models and perform Create, Read, Update, and Delete operations using Mongoose methods.",
    content: `## Compiling Models

A Schema is just a blueprint. To actually interact with the database, you must compile the Schema into a **Model**.

\`\`\`javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({ name: String, age: Number });

// Compile the model
// Arg 1: The singular, capitalized name of the model
// Arg 2: The schema
const User = mongoose.model('User', userSchema);

module.exports = User;
\`\`\`
*Mongoose will automatically look for a lowercase, plural collection in the database named \`users\`.*

---

## Creating Data

### \`Model.create()\`
The fastest way to insert data.

\`\`\`javascript
const newUser = await User.create({ name: "Alice", age: 25 });
\`\`\`

### \`new Model()\` + \`.save()\`
Useful if you want to instantiate the object, modify it locally, and then save it later.

\`\`\`javascript
const user = new User({ name: "Bob" });
user.age = 30; // Modify locally
await user.save(); // Actually insert into MongoDB
\`\`\`

---

## Reading Data

Mongoose provides an elegant chainable syntax for querying data.

\`\`\`javascript
// Find all users over 20, sort by age descending, limit to 5
const users = await User.find({ age: { $gt: 20 } })
  .sort('-age') // Prefix with '-' for descending
  .limit(5)
  .select('name age'); // Only return these two fields

// Find by ID
const specificUser = await User.findById("5f7a...");
\`\`\`

---

## Updating Data

### \`findByIdAndUpdate()\`
Finds a document, updates it, and returns the document.

\`\`\`javascript
const updatedUser = await User.findByIdAndUpdate(
  "5f7a...",
  { age: 31 },
  { 
    new: true, // Return the updated document, not the old one
    runValidators: true // Force schema validation
  }
);
\`\`\`

### \`.save()\` (The preferred way)
Fetching the document first, modifying it, and saving it is often preferred because it triggers Mongoose Middleware (Hooks).

\`\`\`javascript
const user = await User.findById("5f7a...");
user.age = 31;
await user.save(); // Triggers 'pre-save' hooks!
\`\`\`

---

## Deleting Data

\`\`\`javascript
// Delete a specific document
await User.findByIdAndDelete("5f7a...");

// Delete many
await User.deleteMany({ status: "banned" });
\`\`\`

> **Interview Highlight**  
> **Q: What is the difference between a Model (Static) Method and an Instance Method?**  
> A: A Static Method is called on the Model itself (\`User.findByEmail()\`), usually to query the database. An Instance Method is called on a specific document instance (\`user.generateAuthToken()\`), usually to perform an action related to that specific piece of data.`,
    tryItChallenge: "Write an Express route that receives an ID from `req.params.id`, finds the document using Mongoose, and deletes it. Return a 404 if the document isn't found.",
  },
  {
    order: 10,
    title: "Virtuals & Middlewares (Hooks)",
    summary: "Compute properties on the fly without storing them in the DB, and use pre/post hooks for password hashing.",
    content: `## Virtual Properties

A **Virtual** is a property that you can get and set, but it does **not** exist in the MongoDB database. It is computed dynamically.

Why use them? Imagine you have \`firstName\` and \`lastName\` in the database. Instead of storing \`fullName\` (which wastes space and risks desynchronization), you compute it on the fly.

\`\`\`javascript
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String
}, {
  // Ensure virtuals are included when converting the document to JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Define the virtual property 'fullName'
userSchema.virtual('fullName').get(function() {
  return \`\${this.firstName} \${this.lastName}\`;
});
\`\`\`

Now, if you fetch a user, you can access \`user.fullName\` just like a normal field!

---

## Mongoose Middlewares (Hooks)

Middlewares (also called hooks) are functions that run at specific stages of a document's lifecycle. 

The two most common hooks are:
1. **Pre-hooks:** Run *before* an operation (e.g., \`pre('save')\`).
2. **Post-hooks:** Run *after* an operation (e.g., \`post('save')\`).

### The Classic Use Case: Password Hashing

You never want to save plain-text passwords to the database. We can use a \`pre('save')\` hook to intercept the document right before it hits MongoDB, and hash the password using \`bcrypt\`.

\`\`\`javascript
const bcrypt = require('bcryptjs');

// Run this function BEFORE saving the document
userSchema.pre('save', async function(next) {
  
  // 'this' refers to the document being saved
  
  // If the password field wasn't modified, skip hashing!
  if (!this.isModified('password')) {
    return next();
  }

  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  next(); // Tell Mongoose to proceed with saving
});
\`\`\`

Because this is a hook on the Schema, you **never** have to worry about hashing passwords in your Controllers. Mongoose handles it automatically every time you call \`user.save()\`.

### Post Hooks

Post hooks are useful for logging or triggering background jobs after a successful save.

\`\`\`javascript
userSchema.post('save', function(doc, next) {
  console.log(\`New user created with ID: \${doc._id}\`);
  next();
});
\`\`\`

> **Interview Highlight**  
> **Q: Why must you use a standard \`function()\` instead of an Arrow Function \`() => {}\` when writing Mongoose Hooks and Virtuals?**  
> A: Because you need access to the \`this\` keyword! In Mongoose, \`this\` refers to the document being processed. Arrow functions do not bind their own \`this\` (they inherit it from the outer scope), which will cause \`this\` to be undefined.`,
    tryItChallenge: "Create a `pre('remove')` hook (or `pre('deleteOne')`) on a User schema that automatically deletes all Posts authored by that user when the user is deleted.",
  },
  {
    order: 11,
    title: "Relationships & Referencing (Normalization)",
    summary: "Understand how to build relationships between different collections using ObjectId references.",
    content: `## Data Modeling in NoSQL

Unlike SQL databases, MongoDB does not enforce relationships with Foreign Keys. You must decide whether to **Reference** (Normalize) data or **Embed** (Denormalize) data.

This chapter focuses on **Referencing**, which is similar to how SQL databases work.

---

## Defining a Reference

Suppose we have a \`User\` collection and a \`Post\` collection. We want to associate every post with the user who authored it.

We do this by saving the User's \`_id\` inside the Post document using the \`mongoose.Schema.Types.ObjectId\` type, and the \`ref\` property.

\`\`\`javascript
const mongoose = require('mongoose');

// The Post Schema
const postSchema = new mongoose.Schema({
  title: String,
  body: String,
  // This is the "Foreign Key"
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Must exactly match the name of the compiled Model!
    required: true
  }
});

const Post = mongoose.model('Post', postSchema);
\`\`\`

---

## Inserting Referenced Data

To create a post, you simply pass the string \`_id\` of an existing user.

\`\`\`javascript
const newPost = await Post.create({
  title: "My First Blog Post",
  body: "Hello World!",
  author: "5f7a2b9..." // A valid User ObjectId
});
\`\`\`

If you query this post back from the database:
\`\`\`javascript
const post = await Post.findById("6a4b...");
console.log(post.author); // Output: "5f7a2b9..." (Just a string!)
\`\`\`

> **Interview Highlight**  
> **Q: When should you Reference data instead of Embedding it?**  
> A: You should reference data when the related data is large, when the relationship is One-to-Many (where "Many" is a huge, unbounded number like a famous user having 1,000,000 followers), or when the related data is frequently updated independently of the parent document.`,
    tryItChallenge: "Create a `Review` schema that contains a reference to a `User` (the person who wrote it) and a `Product` (the item being reviewed).",
  },
  {
    order: 12,
    title: "Population (Simulating JOINs)",
    summary: "Learn how to use Mongoose .populate() to automatically replace ObjectId references with the actual documents.",
    content: `## The Problem with Raw References

In the previous chapter, querying a \`Post\` returned the \`author\` as a raw \`ObjectId\` string. If we are rendering a blog page, we want to show the author's **name** and **avatar**, not a random string!

In SQL, you would solve this with a \`JOIN\`. 
In MongoDB, the database itself uses \`$lookup\`, but Mongoose provides a much easier abstraction called **Population**.

---

## Basic Population

You can chain \`.populate('fieldName')\` to any Mongoose query. Mongoose will take the \`ObjectId\` in that field, run a *second query* behind the scenes to fetch the referenced document, and replace the ID with the full object.

\`\`\`javascript
const post = await Post.findById("6a4b...")
  .populate('author');

console.log(post.author.name); // "Asif"
\`\`\`

### Populating Specific Fields

If the \`User\` document is huge, you probably don't want to fetch their hashed password and private email just to display their name on a blog post.

You can pass a second argument to \`populate\` to specify which fields to return (a space-separated string).

\`\`\`javascript
const posts = await Post.find()
  .populate('author', 'name avatar -_id'); // Include name, avatar. Exclude _id.
\`\`\`

---

## Deep Population

What if a \`Post\` has an array of \`comments\`, and each \`comment\` has an \`author\` reference? You can deeply populate nested paths!

\`\`\`javascript
const post = await Post.findById(postId).populate({
  path: 'comments',
  populate: {
    path: 'author',
    select: 'name avatar'
  }
});
\`\`\`

---

## Virtual Populate

Imagine you are looking at a \`User\` profile, and you want to see all the \`Posts\` they have written. But wait—the \`User\` schema doesn't have an array of Posts. The \`Post\` schema has the \`author\` reference!

You can use **Virtual Populate** to fetch the posts without modifying the database structure.

\`\`\`javascript
// In the User Schema:
userSchema.virtual('myPosts', {
  ref: 'Post',          // The model to use
  localField: '_id',    // The field in this User model
  foreignField: 'author' // The matching field in the Post model
});

// Now you can populate it!
const user = await User.findById(userId).populate('myPosts');
\`\`\`

> **Interview Highlight**  
> **Q: Is Mongoose \`.populate()\` as efficient as an SQL \`JOIN\`?**  
> A: No. A SQL JOIN is optimized at the database engine level. Mongoose \`populate()\` actually executes *multiple* queries to the database and merges them in Node.js memory. While it is incredibly convenient, heavy population over huge datasets can cause severe memory spikes in your Node.js server.`,
    tryItChallenge: "Write a query that finds all Products in a specific Category, and populates the `reviews` array on each product.",
  },
  {
    order: 13,
    title: "Embedded Documents (Denormalization)",
    summary: "Discover the power of NoSQL by nesting documents within documents to optimize read performance.",
    content: `## What is Denormalization?

In SQL, you are taught to never duplicate data. If an Address belongs to a User, you put the Address in a separate table and link them with an ID.

In MongoDB, reads are cheap, but joins are expensive. If data is almost always accessed together, it should be stored together in the same document. This is called **Embedding** (or Denormalization).

---

## Embedding a Single Document

If a User has one Address, and we *never* need to query the Address collection independently, we embed it directly.

\`\`\`javascript
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  // The Address is embedded directly!
  address: {
    street: String,
    city: String,
    zipCode: String
  }
});
\`\`\`

When you query the User, the Address comes with it instantly in a single disk read.

---

## Embedding an Array of Subdocuments

You can also embed arrays of objects. A classic example is a blog post with a few comments.

\`\`\`javascript
// 1. Define the Subdocument Schema (Optional but recommended)
const commentSchema = new mongoose.Schema({
  body: String,
  authorName: String,
  createdAt: { type: Date, default: Date.now }
});

// 2. Embed it in the Parent Schema
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  comments: [commentSchema] // Array of embedded documents
});
\`\`\`

### Adding a Subdocument

To add a comment, you push it to the array and save the parent document.

\`\`\`javascript
const post = await Post.findById(postId);
post.comments.push({ body: "Great article!", authorName: "Alice" });
await post.save();
\`\`\`

### Removing a Subdocument

Mongoose subdocuments get their own \`_id\` by default. You can use this ID to easily remove them using the \`id()\` method.

\`\`\`javascript
const post = await Post.findById(postId);
// Find the subdocument and call .deleteOne() on it
post.comments.id(commentId).deleteOne();
await post.save();
\`\`\`

> **Interview Highlight**  
> **Q: What is the main danger of embedding arrays of subdocuments?**  
> A: The 16MB document limit. A single MongoDB document cannot exceed 16 Megabytes. If a blog post goes viral and gets 50,000 comments, embedding those comments will bloat the document until it crashes the database. If an array has the potential to grow infinitely (Unbounded Growth), you MUST use Referencing instead of Embedding!`,
    tryItChallenge: "Create a `Course` schema that embeds an array of `Chapter` subdocuments. Write the code to push a new chapter to an existing course.",
  },
  {
    order: 14,
    title: "Indexing for Performance",
    summary: "Dramatically speed up your queries by understanding and applying Single, Compound, and Unique indexes.",
    content: `## What is an Index?

Imagine looking for a specific word in a 1,000-page textbook without an index. You would have to read every single page (a **Collection Scan**). If you use the index at the back of the book, you can jump straight to the correct page in seconds.

Indexes in MongoDB work exactly the same way. They are special data structures that store a small portion of the collection's data in an easy-to-traverse form.

---

## Defining Indexes in Mongoose

You can define indexes directly in your Mongoose Schema.

### 1. Single Field Index
If you frequently query users by their email, you should index the email field.

\`\`\`javascript
const userSchema = new mongoose.Schema({
  name: String,
  email: { 
    type: String, 
    index: true // Creates a standard index
  }
});
\`\`\`

### 2. Unique Index
A unique index ensures no two documents can have the same value for a field. Mongoose automatically creates an index when you use \`unique: true\`.

\`\`\`javascript
email: { 
  type: String, 
  unique: true // Automatically creates a unique index
}
\`\`\`

### 3. Compound Index
If you frequently query by *multiple* fields at the same time (e.g., finding products by category AND price), a compound index is required.

Compound indexes are defined at the schema level, not the field level.

\`\`\`javascript
const productSchema = new mongoose.Schema({
  category: String,
  price: Number
});

// 1 means ascending order, -1 means descending order
productSchema.index({ category: 1, price: -1 });
\`\`\`

---

## The Cost of Indexes

If indexes make queries so fast, why not index every single field?

Because every time you Insert, Update, or Delete a document, MongoDB must also update every associated Index. Having too many indexes will cause your write performance to plummet and consume massive amounts of RAM.

**Rule of Thumb:** Only index fields that are frequently used in \`find()\`, \`sort()\`, or \`match\` queries.

> **Interview Highlight**  
> **Q: What is the ESR (Equality, Sort, Range) rule for Compound Indexes?**  
> A: It is the optimal order for fields in a compound index:
> 1. **E**quality: Fields you check for exact matches (e.g., \`category: "Electronics"\`).
> 2. **S**ort: Fields you use to sort the results.
> 3. **R**ange: Fields you use for range queries (e.g., \`price: { $gt: 50 }\`).`,
    tryItChallenge: "Define a schema for a `Flight` booking system. Create a compound index that optimizes a search for flights matching a specific `origin`, `destination`, and `departureDate`.",
  },
  {
    order: 15,
    title: "Aggregation Pipelines",
    summary: "Perform complex data analysis, filtering, grouping, and advanced joins using the powerful Aggregation Framework.",
    content: `## What is Aggregation?

While \`find()\` is great for retrieving data, it cannot perform complex calculations. What if you want to find the total revenue generated by each user? Or calculate the average rating of all products in the "Electronics" category?

The **Aggregation Framework** is a pipeline of operations. You pass documents through a series of stages. Each stage transforms the data and passes it to the next stage.

---

## Core Aggregation Stages

### 1. \`$match\` (Filter)
Filters the documents to pass only the documents that match the specified conditions. It behaves identically to \`find()\`. **Always put \`$match\` as early in the pipeline as possible to reduce the number of documents being processed.**

### 2. \`$group\` (Summarize)
Groups input documents by a specified \`_id\` expression and applies accumulator expressions (like \`$sum\`, \`$avg\`) to each group.

### 3. \`$project\` (Reshape)
Passes along the documents with only the specified fields, or adds new computed fields.

### 4. \`$sort\` & \`$limit\`
Sorts the documents and restricts the number of documents passed to the next stage.

---

## A Complete Example

Let's calculate the total revenue generated by the "Electronics" category, grouped by the manufacturer, sorted by the highest revenue.

\`\`\`javascript
const results = await Order.aggregate([
  // Stage 1: Filter only completed electronics orders
  { 
    $match: { 
      category: "Electronics",
      status: "COMPLETED" 
    } 
  },
  
  // Stage 2: Group by Manufacturer and sum the total price
  { 
    $group: { 
      _id: "$manufacturer", // Group by this field
      totalRevenue: { $sum: "$price" }, // Accumulator: sum the price
      averagePrice: { $avg: "$price" }, // Accumulator: average the price
      totalOrders: { $sum: 1 } // Accumulator: count documents
    } 
  },
  
  // Stage 3: Sort by highest revenue
  { 
    $sort: { totalRevenue: -1 } 
  },
  
  // Stage 4: Reshape the output to be cleaner
  {
    $project: {
      _id: 0, // Hide the _id field
      manufacturerName: "$_id", // Rename _id to manufacturerName
      totalRevenue: 1,
      totalOrders: 1
    }
  }
]);

console.log(results);
/* Output:
[
  { manufacturerName: "Apple", totalRevenue: 150000, totalOrders: 150 },
  { manufacturerName: "Sony", totalRevenue: 85000, totalOrders: 200 }
]
*/
\`\`\`

> **Interview Highlight**  
> **Q: How do you perform a JOIN in an Aggregation Pipeline?**  
> A: You use the \`$lookup\` stage. It performs a left outer join to an unsharded collection in the same database to filter in documents from the "joined" collection for processing. It is the raw MongoDB equivalent of Mongoose's \`.populate()\`.`,
    tryItChallenge: "Write an aggregation pipeline on a `Users` collection that matches users from 'New York', groups them by their `age`, and counts how many users are in each age bracket.",
  }
];

// ─── MAIN SEEDER ─────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Starting MongoDB/Mongoose Course Seeder Phase 1...\n");

  const token = await login();

  console.log("🧹 Cleaning up existing MongoDB courses...");
  await deleteExistingCourses(token);

  console.log("📚 Creating MongoDB course...");
  const course = await createCourse(token, {
    title: "MongoDB & Mongoose: The Complete NoSQL Guide",
    subtitle:
      "Master modern database architecture. Learn NoSQL fundamentals, CRUD operations, advanced Mongoose modeling, and powerful Aggregation Pipelines.",
    techId: "mongodb",
    level: "Beginner - Advanced",
    duration: "Self-paced",
    order: 4,
  });
  console.log(`✅ Course created! ID: ${course._id}\n`);

  console.log(`📖 Creating Chapters...`);
  
  for (const chapter of CHAPTERS) {
    process.stdout.write(`  Chapter ${chapter.order}: ${chapter.title.split(":")[0]}... `);
    await createChapter(token, course._id, chapter);
    console.log("✅");
  }

  console.log("\n🎉 Seeded successfully!");
}

main().catch((err) => {
  console.error("\n❌ Fatal Error:", err.message);
  process.exit(1);
});
