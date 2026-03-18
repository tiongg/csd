import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import ContributorDashboardPage from '@/features/contributor/ContributorDashboardPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/contributor/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithNavBar>
      <ContributorDashboardPage />
    </PageWithNavBar>
  );
}
