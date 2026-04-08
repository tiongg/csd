import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import DesmosPage from '@/features/relations/DesmosPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/contributor/desmos')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithNavBar>
      <DesmosPage />
    </PageWithNavBar>
  );
}
