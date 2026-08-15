"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Award, BadgeCheck, Loader2, XCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useGetCertificateQuery } from "@/lib/api/authApi";

export default function CertificateVerificationPage() {
  const { verificationId } = useParams();
  const { data, isLoading, isError } = useGetCertificateQuery(verificationId);
  const certificate = data?.data?.certificate;
  const student = data?.data?.student;

  return <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white"><Header /><main className="mx-auto flex min-h-[80vh] max-w-3xl items-center px-4 py-28">{isLoading ? <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" /> : isError || !certificate ? <div className="w-full rounded-4xl bg-white p-10 text-center shadow-sm dark:bg-zinc-900"><XCircle className="mx-auto h-14 w-14 text-red-500" /><h1 className="mt-4 text-2xl font-black">Certificate not found</h1><p className="mt-2 text-sm text-zinc-500">This verification ID is invalid or no longer available.</p></div> : <article className="w-full rounded-4xl border border-emerald-200 bg-white p-7 text-center shadow-xl dark:border-emerald-900 dark:bg-zinc-900 sm:p-12"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10"><Award className="h-10 w-10 text-emerald-600" /></div><p className="mt-6 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-600"><BadgeCheck className="h-4 w-4" />Verified by asif.to</p><h1 className="mt-5 text-3xl font-black">Certificate of Achievement</h1><p className="mt-5 text-zinc-500">This certifies that</p><h2 className="mt-2 text-2xl font-black">{student.fullName || `@${student.username}`}</h2><p className="mt-5 text-zinc-500">passed the final examination for</p><h3 className="mt-2 text-xl font-black text-blue-600">{certificate.courseId?.title}</h3><p className="mt-5 font-bold">Score: {certificate.score}/{certificate.total} ({Math.round((certificate.score / certificate.total) * 100)}%)</p><p className="mt-2 text-sm text-zinc-500">Issued {new Date(certificate.issueDate).toLocaleDateString()}</p><p className="mt-8 break-all text-xs text-zinc-400">Verification ID: {certificate.verificationId}</p><Link href="/" className="mt-8 inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white">Explore asif.to</Link></article>}</main><Footer /></div>;
}
