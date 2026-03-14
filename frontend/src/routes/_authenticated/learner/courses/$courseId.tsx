import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import { CourseViewerProvider } from '@/context/CourseViewingContext';
import useEnrolledCourse, {
  EnrolledCourseProvider,
} from '@/context/EnrolledCourseContext';
import CourseOverview from '@/features/learner/course/CourseOverview';
import CourseView from '@/features/learner/course/CourseView';
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

function IsEnrolledRoute() {
  const { course, content } = Route.useLoaderData();
  const { enrolledCourses } = useEnrolledCourse();

  const enrollment = enrolledCourses.find(
    (enrolled) => enrolled.course.id === course.id,
  );

  if (enrollment) {
    return (
      <CourseViewerProvider
        sections={content}
        course={course}
        enrollment={enrollment}
      >
        <CourseView />
      </CourseViewerProvider>
    );
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
      <div className="flex-1">
        <div className="mx-auto max-w-4xl p-8">
          <div className="min-h-[400px]">
            <CourseOverview course={course} sections={content} />
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteComponent() {
  return (
    <PageWithNavBar>
      <EnrolledCourseProvider>
        <IsEnrolledRoute />
      </EnrolledCourseProvider>
    </PageWithNavBar>
  );
}
