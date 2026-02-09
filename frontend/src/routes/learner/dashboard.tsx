import { createFileRoute } from '@tanstack/react-router';
import DashboardPage from '@/components/DashboardPage';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';

export const Route = createFileRoute('/learner/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithSideBar>
        <DashboardPage/>
    </PageWithSideBar>
  );
}
