"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  ChevronRight,
  Command,
  Fingerprint,
  Globe,
  Loader2,
  Lock } from
'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function SigninPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success('Protocol Clearance Verified');
    } catch (error) {
      toast.error('Terminal Entry Refused: Identity Mismatch');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center md:justify-start relative overflow-hidden font-sans">
            {/* Full Page Visual Layer */}
            <div className="absolute inset-0 z-0">
                <Image
          src="/signin-visual.png"
          alt="Background"
          fill
          className="object-cover opacity-40 mix-blend-luminosity grayscale scale-110"
          priority />
        
                {/* Tactical Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-[#030303]/90 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.05)_0%,transparent_50%)]" />

                {/* Grid System */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
            </div>

            {/* Left-Side Content Portal */}
            <div className="relative z-20 w-full md:w-[600px] lg:w-[700px] min-h-screen flex flex-col p-8 md:p-16 lg:p-24 justify-center">
                <div className="max-w-[400px]">
                    {/* Integrated Header */}
                    <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12">
            
                        <div className="flex items-center gap-5 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                <Command className="text-black" size={24} />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-3xl font-black font-outfit uppercase tracking-tighter leading-none">
                                    MAZLIS<span className="text-emerald-500">.</span>
                                </h1>
                                <span className="text-[9px] font-black uppercase tracking-[0.6em] text-emerald-500/60 mt-1">Control Hub</span>
                            </div>
                        </div>
                        <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent mt-6" />
                    </motion.div>

                    {/* Secure Entry Form */}
                    <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8">
            
                        <div className="space-y-2">
                            <h2 className="text-lg font-bold font-outfit uppercase tracking-tight">Identity Verification</h2>
                            <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">End-to-end encrypted terminal session</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                {/* Email Field */}
                                <div className="space-y-1.5 group">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-emerald-500 transition-colors">Access Key (Email)</label>
                                        <div className="flex gap-1">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500/40" />
                                            <div className="w-1 h-1 rounded-full bg-emerald-500/20" />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <Input
                      type="email"
                      placeholder="operator@mazlis.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 hover:border-white/20 focus:border-emerald-500/50 h-13 rounded-3xl pl-12 text-sm font-medium transition-all outline-none placeholder:text-zinc-700" />
                    
                                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-1.5 group">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-emerald-500 transition-colors">Secure Cipher</label>
                                        <button type="button" className="text-[9px] font-bold text-zinc-600 hover:text-white transition-colors uppercase tracking-widest">Forgot?</button>
                                    </div>
                                    <div className="relative">
                                        <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 hover:border-white/20 focus:border-emerald-500/50 h-13 rounded-3xl pl-12 text-sm font-medium transition-all outline-none placeholder:text-zinc-700" />
                    
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    </div>
                                </div>
                            </div>

                            <Button
                type="submit"
                variant="tactical"
                loading={isLoading}
                className="w-full h-12 rounded-3xl">
                
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    {!isLoading && <>Initialize Session <ChevronRight size={16} /></>}
                                </span>
                            </Button>
                        </form>
                    </motion.div>

                    {/* Operational Footer */}
                    <div className="mt-20 pt-10 border-t border-white/5 flex flex-col gap-6">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Protocol Node</span>
                                <span className="text-[10px] font-bold text-zinc-400">editorial.ops.darbhanga</span>
                            </div>
                            <div className="w-px h-6 bg-white/10" />
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Environment</span>
                                <div className="flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Active_Production</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ambient Technical Details (Right Corner) */}
            <div className="absolute bottom-12 right-12 hidden lg:flex flex-col items-end gap-3 pointer-events-none opacity-40">
                <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="w-8 h-px bg-white/20" />)}
                </div>
                <span className="text-[9px] font-black tracking-[0.8em] uppercase text-zinc-500">Authorized Personnel Proxy</span>
            </div>
        </div>);

}