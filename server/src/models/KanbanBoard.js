import { Schema, model } from "mongoose";

const kanbanBoardSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: "", trim: true, maxlength: 240 },
    color: { type: String, default: "#2563eb", trim: true, maxlength: 20 },
    order: { type: Number, default: 0 },
    archived: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

kanbanBoardSchema.index({ archived: 1, order: 1 });

export default model("KanbanBoard", kanbanBoardSchema);
