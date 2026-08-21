import CommunityPost, { COMMUNITY_POST_TYPES } from "../models/CommunityPost.js";
import CommunityComment from "../models/CommunityComment.js";
import { communityConfig } from "../configs/community.js";
import { cleanCode, cleanText, fingerprint, httpError, normalizeTags } from "./communityInput.service.js";
import { resolveRelatedResource } from "./communityReference.service.js";
import { createCommunityNotification } from "./communityNotification.service.js";
import { slugify } from "../utils/slugify.js";
import { hasPermission } from "../utils/permissions.js";

const authorFields = "fullName username avatar bio role status deletedAt";
const isModerator = (user) => hasPermission(user, "community.moderate");
const activeAuthor = { path: "author", select: authorFields, match: { status: "active", deletedAt: null } };

export function publicPostFilter(extra = {}) {
  return { status: "published", visibility: "public", ...extra };
}

function pageFrom(query, defaultLimit = 15) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export async function listPosts(query) {
  const { page, limit, skip } = pageFrom(query);
  const filter = publicPostFilter();
  if (query.type && COMMUNITY_POST_TYPES.includes(query.type)) filter.type = query.type;
  if (query.author) filter.author = query.author;
  if (query.relatedKind && query.relatedId) {
    filter["relatedResource.kind"] = query.relatedKind;
    filter["relatedResource.targetId"] = query.relatedId;
  }
  if (query.tag) filter.tags = cleanText(query.tag, 40).toLowerCase();
  const [posts, total] = await Promise.all([
    CommunityPost.find(filter).populate(activeAuthor).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    CommunityPost.countDocuments(filter),
  ]);
  return { posts: posts.filter((post) => post.author), pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

export async function getPost(slug, viewer) {
  const post = await CommunityPost.findOne({ slug }).populate(activeAuthor).lean();
  if (!post || !post.author) throw httpError(404, "Community post not found.");
  const owns = String(post.author._id) === String(viewer?._id);
  if ((post.visibility !== "public" || post.status !== "published") && !owns && !isModerator(viewer)) {
    throw httpError(404, "Community post not found.");
  }
  return { ...post, viewerCanEdit: owns && !["removed", "deleted_by_author"].includes(post.status), viewerCanModerate: isModerator(viewer) };
}

export async function createPost(user, payload) {
  const type = String(payload.type || "discussion");
  if (!COMMUNITY_POST_TYPES.includes(type)) throw httpError(400, "Choose a valid post type.");
  const title = cleanText(payload.title, 180);
  const body = cleanText(payload.body, 20000);
  const code = cleanCode(payload.code, 30000);
  if (title.length < 8 || body.length < 20) throw httpError(400, "Posts need a title of at least 8 characters and a body of at least 20 characters.");
  const submissionFingerprint = fingerprint(type, title, body, code);
  const duplicate = await CommunityPost.exists({ author: user._id, submissionFingerprint, createdAt: { $gte: new Date(Date.now() - communityConfig.duplicateWindowMs) } });
  if (duplicate) throw httpError(409, "This looks like a duplicate of a post you just submitted.");
  const relatedResource = await resolveRelatedResource(payload.relatedResource);
  const post = new CommunityPost({
    author: user._id, type, title, body, code,
    language: cleanText(payload.language, 40).toLowerCase(),
    tags: normalizeTags(payload.tags), relatedResource,
    visibility: payload.visibility === "unlisted" ? "unlisted" : "public",
    submissionFingerprint,
  });
  post.slug = `${slugify(title).slice(0, 120) || "community-post"}-${String(post._id).slice(-8)}`;
  await post.save();
  return getPost(post.slug, user);
}

export async function updatePost(user, slug, payload) {
  const post = await CommunityPost.findOne({ slug });
  if (!post) throw httpError(404, "Community post not found.");
  if (String(post.author) !== String(user._id)) throw httpError(403, "You can only edit your own posts.");
  if (["removed", "deleted_by_author"].includes(post.status)) throw httpError(409, "This post can no longer be edited.");
  if (payload.title !== undefined) {
    const title = cleanText(payload.title, 180);
    if (title.length < 8) throw httpError(400, "The title must be at least 8 characters.");
    post.title = title;
  }
  if (payload.body !== undefined) {
    const body = cleanText(payload.body, 20000);
    if (body.length < 20) throw httpError(400, "The body must be at least 20 characters.");
    post.body = body;
  }
  if (payload.code !== undefined) post.code = cleanCode(payload.code, 30000);
  if (payload.language !== undefined) post.language = cleanText(payload.language, 40).toLowerCase();
  if (payload.tags !== undefined) post.tags = normalizeTags(payload.tags);
  if (payload.visibility !== undefined) post.visibility = payload.visibility === "unlisted" ? "unlisted" : "public";
  post.editedAt = new Date();
  await post.save();
  return getPost(post.slug, user);
}

export async function deletePost(user, slug) {
  const post = await CommunityPost.findOne({ slug });
  if (!post) throw httpError(404, "Community post not found.");
  if (String(post.author) !== String(user._id)) throw httpError(403, "You can only delete your own posts.");
  if (post.status === "removed") throw httpError(409, "Moderated content cannot be deleted by its author.");
  post.status = "deleted_by_author";
  post.deletedAt = new Date();
  post.statusReason = "Deleted by author";
  await post.save();
}

export async function listComments(post, viewer, query = {}) {
  const { page, limit, skip } = pageFrom(query, 20);
  const canSeeAll = isModerator(viewer);
  const visible = canSeeAll ? {} : { $or: [{ status: "published" }, { status: "deleted_by_author" }, ...(viewer ? [{ author: viewer._id }] : [])] };
  const base = { post: post._id, parent: null, ...visible };
  const [comments, total] = await Promise.all([
    CommunityComment.find(base).populate(activeAuthor).sort({ createdAt: 1 }).skip(skip).limit(limit).lean(),
    CommunityComment.countDocuments(base),
  ]);
  const ids = comments.map((comment) => comment._id);
  const replies = ids.length ? await CommunityComment.find({ post: post._id, parent: { $in: ids }, ...visible }).populate(activeAuthor).sort({ createdAt: 1 }).lean() : [];
  const grouped = new Map();
  for (const reply of replies) {
    const key = String(reply.parent);
    grouped.set(key, [...(grouped.get(key) || []), reply]);
  }
  return { comments: comments.map((comment) => ({ ...comment, replies: grouped.get(String(comment._id)) || [] })), pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

export async function createComment(user, postId, payload) {
  const post = await CommunityPost.findOne({ _id: postId, status: "published" });
  if (!post) throw httpError(404, "This post is no longer available for comments.");
  const body = cleanText(payload.body, 10000);
  const code = cleanCode(payload.code, 20000);
  if (body.length < 2) throw httpError(400, "A comment must contain at least 2 characters.");
  let parent = null;
  if (payload.parentId) {
    parent = await CommunityComment.findOne({ _id: payload.parentId, post: post._id, status: "published" });
    if (!parent) throw httpError(400, "The reply target is unavailable.");
    if (parent.parent) throw httpError(400, "Replies can only be one level deep.");
  }
  const submissionFingerprint = fingerprint(post._id, parent?._id, body, code);
  const duplicate = await CommunityComment.exists({ author: user._id, submissionFingerprint, createdAt: { $gte: new Date(Date.now() - communityConfig.duplicateWindowMs) } });
  if (duplicate) throw httpError(409, "This looks like a duplicate of a comment you just submitted.");
  const comment = await CommunityComment.create({ post: post._id, author: user._id, parent: parent?._id || null, body, code, language: cleanText(payload.language, 40).toLowerCase(), submissionFingerprint });
  await CommunityPost.updateOne({ _id: post._id }, { $inc: { commentCount: 1 } });
  const url = `/community/${post.slug}#comment-${comment._id}`;
  const recipients = new Set([String(post.author)]);
  if (parent) recipients.add(String(parent.author));
  for (const recipient of recipients) await createCommunityNotification({ recipient, actor: user._id, type: parent ? "community_reply" : "community_comment", title: parent ? "New reply" : "New response to your post", message: `${user.fullName} responded to “${post.title}”`, url, dedupeKey: `comment:${comment._id}:${recipient}` });
  return CommunityComment.findById(comment._id).populate(activeAuthor).lean();
}

export async function updateComment(user, commentId, payload) {
  const comment = await CommunityComment.findById(commentId);
  if (!comment) throw httpError(404, "Comment not found.");
  if (String(comment.author) !== String(user._id)) throw httpError(403, "You can only edit your own comments.");
  if (["removed", "deleted_by_author"].includes(comment.status)) throw httpError(409, "This comment can no longer be edited.");
  const body = cleanText(payload.body, 10000);
  if (body.length < 2) throw httpError(400, "A comment must contain at least 2 characters.");
  comment.body = body;
  if (payload.code !== undefined) comment.code = cleanCode(payload.code, 20000);
  if (payload.language !== undefined) comment.language = cleanText(payload.language, 40).toLowerCase();
  comment.editedAt = new Date();
  await comment.save();
  return CommunityComment.findById(comment._id).populate(activeAuthor).lean();
}

export async function deleteComment(user, commentId) {
  const comment = await CommunityComment.findById(commentId);
  if (!comment) throw httpError(404, "Comment not found.");
  if (String(comment.author) !== String(user._id)) throw httpError(403, "You can only delete your own comments.");
  if (comment.status === "removed") throw httpError(409, "Moderated content cannot be deleted by its author.");
  comment.status = "deleted_by_author";
  comment.deletedAt = new Date();
  comment.statusReason = "Deleted by author";
  comment.body = "This comment was deleted by its author.";
  comment.code = "";
  await comment.save();
  await CommunityPost.updateOne({ _id: comment.post, commentCount: { $gt: 0 } }, { $inc: { commentCount: -1 } });
}

export async function acceptComment(user, postId, commentId) {
  const comment = await CommunityComment.findOne({ _id: commentId, post: postId, parent: null, status: "published" });
  if (!comment) throw httpError(404, "Eligible response not found.");
  const post = await CommunityPost.findOneAndUpdate(
    { _id: postId, author: user._id, type: { $in: ["question", "help"] }, status: "published", acceptedComment: null },
    { $set: { acceptedComment: comment._id } },
    { returnDocument: "after" },
  );
  if (!post) throw httpError(409, "Only the post author can accept one response on an open Question or Help post.");
  await createCommunityNotification({ recipient: comment.author, actor: user._id, type: "community_accepted", title: "Your response was accepted", message: `Your response to “${post.title}” was marked as the accepted solution.`, url: `/community/${post.slug}#comment-${comment._id}`, dedupeKey: `accepted:${post._id}:${comment._id}`, severity: "important" });
  return post;
}
