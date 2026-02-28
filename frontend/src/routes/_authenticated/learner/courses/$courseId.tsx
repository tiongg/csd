import { createFileRoute } from '@tanstack/react-router';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import CourseView from '@/features/learner/CourseView';
import { fetchClient } from '@/lib/fetch-client';
import { redirect } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/learner/courses/$courseId',
)({
  component: RouteComponent,
  loader: async ({ params: { courseId } }) => {
    const { data: course, error } = await fetchClient.GET('/api/courses/{id}', {
      params: { path: { id: courseId } },
    });

    if (!course || error) {
      throw redirect({ to: '/learner/discover' });
    }

    return { course };
  },
});

function RouteComponent() {
  const { courseId } = Route.useParams();
  const { course } = Route.useLoaderData();

  return (
    <PageWithSideBar>
      <CourseView courseId={courseId} course={course} />
    </PageWithSideBar>
  );
}
