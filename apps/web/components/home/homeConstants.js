import {
  BookOpen,
  Code2,
  FileCode,
  FileText,
  HelpCircle,
  Layers,
  Layers3,
  MessageSquareText,
  Terminal,
  Trophy,
} from "lucide-react";

export const FEATURES = [
  {
    title: "Multi-language Playground",
    description:
      "Write, edit and run HTML, CSS, JavaScript, React and Next.js code instantly.",
    href: "/run",
    icon: Code2,
    accent:
      "text-blue-600 bg-blue-500/10 dark:text-blue-400 border-blue-500/20",
  },
  {
    title: "Revision Flashcards",
    description:
      "Review important concepts quickly with focused, swipeable revision cards.",
    href: "/revision",
    icon: Layers,
    accent:
      "text-indigo-600 bg-indigo-500/10 dark:text-indigo-400 border-indigo-500/20",
  },
  {
    title: "Practice Quizzes",
    description:
      "Check your understanding and find concepts that need another revision.",
    href: "/quiz",
    icon: HelpCircle,
    accent:
      "text-purple-600 bg-purple-500/10 dark:text-purple-400 border-purple-500/20",
  },
  {
    title: "Course Exams",
    description:
      "Test complete-course knowledge and use your result to showcase expertise.",
    href: "#course-exams",
    icon: Trophy,
    accent:
      "text-amber-600 bg-amber-500/10 dark:text-amber-400 border-amber-500/20",
  },
  {
    title: "Interview Preparation",
    description:
      "Practice categorized questions with detailed, interview-ready answers.",
    href: "#interview-prep",
    icon: MessageSquareText,
    accent:
      "text-orange-600 bg-orange-500/10 dark:text-orange-400 border-orange-500/20",
  },
  {
    title: "Developer Cheatsheets",
    description:
      "Keep syntax, commands and commonly used patterns within quick reach.",
    href: "/cheatsheets",
    icon: FileCode,
    accent:
      "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 border-emerald-500/20",
  },
];

export const LEARNING_STEPS = [
  [BookOpen, "Learn", "Structured lessons"],
  [Terminal, "Run", "Try code instantly"],
  [Layers, "Revise", "Use flashcards"],
  [HelpCircle, "Practice", "Take quizzes"],
  [MessageSquareText, "Prepare", "Interview Q&A"],
  [Trophy, "Prove", "Take the exam"],
];

export const QUICK_HUB_ITEMS = [
  [BookOpen, "Courses", "#courses"],
  [Layers3, "Topics", "#topics"],
  [Code2, "Playground", "/run"],
  [FileText, "Articles", "#articles"],
  [Layers, "Flashcards", "#revision"],
  [HelpCircle, "Quizzes", "/quiz"],
  [MessageSquareText, "Interviews", "#interview-prep"],
  [Trophy, "Exams", "#course-exams"],
];
