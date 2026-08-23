import { Info, TrendingDown, TrendingUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const getTooltipContent = (label) => {
  const normalized = label.toLowerCase().replace(/\s+/g, " ").trim();
  const descriptions = {
    "total clicks": "The total number of clicks from Google Search results that directed users to your site.",
    "search clicks": "The total number of clicks from Google Search results that directed users to your site.",
    "total impressions": "The number of times a URL from your site appeared in Google Search results.",
    "impressions": "The number of times a URL from your site appeared in Google Search results.",
    "average ctr": "Click-Through Rate: The percentage of search impressions that resulted in a click (Clicks / Impressions * 100).",
    "average position": "The average ranking position of your site's URLs in search results for queries.",
    "organic visitors": "The number of unique users who reached the site specifically through unpaid search engine results.",
    "page views": "The total number of pages viewed. Repeated views of a single page are counted.",
    "unique visitors": "The number of distinct visitors who initiated at least one session on your website during the period.",
    "visitors": "The number of distinct visitors who initiated at least one session on your website during the period.",
    "sessions": "The total number of sessions initiated by users. A session is a group of user interactions within a given time frame.",
    "avg engagement time": "The average duration that the site was active and in the foreground of users' screens.",
    "avg engagement": "The average duration that the site was active and in the foreground of users' screens.",
    "active users": "The number of distinct users who visited the site and had an active session during the selected range.",
    "active users now": "The number of active users currently online and interacting with the website in real-time.",
    "new users": "The number of users who interacted with your site for the first time during the period.",
    "engaged sessions": "The number of sessions that lasted longer than 10 seconds, had a conversion event, or had 2 or more page views.",
    "engagement rate": "The percentage of sessions that were engaged sessions (Engaged sessions / Sessions).",
    
    // Platform metrics
    "articles": "The total number of educational articles currently published on the platform.",
    "courses": "The total number of educational courses created and published.",
    "chapters": "The total number of chapters published across all courses.",
    "authors": "The total number of registered content creators and authors on the platform.",
    "published content": "The cumulative total of all published courses, chapters, and articles."
  };
  return descriptions[normalized] || `Information and telemetry details about ${label}.`;
};

export default function MetricCard({ label, value, source, change }) {
  return (
    <div className="admin-surface flex min-h-[115px] sm:min-h-36 flex-col justify-between p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            {label}
          </p>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors p-0.5 rounded-full outline-hidden shrink-0 cursor-pointer"
                title="View metric details"
              >
                <Info size={11} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="start"
              className="w-64 p-3.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xs shadow-lg border border-zinc-200/60 dark:border-zinc-800 rounded-2xl z-50"
            >
              <div className="space-y-1">
                <p className="font-bold text-zinc-900 dark:text-zinc-100">{label}</p>
                <p className="leading-relaxed">{getTooltipContent(label)}</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {source && (
          <span className="rounded-full border border-zinc-200/80 bg-zinc-50/80 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:text-zinc-400 shrink-0">
            {source}
          </span>
        )}
      </div>
      <p className="my-1.5 text-xl sm:text-3xl font-black font-outfit tracking-tight text-zinc-950 dark:text-white">
        {value}
      </p>
      {Number.isFinite(change) ? (
        <div className="flex items-center">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              change >= 0
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                : "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
            }`}
          >
            {change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </span>
        </div>
      ) : (
        <div className="h-4" />
      )}
    </div>
  );
}

