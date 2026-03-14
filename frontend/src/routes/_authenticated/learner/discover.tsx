import { createFileRoute } from '@tanstack/react-router';
import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import DiscoverPage from '@/features/learner/DiscoverPage';

export const Route = createFileRoute('/_authenticated/learner/discover')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithNavBar>
      <DiscoverPage />
    </PageWithNavBar>
  );
}

