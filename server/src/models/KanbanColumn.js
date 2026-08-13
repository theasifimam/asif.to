import { Schema, model } from "mongoose";

const kanbanColumnSchema = new Schema(
  {
    board: { type: Schema.Types.ObjectId, ref: "KanbanBoard", required: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    color: { type: String, default: "#64748b", trim: true, maxlength: 20 },
    order: { type: Number, required: true, default: 0 },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

kanbanColumnSchema.index({ board: 1, archived: 1, order: 1 });

export default model("KanbanColumn", kanbanColumnSchema);
