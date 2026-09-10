import { Router } from "express";
import {
  adminBulkJobs, adminCreateCompany, adminCreateJob, adminCreateSource, adminDashboard, adminDeleteJob,
  adminDownloadResume, adminGetCompany, adminGetJob, adminGetSource, adminListApplications, adminListCompanies, adminListJobs, adminListSourceLogs, adminListSources,
  adminSyncSource, adminTestSource, adminUpdateApplication, adminUpdateCompany, adminUpdateJob, adminUpdateSource, externalApply,
  getJobsSitemap, getMyJobApplications, getMySavedJobs, getPublicCompany, getPublicJob, getPublicTaxonomy,
  internalApply, listPublicJobs, recordJobEvent, toggleSavedJob,
} from "../controllers/job.controller.js";
import { optionalProtect, protect } from "../middlewares/auth.middleware.js";
import { jobRateLimit } from "../middlewares/jobRateLimit.middleware.js";
import { uploadJobResume } from "../middlewares/upload.middleware.js";
import { requirePermission } from "../utils/permissions.js";

const router = Router();

router.get("/", jobRateLimit({ max: 120 }), listPublicJobs);
router.get("/taxonomy", getPublicTaxonomy);
router.get("/sitemap", getJobsSitemap);
router.get("/slug/:slug", jobRateLimit({ max: 120 }), getPublicJob);
router.get("/company/:slug", jobRateLimit({ max: 120 }), getPublicCompany);
router.post("/events", optionalProtect, jobRateLimit({ max: 40 }), recordJobEvent);
router.post("/:id/events", optionalProtect, jobRateLimit({ max: 40 }), recordJobEvent);

router.get("/me/saved", protect, getMySavedJobs);
router.get("/me/applications", protect, getMyJobApplications);
router.post("/:id/save", protect, jobRateLimit({ max: 30 }), toggleSavedJob);
router.post("/:id/external-apply", protect, jobRateLimit({ windowMs: 60_000, max: 12 }), externalApply);
router.post("/:id/apply", protect, jobRateLimit({ windowMs: 60_000, max: 8 }), uploadJobResume.single("resume"), internalApply);

router.get("/admin/dashboard", protect, requirePermission("jobs.view"), adminDashboard);
router.get("/admin/jobs", protect, requirePermission("jobs.view"), adminListJobs);
router.get("/admin/jobs/:id", protect, requirePermission("jobs.view"), adminGetJob);
router.post("/admin/jobs", protect, requirePermission("jobs.manage"), adminCreateJob);
router.patch("/admin/jobs/:id", protect, requirePermission("jobs.manage"), adminUpdateJob);
router.post("/admin/jobs/bulk/actions", protect, requirePermission("jobs.manage"), adminBulkJobs);
router.delete("/admin/jobs/:id", protect, requirePermission("jobs.delete"), adminDeleteJob);

router.get("/admin/companies", protect, requirePermission("jobs.view"), adminListCompanies);
router.get("/admin/companies/:id", protect, requirePermission("jobs.view"), adminGetCompany);
router.post("/admin/companies", protect, requirePermission("jobs.manage"), adminCreateCompany);
router.patch("/admin/companies/:id", protect, requirePermission("jobs.manage"), adminUpdateCompany);

router.get("/admin/sources", protect, requirePermission("job_sources.manage"), adminListSources);
router.get("/admin/sources/:id", protect, requirePermission("job_sources.manage"), adminGetSource);
router.post("/admin/sources", protect, requirePermission("job_sources.manage"), adminCreateSource);
router.patch("/admin/sources/:id", protect, requirePermission("job_sources.manage"), adminUpdateSource);
router.post("/admin/sources/:id/test", protect, requirePermission("job_sources.manage"), jobRateLimit({ windowMs: 60_000, max: 10 }), adminTestSource);
router.post("/admin/sources/:id/sync", protect, requirePermission("job_sources.manage"), jobRateLimit({ windowMs: 60_000, max: 5 }), adminSyncSource);
router.get("/admin/sources/:id/logs", protect, requirePermission("job_sources.manage"), adminListSourceLogs);

router.get("/admin/applications", protect, requirePermission("job_applications.review"), adminListApplications);
router.patch("/admin/applications/:id", protect, requirePermission("job_applications.review"), adminUpdateApplication);
router.get("/admin/applications/:id/resume", protect, requirePermission("job_applications.review"), adminDownloadResume);

export default router;
