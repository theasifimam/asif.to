import JobAlert from "../../models/JobAlert.js";
import Job from "../../models/Job.js";
import User from "../../models/User.js";
import { CommunicationSettings, EmailJob } from "../../models/Communication.js";
import { queueEmail } from "../communications/email.service.js";
import { escapeHtml } from "../communications/policy.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const matchesAlert = (alert, job) => {
  const text = `${job.title} ${job.companyName} ${job.category} ${job.description || ""}`.toLowerCase();
  const keywords = String(alert.keyword || "")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
  if (keywords.length && !keywords.some((keyword) => new RegExp(`\\b${escapeRegex(keyword)}\\b`, "i").test(text))) return false;
  return (!alert.category || alert.category === job.categorySlug) &&
    (!alert.location || alert.location === job.locationSlug) &&
    (!alert.employmentType || alert.employmentType === job.employmentType) &&
    (!alert.workMode || alert.workMode === job.workMode) &&
    (!alert.experienceLevel || alert.experienceLevel === job.experienceLevel);
};

const formatJob = (job, siteUrl) => `- ${job.title} at ${job.companyName}\n  ${job.location} · ${job.category}\n  View the role: ${siteUrl}/jobs/${job.slug}`;

const formatJobHtml = (job, siteUrl) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
    <tr>
      <td style="padding:16px 20px;">
        <h3 style="margin:0 0 4px 0;font-size:16px;font-weight:600;color:#18181b;">${escapeHtml(job.title)}</h3>
        <p style="margin:0 0 8px 0;font-size:14px;color:#3f3f46;">at ${escapeHtml(job.companyName)}</p>
        <p style="margin:0 0 12px 0;font-size:13px;color:#71717a;">${escapeHtml(job.location)} &bull; ${escapeHtml(job.category)}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:#2563eb;border-radius:6px;">
              <a href="${siteUrl}/jobs/${job.slug}" style="display:inline-block;padding:8px 16px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;">View the role</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

export async function unsentJobsForAlert(alert, now = new Date()) {
  const subscribedAt = alert.createdAt ? new Date(alert.createdAt) : new Date(0);
  const jobs = await Job.find({ status: "published", createdAt: { $gte: subscribedAt, $lte: now } })
    .select("title slug companyName location category categorySlug locationSlug employmentType workMode experienceLevel description createdAt")
    .sort({ createdAt: -1 })
    .lean();
  const matchingJobs = jobs.filter((job) => matchesAlert(alert, job));
  if (!matchingJobs.length) return [];
  const matchingJobIds = matchingJobs.map((job) => String(job._id));
  const prior = await EmailJob.find({
    "metadata.alertId": String(alert._id),
    $or: [{ "metadata.jobId": { $in: matchingJobIds } }, { "metadata.jobIds": { $in: matchingJobIds } }],
    status: { $in: ["QUEUED", "SENDING", "SENT", "DELIVERED", "BOUNCED", "COMPLAINED"] },
  }).select("metadata.jobId metadata.jobIds").lean();
  const sentJobIds = new Set(prior.flatMap((job) => [job.metadata?.jobId, ...(job.metadata?.jobIds || [])]).filter(Boolean));
  return matchingJobs.filter((job) => !sentJobIds.has(String(job._id)));
}

export async function sendManualJobAlertDigest(alert, user, jobs) {
  if (!user?.email || !jobs.length) return null;
  const siteUrl = (process.env.WEB_URL || "https://asif.to").replace(/\/$/, "");
  return queueEmail({
    key: `job-alert-manual:${alert._id}:${jobs.map((job) => String(job._id)).sort().join(",")}`,
    recipient: user.email,
    stream: "TRANSACTIONAL",
    type: "job_alert_digest",
    subject: `${jobs.length} new job${jobs.length === 1 ? "" : "s"} matching your alert`,
    text: `Hi ${user.fullName || "there"},\n\nHere ${jobs.length === 1 ? "is a new job" : "are new jobs"} matching your job alert:\n\n${jobs.map((job) => formatJob(job, siteUrl)).join("\n\n")}\n\nYou can turn off job alerts from your asif.to account settings.`,
    html: `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#27272a;">Hi ${user.fullName || "there"},</p><p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#27272a;">Here ${jobs ? (jobs.length === 1 ? "is a new job" : "are new jobs") : (unsentJobs.length === 1 ? "is a new job" : "are new jobs")} matching your job alert:</p>${(jobs || unsentJobs).map((job) => formatJobHtml(job, siteUrl)).join("")}<p style="margin:16px 0 0 0;font-size:15px;line-height:1.7;color:#27272a;">You can turn off job alerts from your asif.to account settings.</p>`,
    metadata: { alertId: String(alert._id), jobIds: jobs.map((job) => String(job._id)), manual: true },
  });
}

