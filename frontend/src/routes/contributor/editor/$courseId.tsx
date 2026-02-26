import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import { ContentEditorProvider } from '@/context/ContentEditorContext';
import CourseEditor from '@/features/editor/CourseEditor';
import EditorHeader from '@/features/editor/EditorHeader';
import { EditorSchemaProvider } from '@/features/editor/EditorSchemaContext';
import { fetchClient } from '@/lib/fetch-client';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/contributor/editor/$courseId')({
  component: RouteComponent,
  loader: async ({ params: { courseId } }) => {
    const { data: course } = await fetchClient.GET('/api/courses/{id}', {
      params: {
        path: {
          id: courseId,
        },
      },
    });
    if (!course) {
      throw redirect({
        to: '/contributor/dashboard',
      });
    }

    return { course };
  },
  validateSearch: (search) => ({
    section:
      search?.section !== undefined ? Number(search?.section) : undefined,
  }),
});

function RouteComponent() {
  const { courseId } = Route.useParams();
  const { course } = Route.useLoaderData();

  return (
    <PageWithSideBar>
      <EditorSchemaProvider>
        <ContentEditorProvider roomName={courseId} course={course}>
          <div className="flex h-full w-full min-w-0 flex-1 flex-col">
            <EditorHeader />
            <CourseEditor />
          </div>
        </ContentEditorProvider>
      </EditorSchemaProvider>
    </PageWithSideBar>
  );
}
