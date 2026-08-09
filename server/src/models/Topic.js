import { Schema, Document, model } from "mongoose";










const topicSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  isParent: {
    type: Boolean,
    default: false
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: "Topic"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default model("Topic", topicSchema);