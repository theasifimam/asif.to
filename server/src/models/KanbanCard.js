import { Schema, model } from "mongoose";

const checklistItemSchema = new Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 240 },
    completed: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const activitySchema = new Schema(
  {
    action: { type: String, required: true, maxlength: 80 },
    detail: { type: String, default: "", maxlength: 300 },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const kanbanCardSchema = new Schema(
  {
    board: { type: Schema.Types.ObjectId, ref: "KanbanBoard", required: true },
    column: { type: Schema.Types.ObjectId, ref: "KanbanColumn", required: true },
    title: { type: String, required: true, trim: true, maxlength: 240 },
    description: { type: String, default: "", maxlength: 20000 },
    type: {
      type: String,
      enum: ["Course", "Chapter", "Article", "Tutorial", "SEO", "Feature", "Bug", "Improvement", "Idea", "Task"],
      default: "Task",
    },
    priority: {
      type: String,
      enum: ["Urgent", "High", "Medium", "Low", "None"],
      default: "None",
    },
    labels: [{ type: Schema.Types.ObjectId, ref: "KanbanLabel" }],
    dueDate: { type: Date, default: null },
    order: { type: Number, required: true, default: 0 },
    archived: { type: Boolean, default: false },
    checklist: { type: [checklistItemSchema], default: [] },
    parentCard: { type: Schema.Types.ObjectId, ref: "KanbanCard", default: null },
    relatedCards: [{ type: Schema.Types.ObjectId, ref: "KanbanCard" }],
    parentCourse: { type: Schema.Types.ObjectId, ref: "Course", default: null },
    seo: {
      primaryKeyword: { type: String, default: "", trim: true, maxlength: 160 },
      secondaryKeywords: { type: [String], default: [] },
      searchIntent: { type: String, default: "", trim: true, maxlength: 80 },
      proposedSlug: { type: String, default: "", trim: true, maxlength: 300 },
      contentCluster: { type: String, default: "", trim: true, maxlength: 160 },
      metaTitle: { type: String, default: "", trim: true, maxlength: 100 },
      metaDescription: { type: String, default: "", trim: true, maxlength: 240 },
      internalLinks: { type: [String], default: [] },
      notes: { type: String, default: "", maxlength: 5000 },
    },
    activity: { type: [activitySchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

kanbanCardSchema.index({ board: 1, column: 1, archived: 1, order: 1 });
kanbanCardSchema.index({ board: 1, archived: 1, updatedAt: -1 });
kanbanCardSchema.index({ board: 1, type: 1, priority: 1, dueDate: 1 });
kanbanCardSchema.index({ title: "text", description: "text", "seo.primaryKeyword": "text" });

export default model("KanbanCard", kanbanCardSchema);
