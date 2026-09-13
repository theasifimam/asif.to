import { EmailAutomation, AutomationRun } from "../../models/Communication.js";
import User from "../../models/User.js";
import Article from "../../models/Article.js";
import Course from "../../models/Course.js";
import Job from "../../models/Job.js";

// Scan committed records in bounded batches. Publishing/account operations never
// depend on SMTP, and a restart resumes the persisted cursor.
export async function scanAutomationTriggers() {
  const rules = await EmailAutomation.find({ enabled: true, trigger: { $in: ["USER_REGISTERED", "EMAIL_VERIFIED", "INACTIVE_USER", "ARTICLE_PUBLISHED", "COURSE_PUBLISHED", "JOB_PUBLISHED"] } });
  for (const rule of rules) {
    const type = { ARTICLE_PUBLISHED: "article", COURSE_PUBLISHED: "course", JOB_PUBLISHED: "job" }[rule.trigger];
    const Model = { article: Article, course: Course, job: Job }[type] || User;
    const inactive = rule.trigger === "INACTIVE_USER";
    const field = inactive || rule.trigger === "USER_REGISTERED" ? "createdAt" : "updatedAt";
    const start = inactive ? new Date(0) : rule.createdAt;
    const query = { ...(type ? { status: "published" } : { status: "active", deletedAt: null }),
      ...(rule.trigger === "EMAIL_VERIFIED" ? { isVerified: true } : {}),
      ...(inactive ? { lastActiveAt: { $lt: new Date(Date.now() - 30 * 86400000) } } : {}),
      $or: [{ [field]: { $gt: rule.scanAt || start } }, { [field]: rule.scanAt || start, _id: { $gt: rule.scanId || "000000000000000000000000" } }] };
    const records = await Model.find(query).sort({ [field]: 1, _id: 1 }).limit(30);
    for (const record of records) {
      const origin = (process.env.WEB_URL || "https://asif.to").replace(/\/$/, "");
      const url = type ? `${origin}/${type === "article" ? "articles" : `${type}s`}/${record.slug}` : null;
      const context = type ? { publication: true, type, contentId: record._id, variables: { [`${type}Title`]: record.title, [`${type}Url`]: url } }
        : { userId: record._id, email: record.email, firstName: record.fullName?.split(" ")[0] || "" };
      // Each rule runs once per source record, including across republishing/restarts.
      await AutomationRun.updateOne({ key: `${rule._id}:${rule.trigger}:${record._id}` }, { $setOnInsert: { automation: rule._id, context, actions: rule.actions } }, { upsert: true });
    }
    if (records.length) await EmailAutomation.updateOne({ _id: rule._id }, { $set: { scanAt: records.at(-1)[field], scanId: records.at(-1)._id } });
    // A daily sweep finds users who become inactive after an earlier pass.
    if (inactive && records.length < 30 && (!rule.lastSweepAt || rule.lastSweepAt < new Date(Date.now() - 86400000))) {
      await EmailAutomation.updateOne({ _id: rule._id }, { $set: { scanAt: new Date(0), scanId: null, lastSweepAt: new Date() } });
    }
  }
}
