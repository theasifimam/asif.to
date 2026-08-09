import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge for deduplication
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with compact notation (e.g., 1.2K, 3.4M)
 */
export function formatCompactNumber(num) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short"
  }).format(num);
}

/**
 * Format a date relative to now (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const target = typeof date === "string" ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  const intervals = [
  { label: "year", seconds: 31536000 },
  { label: "month", seconds: 2592000 },
  { label: "week", seconds: 604800 },
  { label: "day", seconds: 86400 },
  { label: "hour", seconds: 3600 },
  { label: "minute", seconds: 60 }];


  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str, length) {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate initials from a name
 */
export function getInitials(name) {
  return name.
  split(" ").
  map((part) => part.charAt(0)).
  join("").
  toUpperCase().
  slice(0, 2);
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}