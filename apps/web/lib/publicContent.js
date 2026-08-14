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
