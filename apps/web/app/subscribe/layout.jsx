import { absoluteUrl } from "@/lib/seo";

export const metadata = {
  title: "Membership & Learning Subscriptions",
  description:
    "Support independent technical guides and coding education on asif.to.",
  alternates: { canonical: absoluteUrl("", "/subscribe") },
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

export default function SubscribeLayout({ children }) {
  return children;
}
