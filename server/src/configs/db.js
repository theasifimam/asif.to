import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

// Force DNS resolution to prefer IPv4 first (prevents Windows IPv6 DNS timeout delays)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const connectDB = async (retries = 3) => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  const options = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, options);
      console.log("✅ MongoDB connected successfully");
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed:`, error.message || error);

      // Handle DNS SRV lookup timeouts by configuring explicit public DNS servers
      if (
        error.code === "ETIMEOUT" ||
        error.syscall === "querySrv" ||
        (error.message && error.message.includes("querySrv"))
      ) {
        console.log("🔄 DNS SRV timeout encountered. Setting fallback DNS resolvers (8.8.8.8, 1.1.1.1)...");
        try {
          dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
        } catch (dnsErr) {
          console.warn("⚠️ Could not set custom DNS servers:", dnsErr.message);
        }
      }

      if (attempt === retries) {
        console.error("❌ All MongoDB connection attempts failed.");
        process.exit(1);
      }

      console.log(`⏳ Retrying MongoDB connection in 2 seconds...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};

export default connectDB;