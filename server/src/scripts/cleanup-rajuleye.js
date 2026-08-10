import { MongoClient } from "mongodb";

const rajuleyeUri = "mongodb+srv://asifimam:ETYF6evwtKRSeNJT@cluster0.x62bsab.mongodb.net/rajuleye";

async function cleanupRajuleye() {
  console.log(`Connecting to ${rajuleyeUri}...`);
  const client = new MongoClient(rajuleyeUri);

  try {
    await client.connect();
    const db = client.db("rajuleye");
    const collections = await db.listCollections().toArray();
    console.log("Collections in rajuleye db:", collections.map((c) => c.name));

    for (const col of collections) {
      if (!col.name.startsWith("system.")) {
        await db.collection(col.name).drop();
        console.log(`Dropped collection '${col.name}' from rajuleye db.`);
      }
    }

    console.log("Successfully cleaned up all restored data from rajuleye db!");
  } catch (error) {
    console.error("Error cleaning up rajuleye db:", error);
  } finally {
    await client.close();
  }
}

cleanupRajuleye();
