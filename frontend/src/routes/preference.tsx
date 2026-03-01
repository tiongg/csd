import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/preference')({
  component: RouteComponent,
});

function RouteComponent() {
  <>
    <div>Test</div>
    <PageWithSideBar>
      <div className="flex h-full w-full items-center justify-center">
        Preferences page!
      </div>
    </PageWithSideBar>
  </>;
}
