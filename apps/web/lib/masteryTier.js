/**
 * Calculate user's dynamic learning mastery tier, level, and badge title.
 * 
 * Rules:
 * - Level 1 (Explorer): Starting tier (0 - 1 cleared quizzes/courses). Title: "Learning Explorer" or "Aspiring Developer"
 * - Level 2 (Rising Builder): Cleared 2+ quizzes, or 3+ streak days. Title: "Rising Builder"
 * - Level 3 (Skilled Developer): Completed 1 course, or 5+ passed quizzes, or 7+ streak days. Title: "Skilled Developer"
 * - Level 4 (Pro Developer): Earned certificates/cleared final exams, completed 2+ courses, or 15+ streak days with high quiz pass rate. Title: "Pro Developer"
 * - Level 5+ (Master Architect): 3+ certificates/final exams, 25+ streak days, or extensive contributions. Title: "Master Architect"
 */

export function getUserMasteryTier(user = {}, extraStats = {}) {
  // If staff/admin role
  if (user?.role === "super_admin") {
    return {
      level: user.masteryLevel || 5,
      title: "Platform Architect",
      badgeText: "Platform Architect",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
      description: "Platform Core Team",
    };
  }
  if (user?.role === "admin") {
    return {
      level: user.masteryLevel || 5,
      title: "Admin Lead",
      badgeText: "Admin Lead",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      description: "Community & Content Lead",
    };
  }
  if (user?.role === "author") {
    return {
      level: user.masteryLevel || 4,
      title: "Technical Author",
      badgeText: "Author",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      description: "Curriculum Contributor",
    };
  }

  const quizAttempts = Array.isArray(user?.quizAttempts) ? user.quizAttempts : [];
  const passedQuizzes = quizAttempts.filter((q) => q.passed || (q.percentage && q.percentage >= 70)).length;
  const passedFinalExams = quizAttempts.filter((q) => q.kind === "final_exam" && (q.passed || q.percentage >= 75)).length;

  const completedCourses = Array.isArray(user?.completedCourses) ? user.completedCourses.length : 0;
  const certificates = Array.isArray(user?.certificates) ? user.certificates.length : 0;
  const streak = Number(user?.streak || extraStats?.streak || 0);

  // Compute Learning Points
  let points = 0;
  points += passedQuizzes * 10;
  points += passedFinalExams * 30;
  points += completedCourses * 50;
  points += certificates * 60;
  points += Math.min(streak * 3, 60);

  if (points >= 180 || certificates >= 3 || (completedCourses >= 3 && passedFinalExams >= 2)) {
    return {
      level: Math.max(user?.masteryLevel || 1, 5),
      title: "Master Architect",
      badgeText: "Master Architect",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
      description: "Master of full-stack systems",
    };
  }

  if (points >= 90 || certificates >= 1 || completedCourses >= 2 || (passedFinalExams >= 1 && passedQuizzes >= 4)) {
    return {
      level: Math.max(user?.masteryLevel || 1, 4),
      title: "Pro Developer",
      badgeText: "Pro Developer",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      description: "Advanced full-stack developer",
    };
  }

  if (points >= 40 || completedCourses >= 1 || passedQuizzes >= 3 || streak >= 7) {
    return {
      level: Math.max(user?.masteryLevel || 1, 3),
      title: "Skilled Developer",
      badgeText: "Skilled Developer",
      badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
      description: "Active code practitioner",
    };
  }

  if (points >= 15 || passedQuizzes >= 1 || streak >= 3) {
    return {
      level: Math.max(user?.masteryLevel || 1, 2),
      title: "Rising Builder",
      badgeText: "Rising Builder",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      description: "Building steady habits",
    };
  }

  // Level 1: Default for new learners / explorers
  return {
    level: 1,
    title: "Learning Explorer",
    badgeText: "Learning Explorer",
    badgeColor: "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700",
    description: "Beginning the coding journey",
  };
}
