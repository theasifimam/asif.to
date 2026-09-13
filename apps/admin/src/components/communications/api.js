import api from "@/lib/axios";
export async function communicationApi(path, options = {}) {
  const response = await api({ url: `/communications${path}`, method: options.method || "GET", data: options.body, signal: options.signal,
    ...(options.body instanceof FormData ? { headers: { "Content-Type": undefined } } : {}) });
  return response.data.data;
}
export const errorMessage = error => error.response?.data?.message || error.message || "Unable to complete this action.";
