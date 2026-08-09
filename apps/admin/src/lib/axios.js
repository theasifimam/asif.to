import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('mazlis_admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
    error.response?.status === 401 &&
    !originalRequest._retry &&
    !originalRequest.url?.includes('signin') &&
    !originalRequest.url?.includes('refresh'))
    {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint
        await api.post('/auth/refresh');

        // After successful refresh, the new access token is set in cookies
        // We just need to retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        if (typeof window !== 'undefined' && window.location.pathname !== '/signin') {
          window.location.href = '/signin';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;