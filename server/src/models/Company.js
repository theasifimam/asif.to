import { Schema, model } from "mongoose";

const companySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 180 },
    normalizedName: { type: String, default: "", trim: true, maxlength: 180, index: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    logo: { type: String, default: "", trim: true },
    website: { type: String, default: "", trim: true },
    websiteDomain: { type: String, default: "", trim: true, lowercase: true, index: true },
    careersUrl: { type: String, default: "", trim: true },
    description: { type: String, default: "", maxlength: 5000 },
    industry: { type: String, default: "", trim: true, maxlength: 120 },
    size: { type: String, default: "", trim: true, maxlength: 80 },
    headquarters: { type: String, default: "", trim: true, maxlength: 180 },
    verified: { type: Boolean, default: false, index: true },
    active: { type: Boolean, default: true, index: true },
    creationOrigin: { type: String, enum: ["admin_created", "manual_import", "automated_import", "ats_import", "api_import"], default: "admin_created", index: true },
    source: { type: Schema.Types.ObjectId, ref: "JobSource", default: null, index: true },
    sourceName: { type: String, default: "", maxlength: 160 },
    sourceProvider: { type: String, default: "manual", maxlength: 80, index: true },
    providerIdentities: { type: [{ provider: String, organizationId: String }], default: [] },
    overrideFields: { type: [String], default: [] },
  },
  { timestamps: true },
);

companySchema.index({ name: "text", industry: "text", description: "text" });
companySchema.index({ active: 1, name: 1 });
companySchema.index({ "providerIdentities.provider": 1, "providerIdentities.organizationId": 1 });

export default model("Company", companySchema);
