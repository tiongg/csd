import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithSideBar>
      <div>Hello "/admin/dashboard"!</div>
    </PageWithSideBar>
  );
}
