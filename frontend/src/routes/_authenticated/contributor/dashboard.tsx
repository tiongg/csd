import { createFileRoute } from '@tanstack/react-router';
import UserDashboard from '@/components/UserDashboard';
import PageWithNavBar from '@/components/wrappers/PageWithNavBar';

export const Route = createFileRoute('/_authenticated/contributor/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithNavBar>
      <UserDashboard />
    </PageWithNavBar>
  );
}

