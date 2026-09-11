export function getTopicHref(topic) {
  if (!topic) return "#";
  const courseSlug = topic.course?.slug || "courses";
  if (
    topic.type === "interview" &&
    topic.category?.slug &&
    topic.category.slug !== topic.slug
  ) {
    return `/${encodeURIComponent(courseSlug)}/${encodeURIComponent(topic.category.slug)}/${encodeURIComponent(topic.slug)}`;
  }
  return `/${encodeURIComponent(courseSlug)}/${encodeURIComponent(topic.slug)}`;
}

export function getArticleHref(article) {
  if (!article) return "/articles";
  const slug = article.slug || article._id;
  return `/articles/${encodeURIComponent(slug)}-${encodeURIComponent(article._id || article.id)}`;
}

export const getTechColorClasses = () => {
  return {
    card: "border-blue-200/80 dark:border-blue-900/60 hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-blue-500/10",
    btn: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  };
};
