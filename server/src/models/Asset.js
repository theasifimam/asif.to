import { Schema, model } from "mongoose";

const variantSchema = new Schema(
  {
    kind: { type: String, required: true, trim: true },
    storageKey: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    size: { type: Number, required: true, min: 0 },
    width: { type: Number, default: null, min: 1 },
    height: { type: Number, default: null, min: 1 },
  },
  { _id: false },
);

const assetSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    originalName: { type: String, required: true, trim: true, maxlength: 255 },
    storageKey: { type: String, required: true, trim: true },
    storageProvider: {
      type: String,
      enum: ["local"],
      default: "local",
    },
    mimeType: { type: String, required: true, trim: true },
    extension: { type: String, required: true, trim: true, lowercase: true },
    category: {
      type: String,
      enum: ["image", "video", "document", "code_archive", "other"],
      required: true,
    },
    size: { type: Number, required: true, min: 0 },
    width: { type: Number, default: null, min: 1 },
    height: { type: Number, default: null, min: 1 },
    folderId: { type: Schema.Types.ObjectId, ref: "AssetFolder", default: null },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    checksum: { type: String, required: true, lowercase: true, trim: true },
    variants: { type: [variantSchema], default: [] },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    isFavorite: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "trashed"], default: "active" },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    trashedByFolderId: {
      type: Schema.Types.ObjectId,
      ref: "AssetFolder",
      default: null,
    },
    duplicateOf: { type: Schema.Types.ObjectId, ref: "Asset", default: null },
  },
  { timestamps: true },
);

assetSchema.index({ name: "text", originalName: "text", extension: "text" });
assetSchema.index({ status: 1, folderId: 1, createdAt: -1 });
assetSchema.index({ status: 1, category: 1, createdAt: -1 });
assetSchema.index({ status: 1, isFavorite: 1, createdAt: -1 });
assetSchema.index({ status: 1, uploadedBy: 1, createdAt: -1 });
assetSchema.index({ checksum: 1, status: 1 });
assetSchema.index({ storageKey: 1 });

export default model("Asset", assetSchema);
