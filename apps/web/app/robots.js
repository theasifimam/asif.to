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
          "/forgot-password",
          "/bookmarks",
          "/certificates",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/forgot-password",
          "/bookmarks",
          "/certificates",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
