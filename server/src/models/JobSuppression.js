import { Schema, model } from "mongoose";

// Retain only import identities after an administrator deletes an imported job.
const schema = new Schema({
  key: { type: String, required: true, unique: true },
  reason: { type: String, default: "admin_deleted" },
}, { timestamps: true });

export default model("JobSuppression", schema);
