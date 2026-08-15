import RolePermission from "../models/RolePermission.js";

export const PERMISSION_CATALOG = Object.freeze([
  ["content.read", "Read public content", "Content"],
  ["articles.create", "Create articles", "Articles"],
  ["articles.edit_own", "Edit own articles", "Articles"],
  ["articles.edit_all", "Edit all articles", "Articles"],
  ["articles.publish", "Publish articles", "Articles"],
  ["articles.delete", "Delete articles", "Articles"],
  ["topics.view", "View topics", "Editorial resources"],
  ["topics.manage", "Manage topics", "Editorial resources"],
  ["interview_questions.view", "View interview questions", "Editorial resources"],
  ["interview_questions.manage", "Manage interview questions", "Editorial resources"],
  ["courses.view", "View courses and chapters", "Editorial resources"],
  ["courses.manage", "Manage courses and chapters", "Editorial resources"],
  ["cheatsheets.view", "View cheatsheets", "Editorial resources"],
  ["cheatsheets.manage", "Manage cheatsheets", "Editorial resources"],
  ["question_bank.view", "View question bank", "Editorial resources"],
  ["question_bank.manage", "Manage question bank", "Editorial resources"],
  ["planner.view", "View planner", "Planning"],
  ["planner.manage", "Manage planner", "Planning"],
  ["analytics.view", "View analytics", "Administration"],
  ["seo.view", "View and manage SEO", "Administration"],
  ["users.view", "View users", "User management"],
  ["users.create", "Create users", "User management"],
  ["users.edit", "Edit users", "User management"],
  ["users.suspend", "Moderate users", "User management"],
  ["users.delete", "Delete users", "User management"],
  ["authors.manage", "Manage authors", "User management"],
  ["invitations.manage", "Manage invitations", "User management"],
  ["roles.manage", "Manage roles and permissions", "System"],
  ["settings.manage", "Manage system settings", "System"],
  ["playground.manage", "Manage interactive code playground", "System"],
]);

export const DEFAULT_ROLE_PERMISSIONS = Object.freeze({
  reader: ["content.read"],
  author: [
    "content.read", "articles.create", "articles.edit_own", "analytics.view",
    "topics.view", "interview_questions.view", "courses.view",
    "cheatsheets.view", "question_bank.view",
  ],
  editor: [
    "content.read", "articles.create", "articles.edit_own", "articles.edit_all",
    "articles.publish", "topics.view", "topics.manage",
    "interview_questions.view", "interview_questions.manage", "courses.view",
    "courses.manage", "cheatsheets.view", "cheatsheets.manage",
    "question_bank.view", "question_bank.manage", "planner.view",
    "planner.manage", "analytics.view", "seo.view", "users.view",
  ],
  admin: PERMISSION_CATALOG.map(([key]) => key).filter(
    (key) => key !== "roles.manage" && key !== "settings.manage",
  ),
  super_admin: ["*"],
});

export const ROLE_PERMISSIONS = DEFAULT_ROLE_PERMISSIONS;
const catalogKeys = new Set(PERMISSION_CATALOG.map(([key]) => key));
let permissionCache = { expiresAt: 0, values: null };

export const normalizePermissions = (permissions = []) =>
  [...new Set(permissions)].filter((permission) => catalogKeys.has(permission));

export const clearPermissionCache = () => {
  permissionCache = { expiresAt: 0, values: null };
};

export const getRolePermissions = async () => {
  if (permissionCache.values && permissionCache.expiresAt > Date.now()) {
    return permissionCache.values;
  }
  const records = await RolePermission.find({}).lean();
  const values = Object.fromEntries(
    Object.entries(DEFAULT_ROLE_PERMISSIONS).map(([role, permissions]) => [
      role,
      [...permissions],
    ]),
  );
  for (const record of records) {
    if (record.role !== "super_admin" && values[record.role]) {
      values[record.role] = normalizePermissions(record.permissions);
    }
  }
  values.super_admin = ["*"];
  permissionCache = { values, expiresAt: Date.now() + 30_000 };
  return values;
};

export const getPermissionsForRole = async (role) =>
  (await getRolePermissions())[role] || [];

export const hasPermission = (user, permission) => {
  const permissions = user?.effectivePermissions || DEFAULT_ROLE_PERMISSIONS[user?.role] || [];
  return permissions.includes("*") || permissions.includes(permission);
};

export const requirePermission = (permission) => (req, res, next) => {
  if (!hasPermission(req.user, permission)) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to perform this action.",
    });
  }
  next();
};

export const requireAnyPermission = (...required) => (req, res, next) => {
  if (!required.some((permission) => hasPermission(req.user, permission))) {
    return res.status(403).json({ success: false, message: "You do not have permission to perform this action." });
  }
  next();
};

export const roleRank = Object.freeze({ reader: 0, author: 1, editor: 2, admin: 3, super_admin: 4 });
