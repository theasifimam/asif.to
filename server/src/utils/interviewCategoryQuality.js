/**
 * Quality gate for interview categories that search engines may index.
 *
 * Career/role guides are only worth indexing once they hold enough solid
 * questions (docs/interview-guides-outline.md: "about 12"). Thinner ones stay
 * reachable for users but are noindex and left out of the sitemap/search index.
 * Empty categories of any track are never indexable.
 */
export const MIN_CAREER_CATEGORY_QUESTIONS = 12;

export function isThinInterviewCategory(category = {}, questionCount = 0) {
  const count = Number(questionCount) || 0;
  if (count <= 0) return true;
  return category.track === "career" && count < MIN_CAREER_CATEGORY_QUESTIONS;
}

/** Returns the category with `noindex` forced on when it fails the quality gate. */
export function withIndexability(category = {}, questionCount = 0) {
  if (category.noindex || !isThinInterviewCategory(category, questionCount)) return category;
  return { ...category, noindex: true };
}

/** Counts questions per category id from rows that carry a populated or raw `category`. */
export function countQuestionsByCategory(questions = []) {
  const counts = new Map();
  for (const question of questions) {
    const id = String(question?.category?._id || question?.category || "");
    if (id) counts.set(id, (counts.get(id) || 0) + 1);
  }
  return counts;
}

/**
 * Sibling career guides for a career category page: other career categories that
 * pass the quality gate, in their given order, annotated with their question count.
 */
export function pickSiblingCareerCategories(categories = [], countById = new Map(), currentId = "", limit = 6) {
  return categories
    .filter((category) => String(category._id) !== String(currentId) && category.track === "career")
    .map((category) => ({ ...category, questionCount: countById.get(String(category._id)) || 0 }))
    .filter((category) => !isThinInterviewCategory(category, category.questionCount))
    .slice(0, limit);
}
