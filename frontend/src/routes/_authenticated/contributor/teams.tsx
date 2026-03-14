import { createFileRoute } from '@tanstack/react-router';
import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import TeamsList from '@/features/contributor/TeamsList';

export const Route = createFileRoute('/_authenticated/contributor/teams')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithNavBar>
      <TeamsList />
    </PageWithNavBar>
  );
}

