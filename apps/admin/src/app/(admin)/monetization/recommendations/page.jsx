"use client";

import React from "react";
import {
  useMonetization,
  Surface,
  STATUS_STYLES,
} from "../MonetizationContext";

export default function RecommendationsPage() {
  const { recommendations } = useMonetization();

  return (
    <Surface
      title="Actionable recommendations"
      description="Deterministic rules use current settings and available traffic. Suggestions never change configuration automatically."
    >
      <div className="grid gap-3 lg:grid-cols-2">
        {recommendations.map((item, index) => (
          <article
            key={`${item.title}-${index}`}
            className={`rounded-2xl border p-4 ${
              STATUS_STYLES[item.severity] || STATUS_STYLES.Experiment
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-wider">
                {item.severity}
              </span>
              <span className="text-[10px] font-bold opacity-70">
                {item.category}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-black">{item.title}</h3>
            <p className="mt-2 text-xs leading-5 opacity-90">{item.reason}</p>
            <p className="mt-3 text-xs font-bold">
              Recommendation: {item.action}
            </p>
          </article>
        ))}
      </div>
    </Surface>
  );
}
