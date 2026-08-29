"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoLoader from '@/components/ui/LogoLoader';

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    // In a real app, check auth here. For now, forward to dashboard.
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <LogoLoader className="h-16 w-16" />
        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-500 italic">Initializing Control Hub...</span>
      </div>
    </div>);

}
