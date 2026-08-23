export const revalidate = 3600; // revalidate every hour

const STATIC_ROUTES = [
  {
    path: "/practice",
    priority: 0.9,
    changeFrequency: "weekly",
  },
  {
    path: "/run",
    priority: 0.9,
    changeFrequency: "weekly",
  },
  {
    path: "",
    priority: 1.0,
    changeFrequency: "daily",
  },
  {
    path: "/cheatsheets",
    priority: 0.9,
    changeFrequency: "daily",
  },
  {
    path: "/interview-questions",
    priority: 0.9,
    changeFrequency: "daily",
  },
  {
    path: "/quiz",
    priority: 0.8,
    changeFrequency: "daily",
  },
  {
    path: "/revision",
    priority: 0.8,
    changeFrequency: "weekly",
  },
  {
    path: "/about",
    priority: 0.5,
    changeFrequency: "monthly",
  },
  {
    path: "/contact",
    priority: 0.5,
    changeFrequency: "monthly",
  },
  {
    path: "/faq",
    priority: 0.7,
    changeFrequency: "weekly",
  },
  {
    path: "/author/asif",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "/terms",
    priority: 0.3,
    changeFrequency: "monthly",
  },
  {
    path: "/privacy",
    priority: 0.3,
    changeFrequency: "monthly",
  },
  {
    path: "/legal/cookies",
    priority: 0.3,
    changeFrequency: "monthly",
  },
  {
    path: "/legal/disclaimer",
    priority: 0.3,
    changeFrequency: "monthly",
  },
];

async function fetchApi(endpoint) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const res = await fetch(`${apiUrl}${endpoint}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.data || json?.data || null;
  } catch (error) {
    console.error(`Sitemap error fetching ${endpoint}:`, error);
    return null;
  }
}

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://asif.to";

  // 1. Static Pages
  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // 2. Fetch search index from backend (covers all dynamic content: courses, chapters, topics, articles, cheatsheets, questions)
  const searchIndex = await fetchApi("/search/index");

  const dynamicEntries = [];
  const existingUrls = new Set();

  const searchableItems = Array.isArray(searchIndex?.items) ? searchIndex.items : [];

  for (const item of searchableItems) {
    if (!item.url) continue;

    let urlPath = item.url;
    let changeFrequency = "weekly";
    let priority = 0.7;

    // Handle chapter routing redirects: canonical URL is /:courseSlug/:chapterSlug, not /courses/:courseSlug/:chapterSlug
    if (item.type === "chapter" && urlPath.startsWith("/courses/")) {
      urlPath = urlPath.replace("/courses/", "/");
      priority = 0.8;
      changeFrequency = "weekly";
    } else if (item.type === "course") {
      priority = 0.9;
      changeFrequency = "daily";
    } else if (item.type === "cheatsheet") {
      priority = 0.8;
      changeFrequency = "weekly";
    } else if (item.type === "article") {
      priority = 0.7;
      changeFrequency = "monthly";
    } else if (item.type === "topic") {
      priority = 0.8;
      changeFrequency = "weekly";
    } else if (item.type === "question") {
      priority = 0.7;
      changeFrequency = "weekly";
    } else if (item.type === "interview-category") {
      priority = 0.8;
      changeFrequency = "weekly";
    }

    const url = `${siteUrl}${urlPath}`;
    if (!existingUrls.has(url)) {
      existingUrls.add(url);
      dynamicEntries.push({
        url,
        ...(item.updatedAt
          ? { lastModified: new Date(item.updatedAt) }
          : {}),
        changeFrequency,
        priority,
      });
    }
  }

  // Explicitly fetch all published interview categories with questions
  const interviewCategories = await fetchApi("/topic-categories/public");
  if (Array.isArray(interviewCategories)) {
    for (const cat of interviewCategories) {
      if (!cat.slug || cat.noindex) continue;
      const catUrl = cat.course?.slug
        ? `${siteUrl}/${cat.course.slug}/interview-questions/${cat.slug}`
        : `${siteUrl}/interview-questions/${cat.slug}`;
      if (!existingUrls.has(catUrl)) {
        existingUrls.add(catUrl);
        dynamicEntries.push({
          url: catUrl,
          ...(cat.updatedAt
            ? { lastModified: new Date(cat.updatedAt) }
            : {}),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  }

  // Public library entries only. Private and unlisted knowledge is never requested here.
  const publicLibrary = await fetchApi("/library/public-index");
  if (Array.isArray(publicLibrary)) {
    for (const entry of publicLibrary) {
      if (!entry.username || !entry.slug) continue;
      const url = `${siteUrl}/library/${entry.username}/${entry.slug}`;
      if (!existingUrls.has(url)) {
        existingUrls.add(url);
        dynamicEntries.push({
          url,
          ...(entry.updatedAt
            ? { lastModified: new Date(entry.updatedAt) }
            : {}),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  }

  const { TECHNOLOGIES } = await import("@/lib/playground/config");
  const { PRACTICE_PROBLEMS } = await import("@/lib/playground/problems");
  const practiceEntries = [
    ...Object.keys(TECHNOLOGIES).map((technology) => ({
      url: `${siteUrl}/practice/${technology}`,
      changeFrequency: "weekly",
      priority: 0.8,
    })),
    ...PRACTICE_PROBLEMS.map(({ technology, slug }) => ({
      url: `${siteUrl}/practice/${technology}/${slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];

  return [...staticEntries, ...practiceEntries, ...dynamicEntries];
}
