import { createFileRoute } from '@tanstack/react-router';
import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import UserManagementForm from '@/features/admin/UserManagementForm';

export const Route = createFileRoute('/_authenticated/admin/user-management')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithNavBar>
      <UserManagementForm />
    </PageWithNavBar>
  );
}

