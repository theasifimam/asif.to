import crypto from "node:crypto";
import mongoose from "mongoose";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import CourseTopic from "../models/CourseTopic.js";
import TopicCategory from "../models/TopicCategory.js";
import Question from "../models/Question.js";
import Article from "../models/Article.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import AssetUsage from "../models/AssetUsage.js";
import DeletionRequest from "../models/DeletionRequest.js";
import { logActivity } from "../services/activity.service.js";
import {
  sendCourseDeletionApprovalRequestEmail,
  sendCourseDeletionOtpEmail,
} from "../services/email.service.js";
import { getMessagingSocketServer } from "../services/messagingRealtime.service.js";

const PRIVILEGED_ROLES = new Set(["admin", "super_admin"]);
const ACTIVE_REQUEST_STATUSES = [
  "initiator_otp_pending",
  "pending_approval",
  "approval_otp_pending",
  "executing",
];

const IMPACT_KEYS = [
  "chapters",
  "courseTopics",
  "categories",
  "interviewQuestions",
  "quizExclusive",
  "quizShared",
  "cheatsheets",
  "otherCoursesSameTech",
  "relatedArticles",
];

const OTP_TTL_MS = 10 * 60 * 1000;
const APPROVAL_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const ensurePrivileged = (req, res) => {
  if (!PRIVILEGED_ROLES.has(req.user?.role)) {
    res.status(403).json({
      success: false,
      message: "Only an admin or super admin can delete a course.",
    });
    return false;
  }
  return true;
};

