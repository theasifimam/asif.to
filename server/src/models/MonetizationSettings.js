import { Schema, model } from "mongoose";

const thresholdSchema = new Schema(
  {
    minWords: { type: Number, required: true, min: 0, max: 100000 },
    maxAds: { type: Number, required: true, min: 0, max: 3 },
  },
  { _id: false },
);

const monetizationSettingsSchema = new Schema(
  {
    key: { type: String, unique: true, default: "default" },
    version: { type: Number, default: 1, min: 1 },
    adsEnabled: { type: Boolean, default: false },
    previewMode: { type: Boolean, default: false },
    provider: { type: String, enum: ["adsense"], default: "adsense" },
    contentTypes: {
      article: { type: Boolean, default: true },
      course: { type: Boolean, default: true },
      cheatsheet: { type: Boolean, default: true },
      interview: { type: Boolean, default: true },
    },
    contentRules: {
      thresholds: {
        type: [thresholdSchema],
        default: () => [
          { minWords: 0, maxAds: 0 },
          { minWords: 400, maxAds: 1 },
          { minWords: 700, maxAds: 2 },
          { minWords: 1500, maxAds: 3 },
        ],
        validate: {
          validator(value) {
            if (!Array.isArray(value) || value.length < 2 || value.length > 8) {
              return false;
            }
            const minimums = value.map((item) => item.minWords);
            return (
              minimums[0] === 0 && new Set(minimums).size === minimums.length
            );
          },
          message:
            "Content thresholds must contain 2-8 unique bands beginning at 0 words.",
        },
      },
      safetyDistancePx: { type: Number, default: 240, min: 100, max: 1000 },
    },
    adsense: {
      clientId: {
        type: String,
        trim: true,
        default: "",
        validate: {
          validator: (value) => !value || /^ca-pub-\d{16}$/.test(value),
          message:
            "AdSense client ID must use the ca-pub-XXXXXXXXXXXXXXXX format.",
        },
      },
      approvalStatus: {
        type: String,
        enum: [
          "not_configured",
          "awaiting_approval",
          "approved",
          "action_required",
        ],
        default: "not_configured",
      },
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, minimize: false },
);

monetizationSettingsSchema.pre("validate", function normalizeThresholds() {
  if (Array.isArray(this.contentRules?.thresholds)) {
    this.contentRules.thresholds.sort((a, b) => a.minWords - b.minWords);
  }
});

export default model("MonetizationSettings", monetizationSettingsSchema);
