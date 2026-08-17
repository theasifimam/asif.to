import { absoluteUrl } from "@/lib/seo";

export const metadata = {
  title: "Contact & Support",
  description:
    "Get in touch with the asif.to team for questions about web development tutorials, courses, and platform features.",
  alternates: { canonical: absoluteUrl("", "/contact") },
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

export default function ContactLayout({ children }) {
  return children;
}
