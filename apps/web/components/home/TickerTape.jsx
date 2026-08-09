"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, Shield, Flame } from "lucide-react";

const TICKER_ITEMS = [
  { text: "SYSTEM OVERLOAD IN MAIN ROUTER DETECTED", icon: Zap, type: "alert" },
  { text: "INDEPENDENT JOURNALISM UNLEASHED", icon: Shield, type: "info" },
  {
    text: "AI ALGORITHMS FLUID COGNITION UPGRADE",
    icon: Sparkles,
    type: "success",
  },
  { text: "TRENDING: DIGITAL REVOLUTION PHILOSOPHY", icon: Flame, type: "hot" },
  {
    text: "ARCHITECTURE RADICAL SIMPLICITY BLUEPRINTS",
    icon: Zap,
    type: "info",
  },
  {
    text: "INTELLIGENCE UPDATE: CRYPTO NETWORKS SHIELDED",
    icon: Shield,
    type: "success",
  },
];

export default function TickerTape() {
  // Duplicate array to ensure seamless infinite looping
  const doubledItems = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="w-full bg-[#1b2111] dark:bg-black text-[#dfeba8] dark:text-[#c2d08a] py-3.5 border-y border-[#dfeba8]/10 overflow-hidden flex relative select-none">
      {/* Absolute overlay shades on left/right for smooth fade edge */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-[#1b2111] dark:from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-[#1b2111] dark:from-black to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-16 whitespace-nowrap"
        animate={{ x: [0, -1200] }}
        transition={{
          ease: "linear",
          duration: 35,
          repeat: Infinity,
        }}
        whileHover={{ animationPlayState: "paused" }}
      >
        {doubledItems.map((item, idx) => {
          const Icon = item.icon;
          let badgeColor = "bg-[#c2d08a] text-[#1b2111]";
          if (item.type === "alert")
            badgeColor = "bg-red-500 text-white animate-pulse";
          if (item.type === "hot") badgeColor = "bg-orange-500 text-white";

          return (
            <div
              key={idx}
              className="flex items-center gap-3 font-outfit text-xs font-black tracking-widest uppercase"
            >
              <span
                className={`px-2 py-0.5 rounded-sm text-[8px] font-extrabold ${badgeColor}`}
              >
                {item.type}
              </span>
              <Icon size={12} className="opacity-80" />
              <span>{item.text}</span>
              <span className="text-[#c2d08a]/30 font-light">•</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
