// Test page for now
// TODO: Remove this page
import CrepeEditor from '@/features/editor/CrepeEditor';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/editor/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <CrepeEditor />;
}
