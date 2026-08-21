import mongoose from "mongoose";
import Article from "../models/Article.js";
import Course from "../models/Course.js";
import CourseTopic from "../models/CourseTopic.js";
import Question from "../models/Question.js";
import { httpError } from "./communityInput.service.js";

export async function resolveRelatedResource(input) {
  if (!input) return null;
  const kind = String(input.kind || "");
  const targetId = input.targetId;
  if (!mongoose.isValidObjectId(targetId)) throw httpError(400, "The related content reference is invalid.");
  let doc;
  if (kind === "article" || kind === "cheatsheet") {
    doc = await Article.findOne({ _id: targetId, status: "published", ...(kind === "cheatsheet" ? { type: "cheatsheet" } : { type: "article" }) }).select("title slug type").lean();
    if (!doc) throw httpError(400, "The related article or cheatsheet is unavailable.");
    return { kind, targetId: doc._id, title: doc.title, url: kind === "cheatsheet" ? `/cheatsheets/${doc.slug}` : `/articles/${doc.slug}-${doc._id}` };
  }
  if (kind === "course") {
    doc = await Course.findOne({ _id: targetId, status: "published" }).select("title slug").lean();
    if (!doc) throw httpError(400, "The related course is unavailable.");
    return { kind, targetId: doc._id, title: doc.title, url: `/courses/${doc.slug}` };
  }
  if (kind === "topic") {
    doc = await CourseTopic.findOne({ _id: targetId, status: "published" }).select("title slug course category").populate("course", "slug").populate("category", "slug").lean();
    if (!doc?.course) throw httpError(400, "The related topic is unavailable.");
    const segments = [doc.course.slug];
    if (doc.category?.slug && doc.category.slug !== doc.slug) segments.push(doc.category.slug);
    segments.push(doc.slug);
    return { kind, targetId: doc._id, title: doc.title, url: `/${segments.join("/")}` };
  }
  if (kind === "interview_question") {
    doc = await Question.findOne({ _id: targetId, type: "interview", status: "published" }).select("question slug course").populate("course", "slug").lean();
    if (!doc?.course) throw httpError(400, "The related interview question is unavailable.");
    return { kind, targetId: doc._id, title: doc.question, url: `/${doc.course.slug}/interview-questions/${doc.slug}` };
  }
  throw httpError(400, "This related content type is not supported yet.");
}
