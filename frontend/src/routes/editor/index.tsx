// Test page for now
// TODO: Remove this page
import { ContentEditorProvider } from '@/context/ContentEditorContext';
import CrepeEditor from '@/features/editor/CrepeEditor';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/editor/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ContentEditorProvider roomName="1234">
      <CrepeEditor />
    </ContentEditorProvider>
  );
}
