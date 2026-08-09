import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
});

// Add a request interceptor to attach the auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token =
        localStorage.getItem('asif_admin_token') ||
        localStorage.getItem('mazlis_admin_token') ||
        localStorage.getItem('token');

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

// Add a response interceptor to handle errors cleanly without forcing browser reloads
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If unauthorized, clean invalid tokens from storage
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('asif_admin_token');
        localStorage.removeItem('mazlis_admin_token');
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;