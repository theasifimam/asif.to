export const POST_TYPES = [
  ["question", "Question"], ["discussion", "Discussion"], ["help", "Help / Debugging"],
  ["code", "Code / Solution"], ["learning", "Learning / TIL"], ["project", "Project / Showcase"],
];
export const TYPE_LABELS = Object.fromEntries(POST_TYPES);
export const REPORT_REASONS = [
  ["spam", "Spam"], ["harassment", "Harassment / abusive"], ["hate", "Hate / disturbing content"],
  ["sexual", "Sexual / inappropriate content"], ["dangerous", "Dangerous content"], ["scam", "Scam / misleading"],
  ["off_topic", "Off-topic"], ["copyright", "Copyright issue"], ["other", "Other"],
];
