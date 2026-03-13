import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import { CourseViewerProvider } from '@/context/CourseViewingContext';
import CourseView from '@/features/learner/CourseView';
import type { SectionType } from '@/lib/content.type';
import { fetchClient } from '@/lib/fetch-client';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/learner/courses/$courseId',
)({
  component: RouteComponent,
  loader: async ({ params: { courseId } }) => {
    const { data: contentVersion, error } = await fetchClient.GET(
      '/api/content-versions/{courseId}/latest',
      {
        params: { path: { courseId } },
      },
    );

    if (!contentVersion || error) {
      throw redirect({ to: '/learner/discover' });
    }

    const courseContent = (await fetch(contentVersion.downloadUrl).then((res) =>
      res.json(),
    )) as SectionType[];

    return {
      course: contentVersion.course,
      content: courseContent,
    };
  },
});

function RouteComponent() {
  const { course, content } = Route.useLoaderData();

  return (
    <PageWithSideBar>
      <CourseViewerProvider sections={content} course={course}>
        <CourseView />
      </CourseViewerProvider>
    </PageWithSideBar>
  );
}
