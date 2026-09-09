import { slugify } from "../../utils/slugify.js";

export const WEB_DEVELOPMENT_TITLE_PATTERN = /\b(front[\s-]?end|back[\s-]?end|full[\s-]?stack|web\s+(?:developer|engineer)|software\s+(?:developer|engineer)|application\s+developer|programmer|devops|qa\s+engineer|mobile\s+(?:app\s+)?developer|ios\s+developer|android\s+developer|react(?:\.js)?\s+developer|node(?:\.js)?\s+developer|javascript\s+developer|typescript\s+developer|php\s+developer|wordpress\s+developer)\b/i;

const WEB_DEVELOPMENT_ALIASES = new Set(["web-development", "software-development"]);

/**
 * Builds the category portion of the public jobs query. Web Development is a
 * supported public alias for the stored Software Development taxonomy, but it
 * also requires a role-title match so unrelated jobs cannot leak in because an
 * old import was classified from incidental words in its description.
 */
export function buildPublicCategoryFilter(value) {
  const categorySlug = slugify(value);
  if (!categorySlug) return null;
  if (!WEB_DEVELOPMENT_ALIASES.has(categorySlug)) return { categorySlug };

  return {
    categorySlug: { $in: ["software-development", "web-development"] },
    semanticMatch: { title: WEB_DEVELOPMENT_TITLE_PATTERN },
  };
}
