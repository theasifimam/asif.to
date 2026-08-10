import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const axiosBaseQuery =
  ({ base } = {}) =>
  async ({ url, method = "GET", data, params }) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("asif_token")
          : null;

      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      if (!(data instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }

      const result = await axios({
        url: (base ?? baseURL) + url,
        method,
        data,
        params,
        withCredentials: true,
        headers,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
