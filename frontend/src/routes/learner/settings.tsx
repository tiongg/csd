import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/learner/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithSideBar>
      <div>You're in settings!</div>
    </PageWithSideBar>
  );
}
