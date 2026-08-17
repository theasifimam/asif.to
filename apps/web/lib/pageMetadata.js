import { absoluteUrl } from "./seo";

export function mergePageMetadata(fallback, setting, path) {
  const title = setting?.title || fallback.title;
  const description = setting?.description || fallback.description;
  const canonical = absoluteUrl(setting?.canonicalUrl, path);
  const image = setting?.ogImage
    ? absoluteUrl(setting.ogImage)
    : fallback.image;
  return {
    title,
    description,
    keywords: setting?.keywords || fallback.keywords || [],
    alternates: { canonical },
    robots: {
      index: !setting?.noIndex,
      follow: !setting?.noIndex,
      googleBot: {
        index: !setting?.noIndex,
        follow: !setting?.noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "asif.to",
      type: fallback.type || "website",
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
