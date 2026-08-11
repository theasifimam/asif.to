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
            "about", "contact", "contactus", "admin", "api", "profile",
            "settings", "courses", "quiz", "auth", "login", "signup",
            "bookmarks", "dashboard", "support", "terms", "privacy",
            "revision", "exams", "home"
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
      required: true,
      select: false, // Don't return password by default
    },
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
      enum: ["reader", "author", "editor", "admin"],
      default: "reader",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "active",
    },
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
          enum: ["course", "chapter", "cheatsheet", "quiz_question"],
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
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better search performance
// username and email indexes are automatically created by unique: true

export default model("User", userSchema);
