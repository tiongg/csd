import { createFileRoute } from '@tanstack/react-router';
import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import MyCoursesPage from '@/features/learner/MyCoursesPage';

export const Route = createFileRoute('/_authenticated/learner/my-courses')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithNavBar>
      <MyCoursesPage />
    </PageWithNavBar>
  );
}

