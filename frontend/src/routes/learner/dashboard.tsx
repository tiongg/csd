import { createFileRoute } from '@tanstack/react-router';
import UserDashboard from '@/components/UserDashboard';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';

export const Route = createFileRoute('/learner/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithSideBar>
      <UserDashboard />
    </PageWithSideBar>
  );
}
