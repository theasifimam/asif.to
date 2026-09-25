import { Router } from "express";
import {
  approveCandidate,
  discoveryDashboard,
  getDiscoveryCandidate,
  getDiscoveryRunLog,
  listDiscoveryCandidates,
  listDiscoveryRunLogs,
  rejectCandidate,
  retryCandidate,
  triggerDiscoveryRun,
  verifyCandidate,
} from "../controllers/discoveryCandidate.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { jobRateLimit } from "../middlewares/jobRateLimit.middleware.js";
import { requirePermission } from "../utils/permissions.js";

const router = Router();

// All discovery endpoints require the job_sources.manage permission (same as sources)
const auth = [protect, requirePermission("job_sources.manage")];

router.get("/dashboard", ...auth, discoveryDashboard);
router.get("/candidates", ...auth, listDiscoveryCandidates);
router.get("/candidates/:id", ...auth, getDiscoveryCandidate);
router.post("/candidates/:id/verify", ...auth, jobRateLimit({ windowMs: 60_000, max: 10 }), verifyCandidate);
router.post("/candidates/:id/approve", ...auth, jobRateLimit({ windowMs: 60_000, max: 10 }), approveCandidate);
router.post("/candidates/:id/reject", ...auth, rejectCandidate);
router.post("/candidates/:id/retry", ...auth, jobRateLimit({ windowMs: 60_000, max: 10 }), retryCandidate);
router.post("/run", ...auth, jobRateLimit({ windowMs: 5 * 60_000, max: 3 }), triggerDiscoveryRun);
router.get("/logs", ...auth, listDiscoveryRunLogs);
router.get("/logs/:id", ...auth, getDiscoveryRunLog);

export default router;
