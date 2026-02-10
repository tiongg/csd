import { createFileRoute } from '@tanstack/react-router';
import UserDashboard from '@/components/UserDashboard';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';

export const Route = createFileRoute('/admin/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithSideBar>
      <UserDashboard />
    </PageWithSideBar>
  );
}
