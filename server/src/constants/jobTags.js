/**
 * Quick-filter tags read from the posting text. Patterns are conservative on purpose:
 * a missing tag is harmless, a wrong "Visa provided" badge misleads a job seeker.
 */
export const JOB_TAGS = [
  {
    id: "visa", label: "Visa provided",
    pattern: /\b(?:visa\s+(?:is\s+)?(?:provided|sponsored|sponsorship|included|will be provided|and (?:medical|insurance|flight))|(?:provide|provides|providing|offer|offers|sponsor|sponsors|sponsoring)\s+(?:an?\s+)?(?:employment\s+|work\s+|residence\s+|residency\s+|uae\s+)?visa|(?:employment|work|residence|residency|uae)\s+visa\s+(?:is\s+)?(?:provided|sponsored|included)|visa\s+sponsorship\s+(?:is\s+)?(?:available|offered|provided))\b/i,
    // "own visa", "valid visa required", "no visa sponsorship" cancel the match.
    exclude: /\b(?:no|without|not\s+(?:able\s+to\s+)?(?:provide|offer|sponsor)|cannot\s+(?:provide|offer|sponsor)|unable\s+to\s+(?:provide|offer|sponsor))\b[^.]{0,30}\bvisa\b|\b(?:own|valid|existing|transferable|current)\s+(?:uae\s+)?visa\b/i,
  },
  // Only the hiring event; "walk-in clients" or "walk-in counter" is a duty, not a walk-in interview.
  { id: "walk-in", label: "Walk-in", pattern: /\bwalk[- ]?in\s+(?:interviews?|drives?|recruitment|hiring|days?|sessions?|tests?|registration|screening)\b|\binterviews?\s+(?:is\s+)?walk[- ]?in\b/i },
  { id: "arabic-speaking", label: "Arabic speaker", pattern: /\barabic[- ]speak(?:er|ers|ing)\b|\bnative\s+arabic\b|\bfluent\s+(?:in\s+)?arabic\b|\barabic\s+(?:is\s+)?(?:a\s+)?(?:must|required|mandatory)\b/i },
  { id: "fresh-graduate", label: "Fresh graduate", pattern: /\b(?:fresh(?:er)?s?|recent)\s+graduates?\b|\bfreshers?\b|\bgraduate\s+(?:program(?:me)?|trainee|scheme)\b|\bentry[- ]level\s+graduate\b/i },
  { id: "urgent", label: "Urgent hiring", pattern: /\burgent(?:ly)?\s+(?:hiring|required|requirement|vacanc(?:y|ies)|opening|need)|\burgently\s+(?:hiring|required|needed|looking)|\b(?:immediate|immediately)\s+(?:hiring|joiner|joiners|start|requirement|vacanc(?:y|ies)|opening)|\bhiring\s+immediately\b|\bimmediate\s+joiners?\b/i },
];

export const JOB_TAG_IDS = JOB_TAGS.map((tag) => tag.id);
