import "dotenv/config";
import mongoose from "mongoose";
import ContactMessage from "../models/ContactMessage.js";
import User from "../models/User.js";
import Asset from "../models/Asset.js";
import Notification from "../models/Notification.js";
import * as communications from "../models/Communication.js";
import { ensureConversation } from "../services/communications/inbox.service.js";

// Explicit apply; the default report does not create collections or indexes.
const apply = process.argv.includes("--apply");
try {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required.");
  await mongoose.connect(process.env.MONGO_URI, { autoIndex: false, autoCreate: false });
  const total = await ContactMessage.countDocuments();
  const pending = await ContactMessage.countDocuments({ $or: [{ conversationNumber: { $exists: false } }, { conversationNumber: null }] });
  console.log(JSON.stringify({ mode: apply ? "apply" : "report", enquiries: total, enquiriesWithoutNumber: pending }));
  if (apply) {
    const models = Object.values(communications).filter(value => typeof value?.createIndexes === "function");
    for (const model of [ContactMessage, Asset, Notification, ...models]) await model.createIndexes();
    let processed = 0;
    for await (const contact of ContactMessage.find().cursor()) {
      await ensureConversation(contact);
      if (!contact.customer) {
        const user = await User.findOne({ email: contact.email, deletedAt: null }).select("_id").lean();
        if (user) await ContactMessage.updateOne({ _id: contact._id }, { $set: { customer: user._id } });
      }
      processed++;
    }
    console.log(`Backfilled ${processed} enquiries. Legacy records retained. Existing users were not subscribed to marketing.`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally { await mongoose.disconnect(); }
