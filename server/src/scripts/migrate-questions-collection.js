import mongoose from "mongoose";
import connectDB from "../configs/db.js";
import Question from "../models/Question.js";

async function migrateCollection(sourceName, type) {
  const source = mongoose.connection.collection(sourceName);
  const target = mongoose.connection.collection("questions");
  const documents = await source.find({}).toArray();
  if (!documents.length) return { sourceName, sourceCount: 0, copied: 0 };
  const operations = documents.map((document) => ({
    updateOne: {
      filter: { _id: document._id },
      update: { $set: { ...document, type } },
      upsert: true,
    },
  }));
  await target.bulkWrite(operations, { ordered: false });
  const copied = await target.countDocuments({ _id: { $in: documents.map((item) => item._id) }, type });
  return { sourceName, sourceCount: documents.length, copied };
}

async function migrate() {
  await connectDB();
  const results = await Promise.all([
    migrateCollection("quizquestions", "quiz"),
    migrateCollection("interviewquestions", "interview"),
  ]);
  console.table(results);
  const complete = results.every((item) => item.sourceCount === item.copied);
  if (!complete) throw new Error("Migration verification failed; source collections were retained.");
  await Question.syncIndexes();
  if (process.argv.includes("--drop-legacy")) {
    const names = (await mongoose.connection.db.listCollections().toArray()).map((item) => item.name);
    for (const name of ["quizquestions", "interviewquestions"]) {
      if (names.includes(name)) await mongoose.connection.collection(name).drop();
    }
    console.log("Dropped legacy quizquestions and interviewquestions collections.");
  } else {
    console.log("Verified copy complete. Re-run with --drop-legacy after checking the questions collection.");
  }
  await mongoose.disconnect();
}

migrate().catch(async (error) => { console.error(error); await mongoose.disconnect(); process.exit(1); });
