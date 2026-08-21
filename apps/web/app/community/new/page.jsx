"use client";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CommunityComposer from "@/components/community/CommunityComposer";
export default function NewCommunityPostPage() { const query = useSearchParams(); const kind=query.get("kind"), targetId=query.get("targetId"), title=query.get("title"); const relatedResource=kind&&targetId&&title?{kind,targetId,title}:null; return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950"><Header/><main className="mx-auto max-w-3xl px-4 pb-24 pt-24"><h1 className="mb-6 text-3xl font-black dark:text-white">Start a useful discussion</h1><CommunityComposer relatedResource={relatedResource}/></main><Footer/></div>; }
