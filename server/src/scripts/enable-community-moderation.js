import dotenv from "dotenv";
import connectDB from "../configs/db.js";
import RolePermission from "../models/RolePermission.js";

dotenv.config();
await connectDB();
await RolePermission.updateMany({ role: { $in: ["editor", "admin"] } }, { $addToSet: { permissions: "community.moderate" } });
console.log("Community moderation permission enabled for existing editor/admin permission records.");
process.exit(0);
