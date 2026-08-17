import { absoluteUrl } from "@/lib/seo";

export const metadata = {
  title: "Coding Revision & Interview Flashcards",
  description:
    "Quickly revise React, Next.js, JavaScript, and Node.js concepts with mobile-first interactive flashcards.",
  alternates: { canonical: absoluteUrl("", "/revision") },
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

export default function RevisionLayout({ children }) {
  return children;
}
