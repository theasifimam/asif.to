import { Schema, model } from "mongoose";
const seoSettingSchema = new Schema({
  path: { type: String, required: true, unique: true, trim: true, maxlength: 500 },
  title: { type: String, default: "", trim: true, maxlength: 70 },
  description: { type: String, default: "", trim: true, maxlength: 170 },
  keywords: { type: [String], default: [] },
  canonicalUrl: { type: String, default: "", trim: true, maxlength: 500 },
  ogImage: { type: String, default: "", trim: true, maxlength: 1000 },
  noIndex: { type: Boolean, default: false },
}, { timestamps: true });
export default model("SeoSetting", seoSettingSchema);
