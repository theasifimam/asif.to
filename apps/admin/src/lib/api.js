/**
 * asif Admin Panel - API Utilities
 * Frontend API client scaffolding
 *
 * NOTE: This is a placeholder implementation.
 * Replace base URL and implement actual endpoints when connecting to backend.
 */

import { getAuthHeaders } from "./auth";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Types

/**
 * Build full API URL
 */
function buildUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

/**
 * Handle API response
 */
async function handleResponse(response) {
  // Handle errors (401, 403, 500, etc.)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Return error details without forcing a logout to prevent unintended data loss in editors
    return {
      success: false,
      error:
        errorData.message || `Request failed with status ${response.status}`,
    };
  }

  // Parse successful response
  try {
    const data = await response.json();
    return { success: true, data };
  } catch {
    return { success: true };
  }
}

/**
 * Generic GET request
 */
export async function apiGet(endpoint) {
  try {
    const response = await fetch(buildUrl(endpoint), {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include", // Ensure cookies are sent
    });
    return handleResponse(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Generic POST request
 */
export async function apiPost(endpoint, body) {
  try {
    const response = await fetch(buildUrl(endpoint), {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
    return handleResponse(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Generic PUT request
 */
export async function apiPut(endpoint, body) {
  try {
    const response = await fetch(buildUrl(endpoint), {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
    return handleResponse(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Generic PATCH request
 */
export async function apiPatch(endpoint, body) {
  try {
    const response = await fetch(buildUrl(endpoint), {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
    return handleResponse(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Generic DELETE request
 */
export async function apiDelete(endpoint) {
  try {
    const response = await fetch(buildUrl(endpoint), {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(),
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
    });
    return handleResponse(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN API ENDPOINTS (Placeholders)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Admin Dashboard Stats
 */
export const dashboardApi = {
  getStats: () => apiGet("/admin/dashboard/stats"),
  getRecentActivity: () => apiGet("/admin/dashboard/activity"),
  getEngagementStats: () => apiGet("/admin/dashboard/engagement"),
  getGrowthStats: () => apiGet("/admin/dashboard/growth"),
  getLogs: () => apiGet("/admin/logs"),
};

/**
 * Users Management
 */
export const usersApi = {
  list: (params) => apiGet(`/admin/users?${new URLSearchParams(params)}`),
  get: (id) => apiGet(`/admin/users/${id}`),
  update: (id, data) => apiPatch(`/admin/users/${id}`, data),
  suspend: (id, reason, duration) =>
    apiPost(`/admin/users/${id}/suspend`, { reason, duration }),
  unsuspend: (id) => apiPost(`/admin/users/${id}/unsuspend`),
  ban: (id, reason) => apiPost(`/admin/users/${id}/ban`, { reason }),
  unban: (id) => apiPost(`/admin/users/${id}/unban`),
  shadowRestrict: (id, enabled) =>
    apiPost(`/admin/users/${id}/shadow-restrict`, { enabled }),
  warn: (id, templateId) => apiPost(`/admin/users/${id}/warn`, { templateId }),
  delete: (id) => apiDelete(`/admin/users/${id}`),
};

/**
 * Reports Management
 */
export const reportsApi = {
  list: (params) => apiGet(`/admin/reports?${new URLSearchParams(params)}`),
  get: (id) => apiGet(`/admin/reports/${id}`),
  resolve: (id, action) => apiPost(`/admin/reports/${id}/resolve`, action),
  dismiss: (id, reason) => apiPost(`/admin/reports/${id}/dismiss`, { reason }),
};

/**
 * Content Management
 */
export const contentApi = {
  posts: {
    list: (params) =>
      apiGet(`/admin/content/posts?${new URLSearchParams(params)}`),
    get: (id) => apiGet(`/admin/content/posts/${id}`),
    remove: (id, reason) =>
      apiDelete(`/admin/content/posts/${id}?reason=${reason}`),
  },
  stories: {
    list: (params) =>
      apiGet(`/admin/content/stories?${new URLSearchParams(params)}`),
    get: (id) => apiGet(`/admin/content/stories/${id}`),
    remove: (id, reason) =>
      apiDelete(`/admin/content/stories/${id}?reason=${reason}`),
  },
  reels: {
    list: (params) =>
      apiGet(`/admin/content/reels?${new URLSearchParams(params)}`),
    get: (id) => apiGet(`/admin/content/reels/${id}`),
    remove: (id, reason) =>
      apiDelete(`/admin/content/reels/${id}?reason=${reason}`),
  },
};

/**
 * Article Management
 */
export const articlesApi = {
  list: (params) => apiGet(`/articles?${new URLSearchParams(params)}`),
  get: (id) => apiGet(`/articles/${id}`),
  create: (formData) => {
    // Special case for multipart/form-data: do not set Content-Type header
    const authHeaders = getAuthHeaders();
    const headers = { ...authHeaders, "ngrok-skip-browser-warning": "true" };
    delete headers["Content-Type"];

    return fetch(buildUrl("/articles"), {
      method: "POST",
      headers: headers,
      body: formData,
      credentials: "include",
    }).then((res) => handleResponse(res));
  },
  update: (id, formData) => {
    // Special case for multipart/form-data: do not set Content-Type header
    const authHeaders = getAuthHeaders();
    const headers = { ...authHeaders, "ngrok-skip-browser-warning": "true" };
    delete headers["Content-Type"];

    return fetch(buildUrl(`/articles/${id}`), {
      method: "PATCH",
      headers: headers,
      body: formData,
      credentials: "include",
    }).then((res) => handleResponse(res));
  },
  publish: (id) => apiPatch(`/articles/${id}/publish`),
  toggleStatus: (id, status) => apiPatch(`/articles/${id}`, { status }),
  delete: (id) => apiDelete(`/articles/${id}`),
};

/** Article taxonomy used by article editors and public search. */
export const articleTopicsApi = {
  list: () => apiGet("/article-topics"),
  create: (data) => apiPost("/article-topics", data),
  update: (id, data) => apiPatch(`/article-topics/${id}`, data),
  delete: (id) => apiDelete(`/article-topics/${id}`),
};

/** SEO course topics. */
export const topicsApi = {
  list: (params = {}) => apiGet(`/topics?${new URLSearchParams(params)}`),
  get: (id) => apiGet(`/topics/${id}`),
  create: (data) => apiPost("/topics", data),
  update: (id, data) => apiPatch(`/topics/${id}`, data),
  setStatus: (id, status) => apiPatch(`/topics/${id}/publish`, { status }),
  reorder: (course, orders) => apiPatch("/topics/reorder", { course, orders }),
  delete: (id) => apiDelete(`/topics/${id}`),
};

/** Reusable canonical interview questions. */
export const interviewQuestionsApi = {
  list: (params = {}) =>
    apiGet(`/interview-questions?${new URLSearchParams(params)}`),
  get: (id) => apiGet(`/interview-questions/${id}`),
  create: (data) => apiPost("/interview-questions", data),
  update: (id, data) => apiPatch(`/interview-questions/${id}`, data),
  delete: (id) => apiDelete(`/interview-questions/${id}`),
};

/** Course and standalone topic categories. */
export const topicCategoriesApi = {
  list: (course) => {
    const params = course
      ? typeof course === "object"
        ? course
        : course !== "all"
        ? { course }
        : {}
      : {};
    return apiGet(`/topic-categories?${new URLSearchParams(params)}`);
  },
  get: (id) => apiGet(`/topic-categories/${id}`),
  create: (data) => apiPost("/topic-categories", data),
  update: (id, data) => apiPatch(`/topic-categories/${id}`, data),
  delete: (id) => apiDelete(`/topic-categories/${id}`),
};

/**
 * Pages Management
 */
export const pagesApi = {
  list: () => apiGet("/pages"),
  get: (slug) => apiGet(`/pages/${slug}`),
  update: (slug, data) => apiPatch(`/pages/${slug}`, data),
};

// (Courses, Chapters, Cheatsheets, Quiz, Flashcards — see Learning Platform section below)

/**
 * Trust & Abuse
 */
export const trustApi = {
  getOverview: () => apiGet("/admin/trust/overview"),
  getUserTrustScore: (userId) => apiGet(`/admin/trust/users/${userId}`),
  getAbusePatterns: () => apiGet("/admin/trust/abuse-patterns"),
  getFlaggedUsers: () => apiGet("/admin/trust/users/flagged"),
};

/**
 * Feedback & Support
 */
export const feedbackApi = {
  list: (params) =>
    apiGet(`/support/admin/feedback?${new URLSearchParams(params)}`),
};

export const bugReportApi = {
  list: (params) =>
    apiGet(`/support/admin/bug-reports?${new URLSearchParams(params)}`),
  update: (id, data) => apiPatch(`/support/admin/bug-reports/${id}`, data),
};

// ═══════════════════════════════════════════════════════════════════════════
// LEARNING PLATFORM API
// ═══════════════════════════════════════════════════════════════════════════

/** Courses */
export const coursesApi = {
  listAll: (params) =>
    apiGet(
      `/courses/admin/all${params ? `?${new URLSearchParams(params)}` : ""}`,
    ),
  getById: (id) => apiGet(`/courses/admin/${id}`),
  list: (params) =>
    apiGet(`/courses?${params ? new URLSearchParams(params) : ""}`),
  getBySlug: (slug) => apiGet(`/courses/${slug}`),
  create: (data) => apiPost("/courses", data),
  update: (id, data) => apiPatch(`/courses/${id}`, data),
  delete: (id) => apiDelete(`/courses/${id}`),
};

/** Chapters */
export const chaptersApi = {
  list: (courseId, params) =>
    apiGet(
      `/courses/${courseId}/chapters${params ? `?${new URLSearchParams(params)}` : ""}`,
    ),
  create: (courseId, data) => apiPost(`/courses/${courseId}/chapters`, data),
  update: (id, data) => apiPatch(`/courses/chapters/${id}`, data),
  delete: (id) => apiDelete(`/courses/chapters/${id}`),
  reorder: (orders) => apiPatch("/courses/chapters/reorder", { orders }),
};

/** Cheatsheets */
export const cheatsheetsApi = {
  list: (params) =>
    apiGet(
      `/cheatsheets?${params ? new URLSearchParams(params) : "status=all"}`,
    ),
  get: (slug) => apiGet(`/cheatsheets/${slug}`),
  create: (data) => apiPost("/cheatsheets", data),
  update: (id, data) => apiPatch(`/cheatsheets/${id}`, data),
  delete: (id) => apiDelete(`/cheatsheets/${id}`),
};

/** Quiz */
export const quizApi = {
  list: (params) =>
    apiGet(`/quiz?${params ? new URLSearchParams(params) : ""}`),
  listAll: (params) =>
    apiGet(`/quiz/admin/all${params ? `?${new URLSearchParams(params)}` : ""}`),
  get: (id) => apiGet(`/quiz/admin/${id}`),
  create: (data) => apiPost("/quiz", data),
  update: (id, data) => apiPatch(`/quiz/${id}`, data),
  delete: (id) => apiDelete(`/quiz/${id}`),
};

/** Shared admin planner / Kanban. */
export const kanbanApi = {
  boards: () => apiGet("/kanban/boards"),
  getBoard: (id) => apiGet(`/kanban/boards/${id}`),
  createBoard: (data) => apiPost("/kanban/boards", data),
  updateBoard: (id, data) => apiPatch(`/kanban/boards/${id}`, data),
  deleteBoard: (id) => apiDelete(`/kanban/boards/${id}`),
  createColumn: (boardId, data) => apiPost(`/kanban/boards/${boardId}/columns`, data),
  updateColumn: (id, data) => apiPatch(`/kanban/columns/${id}`, data),
  archiveColumn: (id) => apiDelete(`/kanban/columns/${id}`),
  reorderColumns: (boardId, items) => apiPatch(`/kanban/boards/${boardId}/columns/reorder`, { items }),
  createLabel: (boardId, data) => apiPost(`/kanban/boards/${boardId}/labels`, data),
  createCard: (boardId, data) => apiPost(`/kanban/boards/${boardId}/cards`, data),
  updateCard: (id, data) => apiPatch(`/kanban/cards/${id}`, data),
  reorderCards: (boardId, items) => apiPatch(`/kanban/boards/${boardId}/cards/reorder`, { items }),
  duplicateCard: (id) => apiPost(`/kanban/cards/${id}/duplicate`),
  deleteCard: (id) => apiDelete(`/kanban/cards/${id}`),
};

export const analyticsApi = {
  overview: (params) => apiGet(`/analytics/overview?${new URLSearchParams(params)}`),
  search: (type, params) => apiGet(`/analytics/search/${type}?${new URLSearchParams(params)}`),
  content: (params) => apiGet(`/analytics/content?${new URLSearchParams(params)}`),
  sources: (params) => apiGet(`/analytics/sources?${new URLSearchParams(params)}`),
  page: (params) => apiGet(`/analytics/page?${new URLSearchParams(params)}`),
  sync: () => apiPost("/analytics/sync"),
  platform: () => apiGet("/analytics/platform"),
  ga4: (params) => apiGet(`/analytics/ga4?${new URLSearchParams(params)}`),
  realtime: () => apiGet("/analytics/ga4/realtime"),
};

export const seoSettingsApi = {
  list: () => apiGet("/seo-settings"),
  save: (data) => apiPut("/seo-settings", data),
};

export const playgroundSettingsApi = {
  get: () => apiGet("/playground-settings"),
  save: (data) => apiPut("/playground-settings", data),
  publish: () => apiPost("/playground-settings/publish"),
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS (Placeholder types for API responses)
// ═══════════════════════════════════════════════════════════════════════════
