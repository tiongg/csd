import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import { ContentEditorProvider } from '@/context/ContentEditorContext';
import CrepeEditor from '@/features/editor/CrepeEditor';
import EditorHeader from '@/features/editor/EditorHeader';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/editor/$courseId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { courseId } = Route.useParams();

  return (
    <PageWithSideBar className="h-[calc(100vh-4rem)] overflow-hidden">
      <ContentEditorProvider roomName={courseId}>
        <div className="flex h-full w-full min-w-0 flex-1 flex-col">
          <EditorHeader />
          <CrepeEditor />
        </div>
      </ContentEditorProvider>
    </PageWithSideBar>
  );
}
