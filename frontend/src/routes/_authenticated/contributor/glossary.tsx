import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import GlossaryPage from '@/features/glossary/GlossaryPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/contributor/glossary')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithNavBar>
      <GlossaryPage />
    </PageWithNavBar>
  );
}
