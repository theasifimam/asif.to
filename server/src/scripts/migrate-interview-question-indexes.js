import mongoose from "mongoose";
import connectDB from "../configs/db.js";
import InterviewQuestion from "../models/InterviewQuestion.js";

async function migrateInterviewQuestionIndexes() {
  await connectDB();

  try {
    const indexes = await InterviewQuestion.collection.indexes();
    if (indexes.some((index) => index.name === "slug_1")) {
      await InterviewQuestion.collection.dropIndex("slug_1");
      console.log("Dropped legacy global interview-question slug index.");
    }

    await InterviewQuestion.syncIndexes();
    console.log("Interview-question indexes synchronized.");
  } finally {
    await mongoose.disconnect();
  }
}

migrateInterviewQuestionIndexes().catch((error) => {
  console.error("Interview-question index migration failed:", error);
  process.exitCode = 1;
});
