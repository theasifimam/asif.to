import { absoluteUrl, assetUrl, getSiteUrl } from "@/lib/seo";
import { authorIdentity, buildPersonSchema } from "@/lib/authorIdentity";

function coursePath(course, fallbackSlug = "") {
  const slug = course?.slug || fallbackSlug;
  return `/courses/${encodeURIComponent(slug)}`;
}

export function buildCourseSchema(course, fallbackSlug) {
  if (!course?.title) return null;

  const url = absoluteUrl(
    course.canonicalUrl,
    coursePath(course, fallbackSlug),
  );

  return {
    "@context": "https://schema.org",
    "@graph": [{
    ...buildPersonSchema(),
    }, {
    "@type": "Course",
    name: course.title,
    description:
      course.subtitle ||
      `Learn ${course.title} with step-by-step lessons on asif.to.`,
    url,
    ...(course.thumbnail ? { image: assetUrl(course.thumbnail) } : {}),
    ...(course.keywords?.length ? { keywords: course.keywords.join(", ") } : {}),
    ...(course.level ? { educationalLevel: course.level } : {}),
    ...(course.chapters?.length
      ? { numberOfItems: course.chapters.length }
      : {}),
    mainEntityOfPage: url,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
    },
    datePublished: course.createdAt || undefined,
    dateModified: course.updatedAt || undefined,
    author: { "@id": `${authorIdentity.url}#person` },
    provider: {
      "@type": "Organization",
      name: "asif.to",
      url: getSiteUrl(),
    },
    }],
  };
}

export function getUniqueListableCourses(courses = []) {
  const seenSlugs = new Set();

  return courses.filter((course) => {
    const slug = String(course?.slug || "").trim();
    if (!slug || !course?.title || seenSlugs.has(slug)) return false;

    seenSlugs.add(slug);
    return true;
  });
}

export function buildCourseItemListSchema(courses = []) {
  const uniqueCourses = getUniqueListableCourses(courses);
  if (uniqueCourses.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: uniqueCourses.length,
    itemListElement: uniqueCourses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: course.title,
      url: absoluteUrl("", coursePath(course)),
    })),
  };
}
