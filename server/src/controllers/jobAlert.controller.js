import JobAlert from "../models/JobAlert.js";
import User from "../models/User.js";
import { EmailSubscriber } from "../models/Communication.js";
import { queueEmail } from "../services/communications/email.service.js";

import mongoose from "mongoose";
import Company from "../models/Company.js";

const fields = ["keyword", "category", "location", "employmentType", "workMode", "experienceLevel", "company"];
const clean = (value, max = 160) => String(value || "").trim().toLowerCase().slice(0, max);

const criteriaFrom = (body = {}) => Object.fromEntries(fields.map((field) => [field, clean(body[field])]));

const filterLabels = {
  keyword: "Positions",
  category: "Category",
  location: "Location",
  employmentType: "Employment type",
  workMode: "Work mode",
  experienceLevel: "Experience level",
  company: "Company",
};

const displayValue = (value) => String(value)
  .split("-")
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(" ");

const confirmationText = (user, criteria) => {
  const filters = fields
    .filter((field) => criteria[field])
    .map((field) => `${filterLabels[field]}: ${field === "company" ? (criteria.companyLabel || "this company") : displayValue(criteria[field])}`)
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
  if (criteria.company) {
    const company = mongoose.Types.ObjectId.isValid(criteria.company) ? await Company.findOne({ _id: criteria.company, active: true }).select("name").lean() : null;
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });
    criteria.companyLabel = company.name;
  }
  // Alerts saved before company-following existed have no `company` field, so "no company" must match them too.
  const identity = { user: req.user._id, ...Object.fromEntries(fields.map((field) => [field, criteria[field]])) };
  if (!criteria.company) identity.company = { $in: ["", null] };
  const existing = await JobAlert.findOne(identity).lean();
  let alert;
  if (existing) {
    alert = await JobAlert.findByIdAndUpdate(existing._id, { $set: { active: true } }, { returnDocument: "after" });
  } else {
    try { alert = await JobAlert.create({ user: req.user._id, ...criteria }); }
    catch (error) {
      if (error.code !== 11000) throw error; // created by a parallel request
      alert = await JobAlert.findOneAndUpdate(identity, { $set: { active: true } }, { returnDocument: "after" });
    }
  }
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
