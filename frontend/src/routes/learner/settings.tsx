import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import UpdateProfileForm from '@/features/profile/edit/UpdateProfileForm';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/learner/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithSideBar>
      <div className="mx-auto flex w-full flex-1 items-center">
        <UpdateProfileForm />
      </div>
    </PageWithSideBar>
  );
}
