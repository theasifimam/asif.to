import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/70", className)}
      {...props} />);


}

export { Skeleton };
