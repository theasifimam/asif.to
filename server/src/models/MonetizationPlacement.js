import { Schema, model } from "mongoose";

const monetizationPlacementSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z][A-Z0-9_]{2,63}$/, "Placement key is invalid."],
    },
    label: { type: String, required: true, trim: true, maxlength: 100 },
    provider: {
      type: String,
      enum: ["adsense", "sponsor", "affiliate", "house"],
      default: "adsense",
    },
    enabled: { type: Boolean, default: false },
    slotId: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: (value) => !value || /^\d{6,20}$/.test(value),
        message: "AdSense slot ID must contain 6-20 digits.",
      },
    },
    pageType: {
      type: String,
      enum: ["article", "course-chapter", "cheatsheet", "interview-question"],
      required: true,
    },
    position: {
      type: String,
      enum: ["middle", "bottom", "sidebar"],
      required: true,
    },
    minWordCount: { type: Number, default: 400, min: 0, max: 100000 },
    maxPerPage: { type: Number, default: 1, min: 1, max: 3 },
    deviceTargeting: {
      type: String,
      enum: ["all", "desktop", "mobile", "tablet"],
      default: "all",
    },
    experimentId: { type: String, trim: true, maxlength: 100, default: "" },
    variant: { type: String, trim: true, maxlength: 50, default: "" },
    implementationStatus: {
      type: String,
      enum: ["mounted", "reserved"],
      default: "mounted",
      immutable: true,
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

monetizationPlacementSchema.pre("validate", function validateEnabledAdSense() {
  if (this.enabled && this.implementationStatus !== "mounted") {
    this.invalidate("enabled", "A reserved placement cannot be enabled.");
  }
  if (this.enabled && this.provider === "adsense" && !this.slotId) {
    this.invalidate(
      "slotId",
      "An AdSense slot ID is required before enabling a placement.",
    );
  }
});

monetizationPlacementSchema.index({ pageType: 1, enabled: 1 });

export default model("MonetizationPlacement", monetizationPlacementSchema);
