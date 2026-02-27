import { createFileRoute } from '@tanstack/react-router';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import { useLoaderData } from '@tanstack/react-router';
import CourseView from '@/features/learner/CourseView';

export const Route = createFileRoute('/_authenticated/learner/courses/$courseId')({
  component: RouteComponent,
  loader: async ({ params: { courseId } }) => {
    const response = await fetch(`/api/courses/${courseId}`);
    if (!response.ok) {
      throw new Error('Course not found');
    }
    const course = await response.json();
    return course;
  },
});

function RouteComponent() {
  const { courseId } = Route.useParams();
  const course = useLoaderData();

  if (!course) {
    return (
      <PageWithSideBar>
        <div className="flex h-full w-full items-center justify-center text-slate-500">
          <div className="text-center">
            <p className="text-lg font-semibold">Course not found</p>
            <p className="text-sm">The course you're looking for doesn't exist or you don't have access.</p>
          </div>
        </div>
      </PageWithSideBar>
    );
  }

  return (
    <PageWithSideBar>
      <CourseView courseId={courseId} course={course} />
    </PageWithSideBar>
  );
}
