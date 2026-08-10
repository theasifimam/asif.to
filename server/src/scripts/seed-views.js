import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://0.0.0.0:27017/asif";

async function seedViews() {
  console.log(`Connecting to ${MONGO_URI}...`);
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const dbName = MONGO_URI.split("/").pop().split("?")[0] || "asif";
    const db = client.db(dbName);
    const chaptersCol = db.collection("chapters");

    const chapters = await chaptersCol.find({}).toArray();
    console.log(`Found ${chapters.length} chapters.`);

    let updatedCount = 0;
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      // Generate realistic baseline view count (e.g., 40 to 850 reads per chapter)
      const baseView = (i % 12 + 1) * 65 + (i * 18 % 240) + 42;
      
      await chaptersCol.updateOne(
        { _id: ch._id },
        { $set: { viewCount: ch.viewCount && ch.viewCount > 0 ? ch.viewCount : baseView } }
      );
      updatedCount++;
    }

    console.log(`Successfully seeded/updated view counts for ${updatedCount} chapters in database '${dbName}'!`);
  } catch (error) {
    console.error("Error seeding views:", error);
  } finally {
    await client.close();
  }
}

seedViews();
