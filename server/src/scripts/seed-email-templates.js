import "dotenv/config";
import mongoose from "mongoose";
import { EmailTemplate } from "../models/Communication.js";

const TEMPLATES = [
  // --- SUPPORT ---
  {
    name: "General Support Reply",
    category: "Support",
    subject: "Re: Inquiry #{{conversationNumber}} - Support Update from asif.to",
    text: `Hi {{firstName}},

Thank you for reaching out to asif.to support regarding inquiry #{{conversationNumber}}.

We have reviewed your request and provided an update below:

Status: Under Review / In Progress
Inquiry Reference: #{{conversationNumber}}

If you have any further questions or details to add, simply reply directly to this email and our team will get back to you promptly.

Best regards,
Asif Imam & the asif.to Support Team
https://asif.to | support@asif.to`
  },
  {
    name: "Support Request Resolved",
    category: "Support",
    subject: "[Resolved] Ticket #{{conversationNumber}} - asif.to Support",
    text: `Hi {{firstName}},

Your support request #{{conversationNumber}} has been marked as resolved.

Ticket Reference: #{{conversationNumber}}
Status: Resolved

If your issue persists or if you need assistance with anything else, feel free to reply to this email to re-open your ticket.

Thank you for being part of the asif.to community!

Best regards,
Asif Imam & the asif.to Support Team
https://asif.to | support@asif.to`
  },
  {
    name: "Contact Form Auto-Acknowledgment",
    category: "Support",
    subject: "We received your message [Inquiry #{{conversationNumber}}] - asif.to",
    text: `Hi {{firstName}},

Thank you for contacting asif.to. We have received your inquiry #{{conversationNumber}} and queued it for our team.

Inquiry Reference: #{{conversationNumber}}
Email: {{email}}

We typically respond within 24 hours. You can reply directly to this email to attach additional context or information.

Best regards,
asif.to Support System
https://asif.to`
  },

  // --- MARKETING ---
  {
    name: "Weekly Developer Newsletter",
    category: "Marketing",
    subject: "This Week in Tech & Engineering | asif.to Newsletter",
    text: `Hi {{firstName}},

Welcome to this week's edition of the asif.to tech newsletter!

Here is what we've been building, writing, and exploring this week in modern web architecture, cloud systems, and software craftsmanship:

💡 TOP HIGHLIGHTS THIS WEEK

• Modern Frontend Architecture & Next.js Best Practices
• High-performance Database Indexing Strategies
• Deep-dive into Distributed System Patterns

Explore the full articles, tutorials, and discussions on our platform:
https://asif.to

Best regards,
Asif Imam
Founder & Engineer, asif.to`
  },
  {
    name: "Subscription Welcome & Confirmation",
    category: "Marketing",
    subject: "Welcome to the asif.to developer community, {{firstName}}!",
    text: `Hi {{firstName}},

Thank you for subscribing to asif.to! Your subscription has been confirmed for {{email}}.

You are now subscribed to receive curated insights on:
• Full-stack engineering & React / Next.js architecture
• Deep technical guides, code tutorials & DSA breakdowns
• Exclusive developer career opportunities & course updates

⚙️ MANAGE YOUR PREFERENCES
You can customize the topics you hear about or update your preferences at any time using your personal preferences link:
{{unsubscribeUrl}}

Thank you for joining our community!

Best regards,
Asif Imam
Founder, asif.to`
  },
  {
    name: "New Platform Feature Announcement",
    category: "Marketing",
    subject: "New Features & Tools are live on asif.to 🚀",
    text: `Hi {{firstName}},

We're excited to announce major new features and tools now available on asif.to!

✨ WHAT'S NEW

• Enhanced interactive learning paths & coding quizzes
• Streamlined job search & developer opportunity alerts
• Performance upgrades across the platform

Try out the new features today and let us know what you think!

👉 Explore now: https://asif.to

Best regards,
Asif Imam & the asif.to Team`
  },
  {
    name: "Exclusive Community Offer & Course Discount",
    category: "Marketing",
    subject: "Exclusive Community Discount from asif.to 🎯",
    text: `Hi {{firstName}},

As a valued subscriber to {{email}}, we are offering you an exclusive community discount on our premium courses and learning modules on asif.to!

🎁 EXCLUSIVE COMMUNITY OFFER

Get access to our full-stack engineering curriculum and interactive quizzes with special subscriber pricing.

👉 Claim your offer on asif.to: https://asif.to

Best regards,
Asif Imam
Founder, asif.to`
  },
  {
    name: "Re-engagement & Inactive User Outreach",
    category: "Marketing",
    subject: "Catch up on what's new on asif.to, {{firstName}} 👋",
    text: `Hi {{firstName}},

We noticed it's been a while since you visited asif.to. We've published several new guides, tutorials, and career opportunities that we think you'll love!

🔥 WHAT YOU MISSED

• Deep dives into system design & modern web frameworks
• New interactive coding challenges and quizzes
• Featured tech job listings from top engineering teams

👉 Jump back in: https://asif.to

Best regards,
Asif Imam
asif.to`
  },

  // --- ARTICLE ---
  {
    name: "New Article Published Announcement",
    category: "Article",
    subject: "New Article: {{articleTitle}} 📖",
    text: `Hi {{firstName}},

A new technical article has just been published on asif.to!

📰 {{articleTitle}}

Read the full article online to discover practical code examples, architecture breakdowns, and best practices:

👉 Read Article: {{articleUrl}}

Best regards,
Asif Imam
Founder & Engineer, asif.to`
  },

  // --- COURSE ---
  {
    name: "New Course Release Announcement",
    category: "Course",
    subject: "New Course Released: {{courseTitle}} 🎓",
    text: `Hi {{firstName}},

We are thrilled to announce that a brand new course is now live on asif.to!

🎓 {{courseTitle}}

Master real-world concepts with step-by-step lessons, hands-on coding exercises, and practice quizzes.

👉 Start Learning Now: {{courseUrl}}

Best regards,
Asif Imam
asif.to Learning`
  },

  // --- JOBS ---
  {
    name: "Job Alert Announcement",
    category: "Jobs",
    subject: "New Hiring Opportunity: {{jobTitle}} 💼",
    text: `Hi {{firstName}},

A new developer role matching your job alerts has been posted on asif.to!

💼 {{jobTitle}}

Review the position requirements, salary details, and submit your application directly:

👉 View Job & Apply: {{jobUrl}}

Best regards,
asif.to Job Board Team
https://asif.to/jobs`
  },

  // --- AUTHENTICATION ---
  {
    name: "User Registration Welcome",
    category: "Authentication",
    subject: "Welcome to asif.to, {{firstName}}!",
    text: `Hi {{firstName}},

Welcome to asif.to! Your account has been successfully created for {{email}}.

With your asif.to account, you can:
• Track your learning progress across tutorials & courses
• Take interactive coding quizzes and benchmark your skills
• Save technical articles and receive personalized job alerts

🚀 GET STARTED
Explore your dashboard and set up your preferences:

👉 Open asif.to: https://asif.to

Best regards,
Asif Imam & the asif.to Team`
  },
  {
    name: "Email Verification Confirmation",
    category: "Authentication",
    subject: "Your asif.to email address is verified",
    text: `Hi {{firstName}},

Thank you! Your email address ({{email}}) has been successfully verified on asif.to.

Your account is fully active and all features are unlocked.

Best regards,
asif.to Security Team
https://asif.to`
  },

  // --- SYSTEM ---
  {
    name: "Platform System Update",
    category: "System",
    subject: "Important Platform Update - asif.to",
    text: `Hi {{firstName}},

We are sharing an important platform update regarding asif.to services.

📢 PLATFORM UPDATE NOTICE

We have updated our infrastructure and services to improve performance, reliability, and security across the site.

No action is required on your part. If you experience any issues, please feel free to reach out to our support team.

Best regards,
Asif Imam
Founder & Lead Engineer, asif.to
https://asif.to`
  },
  {
    name: "Scheduled Maintenance Notice",
    category: "System",
    subject: "Scheduled Platform Maintenance Notice - asif.to",
    text: `Hi {{firstName}},

We’re making a few improvements behind the scenes.

asif.to will undergo scheduled platform maintenance while our engineering team deploys performance enhancements and database optimizations. During this window, some services may be briefly unavailable.

We’ll work to keep the interruption as short as possible, and no action is required from you. Thank you for your patience while we make asif.to faster and more reliable.

Warm regards,
The asif.to Engineering Team`
  },
  {
    name: "General Guidelines Warning",
    category: "System",
    subject: "Notice regarding your asif.to account activity",
    text: `Hi {{firstName}},

This is a formal notice regarding recent activity on your asif.to account ({{email}}).

⚠️ COMMUNITY GUIDELINES NOTICE

Please review our community guidelines regarding post creation, comments, and interactions. We require all members to maintain professional and constructive communication.

Repeated violations may result in account restriction or suspension.

If you believe this notice was issued in error, please reply to this email to reach our moderation team.

Best regards,
asif.to Moderation Team`
  },
  {
    name: "Harassment Warning",
    category: "System",
    subject: "Important Warning: Account Policy Violation on asif.to",
    text: `Hi {{firstName}},

We are writing to issue a formal warning regarding your recent interactions on asif.to.

⚠️ HARASSMENT POLICY WARNING

Respectful and professional communication is strictly required on asif.to. Harassment, targeted hostility, or abusive behavior toward other community members is not tolerated under any circumstances.

Further infractions will lead to immediate suspension of your account.

Best regards,
asif.to Safety & Moderation Team`
  },
  {
    name: "Spam & Solicitation Warning",
    category: "System",
    subject: "Warning: Unsolicited Promotion / Spam on asif.to",
    text: `Hi {{firstName}},

Your recent content on asif.to was flagged for violating our spam and commercial solicitation policies.

⚠️ SPAM POLICY NOTICE

Please do not use asif.to discussions, comments, or messaging features for unsolicited commercial promotion, repetitive posts, or automated spamming.

Continued non-compliance will result in permanent account suppression.

Best regards,
asif.to Moderation Team`
  },
  {
    name: "Inappropriate Content Warning",
    category: "System",
    subject: "Notice: Inappropriate Content Flagged on asif.to",
    text: `Hi {{firstName}},

Recent content submitted from your account ({{email}}) was flagged as inappropriate and removed from public view.

⚠️ CONTENT REMOVAL NOTICE

Please ensure all content shared on asif.to adheres to our platform safety and content standards.

If you have questions regarding this removal, you can reply directly to this email to contact our moderation team.

Best regards,
asif.to Content Operations`
  },
  {
    name: "Admin Test Email Template",
    category: "System",
    subject: "[TEST] asif.to Email Communications System Test",
    text: `Hi {{firstName}},

This is an automated test email sent from the asif.to Communications Admin Module.

🧪 SYSTEM TEST INFORMATION

Recipient: {{email}}
Status: Email pipeline operational
Stream: TRANSACTIONAL / TEST

If you are receiving this message, your SMTP transport and email delivery queue are functioning properly.

Best regards,
asif.to System Engineering`
  }
];

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing in environment.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas.");

    let inserted = 0;
    let updated = 0;

    for (const item of TEMPLATES) {
      const res = await EmailTemplate.findOneAndUpdate(
        { name: item.name },
        { $set: item },
        { upsert: true, returnDocument: "after" }
      );
      if (res.createdAt.getTime() === res.updatedAt.getTime()) {
        inserted++;
      } else {
        updated++;
      }
    }

    console.log(`Seeding complete: ${inserted} inserted, ${updated} updated, ${TEMPLATES.length} total templates present.`);
  } catch (error) {
    console.error("Failed to seed email templates:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
