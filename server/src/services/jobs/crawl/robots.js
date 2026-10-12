// Minimal robots.txt support (RFC 9309): user-agent groups, Allow/Disallow with * and $ wildcards, the longest
// matching rule wins (Allow wins a tie), Crawl-delay and Sitemap lines. Anything the file disallows for us is
// never fetched; a missing file (404/410) allows everything, while an unreadable or forbidden one allows nothing.

export const CRAWLER_TOKEN = "asif.to-jobs-importer";

const ruleToRegex = (rule) => {
  const anchored = rule.endsWith("$");
  const body = (anchored ? rule.slice(0, -1) : rule).replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`);
};

export function parseRobots(text = "", token = CRAWLER_TOKEN) {
  const groups = []; let current = null; let lastWasAgent = false; const sitemaps = [];
  for (const rawLine of String(text).split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    const match = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!match) continue;
    const field = match[1].toLowerCase(); const value = match[2].trim();
    if (field === "sitemap") { if (/^https?:\/\//i.test(value)) sitemaps.push(value); continue; }
    if (field === "user-agent") {
      if (!lastWasAgent) { current = { agents: [], rules: [], delay: null }; groups.push(current); }
      current.agents.push(value.toLowerCase()); lastWasAgent = true; continue;
    }
    lastWasAgent = false;
    if (!current) continue;
    if (field === "allow" || field === "disallow") { if (value) current.rules.push({ allow: field === "allow", pattern: value, regex: ruleToRegex(value) }); }
    else if (field === "crawl-delay") { const delay = Number(value); if (Number.isFinite(delay) && delay >= 0) current.delay = delay; }
  }
  // The most specific group naming us wins; otherwise the wildcard group; otherwise no restrictions.
  const lower = token.toLowerCase();
  const named = groups.filter((group) => group.agents.some((agent) => agent !== "*" && lower.includes(agent)));
  const applicable = named.length ? named : groups.filter((group) => group.agents.includes("*"));
  const rules = applicable.flatMap((group) => group.rules);
  return {
    sitemaps, crawlDelay: applicable.find((group) => group.delay !== null)?.delay ?? null,
    isAllowed(pathAndQuery = "/") {
      let best = null;
      for (const rule of rules) {
        if (!rule.regex.test(pathAndQuery)) continue;
        if (!best || rule.pattern.length > best.pattern.length || (rule.pattern.length === best.pattern.length && rule.allow)) best = rule;
      }
      return best ? best.allow : true;
    },
  };
}

export const allowAll = () => parseRobots("");
export const disallowAll = () => parseRobots("User-agent: *\nDisallow: /");
