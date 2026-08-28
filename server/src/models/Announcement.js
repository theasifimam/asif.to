import { Schema, model } from "mongoose";

const announcementSchema = new Schema(
  {
    key: { type: String, unique: true, default: "site-header" },
    enabled: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ["info", "maintenance", "warning", "success"],
      default: "maintenance",
    },
    title: { type: String, trim: true, maxlength: 120, default: "" },
    message: { type: String, trim: true, maxlength: 500, default: "" },
    details: { type: String, trim: true, maxlength: 2000, default: "" },
    linkLabel: { type: String, trim: true, maxlength: 60, default: "" },
    linkUrl: { type: String, trim: true, maxlength: 500, default: "" },
    eventStartsAt: { type: Date, default: null },
    eventEndsAt: { type: Date, default: null },
    visibleFrom: { type: Date, default: null },
    visibleUntil: { type: Date, default: null },
    dismissible: { type: Boolean, default: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default model("Announcement", announcementSchema);
