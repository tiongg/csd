import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { Heading1 } from '@/components/ui/typography';
import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithNavBar>
      <div className="flex h-full w-full flex-col gap-4 p-16">
        <div>
          <Heading1>Dashboard Overview</Heading1>
          <p className="font-subtitle">Here's what's happening today!</p>
        </div>
        <AdminDashboard />
      </div>
    </PageWithNavBar>
  );
}
