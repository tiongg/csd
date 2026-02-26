import { createFileRoute } from '@tanstack/react-router';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import DiscoverPage from '@/features/learner/DiscoverPage';

export const Route = createFileRoute('/_authenticated/learner/discover')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithSideBar>
      <DiscoverPage />
    </PageWithSideBar>
  );
}
