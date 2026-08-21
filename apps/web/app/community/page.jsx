import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CommunityFeed from "@/components/community/CommunityFeed";
import Link from "next/link";

export const metadata = { title: "Developer Community", description: "Learn, practice, discuss, and connect with developers on asif.to.", alternates: { canonical: "/community" } };
export default function CommunityPage() { return <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100"><Header/><main className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6"><header className="mb-8"><p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">Learn · Practice · Discuss · Connect</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Learn together.</h1><p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">Ask about lessons, debug code, share what you learned, and help another developer move forward.</p><Link href="/community/guidelines" className="mt-3 inline-block text-xs font-bold text-blue-600">Read the community guidelines →</Link></header><CommunityFeed/></main><Footer/></div>; }
