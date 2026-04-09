import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
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
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!team) {
    return <div>Team not found</div>;
  }

  return (
    <PageWithNavBar className="min-h-[calc(100vh-52px)] bg-[radial-gradient(circle_at_top_left,_#ffffff,_#f8fafc_50%,_#edf4ff)] px-4 py-6 md:px-8 md:py-10">
      <CoursesList team={team} />
    </PageWithNavBar>
  );
}
