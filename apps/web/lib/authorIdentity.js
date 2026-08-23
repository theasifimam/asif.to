import { absoluteUrl } from "@/lib/seo";

const optionalUrl = (value) => {
  const candidate = String(value || "").trim();
  return /^https?:\/\//i.test(candidate) ? candidate : "";
};

export const authorIdentity = {
  name: "Asif",
  role: "Full-Stack JavaScript Developer",
  url: absoluteUrl("", "/asif"),
  image: "https://github.com/theasifimam.png",
  shortBio:
    "Asif builds and maintains asif.to and writes practical Full-Stack JavaScript tutorials grounded in implementation, testing, and primary documentation.",
  technologies: [
    "JavaScript", "React.js", "Next.js", "Node.js", "Express.js",
    "MongoDB", "Mongoose", "Redux Toolkit", "RTK Query",
  ],
  sameAs: [
    optionalUrl(process.env.NEXT_PUBLIC_AUTHOR_GITHUB_URL),
    optionalUrl(process.env.NEXT_PUBLIC_AUTHOR_LINKEDIN_URL),
    optionalUrl(process.env.NEXT_PUBLIC_AUTHOR_PORTFOLIO_URL),
  ].filter(Boolean),
};

export function buildPersonSchema({ image } = {}) {
  return {
    "@type": "Person",
    "@id": `${authorIdentity.url}#person`,
    name: authorIdentity.name,
    url: authorIdentity.url,
    jobTitle: authorIdentity.role,
    description: authorIdentity.shortBio,
    image: image || undefined,
    knowsAbout: authorIdentity.technologies,
    sameAs: authorIdentity.sameAs.length ? authorIdentity.sameAs : undefined,
  };
}
