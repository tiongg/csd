import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import DesmosPage from '@/features/relations/DesmosPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/desmos')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithNavBar className="min-h-[calc(100vh-52px)] px-4 py-6 md:px-8 md:py-10 bg-slate-100/70">
      <DesmosPage />
    </PageWithNavBar>
  );
}
