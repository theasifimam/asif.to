import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Article from "../models/Article.js";
import User from "../models/User.js";
import Topic from "../models/Topic.js";
import { slugify } from "./slugify.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function seed() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // 1. Get or Create an Author
    let author = await User.findOne({
      role: { $in: ["admin", "author", "editor"] },
    });
    if (!author) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      author = await User.create({
        fullName: "System Administrator",
        username: `admin_${Date.now()}`,
        email: `admin_${Date.now()}@asif.to`,
        password: hashedPassword,
        role: "admin",
        status: "active",
        isVerified: true,
      });
      console.log("Created admin user");
    }

    // 2. Get or Create Topics
    const topicNames = [
      "Politics",
      "Technology",
      "Science",
      "Health",
      "Business",
      "Entertainment",
      "Sports",
    ];
    let topics = await Topic.find({ name: { $in: topicNames } });

    if (topics.length === 0) {
      topics = await Topic.insertMany(
        topicNames.map((name) => ({
          name,
          description: `${name} news and analysis`,
        })),
      );
      console.log("Created topics");
    }

    // 3. Create 20 Articles
    const articlesData = [];
    const baseImages = [
      "https://images.unsplash.com/photo-1504711432869-efd597cdd042",
      "https://images.unsplash.com/photo-1585829365234-78d2b98ad818",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
      "https://images.unsplash.com/photo-1509062522246-3755977927d7",
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
      "https://images.unsplash.com/photo-1495020689067-958852a7765e",
    ];

    for (let i = 1; i <= 20; i++) {
      const currentTopic = topics[i % topics.length];
      const title = `Intelligence Report #${i}: Breakthrough in ${currentTopic.name} Infrastructure`;
      const slug = `${slugify(title)}-${Date.now()}-${i}`;

      articlesData.push({
        title,
        slug,
        content: `
                    <p>Strategic analysis indicates that article number ${i} represents a significant pivot in the ${currentTopic.name} sector. Local signals suggest that these developments will have long-term implications for global stakeholders.</p>
                    <p>The following data points highlight the key findings of this investigation:</p>
                    <ul>
                        <li>Regional stability increased by 14%</li>
                        <li>Technological adoption rates peaked in Q1</li>
                        <li>Economic signals remain bullish for the next semester</li>
                    </ul>
                    <blockquote>"We are witnessing a unprecedented shift in how intelligence is gathered and processed in the ${currentTopic.name} domain." - Senior Analyst</blockquote>
                    <pre><code>// Signal Detection Code\nDETECT("${currentTopic.name.toUpperCase()}", { priority: "HIGH" });</code></pre>
                `,
        author: author._id,
        topic: [currentTopic._id],
        image: `${baseImages[i % baseImages.length]}?auto=format&fit=crop&q=80&w=1200`,
        status: "published",
        readCount: Math.floor(Math.random() * 5000),
        createdAt: new Date(Date.now() - (20 - i) * 86400000), // Staggered over 20 days
      });
    }

    await Article.insertMany(articlesData);
    console.log(`Successfully added 20 articles to the database.`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
