import { createFileRoute } from '@tanstack/react-router';
import Dashboard from '@/components/Dashboard';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';

export const Route = createFileRoute('/contributor/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithSideBar>
      <div className='h-[calc(100vh-52px)] w-full'>
        <Dashboard/>
      </div>
    </PageWithSideBar>
  );
}
