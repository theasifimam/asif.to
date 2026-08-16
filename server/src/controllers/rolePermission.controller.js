import RolePermission from "../models/RolePermission.js";
import AuditLog from "../models/AuditLog.js";
import {
  clearPermissionCache,
  DEFAULT_ROLE_PERMISSIONS,
  getRolePermissions,
  normalizePermissions,
  PERMISSION_CATALOG,
} from "../utils/permissions.js";
import { logActivity } from "../services/activity.service.js";

const editableRoles = ["reader", "author", "editor", "admin"];

export const getPermissionMatrix = async (_req, res) => {
  try {
    res.json({
      success: true,
      data: {
        roles: await getRolePermissions(),
        catalog: PERMISSION_CATALOG.map(([key, label, group]) => ({ key, label, group })),
        defaults: DEFAULT_ROLE_PERMISSIONS,
      },
    });
  } catch (error) {
    console.error("[RBAC] Unable to load permissions:", error.message);
    res.status(500).json({ success: false, message: "Unable to load role permissions." });
  }
};

export const updatePermissionMatrix = async (req, res) => {
  try {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({ success: false, message: "Only a super admin can change role permissions." });
    }
    const submitted = req.body?.roles;
    if (!submitted || typeof submitted !== "object") {
      return res.status(400).json({ success: false, message: "A role permission matrix is required." });
    }

    await Promise.all(
      editableRoles.map((role) =>
        RolePermission.findOneAndUpdate(
          { role },
          { permissions: normalizePermissions(submitted[role]), updatedBy: req.user._id },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        ),
      ),
    );
    clearPermissionCache();
    await AuditLog.create({
      actor: req.user._id,
      action: "role_permissions.updated",
      metadata: { roles: editableRoles },
      ip: req.ip,
      userAgent: req.get("user-agent")?.slice(0, 500),
    });
    await logActivity({ actor: req.user, action: "role_permissions.updated", entityType: "role_permission", entityId: req.user._id, entityTitle: "role permission matrix", description: "changed the", severity: "critical", after: { roles: editableRoles }, url: "/users/roles" });
    res.json({ success: true, message: "Role permissions updated.", data: { roles: await getRolePermissions() } });
  } catch (error) {
    console.error("[RBAC] Unable to update permissions:", error.message);
    res.status(500).json({ success: false, message: "Unable to update role permissions." });
  }
};
