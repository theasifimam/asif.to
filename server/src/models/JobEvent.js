import { Schema, model } from "mongoose";

const jobEventSchema = new Schema(
  {
    event: { type: String, enum: ["view", "search", "filter", "save", "unsave", "apply_click", "external_redirect", "internal_application", "share"], required: true, index: true },
    job: { type: Schema.Types.ObjectId, ref: "Job", default: null, index: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", default: null, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    category: { type: String, default: "", maxlength: 120, index: true },
    location: { type: String, default: "", maxlength: 160, index: true },
    query: { type: String, default: "", maxlength: 300 },
    metadata: { type: Schema.Types.Mixed, default: {} },
    occurredAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false },
);

jobEventSchema.index({ event: 1, occurredAt: -1 });
jobEventSchema.index({ job: 1, event: 1, occurredAt: -1 });

export default model("JobEvent", jobEventSchema);
