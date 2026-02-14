import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import CoursesList from '@/features/contributor/CoursesList';
import { fetchClient } from '@/lib/fetch-client';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/contributor/$teamId/courses')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { data } = await fetchClient.GET('/api/teams/{teamId}', {
      params: { path: { teamId: params.teamId } },
    });

    return { team: data };
  },
});

function RouteComponent() {
  const { team } = Route.useLoaderData();
  if (!team) {
    return <div>Team not found</div>;
  }

  return (
    <PageWithSideBar>
      <CoursesList team={team} />
    </PageWithSideBar>
  );
}
