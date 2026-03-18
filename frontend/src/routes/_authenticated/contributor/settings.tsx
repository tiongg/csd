import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import UpdateProfileForm from '@/features/profile/edit/UpdateProfileForm';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/contributor/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageWithNavBar>
      <div className="flex min-h-[calc(100dvh-4rem)] w-full items-start justify-center px-4 pt-10 pb-8 md:pt-14">
        <UpdateProfileForm />
      </div>
    </PageWithNavBar>
  );
}
