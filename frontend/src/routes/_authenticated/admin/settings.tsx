import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import UpdateProfileForm from '@/features/profile/edit/UpdateProfileForm';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithNavBar>
      <div className="flex h-full w-full items-center justify-center">
        <UpdateProfileForm />
      </div>
    </PageWithNavBar>
  );
}

