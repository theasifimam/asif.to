import User from "../models/User.js";
import bcrypt from "bcrypt";

import Article from "../models/Article.js";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import Cheatsheet from "../models/Cheatsheet.js";
import QuizQuestion from "../models/QuizQuestion.js";

// ─── Admin: List all users ──────────────────────────────────────────────────
// GET /api/v1/users?page=1&limit=10&search=&role=&status=
export const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const { search, role, status } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) filter.role = role;
    if (status) filter.status = status;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("[USERS] GetUsers error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Public: Get author profile ───────────────────────────────────────────
// GET /api/v1/users/public/:username
export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select(
      "-password -role -status -isVerified -lastLogin -updatedAt -__v",
    );
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error("[USERS] GetPublicProfile error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Admin: Get single user ─────────────────────────────────────────────────
// GET /api/v1/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error("[USERS] GetUserById error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Admin: Create a new user (provision access) ────────────────────────────
// POST /api/v1/users
export const createUser = async (req, res) => {
  try {
    const { fullName, username, email, password, role, status } = req.body;

    if (!fullName || !username || !email || !password) {
      res
        .status(400)
        .json({
          success: false,
          message: "fullName, username, email and password are required.",
        });
      return;
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? "email" : "username";
      res
        .status(409)
        .json({
          success: false,
          message: `A user with that ${field} already exists.`,
        });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName,
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || "reader",
      status: status || "active",
    });

    const { password: _, ...userData } = user.toObject();

    res
      .status(201)
      .json({
        success: true,
        message: "User created successfully.",
        data: { user: userData },
      });
  } catch (error) {
    console.error("[USERS] CreateUser error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      res
        .status(409)
        .json({
          success: false,
          message: `A user with that ${field} already exists.`,
        });
      return;
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Admin: Update user ─────────────────────────────────────────────────────
// PATCH /api/v1/users/:id
export const updateUser = async (req, res) => {
  try {
    // Protect sensitive fields from direct update via this route
    const { password, socials, expertise, settings, ...safeFields } = req.body;

    const updateData = { ...safeFields };

    // Handle avatar upload if exists
    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    // Handle JSON parsing for multipart form fields if necessary
    if (socials)
      updateData.socials =
        typeof socials === "string" ? JSON.parse(socials) : socials;
    if (expertise)
      updateData.expertise =
        typeof expertise === "string" ? JSON.parse(expertise) : expertise;
    if (settings)
      updateData.settings =
        typeof settings === "string" ? JSON.parse(settings) : settings;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "User updated.", data: { user } });
  } catch (error) {
    console.error("[USERS] UpdateUser error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Admin: Update user's role ──────────────────────────────────────────────
// PATCH /api/v1/users/:id/role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["reader", "author", "editor", "admin"];

    if (!role || !allowedRoles.includes(role)) {
      res
        .status(400)
        .json({
          success: false,
          message: `Role must be one of: ${allowedRoles.join(", ")}`,
        });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res
      .status(200)
      .json({
        success: true,
        message: `Role updated to '${role}'.`,
        data: { user },
      });
  } catch (error) {
    console.error("[USERS] UpdateUserRole error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Admin: Suspend / unsuspend user ───────────────────────────────────────
// PATCH /api/v1/users/:id/status
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["active", "suspended", "pending"];

    if (!status || !allowedStatuses.includes(status)) {
      res
        .status(400)
        .json({
          success: false,
          message: `Status must be one of: ${allowedStatuses.join(", ")}`,
        });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    ).select("-password");

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res
      .status(200)
      .json({
        success: true,
        message: `Status updated to '${status}'.`,
        data: { user },
      });
  } catch (error) {
    console.error("[USERS] UpdateUserStatus error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Admin: Reset a user's password ────────────────────────────────────────
// PATCH /api/v1/users/:id/reset-password
export const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      res
        .status(400)
        .json({
          success: false,
          message: "New password must be at least 8 characters.",
        });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { new: true },
    ).select("-password");

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    console.error("[USERS] ResetPassword error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Admin: Delete user ─────────────────────────────────────────────────────
// DELETE /api/v1/users/:id
export const deleteUser = async (req, res) => {
  try {
    // Prevent self-deletion
    if (String(req.user?._id) === req.params.id) {
      res
        .status(400)
        .json({
          success: false,
          message: "You cannot delete your own account.",
        });
      return;
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "User permanently deleted." });
  } catch (error) {
    console.error("[USERS] DeleteUser error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Self: Get own profile (web/mobile users) ───────────────────────────────
// GET /api/v1/users/me/profile
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate({
        path: "bookmarks",
        populate: { path: "author topic" },
      });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error("[USERS] GetMyProfile error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Self: Update own profile ───────────────────────────────────────────────
// PATCH /api/v1/users/me/update
export const updateMyProfile = async (req, res) => {
  try {
    const { fullName, bio, location, avatar, socials, settings, mNumber } =
      req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          ...(fullName && { fullName }),
          ...(bio !== undefined && { bio }),
          ...(location !== undefined && { location }),
          ...(req.file && { avatar: `/uploads/avatars/${req.file.filename}` }),
          ...(socials && {
            socials:
              typeof socials === "string" ? JSON.parse(socials) : socials,
          }),
          ...(settings && {
            settings:
              typeof settings === "string" ? JSON.parse(settings) : settings,
          }),
          ...(mNumber !== undefined && { mNumber }),
        },
      },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Profile updated.",
        data: { user: updatedUser },
      });
  } catch (error) {
    console.error("[USERS] UpdateMyProfile error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Self: Toggle bookmark ────────────────────────────────────────────────
// POST /api/v1/users/me/bookmarks/toggle/:articleId
export const toggleBookmark = async (req, res) => {
  try {
    const { articleId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const article = await Article.findById(articleId);
    if (!article) {
      res.status(404).json({ success: false, message: "Article not found." });
      return;
    }

    const isBookmarked = user.bookmarks.some(
      (id) => id.toString() === articleId,
    );

    if (isBookmarked) {
      // Remove from bookmarks
      user.bookmarks = user.bookmarks.filter(
        (id) => id.toString() !== articleId,
      );
      await user.save();
      res
        .status(200)
        .json({
          success: true,
          message: "Article removed from bookmarks.",
          data: { isBookmarked: false },
        });
    } else {
      // Add to bookmarks
      user.bookmarks.push(articleId);
      await user.save();
      res
        .status(200)
        .json({
          success: true,
          message: "Article added to bookmarks.",
          data: { isBookmarked: true },
        });
    }
  } catch (error) {
    console.error("[USERS] ToggleBookmark error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Self: Get own bookmarks ─────────────────────────────────────────────────
// GET /api/v1/users/me/bookmarks
export const getMyBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "bookmarks",
      populate: { path: "author topic" },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.status(200).json({
      success: true,
      data: { bookmarks: user.bookmarks },
    });
  } catch (error) {
    console.error("[USERS] GetMyBookmarks error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Self: Toggle saved item (course/chapter/cheatsheet/quiz_question) ──────
// POST /api/v1/users/me/saves/toggle
// body: { itemId, itemType }
export const toggleSavedItem = async (req, res) => {
  try {
    const { itemId, itemType } = req.body;
    const VALID_TYPES = ["course", "chapter", "cheatsheet", "quiz_question"];

    if (!itemId || !itemType || !VALID_TYPES.includes(itemType)) {
      res
        .status(400)
        .json({
          success: false,
          message: "itemId and valid itemType are required.",
        });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const existingIndex = user.savedItems.findIndex(
      (s) =>
        s.itemId.toString() === itemId.toString() && s.itemType === itemType,
    );

    let isSaved;
    if (existingIndex >= 0) {
      user.savedItems.splice(existingIndex, 1);
      isSaved = false;
    } else {
      user.savedItems.push({ itemId, itemType });
      isSaved = true;
    }

    await user.save({ validateBeforeSave: false });
    res
      .status(200)
      .json({ success: true, data: { isSaved, itemId, itemType } });
  } catch (error) {
    console.error("[USERS] ToggleSavedItem error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Self: Get all saved items, populated by type ───────────────────────────
// GET /api/v1/users/me/saves
export const getMySavedItems = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const savedItems = user.savedItems || [];

    // Group by type for targeted DB queries
    const byType = {
      course: [],
      chapter: [],
      cheatsheet: [],
      quiz_question: [],
    };
    savedItems.forEach((s) => {
      if (byType[s.itemType]) byType[s.itemType].push(s.itemId);
    });

    const [courses, chapters, cheatsheets, quizQuestions] = await Promise.all([
      byType.course.length
        ? Course.find({ _id: { $in: byType.course } })
            .select("title slug techId thumbnail")
            .lean()
        : [],
      byType.chapter.length
        ? Chapter.find({ _id: { $in: byType.chapter } })
            .select("title slug summary course")
            .populate("course", "title slug")
            .lean()
        : [],
      byType.cheatsheet.length
        ? Cheatsheet.find({ _id: { $in: byType.cheatsheet } })
            .select("title slug techId")
            .lean()
        : [],
      byType.quiz_question.length
        ? QuizQuestion.find({ _id: { $in: byType.quiz_question } })
            .select("question options correctIndex")
            .lean()
        : [],
    ]);

    // Merge back with savedAt timestamps
    const populatedItems = savedItems
      .map((s) => {
        let item = null;
        if (s.itemType === "course")
          item = courses.find((c) => c._id.toString() === s.itemId.toString());
        else if (s.itemType === "chapter")
          item = chapters.find((c) => c._id.toString() === s.itemId.toString());
        else if (s.itemType === "cheatsheet")
          item = cheatsheets.find(
            (c) => c._id.toString() === s.itemId.toString(),
          );
        else if (s.itemType === "quiz_question")
          item = quizQuestions.find(
            (q) => q._id.toString() === s.itemId.toString(),
          );
        return { itemType: s.itemType, savedAt: s.savedAt, ...item };
      })
      .filter((s) => s._id); // filter out items that may have been deleted

    res
      .status(200)
      .json({ success: true, data: { savedItems: populatedItems } });
  } catch (error) {
    console.error("[USERS] GetMySavedItems error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
