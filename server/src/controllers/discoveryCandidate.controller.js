import mongoose from "mongoose";
import DiscoveryCandidate, { DISCOVERY_METHODS, DISCOVERY_STATUSES } from "../models/DiscoveryCandidate.js";
import DiscoveryRunLog from "../models/DiscoveryRunLog.js";
import { SOURCE_TYPES } from "../constants/jobs.js";
import { cleanText } from "../utils/jobValidation.js";
import {
  adminApproveCandidate,
  adminRejectCandidate,
  adminRetryCandidate,
  adminVerifyCandidate,
  getDiscoveryStats,
  runDiscovery,
} from "../services/jobs/companyDiscovery.service.js";

const isId = (value) => mongoose.Types.ObjectId.isValid(value);
const asBoolean = (value) => value === true || value === "true" || value === "1";

const errorResponse = (res, error, context) => {
  console.error(`[DISCOVERY] ${context}:`, error);
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : "Internal server error",
  });
};

// ─── Dashboard / stats ────────────────────────────────────────────────────────

export async function discoveryDashboard(req, res) {
  try {
    const stats = await getDiscoveryStats();
    const recentRuns = await DiscoveryRunLog.find().sort({ startedAt: -1 }).limit(10).lean();
    res.json({ success: true, data: { stats, recentRuns } });
  } catch (error) {
    errorResponse(res, error, "discoveryDashboard");
  }
}

// ─── Candidate list ───────────────────────────────────────────────────────────

export async function listDiscoveryCandidates(req, res) {
  try {
    const { status, provider, method, search, minConfidence, page = "1", limit = "50", sort = "-createdAt" } = req.query;

    const filter = {};
    if (status && DISCOVERY_STATUSES.includes(status)) filter.status = status;
    if (provider && [...SOURCE_TYPES, "unknown"].includes(provider)) filter.detectedProvider = provider;
    if (method && DISCOVERY_METHODS.includes(method)) filter.discoveryMethod = method;
    if (minConfidence) filter.confidenceScore = { $gte: Number(minConfidence) };
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { companyName: { $regex: escaped, $options: "i" } },
        { domain: { $regex: escaped, $options: "i" } },
        { providerOrganizationId: { $regex: escaped, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const allowedSorts = ["-createdAt", "createdAt", "-confidenceScore", "confidenceScore", "-lastVerifiedAt", "status", "companyName"];
    const sortField = allowedSorts.includes(sort) ? sort : "-createdAt";

    const [candidates, total] = await Promise.all([
      DiscoveryCandidate.find(filter)
        .sort(sortField)
        .skip(skip)
        .limit(limitNum)
        .populate("createdCompanyId", "name slug")
        .populate("createdJobSourceId", "name slug type enabled")
        .lean(),
      DiscoveryCandidate.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        candidates,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (error) {
    errorResponse(res, error, "listDiscoveryCandidates");
  }
}

// ─── Single candidate ─────────────────────────────────────────────────────────

export async function getDiscoveryCandidate(req, res) {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid ID." });
    const candidate = await DiscoveryCandidate.findById(req.params.id)
      .populate("createdCompanyId", "name slug logo website")
      .populate("createdJobSourceId", "name slug type enabled syncStatus lastSyncAt");
    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found." });
    res.json({ success: true, data: candidate });
  } catch (error) {
    errorResponse(res, error, "getDiscoveryCandidate");
  }
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function verifyCandidate(req, res) {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid ID." });
    const result = await adminVerifyCandidate(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    errorResponse(res, error, "verifyCandidate");
  }
}

export async function approveCandidate(req, res) {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid ID." });
    const result = await adminApproveCandidate(req.params.id);
    res.json({ success: true, data: result, message: result.isNew ? "Company and job source created successfully." : "Source already exists." });
  } catch (error) {
    errorResponse(res, error, "approveCandidate");
  }
}

export async function rejectCandidate(req, res) {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid ID." });
    const { reason } = req.body;
    const result = await adminRejectCandidate(req.params.id, reason);
    res.json({ success: true, data: result });
  } catch (error) {
    errorResponse(res, error, "rejectCandidate");
  }
}

export async function retryCandidate(req, res) {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid ID." });
    const result = await adminRetryCandidate(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    errorResponse(res, error, "retryCandidate");
  }
}

// ─── Manual discovery trigger ─────────────────────────────────────────────────

let discoveryRunning = false;

export async function triggerDiscoveryRun(req, res) {
  if (discoveryRunning) {
    return res.status(409).json({ success: false, message: "A discovery run is already in progress." });
  }
  // Return immediately — discovery runs in the background
  res.json({ success: true, message: "Discovery run started in the background." });
  discoveryRunning = true;
  runDiscovery({ trigger: "manual" })
    .catch((err) => console.error("[DISCOVERY] Manual run failed:", err.message))
    .finally(() => { discoveryRunning = false; });
}

// ─── Run logs ─────────────────────────────────────────────────────────────────

export async function listDiscoveryRunLogs(req, res) {
  try {
    const { page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;
    const [logs, total] = await Promise.all([
      DiscoveryRunLog.find().sort({ startedAt: -1 }).skip(skip).limit(limitNum).lean(),
      DiscoveryRunLog.countDocuments(),
    ]);
    res.json({ success: true, data: { logs, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
  } catch (error) {
    errorResponse(res, error, "listDiscoveryRunLogs");
  }
}

export async function getDiscoveryRunLog(req, res) {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid ID." });
    const log = await DiscoveryRunLog.findById(req.params.id).lean();
    if (!log) return res.status(404).json({ success: false, message: "Run log not found." });
    res.json({ success: true, data: log });
  } catch (error) {
    errorResponse(res, error, "getDiscoveryRunLog");
  }
}
