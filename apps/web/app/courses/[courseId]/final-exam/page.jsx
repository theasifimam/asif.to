import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FinalExamClient from "@/components/exam/FinalExamClient";

export async function generateMetadata({ params }) {
  const { courseId } = await params;
  const courseTitles = {
    reactjs: "React.js",
  };
  const name = courseTitles[courseId] || courseId;
  return {
    title: `${name} Final Exam | asif.to`,
    description: `Take the proctored ${name} final exam — 20 questions in 30 minutes. Earn your certificate of completion on asif.to.`,
    robots: { index: false, follow: false }, // Don't index exam pages
  };
}

export default function FinalExamPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-24 sm:pb-12">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-6">
        {/* Page title */}
        <div className="flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-black w-fit shadow-md shadow-blue-500/20">
            🎓 Final Exam
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Course Certification Test
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Complete this proctored exam to earn your React.js certificate from asif.to.
          </p>
        </div>

        {/* Exam client — all logic inside */}
        <FinalExamClient />
      </main>

      <Footer />
    </div>
  );
}
