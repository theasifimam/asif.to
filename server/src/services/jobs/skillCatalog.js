/**
 * Skills recognised in job text. `course` is the slug of the asif.to course that
 * teaches the skill (null when we have no course yet). Patterns are deliberately
 * strict: ambiguous words such as "React" are case-sensitive so ordinary prose
 * ("react to changes") never becomes a skill.
 *
 * Order matters: it is the order skills are listed on a job.
 */
export const SKILL_CATALOG = [
  { id: "react", label: "React", pattern: /\bReact(?:\.?js)?\b(?!\s*[- ]?Native)/, course: "reactjs" },
  { id: "react-native", label: "React Native", pattern: /\bReact[ -]?Native\b/i, course: "react-native" },
  { id: "nextjs", label: "Next.js", pattern: /\bnext\.?js\b/i, course: "nextjs" },
  { id: "javascript", label: "JavaScript", pattern: /\bjava\s?script\b|\bES6\b|\bECMAScript\b/i, course: "javascript" },
  { id: "typescript", label: "TypeScript", pattern: /\btype\s?script\b/i, course: "typescript" },
  { id: "nodejs", label: "Node.js", pattern: /\bnode\.?js\b|\bexpress\.?js\b/i, course: "nodejs" },
  { id: "mongodb", label: "MongoDB", pattern: /\bmongo\s?db\b|\bmongoose\b/i, course: "mongodb" },
  { id: "html", label: "HTML", pattern: /\bhtml5?\b/i, course: "html" },
  { id: "css", label: "CSS", pattern: /\bcss3?\b|\bsass\b|\bscss\b/i, course: "css" },
  { id: "tailwind", label: "Tailwind CSS", pattern: /\btailwind(?:\s?css)?\b/i, course: "tailwind-css" },
  { id: "python", label: "Python", pattern: /\bpython\b/i, course: "python" },
  { id: "csharp-dotnet", label: "C# / .NET", pattern: /\bC#|\.NET\b|\bdotnet\b|\bASP\.NET\b/i, course: "csharp-and-dotnet" },
  { id: "dsa", label: "Data Structures & Algorithms", pattern: /\bdata structures?\b|\balgorithms?\b/i, course: "dsa-in-javascript" },
  // Tagged for search and "similar jobs", no asif.to course yet.
  { id: "java", label: "Java", pattern: /\bjava\b(?!\s?script)/i, course: null },
  { id: "sql", label: "SQL", pattern: /\b(?:sql|mysql|postgres(?:ql)?)\b/i, course: null },
  { id: "php", label: "PHP", pattern: /\bphp\b|\blaravel\b/i, course: null },
  { id: "angular", label: "Angular", pattern: /\bangular(?:js)?\b/i, course: null },
  { id: "vue", label: "Vue.js", pattern: /\bvue(?:\.?js)?\b/i, course: null },
  { id: "flutter", label: "Flutter", pattern: /\bflutter\b|\bdart\b/i, course: null },
  { id: "swift", label: "Swift", pattern: /\bSwift(?:UI)?\b/, course: null },
  { id: "kotlin", label: "Kotlin", pattern: /\bkotlin\b/i, course: null },
  { id: "graphql", label: "GraphQL", pattern: /\bgraphql\b/i, course: null },
  { id: "redis", label: "Redis", pattern: /\bredis\b/i, course: null },
  { id: "docker", label: "Docker", pattern: /\bdocker\b/i, course: null },
  { id: "kubernetes", label: "Kubernetes", pattern: /\bkubernetes\b|\bk8s\b/i, course: null },
  { id: "aws", label: "AWS", pattern: /\baws\b|\bamazon web services\b/i, course: null },
  { id: "git", label: "Git", pattern: /\bgit(?:hub|lab)?\b/i, course: null },
  { id: "rest-api", label: "REST APIs", pattern: /\brest(?:ful)?\s?apis?\b/i, course: null },
];

export const SKILL_BY_ID = new Map(SKILL_CATALOG.map((skill) => [skill.id, skill]));
const SKILL_BY_LABEL = new Map(SKILL_CATALOG.map((skill) => [skill.label.toLowerCase(), skill]));

export const findSkillByLabel = (label = "") => SKILL_BY_LABEL.get(String(label).trim().toLowerCase()) || null;
