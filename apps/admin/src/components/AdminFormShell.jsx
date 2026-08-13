import { Loader2 } from "lucide-react";
import { AdminPage, AdminPageHeader } from "@/components/admin";

export const formSectionClass =
  "min-w-0 space-y-5  bg-white px-4 py-5 dark:bg-zinc-950 rounded-4xl border border-zinc-200/60 dark:border-zinc-800/60 sm:p-5";
export const formAsideClass = formSectionClass;

export function AdminFormLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
    </div>
  );
}

export default function AdminFormShell({
  children,
  title,
  description,
  eyebrow = "Content manager",
  back,
  actions,
}) {
  return (
    <AdminPage size="lg">
      <AdminPageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        back={back}
        actions={actions}
      />
      {children}
    </AdminPage>
  );
}
