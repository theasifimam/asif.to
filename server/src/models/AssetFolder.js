import { Schema, model } from "mongoose";

const assetFolderSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    normalizedName: { type: String, required: true, trim: true, lowercase: true },
    parentId: { type: Schema.Types.ObjectId, ref: "AssetFolder", default: null },
    ancestors: [{ type: Schema.Types.ObjectId, ref: "AssetFolder" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "trashed"], default: "active" },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    trashedByFolderId: {
      type: Schema.Types.ObjectId,
      ref: "AssetFolder",
      default: null,
    },
  },
  { timestamps: true },
);

assetFolderSchema.index(
  { parentId: 1, normalizedName: 1 },
  { unique: true, partialFilterExpression: { status: "active" } },
);
assetFolderSchema.index({ status: 1, parentId: 1, name: 1 });
assetFolderSchema.index({ ancestors: 1, status: 1 });

export default model("AssetFolder", assetFolderSchema);
