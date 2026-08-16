import { Schema, model } from "mongoose";

const libraryCollectionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: "", maxlength: 500 },
    visibility: { type: String, enum: ["private", "public", "unlisted"], default: "private", index: true },
    items: [{ itemId: { type: Schema.Types.ObjectId, required: true }, itemType: { type: String, enum: ["knowledge", "bookmark", "saved"], required: true } }],
  },
  { timestamps: true },
);
libraryCollectionSchema.index({ userId: 1, updatedAt: -1 });
export default model("LibraryCollection", libraryCollectionSchema);
