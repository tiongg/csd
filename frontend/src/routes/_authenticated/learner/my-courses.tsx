import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import { EnrolledCourseProvider } from '@/context/EnrolledCourseContext';
import MyCoursesPage from '@/features/learner/MyCoursesPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/learner/my-courses')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithNavBar className="min-h-[calc(100vh-52px)] px-4 py-6 md:px-8 md:py-10 bg-slate-100/70">
      <EnrolledCourseProvider>
        <MyCoursesPage />
      </EnrolledCourseProvider>
    </PageWithNavBar>
  );
}
