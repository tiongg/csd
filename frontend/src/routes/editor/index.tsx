// Test page for now
// TODO: Remove this page
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import { ContentEditorProvider } from '@/context/ContentEditorContext';
import CrepeEditor from '@/features/editor/CrepeEditor';
import EditorHeader from '@/features/editor/EditorHeader';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/editor/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithSideBar>
      <div className="relative flex h-full w-full flex-col">
        <ContentEditorProvider roomName="1234">
          <EditorHeader />
          <CrepeEditor />
        </ContentEditorProvider>
      </div>
    </PageWithSideBar>
  );
}
