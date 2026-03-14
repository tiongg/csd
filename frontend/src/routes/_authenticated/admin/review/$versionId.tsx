import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import { ContentReviewProvider } from '@/context/ContentReviewContext';
import CourseReview from '@/features/admin/course-moderation/CourseReview';
import ReviewHeader from '@/features/admin/course-moderation/ReviewHeader';
import type { SectionType } from '@/lib/content.type';
import { fetchClient } from '@/lib/fetch-client';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/review/$versionId')(
  {
    component: RouteComponent,
    loader: async ({ params }) => {
      const { versionId } = params;
      const { data: reviewContent } = await fetchClient.GET(
        '/api/content-versions/review/{contentVersionId}',
        {
          params: {
            path: { contentVersionId: versionId },
          },
        },
      );

      if (!reviewContent) {
        throw redirect({
          to: '/admin/course-moderation',
        });
      }

      const { course, contentVersion, downloadUrl } = reviewContent;
      const courseContent = (await fetch(downloadUrl).then((res) =>
        res.json(),
      )) as SectionType[];

      return { course, contentVersion, courseContent, versionId };
    },
  },
);

function RouteComponent() {
  const { course, courseContent, versionId } = Route.useLoaderData();

  return (
    <PageWithNavBar>
      <ContentReviewProvider course={course} content={courseContent}>
        <div className="flex h-full w-full min-w-0 flex-1 flex-col">
          <ReviewHeader versionId={versionId} />
          <CourseReview />
        </div>
      </ContentReviewProvider>
    </PageWithNavBar>
  );
}
