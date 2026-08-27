import express from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";

import connectDB from "./configs/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import articleRoutes from "./routes/article.routes.js";
import topicRoutes from "./routes/topic.routes.js";
import articleTopicRoutes from "./routes/articleTopic.routes.js";
import topicCategoryRoutes from "./routes/topicCategory.routes.js";
import interviewQuestionRoutes from "./routes/interviewQuestion.routes.js";
import pageRoutes from "./routes/page.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import courseRoutes from "./routes/course.routes.js";
import cheatsheetRoutes from "./routes/cheatsheet.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import deletionRoutes from "./routes/deletion.routes.js";
import kanbanRoutes from "./routes/kanban.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import searchRoutes from "./routes/search.routes.js";
import seoSettingRoutes from "./routes/seoSetting.routes.js";
import playgroundSettingRoutes from "./routes/playgroundSetting.routes.js";
import libraryRoutes from "./routes/library.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import messagingRoutes from "./routes/messaging.routes.js";
import mediaAuditRoutes from "./routes/mediaAudit.routes.js";
import relatedContentRoutes from "./routes/relatedContent.routes.js";
// ASIF_LEARNING_JOURNEY_V1:server-import

import socialPostRoutes from "./routes/socialPost.routes.js";
import socialIntegrationRoutes from "./routes/socialIntegration.routes.js";
import { initializeMessagingSocket } from "./realtime/messaging.socket.js";
import { ensureMessagingBootstrap } from "./services/messagingBootstrap.service.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env"), override: false });

const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://192.168.1.11:3000",
  "http://192.168.1.11:3001",
  "https://asif.to",
  "https://www.asif.to",
  "https://admin.asif.to",
  "https://api.asif.to",
  process.env.ADMIN_URL || "http://localhost:3001",
  process.env.WEB_URL || "http://localhost:3000",
];

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static field from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ─── Routes ────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "asif.to API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin/users", userRoutes);
app.use("/api/v1/articles", articleRoutes);
app.use("/api/v1/article-topics", articleTopicRoutes);
app.use("/api/v1/topics", topicRoutes);
app.use("/api/v1/topic-categories", topicCategoryRoutes);
app.use("/api/v1/interview-questions", interviewQuestionRoutes);
app.use("/api/v1/pages", pageRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/chapters", (req, res, next) => {
  req.url = `/chapters${req.url}`;
  courseRoutes(req, res, next);
});
app.use("/api/v1/cheatsheets", cheatsheetRoutes);
app.use("/api/v1/quiz", quizRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/kanban", kanbanRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/seo-settings", seoSettingRoutes);
app.use("/api/v1/playground-settings", playgroundSettingRoutes);
app.use("/api/v1/library", libraryRoutes);
app.use("/api/v1/activity", activityRoutes);
app.use("/api/v1/messaging", messagingRoutes);
app.use("/api/v1/media-audit", mediaAuditRoutes);
app.use("/api/v1/related-content", relatedContentRoutes);
// ASIF_LEARNING_JOURNEY_V1:server-mount

app.use("/api/v1/social-posts", socialPostRoutes);
app.use("/api/v1/social-integrations", socialIntegrationRoutes);
app.use("/api/v1/deletion-requests", deletionRoutes);

// ─── 404 Handler ───────────────────────────────────────────────────────────
app.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    const isTooLarge = error.code === "LIMIT_FILE_SIZE";
    const isMessageAttachment = error.field === "files";
    return res.status(isTooLarge ? 413 : 400).json({
      success: false,
      code: error.code,
      message: isTooLarge && isMessageAttachment
        ? "Message attachments can be up to 10 MB each."
        : isTooLarge
        ? "The selected image is too large. Avatars support up to 15 MB and article images up to 25 MB before compression."
        : "The image upload could not be completed.",
    });
  }
  if (["INVALID_IMAGE_TYPE", "IMAGE_PROCESSING_FAILED"].includes(error.code)) {
    return res.status(400).json({
      success: false,
      code: error.code,
      message:
        error.code === "INVALID_IMAGE_TYPE"
          ? error.message
          : "The image could not be processed. Try another JPG, PNG, WebP, or GIF file.",
    });
  }
  if (["INVALID_ATTACHMENT_TYPE", "INVALID_ATTACHMENT_CONTENT"].includes(error.code)) {
    return res.status(400).json({ success: false, code: error.code, message: error.message || "The attachment is not allowed." });
  }
  return next(error);
});

app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route '${req.originalUrl}' not found.` });
});

// ─── Start Server ──────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    await ensureMessagingBootstrap();
    const PORT = parseInt(process.env.PORT || "5000", 10);
    const httpServer = createServer(app);
    initializeMessagingSocket(httpServer, allowedOrigins);
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Fatal error during server startup:", error);
    process.exit(1);
  }
};

startServer();
