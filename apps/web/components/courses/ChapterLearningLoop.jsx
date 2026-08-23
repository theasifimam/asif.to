"use client";
// ASIF_COURSE_LEARNING_FLOW_V1
import Link from "next/link";
import { BookOpen, Brain, CheckCircle2, Code2, Hammer, Layers } from "lucide-react";
const STAGES = [{ key: "learn", label: "Learn", icon: BookOpen }, { key: "revise", label: "Revise", icon: Layers }, { key: "practice", label: "Practice", icon: Brain }, { key: "build", label: "Build", icon: Hammer }];

export default function ChapterLearningLoop({ courseSlug, chapter, progress, onStageChange }) {
  if (!chapter) return null;
  const learning = chapter.learningActivities || {};
  const build = learning.build || {};
  const revisionIds = learning.revisionQuestions?.length ? learning.revisionQuestions : chapter.relatedQuestions || [];
  const practiceIds = learning.practiceQuestions?.length ? learning.practiceQuestions : chapter.relatedQuestions || [];
  const availability = progress?.availability || { learn: true, revise: revisionIds.length > 0, practice: practiceIds.length > 0 || Boolean(String(chapter.tryItChallenge || "").trim()), build: Boolean(build.enabled && (build.title || build.description)) };
  const chapterId = chapter._id;
  const reviseHref = `/revision?course=${encodeURIComponent(courseSlug)}&chapter=${encodeURIComponent(chapterId)}`;
  const quizHref = `/quiz?course=${encodeURIComponent(courseSlug)}&chapter=${encodeURIComponent(chapterId)}`;
  // ASIF_QUESTION_LEARNING_MAPPING_V1:mapped-practice
          const practiceUsesQuiz = Number(chapter.learningAvailability?.practiceCount || 0) > 0;

  return (
    <section id="chapter-learning-loop" className="scroll-mt-28 rounded-[2rem] border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">Complete this chapter</p><h2 className="mt-1 text-xl font-black">Learn → Revise → Practice → Build</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">Reading starts the concept. Recall and practice make it usable. Build appears only when this chapter has a meaningful build task.</p></div><span className="text-xs font-black text-zinc-400">{progress?.masteryScore || 0}% chapter mastery</span></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">{STAGES.map((stage) => {
        const Icon = stage.icon;
        const available = availability[stage.key];
        const value = progress?.stages?.[stage.key] || {};
        const complete = value.completed || (["revise", "practice"].includes(stage.key) && Number(value.score) >= 70);
        if (!available && stage.key !== "learn") return <div key={stage.key} className="rounded-3xl bg-zinc-50 p-4 opacity-55 dark:bg-zinc-950"><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-zinc-400" /><span className="text-xs font-black">{stage.label}</span></div><p className="mt-2 text-[11px] text-zinc-400">No {stage.label.toLowerCase()} activity is attached to this chapter yet.</p></div>;
        return <div key={stage.key} className={`rounded-3xl border p-4 ${complete ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-500/5" : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"}`}>
          <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className={`grid h-8 w-8 place-items-center rounded-xl ${complete ? "bg-emerald-500 text-white" : "bg-blue-500/10 text-blue-600"}`}>{complete ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}</span><div><div className="text-xs font-black">{stage.label}</div>{Number(value.score) > 0 && <div className="text-[10px] font-bold text-zinc-400">Best score {value.score}%</div>}</div></div><span className={`text-[9px] font-black uppercase tracking-wider ${complete ? "text-emerald-600" : "text-zinc-400"}`}>{complete ? "Done" : "Next"}</span></div>
          {stage.key === "learn" && <p className="mt-3 text-[11px] leading-5 text-zinc-500">Use the existing “Mark Done” button at the top when you have understood the lesson.</p>}
          {stage.key === "revise" && <><p className="mt-3 text-[11px] leading-5 text-zinc-500">Recall this chapter using only its attached flashcards.</p><Link href={reviseHref} className="mt-3 inline-flex rounded-full bg-blue-600 px-4 py-2 text-[11px] font-black text-white">{complete ? "Revise again" : "Start revision"} →</Link></>}
          {stage.key === "practice" && <><p className="mt-3 text-[11px] leading-5 text-zinc-500">{practiceUsesQuiz ? "Test the chapter using only its attached practice questions." : "Apply the concept with the chapter's existing Try It challenge."}</p>{practiceUsesQuiz ? <Link href={quizHref} className="mt-3 inline-flex rounded-full bg-blue-600 px-4 py-2 text-[11px] font-black text-white">{complete ? "Practice again" : "Start practice"} →</Link> : <div className="mt-3 flex flex-wrap gap-2"><a href="#chapter-practice" className="inline-flex items-center gap-1 rounded-full border border-blue-200 px-4 py-2 text-[11px] font-black text-blue-600"><Code2 className="h-3.5 w-3.5" />Open Try It</a><button type="button" onClick={() => onStageChange?.("practice", { completed: !complete })} className="rounded-full bg-blue-600 px-4 py-2 text-[11px] font-black text-white">{complete ? "Mark incomplete" : "I completed it"}</button></div>}</>}
          {stage.key === "build" && <><h3 className="mt-3 text-sm font-black">{build.title || "Build challenge"}</h3>{build.description && <p className="mt-1 text-[11px] leading-5 text-zinc-500">{build.description}</p>}{Array.isArray(build.requirements) && build.requirements.length > 0 && <ul className="mt-3 space-y-1 text-[11px] text-zinc-500">{build.requirements.map((item, index) => <li key={index}>• {item}</li>)}</ul>}<div className="mt-3 flex items-center justify-between gap-3">{build.estimatedMinutes > 0 && <span className="text-[10px] font-bold text-zinc-400">~{build.estimatedMinutes} min</span>}<button type="button" onClick={() => onStageChange?.("build", { completed: !complete })} className="ml-auto rounded-full bg-blue-600 px-4 py-2 text-[11px] font-black text-white">{complete ? "Mark incomplete" : "Mark build complete"}</button></div></>}
        </div>;
      })}</div>
    </section>
  );
}
