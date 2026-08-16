import mongoose from "mongoose";
import Article from "../models/Article.js";
import Chapter from "../models/Chapter.js";
import Course from "../models/Course.js";
import Question from "../models/Question.js";
import Conversation from "../models/Conversation.js";
import { hasPermission } from "../utils/permissions.js";

const definitions = {
  article: { model: Article, title: "title", permission: "articles.edit_all", url: (doc) => `/articles/edit/${doc._id}`, author: "author", query: {} },
  cheatsheet: { model: Article, title: "title", permission: "cheatsheets.view", url: (doc) => `/cheatsheets/${doc._id}/edit`, author: "author", query: { type: "cheatsheet" } },
  course: { model: Course, title: "title", permission: "courses.view", url: (doc) => `/courses/${doc._id}`, query: {} },
  chapter: { model: Chapter, title: "title", permission: "courses.view", url: (doc) => `/courses/${doc.course}/chapters/${doc._id}`, query: {} },
  interview_question: { model: Question, title: "question", permission: "interview_questions.view", url: (doc) => `/interview-questions/${doc._id}/edit`, author: "author", query: { type: "interview" } },
};

export async function resolveContentEntity(user, entityType, entityId) {
  const definition = definitions[entityType];
  if (!definition || !mongoose.isValidObjectId(entityId)) throw Object.assign(new Error("Content item not found."), { status: 404 });
  const document = await definition.model.findOne({ _id: entityId, ...definition.query }).select(`${definition.title} ${definition.author || ""} course`).lean();
  if (!document) throw Object.assign(new Error("Content item not found."), { status: 404 });
  const ownsArticle = definition.author && String(document[definition.author] || "") === String(user._id) && hasPermission(user, "articles.edit_own");
  if (!hasPermission(user, definition.permission) && !ownsArticle) throw Object.assign(new Error("You do not have access to this content discussion."), { status: 403 });
  return { document, definition, title: document[definition.title] };
}

export async function getOrCreateContentDiscussion(user, entityType, entityId) {
  const { document, definition, title } = await resolveContentEntity(user, entityType, entityId);
  const entityKey = `${entityType}:${entityId}`;
  const data = {
    type: "discussion",
    entityKey,
    entityType,
    entityId,
    entityTitle: String(title).slice(0, 300),
    entityUrl: definition.url(document),
    entityAuthorId: definition.author ? document[definition.author] : undefined,
    requiredPermission: definition.permission,
    name: String(title).slice(0, 80),
    description: `${entityType.replace("_", " ")} discussion`,
    readRoles: entityType === "article" ? ["editor", "admin", "super_admin"] : ["author", "editor", "admin", "super_admin"],
    postRoles: ["author", "editor", "admin", "super_admin"],
    allowedMemberIds: definition.author && document[definition.author] ? [document[definition.author]] : [],
    lastMessageAt: new Date(0),
  };
  const existing = await Conversation.findOne({ entityKey });
  if (existing) return { conversation: existing.toObject(), created: false };
  let conversation;
  try { conversation = await Conversation.findOneAndUpdate({ entityKey }, { $setOnInsert: data }, { upsert: true, new: true, setDefaultsOnInsert: true }); }
  catch (error) { if (error.code !== 11000) throw error; conversation = await Conversation.findOne({ entityKey }); }
  return { conversation: conversation.toObject(), created: true };
}
