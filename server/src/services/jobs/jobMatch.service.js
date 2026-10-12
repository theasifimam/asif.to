/**
 * "How well do I fit this job?" for the skills asif.to can teach.
 *
 * A skill counts as HAVE when the person marked it as theirs or finished most of the
 * course that teaches it, LEARNING when they have started that course, and GAP
 * otherwise. Only skills in the catalog take part, so a non-technical job has no match.
 * The score is guidance, not a hiring prediction, and the UI says so.
 */
import { SKILL_CATALOG, SKILL_BY_ID } from "./skillCatalog.js";
import { skillsForJob } from "./jobLearning.service.js";

export const HAVE_PROGRESS = 60; // % of a course completed that counts as knowing its skill

/** Catalog skill ids the person declared, from stored labels (matching is case-insensitive). */
export function declaredSkillIds(labels = []) {
  const wanted = new Set(labels.map((label) => String(label).trim().toLowerCase()));
  return SKILL_CATALOG.filter((skill) => wanted.has(skill.label.toLowerCase())).map((skill) => skill.id);
}

const bandFor = (percent) => (percent >= 75 ? "strong" : percent >= 50 ? "good" : percent >= 25 ? "partial" : "low");

/**
 * @param {object} job             a public job (title, description, skills)
 * @param {object} person
 * @param {string[]} person.declared      catalog skill ids the person marked as theirs
 * @param {Object<string, number>} person.courseProgress  course slug -> overall progress 0-100
 * @returns {{applicable: boolean, percent?: number, band?: string, skills?: Array, haveCount?: number, total?: number}}
 */
export function computeJobMatch(job, { declared = [], courseProgress = {} } = {}) {
  const required = skillsForJob(job);
  if (!required.length) return { applicable: false };
  const declaredSet = new Set(declared);
  const skills = required.map((skill) => {
    const progress = skill.course ? Number(courseProgress[skill.course] || 0) : 0;
    let status = "gap"; let source = "";
    if (declaredSet.has(skill.id)) { status = "have"; source = "You marked this as a skill"; }
    else if (progress >= HAVE_PROGRESS) { status = "have"; source = `${Math.round(progress)}% through the asif.to course`; }
    else if (progress > 0) { status = "learning"; source = `${Math.round(progress)}% through the asif.to course`; }
    return { id: skill.id, label: skill.label, status, source, course: skill.course || null };
  });
  const credit = skills.reduce((sum, skill) => sum + (skill.status === "have" ? 1 : skill.status === "learning" ? 0.5 : 0), 0);
  const percent = Math.round((credit / skills.length) * 100);
  return {
    applicable: true, percent, band: bandFor(percent), skills,
    haveCount: skills.filter((skill) => skill.status === "have").length, total: skills.length,
  };
}

/** The catalog skills a person can pick from, with their current selection. */
export function skillPickerOptions(declared = []) {
  const picked = new Set(declared);
  return SKILL_CATALOG.map((skill) => ({ id: skill.id, label: skill.label, selected: picked.has(skill.id), hasCourse: Boolean(skill.course) }));
}

/** Replaces only catalog-labelled entries of `expertise`, leaving anything else the person wrote. */
export function mergeDeclaredSkills(existing = [], selectedIds = []) {
  const catalogLabels = new Set(SKILL_CATALOG.map((skill) => skill.label.toLowerCase()));
  const kept = existing.filter((entry) => !catalogLabels.has(String(entry).trim().toLowerCase()));
  const chosen = [...new Set(selectedIds)].filter((id) => SKILL_BY_ID.has(id)).map((id) => SKILL_BY_ID.get(id).label);
  return [...kept, ...chosen];
}
