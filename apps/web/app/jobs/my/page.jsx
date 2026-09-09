import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MyJobsClient from "@/components/jobs/MyJobsClient";

export const metadata = { title: "My Jobs | asif.to", robots: { index: false, follow: false } };

export default function MyJobsPage() {
  return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950"><Header /><main className="mx-auto max-w-5xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32"><MyJobsClient /></main><Footer /></div>;
}
