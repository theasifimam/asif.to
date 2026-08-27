import { Schema, model } from "mongoose";

const assetUsageSchema = new Schema(
  {
    asset: { type: Schema.Types.ObjectId, ref: "Asset", required: true },
    entityType: { type: String, required: true, trim: true, maxlength: 80 },
    entityId: { type: Schema.Types.ObjectId, required: true },
    field: { type: String, required: true, trim: true, maxlength: 160 },
    entityTitle: { type: String, default: "", trim: true, maxlength: 300 },
    entityStatus: { type: String, default: "", trim: true, maxlength: 40 },
    route: { type: String, default: "", trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

assetUsageSchema.index(
  { asset: 1, entityType: 1, entityId: 1, field: 1 },
  { unique: true },
);
assetUsageSchema.index({ asset: 1, entityStatus: 1 });
assetUsageSchema.index({ entityType: 1, entityId: 1 });

export default model("AssetUsage", assetUsageSchema);
