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
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

export default model("User", userSchema);
