import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import CourseModerationForm from '@/features/admin/CourseModerationForm';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/course-moderation')(
  {
    component: RouteComponent,
  },
);

function RouteComponent() {
  return (
    <PageWithNavBar>
      <CourseModerationForm />
    </PageWithNavBar>
  );
}
