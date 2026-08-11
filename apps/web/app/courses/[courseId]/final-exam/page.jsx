import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FinalExamClient from "@/components/exam/FinalExamClient";
import { Clock3, GraduationCap } from "lucide-react";

async function getCourse(courseId) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;
    return (await response.json()).data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { courseId } = await params;
  const course = await getCourse(courseId);
  const name = course?.title || courseId;
  return {
    title: `${name} Final Exam | asif.to`,
    description: `Take the proctored ${name} final exam and earn your certificate of completion on asif.to.`,
    robots: { index: false, follow: false },
  };
}

export default async function FinalExamPage({ params }) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-24 sm:pb-12">
      <Header />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-6">
        {course?.examEnabled ? (
          <>
            <div className="flex flex-col gap-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-black w-fit shadow-md shadow-blue-500/20">
                <GraduationCap className="w-3.5 h-3.5" />
                Final Exam
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Course Certification Test
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                Complete this proctored exam to earn your {course.title}{" "}
                certificate from asif.to.
              </p>
            </div>
            <FinalExamClient courseId={courseId} course={course} />
          </>
        ) : (
          <section className="min-h-[55vh] flex flex-col items-center justify-center gap-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock3 className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-md">
              <p className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Coming Soon
              </p>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {course?.title || courseId} Final Exam
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                The certification exam for this course is being prepared and is
                not available yet.
              </p>
            </div>
            <Link
              href={`/courses/${courseId}`}
              className="px-6 py-3 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-bold transition-opacity hover:opacity-80"
            >
              Back to Course
            </Link>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
