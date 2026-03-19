import { createFileRoute, redirect } from '@tanstack/react-router';
import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import DiscoverPage from '@/features/learner/DiscoverPage';

export const Route = createFileRoute('/_authenticated/contributor/discover')({
  beforeLoad: () => {
    throw redirect({ to: '/contributor/dashboard' });
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithNavBar>
      <DiscoverPage />
    </PageWithNavBar>
  );
}
