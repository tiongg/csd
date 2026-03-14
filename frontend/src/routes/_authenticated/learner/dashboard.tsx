import { createFileRoute } from '@tanstack/react-router';
import LearnerDashboardPage from '@/features/learner/LearnerDashboardPage';
import PageWithNavBar from '@/components/wrappers/PageWithNavBar';

export const Route = createFileRoute('/_authenticated/learner/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithNavBar>
      <LearnerDashboardPage />
    </PageWithNavBar>
  );
}

