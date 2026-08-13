export const CSS_EXAM_QUESTIONS = [
  {
    question: "What is the maximum BSON document size limit in MongoDB?",
    options: ["4 Megabytes", "8 Megabytes", "16 Megabytes", "32 Megabytes"],
    correctIndex: 2,
    explanation:
      "The maximum BSON document size is 16 megabytes. This limit helps ensure that a single document cannot use excessive amount of RAM or bandwidth.",
    difficulty: "medium",
    status: "published",
  },
  {
    question:
      "In Mongoose, how can you define a schema field (like a password) so that it is excluded from query results by default?",
    options: [
      "hidden: true",
      "select: false",
      "exclude: true",
      "private: true",
    ],
    correctIndex: 1,
    explanation:
      "By setting `select: false` on a schema path, Mongoose will exclude that field from the results of queries unless it is explicitly selected using `.select('+password')`.",
    difficulty: "medium",
    status: "published",
  },
  {
    question:
      "Which option can be passed to an update method to create a new document if no documents match the query filter?",
    options: [
      "{ insert: true }",
      "{ createIfMissing: true }",
      "{ upsert: true }",
      "{ new: true }",
    ],
    correctIndex: 2,
    explanation:
      "The `upsert: true` option tells MongoDB to update the document if it exists, or insert a new document based on the query criteria and update operations if it doesn't.",
    difficulty: "easy",
    status: "published",
  },
  {
    question:
      "What is the main difference between `Model.find()` and `Model.findOne()` in Mongoose?",
    options: [
      "`findOne()` returns a single document object, while `find()` returns an array of documents.",
      "`findOne()` throws an error if multiple documents match, while `find()` does not.",
      "`findOne()` uses an index automatically, while `find()` performs a collection scan.",
      "`find()` ignores the `limit` operator, while `findOne()` enforces a limit of 1.",
    ],
    correctIndex: 0,
    explanation:
      "`Model.findOne()` returns the first document that matches the query as a single object (or null). `Model.find()` always returns an array, even if only one document matches or none match.",
    difficulty: "easy",
    status: "published",
  },
  {
    question:
      "Which MongoDB operator allows you to compare two different fields within the same document in a query?",
    options: ["$compare", "$expr", "$matchFields", "$eval"],
    correctIndex: 1,
    explanation:
      'The `$expr` operator allows the use of aggregation expressions within the query language, which is necessary when you want to compare the values of two fields in the same document (e.g., `$expr: { $gt: [ "$spent", "$budget" ] }`).',
    difficulty: "hard",
    status: "published",
  },
  {
    question: "What is GridFS in the context of MongoDB?",
    options: [
      "A graphical user interface for managing databases.",
      "A specification for storing and retrieving files that exceed the 16MB BSON-document size limit.",
      "A caching layer for faster read operations.",
      "A distributed file system used to store database backups.",
    ],
    correctIndex: 1,
    explanation:
      "GridFS is a convention and specification for storing and retrieving large files, such as images, audio, or video files, that exceed the 16MB document size limit by breaking them into smaller chunks.",
    difficulty: "medium",
    status: "published",
  },
  {
    question:
      "Which Mongoose method can be used on a document instance to check if any of its paths have been modified before saving?",
    options: [
      "doc.isChanged()",
      "doc.wasUpdated()",
      "doc.isModified()",
      "doc.hasMutations()",
    ],
    correctIndex: 2,
    explanation:
      "The `doc.isModified()` method returns true if any paths on the document have been modified (or if a specific path has been modified if a path string is passed as an argument).",
    difficulty: "medium",
    status: "published",
  },
  {
    question:
      "Which command-line utility is used to create a binary export (backup) of the contents of a MongoDB database?",
    options: ["mongoexport", "mongobackup", "mongodump", "mongosave"],
    correctIndex: 2,
    explanation:
      "`mongodump` is a utility for creating a binary export of the contents of a database. (`mongoexport` is used for exporting data to JSON or CSV formats).",
    difficulty: "medium",
    status: "published",
  },
  {
    question:
      "Which MongoDB update operator multiplies the value of a field by a number?",
    options: ["$multiply", "$mul", "$product", "$times"],
    correctIndex: 1,
    explanation:
      "The `$mul` operator multiplies the value of a field by the specified number.",
    difficulty: "easy",
    status: "published",
  },
  {
    question: "What is a 'Capped Collection' in MongoDB?",
    options: [
      "A collection that encrypts all of its documents.",
      "A collection with a fixed maximum size that automatically overwrites its oldest entries when it reaches maximum capacity.",
      "A collection restricted to a maximum of 1,000 documents.",
      "A collection that prevents users from deleting any documents.",
    ],
    correctIndex: 1,
    explanation:
      "Capped collections are fixed-size collections that support high-throughput operations. They work like circular buffers: once a collection fills its allocated space, it makes room for new documents by overwriting the oldest ones.",
    difficulty: "hard",
    status: "published",
  },
  {
    question:
      "Which method should you use in Mongoose to find a document, delete it, and return the deleted document?",
    options: [
      "Model.findOneAndDelete()",
      "Model.deleteOne()",
      "Model.findAndRemove()",
      "Model.removeOne()",
    ],
    correctIndex: 0,
    explanation:
      "`Model.findOneAndDelete()` (or `findByIdAndDelete()`) issues a MongoDB `findOneAndDelete` command, which removes the document and returns the removed document to the application.",
    difficulty: "medium",
    status: "published",
  },
  {
    question:
      "Which MongoDB operator sets the value of a field to the current date, either as a Date or a Timestamp?",
    options: ["$today", "$now", "$currentDate", "$timestamp"],
    correctIndex: 2,
    explanation:
      "The `$currentDate` operator sets the value of a field to the current date, either as a BSON Date or a BSON Timestamp.",
    difficulty: "easy",
    status: "published",
  },
  {
    question:
      "In a MongoDB projection, how can you limit an array field to only return the first 5 elements?",
    options: [
      "{ arrayField: { $limit: 5 } }",
      "{ arrayField: { $slice: 5 } }",
      "{ arrayField: { $first: 5 } }",
      "{ arrayField: [0, 5] }",
    ],
    correctIndex: 1,
    explanation:
      "The `$slice` projection operator controls the number of items of an array that a query returns (e.g., `{ comments: { $slice: 5 } }` returns the first 5 comments).",
    difficulty: "medium",
    status: "published",
  },
  {
    question:
      "Which MongoDB aggregation stage allows you to process multiple aggregation pipelines within a single stage on the same set of input documents?",
    options: ["$branch", "$parallel", "$facet", "$split"],
    correctIndex: 2,
    explanation:
      "The `$facet` stage processes multiple aggregation pipelines within a single stage on the same set of input documents. It is highly useful for creating multi-faceted search capabilities.",
    difficulty: "hard",
    status: "published",
  },
  {
    question:
      "Which operator performs a modulo operation to select documents where a field's value divided by a divisor has a specified remainder?",
    options: ["$remainder", "$modulo", "$div", "$mod"],
    correctIndex: 3,
    explanation:
      "The `$mod` operator selects documents where the value of a field divided by a divisor has the specified remainder (e.g., `{ qty: { $mod: [ 4, 0 ] } }`).",
    difficulty: "medium",
    status: "published",
  },
  {
    question: "What is 'Sharding' in MongoDB?",
    options: [
      "A method of encrypting data fragments across a network.",
      "The process of replicating data across multiple servers for backup.",
      "A method for distributing data across multiple machines to support horizontal scaling.",
      "The practice of splitting large documents into smaller subdocuments.",
    ],
    correctIndex: 2,
    explanation:
      "Sharding is MongoDB's approach to horizontal scaling. It distributes data across multiple machines to support deployments with very large data sets and high throughput operations.",
    difficulty: "medium",
    status: "published",
  },
  {
    question:
      "Which type of index is typically used as the shard key to ensure an even distribution of data across a sharded cluster?",
    options: [
      "Geospatial Index",
      "Text Index",
      "Hashed Index",
      "Compound Index",
    ],
    correctIndex: 2,
    explanation:
      "A Hashed index computes a hash of the value of a field and indexes the hash. It is commonly used for sharding keys to ensure a more even, random distribution of data across shards.",
    difficulty: "hard",
    status: "published",
  },
  {
    question:
      "How can you package and reuse logic, such as pre-save hooks or custom methods, across multiple Mongoose schemas?",
    options: [
      "By using Mongoose Plugins.",
      "By using Schema Inheritance.",
      "By copying and pasting the code.",
      "By defining Global Hooks.",
    ],
    correctIndex: 0,
    explanation:
      "Mongoose schemas are pluggable. You can package reusable logic into functions called plugins and apply them to schemas using `schema.plugin(myPlugin)`.",
    difficulty: "medium",
    status: "published",
  },
  {
    question: "What does 'Write Concern' dictate in a MongoDB operation?",
    options: [
      "The priority of the user executing the write query.",
      "The level of acknowledgment requested from MongoDB for write operations.",
      "Whether the query writes to a document or an index.",
      "The maximum amount of time a write operation is allowed to take.",
    ],
    correctIndex: 1,
    explanation:
      'Write concern describes the level of acknowledgment requested from MongoDB for write operations to a standalone `mongod` or to replica sets or to sharded clusters (e.g., `w: "majority"`).',
    difficulty: "hard",
    status: "published",
  },
  {
    question: "In a MongoDB Replica Set, what does 'Read Preference' control?",
    options: [
      "Which fields are projected in the result set.",
      "How MongoDB routes read operations to the members of a replica set.",
      "Whether reads are case-sensitive or not.",
      "The caching mechanism used for frequent queries.",
    ],
    correctIndex: 1,
    explanation:
      "Read preference describes how MongoDB clients route read operations to the members of a replica set (e.g., reading from the `primary`, or allowing reads from `secondary` nodes for scaling).",
    difficulty: "hard",
    status: "published",
  },
  {
    question:
      "How do you define a custom instance method on a Mongoose schema?",
    options: [
      "schema.instance.myMethod = function() { ... }",
      "schema.methods.myMethod = function() { ... }",
      "schema.functions.myMethod = function() { ... }",
      "Model.myMethod = function() { ... }",
    ],
    correctIndex: 1,
    explanation:
      "Instance methods are defined by adding functions to the `schema.methods` object. They can then be called on individual document instances.",
    difficulty: "medium",
    status: "published",
  },
  {
    question:
      "When a Mongoose validation fails during `save()`, where are the specific details of the failing fields stored in the error object?",
    options: ["err.messages", "err.details", "err.errors", "err.validation"],
    correctIndex: 2,
    explanation:
      "When Mongoose validation fails, it throws a ValidationError. The details for each field that failed validation are stored in a hash (object) located at `err.errors`.",
    difficulty: "medium",
    status: "published",
  },
  {
    question:
      "Which MongoDB aggregation operator concatenates strings and returns the concatenated string?",
    options: ["$join", "$concat", "$stringAdd", "$combine"],
    correctIndex: 1,
    explanation:
      "The `$concat` operator takes an array of strings and concatenates them into a single string.",
    difficulty: "easy",
    status: "published",
  },
  {
    question:
      "Which aggregation operator returns the element at a specified array index?",
    options: ["$arrayIndex", "$elemMatch", "$arrayElemAt", "$getIndex"],
    correctIndex: 2,
    explanation:
      "The `$arrayElemAt` operator returns the element at the specified array index. It takes an array containing two elements: the array to evaluate, and the index.",
    difficulty: "medium",
    status: "published",
  },
  {
    question:
      "How do you populate a document referenced inside another already populated document in Mongoose (Nested Population)?",
    options: [
      ".populate('friends.profile')",
      ".populate({ path: 'friends', populate: { path: 'profile' } })",
      ".populateDeep('friends', 'profile')",
      ".populateAll()",
    ],
    correctIndex: 1,
    explanation:
      "To perform nested population in Mongoose, you pass an object to populate specifying the `path`, and then provide another `populate` object within it for the nested reference.",
    difficulty: "hard",
    status: "published",
  },
  {
    question:
      "If you have an array of subdocuments in Mongoose, how can you easily remove one subdocument by its `_id`?",
    options: [
      "doc.array.id(subId).remove()",
      "doc.array.delete(subId)",
      "doc.array.splice(subId, 1)",
      "doc.array.pull(subId)",
    ],
    correctIndex: 3,
    explanation:
      "Mongoose document arrays have a special `.pull()` method that takes an item or `_id` and removes it from the array. (Note: `.id(subId).remove()` was historically used but `.pull()` or `.id().deleteOne()` is standard).",
    difficulty: "medium",
    status: "published",
  },
  {
    question:
      "Which aggregation stage restricts the content of the documents based on information stored in the documents themselves (often used for document-level access control)?",
    options: ["$filter", "$redact", "$restrict", "$guard"],
    correctIndex: 1,
    explanation:
      "The `$redact` stage restricts the content of the documents based on information stored within them, using system variables like `$$PRUNE`, `$$DESCEND`, and `$$KEEP`.",
    difficulty: "hard",
    status: "published",
  },
  {
    question:
      "Which method is used in Mongoose to execute a MongoDB aggregation pipeline?",
    options: [
      "Model.pipeline()",
      "Model.aggregate()",
      "Model.group()",
      "Model.reduce()",
    ],
    correctIndex: 1,
    explanation:
      "The `Model.aggregate()` method provides access to the MongoDB aggregation framework, allowing you to pass an array of pipeline stages.",
    difficulty: "easy",
    status: "published",
  },
  {
    question:
      "How can you customize the field names generated by Mongoose's `timestamps: true` option?",
    options: [
      "timestamps: { create: 'addedAt', update: 'modifiedAt' }",
      "timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }",
      "timeFields: [ 'created_at', 'updated_at' ]",
      "It is impossible to rename them in Mongoose.",
    ],
    correctIndex: 1,
    explanation:
      "You can customize the names of the timestamp fields by providing an object instead of a boolean: `{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }`.",
    difficulty: "medium",
    status: "published",
  },
  {
    question: "What is the purpose of a Mongoose 'Setter'?",
    options: [
      "To forcefully inject data bypassing validation.",
      "To modify or format data immediately before it is set/saved to the document.",
      "To update the MongoDB version via command line.",
      "To assign roles to users in the database.",
    ],
    correctIndex: 1,
    explanation:
      "Setters let you transform data before it gets to the raw document (and before validation occurs), such as forcing a string to lowercase using the built-in `lowercase: true` setter or providing a custom function.",
    difficulty: "medium",
    status: "published",
  },
  {
    question:
      "Which MongoDB update operator performs bitwise updates (AND, OR, XOR) on integer fields?",
    options: ["$binary", "$logic", "$bit", "$bitwise"],
    correctIndex: 2,
    explanation:
      "The `$bit` operator performs a bitwise update of a field. The operator supports bitwise AND, bitwise OR, and bitwise XOR operations.",
    difficulty: "hard",
    status: "published",
  },
  {
    question: "Which utility restores a binary backup created by `mongodump`?",
    options: ["mongoimport", "mongoload", "mongorestore", "mongorecover"],
    correctIndex: 2,
    explanation:
      "The `mongorestore` program loads data from either a binary database dump created by `mongodump` or the standard input into a MongoDB instance.",
    difficulty: "medium",
    status: "published",
  },
  {
    question:
      "In a MongoDB Sharded Cluster, what is the role of the `mongos` instance?",
    options: [
      "It stores the actual data chunks.",
      "It acts as a query router, providing an interface between client applications and the sharded cluster.",
      "It serves exclusively as a backup node.",
      "It monitors the health of the hardware.",
    ],
    correctIndex: 1,
    explanation:
      "The `mongos` acts as a query router. It processes queries from the application layer, determines which shards contain the required data, and routes the operations accordingly.",
    difficulty: "hard",
    status: "published",
  },
  {
    question: "What is the 'oplog' (Operations Log) in MongoDB?",
    options: [
      "A capped collection that keeps a rolling record of all operations that modify the data stored in databases.",
      "A text file where MongoDB writes error messages.",
      "A user-accessible table for logging HTTP requests.",
      "An index used to speed up `$match` operations.",
    ],
    correctIndex: 0,
    explanation:
      "The oplog is a special capped collection that keeps a rolling record of all operations that modify data. MongoDB applies database operations on the primary and then records the operations on the primary's oplog for secondaries to replicate.",
    difficulty: "hard",
    status: "published",
  },
  {
    question: "What does the `strictQuery` option in Mongoose control?",
    options: [
      "Whether queries are allowed to exceed 100 milliseconds.",
      "Whether fields not defined in the schema are stripped from query filters (like `find` or `update`).",
      "Whether Mongoose throws an error on duplicate primary keys.",
      "Whether a password is required for queries.",
    ],
    correctIndex: 1,
    explanation:
      "`strictQuery` controls whether Mongoose applies strict mode to query filters. If true, Mongoose will strip out query fields that aren't defined in the schema before sending the query to MongoDB.",
    difficulty: "medium",
    status: "published",
  },
  {
    question:
      "Which aggregation operator evaluates a boolean expression to return one of the two specified return expressions (similar to a ternary operator)?",
    options: ["$ifNull", "$switch", "$cond", "$ternary"],
    correctIndex: 2,
    explanation:
      "The `$cond` operator evaluates a boolean expression to return one of two specified return expressions. It takes an array: `[ boolean-expression, true-case, false-case ]`.",
    difficulty: "medium",
    status: "published",
  },
  {
    question:
      "By default, Mongoose adds a virtual getter `id` to schemas. What does this virtual return?",
    options: [
      "A random 4-digit number.",
      "The document's `_id` field cast to a hex string.",
      "The document's position in the collection.",
      "The creation timestamp.",
    ],
    correctIndex: 1,
    explanation:
      "Mongoose assigns an `id` virtual getter by default which returns the document's `_id` field cast to a string (hexadecimal representation).",
    difficulty: "easy",
    status: "published",
  },
  {
    question:
      "How can you apply a filter condition while using Mongoose `populate()` so it only populates documents matching that condition?",
    options: [
      ".populate({ path: 'users', match: { age: { $gte: 21 } } })",
      ".populate('users').find({ age: { $gte: 21 } })",
      ".populate('users', { filter: { age: { $gte: 21 } } })",
      ".populateMatch('users', { age: { $gte: 21 } })",
    ],
    correctIndex: 0,
    explanation:
      "You can filter populated documents by passing a `match` object inside the populate options object.",
    difficulty: "medium",
    status: "published",
  },
  {
    question:
      "Which aggregation stage categorizes incoming documents into groups, called buckets, based on a specified expression and bucket boundaries?",
    options: ["$group", "$categorize", "$sort", "$bucket"],
    correctIndex: 3,
    explanation:
      "The `$bucket` stage categorizes incoming documents into groups, called buckets, based on a specified expression and bucket boundaries (e.g., grouping users by age ranges).",
    difficulty: "medium",
    status: "published",
  },
  {
    question:
      "Instead of using numerical BSON type codes (like 2 for String) with the `$type` operator, what is the modern, more readable way to write it?",
    options: [
      '{ field: { $type: "String" } }',
      '{ field: { $type: "string" } }',
      "{ field: { $type: type.STRING } }",
      '{ field: { $isType: "String" } }',
    ],
    correctIndex: 1,
    explanation:
      'MongoDB supports string aliases for BSON types, allowing you to use readable strings like `"string"`, `"double"`, or `"array"` in a `$type` query instead of memorizing numeric codes.',
    difficulty: "easy",
    status: "published",
  },
];
