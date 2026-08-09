/**
 * Mazlis Admin Panel - Constants
 * Design tokens, routes, and configuration constants
 */

// ═══════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════

export const ROUTES = {
  // Auth
  LOGIN: "/signin",

  // Admin
  DASHBOARD: "/dashboard",
  USERS: "/users",
  REPORTS: "/reports",
  CONTENT: "/content",
  TRUST: "/trust",
  SETTINGS: "/settings",
  LOGS: "/logs"
};

export const PAGE_CONFIG = {
  [ROUTES.DASHBOARD]: { title: "Command Center", description: "Real-time system overview and metrics" },
  [ROUTES.USERS]: { title: "User Management", description: "Manage users, roles, and permissions" },
  [ROUTES.REPORTS]: { title: "Report Console", description: "Review and resolve user reports" },
  [ROUTES.CONTENT]: { title: "Content Moderation", description: "Monitor and moderate platform content" },
  [ROUTES.TRUST]: { title: "Trust & Safety", description: "System health and trust scoring metrics" },
  [ROUTES.SETTINGS]: { title: "System Settings", description: "Configure platform preferences" },
  "/verification": { title: "Verification Requests", description: "Review profile verification applications" },
  "/roles": { title: "Role Assignment", description: "Manage staff roles and access levels" },
  "/whitelist": { title: "Whitelist & Early Access", description: "Manage beta access and whitelists" },
  "/feedback": { title: "User Feedback", description: "Review feedback from the community" },
  "/bug-reports": { title: "Bug Reports", description: "Track and manage reported bugs" },
  [ROUTES.LOGS]: { title: "Server Logs", description: "View real-time server application logs" }
};

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════

export const USER_ROLES = {
  USER: "user",
  MODERATOR: "moderator",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin"
};









export const ADMIN_NAV_ITEMS = [
{ label: "Dashboard", href: ROUTES.DASHBOARD, icon: "LayoutDashboard" },
{ label: "Users", href: ROUTES.USERS, icon: "Users", roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN] },
{ label: "Reports", href: ROUTES.REPORTS, icon: "Flag", roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MODERATOR] },
{ label: "Content", href: ROUTES.CONTENT, icon: "FileText", roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MODERATOR] },
{ label: "Trust & Abuse", href: ROUTES.TRUST, icon: "Shield", roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN] },
{ label: "Verification", href: "/verification", icon: "BadgeCheck", roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN] },
{ label: "Whitelist", href: "/whitelist", icon: "ShieldCheck", roles: [USER_ROLES.SUPER_ADMIN] },
{ label: "Feedback", href: "/feedback", icon: "MessageSquare", roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MODERATOR] },
{ label: "Bug Reports", href: "/bug-reports", icon: "Bug", roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN] },
{ label: "Server Logs", href: ROUTES.LOGS, icon: "ScrollText", roles: [USER_ROLES.SUPER_ADMIN] },
{ label: "Settings", href: ROUTES.SETTINGS, icon: "Settings" }];


// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════

export const DESIGN_TOKENS = {
  // Radius scale (Soft Neo-Bento: hyper-rounded)
  radius: {
    sm: "12px",
    md: "16px",
    lg: "20px",
    xl: "24px",
    "2xl": "28px",
    "3xl": "32px",
    "4xl": "40px",
    full: "9999px",
    bento: "24px",
    bentoLg: "32px",
    card: "24px",
    button: "16px",
    input: "14px",
    modal: "32px",
    sheet: "32px"
  },

  // Shadows (soft elevation only)
  shadows: {
    soft: "0 4px 24px -4px oklch(0 0 0 / 0.3)",
    card: "0 8px 32px -8px oklch(0 0 0 / 0.4)",
    elevated: "0 16px 48px -12px oklch(0 0 0 / 0.5)",
    glow: "0 0 40px -10px oklch(0.92 0.24 120 / 0.3)"
  },

  // Colors
  colors: {
    // Neo Volt Lime - Primary accent
    accent: "#E2FF54",
    accentOklch: "oklch(0.92 0.24 120)",

    // Dark mode backgrounds
    background: {
      base: "oklch(0.11 0.005 285)",
      card: "oklch(0.16 0.005 285)",
      elevated: "oklch(0.18 0.006 285)",
      muted: "oklch(0.22 0.005 285)"
    },

    // Foreground
    foreground: {
      base: "oklch(0.97 0 0)",
      muted: "oklch(0.65 0 0)"
    }
  },

  // Typography
  typography: {
    // Headings: Heavy (800–900), Uppercase, Wide letter spacing
    heading: {
      display: {
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.1em"
      },
      title: {
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.05em"
      }
    },
    // Body: Clean, readable, Small-size friendly (14–15px)
    body: {
      fontSize: "14px",
      lineHeight: 1.6
    },
    caption: {
      fontSize: "12px",
      lineHeight: 1.4
    }
  },

  // Transitions
  transitions: {
    smooth: "all 0.3s ease-out",
    fast: "all 0.15s ease-out",
    slow: "all 0.5s ease-out"
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════════════════════

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// ═══════════════════════════════════════════════════════════════════════════
// REPORT TYPES & STATUS
// ═══════════════════════════════════════════════════════════════════════════

export const REPORT_TYPES = {
  USER: "user",
  POST: "post",
  COMMENT: "comment",
  STORY: "story",
  REEL: "reel"
};

export const REPORT_STATUS = {
  PENDING: "pending",
  RESOLVED: "resolved",
  DISMISSED: "dismissed"
};

export const REPORT_REASONS = [
{ value: "spam", label: "Spam" },
{ value: "harassment", label: "Harassment" },
{ value: "hate_speech", label: "Hate Speech" },
{ value: "violence", label: "Violence" },
{ value: "nudity", label: "Nudity" },
{ value: "misinformation", label: "Misinformation" },
{ value: "copyright", label: "Copyright Violation" },
{ value: "other", label: "Other" }];


// ═══════════════════════════════════════════════════════════════════════════
// USER STATUS
// ═══════════════════════════════════════════════════════════════════════════

export const USER_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  DELETED: "deleted"
};



// ═══════════════════════════════════════════════════════════════════════════
// CONTENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const CONTENT_TYPES = {
  POST: "post",
  STORY: "story",
  REEL: "reel",
  COMMENT: "comment"
};

export const CONTENT_STATUS = {
  ACTIVE: "active",
  REMOVED: "removed",
  EXPIRED: "expired"
};

// ═══════════════════════════════════════════════════════════════════════════
// TRUST SCORE THRESHOLDS
// ═══════════════════════════════════════════════════════════════════════════

export const TRUST_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 70,
  MODERATE: 50,
  LOW: 30,
  CRITICAL: 0
};

export function getTrustLevel(score) {
  if (score >= TRUST_THRESHOLDS.EXCELLENT) return "Excellent";
  if (score >= TRUST_THRESHOLDS.GOOD) return "Good";
  if (score >= TRUST_THRESHOLDS.MODERATE) return "Moderate";
  if (score >= TRUST_THRESHOLDS.LOW) return "Low";
  return "Critical";
}

export function getTrustColor(score) {
  if (score >= TRUST_THRESHOLDS.EXCELLENT) return "text-primary";
  if (score >= TRUST_THRESHOLDS.GOOD) return "text-green-400";
  if (score >= TRUST_THRESHOLDS.MODERATE) return "text-yellow-400";
  if (score >= TRUST_THRESHOLDS.LOW) return "text-orange-400";
  return "text-destructive";
}