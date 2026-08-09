import api from "./axios";

export const AutomationService = {
  // Managed Accounts
  getManagedAccounts: async () => {
    const response = await api.get(`/automation/managed-accounts`);
    return response.data;
  },

  addManagedAccount: async (username, notes) => {
    const response = await api.post(
      `/automation/managed-accounts`,
      { username, notes }
    );
    return response.data;
  },

  removeManagedAccount: async (id) => {
    const response = await api.delete(`/automation/managed-accounts/${id}`);
    return response.data;
  },

  // Scheduled Posts
  getScheduledPosts: async (status = "pending", page = 1, limit = 20) => {
    const response = await api.get(`/automation/scheduled-posts`, {
      params: { status, page, limit }
    });
    return response.data;
  },

  createScheduledPost: async (data) => {
    const response = await api.post(
      `/automation/scheduled-posts`,
      data
    );
    return response.data;
  },

  deleteScheduledPost: async (id) => {
    const response = await api.delete(`/automation/scheduled-posts/${id}`);
    return response.data;
  }
};