// Jobs are aggregated from third-party ATS boards, so they are kept out of search
// indexes and the sitemap unless explicitly enabled (e.g. once the module carries
// substantial original content). Set NEXT_PUBLIC_JOBS_INDEXABLE=true to opt in.
export const JOBS_INDEXABLE = process.env.NEXT_PUBLIC_JOBS_INDEXABLE === "true";
