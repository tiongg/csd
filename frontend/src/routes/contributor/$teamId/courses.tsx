import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import CoursesList from '@/features/contributor/CoursesList';
import { useApiQuery } from '@/lib/fetch-client';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/contributor/$teamId/courses')({
  component: RouteComponent,
});

function RouteComponent() {
  const { teamId } = Route.useParams();
  const { data: team, isLoading } = useApiQuery('get', '/api/teams/{teamId}', {
    params: { path: { teamId: teamId } },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!team) {
    return <div>Team not found</div>;
  }

  return (
    <PageWithSideBar>
      <CoursesList team={team} />
    </PageWithSideBar>
  );
}
