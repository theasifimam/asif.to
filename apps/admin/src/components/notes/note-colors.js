export const NOTE_COLORS = [
  {
    id: "neutral",
    label: "No color",
    swatch: "bg-white dark:bg-zinc-700",
    card: "border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-[#121215]",
    editor: "bg-white dark:bg-[#09090b]",
  },
  {
    id: "amber",
    label: "Soft amber",
    swatch: "bg-amber-100 dark:bg-amber-800",
    card: "border-amber-200/70 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20",
    editor: "bg-amber-50/40 dark:bg-amber-950/10",
  },
  {
    id: "blue",
    label: "Soft blue",
    swatch: "bg-blue-100 dark:bg-blue-800",
    card: "border-blue-200/70 bg-blue-50/70 dark:border-blue-900/50 dark:bg-blue-950/20",
    editor: "bg-blue-50/40 dark:bg-blue-950/10",
  },
  {
    id: "emerald",
    label: "Soft green",
    swatch: "bg-emerald-100 dark:bg-emerald-800",
    card: "border-emerald-200/70 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/20",
    editor: "bg-emerald-50/40 dark:bg-emerald-950/10",
  },
  {
    id: "rose",
    label: "Soft rose",
    swatch: "bg-rose-100 dark:bg-rose-800",
    card: "border-rose-200/70 bg-rose-50/70 dark:border-rose-900/50 dark:bg-rose-950/20",
    editor: "bg-rose-50/40 dark:bg-rose-950/10",
  },
  {
    id: "violet",
    label: "Soft violet",
    swatch: "bg-violet-100 dark:bg-violet-800",
    card: "border-violet-200/70 bg-violet-50/70 dark:border-violet-900/50 dark:bg-violet-950/20",
    editor: "bg-violet-50/40 dark:bg-violet-950/10",
  },
];

export function getNoteColor(color) {
  return NOTE_COLORS.find((option) => option.id === color) || NOTE_COLORS[0];
}
