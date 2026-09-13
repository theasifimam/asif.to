"use client";

import { useState } from "react";
import { getImageUrl } from "@/lib/config";

export default function CompanyLogo({ company, job, className = "h-12 w-12", priority = false }) {
  const [failed, setFailed] = useState("");
  const name = company?.name || job?.companyName || "Company";
  const logo = company?.logo || job?.companyLogo || "";
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join("").toUpperCase();

  const hasSize = /\b(h-|w-)/.test(className);
  const sizeClass = hasSize ? "" : "h-12 w-12";

  return (
    <div className={`flex flex-none aspect-square items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 ${sizeClass} ${className}`} style={{maxWidth: undefined}}>
      {logo && failed !== logo ? (
        <img
          src={getImageUrl(logo)}
          alt={`${name} logo`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(logo)}
          className="block h-full w-full object-contain p-1.5 max-h-full max-w-full"
        />
      ) : (
        <span aria-label={name} className="text-sm font-black tracking-tight text-blue-700">
          {initials}
        </span>
      )}
    </div>
  );
}
