import AnalyticsNav from "./AnalyticsNav";

export default function AnalyticsShell({
  eyebrow,
  title,
  description,
  children,
  actions,
}) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-3.5 sm:gap-8 sm:p-6 md:p-8 lg:p-10 font-sans text-zinc-800 dark:text-zinc-300">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {eyebrow && (
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-1 font-outfit text-2xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-3xl text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2.5">{actions}</div>}
      </header>
      <AnalyticsNav />
      {children}
    </div>
  );
}
