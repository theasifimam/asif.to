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
  const now = new Date();

  // 1. Static Pages
  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // 2. Fetch dynamic content in parallel
  const [coursesData, cheatsheetsData, articlesData, searchIndex] = await Promise.all([
    fetchApi("/courses?status=published"),
    fetchApi("/cheatsheets"),
    fetchApi("/articles?status=published&limit=100"),
    fetchApi("/search/index"),
  ]);

  const dynamicEntries = [];

  // 3. Courses & Chapter Routes
  if (Array.isArray(coursesData)) {
    const listedCourseUrls = new Set();
    for (const course of coursesData) {
      const courseSlug = course?.slug;
      if (!courseSlug) continue;

      const courseUrl = `${siteUrl}/courses/${encodeURIComponent(courseSlug)}`;
      if (listedCourseUrls.has(courseUrl)) continue;
      listedCourseUrls.add(courseUrl);

      const courseUpdated = course.updatedAt ? new Date(course.updatedAt) : now;

      // Course overview page
      dynamicEntries.push({
        url: courseUrl,
        lastModified: courseUpdated,
        changeFrequency: "daily",
        priority: 0.9,
      });

      // Course interview questions page
      dynamicEntries.push({
        url: `${siteUrl}/${courseSlug}/interview-questions`,
        lastModified: courseUpdated,
        changeFrequency: "weekly",
        priority: 0.8,
      });

      // Individual chapter reader pages
      if (Array.isArray(course.chapters)) {
        for (const chapter of course.chapters) {
          const chapterSlug = chapter?.slug;
          if (!chapterSlug) continue;

          dynamicEntries.push({
            url: `${siteUrl}/${courseSlug}/${chapterSlug}`,
            lastModified: chapter.updatedAt ? new Date(chapter.updatedAt) : courseUpdated,
            changeFrequency: "weekly",
            priority: 0.8,
          });
        }
      }
    }
  }

  // 4. Cheatsheet Routes
  if (Array.isArray(cheatsheetsData)) {
    for (const cs of cheatsheetsData) {
      const slug = cs?.slug;
      if (!slug) continue;

      dynamicEntries.push({
        url: `${siteUrl}/cheatsheets/${slug}`,
        lastModified: cs.updatedAt ? new Date(cs.updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  // 5. Published Article Routes
  if (Array.isArray(articlesData)) {
    for (const article of articlesData) {
      const slug = article?.slug;
      if (!slug) continue;

      dynamicEntries.push({
        url: `${siteUrl}/articles/${slug}`,
        lastModified: article.updatedAt ? new Date(article.updatedAt) : now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  // Topics and individual interview questions use canonical course-scoped routes.
  const searchableItems = Array.isArray(searchIndex?.items) ? searchIndex.items : [];
  const existingUrls = new Set(dynamicEntries.map((entry) => entry.url));
  for (const item of searchableItems) {
    if (!["topic", "question"].includes(item.type) || !item.url) continue;
    const url = `${siteUrl}${item.url}`;
    if (existingUrls.has(url)) continue;
    existingUrls.add(url);
    dynamicEntries.push({ url, lastModified: now, changeFrequency: "weekly", priority: item.type === "topic" ? 0.8 : 0.7 });
  }

  const { TECHNOLOGIES } = await import("@/lib/playground/config");
  const { PRACTICE_PROBLEMS } = await import("@/lib/playground/problems");
  const practiceEntries = [
    ...Object.keys(TECHNOLOGIES).map((technology) => ({
      url: `${siteUrl}/practice/${technology}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    })),
    ...PRACTICE_PROBLEMS.map(({ technology, slug }) => ({
      url: `${siteUrl}/practice/${technology}/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];

  return [...staticEntries, ...practiceEntries, ...dynamicEntries];
}
