export const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
export const API_BASE_URL = API_URL ? API_URL.split('/api/v1')[0].replace(/\/$/, '') : "";
export const STORAGE_URL = (process.env.NEXT_PUBLIC_STORAGE_URL || "").replace(/\/$/, '') || API_BASE_URL;

export const getImageUrl = (path) => {
  if (!path) return "https://images.unsplash.com/photo-1504711432869-efd597cdd042?q=80&w=2070&auto=format&fit=crop";
  if (typeof path !== "string") return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;

  let cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (!cleanPath.startsWith("/uploads/")) {
    if (cleanPath.startsWith("/article-")) {
      cleanPath = `/uploads/articles${cleanPath}`;
    } else if (cleanPath.startsWith("/avatar-")) {
      cleanPath = `/uploads/avatars${cleanPath}`;
    } else if (!cleanPath.startsWith("/images/") && !cleanPath.startsWith("/assets/") && !cleanPath.startsWith("/icons/")) {
      cleanPath = `/uploads${cleanPath}`;
    }
  }

  if (STORAGE_URL) {
    return `${STORAGE_URL}${cleanPath}`;
  }
  return cleanPath;
};