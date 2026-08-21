import User from "../models/User.js";
import UserFollow from "../models/UserFollow.js";
import CommunityPost from "../models/CommunityPost.js";
import CommunityComment from "../models/CommunityComment.js";
import { createCommunityNotification } from "./communityNotification.service.js";
import { httpError } from "./communityInput.service.js";

export async function followUser(actor, username) {
  const target = await User.findOne({ username: String(username).toLowerCase(), status: "active", deletedAt: null }).select("_id fullName username");
  if (!target) throw httpError(404, "User not found.");
  if (String(target._id) === String(actor._id)) throw httpError(400, "You cannot follow yourself.");
  try { await UserFollow.create({ follower: actor._id, following: target._id }); }
  catch (error) { if (error.code !== 11000) throw error; }
  await createCommunityNotification({ recipient: target._id, actor: actor._id, type: "community_follow", title: "New follower", message: `${actor.fullName} followed you.`, url: `/${actor.username}`, dedupeKey: `follow:${actor._id}:${target._id}` });
  return getFollowSummary(target._id, actor._id);
}

export async function unfollowUser(actor, username) {
  const target = await User.findOne({ username: String(username).toLowerCase(), deletedAt: null }).select("_id");
  if (!target) throw httpError(404, "User not found.");
  await UserFollow.deleteOne({ follower: actor._id, following: target._id });
  return getFollowSummary(target._id, actor._id);
}

export async function getFollowSummary(userId, viewerId) {
  const [followerCount, followingCount, relationship] = await Promise.all([
    UserFollow.countDocuments({ following: userId }),
    UserFollow.countDocuments({ follower: userId }),
    viewerId ? UserFollow.exists({ follower: viewerId, following: userId }) : null,
  ]);
  return { followerCount, followingCount, isFollowing: Boolean(relationship) };
}

export async function getProfileCommunity(username, viewer, query = {}) {
  const user = await User.findOne({ username: String(username).toLowerCase(), status: "active", deletedAt: null, "settings.profileVisibility": { $ne: "private" } }).select("_id username").lean();
  if (!user) throw httpError(404, "User not found.");
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(30, Math.max(1, Number.parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  const [follow, posts, postTotal, comments, commentTotal] = await Promise.all([
    getFollowSummary(user._id, viewer?._id),
    CommunityPost.find({ author: user._id, status: "published", visibility: "public" }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    CommunityPost.countDocuments({ author: user._id, status: "published", visibility: "public" }),
    CommunityComment.find({ author: user._id, status: "published" }).populate({ path: "post", select: "title slug status visibility", match: { status: "published", visibility: "public" } }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    CommunityComment.countDocuments({ author: user._id, status: "published" }),
  ]);
  return { ...follow, posts, comments: comments.filter((comment) => comment.post), pagination: { page, limit, postTotal, commentTotal } };
}
