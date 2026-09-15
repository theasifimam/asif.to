import JobAlert from "../models/JobAlert.js";

const fields = ["keyword", "category", "location", "employmentType", "workMode", "experienceLevel"];
const clean = (value, max = 160) => String(value || "").trim().toLowerCase().slice(0, max);

const criteriaFrom = (body = {}) => Object.fromEntries(fields.map((field) => [field, clean(body[field])]));

export const createJobAlert = async (req, res) => {
  const criteria = criteriaFrom(req.body);
  if (!Object.values(criteria).some(Boolean)) return res.status(400).json({ success: false, message: "Choose a role or job filter first." });
  const alert = await JobAlert.findOneAndUpdate(
    { user: req.user._id, ...criteria },
    { $set: { active: true } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
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
