import { createFileRoute } from '@tanstack/react-router';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import TeamsList from '@/features/contributor/TeamsList';

export const Route = createFileRoute('/_authenticated/contributor/teams')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithSideBar>
      <TeamsList />
    </PageWithSideBar>
  );
}
