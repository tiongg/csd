import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import RelationGraph from '@/features/relations/RelationGraph';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/graph')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithNavBar>
      <RelationGraph />
    </PageWithNavBar>
  );
}
