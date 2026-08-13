import { Schema, model } from "mongoose";

const kanbanLabelSchema = new Schema(
  {
    board: { type: Schema.Types.ObjectId, ref: "KanbanBoard", required: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    color: { type: String, default: "#2563eb", trim: true, maxlength: 20 },
  },
  { timestamps: true },
);

kanbanLabelSchema.index({ board: 1, name: 1 }, { unique: true });

export default model("KanbanLabel", kanbanLabelSchema);