const maskEmail = (email = "") => {
  const [local, domain] = String(email).split("@");
  if (!local || !domain) return "your admin email";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(2, local.length - visible.length))}@${domain}`;
};

const otpSecret = () => {
  const secret =
    process.env.COURSE_DELETION_OTP_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "COURSE_DELETION_OTP_SECRET or JWT_SECRET is required for protected course deletion.",
    );
  }
  return secret;
};

const createOtp = () => crypto.randomInt(100000, 1000000).toString();

const hashOtp = ({ requestId, userId, otp }) =>
  crypto
    .createHmac("sha256", otpSecret())
    .update(`${requestId}:${userId}:${otp}`)
    .digest("hex");

const otpMatches = ({ expectedHash, requestId, userId, otp }) => {
  if (!expectedHash || !/^\d{6}$/.test(String(otp || ""))) return false;
  const actual = hashOtp({ requestId, userId, otp: String(otp) });
  const a = Buffer.from(actual, "hex");
  const b = Buffer.from(expectedHash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const sameImpact = (left, right) =>
  IMPACT_KEYS.every(
    (key) => Number(left?.[key] || 0) === Number(right?.[key] || 0),
  );

async function computeImpact(entityId, entityModel, session = null) {
  const withSession = (query) => (session ? query.session(session) : query);

  if (entityModel === "Course") {
    let courseQuery = Course.findById(entityId).select(
      "_id title slug techId status updatedAt",
    );
    if (session) courseQuery = courseQuery.session(session);
    const course = await courseQuery.lean();

    if (!course) return null;

    let categoryQuery = TopicCategory.find({ course: course._id }).select(
      "_id updatedAt",
    );
    if (session) categoryQuery = categoryQuery.session(session);
    const categories = await categoryQuery.lean();
    const categoryIds = categories.map((item) => item._id);

    const interviewFilter = {
      type: "interview",
      $or: [
        { course: course._id },
        ...(categoryIds.length ? [{ category: { $in: categoryIds } }] : []),
      ],
    };

    const [
      chapterDocs,
      courseTopicDocs,
      interviewDocs,
      quizDocuments,
      cheatsheetDocs,
      otherSameTechDocs,
      relatedArticleDocs,
    ] = await Promise.all([
      withSession(
        Chapter.find({ course: course._id }).select("_id updatedAt").lean(),
      ),
      withSession(
        CourseTopic.find({ course: course._id }).select("_id updatedAt").lean(),
      ),
      withSession(
        Question.find(interviewFilter).select("_id updatedAt").lean(),
      ),
      withSession(
        Question.find({ type: "quiz", courses: course._id })
          .select("_id courses updatedAt")
          .lean(),
      ),
      withSession(
        Article.find({
          type: "cheatsheet",
          techId: course.techId,
        })
          .select("_id updatedAt")
          .lean(),
      ),
      withSession(
        Course.find({
          _id: { $ne: course._id },
          techId: course.techId,
        })
          .select("_id updatedAt")
          .lean(),
      ),
      withSession(
        Article.find({
          type: { $ne: "cheatsheet" },
          relatedCourses: course._id,
        })
          .select("_id updatedAt")
          .lean(),
      ),
    ]);

    const quizExclusive = quizDocuments.filter(
      (item) => (item.courses || []).length <= 1,
    ).length;
    const quizShared = quizDocuments.length - quizExclusive;

    const fingerprintRows = [
      `course:${course._id}:${new Date(course.updatedAt || 0).getTime()}`,
      ...categories.map(
        (item) =>
          `category:${item._id}:${new Date(item.updatedAt || 0).getTime()}`,
      ),
      ...chapterDocs.map(
        (item) =>
          `chapter:${item._id}:${new Date(item.updatedAt || 0).getTime()}`,
      ),
      ...courseTopicDocs.map(
        (item) =>
          `courseTopic:${item._id}:${new Date(item.updatedAt || 0).getTime()}`,
      ),
      ...interviewDocs.map(
        (item) =>
          `interview:${item._id}:${new Date(item.updatedAt || 0).getTime()}`,
      ),
      ...quizDocuments.map(
        (item) =>
          `quiz:${item._id}:${new Date(item.updatedAt || 0).getTime()}:${(
            item.courses || []
          )
            .map(String)
            .sort()
            .join(",")}`,
      ),
      ...cheatsheetDocs.map(
        (item) =>
          `cheatsheet:${item._id}:${new Date(item.updatedAt || 0).getTime()}`,
      ),
    ];
    const fingerprint = crypto
      .createHash("md5")
      .update(fingerprintRows.sort().join("|"))
      .digest("hex");

    return {
      entity: course,
      entityModel: "Course",
      impact: {
        chapters: chapterDocs.length,
        courseTopics: courseTopicDocs.length,
        categories: categories.length,
        interviewQuestions: interviewDocs.length,
        quizExclusive,
        quizShared,
        cheatsheets: cheatsheetDocs.length,
        otherCoursesSameTech: otherSameTechDocs.length,
        relatedArticles: relatedArticleDocs.length,
      },
      fingerprint,
    };
  } else if (entityModel === "TopicCategory") {
    let categoryQuery = TopicCategory.findById(entityId).select(
      "_id name slug course updatedAt",
    );
    if (session) categoryQuery = categoryQuery.session(session);
    const category = await categoryQuery.lean();

    if (!category) return null;

    const [courseTopicDocs, interviewDocs] = await Promise.all([
      withSession(
        CourseTopic.find({ category: category._id })
          .select("_id updatedAt")
          .lean(),
      ),
      withSession(
        Question.find({ type: "interview", category: category._id })
          .select("_id updatedAt")
          .lean(),
      ),
    ]);

    const fingerprintRows = [
      `category:${category._id}:${new Date(category.updatedAt || 0).getTime()}`,
      ...courseTopicDocs.map(
        (item) =>
          `courseTopic:${item._id}:${new Date(item.updatedAt || 0).getTime()}`,
      ),
      ...interviewDocs.map(
        (item) =>
          `interview:${item._id}:${new Date(item.updatedAt || 0).getTime()}`,
      ),
    ];
    const fingerprint = crypto
      .createHash("md5")
      .update(fingerprintRows.sort().join("|"))
      .digest("hex");

    return {
      entity: category,
      entityModel: "TopicCategory",
      impact: {
        chapters: 0,
        courseTopics: courseTopicDocs.length,
        categories: 1, // itself
        interviewQuestions: interviewDocs.length,
        quizExclusive: 0,
        quizShared: 0,
        cheatsheets: 0,
        otherCoursesSameTech: 0,
        relatedArticles: 0,
      },
      fingerprint,
    };
  }
  return null;
}

async function eligibleApprovers(requesterId) {
  return User.find({
    _id: { $ne: requesterId },
    role: { $in: ["admin", "super_admin"] },
    status: "active",
    deletedAt: null,
  })
    .select("_id fullName username email role")
    .lean();
}

function normalizeSelections(input = {}, impact) {
  const selections = {
    chapters: true,
    courseTopics: true,
    categories: input.categories !== false,
    interviewQuestions: input.interviewQuestions !== false,
    quizQuestions:
      impact.quizExclusive > 0 ? true : input.quizQuestions !== false,
    sharedQuizQuestions: Boolean(input.sharedQuizQuestions),
    cheatsheets: input.cheatsheets !== false,
  };

  if (selections.categories && !selections.interviewQuestions) {
    throw new Error(
      "Deleting interview categories requires deleting their interview questions too.",
    );
  }

  return selections;
}

async function createDirectNotifications(users, payload) {
  if (!users.length) return;

  await Notification.insertMany(
    users.map((user) => ({
      recipientId: user._id,
      actorId: payload.actorId || null,
      title: payload.title,
      message: payload.message,
      type: "course",
      severity: "critical",
      url: payload.url,
    })),
    { ordered: false },
  );

  const io = getMessagingSocketServer();
  if (io) {
    users.forEach((user) => {
      io.to(`user:${user._id}`).emit("notification_updated", {
        type: "course",
        severity: "critical",
        title: payload.title,
        message: payload.message,
        url: payload.url,
        createdAt: new Date().toISOString(),
      });
    });
  }
}

async function markExpiredIfNeeded(request) {
  if (
    ["pending_approval", "approval_otp_pending"].includes(request.status) &&
    request.approvalDeadline &&
    request.approvalDeadline <= new Date()
  ) {
    request.status = "expired";
    await request.save();
    return true;
  }
  return false;
}

function publicRequest(request, currentUserId) {
  const requesterId = String(request.requestedBy?._id || request.requestedBy);
  const approverId = String(request.approver?._id || request.approver || "");

  return {
    _id: request._id,
    entityId: request.entityId,
    entityModel: request.entityModel,
    entitySnapshot: request.entitySnapshot,
    requestedBy: request.requestedBy,
    selections: request.selections,
    impact: request.impact,
    status: request.status,
    approver: request.approver,
    initiatorVerifiedAt: request.initiatorVerifiedAt,
    approvalDeadline: request.approvalDeadline,
    approvedAt: request.approvedAt,
    rejectedAt: request.rejectedAt,
    completedAt: request.completedAt,
    result: request.result,
    createdAt: request.createdAt,
    canCurrentUserApprove:
      requesterId !== String(currentUserId) &&
      ["pending_approval", "approval_otp_pending"].includes(request.status) &&
      (!approverId || approverId === String(currentUserId)),
  };
}

export const getDeletionImpact = async (req, res) => {
  try {
    if (!ensurePrivileged(req, res)) return;

    const entityModel =
      req.params.entityModel === "categories" ? "TopicCategory" : "Course";
    const entityId = req.params.entityId;

    const data = await computeImpact(entityId, entityModel);
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: `${entityModel} not found.` });
    }

    const approvers = await eligibleApprovers(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        entity: data.entity,
        entityModel: data.entityModel,
        impact: data.impact,
        eligibleApprovers: approvers.length,
        requiredSelections: {
          chapters: entityModel === "Course",
          courseTopics: true,
          quizQuestions: data.impact.quizExclusive > 0,
        },
      },
    });
  } catch (error) {
    console.error("[DELETION] impact error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Unable to inspect deletion impact.",
    });
  }
};

export const beginDeletion = async (req, res) => {
  let createdRequest = null;

  try {
    if (!ensurePrivileged(req, res)) return;

    if (!req.user?.email) {
      return res.status(400).json({
        success: false,
        message:
          "Your admin account must have an email address before deleting.",
      });
    }

    const entityModel =
      req.params.entityModel === "categories" ? "TopicCategory" : "Course";
    const entityId = req.params.entityId;

    const data = await computeImpact(entityId, entityModel);
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: `${entityModel} not found.` });
    }

    const approvers = await eligibleApprovers(req.user._id);
    if (!approvers.length) {
      return res.status(409).json({
        success: false,
        message:
          "Deletion requires a second active admin or super admin. No eligible approver is currently available.",
      });
    }

    const existing = await DeletionRequest.findOne({
      entityId: data.entity._id,
      entityModel: data.entityModel,
      status: { $in: ACTIVE_REQUEST_STATUSES },
    }).lean();

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "A protected deletion request is already active for this item.",
        requestId: existing._id,
      });
    }

    let selections;
    try {
      selections = normalizeSelections(req.body?.selections || {}, data.impact);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message,
      });
    }

    createdRequest = await DeletionRequest.create({
      entityId: data.entity._id,
      entityModel: data.entityModel,
      entitySnapshot: {
        title: data.entity.title || data.entity.name,
        slug: data.entity.slug,
        techId: data.entity.techId || "",
      },
      requestedBy: req.user._id,
      selections,
      impact: data.impact,
      impactFingerprint: data.fingerprint,
      status: "initiator_otp_pending",
    });

    const otp = createOtp();
    createdRequest.initiatorOtpHash = hashOtp({
      requestId: createdRequest._id,
      userId: req.user._id,
      otp,
    });
    createdRequest.initiatorOtpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    await createdRequest.save();

    // Send email in the background so slow SMTP connections do not cause API timeouts
    sendCourseDeletionOtpEmail({
      to: req.user.email,
      fullName: req.user.fullName || req.user.username,
      otp,
      courseTitle: data.entity.title || data.entity.name,
      mode: "requester",
    }).catch(async (emailError) => {
      console.error(
        "[DELETION] Background requester OTP email failed:",
        emailError,
      );
      if (createdRequest?._id) {
        await DeletionRequest.deleteOne({ _id: createdRequest._id }).catch(
          () => {},
        );
      }
    });

    res.status(201).json({
      success: true,
      data: {
        requestId: createdRequest._id,
        status: createdRequest.status,
        maskedEmail: maskEmail(req.user.email),
      },
      message:
        "A verification code was sent to your admin email. Nothing has been deleted yet.",
    });
  } catch (error) {
    console.error("[DELETION] begin error:", error);

    if (createdRequest?._id) {
      await DeletionRequest.deleteOne({ _id: createdRequest._id }).catch(
        () => {},
      );
    }

    res.status(500).json({
      success: false,
      message: error.message || "Unable to start protected deletion.",
    });
  }
};

export const verifyDeletionInitiatorOtp = async (req, res) => {
  try {
    if (!ensurePrivileged(req, res)) return;

    const request = await DeletionRequest.findById(req.params.requestId).select(
      "+initiatorOtpHash +initiatorOtpExpiresAt +initiatorOtpAttempts",
    );

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Deletion request not found." });
    }

    if (String(request.requestedBy) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message:
          "Only the administrator who created this request can verify it.",
      });
    }

    if (request.status !== "initiator_otp_pending") {
      return res.status(409).json({
        success: false,
        message: "This deletion request is no longer waiting for your OTP.",
      });
    }

    if (
      !request.initiatorOtpExpiresAt ||
      request.initiatorOtpExpiresAt <= new Date()
    ) {
      request.status = "expired";
      await request.save();
      return res
        .status(410)
        .json({
          success: false,
          message: "The verification code has expired.",
        });
    }

    const valid = otpMatches({
      expectedHash: request.initiatorOtpHash,
      requestId: request._id,
      userId: req.user._id,
      otp: req.body?.otp,
    });

    if (!valid) {
      request.initiatorOtpAttempts += 1;
      if (request.initiatorOtpAttempts >= MAX_OTP_ATTEMPTS) {
        request.status = "expired";
      }
      await request.save();
      return res.status(400).json({
        success: false,
        message:
          request.status === "expired"
            ? "Too many incorrect attempts. Start a new deletion request."
            : "Incorrect verification code.",
      });
    }

    const approvers = await eligibleApprovers(req.user._id);
    if (!approvers.length) {
      request.status = "expired";
      await request.save();
      return res.status(409).json({
        success: false,
        message:
          "No second administrator is available anymore. Start a new request when another admin is active.",
      });
    }

    request.initiatorOtpHash = "";
    request.initiatorOtpExpiresAt = null;
    request.initiatorVerifiedAt = new Date();
    request.status = "pending_approval";
    request.approvalDeadline = new Date(Date.now() + APPROVAL_TTL_MS);
    await request.save();

    const url = `/courses?deletionRequest=${request._id}`;

    // logActivity already notifies roles above an admin. Direct notifications
    // cover same-rank admins; a super_admin requester has no higher role so
    // every eligible approver is notified directly.
    await logActivity({
      actor: req.user,
      action: "course.deletion_requested",
      entityType: "course",
      entityId: request.entityId,
      entityTitle: request.entitySnapshot.title,
      description: "requested protected deletion of",
      severity: "critical",
      url,
    });

    const directRecipients =
      req.user.role === "admin"
        ? approvers.filter((user) => user.role === "admin")
        : approvers;

    await createDirectNotifications(directRecipients, {
      actorId: req.user._id,
      title: "Course deletion requires your approval",
      message: `${req.user.fullName || req.user.username || "An administrator"} requested permanent deletion of “${request.entitySnapshot.title}”. Review the selected content before approving.`,
      url,
    });

    await Promise.allSettled(
      approvers
        .filter((user) => user.email)
        .map((user) =>
          sendCourseDeletionApprovalRequestEmail({
            to: user.email,
            fullName: user.fullName || user.username,
            courseTitle: request.entitySnapshot.title,
            requesterName:
              req.user.fullName || req.user.username || "An administrator",
            requestId: request._id,
          }),
        ),
    );

    res.status(200).json({
      success: true,
      data: {
        requestId: request._id,
        status: request.status,
        approverCount: approvers.length,
        approvalDeadline: request.approvalDeadline,
      },
      message:
        "Your identity is verified. A different admin/super admin has been asked to approve this deletion.",
    });
  } catch (error) {
    console.error("[COURSE DELETE] requester OTP error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Unable to verify deletion request.",
    });
  }
};

export const getDeletionRequest = async (req, res) => {
  try {
    if (!ensurePrivileged(req, res)) return;

    const request = await DeletionRequest.findById(req.params.requestId)
      .populate("requestedBy", "fullName username email role")
      .populate("approver", "fullName username email role");

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Deletion request not found." });
    }

    await markExpiredIfNeeded(request);

    res.status(200).json({
      success: true,
      data: publicRequest(request, req.user._id),
    });
  } catch (error) {
    console.error("[COURSE DELETE] get request error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load course deletion request.",
    });
  }
};

export const sendDeletionApproverOtp = async (req, res) => {
  try {
    if (!ensurePrivileged(req, res)) return;

    if (!req.user?.email) {
      return res.status(400).json({
        success: false,
        message:
          "Your admin account must have an email address to approve deletion.",
      });
    }

    const request = await DeletionRequest.findById(req.params.requestId)
      .select("+approverOtpExpiresAt")
      .populate("requestedBy", "fullName username email role");

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Deletion request not found." });
    }

    if (await markExpiredIfNeeded(request)) {
      return res
        .status(410)
        .json({
          success: false,
          message: "This approval request has expired.",
        });
    }

    if (String(request.requestedBy?._id) === String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot approve your own course deletion request. A different admin/super admin is required.",
      });
    }

    if (
      !["pending_approval", "approval_otp_pending"].includes(request.status)
    ) {
      return res.status(409).json({
        success: false,
        message: "This request is not waiting for approval.",
      });
    }

    if (
      request.status === "approval_otp_pending" &&
      request.approver &&
      String(request.approver) !== String(req.user._id) &&
      request.approverOtpExpiresAt &&
      request.approverOtpExpiresAt > new Date()
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Another administrator is already reviewing this request. Try again after their approval code expires.",
      });
    }

    const otp = createOtp();

    request.approver = req.user._id;
    request.approverOtpHash = hashOtp({
      requestId: request._id,
      userId: req.user._id,
      otp,
    });
    request.approverOtpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    request.approverOtpAttempts = 0;
    request.status = "approval_otp_pending";
    await request.save();

    // Send email in the background so slow SMTP connections do not cause API timeouts
    sendDeletionOtpEmail({
      to: req.user.email,
      fullName: req.user.fullName || req.user.username,
      otp,
      courseTitle: request.entitySnapshot.title,
      mode: "approver",
    }).catch(async (emailError) => {
      console.error(
        "[COURSE DELETE] Background approver OTP email failed:",
        emailError,
      );
      try {
        const reqToRollback = await DeletionRequest.findById(request._id);
        if (reqToRollback && reqToRollback.status === "approval_otp_pending") {
          reqToRollback.approver = null;
          reqToRollback.approverOtpHash = "";
          reqToRollback.approverOtpExpiresAt = null;
          reqToRollback.status = "pending_approval";
          await reqToRollback.save();
        }
      } catch (rollbackError) {
        console.error("[COURSE DELETE] Rollback failed:", rollbackError);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        requestId: request._id,
        status: request.status,
        maskedEmail: maskEmail(req.user.email),
      },
      message:
        "A separate approval OTP was sent to your admin email. The requester cannot use this code.",
    });
  } catch (error) {
    console.error("[COURSE DELETE] approver OTP send error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Unable to send approval OTP.",
    });
  }
};

async function executeApprovedDeletion(request, approver) {
  const session = await mongoose.startSession();
  const result = {
    chapters: 0,
    courseTopics: 0,
    categories: 0,
    interviewQuestions: 0,
    quizQuestions: 0,
    sharedQuizQuestions: 0,
    sharedQuizDetached: 0,
    cheatsheets: 0,
    cleanedArticleReferences: 0,
    cleanedCategoryReferences: 0,
    cleanedCourseReferences: 0,
    cleanedTopicReferences: 0,
    course: 0,
    topicCategory: 0,
  };

  try {
    await session.withTransaction(async () => {
      if (request.entityModel === "Course") {
        const course = await Course.findById(request.entityId).session(session);
        if (!course) throw new Error("Course no longer exists.");

        const categoryDocs = await TopicCategory.find({ course: course._id })
          .select("_id")
          .session(session)
          .lean();
        const categoryIds = categoryDocs.map((item) => item._id);

        const chapterDocs = await Chapter.find({ course: course._id })
          .select("_id")
          .session(session)
          .lean();
        const chapterIds = chapterDocs.map((item) => item._id);

        const topicDocs = await CourseTopic.find({ course: course._id })
          .select("_id")
          .session(session)
          .lean();
        const topicIds = topicDocs.map((item) => item._id);

        const interviewFilter = {
          type: "interview",
          $or: [
            { course: course._id },
            ...(categoryIds.length ? [{ category: { $in: categoryIds } }] : []),
          ],
        };

        const interviewDocs = request.selections.interviewQuestions
          ? await Question.find(interviewFilter)
              .select("_id")
              .session(session)
              .lean()
          : [];
        const interviewIds = interviewDocs.map((item) => item._id);

        const quizDocs = await Question.find({
          type: "quiz",
          courses: course._id,
        })
          .select("_id courses")
          .session(session)
          .lean();
        const exclusiveQuizIds = quizDocs
          .filter((item) => (item.courses || []).length <= 1)
          .map((item) => item._id);
        const sharedQuizIds = quizDocs
          .filter((item) => (item.courses || []).length > 1)
          .map((item) => item._id);

        if (!request.selections.quizQuestions && exclusiveQuizIds.length) {
          throw new Error(
            "Exclusive quiz questions appeared after approval started. Restart the deletion request.",
          );
        }

        const sharedQuizDeleteIds = request.selections.sharedQuizQuestions
          ? sharedQuizIds
          : [];

        const cheatsheetDocs = request.selections.cheatsheets
          ? await Article.find({ type: "cheatsheet", techId: course.techId })
              .select("_id")
              .session(session)
              .lean()
          : [];
        const cheatsheetIds = cheatsheetDocs.map((item) => item._id);

        if (request.selections.interviewQuestions) {
          const deletion = await Question.deleteMany({
            _id: { $in: interviewIds },
          }).session(session);
          result.interviewQuestions = deletion.deletedCount || 0;
        } else {
          await Question.updateMany(
            { type: "interview", course: course._id },
            { $set: { course: null } },
          ).session(session);
        }

        if (request.selections.quizQuestions && exclusiveQuizIds.length) {
          const deletion = await Question.deleteMany({
            _id: { $in: exclusiveQuizIds },
          }).session(session);
          result.quizQuestions = deletion.deletedCount || 0;
        }

        if (sharedQuizDeleteIds.length) {
          const deletion = await Question.deleteMany({
            _id: { $in: sharedQuizDeleteIds },
          }).session(session);
          result.sharedQuizQuestions = deletion.deletedCount || 0;
        } else if (sharedQuizIds.length) {
          const detached = await Question.updateMany(
            { _id: { $in: sharedQuizIds } },
            { $pull: { courses: course._id } },
          ).session(session);
          result.sharedQuizDetached = detached.modifiedCount || 0;
        }

        const topicDeletion = await CourseTopic.deleteMany({
          course: course._id,
        }).session(session);
        result.courseTopics = topicDeletion.deletedCount || 0;

        const chapterDeletion = await Chapter.deleteMany({
          course: course._id,
        }).session(session);
        result.chapters = chapterDeletion.deletedCount || 0;

        if (request.selections.categories) {
          const categoryDeletion = await TopicCategory.deleteMany({
            _id: { $in: categoryIds },
          }).session(session);
          result.categories = categoryDeletion.deletedCount || 0;
        } else {
          await TopicCategory.updateMany(
            { _id: { $in: categoryIds } },
            { $set: { course: null }, $pull: { relatedCourses: course._id } },
          ).session(session);
        }

        if (cheatsheetIds.length) {
          const deletion = await Article.deleteMany({
            _id: { $in: cheatsheetIds },
          }).session(session);
          result.cheatsheets = deletion.deletedCount || 0;
          await AssetUsage.deleteMany({ entityType: "article", entityId: { $in: cheatsheetIds } }).session(session);
        }

        const deletedQuestionIds = [
          ...interviewIds,
          ...exclusiveQuizIds,
          ...sharedQuizDeleteIds,
        ];

        const articleCleanup = await Article.updateMany(
          {},
          {
            $pull: {
              relatedCourses: course._id,
              relatedChapters: { $in: chapterIds },
              relatedQuestions: { $in: deletedQuestionIds },
            },
          },
        ).session(session);
        result.cleanedArticleReferences = articleCleanup.modifiedCount || 0;

        const categoryCleanup = await TopicCategory.updateMany(
          {},
          {
            $pull: {
              relatedCourses: course._id,
              featuredChapters: { $in: chapterIds },
              relatedCheatsheets: { $in: cheatsheetIds },
            },
          },
        ).session(session);
        result.cleanedCategoryReferences = categoryCleanup.modifiedCount || 0;

        const courseCleanup = await Course.updateMany(
          { _id: { $ne: course._id } },
          {
            $pull: {
              relatedCourses: course._id,
              popularChapterIds: { $in: chapterIds },
            },
          },
        ).session(session);
        result.cleanedCourseReferences = courseCleanup.modifiedCount || 0;

        const topicCleanup = await CourseTopic.updateMany(
          {},
          {
            $pull: {
              relatedTopics: { $in: topicIds },
              interviewQuestions: { question: { $in: deletedQuestionIds } },
            },
          },
        ).session(session);
        result.cleanedTopicReferences = topicCleanup.modifiedCount || 0;

        const courseDeletion = await Course.collection.deleteOne(
          { _id: course._id },
          { session },
        );
        result.course = courseDeletion.deletedCount || 0;
        await AssetUsage.deleteMany({ entityType: "course", entityId: course._id }).session(session);

        if (result.course !== 1) {
          throw new Error("Course deletion did not complete.");
        }
      } else if (request.entityModel === "TopicCategory") {
        const category = await TopicCategory.findById(request.entityId).session(
          session,
        );
        if (!category) throw new Error("Category no longer exists.");

        const topicDocs = await CourseTopic.find({ category: category._id })
          .select("_id")
          .session(session)
          .lean();
        const topicIds = topicDocs.map((item) => item._id);

        const interviewDocs = await Question.find({
          type: "interview",
          category: category._id,
        })
          .select("_id")
          .session(session)
          .lean();
        const interviewIds = interviewDocs.map((item) => item._id);

        if (interviewIds.length > 0) {
          const deletion = await Question.deleteMany({
            _id: { $in: interviewIds },
          }).session(session);
          result.interviewQuestions = deletion.deletedCount || 0;
        }

        if (topicIds.length > 0) {
          const topicDeletion = await CourseTopic.deleteMany({
            category: category._id,
          }).session(session);
          result.courseTopics = topicDeletion.deletedCount || 0;

          const topicCleanup = await CourseTopic.updateMany(
            {},
            {
              $pull: {
                relatedTopics: { $in: topicIds },
                interviewQuestions: { question: { $in: interviewIds } },
              },
            },
          ).session(session);
          result.cleanedTopicReferences = topicCleanup.modifiedCount || 0;
        }

        const categoryDeletion = await TopicCategory.collection.deleteOne(
          { _id: category._id },
          { session },
        );
        result.topicCategory = categoryDeletion.deletedCount || 0;

        if (result.topicCategory !== 1) {
          throw new Error("Category deletion did not complete.");
        }
      }

      await DeletionRequest.updateOne(
        { _id: request._id, status: "executing" },
        {
          $set: {
            status: "completed",
            approvedAt: new Date(),
            completedAt: new Date(),
            approver: approver._id,
            result,
            approverOtpHash: "",
            approverOtpExpiresAt: null,
          },
        },
      ).session(session);
    });

    return result;
  } finally {
    await session.endSession();
  }
}

export const approveDeletion = async (req, res) => {
  let claimedRequest = null;

  try {
    if (!ensurePrivileged(req, res)) return;

    const request = await DeletionRequest.findById(req.params.requestId)
      .select("+approverOtpHash +approverOtpExpiresAt +approverOtpAttempts")
      .populate("requestedBy", "fullName username email role");

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Deletion request not found." });
    }

    if (await markExpiredIfNeeded(request)) {
      return res
        .status(410)
        .json({
          success: false,
          message: "This approval request has expired.",
        });
    }

    if (String(request.requestedBy?._id) === String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "The requester cannot approve their own course deletion.",
      });
    }

    if (
      request.status !== "approval_otp_pending" ||
      String(request.approver) !== String(req.user._id)
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Request an approval OTP for your own admin account before approving.",
      });
    }

    if (
      !request.approverOtpExpiresAt ||
      request.approverOtpExpiresAt <= new Date()
    ) {
      request.status = "pending_approval";
      request.approver = null;
      request.approverOtpHash = "";
      request.approverOtpExpiresAt = null;
      await request.save();
      return res
        .status(410)
        .json({ success: false, message: "The approval OTP has expired." });
    }

    const valid = otpMatches({
      expectedHash: request.approverOtpHash,
      requestId: request._id,
      userId: req.user._id,
      otp: req.body?.otp,
    });

    if (!valid) {
      request.approverOtpAttempts += 1;
      if (request.approverOtpAttempts >= MAX_OTP_ATTEMPTS) {
        request.status = "pending_approval";
        request.approver = null;
        request.approverOtpHash = "";
        request.approverOtpExpiresAt = null;
        request.approverOtpAttempts = 0;
      }
      await request.save();
      return res.status(400).json({
        success: false,
        message:
          request.status === "pending_approval"
            ? "Too many incorrect OTP attempts. Approval has been released for another admin."
            : "Incorrect approval OTP.",
      });
    }

    const current = await computeImpact(request.entityId);
    if (!current) {
      request.status = "failed";
      request.failureReason = "Course no longer exists.";
      await request.save();
      return res
        .status(409)
        .json({ success: false, message: "The course no longer exists." });
    }

    // Prevent the second admin from approving one set of counts while a newer,
    // unreviewed set of content is actually deleted.
    if (
      request.impactFingerprint !== current.fingerprint ||
      !sameImpact(request.impact, current.impact)
    ) {
      request.status = "stale";
      request.failureReason =
        "Course content changed after the deletion request was reviewed.";
      await request.save();
      return res.status(409).json({
        success: false,
        message:
          "Course content changed after this deletion request was created. For safety, start a new request and review the new counts.",
        data: { previousImpact: request.impact, currentImpact: current.impact },
      });
    }

    claimedRequest = await DeletionRequest.findOneAndUpdate(
      {
        _id: request._id,
        status: "approval_otp_pending",
        approver: req.user._id,
      },
      {
        $set: {
          status: "executing",
          approverOtpHash: "",
          approverOtpExpiresAt: null,
        },
      },
      { new: true },
    );

    if (!claimedRequest) {
      return res.status(409).json({
        success: false,
        message: "This deletion request is already being processed.",
      });
    }

    const deletionResult = await executeApprovedDeletion(
      claimedRequest,
      req.user,
    );

    await logActivity({
      actor: req.user,
      action: "course.deleted_after_dual_approval",
      entityType: "course",
      entityId: claimedRequest.course,
      entityTitle: claimedRequest.entitySnapshot.title,
      description: "approved and permanently deleted",
      severity: "critical",
      targetUserId: request.requestedBy?._id,
      after: {
        requestId: String(claimedRequest._id),
        deleted: deletionResult,
      },
      url: "/courses",
    });

    res.status(200).json({
      success: true,
      data: {
        requestId: claimedRequest._id,
        status: "completed",
        result: deletionResult,
      },
      message:
        "The course and the approved related content were permanently deleted.",
    });
  } catch (error) {
    console.error("[COURSE DELETE] approval error:", error);

    if (claimedRequest?._id) {
      await DeletionRequest.updateOne(
        { _id: claimedRequest._id, status: "executing" },
        {
          $set: {
            status: "failed",
            failureReason: String(error.message || "Deletion failed").slice(
              0,
              500,
            ),
          },
        },
      ).catch(() => {});
    }

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Protected deletion failed. The database transaction was rolled back.",
    });
  }
};

export const rejectDeletion = async (req, res) => {
  try {
    if (!ensurePrivileged(req, res)) return;

    const request = await DeletionRequest.findById(
      req.params.requestId,
    ).populate("requestedBy", "fullName username email role");

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Deletion request not found." });
    }

    if (String(request.requestedBy?._id) === String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "The requester cannot act as the second administrator.",
      });
    }

    if (
      !["pending_approval", "approval_otp_pending"].includes(request.status)
    ) {
      return res.status(409).json({
        success: false,
        message: "This request is no longer waiting for a decision.",
      });
    }

    request.status = "rejected";
    request.approver = req.user._id;
    request.rejectedAt = new Date();
    request.approverOtpHash = "";
    request.approverOtpExpiresAt = null;
    await request.save();

    await logActivity({
      actor: req.user,
      action: "course.deletion_rejected",
      entityType: "course",
      entityId: request.entityId,
      entityTitle: request.entitySnapshot.title,
      description: "rejected protected deletion of",
      severity: "critical",
      targetUserId: request.requestedBy?._id,
      url: "/courses",
    });

    res.status(200).json({
      success: true,
      data: { requestId: request._id, status: request.status },
      message: "Course deletion was rejected. Nothing was deleted.",
    });
  } catch (error) {
    console.error("[COURSE DELETE] reject error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to reject course deletion request.",
    });
  }
};

export const blockDirectCourseDeletion = async (req, res) => {
  if (!ensurePrivileged(req, res)) return;

  return res.status(409).json({
    success: false,
    message:
      "Direct course deletion is disabled. Use the protected two-admin deletion workflow from admin.asif.to.",
  });
};
