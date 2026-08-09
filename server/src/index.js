import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./configs/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import articleRoutes from "./routes/article.routes.js";
import topicRoutes from "./routes/topic.routes.js";
import pageRoutes from "./routes/page.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import courseRoutes from "./routes/course.routes.js";
import cheatsheetRoutes from "./routes/cheatsheet.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import flashcardRoutes from "./routes/flashcard.routes.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://192.168.1.11:3000",
  "http://192.168.1.11:3001",
  process.env.ADMIN_URL || "http://localhost:3001",
  process.env.WEB_URL || "http://localhost:3000"],

  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static field from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ─── Routes ────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Mazlis News API is running",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/articles", articleRoutes);
app.use("/api/v1/topics", topicRoutes);
app.use("/api/v1/pages", pageRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/chapters", (req, res, next) => {
  req.url = `/chapters${req.url}`;
  courseRoutes(req, res, next);
});
app.use("/api/v1/cheatsheets", cheatsheetRoutes);
app.use("/api/v1/quiz", quizRoutes);
app.use("/api/v1/flashcards", flashcardRoutes);

// ─── 404 Handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' not found.` });
});

// ─── Start Server ──────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "5000", 10);
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});