
import LogoLoader from "@/components/ui/LogoLoader";
import { AdminPage, AdminPageHeader } from "@/components/admin";

export const formSectionClass =
  "admin-surface min-w-0 space-y-4 px-4 py-5 sm:space-y-5 sm:p-7";
export const formAsideClass = formSectionClass;

export function AdminFormLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LogoLoader className="h-7 w-7  text-blue-600"  />
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
