import { Schema, model } from "mongoose";

const jobAlertSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    keyword: { type: String, default: "", trim: true, maxlength: 120 },
    category: { type: String, default: "", trim: true, lowercase: true, maxlength: 120 },
    location: { type: String, default: "", trim: true, lowercase: true, maxlength: 160 },
    employmentType: { type: String, default: "", trim: true, lowercase: true, maxlength: 40 },
    workMode: { type: String, default: "", trim: true, lowercase: true, maxlength: 40 },
    experienceLevel: { type: String, default: "", trim: true, lowercase: true, maxlength: 40 },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

jobAlertSchema.index(
  { user: 1, keyword: 1, category: 1, location: 1, employmentType: 1, workMode: 1, experienceLevel: 1 },
  { unique: true },
);

export default model("JobAlert", jobAlertSchema);
