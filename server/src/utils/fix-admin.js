import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function fixAdmin() {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI not found');
    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin_1778477329496@mazlis.com";
    const hashedPassword = await bcrypt.hash('password123', 10);

    const result = await User.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount > 0) {
      console.log(`✅ Successfully updated password for ${email}`);
    } else {
      console.log(`❌ Admin user not found with email ${email}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error fixing admin password:', error);
    process.exit(1);
  }
}

fixAdmin();