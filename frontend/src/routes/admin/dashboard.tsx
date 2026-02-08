import { createFileRoute } from '@tanstack/react-router';
import DashboardPage from '@/components/DashboardPage';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';

export const Route = createFileRoute('/admin/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithSideBar>
      <div className='h-[calc(100vh-52px)] w-full'>
        <DashboardPage/>
      </div>
    </PageWithSideBar>
  );
}
