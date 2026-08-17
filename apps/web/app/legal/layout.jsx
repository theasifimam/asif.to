import { absoluteUrl } from "@/lib/seo";

export const metadata = {
  title: "Legal, Privacy & Compliance Policies",
  description:
    "Review asif.to legal terms, privacy practices, cookie usage, and disclaimer policies.",
  alternates: { canonical: absoluteUrl("", "/terms") },
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

export default function LegalLayout({ children }) {
  return children;
}
