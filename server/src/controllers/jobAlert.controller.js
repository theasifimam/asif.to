import JobAlert from "../models/JobAlert.js";
import User from "../models/User.js";
import { EmailSubscriber } from "../models/Communication.js";
import { queueEmail } from "../services/communications/email.service.js";

const fields = ["keyword", "category", "location", "employmentType", "workMode", "experienceLevel"];
const clean = (value, max = 160) => String(value || "").trim().toLowerCase().slice(0, max);

const criteriaFrom = (body = {}) => Object.fromEntries(fields.map((field) => [field, clean(body[field])]));

const filterLabels = {
  keyword: "Positions",
  category: "Category",
  location: "Location",
  employmentType: "Employment type",
  workMode: "Work mode",
  experienceLevel: "Experience level",
};

const displayValue = (value) => String(value)
  .split("-")
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(" ");

const confirmationText = (user, criteria) => {
  const filters = fields
    .filter((field) => criteria[field])
    .map((field) => `${filterLabels[field]}: ${displayValue(criteria[field])}`)
    .join("\n");

  return `Hi ${user.fullName || "there"},

You have successfully subscribed to job notification emails on asif.to.

We’ll notify you when a job matches these filters:
${filters}

You can turn off this job alert at any time from your job alerts on asif.to.`;
};

export const createJobAlert = async (req, res) => {
  const criteria = criteriaFrom(req.body);
  if (!Object.values(criteria).some(Boolean)) return res.status(400).json({ success: false, message: "Choose a role or job filter first." });
  const existing = await JobAlert.findOne({ user: req.user._id, ...criteria }).lean();
  const alert = await JobAlert.findOneAndUpdate(
    { user: req.user._id, ...criteria },
    { $set: { active: true } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
  const user = await User.findById(req.user._id).select("email fullName").lean();
  if (user?.email) {
    await EmailSubscriber.findOneAndUpdate(
      { email: user.email },
      { $set: { user: user._id }, $setOnInsert: {
        firstName: user.fullName?.split(" ")[0] || "",
        status: "ACTIVE",
        topics: ["Job Alerts"],
        source: "job_alert",
        verifiedAt: new Date(),
        consentAt: new Date(),
      } },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  // A repeated request for an already-active alert is not a new subscription.
  if (!existing?.active) {
    if (user?.email) {
      queueEmail({
        key: `job-alert-subscription:${alert._id}`,
        recipient: user.email,
        stream: "TRANSACTIONAL",
        type: "job_alert_subscription",
        subject: "Your job notification subscription is confirmed",
        text: confirmationText(user, criteria),
        metadata: { alertId: String(alert._id), kind: "subscription_confirmation" },
      }).catch((error) => console.error("[JOBS] alert subscription confirmation:", error.message));
    }
  }
  return res.status(201).json({ success: true, data: alert });
};

export const listMyJobAlerts = async (req, res) => {
  const alerts = await JobAlert.find({ user: req.user._id, active: true }).sort({ createdAt: -1 }).lean();
  return res.json({ success: true, data: alerts });
};

export const deleteJobAlert = async (req, res) => {
  const alert = await JobAlert.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { $set: { active: false } }, { returnDocument: "after" });
  if (!alert) return res.status(404).json({ success: false, message: "Job alert not found." });
  return res.json({ success: true, data: alert });
};
