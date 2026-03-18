import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import AdminDashboard from '@/features/admin/AdminDashboard';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithNavBar>
      <AdminDashboard />
    </PageWithNavBar>
  );
}
