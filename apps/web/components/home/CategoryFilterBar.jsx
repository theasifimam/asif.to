"use client";

import { motion } from "framer-motion";

const CATEGORY_ICONS = {
  ALL: "🌟",
  INVESTIGATION: "🛡️",
  TECHNOLOGY: "⚡",
  PHILOSOPHY: "💡",
  ARCHITECTURE: "🏛️",
  SYSTEMS: "⚙️",
};

export default function CategoryFilterBar({
  categories,
  activeCategory,
  onSelectCategory,
}) {
  return (
    <div className="w-full pb-3 mb-4">
      {/* Scrollable Container with Glass Effect */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-3 px-4 rounded-[2rem] bg-white/40 dark:bg-[#191f13]/40 border border-[#e1e7d4]/80 dark:border-[#2d3624]/60 backdrop-blur-md shadow-xs">
        {categories.map((cat) => {
          const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
          const icon = CATEGORY_ICONS[cat.toUpperCase()] || "📌";

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`relative px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 android-haptic shrink-0 flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "text-[#1b2111] dark:text-[#1b2111]"
                  : "text-[#4a5426] dark:text-[#c4cb9a] hover:bg-[#edf1e4]/50 dark:hover:bg-[#21281a]/50"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategoryPill"
                  className="absolute inset-0 bg-[#b6c173] dark:bg-[#c2d08a] rounded-full -z-10 shadow-lg shadow-[#b6c173]/35 dark:shadow-[#c2d08a]/35 border border-[#9fa963] dark:border-[#a3b363]"
                  transition={{ type: "spring", stiffness: 350, damping: 26 }}
                />
              )}
              <span className="text-sm select-none">{icon}</span>
              <span className="relative z-10 font-outfit uppercase tracking-widest text-[10px] font-extrabold">
                {cat}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}