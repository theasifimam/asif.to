import { Schema, model } from "mongoose";

const libraryBookmarkSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 1000 },
    note: { type: String, default: "", maxlength: 5000 },
    domain: { type: String, default: "" },
    tags: { type: [String], default: [] },
    collectionId: { type: Schema.Types.ObjectId, ref: "LibraryCollection", default: null },
    visibility: { type: String, enum: ["private", "public", "unlisted"], default: "private", index: true },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true },
);
libraryBookmarkSchema.index({ userId: 1, updatedAt: -1 });
export default model("LibraryBookmark", libraryBookmarkSchema);
