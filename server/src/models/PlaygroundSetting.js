import { Schema, model } from "mongoose";

const languageSchema = new Schema({
  enabled: { type: Boolean, default: true },
  selectable: { type: Boolean, default: true },
  executionEnabled: { type: Boolean, default: true },
  label: { type: String, trim: true },
  order: { type: Number, default: 0 },
  beta: { type: Boolean, default: false },
  unavailableMessage: { type: String, trim: true, maxlength: 300 },
}, { _id: false });

const playgroundSettingSchema = new Schema({
  key: { type: String, unique: true, default: "default" },
  version: { type: Number, default: 1 },
  status: { type: String, enum: ["draft", "published"], default: "published" },
  editorEnabled: { type: Boolean, default: true },
  executionEnabled: { type: Boolean, default: true },
  maintenanceMessage: { type: String, trim: true, maxlength: 500, default: "" },
  languages: { type: Map, of: languageSchema, default: {} },
  runtimes: { type: Map, of: Boolean, default: {} },
  limits: {
    executionTimeoutMs: { type: Number, default: 10000, min: 1000, max: 120000 },
    maxOutputChars: { type: Number, default: 20000, min: 1000, max: 1000000 },
    maxSourceChars: { type: Number, default: 100000, min: 1000, max: 1000000 },
    runCooldownMs: { type: Number, default: 500, min: 0, max: 60000 },
  },
  features: {
    preview: { type: Boolean, default: true },
    console: { type: Boolean, default: true },
    testCases: { type: Boolean, default: true },
    sharing: { type: Boolean, default: true },
    download: { type: Boolean, default: true },
    persistence: { type: Boolean, default: true },
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true, minimize: false });

export default model("PlaygroundSetting", playgroundSettingSchema);
