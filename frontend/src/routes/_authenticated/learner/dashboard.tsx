import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import { EnrolledCourseProvider } from '@/context/EnrolledCourseContext';
import LearnerDashboardPage from '@/features/learner/LearnerDashboardPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/learner/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithNavBar>
      <EnrolledCourseProvider>
        <LearnerDashboardPage />
      </EnrolledCourseProvider>
    </PageWithNavBar>
  );
}
