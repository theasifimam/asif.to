import { Schema, model } from "mongoose";

// Tiny key/value store for discovery bookkeeping (e.g. the probe cursor), so a
// restart continues where the last run stopped instead of re-probing from zero.
const discoveryStateSchema = new Schema(
  { key: { type: String, required: true, unique: true, trim: true, maxlength: 120 }, value: { type: Schema.Types.Mixed, default: null } },
  { timestamps: true },
);

export default model("DiscoveryState", discoveryStateSchema);
