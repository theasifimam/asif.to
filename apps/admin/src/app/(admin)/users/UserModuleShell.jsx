import { AdminPage, AdminPageHeader } from "@/components/admin";
import { UserManagementNav } from "./UserManagementNav";

export function UserModuleShell({ title, description, actions, children }) {
  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="User management"
        title={title}
        description={description}
        actions={actions}
      />
      <UserManagementNav />
      {children}
    </AdminPage>
  );
}
