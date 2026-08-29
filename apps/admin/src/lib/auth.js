/**
 * asif Admin Panel - Auth Utilities
 * Frontend-only authentication scaffolding
 *
 * NOTE: This is a placeholder implementation.
 * Replace with actual auth integration when connecting to backend.
 */

// Token storage key
const AUTH_TOKEN_KEY = "asif_admin_token";
const AUTH_USER_KEY = "asif_admin_user";

// Types

/**
 * Check if user is authenticated
 * Checks for valid token in localStorage
 */
export function isAuthenticated() {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return !!token;
}

/**
 * Get the current auth token
 */
export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(AUTH_TOKEN_KEY) ||
    localStorage.getItem("asif_admin_token")
  );
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser() {
  if (typeof window === "undefined") return null;

  const userJson = localStorage.getItem(AUTH_USER_KEY);
  if (!userJson) return null;

  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

/**
 * Get the full auth state
 */
export function getAuthState() {
  return {
    isAuthenticated: isAuthenticated(),
    user: getCurrentUser(),
    token: getAuthToken(),
  };
}

/**
 * Login with credentials
 */
export async function login(credentials) {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    const identifier = credentials.emailOrUsername || credentials.email;
    const response = await fetch(`${API_BASE_URL}/auth/admin/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        emailOrUsername: identifier,
        email: identifier,
        password: credentials.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Login failed",
      };
    }

    // Store in localStorage
    const user = {
      id: data.data.user.id,
      email: data.data.user.email,
      name: data.data.user.fullName,
      role: data.data.user.role, // Ensure backend returns role
      avatar: data.data.user.profilePicture?.url,
      createdAt: data.data.user.createdAt,
    };

    localStorage.setItem(AUTH_TOKEN_KEY, data.data.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

    return {
      success: true,
      user: user,
      token: data.data.token,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "Network error during login",
    };
  }
}

/**
 * Logout the current user
 */
export function logout() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

/**
 * Refresh the auth token
 * NOTE: Placeholder - implement with actual refresh logic
 */
export async function refreshToken() {
  // Placeholder for token refresh logic
  const currentToken = getAuthToken();
  if (!currentToken) return false;

  // In a real implementation, call the refresh endpoint
  // For now, just return true if token exists
  return true;
}

/**
 * Check if user has required role
 */
export function hasRole(requiredRole) {
  const user = getCurrentUser();
  if (!user) return false;

  const roleHierarchy = {
    super_admin: 3,
    admin: 2,
    moderator: 1,
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

/**
 * Get auth headers for API requests
 */
export function getAuthHeaders() {
  const token = getAuthToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
