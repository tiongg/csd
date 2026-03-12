import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import { ContentEditorProvider } from '@/context/ContentEditorContext';
import CourseEditor from '@/features/editor/CourseEditor';
import EditorHeader from '@/features/editor/EditorHeader';
import { EditorSchemaProvider } from '@/features/editor/EditorSchemaContext';
import { useApiQuery } from '@/lib/fetch-client';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/contributor/editor/$courseId')({
  component: RouteComponent,
  validateSearch: (search) => ({
    section:
      search?.section !== undefined ? Number(search?.section) : undefined,
  }),
});

function RouteComponent() {
  const { courseId } = Route.useParams();
  const { data: course, isLoading } = useApiQuery('get', '/api/courses/{id}', {
    params: {
      path: {
        id: courseId,
      },
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

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
