import { Schema, model } from "mongoose";

const siteSettingSchema = new Schema({
  site: { type: String, enum: ["public", "admin"], required: true, unique: true },
  title: { type: String, default: "", trim: true, maxlength: 120 },
  tagline: { type: String, default: "", trim: true, maxlength: 180 },
  description: { type: String, default: "", trim: true, maxlength: 320 },
  logoUrl: { type: String, default: "", trim: true, maxlength: 1000 },
  faviconUrl: { type: String, default: "", trim: true, maxlength: 1000 },
  websiteUrl: { type: String, default: "", trim: true, maxlength: 500 },
  supportEmail: { type: String, default: "", trim: true, maxlength: 200 },
  social: {
    github: { type: String, default: "", trim: true, maxlength: 500 },
    linkedin: { type: String, default: "", trim: true, maxlength: 500 },
    instagram: { type: String, default: "", trim: true, maxlength: 500 },
    youtube: { type: String, default: "", trim: true, maxlength: 500 },
    twitter: { type: String, default: "", trim: true, maxlength: 500 },
    facebook: { type: String, default: "", trim: true, maxlength: 500 },
  },
}, { timestamps: true });

export default model("SiteSetting", siteSettingSchema);
