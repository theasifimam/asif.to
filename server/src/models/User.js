import { Schema, model, Document, Types } from "mongoose";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      validate: {
        validator: function (v) {
          const reserved = [
            "about",
            "contact",
            "contactus",
            "admin",
            "api",
            "profile",
            "settings",
            "courses",
            "quiz",
            "auth",
            "login",
            "signup",
            "bookmarks",
            "dashboard",
            "support",
            "terms",
            "privacy",
            "revision",
            "exams",
            "home",
          ];
          return !reserved.includes(v.toLowerCase());
        },
        message: "This username is reserved and cannot be used.",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      default: null,
      select: false, // Don't return password by default
    },
    provider: {
      type: String,
      enum: ["credentials", "google", "github"],
      default: "credentials",
    },
    providerAccountId: {
      type: String,
      default: null,
    },
    oauthAccounts: [
      {
        provider: { type: String, enum: ["google", "github"], required: true },
        providerAccountId: { type: String, required: true },
        linkedAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],
    mNumber: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
      default: "https://ui-avatars.com/api/?name=User&background=random",
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    location: {
      type: String,
    },
    role: {
      type: String,
      enum: ["reader", "author", "editor", "admin", "super_admin"],
      default: "reader",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "banned", "pending", "deactivated"],
      default: "active",
    },
    statusReason: { type: String, trim: true, maxlength: 1000 },
    statusChangedAt: Date,
    statusChangedBy: { type: Schema.Types.ObjectId, ref: "User" },
    suspensionExpiresAt: Date,
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isVerified: {
      type: Boolean,
      default: false,
    },
    streak: {
      type: Number,
      default: 0,
    },
    activeCourses: {
      type: Number,
      default: 0,
    },
    masteryLevel: {
      type: Number,
      default: 1,
    },
    completedCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    certificates: [
      {
        courseId: {
          type: Schema.Types.ObjectId,
          ref: "Course",
        },
        issueDate: {
          type: Date,
          default: Date.now,
        },
        certificateUrl: String,
        verificationId: { type: String, trim: true },
        score: Number,
        total: Number,
      },
    ],
    quizAttempts: [
      {
        courseId: { type: Schema.Types.ObjectId, ref: "Course" },
        kind: {
          type: String,
          enum: ["practice", "final_exam"],
          default: "practice",
        },
        score: { type: Number, required: true },
        total: { type: Number, required: true },
        percentage: { type: Number, required: true },
        passed: { type: Boolean, default: false },
        durationSeconds: { type: Number, default: 0 },
        autoSubmitReason: {
          type: String,
          enum: ["manual", "timeout", "cheat"],
          default: "manual",
        },
        visibility: {
          type: String,
          enum: ["private", "public"],
          default: "private",
        },
        certificateId: String,
        questionIds: [
          {
            type: Schema.Types.ObjectId,
            ref: "Question",
          },
        ],
        attemptedAt: { type: Date, default: Date.now },
      },
    ],
    expertise: [
      {
        type: String,
      },
    ],

    socials: {
      twitter: String,
      linkedin: String,
      website: String,
      github: String,
      instagram: String,
    },
    bookmarks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Article",
      },
    ],

    // ─── Unified save system ──────────────────────────────────────────────────
    // Polymorphic saves for courses, chapters, cheatsheets, quiz questions
    savedItems: [
      {
        itemId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        itemType: {
          type: String,
          enum: [
            "course",
            "chapter",
            "cheatsheet",
            "quiz_question",
            "interview_question",
          ],
          required: true,
        },
        savedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    followedTopics: [
      {
        type: Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],

    settings: {
      newsletter: {
        type: Boolean,
        default: true,
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      profileVisibility: {
        type: String,
        enum: ["public", "private"],
        default: "public",
      },
      showLearningActivity: { type: Boolean, default: true },
      showAchievements: { type: Boolean, default: true },
    },
    lastLogin: {
      type: Date,
    },
    lastActiveAt: { type: Date },
    sessionsRevokedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

// Indexes for better search performance
// username and email indexes are automatically created by unique: true
userSchema.index(
  { "oauthAccounts.provider": 1, "oauthAccounts.providerAccountId": 1 },
  { unique: true, sparse: true },
);
userSchema.index({ role: 1, status: 1, createdAt: -1 });
userSchema.index({ status: 1, lastActiveAt: -1 });
userSchema.index({ provider: 1, isVerified: 1 });

export default model("User", userSchema);
