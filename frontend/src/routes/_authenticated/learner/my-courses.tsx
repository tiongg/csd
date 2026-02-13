import { createFileRoute } from '@tanstack/react-router';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import MyCoursesPage from '@/features/learner/MyCoursesPage';

export const Route = createFileRoute('/_authenticated/learner/my-courses')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithSideBar>
      <MyCoursesPage />
    </PageWithSideBar>
  );
}
