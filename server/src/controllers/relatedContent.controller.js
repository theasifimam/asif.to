import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import TopicCategory from "../models/TopicCategory.js";
import Article from "../models/Article.js";
import Question from "../models/Question.js";

export async function getUnifiedRelatedContent(req, res) {
  try {
    const { type, slug, courseSlug, techId, categorySlug } = req.query;

    let targetCourse = null;
    let targetCategory = null;
    let targetChapter = null;
    let targetArticle = null;
    let effectiveTechId = techId || "";
    let effectiveCourseId = null;

    // 1. Resolve target context based on incoming params
    if (courseSlug) {
      targetCourse = await Course.findOne({
        slug: courseSlug.toLowerCase(),
        status: "published",
      })
        .populate("relatedCourses", "title slug techId subtitle thumbnail")
        .populate("relatedArticles", "title slug techId seoDescription")
        .populate("popularChapterIds", "title slug summary order viewCount")
        .lean();
      if (targetCourse) {
        effectiveCourseId = targetCourse._id;
        effectiveTechId = targetCourse.techId || effectiveTechId;
      }
    }

    if (categorySlug) {
      targetCategory = await TopicCategory.findOne({
        slug: categorySlug.toLowerCase(),
        status: "published",
      })
        .populate("featuredChapters", "title slug summary order viewCount")
        .populate("relatedCheatsheets", "title slug techId")
        .populate("relatedCourses", "title slug techId subtitle thumbnail")
        .lean();

      if (targetCategory?.course && !targetCourse) {
        targetCourse = await Course.findById(targetCategory.course)
          .select("title slug techId subtitle thumbnail order")
          .lean();
        if (targetCourse) {
          effectiveCourseId = targetCourse._id;
          effectiveTechId = targetCourse.techId || effectiveTechId;
        }
      }
    }

    if (slug && type === "chapter") {
      targetChapter = await Chapter.findOne({ slug: slug.toLowerCase() })
        .populate("relatedQuestions", "question slug difficulty questionType")
        .populate("relatedArticles", "title slug techId seoDescription")
        .lean();
    } else if (slug && (type === "article" || type === "cheatsheet")) {
      targetArticle = await Article.findOne({
        slug: slug.toLowerCase(),
        status: "published",
      })
        .populate("relatedCourses", "title slug techId subtitle thumbnail")
        .populate("relatedChapters", "title slug summary order")
        .populate("relatedQuestions", "question slug difficulty questionType")
        .lean();
      if (targetArticle?.techId && !effectiveTechId) {
        effectiveTechId = targetArticle.techId;
      }
    }

    // If still no course but we have techId, try to find the matching course
    if (!targetCourse && effectiveTechId) {
      targetCourse = await Course.findOne({
        techId: effectiveTechId.toLowerCase(),
        status: "published",
      })
        .select("title slug techId subtitle thumbnail order")
        .lean();
      if (targetCourse) effectiveCourseId = targetCourse._id;
    }

    // 2. Fetch or assemble Related Courses
    let relatedCourses = [];
    if (targetCourse?.relatedCourses?.length) {
      relatedCourses = targetCourse.relatedCourses;
    } else if (targetCategory?.relatedCourses?.length) {
      relatedCourses = targetCategory.relatedCourses;
    } else if (targetArticle?.relatedCourses?.length) {
      relatedCourses = targetArticle.relatedCourses;
    } else {
      // Fallback: fetch other published courses
      const query = { status: "published" };
      if (targetCourse?._id) query._id = { $ne: targetCourse._id };
      relatedCourses = await Course.find(query)
        .select("title slug techId subtitle thumbnail")
        .sort({ order: 1 })
        .limit(3)
        .lean();
    }

    // 3. Fetch or assemble Popular / Key Chapters
    let popularChapters = [];
    if (targetCategory?.featuredChapters?.length) {
      popularChapters = targetCategory.featuredChapters;
    } else if (targetCourse?.popularChapterIds?.length) {
      popularChapters = targetCourse.popularChapterIds;
    } else if (targetArticle?.relatedChapters?.length) {
      popularChapters = targetArticle.relatedChapters;
    } else if (effectiveCourseId) {
      popularChapters = await Chapter.find({
        course: effectiveCourseId,
        status: "published",
      })
        .select("title slug summary order viewCount")
        .sort({ viewCount: -1, order: 1 })
        .limit(5)
        .lean();
    }

    // 4. Fetch Other Interview Categories for the same course
    let siblingCategories = [];
    if (effectiveCourseId) {
      const categoryQuery = {
        course: effectiveCourseId,
        status: "published",
      };
      if (targetCategory?._id) categoryQuery._id = { $ne: targetCategory._id };

      const categories = await TopicCategory.find(categoryQuery)
        .select("name slug description icon order")
        .sort({ order: 1 })
        .limit(6)
        .lean();

      const counts = await Question.aggregate([
        {
          $match: {
            category: { $in: categories.map((c) => c._id) },
            type: "interview",
            status: { $ne: "draft" },
          },
        },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]);

      const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

      siblingCategories = categories.map((cat) => ({
        ...cat,
        questionCount: countMap.get(String(cat._id)) || 0,
        courseSlug: targetCourse?.slug || courseSlug,
      }));
    }

    // 5. Fetch or assemble Cheatsheets
    let cheatsheets = [];
    if (targetCategory?.relatedCheatsheets?.length) {
      cheatsheets = targetCategory.relatedCheatsheets;
    } else {
      const cheatsheetQuery = {
        type: "cheatsheet",
        status: "published",
      };
      if (effectiveTechId) {
        cheatsheetQuery.$or = [
          { techId: effectiveTechId },
          { tags: effectiveTechId },
          { keywords: effectiveTechId },
        ];
      }
      cheatsheets = await Article.find(cheatsheetQuery)
        .select("title slug techId seoDescription")
        .sort({ order: 1, updatedAt: -1 })
        .limit(3)
        .lean();
    }

    // 6. Fetch or assemble Related Articles
    let articles = [];
    if (targetCourse?.relatedArticles?.length) {
      articles = targetCourse.relatedArticles;
    } else if (targetChapter?.relatedArticles?.length) {
      articles = targetChapter.relatedArticles;
    } else {
      const articleQuery = {
        type: "article",
        status: "published",
      };
      if (slug && type === "article") {
        articleQuery.slug = { $ne: slug };
      }
      if (effectiveTechId) {
        articleQuery.$or = [
          { techId: effectiveTechId },
          { tags: effectiveTechId },
          { keywords: effectiveTechId },
        ];
      }
      articles = await Article.find(articleQuery)
        .select("title slug techId seoDescription image updatedAt")
        .sort({ order: 1, updatedAt: -1 })
        .limit(3)
        .lean();
    }

    // 7. Sibling or Related Questions
    let relatedQuestions = [];
    if (targetChapter?.relatedQuestions?.length) {
      relatedQuestions = targetChapter.relatedQuestions;
    } else if (targetArticle?.relatedQuestions?.length) {
      relatedQuestions = targetArticle.relatedQuestions;
    }

    return res.json({
      success: true,
      data: {
        currentCourse: targetCourse,
        relatedCourses,
        popularChapters,
        siblingCategories,
        cheatsheets,
        articles,
        relatedQuestions,
        techId: effectiveTechId,
      },
    });
  } catch (error) {
    console.error("Error fetching related content:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch related recommendations",
      error: error.message,
    });
  }
}