export async function notifyMatchingJobAlerts(job) {
  // Kept as a compatibility export for older callers. Job alerts are sent by the daily digest.
  return job;
}

export async function runDailyJobAlertDigests(now = new Date()) {
  const config = await CommunicationSettings.findOne({ key: "default" }).lean();
  const digestHour = Number.isInteger(config?.jobAlertDigestHour) ? config.jobAlertDigestHour : 18;
  const digestMinute = Number.isInteger(config?.jobAlertDigestMinute) ? config.jobAlertDigestMinute : 0;
  const timezone = config?.jobAlertDigestTimezone || process.env.JOB_ALERT_TIMEZONE || "Asia/Dubai";
  const currentHour = Number(new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).format(now));
  const currentMinute = Number(new Intl.DateTimeFormat("en-US", { timeZone: timezone, minute: "numeric" }).format(now));
  if (config?.jobAlertDigestEnabled === false || currentHour * 60 + currentMinute < digestHour * 60 + digestMinute) return { skipped: true, reason: "before_digest_time" };

  const day = new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(now);
  const alerts = await JobAlert.find({ active: true }).lean();
  if (!alerts.length) return { sent: 0 };
  const earliestAlert = alerts.reduce((earliest, alert) => {
    const createdAt = alert.createdAt ? new Date(alert.createdAt) : now;
    return createdAt < earliest ? createdAt : earliest;
  }, now);
  const jobs = await Job.find({ status: "published", createdAt: { $gte: earliestAlert, $lte: now } })
      .select("title slug companyName location category categorySlug locationSlug employmentType workMode experienceLevel description createdAt")
      .sort({ createdAt: -1 })
      .lean();
  if (!jobs.length) return { sent: 0 };

  const users = await User.find({ _id: { $in: alerts.map((alert) => alert.user) }, status: "active" })
    .select("email fullName")
    .lean();
  const byId = new Map(users.map((user) => [String(user._id), user]));
  const siteUrl = (process.env.WEB_URL || "https://asif.to").replace(/\/$/, "");
  let sent = 0;

  for (const alert of alerts) {
    const user = byId.get(String(alert.user));
    if (!user?.email) continue;
    const unsentJobs = await unsentJobsForAlert({ ...alert, createdAt: alert.createdAt || earliestAlert }, now);
    if (!unsentJobs.length) continue;

    await queueEmail({
      key: `job-alert-digest:${day}:${alert._id}`,
      recipient: user.email,
      stream: "TRANSACTIONAL",
      type: "job_alert_digest",
      subject: `${unsentJobs.length} new job${unsentJobs.length === 1 ? "" : "s"} matching your alert`,
      text: `Hi ${user.fullName || "there"},\n\nHere ${unsentJobs.length === 1 ? "is a new job" : "are new jobs"} matching your job alert:\n\n${unsentJobs.map((job) => formatJob(job, siteUrl)).join("\n\n")}\n\nYou can turn off job alerts from your asif.to account settings.`,
      html: `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#27272a;">Hi ${user.fullName || "there"},</p><p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#27272a;">Here ${unsentJobs.length === 1 ? "is a new job" : "are new jobs"} matching your job alert:</p>${unsentJobs.map((job) => formatJobHtml(job, siteUrl)).join("")}<p style="margin:16px 0 0 0;font-size:15px;line-height:1.7;color:#27272a;">You can turn off job alerts from your asif.to account settings.</p>`,
      metadata: {
        alertId: String(alert._id),
        jobIds: unsentJobs.map((job) => String(job._id)),
        digestDay: day,
      },
    });
    sent += 1;
  }
  return { sent };
}
