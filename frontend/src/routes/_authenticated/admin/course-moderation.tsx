import { createFileRoute } from '@tanstack/react-router';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import CourseModerationForm from '@/features/admin/CourseModerationForm';

export const Route = createFileRoute('/_authenticated/admin/course-moderation')(
  {
    component: RouteComponent,
  },
);

function RouteComponent() {
  return (
    <PageWithSideBar>
      <CourseModerationForm />
    </PageWithSideBar>
  );
}
