import { cache } from "react";

const API_REVALIDATE_SECONDS = 60;

async function fetchPublicData(path, errorLabel) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return null;

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      next: { revalidate: API_REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;

    const body = await response.json();
    return body.data || null;
  } catch (error) {
    console.error(`Error fetching ${errorLabel}:`, error);
    return null;
  }
}

export const getCourse = cache((courseSlug) =>
  fetchPublicData(`/courses/slug/${encodeURIComponent(courseSlug)}`, "course"),
);

const getPublicTopicByPath = cache((path) =>
  fetchPublicData(`/topics/public/${path}`, "public topic"),
);

export function getPublicTopic(courseSlug, topicPath) {
  if (!Array.isArray(topicPath) || !topicPath.length) return null;

  const path = [courseSlug, ...topicPath].map(encodeURIComponent).join("/");
  return getPublicTopicByPath(path);
}

export const getChapterData = cache((courseSlug, chapterSlug) =>
  fetchPublicData(
    `/courses/slug/${encodeURIComponent(courseSlug)}/chapters/${encodeURIComponent(chapterSlug)}`,
    "chapter",
  ),
);

const getPublicInterviewQuestionsCached = cache((courseSlug, page = 1) =>
  fetchPublicData(
    `/interview-questions/public/${encodeURIComponent(courseSlug)}?page=${encodeURIComponent(page)}&limit=15`,
    "interview questions",
  ),
);

const getPublicInterviewQuestionCached = cache((courseSlug, questionSlug) =>
  fetchPublicData(
    `/interview-questions/public/${encodeURIComponent(courseSlug)}/${encodeURIComponent(questionSlug)}`,
    "interview question",
  ),
);

export async function getPublicInterviewQuestions(courseSlug, page) {
  return getPublicInterviewQuestionsCached(courseSlug, page);
}

export async function getPublicInterviewQuestion(courseSlug, questionSlug) {
  return getPublicInterviewQuestionCached(courseSlug, questionSlug);
}

export const getPublicInterviewCategories = cache((courseSlug) => {
  const query = courseSlug ? `?course=${encodeURIComponent(courseSlug)}` : "";
  return fetchPublicData(`/topic-categories/public${query}`, "interview categories");
});

export const getPublicInterviewCategory = cache(
  (courseSlugOrCategorySlug, categorySlugOrPage, requestedPage = 1) => {
    let courseSlug = null;
    let categorySlug = courseSlugOrCategorySlug;
    let page = requestedPage;

    if (
      categorySlugOrPage &&
      typeof categorySlugOrPage === "string" &&
      isNaN(Number(categorySlugOrPage))
    ) {
      courseSlug = courseSlugOrCategorySlug;
      categorySlug = categorySlugOrPage;
    } else if (categorySlugOrPage) {
      page = Number(categorySlugOrPage) || 1;
    }

    const path = courseSlug
      ? `/topic-categories/public/${encodeURIComponent(courseSlug)}/${encodeURIComponent(categorySlug)}?page=${encodeURIComponent(page)}&limit=15`
      : `/topic-categories/public/${encodeURIComponent(categorySlug)}?page=${encodeURIComponent(page)}&limit=15`;

    return fetchPublicData(path, "interview category");
  },
);

export const getCheatsheets = cache(() =>
  fetchPublicData("/cheatsheets?status=published", "cheatsheets"),
);

export const getCheatsheet = cache((slug) =>
  fetchPublicData(`/cheatsheets/${encodeURIComponent(slug)}`, "cheatsheet"),
);

export const getCourses = cache(() =>
  fetchPublicData("/courses?status=published", "courses"),
);

export const getSeoSetting = cache((path) =>
  fetchPublicData(`/seo-settings/public?path=${encodeURIComponent(path)}`, "SEO setting"),
);

export const getRelatedContent = cache(
  ({ type, slug, courseSlug, techId, categorySlug } = {}) => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (slug) params.set("slug", slug);
    if (courseSlug) params.set("courseSlug", courseSlug);
    if (techId) params.set("techId", techId);
    if (categorySlug) params.set("categorySlug", categorySlug);

    return fetchPublicData(
      `/related-content/public?${params.toString()}`,
      "related recommendations",
    );
  },
);

export const getPublicUserProfile = cache((username) =>
  fetchPublicData(
    `/users/public/${encodeURIComponent(username)}`,
    "public user profile",
  ),
);
