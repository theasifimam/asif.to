import mongoose, { Schema } from 'mongoose';

const PageSchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  summary: { type: String, default: "", trim: true },
  content: { type: String, required: true },
  status: { type: String, enum: ["published", "draft"], default: "published" },
  seoTitle: { type: String, default: "", trim: true, maxlength: 70 },
  seoDescription: { type: String, default: "", trim: true, maxlength: 170 },
  keywords: { type: [String], default: [] },
  canonicalUrl: { type: String, default: "", trim: true },
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model('Page', PageSchema);