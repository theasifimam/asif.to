export const MAX_LINKS_PER_PAGE = 15;

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url, "https://dummy.com");
    return u.pathname.replace(/\/$/, "") || "/";
  } catch (e) {
    return url.split("?")[0].replace(/\/$/, "") || "/";
  }
}

export async function getInternalLinkRules() {
  try {
    const apiUrl = process.env.API_URL || "http://localhost:3001/api/v1";
    const res = await fetch(`${apiUrl}/internal-links/public`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch internal link rules from API", error);
  }

  // Fallback if API fails or during initial migration
  return [
    {
      keyword: "React Hooks",
      aliases: ["React hook", "React's hooks"],
      url: "/courses/reactjs",
      priority: 10,
      maxPerPage: 1,
      enabled: true,
    },
    {
      keyword: "React.js",
      aliases: [
        "Reactjs",
        "React",
        "react",
        "reactjs",
        "react.js",
        "jsx",
        "JSX",
      ],
      url: "/courses/reactjs",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "Next.js App Router",
      aliases: ["App Router"],
      url: "/courses/nextjs",
      priority: 10,
      maxPerPage: 1,
      enabled: true,
    },
    {
      keyword: "Next.js",
      aliases: ["Nextjs"],
      url: "/courses/nextjs",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "Node.js",
      aliases: ["Nodejs", "Node"],
      url: "/courses/nodejs",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "Express.js",
      aliases: ["Express", "Expressjs", "Express.js"],
      url: "/courses/expressjs",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "MongoDB",
      aliases: ["Mongo"],
      url: "/courses/mongodb",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "Tailwind CSS",
      aliases: ["Tailwind", "TailwindCSS"],
      url: "/courses/tailwindcss",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "JavaScript",
      aliases: ["JS"],
      url: "/courses/javascript",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "HTML",
      aliases: ["html", "html5", "HTML5"],
      url: "/courses/html",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "CSS",
      aliases: ["css", "css3", "CSS3"],
      url: "/courses/css",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "Redux Toolkit",
      aliases: ["Redux", "Reduxjs", "redux", "reduxjs", "redux-toolkit"],
      url: "/reactjs/chapter-22-redux-toolkit",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "Hooks",
      aliases: ["hooks", "useMemo", "useCallback", "useRef", "useReducer"],
      url: "/courses/reactjs/chapter-11-advanced-hooks-useref-usereducer-usememo-usecallback",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "useState",
      aliases: ["usestate", "UseState"],
      url: "/reactjs/chapter-4-state-usestate-hook",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "useEffect",
      aliases: ["useeffect", "UseEffect", "side effect"],
      url: "/reactjs/chapter-7-useeffect-hook",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "React Router",
      aliases: ["React Router DOM", "react-router-dom", "react-router"],
      url: "/courses/reactjs",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "React Server Components",
      aliases: ["Server Components", "RSC"],
      url: "/courses/nextjs",
      priority: 8,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "Mongoose",
      aliases: ["mongoose"],
      url: "/courses/mongodb",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "REST API",
      aliases: ["REST APIs", "RESTful API", "REST"],
      url: "/courses/expressjs",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "Flexbox",
      aliases: ["flexbox", "CSS Flexbox"],
      url: "/courses/css",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "CSS Grid",
      aliases: ["css grid", "Grid", "CSS Grid Layout"],
      url: "/courses/css",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "TypeScript",
      aliases: ["TS", "Typescript", "typescript"],
      url: "/courses/typescript",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "function",
      aliases: ["functions"],
      url: "/javascript/functions-in-javascript",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
    {
      keyword: "asynchronous",
      aliases: ["async", "await", "asynchronous javascript"],
      url: "/javascript/promises-asynchronous-javascript",
      priority: 5,
      maxPerPage: 2,
      enabled: true,
    },
  ];
}

// Protected Markdown and HTML blocks
const IGNORE_PATTERN =
  /(```[\s\S]*?```|`[^`\n]+`|\[[^\]]+\]\([^)]+\)|<a\b[^>]*>[\s\S]*?<\/a>|<pre\b[^>]*>[\s\S]*?<\/pre>|<code\b[^>]*>[\s\S]*?<\/code>|<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<textarea\b[^>]*>[\s\S]*?<\/textarea>|^#+\s+.*$|<[^>]+>)/gim;

export function processInternalLinksSync(markdown, rules, currentPath = "") {
  if (!markdown || typeof markdown !== "string") return markdown;

  const normalizedCurrentPath = normalizeUrl(currentPath);

  // Flatten rules into terms
  const terms = [];
  for (const rule of rules) {
    if (rule.enabled === false) continue;
    const ruleUrl = normalizeUrl(rule.url);
    if (ruleUrl === normalizedCurrentPath) continue; // prevent self-linking

    if (rule.keyword) {
      terms.push({ text: rule.keyword, rule, ruleUrl });
    }

    if (rule.aliases) {
      for (const alias of rule.aliases) {
        if (alias) {
          terms.push({ text: alias, rule, ruleUrl });
        }
      }
    }
  }

  if (terms.length === 0) return markdown;

  // Sort by length descending, so longest match wins
  terms.sort((a, b) => b.text.length - a.text.length);

  const regexStr = terms.map((t) => escapeRegExp(t.text)).join("|");
  const regex = new RegExp(`\\b(${regexStr})\\b`, "gi");

  let globalLinkCount = 0;
  const linkCountsByRule = new Map();
  const placeholders = new Map();
  let placeholderId = 0;

  const parts = markdown.split(IGNORE_PATTERN);

  for (let i = 0; i < parts.length; i++) {
    // Odd indices are protected blocks, even are normal text
    if (i % 2 !== 0 || !parts[i]) continue;

    let textPart = parts[i];

    textPart = textPart.replace(regex, (match) => {
      if (globalLinkCount >= MAX_LINKS_PER_PAGE) return match;

      const lowerMatch = match.toLowerCase();
      const term = terms.find((t) => t.text.toLowerCase() === lowerMatch);
      if (!term) return match;

      const rule = term.rule;
      const maxForRule = rule.maxPerPage ?? 1;
      let currentRuleCount = linkCountsByRule.get(rule.keyword) || 0;

      if (currentRuleCount >= maxForRule) return match;

      globalLinkCount++;
      currentRuleCount++;
      linkCountsByRule.set(rule.keyword, currentRuleCount);

      const id = `__INTERNAL_LINK_${placeholderId++}__`;
      placeholders.set(id, `[${match}](${rule.url})`);
      return id;
    });

    parts[i] = textPart;
  }

  let finalMarkdown = parts.join("");

  // Restore placeholders
  for (const [id, linkContent] of placeholders.entries()) {
    finalMarkdown = finalMarkdown.replace(id, linkContent);
  }

  return finalMarkdown;
}

export async function processInternalLinks(markdown, currentPath = "") {
  if (!markdown || typeof markdown !== "string") return markdown;

  const rawRules = await getInternalLinkRules();
  const rules = rawRules.filter((r) => r.enabled !== false);
  return processInternalLinksSync(markdown, rules, currentPath);
}
