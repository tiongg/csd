import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import { EnrolledCourseProvider } from '@/context/EnrolledCourseContext';
import MyCoursesPage from '@/features/learner/MyCoursesPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/learner/my-courses')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithNavBar>
      <EnrolledCourseProvider>
        <MyCoursesPage />
      </EnrolledCourseProvider>
    </PageWithNavBar>
  );
}
