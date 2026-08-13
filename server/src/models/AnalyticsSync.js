import { Schema, model } from "mongoose";

const analyticsSyncSchema = new Schema(
  {
    provider: { type: String, unique: true, default: "search-console" },
    status: { type: String, enum: ["idle", "syncing", "success", "error"], default: "idle" },
    lastStartedAt: Date,
    lastSyncedAt: Date,
    syncedThrough: Date,
    rowsSynced: { type: Number, default: 0 },
    error: { type: String, default: "" },
  },
  { timestamps: true },
);

export default model("AnalyticsSync", analyticsSyncSchema);
