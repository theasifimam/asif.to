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

// Plain-text teaser from markdown/HTML article content (no raw #, *, --- or tags).
export function getArticleExcerpt(article, max = 140) {
  const raw = article?.subtitle || article?.description || article?.content || "";
  const text = String(raw)
    .replace(/<[^>]*>/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s*(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/^\s*([-*_]\s*){3,}$/gm, " ")
    .replace(/[*_`~#>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return `Practical guide: ${article?.title || "read more"} on asif.to.`;
  return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}…` : text;
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
