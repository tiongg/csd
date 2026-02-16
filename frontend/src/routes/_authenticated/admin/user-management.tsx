import { createFileRoute } from '@tanstack/react-router';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import UserManagementForm from '@/features/admin/UserManagementForm';

export const Route = createFileRoute('/_authenticated/admin/user-management')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithSideBar>
      <UserManagementForm />
    </PageWithSideBar>
  );
}
