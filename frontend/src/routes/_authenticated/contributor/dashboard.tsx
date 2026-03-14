import { createFileRoute } from '@tanstack/react-router';
import { ContributorDashboard } from '@/components/dashboard/ContributorDashboard';
import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import { Heading1 } from '@/components/ui/typography';

export const Route = createFileRoute('/_authenticated/contributor/dashboard')({
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
        <ContributorDashboard />
      </div>
    </PageWithNavBar>
  );
}

