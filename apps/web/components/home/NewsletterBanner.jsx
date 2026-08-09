"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubscribed(true);
    toast.success("Subscribed to Mazlis Dispatch!");
    setEmail("");
  };

  return (
    <section className="w-full my-8">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#b6c173] via-[#c7d584] to-[#788544] dark:from-[#212a15] dark:via-[#13190d] dark:to-black text-[#1b2111] dark:text-[#dfeba8] p-8 md:p-12 border border-[#b6c173]/30 dark:border-[#2d3624] shadow-xl shadow-[#b6c173]/10 dark:shadow-black/50">
        
        {/* Floating background decorative blobs/orbs */}
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 dark:bg-[#c2d08a]/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-black/5 dark:bg-[#b6c173]/5 blur-3xl pointer-events-none" />
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-10 top-1/4 w-12 h-12 rounded-full border border-white/20 dark:border-[#c2d08a]/10 bg-white/5 backdrop-blur-xs hidden md:block pointer-events-none"
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Text Content */}
          <div className="flex flex-col gap-3.5 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/10 dark:bg-white/5 backdrop-blur-md w-fit mx-auto lg:mx-0 border border-black/5 dark:border-white/5">
              <Mail size={14} className="text-[#1b2111] dark:text-[#c2d08a]" />
              <span className="text-[10px] font-black tracking-widest uppercase text-[#1b2111] dark:text-[#c2d08a]">
                Weekly Dispatch Intelligence
              </span>
            </div>
            <h2 className="text-2xl md:text-3.5xl font-black font-outfit tracking-tight leading-tight text-[#1b2111] dark:text-white uppercase">
              Independent Intel. <br className="hidden sm:inline" /> Straight to your inbox.
            </h2>
            <p className="text-[#3b4724] dark:text-slate-400 text-xs md:text-sm font-semibold leading-relaxed max-w-lg">
              Unlock weekly security logs, architectural frameworks, and philosophical updates directly on your interface. No tracking. Pure signal.
            </p>
          </div>

          {/* Form Content */}
          <div className="w-full max-w-md">
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-4 rounded-full bg-black/10 dark:bg-[#c2d08a]/10 border border-black/15 dark:border-[#c2d08a]/20 text-[#1b2111] dark:text-[#c2d08a] backdrop-blur-md"
              >
                <CheckCircle2 size={20} className="text-[#1b2111] dark:text-[#c2d08a] shrink-0" />
                <span className="text-xs font-black tracking-wider uppercase font-outfit">
                  Verified. You are on the dispatch list.
                </span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENTER ACCESS EMAIL..."
                  className="flex-1 px-5 py-3.5 rounded-full bg-white/70 dark:bg-[#151a10]/80 backdrop-blur-md border border-[#1b2111]/20 dark:border-[#2d3624] text-[#1b2111] dark:text-white placeholder-[#5d6b33]/60 dark:placeholder-slate-500 text-xs font-bold font-mono tracking-wider focus:outline-none focus:bg-white dark:focus:bg-[#1a2114] focus:border-[#b6c173] dark:focus:border-[#c2d08a] focus:shadow-[0_0_15px_rgba(182,193,115,0.25)] transition-all duration-300"
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-6 py-3.5 rounded-full bg-[#1b2111] dark:bg-[#c2d08a] text-[#f2f5e8] dark:text-[#1b2111] font-black tracking-widest uppercase text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 group shrink-0 shadow-lg cursor-pointer"
                >
                  <span>Subscribe</span>
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </motion.button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}