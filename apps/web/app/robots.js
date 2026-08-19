export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://asif.to";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard",
          "/account",
          "/auth/",
          "/forgot-password",
          "/bookmarks",
          "/certificates",
          "/courses/*/final-exam",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard",
          "/account",
          "/auth/",
          "/forgot-password",
          "/bookmarks",
          "/certificates",
          "/courses/*/final-exam",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
