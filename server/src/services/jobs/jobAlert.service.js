import JobAlert from "../../models/JobAlert.js";
import User from "../../models/User.js";
import { queueEmail } from "../communications/email.service.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function notifyMatchingJobAlerts(job) {
  if (!job || job.status !== "published") return;
  const alerts = await JobAlert.find({ active: true }).lean();
  const text = `${job.title} ${job.companyName} ${job.category} ${job.description || ""}`.toLowerCase();
  const matches = alerts.filter((alert) => {
    if (alert.keyword && !new RegExp(`\\b${escapeRegex(alert.keyword)}\\b`, "i").test(text)) return false;
    return (!alert.category || alert.category === job.categorySlug) &&
      (!alert.location || alert.location === job.locationSlug) &&
      (!alert.employmentType || alert.employmentType === job.employmentType) &&
      (!alert.workMode || alert.workMode === job.workMode) &&
      (!alert.experienceLevel || alert.experienceLevel === job.experienceLevel);
  });
  if (!matches.length) return;
  const users = await User.find({ _id: { $in: matches.map((alert) => alert.user) }, status: "active" }).select("email fullName").lean();
  const byId = new Map(users.map((user) => [String(user._id), user]));
  const siteUrl = (process.env.WEB_URL || "https://asif.to").replace(/\/$/, "");
  await Promise.all(matches.map(async (alert) => {
    const user = byId.get(String(alert.user));
    if (!user?.email) return;
    await queueEmail({
      key: `job-alert:${alert._id}:${job._id}`,
      recipient: user.email,
      stream: "TRANSACTIONAL",
      type: "job_alert",
      subject: `New job matching your alert: ${job.title}`,
      text: `Hi ${user.fullName || "there"},\n\nA new job matches your alert:\n${job.title} at ${job.companyName}\n${job.location}\n\nView the role: ${siteUrl}/jobs/${job.slug}\n\nYou can turn off job alerts from your asif.to account settings.`,
      metadata: { alertId: String(alert._id), jobId: String(job._id) },
    });
  }));
}
