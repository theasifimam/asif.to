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
    serverSelectionTimeoutMS: 30000,  // wait up to 30s before giving up on server selection
    connectTimeoutMS: 30000,          // socket connect timeout
    socketTimeoutMS: 45000,           // socket idle timeout
    heartbeatFrequencyMS: 30000,      // check cluster health every 30s instead of 10s (reduces noise)
    maxPoolSize: 10,                  // cap connection pool
    family: 4,                        // force IPv4 (aligns with ipv4first DNS setting above)
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