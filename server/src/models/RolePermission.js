import { Schema, model } from "mongoose";

const rolePermissionSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["reader", "author", "editor", "admin", "super_admin"],
      required: true,
      unique: true,
      index: true,
    },
    permissions: [{ type: String, trim: true }],
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default model("RolePermission", rolePermissionSchema);
