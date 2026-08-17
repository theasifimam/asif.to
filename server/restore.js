import { MongoClient, ObjectId } from "mongodb";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const targetUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/asif";

// Helper to recursively parse BSON types like ObjectId and ISO Dates
function parseBsonTypes(obj) {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    // Check ISO Date format
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(obj)) {
      return new Date(obj);
    }
    // Check 24-char hex string for ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(obj)) {
      return new ObjectId(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => parseBsonTypes(item));
  }

  if (typeof obj === "object") {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = parseBsonTypes(value);
    }
    return newObj;
  }

  return obj;
}

async function restore() {
  console.log(`Connecting to restore target: ${targetUri}`);
  const client = new MongoClient(targetUri);
  try {
    await client.connect();

    const dbName = targetUri.split("/").pop().split("?")[0] || "asif";
    console.log(`Target database to restore into: ${dbName}`);

    const db = client.db(dbName);
    const backupDir = path.join(process.cwd(), "db_backup_asif");

    if (!fs.existsSync(backupDir)) {
      throw new Error(`Backup directory not found at ${backupDir}`);
    }

    const files = fs
      .readdirSync(backupDir)
      .filter((f) => f.endsWith(".json") && f !== "meta.json");
    console.log(
      "Collections to restore:",
      files.map((f) => f.replace(".json", "")),
    );

    const summary = {};

    for (const file of files) {
      const colName = file.replace(".json", "");
      const filePath = path.join(backupDir, file);
      const rawData = fs.readFileSync(filePath, "utf8");
      const docs = JSON.parse(rawData);

      if (docs.length === 0) {
        console.log(`Skipping empty collection '${colName}'`);
        summary[colName] = 0;
        continue;
      }

      // Convert string ObjectIds and Dates back to MongoDB BSON types
      const parsedDocs = docs.map((doc) => parseBsonTypes(doc));

      // Drop existing collection if it exists to ensure clean restore
      try {
        await db.collection(colName).drop();
      } catch (err) {
        // Ignored if collection does not exist
      }

      const result = await db.collection(colName).insertMany(parsedDocs);
      summary[colName] = result.insertedCount;
      console.log(
        `Restored ${result.insertedCount} documents into collection '${colName}' in database '${dbName}'`,
      );
    }

    console.log("\nRestore successfully completed!");
    console.log("Restore summary:", summary);
  } catch (err) {
    console.error("Restore failed:", err);
  } finally {
    await client.close();
  }
}

restore();
