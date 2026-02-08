import { createFileRoute } from '@tanstack/react-router';
import DashboardByRole from '@/components/DashboardByRole';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';

export const Route = createFileRoute('/admin/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithSideBar>
      <div className='h-[calc(100vh-52px)] w-full'>
        <DashboardByRole/>
      </div>
    </PageWithSideBar>
  );
}
