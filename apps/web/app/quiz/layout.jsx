import { absoluteUrl } from "@/lib/seo";

export const metadata = {
  title: "Course Practice Quizzes & Self-Assessment",
  description:
    "Test your JavaScript, React, Next.js, and backend knowledge with interactive self-paced coding quizzes.",
  alternates: { canonical: absoluteUrl("", "/quiz") },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function QuizLayout({ children }) {
  return children;
}
