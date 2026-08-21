import * as community from "../services/community.service.js";
import * as follow from "../services/follow.service.js";
import { createReport, getModerationCase, listModerationQueue } from "../services/report.service.js";
import { moderateTarget, resolveTargetReports } from "../services/moderation.service.js";

const fail = (res, error) => {
  if (error?.name === "CastError") return res.status(404).json({ success: false, message: "Content not found." });
  console.error("[COMMUNITY]", error);
  return res.status(error.status || 500).json({ success: false, code: error.code, message: error.status ? error.message : "Unable to complete this community action." });
};

export const listPosts = async (req, res) => { try { res.json({ success: true, data: await community.listPosts(req.query) }); } catch (e) { fail(res, e); } };
export const getPost = async (req, res) => { try { const post = await community.getPost(req.params.slug, req.user); const comments = await community.listComments(post, req.user, req.query); res.json({ success: true, data: { post, ...comments } }); } catch (e) { fail(res, e); } };
export const createPost = async (req, res) => { try { res.status(201).json({ success: true, data: await community.createPost(req.user, req.body) }); } catch (e) { fail(res, e); } };
export const updatePost = async (req, res) => { try { res.json({ success: true, data: await community.updatePost(req.user, req.params.slug, req.body) }); } catch (e) { fail(res, e); } };
export const deletePost = async (req, res) => { try { await community.deletePost(req.user, req.params.slug); res.json({ success: true, message: "Post deleted." }); } catch (e) { fail(res, e); } };
export const createComment = async (req, res) => { try { res.status(201).json({ success: true, data: await community.createComment(req.user, req.params.postId, req.body) }); } catch (e) { fail(res, e); } };
export const updateComment = async (req, res) => { try { res.json({ success: true, data: await community.updateComment(req.user, req.params.commentId, req.body) }); } catch (e) { fail(res, e); } };
export const deleteComment = async (req, res) => { try { await community.deleteComment(req.user, req.params.commentId); res.json({ success: true, message: "Comment deleted." }); } catch (e) { fail(res, e); } };
export const acceptComment = async (req, res) => { try { res.json({ success: true, data: await community.acceptComment(req.user, req.params.postId, req.params.commentId) }); } catch (e) { fail(res, e); } };
export const followUser = async (req, res) => { try { res.json({ success: true, data: await follow.followUser(req.user, req.params.username) }); } catch (e) { fail(res, e); } };
export const unfollowUser = async (req, res) => { try { res.json({ success: true, data: await follow.unfollowUser(req.user, req.params.username) }); } catch (e) { fail(res, e); } };
export const getProfileCommunity = async (req, res) => { try { res.json({ success: true, data: await follow.getProfileCommunity(req.params.username, req.user, req.query) }); } catch (e) { fail(res, e); } };
export const reportContent = async (req, res) => { try { res.status(201).json({ success: true, data: await createReport(req.user, req.body), message: "Report submitted. Thank you for helping keep the community useful." }); } catch (e) { fail(res, e); } };
export const moderationQueue = async (req, res) => { try { res.json({ success: true, data: await listModerationQueue(req.query) }); } catch (e) { fail(res, e); } };
export const moderationCase = async (req, res) => { try { res.json({ success: true, data: await getModerationCase(req.params.targetType, req.params.targetId) }); } catch (e) { fail(res, e); } };
export const moderate = async (req, res) => { try { res.json({ success: true, data: await moderateTarget(req.user, req.params.targetType, req.params.targetId, req.body.action, req.body.reason) }); } catch (e) { fail(res, e); } };
export const resolveReports = async (req, res) => { try { const count = await resolveTargetReports(req.user, req.params.targetType, req.params.targetId, req.body.disposition, req.body.reason); res.json({ success: true, data: { count } }); } catch (e) { fail(res, e); } };
