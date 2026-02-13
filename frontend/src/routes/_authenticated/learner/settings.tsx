import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import UpdateProfileForm from '@/features/profile/edit/UpdateProfileForm';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/learner/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithSideBar>
      <div className="flex h-full w-full items-center justify-center">
        <UpdateProfileForm />
      </div>
    </PageWithSideBar>
  );
}
