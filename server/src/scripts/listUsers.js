import connectDB from "../configs/db.js";
import User from "../models/User.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: false });

async function run() {
  try {
    await connectDB();
    const users = await User.find({}).lean();
    console.log(JSON.stringify(users.map(u => ({ username: u.username, providerAccountId: u.providerAccountId, email: u.email, oauthAccounts: u.oauthAccounts })), null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
