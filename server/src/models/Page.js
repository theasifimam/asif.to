import mongoose, { Schema, Document } from 'mongoose';








const PageSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model('Page', PageSchema);