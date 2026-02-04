import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageWithSideBar>
      <div>You're in admin settings!</div>
    </PageWithSideBar>
  );
}
