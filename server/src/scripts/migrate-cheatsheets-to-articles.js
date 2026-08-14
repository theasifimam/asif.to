import mongoose from "mongoose";
import "dotenv/config";
import Article from "../models/Article.js";
import User from "../models/User.js";

function legacyContent(cheatsheet) {
  const sections = (cheatsheet.snippets || []).map((snippet) => {
    const language = snippet.language || "javascript";
    return `## ${snippet.name || "Code example"}\n\n\`\`\`${language}\n${snippet.code || ""}\n\`\`\``;
  });
  const content = [cheatsheet.description, ...sections]
    .filter(Boolean)
    .join("\n\n");
  return (
    content ||
    `# ${cheatsheet.title}\n\nThis legacy cheatsheet is ready to be completed in the article editor.`
  );
}

async function migrate() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGODB_URI or MONGO_URI is required.");
  await mongoose.connect(mongoUri);

  const fallbackAuthor = await User.findOne({ role: "admin" }).select("_id").lean();
  if (!fallbackAuthor) throw new Error("An admin user is required as the author of migrated cheatsheets.");

  const legacyCollection = mongoose.connection.collection("cheatsheets");
  const legacyCheatsheets = await legacyCollection.find({}).toArray();
  let migrated = 0;
  let skipped = 0;

  await Article.updateMany({ type: { $exists: false } }, { $set: { type: "article" } });

  for (const legacy of legacyCheatsheets) {
    if (await Article.exists({ _id: legacy._id })) {
      skipped += 1;
      continue;
    }
    let slug = legacy.slug;
    if (await Article.exists({ slug })) slug = `${slug}-cheatsheet-${String(legacy._id).slice(-6)}`;
    await Article.create({
      _id: legacy._id,
      type: "cheatsheet",
      techId: legacy.techId,
      title: legacy.title,
      slug,
      content: legacyContent(legacy),
      author: fallbackAuthor._id,
      image: "",
      topic: [],
      readCount: 0,
      views: [],
      order: legacy.order || 0,
      status: legacy.status || "published",
      seoTitle: legacy.seoTitle || "",
      seoDescription: legacy.seoDescription || legacy.description || "",
      keywords: legacy.keywords || [],
      canonicalUrl: legacy.canonicalUrl || "",
      createdAt: legacy.createdAt,
      updatedAt: legacy.updatedAt,
    });
    migrated += 1;
  }

  console.log(`Migration complete. Migrated: ${migrated}; already present: ${skipped}.`);
  console.log("The legacy cheatsheets collection was retained as a backup and can be removed after verification.");
  await mongoose.disconnect();
}

migrate().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
