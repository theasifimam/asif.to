import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./src/models/User.js";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/news-asif";
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const email = "admin@asif.to";
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin user already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const newAdmin = new User({
      fullName: "System Admin",
      username: "admin",
      email: email,
      password: hashedPassword,
      role: "admin",
      status: "active",
      isVerified: true,
    });

    await newAdmin.save();
    console.log(
      "Admin user created successfully! Email: admin@asif.to, Password: admin123",
    );
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

createAdmin();
